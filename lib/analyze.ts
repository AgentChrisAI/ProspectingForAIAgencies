import 'server-only';
import { assertServerEnv, env } from '@/lib/env';
import { AppError } from '@/lib/errors';
import { industries, overview, products, stacks } from '@/lib/knowledge';
import { jsonChatCompletion } from '@/lib/openrouter';
import { extractWebsiteContent } from '@/lib/scrape';
import {
  digestResultSchema,
  recommendationReportSchema,
  type AnalysisResponse,
  type DigestResult,
  type ProspectInput,
} from '@/lib/types';

function compactCatalogue() {
  return products.map((product) => ({
    name: product.name,
    tier: product.tier,
    function: product.function,
    description: product.description,
    outcome: product.outcome,
    painPoint: product.painPoint,
    knowledge: product.knowledge,
    price: product.price,
  }));
}

function compactIndustries() {
  return industries.map((industry) => ({
    industry: industry.industry,
    painPoints: industry.painPoints.slice(0, 5),
    recommendedProducts: industry.recommendedProducts.slice(0, 5),
    bundle: industry.recommendedBundle,
    terminology: industry.terminology.slice(0, 7),
    objections: industry.objections.slice(0, 5),
  }));
}

const DIGEST_SCHEMA_HINT = `{
  "companySnapshot": "string",
  "inferredIndustry": {"label":"string","confidence":"low|medium|high","reasoning":"string"},
  "websiteSummary": ["string"],
  "signals": ["string"],
  "likelyPainPoints": ["string"],
  "dataNeeds": ["string"],
  "buyingSignals": ["string"],
  "caveats": ["string"]
}`;

const REASONING_SCHEMA_HINT = `{
  "executiveSummary": "string",
  "companySnapshot": ["string"],
  "inferredIndustry": {"label":"string","confidence":"low|medium|high","reasoning":"string"},
  "keyPainPoints": ["string"],
  "diagnosis": {"data":["string"],"process":["string"],"communication":["string"],"capacity":["string"]},
  "recommendedProducts": [{"productName":"string","tier":"string","whyItFits":"string","expectedImpact":"string","source":"catalogue|sales-guide"}],
  "recommendedStack": {"name":"string","rollout":"string","rationale":"string","implementationPhases":["string"]},
  "knowledgeLayerRationale": {"dataToUnify":["string"],"valueNarrative":"string"},
  "roiTalkingPoints": ["string"],
  "objectionsAndRebuttals": [{"objection":"string","rebuttal":"string"}],
  "discoveryQuestions": ["string"],
  "openingAngle": "string",
  "confidenceNotes": ["string"]
}`;

const DIGEST_SYSTEM = `You are Sunburnt AI's sales research digest agent.
Return exactly one JSON object and nothing else.
Do not use markdown fences. Do not add prefacing text or explanations.
Ground every field in the supplied website extraction and prospect notes.
If evidence is weak, say so explicitly in caveats or reasoning.
Prefer short, factual bullet-style strings over broad claims.
Every array must contain concise strings only.`;

const REASONING_SYSTEM = `You are Sunburnt AI's solutions architect.
Return exactly one JSON object and nothing else.
Do not use markdown fences. Do not add commentary before or after the JSON.
Ground every recommendation in the provided Sunburnt sales guide, industry playbooks, product catalogue, and digest.
Do not invent unavailable products.
If the digest used fallback heuristics or confidence is weak, say that plainly in confidenceNotes.
Keep the output crisp enough for a sales rep to use live on a call.`;

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => normalizeWhitespace(sentence))
    .filter((sentence) => sentence.length >= 40);
}

function uniqueStrings(items: string[], limit: number) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items.map((entry) => normalizeWhitespace(entry)).filter(Boolean)) {
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
    if (result.length >= limit) break;
  }

  return result;
}

function sentenceMatches(sentence: string, terms: string[]) {
  const haystack = sentence.toLowerCase();
  return terms.some((term) => haystack.includes(term.toLowerCase()));
}

function inferIndustryFromText(text: string, hintedIndustry?: string) {
  const loweredText = text.toLowerCase();
  let bestMatch: {
    label: string;
    confidence: 'low' | 'medium' | 'high';
    reasoning: string;
    score: number;
  } = {
    label: hintedIndustry?.trim() || 'General business services',
    confidence: 'low',
    reasoning: hintedIndustry?.trim()
      ? `Used the provided industry hint: ${hintedIndustry.trim()}.`
      : 'No strong industry keyword cluster was detected from the public website text.',
    score: 0,
  };

  for (const industry of industries) {
    const terms = [industry.industry, ...industry.terminology, ...industry.painPoints]
      .join(' | ')
      .toLowerCase();

    let score = 0;
    for (const fragment of terms.split('|').map((entry) => entry.trim()).filter(Boolean)) {
      if (fragment.length >= 4 && loweredText.includes(fragment)) {
        score += 1;
      }
    }

    if (score > bestMatch.score) {
      bestMatch = {
        label: industry.industry,
        confidence: score >= 5 ? 'high' : score >= 2 ? 'medium' : 'low',
        reasoning: `Matched ${score} industry terms from the public website text against the ${industry.industry} playbook.`,
        score,
      };
    }
  }

  return {
    label: bestMatch.label,
    confidence: bestMatch.confidence,
    reasoning: bestMatch.reasoning,
  };
}

function buildHeuristicDigest(input: ProspectInput, extraction: AnalysisResponse['extraction']): DigestResult {
  // Heuristic fallback is intentionally simple and conservative.
  // It exists to keep the app usable when the digest model returns malformed JSON.
  const sentences = splitSentences([extraction.title, extraction.description, extraction.textPreview, extraction.text].join(' '));
  const inferredIndustry = inferIndustryFromText(`${extraction.title} ${extraction.description} ${extraction.text}`, input.industry);
  const matchedIndustry = industries.find((industry) => industry.industry === inferredIndustry.label);

  const headlineSummary = uniqueStrings(
    [extraction.title, extraction.description, ...sentences.slice(0, 6)].filter(Boolean),
    5
  );

  const signals = uniqueStrings(
    sentences.filter((sentence) => sentenceMatches(sentence, ['service', 'team', 'clients', 'solutions', 'industries', 'contact', 'book', 'call', 'quote', 'project'])),
    5
  );

  const likelyPainPoints = uniqueStrings(
    [
      ...(matchedIndustry?.painPoints ?? []).slice(0, 3),
      ...sentences.filter((sentence) => sentenceMatches(sentence, ['manual', 'slow', 'compliance', 'paperwork', 'growth', 'support', 'visibility', 'scheduling', 'leads'])),
    ],
    5
  );

  const dataNeeds = uniqueStrings(
    [
      'Need clearer visibility on leads, enquiries, and follow-up status.',
      'Need customer, job, and communication data in one place for sales handover.',
      ...sentences.filter((sentence) => sentenceMatches(sentence, ['crm', 'bookings', 'inventory', 'orders', 'pipeline', 'jobs', 'customers'])),
    ],
    4
  );

  const buyingSignals = uniqueStrings(
    sentences.filter((sentence) => sentenceMatches(sentence, ['contact', 'quote', 'book', 'demo', 'consultation', 'call', 'locations', 'testimonials', 'case studies'])),
    4
  );

  const caveats = uniqueStrings(
    [
      'Digest generated from heuristic extraction because the digest model output was unusable.',
      ...extraction.warnings,
      'Heuristic digest may miss nuance on JS-heavy or thin-content websites.',
    ],
    5
  );

  return digestResultSchema.parse({
    companySnapshot: normalizeWhitespace(
      `${input.companyName} appears to operate in or near ${inferredIndustry.label}. Summary is based on public website text${input.industry ? ` plus the provided industry hint (${input.industry}).` : '.'}`
    ),
    inferredIndustry,
    websiteSummary: headlineSummary.length ? headlineSummary : ['Public website text was thin, but the site appears to describe the business and its services.'],
    signals: signals.length ? signals : ['Website contains enough public business copy to support a basic sales discovery conversation.'],
    likelyPainPoints: likelyPainPoints.length ? likelyPainPoints : ['Operational bottlenecks and fragmented data are plausible issues, but evidence is limited.'],
    dataNeeds,
    buyingSignals: buyingSignals.length ? buyingSignals : ['Presence of contact or enquiry paths suggests an active lead capture workflow.'],
    caveats,
  });
}

export async function runAnalysis(input: ProspectInput): Promise<AnalysisResponse> {
  assertServerEnv();
  const started = Date.now();
  const extraction = await extractWebsiteContent(input.websiteUrl);

  let digest: DigestResult;
  let digestSource: AnalysisResponse['metadata']['digestSource'];
  let digestAttempts: number;
  let digestJsonStrategy: AnalysisResponse['metadata']['digestJsonStrategy'];

  try {
    const digestResult = await jsonChatCompletion({
      model: env.digestModel,
      system: DIGEST_SYSTEM,
      schema: digestResultSchema,
      schemaHint: DIGEST_SCHEMA_HINT,
      stage: 'digest',
      user: JSON.stringify(
        {
          instructions: 'Summarize only what is supported by the provided input. Keep strings short and sales-usable.',
          outputShape: JSON.parse(DIGEST_SCHEMA_HINT),
          prospect: input,
          website: extraction,
        },
        null,
        2
      ),
    });

    digest = digestResult.data;
    digestSource = digestResult.metadata.source;
    digestAttempts = digestResult.metadata.attempts;
    digestJsonStrategy = digestResult.metadata.jsonStrategy;
    console.info(`[analysis] digest completed via ${digestSource} after ${digestAttempts} attempt(s).`);
  } catch (error) {
    if (!(error instanceof AppError) || error.code !== 'digest_json_invalid') {
      throw error;
    }

    digest = buildHeuristicDigest(input, extraction);
    digestSource = 'fallback';
    digestAttempts = 2;
    digestJsonStrategy = 'heuristic';
    console.warn('[analysis] digest model failed twice; using heuristic digest fallback.');
  }

  let reportResult;
  try {
    reportResult = await jsonChatCompletion({
      model: env.reasoningModel,
      system: REASONING_SYSTEM,
      schema: recommendationReportSchema,
      schemaHint: REASONING_SCHEMA_HINT,
      stage: 'reasoning',
      user: JSON.stringify(
        {
          instructions:
            'Use the digest as a working brief, but adjust confidence downward when evidence is thin. Keep recommendations specific and commercially sensible.',
          outputShape: JSON.parse(REASONING_SCHEMA_HINT),
          prospect: input,
          digest,
          digestMeta: {
            source: digestSource,
            attempts: digestAttempts,
            heuristicFallback: digestSource === 'fallback',
          },
          salesGuideOverview: overview,
          industries: compactIndustries(),
          productCatalogue: compactCatalogue(),
          stackDeals: stacks,
        },
        null,
        2
      ),
    });
  } catch (error) {
    if (digestSource === 'fallback') {
      throw new AppError({
        status: 502,
        code: 'analysis_failed_after_fallback',
        message:
          'The app recovered from a digest-model failure, but the reasoning model still could not produce a valid recommendation report. Try again, shorten the website context, or switch the reasoning model.',
        details: [error instanceof Error ? error.message : 'Unknown reasoning failure after fallback digest.'],
      });
    }

    throw error;
  }

  return {
    input,
    extraction,
    digest,
    report: reportResult.data,
    metadata: {
      digestModel: env.digestModel,
      reasoningModel: env.reasoningModel,
      durationMs: Date.now() - started,
      generatedAt: new Date().toISOString(),
      digestSource,
      digestAttempts,
      digestJsonStrategy,
      reasoningSource: reportResult.metadata.source,
      reasoningAttempts: reportResult.metadata.attempts,
      reasoningJsonStrategy: reportResult.metadata.jsonStrategy,
    },
  };
}
