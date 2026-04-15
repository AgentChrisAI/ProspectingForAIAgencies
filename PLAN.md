# Sunburnt Sales App Plan

## Goal
Build an internal sales web app that accepts prospect details + website, scrapes/public-page extracts the site, summarizes the company, and recommends Sunburnt AI products and bundles using the sales guide and product catalogue.

## v1 Scope
- Single-page intake UI
- Server API for fetch/scrape
- Embedded sales-guide knowledge and product catalogue data
- LLM pipeline via OpenRouter
- Structured recommendation report UI
- Error handling + demo-ready docs

## Inputs
- Company name
- Website URL
- Contact/prospect notes
- Industry (optional)
- Team size (optional)
- Revenue (optional)
- Current tools (optional)
- Pain points (optional)
- Extra context (optional)

## Output Sections
- Company snapshot
- Inferred industry + confidence
- Key pain points
- Diagnosis: data/process/communication/capacity
- Recommended products
- Recommended bundle/stack
- Knowledge Layer rationale
- ROI talking points
- Objections + rebuttals
- Discovery questions
- Suggested opening angle

## Tech Direction
- Next.js + TypeScript
- App Router
- API route for /api/analyze
- Use web fetch / raw fetch fallback server-side
- Store guide/catalogue as local data assets

## Models
- Digest: anthropic/claude-haiku-4.5
- Reasoning: anthropic/claude-opus-4.6

## Notes
- User explicitly supplied OpenRouter key in chat; still keep it in env, never client-side.
- Need app-ready structured catalogue even if spreadsheet parsing is partial.
