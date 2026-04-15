# Sunburnt Sales App

Demoable internal web app for Sunburnt AI sales reps.

## What it does

Given prospect details and a public website URL, the app:

1. fetches and extracts visible website text server-side
2. runs a digest pass with the configured OpenRouter model
3. runs a recommendation pass with the configured reasoning model
4. grounds recommendations in the Sunburnt sales guide and product catalogue
5. returns a structured sales brief with:
   - company snapshot
   - inferred industry
   - key pain points
   - data/process/comms/capacity diagnosis
   - recommended products
   - recommended stack
   - Knowledge Layer rationale
   - ROI talking points
   - objections + rebuttals
   - discovery questions
   - opening angle

## Reliability hardening

The v1 app now defends against the main failure mode that showed up before re-hosting: models returning malformed “JSON” with fences, prose, or broken structure.

### What changed

- **JSON sanitising in the OpenRouter layer**
  - strips markdown fences
  - extracts the first JSON object if the model adds extra prose
  - validates model output against strict `zod` schemas
- **Automatic retry on bad model output**
  - if parse or schema validation fails, the app makes one repair-style retry with a stricter prompt
- **Heuristic digest fallback**
  - if the digest model still fails after retries, the app builds a conservative digest directly from scraped website content
  - the reasoning stage can continue using that fallback digest
- **Actionable errors**
  - request validation errors come back as clear intake issues
  - model failures now return operator-usable messages instead of raw brittle internals
- **Metadata and logging**
  - the response includes whether each stage came from the original model, retry, or fallback
  - attempt counts and JSON recovery strategy are exposed in metadata

### Important behavioural note

If the digest falls back to heuristics, the app remains usable, but confidence should be treated more cautiously. The UI flags this state and the report is instructed to say so.

## Stack

- Next.js App Router
- TypeScript
- OpenRouter-compatible API calls via the OpenAI SDK
- Cheerio for HTML text extraction
- Zod for schema validation
- generated JSON knowledge assets from the provided docs

## Local setup

```bash
cd sunburnt-sales-app
cp .env.example .env.local
# add your OPENROUTER_API_KEY to .env.local
npm install
npm run dev
```

Then open <http://localhost:3000>.

## Environment variables

- `OPENROUTER_API_KEY` - required, server-side only
- `OPENROUTER_BASE_URL` - defaults to `https://openrouter.ai/api/v1`
- `OPENROUTER_SITE_URL` - used for OpenRouter headers
- `OPENROUTER_APP_NAME` - used for OpenRouter headers
- `DIGEST_MODEL` - defaults to `anthropic/claude-haiku-4.5`
- `REASONING_MODEL` - defaults to `anthropic/claude-opus-4.6`
- `MAX_SCRAPE_CHARS` - max extracted site text for analysis
- `REQUEST_TIMEOUT_MS` - fetch timeout for website extraction
- `TEST_BASE_URL` - optional base URL for the harness script (defaults to `http://127.0.0.1:3000`)

## Knowledge assets

The source docs live in `docs/`.
Generated app-ready assets live in `src/data/` and are produced by:

```bash
npm run generate:knowledge
```

Current generated assets:

- `src/data/products.json`
- `src/data/stacks.json`
- `src/data/industries.json`
- `src/data/overview.json`

## Validation and test harness

### Build validation

```bash
npm run build
```

### Multi-site harness

Start the app locally, then run:

```bash
npm run test:harness
```

The harness calls the real `/api/analyze` route for multiple public business websites and prints:

- HTTP status
- executive summary
- inferred industry
- whether digest came from `model`, `retry`, or `fallback`
- attempt counts for digest and reasoning
- extraction warnings or actionable errors

Default cases currently cover:

- ServiceM8
- HubSpot
- Jim’s Mowing

## Important caveats

- Website extraction is intentionally pragmatic, not browser-grade. It does a public HTML fetch and text extraction. JS-heavy sites may produce thin context.
- The recommendation pipeline is grounded with provided knowledge assets, but still depends on model quality and the available public website text.
- The heuristic digest fallback is intentionally conservative. It keeps the workflow alive, but it is not equivalent to a strong clean model digest.
- Pricing in the supplied catalogue includes placeholder-style values in places; the app uses them only as reference context.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run generate:knowledge
npm run test:harness
```
