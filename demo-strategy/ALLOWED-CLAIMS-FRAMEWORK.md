# Allowed Claims Framework

## Purpose
This framework defines what the Sunburnt Sales App demo layer is allowed to imply, state, or suggest during product demonstrations.

Its purpose is to prevent:
- overclaiming
- fake-looking demos
- misleading live simulations
- sales liability caused by uncontrolled AI narration

The rule is simple:

> Demos must persuade without inventing.

---

# Why This Matters

As soon as demo flows become more dynamic, especially in mimic mode or live runtime mode, the system risks making statements that exceed what the product can actually do.

That creates four major problems:
1. credibility damage
2. legal/commercial risk
3. implementation expectation mismatch
4. bad-fit deals entering pipeline

Therefore, all demo experiences must be governed by an explicit claims framework.

---

# Core Principles

## 1. Show the capability, do not exaggerate certainty
Allowed:
- “This can reduce manual follow-up work.”
- “This helps teams respond faster.”

Blocked:
- “This will eliminate all manual work.”
- “This guarantees no leads are ever missed again.”

## 2. Use probability and expectation language where appropriate
Allowed:
- “Typically helps”
- “Can reduce”
- “Designed to”
- “Often improves”

Blocked:
- “Always”
- “Guaranteed”
- “Perfectly”
- “Instantly solves”

## 3. Simulations must be framed as simulations when not truly live
Allowed:
- “Here’s how this would likely work in your environment.”
- “This demo simulates the workflow using your prospect context.”

Blocked:
- implying a mimic demo is a real production run when it is not

## 4. ROI must be framed as directional unless specifically modeled
Allowed:
- “This usually reduces admin overhead significantly.”
- “There is likely a strong ROI case here based on the workflow volume.”

Blocked:
- invented hard ROI numbers with no basis
- fake savings figures presented as guaranteed outcomes

## 5. Regulated or high-risk functions need extra caution
Allowed:
- “Supports compliance workflows”
- “Assists teams with structured checks and visibility”

Blocked:
- “Ensures compliance automatically”
- “Removes legal/clinical/financial risk entirely”

---

# Claim Categories

## Category A — Safe Claims
These are broadly acceptable when grounded in the product’s intended function.

Examples:
- reduces repetitive work
- improves visibility
- speeds up response times
- helps prioritize work
- centralizes scattered information
- supports more consistent workflows
- increases access to business context
- improves follow-up discipline
- helps teams focus on higher-value work

These claims are generally safe across demos when tied to the actual product behavior.

---

## Category B — Conditional Claims
These are allowed only when paired with context, caveats, or explanation.

Examples:
- can reduce headcount pressure
- can increase pipeline throughput
- can improve conversion rates
- can reduce response time significantly
- can improve reporting accuracy
- can reduce compliance misses

Requirements:
- must be phrased conditionally
- must not be framed as universal outcomes
- should ideally be tied to process volume, workflow quality, or business maturity

---

## Category C — Restricted Claims
These should only be allowed in very specific circumstances with explicit supporting logic.

Examples:
- replaces roles entirely
- increases revenue by a precise percentage
- eliminates churn
- guarantees compliance
- removes legal/financial/operational risk
- runs the business autonomously

Requirements:
- generally avoid in demo mode
- only use if tightly scoped, explicitly qualified, and commercially defensible

---

## Category D — Prohibited Claims
Never allow these in demo narration, demo outputs, or generated talk tracks.

Examples:
- guarantees perfect outcomes
- guarantees legal, medical, tax, or regulatory correctness
- fully replaces human judgment in high-risk functions
- works instantly with no implementation effort
- integrates with anything automatically without setup
- eliminates all errors
- removes all need for staff
- implies a live result is real when it is simulated

These are blocked regardless of product.

---

# Claim Rules by Demo Mode

## Prebuilt Demo Rules
Prebuilt demos may use stronger language because the flow is deterministic, but still must remain accurate.

Allowed style:
- “This is how the workflow operates.”
- “This is the value this system is designed to create.”

Still blocked:
- guarantee language
- fabricated ROI certainty

## Mimic Demo Rules
Mimic demos require the strictest commercial discipline.

Must:
- clearly stay within approved product capability
- frame outputs as realistic simulation where relevant
- avoid implying deep integrations that are not present

## Runtime Demo Rules
Runtime demos can be more direct, but should still avoid strong guarantee language.

Must:
- distinguish between live output and full production readiness
- avoid implying the current live run equals finished deployment capability

---

# Standard Language Patterns

## Preferred Phrasing
Use language like:
- “designed to”
- “can help”
- “can reduce”
- “typically improves”
- “supports”
- “gives visibility into”
- “helps teams respond faster”
- “makes this process more consistent”
- “shows what this could look like in your business”

## Blocked Phrasing
Avoid language like:
- “guarantees”
- “eliminates completely”
- “perfectly solves”
- “always catches”
- “fully replaces”
- “instantly integrates with everything”
- “will definitely save $X”

---

# Product-Specific Governance

Each demo definition should include:
- `claimsAllowed`
- `claimsBlocked`

This allows product-level nuance.

Example:

For **Document Extraction Engine**
Allowed:
- extracts structured data from documents
- reduces manual rekeying work
- improves consistency of intake

Blocked:
- guarantees zero extraction errors in every case
- handles every document format with perfect accuracy

For **AI Customer Support System**
Allowed:
- handles routine support requests
- speeds up response time
- escalates more complex cases

Blocked:
- resolves every customer issue without human help
- replaces the support team completely

---

# Governance Rules for Generated Talk Tracks

Any generated or AI-assisted talk track must:
1. inherit product-level allowed claims
2. avoid prohibited language automatically
3. downgrade risky language to conditional phrasing
4. surface uncertainty honestly when context is weak

If a generated narrative tries to exceed allowed claims, it should be:
- blocked,
- rewritten,
- or replaced with a safer version.

---

# QA Checklist

Before approving a demo output, confirm:
- no absolute guarantees are made
- simulation is not presented as live production truth when it is not
- ROI language is responsible
- regulated/high-risk outcomes are framed carefully
- claims match actual product scope

---

# Final Recommendation

The stronger the demo system becomes, the more important claims control becomes.

A demo layer without claims governance will eventually create sales debt.
A demo layer with strong claims governance becomes a scalable commercial asset.

Bottom line:
- show the power
- keep the truth
- never let the demo outrun the product
