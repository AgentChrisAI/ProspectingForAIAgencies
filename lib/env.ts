import 'server-only';

export const env = {
  openRouterApiKey: process.env.OPENROUTER_API_KEY ?? '',
  openRouterBaseUrl: process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1',
  openRouterSiteUrl: process.env.OPENROUTER_SITE_URL ?? 'http://localhost:3000',
  openRouterAppName: process.env.OPENROUTER_APP_NAME ?? 'Sunburnt Sales App',
  digestModel: process.env.DIGEST_MODEL ?? 'anthropic/claude-haiku-4.5',
  reasoningModel: process.env.REASONING_MODEL ?? 'anthropic/claude-opus-4.6',
  maxScrapeChars: Number(process.env.MAX_SCRAPE_CHARS ?? 25000),
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS ?? 15000),
};

export function assertServerEnv() {
  if (!env.openRouterApiKey) {
    throw new Error('Missing OPENROUTER_API_KEY. Add it to your server environment before running analysis.');
  }
}
