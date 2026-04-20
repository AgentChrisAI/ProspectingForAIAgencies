# Prospecting App V2 Backend Architecture

This document defines the recommended backend architecture for evolving the Prospecting App from a single internal analysis tool into a **multi-tenant, API-first, agent-usable platform**.

---

# 1. Core architectural position

## Recommendation
Use:
- **Next.js server routes or a dedicated backend service** as the application/API layer
- **Supabase (Postgres + Auth + Storage)** as the backend substrate
- **Background job processing** for long-running enrichment and generation workflows
- **Structured JSON APIs** for both UI clients and external AI agents

## Why
The system needs to support two very different interaction modes:
1. **human UI usage** inside the app
2. **AI agent / API usage** where external tools submit prospect data and receive structured recommendation briefs

That means the architecture must separate:
- API contracts
- orchestration logic
- persistence
- async execution
- tenant access control
- credit accounting

Supabase is a strong choice for persistence, auth, and storage, but it should **not** be the business-logic layer. The platform should expose a proper application API on top.

---

# 2. Target system shape

## High-level layers

### Layer A — Client surfaces
These are the entry points into the system.

- Web UI (human users)
- External AI agents (API consumers)
- Internal automation tools
- Future integrations (CRM, workflow engines, partner systems)

### Layer B — Application/API layer
This is the core business-logic layer.

Responsibilities:
- request validation
- auth and tenant resolution
- routing and orchestration
- invoking scraping/enrichment/generation flows
- persistence coordination
- credit metering
- export generation
- response shaping

Recommended implementation:
- Next.js route handlers for near-term speed
- potentially split into dedicated backend services later if scale/complexity grows

### Layer C — Workflow / job layer
This handles slow or multi-step asynchronous work.

Responsibilities:
- queued jobs
- Apify actor polling
- retries/backoff
- progress tracking
- timeout handling
- status transitions
- resumable execution

### Layer D — Persistence and infra
Use Supabase for:
- Postgres
- Auth
- Storage
- Row-level security (where useful)

---

# 3. Design principles

## API-first
Everything important should be invokable through the API, not only through the UI.

The UI should consume the same underlying service contracts that an external agent would use.

## Multi-tenant by default
All persisted objects should be tenant-scoped from the start.

## Async-ready
Even if V1 is synchronous, V2 features like LinkedIn enrichment, file ingestion, exports, and catalogue generation should be treated as job-capable workflows.

## Structured over ad hoc
Store structured inputs and outputs as JSON, not loose markdown blobs or file-only artifacts.

## Clear separation of concerns
- Supabase stores data
- application layer owns business logic
- agents call APIs, not raw DB tables

---

# 4. Main capabilities the backend must support

## Capability 1 — Tenant onboarding
A company signs up and creates a tenant.

System must support:
- tenant creation
- owner user creation
- basic auth/session issuance
- company profile intake
- website capture
- initial business context capture

## Capability 2 — Business ingestion
The tenant submits business materials.

Supported sources:
- website
- free-text descriptions
- CSV
- Excel
- PDF
- DOC / DOCX
- future: URLs, slide decks, knowledge base links

The system must:
- ingest content
- extract text
- normalize content
- save original file refs and extracted representations

## Capability 3 — Service catalogue generation
The system generates a tenant-specific catalogue.

Must:
- transform raw business materials into structured offers/services
- infer outcomes, pains solved, target industries, and implementation characteristics
- save catalogue records
- support manual editing and versioning

## Capability 4 — Prospect analysis
The system accepts prospect input and produces a recommendation brief.

Must support:
- synchronous request path for lighter runs
- asynchronous request path for enriched/multi-source runs
- structured outputs
- auditability of source data and generation metadata

## Capability 5 — Enrichment orchestration
Especially for LinkedIn / Apify / future data sources.

Must support:
- external job triggering
- wait/poll lifecycle
- retries
- timeout behavior
- partial failure rules
- credit usage calculation

## Capability 6 — Exports
Must support generation and storage of exports.

Formats may include:
- markdown
- PDF
- DOCX
- JSON

## Capability 7 — Usage and billing
Must support credit accounting.

Initial rule:
- 1 credit per standard processing run
- +1 extra credit for LinkedIn enrichment

---

# 5. Recommended request model

There should be two primary analysis modes.

## Mode A — Synchronous analyze
Use for simple website-only runs where turnaround is fast.

Example:
`POST /api/v1/briefs/analyze`

Request:
- tenant context
- prospect input
- selected data sources
- optional output preferences

Response:
- structured brief JSON
- metadata
- persisted brief id

## Mode B — Asynchronous job-based analyze
Use for heavier runs with enrichment, file-driven processing, exports, or future long-running tasks.

Example:
- `POST /api/v1/jobs/briefs`
- `GET /api/v1/jobs/:id`
- `GET /api/v1/briefs/:id`

Flow:
1. client submits job
2. backend validates and enqueues
3. worker executes pipeline
4. client polls job status or receives webhook later
5. client fetches final brief

This async pattern is the correct foundation for Apify and richer enrichment.

---

# 6. API surface

## 6.1 Auth / tenant

### `POST /api/v1/auth/signup`
Create tenant owner account.

### `POST /api/v1/auth/login`
Session/token issuance.

### `GET /api/v1/me`
Return current user + tenant context.

### `GET /api/v1/tenant`
Return tenant profile, branding, and settings.

### `PATCH /api/v1/tenant`
Update tenant company details.

---

## 6.2 Business profile and uploads

### `POST /api/v1/tenant/uploads`
Upload business files.

### `GET /api/v1/tenant/uploads`
List uploaded files.

### `POST /api/v1/tenant/ingest`
Trigger business ingestion from uploaded files + text + website.

### `GET /api/v1/tenant/business-profile`
Return normalized business profile.

### `PATCH /api/v1/tenant/business-profile`
Allow manual edits.

---

## 6.3 Catalogue

### `POST /api/v1/catalogue/generate`
Generate service catalogue from business profile/materials.

### `GET /api/v1/catalogue`
Return tenant catalogue.

### `PATCH /api/v1/catalogue/:id`
Edit specific catalogue item.

### `POST /api/v1/catalogue/regenerate`
Regenerate or refresh catalogue.

---

## 6.4 Brief generation

### `POST /api/v1/briefs/analyze`
Synchronous analysis endpoint.

### `POST /api/v1/jobs/briefs`
Async job-based brief generation.

### `GET /api/v1/jobs/:id`
Return job status and progress.

### `GET /api/v1/briefs/:id`
Return saved brief.

### `GET /api/v1/briefs`
List brief history.

### `POST /api/v1/briefs/:id/export`
Generate export file.

### `GET /api/v1/briefs/:id/export/:exportId`
Download export artifact.

---

## 6.5 Credits and billing

### `GET /api/v1/credits`
Return current credit balance.

### `GET /api/v1/credits/ledger`
Return credit transaction history.

### `POST /api/v1/credits/adjust`
Admin-only manual adjustments.

---

## 6.6 Branding

### `POST /api/v1/branding/extract`
Scrape and infer brand colours from website.

### `GET /api/v1/branding`
Get current brand settings.

### `PATCH /api/v1/branding`
Manual override of colours and settings.

---

# 7. External AI agent usage model

This platform should be usable as an AI tool.

## Important rule
External agents should call the **application API**, not Supabase directly.

## Ideal agent-facing contract

### Request example
`POST /api/v1/briefs/analyze`

```json
{
  "tenantId": "tenant_123",
  "prospect": {
    "companyName": "Acme Logistics",
    "websiteUrl": "https://acme-logistics.example",
    "contactName": "Jane Smith",
    "role": "COO",
    "industry": "Logistics",
    "teamSize": "120",
    "painPoints": "Manual dispatching, fragmented systems"
  },
  "dataSources": ["website"],
  "options": {
    "save": true,
    "exportFormats": ["markdown"]
  }
}
```

### Response example
```json
{
  "briefId": "brief_456",
  "status": "completed",
  "creditsCharged": 1,
  "report": {
    "executiveSummary": "...",
    "recommendedProducts": [],
    "recommendedStack": {},
    "discoveryQuestions": []
  },
  "metadata": {
    "durationMs": 8421,
    "dataSourcesUsed": ["website"]
  }
}
```

## For enriched/slow requests
Use async jobs instead.

This gives agents:
- stable interface
- clear response schema
- idempotent request handling later
- easy integration into orchestration tools

---

# 8. Data model

Below is the recommended core schema.

## 8.1 tenants
Represents a company/customer account.

Fields:
- `id`
- `name`
- `slug`
- `website_url`
- `industry`
- `country`
- `created_at`
- `updated_at`
- `status`

## 8.2 users
Represents tenant users.

Fields:
- `id`
- `tenant_id`
- `auth_user_id`
- `email`
- `full_name`
- `role` (`owner`, `admin`, `rep`, `analyst`, `viewer`)
- `created_at`

## 8.3 tenant_branding
Per-tenant brand settings.

Fields:
- `id`
- `tenant_id`
- `primary_color`
- `secondary_color`
- `background_color`
- `text_color`
- `logo_url`
- `source` (`auto`, `manual`, `mixed`)
- `created_at`
- `updated_at`

## 8.4 tenant_business_profiles
Normalized business profile.

Fields:
- `id`
- `tenant_id`
- `company_description`
- `website_summary`
- `business_context_json`
- `raw_input_json`
- `normalized_json`
- `created_at`
- `updated_at`

## 8.5 tenant_uploads
Uploaded source materials.

Fields:
- `id`
- `tenant_id`
- `storage_path`
- `original_filename`
- `mime_type`
- `size_bytes`
- `upload_kind`
- `status`
- `created_at`

## 8.6 extracted_documents
Text/content extracted from uploaded files or websites.

Fields:
- `id`
- `tenant_id`
- `upload_id` (nullable for website-only sources)
- `source_type` (`pdf`, `docx`, `csv`, `xlsx`, `website`, `text`)
- `source_ref`
- `raw_text`
- `structured_json`
- `extraction_metadata_json`
- `created_at`

## 8.7 service_catalogue_items
Tenant-specific service catalogue.

Fields:
- `id`
- `tenant_id`
- `name`
- `positioned_name`
- `description`
- `outcome`
- `pain_points_json`
- `target_industries_json`
- `delivery_notes_json`
- `pricing_notes_json`
- `status`
- `version`
- `created_at`
- `updated_at`

## 8.8 brief_runs
Saved brief history.

Fields:
- `id`
- `tenant_id`
- `created_by_user_id` (nullable for API/system initiated runs)
- `company_name`
- `website_url`
- `prospect_input_json`
- `data_sources_json`
- `website_extraction_json`
- `enrichment_json`
- `digest_json`
- `report_json`
- `metadata_json`
- `status`
- `credits_charged`
- `created_at`

## 8.9 jobs
Tracks async processing jobs.

Fields:
- `id`
- `tenant_id`
- `job_type`
- `status` (`queued`, `running`, `completed`, `failed`, `cancelled`)
- `progress_percent`
- `current_stage`
- `request_json`
- `result_ref`
- `error_json`
- `started_at`
- `finished_at`
- `created_at`

## 8.10 job_events
Detailed progress/event log for jobs.

Fields:
- `id`
- `job_id`
- `event_type`
- `message`
- `payload_json`
- `created_at`

## 8.11 exports
Generated export artifacts.

Fields:
- `id`
- `tenant_id`
- `brief_run_id`
- `format` (`markdown`, `pdf`, `docx`, `json`)
- `storage_path`
- `metadata_json`
- `created_at`

## 8.12 credit_accounts
Tenant credit summary.

Fields:
- `id`
- `tenant_id`
- `balance`
- `updated_at`

## 8.13 credit_ledger
Immutable credit transaction history.

Fields:
- `id`
- `tenant_id`
- `brief_run_id` (nullable)
- `job_id` (nullable)
- `delta`
- `reason`
- `metadata_json`
- `created_at`

---

# 9. Request lifecycle for prospect analysis

## 9.1 Synchronous website-only flow
1. authenticate request
2. resolve tenant and permissions
3. validate credits
4. fetch tenant catalogue + business profile + branding context
5. scrape website
6. generate digest
7. generate recommendation report
8. persist brief run
9. deduct credits
10. optionally generate export
11. return brief response

## 9.2 Asynchronous enriched flow
1. authenticate request
2. resolve tenant and permissions
3. validate credits
4. create job record
5. enqueue workflow
6. worker executes:
   - scrape website
   - trigger Apify actor(s)
   - wait/poll until completion
   - ingest enrichment results
   - generate digest
   - generate recommendation report
   - persist brief run
   - create exports if requested
   - write job events/progress
   - deduct credits
7. client polls job endpoint or later gets webhook/event
8. client fetches final brief

---

# 10. Credit model

## Initial pricing
- website-only analysis = **1 credit**
- LinkedIn enrichment = **+1 credit**

## Rules
Credits should be charged only when a run has actually begun processing beyond trivial validation.

Recommended behavior:
- validation failures before processing: no charge
- enrichment partial failure with recoverable fallback: charge based on work actually attempted and policy
- hard failures after expensive external work: decide policy explicitly and record it in ledger metadata

## Ledger principle
Never rely only on a mutable balance field.
Use:
- current balance cache/account table
- immutable ledger entries for truth

---

# 11. Progress model

Because V2 will support async workflows, progress must be first-class.

## Suggested stages
- queued
- validating request
- loading tenant context
- scraping website
- extracting uploaded content
- running LinkedIn enrichment
- normalizing enrichment
- building digest
- generating recommendations
- saving brief
- generating exports
- completed

## Why this matters
This supports:
- UI progress bars
- agent polling
- webhook messaging later
- debugging
- support visibility

---

# 12. Security model

## Auth
Use Supabase Auth initially.

## Authorization
Every request must resolve:
- user identity (or API key identity later)
- tenant scope
- role/permission

## Data isolation
All tenant-owned entities must be tenant-scoped.

## Recommendation
Use app-layer authorization checks first.
RLS in Supabase can reinforce tenant isolation, but do not rely on RLS alone as the only access-control logic.

## API access for agents
For external agent usage, support:
- tenant-scoped API keys later
- scoped service tokens
- request logging/auditing

---

# 13. Storage design

Use Supabase Storage for:
- uploaded files
- generated exports
- logos/assets
- possibly raw enrichment payload snapshots if needed

Do not store giant raw documents directly in primary relational rows when avoidable.
Instead store:
- file ref in storage
- extracted text / normalized JSON in DB
- metadata for traceability

---

# 14. Orchestration and background jobs

## Near-term
A pragmatic first version can use:
- app-triggered job table
- worker process / cron / queue runner
- polling-based status updates

## Later
If complexity grows, move to a stronger job system with:
- retry queues
- concurrency controls
- dead-letter handling
- scheduled retries

## For Apify specifically
Need:
- actor run creation
- persistent run id tracking
- polling until terminal state
- timeout ceiling
- parsed result persistence
- clear fallback rules if actor fails

---

# 15. Exports architecture

Exports should be generated from saved structured brief data, not regenerated from scratch every time.

## Flow
1. client requests export for brief
2. backend reads saved brief JSON
3. backend renders export format
4. export artifact saved to storage
5. export record created
6. signed URL or download endpoint returned

## Why
This is deterministic, faster, and easier to audit.

---

# 16. Observability

You will want this earlier than you think.

## Must track
- request ids
- job ids
- tenant ids
- durations by stage
- model failures
- enrichment failures
- export failures
- credit ledger changes

## Store/log
- structured logs in application layer
- job events in DB
- error payloads with enough context to debug without leaking secrets

---

# 17. What should not happen

## Do not let external agents talk directly to Supabase tables
That couples integrations to schema and bypasses business logic.

## Do not store brief history only as markdown files
That kills queryability and multi-tenant product growth.

## Do not make LinkedIn enrichment synchronous forever
That becomes fragile and painful.

## Do not bury credit logic in frontend code
Credits must be enforced server-side.

---

# 18. Suggested implementation phases

## Phase 1 — API and persistence foundation
- Supabase project setup
- tenant/user schema
- tenant auth
- brief_runs storage
- API endpoints for synchronous analysis
- saved brief history

## Phase 2 — Business profile and catalogue foundation
- uploads
- extraction pipeline
- business profile persistence
- service catalogue generation/storage/editing

## Phase 3 — Branding and customization
- brand extraction
- branding settings persistence
- per-tenant theming

## Phase 4 — Credits and usage
- credit accounts
- ledger
- charging rules
- usage history endpoints

## Phase 5 — Async jobs and enrichment
- jobs table
- job events
- worker execution loop
- Apify LinkedIn enrichment
- status endpoints

## Phase 6 — Agent-grade integrations
- stable external API
- tenant API keys
- idempotency keys
- webhooks
- richer export formats

---

# 19. Final recommendation

If the goal is to make this a real product and a reliable AI-agent tool, the correct architecture is:

## Use Supabase for:
- Postgres
- auth
- storage

## Use an application API layer for:
- orchestration
- analysis logic
- enrichment control
- tenant access control
- credit charging
- export generation

## Use background jobs for:
- LinkedIn / Apify flows
- file ingestion
- heavy exports
- any slow multi-stage processing

That gives you:
- fast shipping now
- a clean multi-tenant path
- agent-friendly API contracts
- durable persistence
- future-proof async scaling

That is the right backend architecture for V2.
