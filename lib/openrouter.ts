import 'server-only';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type { z } from 'zod';
import { env } from '@/lib/env';
import { AppError } from '@/lib/errors';
import type { JsonExtractionStrategy, ModelStageSource } from '@/lib/types';

let client: OpenAI | null = null;

function stripMarkdownFences(value: string) {
  return value
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function extractFirstJsonObject(value: string) {
  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === '\\') {
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = false;
      }

      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{') {
      if (depth === 0) {
        start = index;
      }
      depth += 1;
      continue;
    }

    if (char === '}') {
      if (depth > 0) {
        depth -= 1;
        if (depth === 0 && start >= 0) {
          return value.slice(start, index + 1);
        }
      }
    }
  }

  return null;
}

function coerceJsonText(content: string): { jsonText: string; strategy: JsonExtractionStrategy } {
  const direct = content.trim();
  try {
    JSON.parse(direct);
    return { jsonText: direct, strategy: 'direct' };
  } catch {
    // noop
  }

  const fenceStripped = stripMarkdownFences(content);
  try {
    JSON.parse(fenceStripped);
    return { jsonText: fenceStripped, strategy: 'fence-stripped' };
  } catch {
    // noop
  }

  const extracted = extractFirstJsonObject(fenceStripped);
  if (!extracted) {
    throw new Error('No JSON object could be extracted from the model output.');
  }

  JSON.parse(extracted);
  return { jsonText: extracted, strategy: 'object-extracted' };
}

async function createCompletion(messages: ChatCompletionMessageParam[], model: string) {
  return getOpenRouterClient().chat.completions.create({
    model,
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages,
  });
}

export function getOpenRouterClient() {
  if (!client) {
    client = new OpenAI({
      apiKey: env.openRouterApiKey,
      baseURL: env.openRouterBaseUrl,
      defaultHeaders: {
        'HTTP-Referer': env.openRouterSiteUrl,
        'X-Title': env.openRouterAppName,
      },
    });
  }
  return client;
}

export async function jsonChatCompletion<T>({
  model,
  system,
  user,
  schema,
  schemaHint,
  stage,
}: {
  model: string;
  system: string;
  user: string;
  schema: z.ZodType<T>;
  schemaHint: string;
  stage: 'digest' | 'reasoning';
}): Promise<{
  data: T;
  metadata: {
    source: Extract<ModelStageSource, 'model' | 'retry'>;
    attempts: number;
    jsonStrategy: JsonExtractionStrategy;
  };
}> {
  const baseMessages: ChatCompletionMessageParam[] = [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];

  let rawResponse = '';
  let firstFailure = 'Unknown parse failure.';

  for (const attempt of [1, 2] as const) {
    const messages: ChatCompletionMessageParam[] =
      attempt === 1
        ? baseMessages
        : [
            {
              role: 'system',
              content:
                'You repair malformed JSON outputs. Return exactly one valid JSON object and nothing else. Do not wrap it in markdown. Do not add commentary. If a field is missing, use a conservative empty string, empty array, or low confidence instead of inventing details.',
            },
            {
              role: 'user',
              content: [
                `Task stage: ${stage}`,
                `Original schema target:\n${schemaHint}`,
                `Why the previous output failed:\n${firstFailure}`,
                'Repair the following output into valid JSON that matches the schema exactly:',
                rawResponse,
              ].join('\n\n'),
            },
          ];

    const completion = await createCompletion(messages, model);
    const content = completion.choices[0]?.message?.content;

    if (!content) {
      firstFailure = `Model ${model} returned an empty response.`;
      continue;
    }

    rawResponse = content;

    try {
      const { jsonText, strategy } = coerceJsonText(content);
      const parsed = JSON.parse(jsonText);
      const data = schema.parse(parsed);
      return {
        data,
        metadata: {
          source: attempt === 1 ? 'model' : 'retry',
          attempts: attempt,
          jsonStrategy: strategy,
        },
      };
    } catch (error) {
      firstFailure = error instanceof Error ? error.message : 'Unknown parse or schema validation failure.';
      console.warn(`[openrouter:${stage}] ${model} output failed on attempt ${attempt}: ${firstFailure}`);
    }
  }

  throw new AppError({
    status: 502,
    code: `${stage}_json_invalid`,
    message:
      stage === 'digest'
        ? 'The digest model returned malformed output twice. The app will try a heuristic digest fallback.'
        : 'The reasoning model returned malformed output twice. Try again, switch models, or shorten the prompt context.',
    details: [firstFailure],
  });
}
