# Mimic Engine Design

## Purpose
This document defines the design of the **Mimic Engine** for the Sunburnt Sales App.

The Mimic Engine is the system responsible for generating a tailored, controlled, commercially useful simulation of a product demo when a prebuilt deterministic demo is not available.

It exists to bridge the gap between:
- static prebuilt demos
- and fully live ephemeral agents

The Mimic Engine should make the app feel adaptive and intelligent without inheriting the full risk of raw live agent execution.

---

# Core Definition

## What the Mimic Engine is
A constrained demo-generation layer that uses:
- prospect analysis
- selected product
- product demo definition
- industry context
- approved claims
- safe sample data

to create a simulated but credible demo experience.

## What the Mimic Engine is not
It is not:
- a raw unsupervised live agent
- a freeform chatbot improvising features
- a system allowed to invent integrations or capabilities
- a replacement for real product delivery

The Mimic Engine should be treated as a **sales simulation system**, not a production automation runtime.

---

# Business Objective

The Mimic Engine should answer this question:

> “If this product were applied to this prospect, what would a believable live demonstration look like right now?”

It should do that in a way that is:
- fast
- prospect-relevant
- visually useful
- commercially persuasive
- governed by product truth

---

# Why It Matters

Prebuilt demos are strong but limited.
Real runtime agents are powerful but risky.

The Mimic Engine gives Sunburnt AI a middle layer that is:
- more tailored than a static demo
- safer than live execution
- more scalable than manually building every demo variant

This is likely the key differentiator in the demo stack.

---

# Inputs

The Mimic Engine should operate on a structured input bundle.

## Required Inputs
1. **Prospect context**
   - company name
   - industry
   - inferred pain points
   - business snapshot
   - website summary

2. **Selected product**
   - product ID
   - product name
   - product category
   - expected value narrative

3. **Demo definition**
   - allowed modes
   - demo steps
   - expected outputs
   - claims allowed
   - claims blocked
   - CTA

4. **Industry context**
   - terminology
   - relevant pain points
   - typical workflows
   - common objections

5. **Safe sample data pack**
   - fake but plausible data
   - industry-specific mock artifacts
   - example documents/messages/records as appropriate

---

# Outputs

The Mimic Engine should produce a structured demo object, not loose text.

Recommended logical output:

```json
{
  "product": "string",
  "mode": "mimic",
  "prospectFitNarrative": "string",
  "workflowSteps": ["string"],
  "demoInputs": ["string"],
  "demoOutputs": ["string"],
  "valueNarrative": "string",
  "repTalkTrack": ["string"],
  "cta": "string",
  "claimsUsed": ["string"],
  "confidenceNotes": ["string"]
}
```

This output can then be rendered into the Instant Demo UI.

---

# Core Engine Responsibilities

## 1. Tailor the demo to the prospect
Use current analysis to align the demo with:
- industry
- likely business model
- likely pain points
- likely buyer interest

## 2. Stay within product truth
The engine must only simulate capabilities that are approved for the chosen product.

## 3. Use safe believable artifacts
If showing documents, messages, leads, tickets, or pipeline entries, these should be:
- synthetic
- clean
- plausible
- relevant to the industry

## 4. Produce commercial clarity
The output should help the rep tell a story, not just display mechanics.

---

# Design Constraints

## Constraint 1 — No capability invention
The Mimic Engine must not fabricate:
- integrations that do not exist
- automation depth that has not been approved
- guaranteed outcomes
- unsupported behaviors

## Constraint 2 — Claims governance required
All generated demo narratives must be filtered through the Allowed Claims Framework.

## Constraint 3 — Fast execution
The Mimic Engine must launch quickly enough for live calls.

Target:
- ideally under 2–4 seconds after click

## Constraint 4 — Fallback available
If a tailored mimic experience cannot be produced cleanly, the app should fall back to:
- prebuilt generic variant
- or structured walkthrough mode

---

# Architectural Components

## 1. Demo Definition Layer
Defines what each product is allowed to demonstrate.

## 2. Prospect Context Layer
Supplies the current analysis and prospect-specific business framing.

## 3. Data Pack Layer
Provides mock but plausible artifacts for the selected industry.

Examples:
- support tickets
- CRM records
- documents
- pipeline entries
- internal knowledge snippets
- quote requests

## 4. Mimic Generation Layer
Builds the tailored simulation object.

## 5. Claims Filter Layer
Checks all generated content against approved claims.

## 6. UI Rendering Layer
Turns the structured output into a clean interactive demo.

---

# Suggested Internal Workflow

## Step 1 — Product selected
Rep clicks **Instant Demo**.

## Step 2 — Orchestrator checks mode availability
If no prebuilt demo is available, choose mimic mode.

## Step 3 — Assemble input bundle
System combines:
- product definition
- prospect analysis
- industry playbook
- sample data pack
- allowed claims set

## Step 4 — Generate mimic demo object
The engine creates:
- workflow sequence
- tailored example outputs
- value framing
- rep talk track
- CTA

## Step 5 — Claims filtering
Any risky claims are blocked, downgraded, or rewritten.

## Step 6 — Render in Instant Demo UI
Prospect sees a smooth tailored demonstration.

---

# Industry Tailoring Strategy

The Mimic Engine should not invent from scratch each time.
It should tailor from structured patterns.

## Pattern
- start with base product demo definition
- apply industry variant rules
- inject prospect-specific framing
- apply safe sample data
- produce final tailored demo

This is more reliable than unconstrained generation.

---

# Example

## Product
AI Customer Support System

## Prospect
Mid-size property management business

## Mimic Engine could generate
- sample tenant inquiries
- AI responses for common requests
- escalation for urgent maintenance issue
- explanation of reduced communication overhead
- CTA toward a tenant-communications deployment workshop

This feels tailored without needing a real live tenant data environment.

---

# Talk Track Support

The Mimic Engine should also generate rep-support language.

Examples:
- “What you’re seeing here is how routine requests get handled instantly while edge cases escalate.”
- “In your environment, this would reduce the load on your admin team and improve tenant response consistency.”

This reduces rep cognitive load during the call.

---

# Failure Handling

If mimic generation fails or confidence is weak:
- use a generic product demo variant
- reduce tailoring claims
- show a structured walkthrough instead

Never dump raw generation failure into the rep-facing UI.

---

# Evaluation Criteria

A strong Mimic Engine should be judged on:
1. launch speed
2. prospect relevance
3. credibility
4. commercial usefulness
5. claims safety
6. visual usefulness
7. fallback quality

---

# V1 Mimic Engine

## Scope
- supports a limited set of products
- basic prospect-tailored narrative
- uses structured sample data packs
- constrained output format
- strict claims filtering

## Goal
Be useful and safe, not fully magical.

---

# V2 Mimic Engine

## Scope
- stronger industry tailoring
- richer output artifacts
- better talk track generation
- stronger CTA alignment
- more product coverage

## Goal
Make demos feel significantly more personalized and impressive.

---

# V3 Mimic Engine Relationship to Live Runtime

By V3, the Mimic Engine becomes the safety and fallback layer for real live demos.

Flow:
- attempt live runtime where appropriate
- if unavailable or risky, fall back to mimic seamlessly

This makes the entire demo platform more reliable.

---

# Final Recommendation

The Mimic Engine should be built as a governed simulation system.

It should not try to be fully autonomous.
It should try to be:
- tailored enough to feel impressive
- constrained enough to stay trustworthy
- fast enough to help sales reps in real calls

If built well, this becomes one of the strongest parts of the entire demo strategy.
