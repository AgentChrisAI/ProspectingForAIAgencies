# Demo Definition Spec

## Purpose
This document defines the standard structure for a Sunburnt AI product demo.

A demo definition is the core artifact that allows the Sunburnt Sales App to launch a reliable, governed, low-friction demo for a recommended product.

This spec exists to make demos:
- repeatable
- scalable
- safe
- easy to QA
- easy to improve over time

---

# Why This Exists

If demo experiences are built ad hoc, they become inconsistent and risky.

A demo definition gives each product a structured contract covering:
- what is being shown
- how it is shown
- what claims are allowed
- what outputs are expected
- when to use prebuilt, mimic, or live runtime modes

---

# Core Principles

Each demo definition must be:
1. **commercially useful** — built for winning calls, not technical novelty
2. **constrained** — only approved capabilities and claims are shown
3. **clear** — easy for reps and prospects to follow
4. **fast** — low-friction launch
5. **extensible** — supports future industry variants and live runtime options

---

# Required Fields

Below is the recommended logical schema.

```json
{
  "productName": "string",
  "productId": "string",
  "priorityTier": "A|B|C",
  "demoModes": ["prebuilt", "mimic", "runtime"],
  "defaultDemoMode": "prebuilt|mimic|runtime",
  "status": "draft|ready|deprecated",
  "summary": "string",
  "goal": "string",
  "idealUseCases": ["string"],
  "industries": ["string"],
  "personas": ["string"],
  "painPoints": ["string"],
  "sampleInputs": ["string"],
  "demoSteps": ["string"],
  "expectedOutputs": ["string"],
  "valueMoments": ["string"],
  "talkTrack": ["string"],
  "claimsAllowed": ["string"],
  "claimsBlocked": ["string"],
  "fallbackBehavior": "string",
  "successCriteria": ["string"],
  "cta": "string"
}
```

---

# Field Definitions

## productName
Human-readable product name.

## productId
Internal ID matching catalogue or app conventions.

## priorityTier
Indicates commercial and roadmap priority.

## demoModes
Allowed demo modes for this product.

## defaultDemoMode
Which mode is launched first when the rep clicks **Instant Demo**.

## status
Controls whether the demo is launchable.

## summary
Short description of what the demo represents.

## goal
The commercial purpose of the demo.
Example:
- show speed to value
- reduce skepticism
- prove relevance to the prospect’s workflow

## idealUseCases
Business situations where the demo is strongest.

## industries
Supported industry variants.

## personas
Stakeholder types this demo resonates with.
Examples:
- sales manager
- founder
- operations leader
- customer support lead

## painPoints
Key pains this demo is intended to illustrate.

## sampleInputs
What the demo consumes.
Examples:
- prospect profile
- support tickets
- PDFs
- sales pipeline notes

## demoSteps
Ordered sequence of what the demo shows.

## expectedOutputs
What should be visibly produced during the demo.

## valueMoments
Critical “wow” beats the demo should land.

## talkTrack
Suggested supporting narrative while the demo runs.

## claimsAllowed
Statements the system is permitted to imply or say.

## claimsBlocked
Statements the system must never imply or say.

## fallbackBehavior
What to do if the preferred demo mode is unavailable.

## successCriteria
What must be true for the demo to be considered successful.

## cta
Preferred next step after the demo.

---

# Mode-Specific Requirements

## Prebuilt Demo Requirements
A prebuilt demo definition should include:
- fixed scenario
- fixed sample inputs
- deterministic outputs
- short launch time
- one primary value narrative

## Mimic Demo Requirements
A mimic demo definition should additionally include:
- tailoring rules
- industry mappings
- substitution logic for prospect context
- stricter claims governance

## Runtime Demo Requirements
A runtime demo definition should additionally include:
- runtime eligibility rules
- safe data constraints
- timeout/fallback behavior
- operator controls

---

# UX Requirements

Every demo definition should support three visible user outcomes:
1. **Instant Demo**
2. **How It Works**
3. **Next Step / CTA**

The rep should not need to invent the narrative manually.
The definition should carry enough structure to support guided execution.

---

# Example Demo Definition

```json
{
  "productName": "Internal Knowledge Assistant",
  "productId": "T1-005",
  "priorityTier": "A",
  "demoModes": ["prebuilt", "mimic", "runtime"],
  "defaultDemoMode": "prebuilt",
  "status": "ready",
  "summary": "Answers internal business questions from company knowledge.",
  "goal": "Show how scattered knowledge becomes instantly accessible.",
  "idealUseCases": [
    "Teams repeatedly ask the same questions",
    "Documents and processes are spread across tools"
  ],
  "industries": ["general", "legal", "healthcare", "accounting"],
  "personas": ["operations leader", "founder", "department head"],
  "painPoints": [
    "Information is scattered everywhere",
    "People depend on specific staff to answer common questions"
  ],
  "sampleInputs": [
    "policy document",
    "SOP",
    "client FAQ",
    "process checklist"
  ],
  "demoSteps": [
    "Show fragmented sources",
    "Ask business question",
    "Surface answer with context",
    "Show how this reduces delays"
  ],
  "expectedOutputs": [
    "clear answer",
    "source-backed response",
    "follow-up action or clarification prompt"
  ],
  "valueMoments": [
    "instant answer retrieval",
    "less dependency on internal gatekeepers"
  ],
  "talkTrack": [
    "This is what your team stops wasting time on.",
    "Instead of hunting through five systems, the answer is here immediately."
  ],
  "claimsAllowed": [
    "reduces time spent searching for information",
    "gives teams faster access to internal knowledge"
  ],
  "claimsBlocked": [
    "guarantees perfect answers in every case",
    "replaces all internal staff judgment"
  ],
  "fallbackBehavior": "If prebuilt demo is unavailable, launch mimic mode with sample knowledge queries.",
  "successCriteria": [
    "prospect understands the use case in under 60 seconds",
    "demo shows clear input-to-answer flow"
  ],
  "cta": "Offer a scoped knowledge-layer workshop using their real document landscape."
}
```

---

# QA Checklist for Demo Definitions

Before a demo definition is approved, verify:
- the flow is clear
- the business value is obvious
- the claims are controlled
- the output is visually meaningful
- the fallback path exists
- the CTA aligns with the sales motion

---

# Final Recommendation

Treat demo definitions as first-class product assets.

A strong demo system is not just UI.
It is a governed library of reusable commercial experiences.

Without a definition spec, the demo layer will become inconsistent.
With it, the system can scale safely and improve over time.
