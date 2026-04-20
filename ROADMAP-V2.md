# Prospecting App V2 Roadmap

This roadmap captures the next major evolution of the Prospecting App beyond the current V1 sales-brief workflow.

## Status
- **V1** = single-business/internal sales workbench focused on website-driven prospect analysis
- **V2 direction** = multi-tenant, customer-configurable, branded prospecting platform

---

## North Star

Turn the app from a single internal prospect analysis tool into a **multi-tenant prospecting platform** where each business can:
- sign up
- configure its own company profile, offers, and brand
- generate and maintain its own service catalogue
- tailor recommendations to its own business model
- spend credits per processing run

In short:
**one platform, many businesses, each with their own tailored prospecting engine**.

---

## Core V2 Themes

### 1. Multi-tenant architecture
Each customer/company should have its own isolated workspace within the app.

#### Goals
- company signup and login
- tenant-scoped data separation
- company-specific settings, catalogue, prompts, and branding
- ability for different businesses to use the same platform without data leakage

#### Initial requirements
- basic auth to start
- tenant record per company
- tenant-specific:
  - company details
  - website
  - uploaded services/content
  - generated catalogue
  - brand settings
  - usage / credits

#### Future direction
- role-based access (admin / sales rep / analyst)
- team members under one tenant
- audit logs and tenant-level usage reporting

---

### 2. Company onboarding flow
When a company signs up, the system should walk them through onboarding.

#### Inputs the company provides
- business name
- website
- company description
- services / offers
- supporting assets, potentially including:
  - text input
  - CSV
  - Excel
  - PDF
  - DOC / DOCX
  - other relevant business documents

#### Outcome
The app should convert this raw input into structured business intelligence that powers the platform.

---

### 3. Auto-generated service catalogue
A major V2 capability is transforming uploaded business materials into a structured catalogue.

#### What the system should do
- ingest company service descriptions and documents
- extract core service lines / offers
- normalize names and descriptions
- infer likely business outcomes and pain points solved
- generate a structured service catalogue

#### Requirements
- save the generated catalogue to the tenant account
- make it **viewable and editable** in the UI
- allow the business to refine or override generated entries
- use the catalogue as grounding for prospect recommendations

#### Why it matters
This is the shift from a generic Sunburnt-only catalogue to a **business-specific recommendation engine**.

---

### 4. Auto-branding and theming
The system should automatically tailor the UI to the customer’s brand.

#### Desired behavior
- scrape the customer website
- infer brand colours and visual style
- apply those colours to the app UI automatically
- allow manual editing/override of brand settings

#### Scope
- primary colour
- secondary/accent colour
- neutrals/background bias
- logo handling (future)
- typography mapping (future)

#### Why it matters
The product should feel like **their platform**, not a generic shared dashboard.

---

### 5. Tailored platform behavior per business
Once onboarding, catalogue generation, and branding exist, the whole app should become company-specific.

#### That means
- prospect recommendations use the tenant’s own offers and language
- output reflects the tenant’s services and positioning
- the UI reflects the tenant’s branding
- recommendations are no longer hard-coded to a single business model

This is the real V2 unlock.

---

### 6. Credit-based usage system
V2 should introduce a simple credit model.

#### Initial pricing logic
- **1 credit** per standard processing run
- **+1 extra credit** if LinkedIn enrichment is included

#### Why keep it simple initially
- easy for customers to understand
- easy to meter
- easy to implement
- avoids pricing complexity too early

#### What needs tracking
- credits purchased / allocated
- credits used
- per-run cost attribution
- whether a run included premium data sources (e.g. LinkedIn)

#### Future expansion
- subscriptions with included credits
- usage top-ups
- admin credit grants
- plan tiers

---

## Task 1 ideas to revisit later
These are intentionally noted but not implemented in this task.

### A. LinkedIn / Apify enrichment
Potential V2/V2.1 feature:
- add LinkedIn company URL and LinkedIn person URL to intake
- allow data-source multi-select, e.g.:
  - website
  - LinkedIn company
  - LinkedIn person
- use Apify LinkedIn scrapers
- system must wait for actor completion before continuing analysis

#### Design note
This needs careful handling of:
- async actor execution
- progress states
- retries / timeouts
- cost/credit attribution
- partial failure behavior

---

### B. Export capability
Potential feature:
- export intake + recommendation brief
- likely formats:
  - PDF
  - Markdown
  - DOCX
  - structured JSON (internal/export API)

---

### C. Progress/loading experience
Potential feature:
- loading / progress bar
- animated processing states
- stage-by-stage indicators, e.g.:
  - scraping website
  - enriching company data
  - generating digest
  - generating recommendation brief
  - finalizing report

This will matter more once enrichment sources and async jobs expand.

---

## Additional V2 features worth adding
My recommendation: add these to the roadmap now so the architecture supports them early.

### 1. Tenant knowledge base
Each tenant should have a private knowledge layer containing:
- service docs
- FAQs
- proposal language
- case studies
- ICP definitions
- objections / rebuttals

This would improve recommendation grounding massively.

### 2. Editable recommendation rules
Allow tenants to define:
- preferred offers by industry
- banned recommendations
- preferred language / tone
- implementation constraints
- minimum deal size filters

That would make the system more controllable and commercially safe.

### 3. Prospect history / CRM-lite memory
Store prior analyses so a team can:
- revisit briefs
- compare accounts
- avoid duplicate work
- track progression from prospect to proposal

### 4. Team accounts and permissions
Even if auth starts simple, V2 should anticipate:
- owner/admin
- sales rep
- analyst
- read-only stakeholder

### 5. Billing + usage dashboard
Customers will eventually want:
- credit balance
- usage history
- cost by source
- recent processing runs
- export/download history

### 6. Template and prompt management
Per tenant, allow:
- brief templates
- industry-specific output variants
- export templates
- tone-of-voice settings

This becomes powerful once businesses want the platform to match their internal sales process.

---

## Suggested delivery phases

### Phase 1 — Multi-tenant foundation
- tenant model
- basic auth
- tenant-scoped data separation
- company onboarding record
- tenant settings page

### Phase 2 — Business ingestion
- website + company details intake
- uploads for business files
- ingestion pipeline for text/docs/spreadsheets
- normalized internal business profile

### Phase 3 — Service catalogue generation
- AI-assisted service extraction
- generated catalogue storage
- editable catalogue UI
- catalogue grounding for recommendations

### Phase 4 — Branding automation
- brand colour scraping
- theme generation
- editable brand settings
- per-tenant theming

### Phase 5 — Credits and usage
- credit ledger
- 1 credit standard processing
- +1 credit LinkedIn enrichment
- usage dashboard

### Phase 6 — Advanced enrichment + exports
- LinkedIn / Apify enrichment
- export system
- progress indicators / job orchestration
- richer recommendation memory/history

---

## Product framing for V2

V1 is an internal AI-assisted prospecting workbench.

V2 becomes:
**a white-labelled, multi-tenant prospect intelligence platform that adapts to each business’s services, brand, and go-to-market model.**

That is the right strategic direction.
