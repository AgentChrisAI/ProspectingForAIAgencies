# Sunburnt Sales App — Demo Strategy

## Purpose
This document defines the recommended demo architecture for the Sunburnt Sales App so sales reps can move from **recommended product** to **live demo** with near-zero manual input.

The core goal is simple:

> When a sales rep is on a long prospect call and the prospect asks to "see it," the rep should be able to click a recommended product and instantly launch the best available demo experience.

This must be:
- fast
- credible
- low-friction
- visually convincing
- safe from agent chaos and overpromising

---

# Executive Summary

A one-click live demo system is feasible.

However, the right implementation is **not one single demo mechanism**.
The strongest solution is a **demo orchestrator** that automatically chooses between three demo modes depending on the product and context:

1. **Prebuilt demo agents** — safest, fastest, most reliable
2. **Runtime mimic/demo mode** — flexible, tailored simulation of product behavior
3. **Real on-demand ephemeral agents** — advanced live execution for higher-trust or later-stage calls

The system should default to the safest mode that still delivers a compelling experience.

---

# Product Goal

Inside the Sunburnt Sales App, each recommended product should support an **Instant Demo** experience.

The sales rep should ideally:
1. analyze the prospect
2. receive recommended products
3. click a product
4. immediately show a useful demo without setup complexity

The app should decide how that demo is delivered.

---

# Core Recommendation

## Use a 3-mode demo ladder

### Mode 1 — Prebuilt Demo Agents
Prebuilt, polished, deterministic demo flows for the highest-value products.

### Mode 2 — Runtime Mimic Demo
A controlled simulation engine that uses the current prospect context to generate a believable, tailored live demo.

### Mode 3 — Real Ephemeral Agent Launch
A true live agent session spun up on demand, only where appropriate.

This ladder balances:
- reliability
- personalization
- speed
- wow-factor
- control

---

# Why This Is Necessary

A prospect asking for a live demo is usually asking for confidence, not technical purity.

If the rep clicks a button and the product:
- stalls,
- asks too many questions,
- produces weird output,
- or makes claims that exceed actual capability,

then the demo hurts the sale.

Therefore, the system should prioritize:
1. certainty
2. relevance
3. speed
4. novelty

in that order.

---

# Demo Modes Explained

## 1. Prebuilt Demo Agents

### Definition
Curated, pre-authored, stable demo experiences for specific products.

These demos are:
- sandboxed
- polished
- deterministic
- populated with sample data or industry-specific mock data

### Best For
- flagship products
- commonly sold products
- first-call demos
- time-sensitive calls
- products where visual confidence matters most

### Advantages
- fastest to launch
- least likely to fail
- easy to polish
- easy to train reps around
- safe from random agent behavior

### Tradeoffs
- less personalized
- can feel slightly canned if overused

### Recommendation
This should be the **default foundation** of the demo strategy.

---

## 2. Runtime Mimic Demo Mode

### Definition
A controlled runtime demo engine that simulates what the chosen product would do for the current prospect.

It does not need to be the real production agent.
It only needs to produce a credible, constrained, high-value demonstration of expected behavior.

### Inputs
- current prospect data
- current analysis result
- selected product
- industry hints
- demo definition for that product
- product constraints / allowed claims

### Outputs
- simulated workflow
- tailored sample inputs and outputs
- short business narrative
- clear “what this would do for your business” framing

### Advantages
- more personalized than prebuilt demos
- can adapt to industry and prospect context
- lower operational risk than real live agents
- strong differentiator if done well

### Tradeoffs
- can drift into overclaiming if not tightly constrained
- must clearly stay within approved behaviors and outcomes

### Recommendation
This should be the **second layer** and the key differentiator.

---

## 3. Real Ephemeral Agent Launch

### Definition
Spin up a real agent session on demand and run an actual live workflow.

### Best For
- later-stage deals
- technical buyers
- internal evaluations
- proof-of-concept moments
- guided technical demos

### Advantages
- highest authenticity
- most impressive when it works
- can demonstrate true adaptability

### Tradeoffs
- highest latency
- highest operational risk
- requires guardrails, safe data, and clearer runtime management
- worst option for a fragile first-call experience

### Recommendation
This should be an **advanced mode**, not the default.

---

# Recommended User Experience

For each recommended product card, the app should eventually expose:

- **Instant Demo**
- **How It Works**
- **Run Live Variant** (optional / advanced)

## Instant Demo
Primary CTA.
The system automatically chooses the best available demo mode.

Selection logic:
1. if prebuilt demo exists → use it
2. otherwise if mimic mode available → use it
3. otherwise if real live demo is approved and supported → launch real agent
4. otherwise show a short structured walkthrough

## How It Works
A concise explainer view showing:
- inputs
- processing steps
- outputs
- business outcome

## Run Live Variant
Only shown for products where real agent runtime is safe, reliable, and commercially useful.

---

# Demo Definitions

Each product should eventually have a structured demo definition.

Example concept:

```json
{
  "product": "AI Lead Generation Engine",
  "demoMode": "prebuilt|mimic|runtime",
  "industryVariants": ["real-estate", "healthcare", "legal"],
  "sampleInputs": ["..."],
  "steps": ["..."],
  "expectedOutputs": ["..."],
  "claimsAllowed": ["..."],
  "cta": "Book technical scoping workshop"
}
```

This allows:
- repeatability
- governance
- faster scaling
- cleaner QA
- safer sales enablement

---

# Risk Map

## Major Risks
1. fake-looking demos
2. overpromising product capability
3. slow launch times in live calls
4. requiring too much input from the rep
5. raw agent unpredictability during demos

## Mitigations
- prioritize prebuilt demos
- constrain mimic mode heavily
- only allow approved claims
- use real agent launch selectively
- include graceful fallbacks if a runtime demo cannot launch quickly

---

# Versioned Rollout Plan

# V1 — Instant Demo Foundation

## Goal
Ship a practical demo layer inside the current Sunburnt Sales App that helps the sales team immediately.

## Scope
- Add **Instant Demo** buttons to recommended product cards
- Support:
  - prebuilt demos for top products
  - basic mimic mode for products without prebuilt demos
- Add a simple **How It Works** view
- Keep everything inside the existing app UX

## Deliverables
- demo orchestrator selection logic
- first batch of prebuilt demo definitions
- basic mimic engine
- clear in-product language about what is simulated vs live
- approved claims list for each demoed product

## Recommended Product Coverage for V1
Focus on the highest-value, easiest-to-demonstrate products first.
Suggested initial candidates:
- AI Lead Generation Engine
- Personalised Cold Outreach System
- Intelligent Follow-Up Engine
- Internal Knowledge Assistant
- Document Extraction Engine
- AI Customer Support System
- CRM Auto-Updater
- Sales Pipeline Intelligence Agent
- AI Proposal & Quote Generator
- Business Knowledge Unification Platform

## Success Criteria
- rep can launch a useful demo in under 5 seconds
- no setup burden beyond clicking
- demo feels credible
- top products have deterministic demo experiences

## Why V1 Matters
This gives the sales team an immediate practical advantage without the operational risk of real live agents.

---

# V2 — Industry-Aware Demo Intelligence

## Goal
Make demos feel substantially more tailored to the current prospect and industry.

## Scope
- expand mimic mode with industry variants
- build stronger data-driven demo narratives
- add guided talk tracks while the demo runs
- add objection-aware demo narration
- add recommended next-step CTA after each demo

## Deliverables
- industry-specific demo definitions
- tailored sample data packs
- dynamic talk-track generation
- better visual storytelling within the app
- “what this would look like in your business” framing

## Success Criteria
- demos feel prospect-aware, not generic
- reps speak less and show more
- prospects can clearly map the demo to their own business context

## Why V2 Matters
This is where the system becomes differentiated, not just functional.

---

# V3 — Real Live Agent Demo Layer

## Goal
Introduce true live-agent demo execution for selected products and selected deal contexts.

## Scope
- allow approved products to launch real ephemeral demo agents
- run them inside safe, demo-specific environments
- keep fallback path to mimic mode if live execution is slow or risky
- expose live status, outputs, and final summary cleanly in the UI

## Deliverables
- ephemeral demo agent launch system
- safe data handling for live demo sessions
- product-level permissions for which items can run live
- runtime monitoring and timeout/fallback logic
- optional advanced “technical buyer mode” UX

## Success Criteria
- live demo execution works reliably enough for later-stage deals
- prospects can see real adaptive behavior without sales chaos
- failure to launch does not break the call experience

## Why V3 Matters
This is the most impressive capability, but it should only be added once the safer layers are already strong.

---

# Recommended Build Order

1. build demo definitions
2. implement Instant Demo orchestration
3. ship prebuilt top-product demos
4. add mimic mode
5. add industry-aware variants
6. add guided talk tracks
7. selectively enable real live agents

---

# Final Recommendation

The correct approach is not to choose one of the three demo ideas exclusively.

The correct approach is to build a **demo orchestrator** that uses all three in a controlled progression:

- **V1:** prebuilt demos + basic mimic mode
- **V2:** industry-aware tailored mimic demos
- **V3:** selective real live agent launches

This is the safest path, the fastest path to value, and the one most likely to help sales reps win live calls.

---

# Next Suggested Documents

After this strategy doc, the next useful artifacts would be:
1. **Top 10 Product Demo Priority List**
2. **Demo Definition Spec**
3. **Allowed Claims Framework**
4. **Instant Demo UX Flow**
5. **Mimic Engine Prompt/Constraint Design**

---

# Bottom Line

Yes, this is feasible.

More importantly:
It is commercially powerful if built with the right order of operations.

Do not start with raw live agents everywhere.
Start with certainty, then personalization, then true runtime execution.
