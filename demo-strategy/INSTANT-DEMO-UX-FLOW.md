# Instant Demo UX Flow

## Purpose
This document defines the ideal user experience for **Instant Demo** inside the Sunburnt Sales App.

The objective is to let a sales rep move from:
- prospect analysis
- to recommended product
- to live demo

with near-zero manual input and minimal risk.

The Instant Demo experience must be:
- fast
- obvious
- low-friction
- commercially persuasive
- safe from runtime chaos

---

# Core UX Goal

When a prospect asks, “Can you show me what that looks like?”

the rep should be able to click **Instant Demo** and immediately show something useful.

The rep should not need to:
- configure settings
- choose from too many technical options
- explain system internals
- manually compose prompts
- wait through confusing setup flows

The product should choose the best available path automatically.

---

# Primary UX Principle

## One Click First, Complexity Later

The main call-to-action should always be:
- **Instant Demo**

That CTA should trigger the best demo mode automatically.

Advanced options may exist, but must not burden the default rep flow.

---

# Core User Journey

## Step 1 — Prospect Analysis Complete
The sales rep finishes the prospect analysis workflow.

The app produces:
- recommended products
- recommended stack
- rationale
- pain points
- ROI talk tracks
- objections and rebuttals

At this point the app should present actionable demo opportunities.

---

## Step 2 — Product Cards Display Demo Entry Point
Each recommended product card should include:
- **Instant Demo** (primary CTA)
- **How It Works** (secondary CTA)
- **Run Live Variant** (optional advanced CTA)

### Recommended button hierarchy
**Primary**
- Instant Demo

**Secondary**
- How It Works

**Tertiary / optional**
- Run Live Variant

The rep should never have to choose a technical demo mode before clicking.

---

## Step 3 — Orchestrator Selects Demo Mode
When the rep clicks **Instant Demo**, the app should evaluate the product and context.

Recommended decision tree:
1. if prebuilt demo exists → launch prebuilt demo
2. else if mimic demo exists → launch mimic demo
3. else if live runtime demo is approved and available → launch runtime demo
4. else → show structured walkthrough fallback

This decision should happen behind the scenes.

The rep should feel like the system simply “opened the demo.”

---

# UX States

## State A — Demo Launching
The launch experience should feel intentional, not like dead wait time.

### Launch panel should show
- product name
- short value statement
- chosen demo mode label (optional, lightweight)
- short loading phrase, e.g.:
  - “Preparing demo…”
  - “Tailoring workflow to this prospect…”
  - “Loading sample business context…”

### UX rule
Do not expose unnecessary technical internals.

The rep does not need to see:
- prompt assembly
- agent orchestration details
- tool/runtime mechanics

---

## State B — Demo Running
Once launched, the demo should present a clean guided experience.

Recommended structure:
1. **Context header**
2. **Workflow view**
3. **Outputs view**
4. **Value narrative**
5. **Next-step CTA**

---

# Recommended Demo Layout

## 1. Context Header
Displays:
- product name
- short one-line explanation
- why this product is relevant for the current prospect

Example:
> AI Lead Generation Engine
> Built for identifying and prioritizing the best-fit leads.
> This is relevant because the prospect appears to rely on outbound growth and likely suffers from lead qualification inefficiency.

---

## 2. Workflow View
Shows the process in a simplified, visually digestible sequence.

Examples:
- ingest → classify → enrich → output
- receive query → search knowledge → answer → escalate
- upload document → extract fields → structure → route

The workflow should feel live, even if partially simulated.

---

## 3. Outputs View
This is the “show me something real” section.

Depending on the product, show:
- generated outreach
- extracted fields
- support responses
- prioritized leads
- risk flags
- draft proposals
- recommended next actions

This section must be visually concrete.

---

## 4. Value Narrative
Short text block explaining:
- what just happened
- why it matters
- what business pain it removes

This should support the rep during the call.

Example:
> Instead of manually sorting low-quality leads, this system narrows attention to the highest-probability opportunities and prepares outreach that is specific to the buyer context.

---

## 5. Next-Step CTA
Every demo should end with a sales-forward transition.

Examples:
- “Want to see this applied to your actual workflow?”
- “Next step: scoped technical workshop”
- “Next step: use your real documents and systems”

This keeps the demo commercially useful.

---

# Secondary UX: How It Works

This should be a lighter-weight non-live explanation mode.

Used when:
- the rep wants to explain before demoing
- the prospect wants structure first
- the demo cannot be run live

Should show:
- inputs
- process steps
- outputs
- expected value

This is the safest fallback explainer view.

---

# Advanced UX: Run Live Variant

This should not be prominent by default.

Use when:
- buyer is technical
- confidence level is high
- product supports safe runtime execution
- the rep explicitly wants a live run

The UI must warn clearly if a live run is:
- slower
- more variable
- dependent on available data/context

---

# Rep Burden Rules

The Instant Demo experience should require almost no rep effort.

## What the rep should ideally not do
- choose a demo mode manually
- choose data sources manually
- paste prompts
- explain caveats before anything happens
- recover from runtime complexity

## What the rep may optionally do
- expand detail
- switch from Instant Demo to How It Works
- trigger Run Live Variant if appropriate

---

# Demo Mode Messaging

The system can expose demo mode lightly, but it should not dominate the UX.

Recommended language:
- “Instant Demo”
- “Tailored Demo”
- “Live Variant”

Avoid language like:
- “spawn mimic runtime session”
- “prebuilt deterministic simulation asset”
- “ephemeral orchestration flow”

That is builder language, not sales language.

---

# Fallback UX

If a demo cannot be launched cleanly, the app must degrade gracefully.

## Fallback order
1. prebuilt demo
2. mimic demo
3. structured walkthrough
4. short explanation card with CTA

## Never do this
- show raw error stack
- expose broken orchestration internals
- leave the rep in a dead state on a live call

## Good fallback language
- “Live demo unavailable right now. Here’s the exact workflow and output you’d expect.”
- “Showing guided demo mode instead.”

---

# Recommended UX Sequence for V1

## V1 Instant Demo Flow
1. rep clicks **Instant Demo**
2. app opens modal/panel
3. app launches prebuilt demo if available, otherwise mimic demo
4. demo displays:
   - context header
   - workflow
   - output example
   - value narrative
   - next-step CTA

No live agent launch by default.

---

# Recommended UX Sequence for V2

## V2 Tailored Demo Flow
1. click Instant Demo
2. app tailors scenario to industry + prospect analysis
3. workflow and outputs are customized
4. rep gets guided talk track assistance
5. CTA is customized to likely sales motion

---

# Recommended UX Sequence for V3

## V3 Live Variant Flow
1. click Instant Demo or Run Live Variant
2. app checks whether runtime demo is safe and supported
3. launches ephemeral live demo agent
4. if runtime is too slow or unstable, app falls back automatically
5. rep still gets a usable demo outcome

---

# UX Success Criteria

A strong Instant Demo UX should achieve the following:
- rep can launch a demo in under 5 seconds
- prospect understands the workflow quickly
- output feels relevant and concrete
- rep does not need to improvise the explanation
- failures degrade cleanly
- demo naturally transitions to next-step CTA

---

# Final Recommendation

Instant Demo should feel like a commercial weapon, not a technical tool.

The sales rep should experience it as:
- click
- show value
- move conversation forward

The complexity belongs behind the curtain.
