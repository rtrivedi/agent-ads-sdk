# Checkpoint 4: Vendor Onboarding & Retention Loop

**Date:** 2026-03-14
**Status:** Approved direction, pre-implementation
**Builds on:** Checkpoints 1-3 (Vision, Queryable Listings, Smart Capabilities)

---

## The Problem

We have a powerful 3-layer system (Offer → Knowledge → Capabilities), but the vendor experience is designed around the **platform's** model, not the **vendor's** mental model. A restaurant owner, a SaaS founder, a local plumber — none of them think in terms of "queryable listings" or "declarative business logic." They think:

1. "Will this work for me?"
2. "How do I get started?"
3. "Is it working?"
4. "How do I make it work better?"

If we can't answer those four questions in that order, we lose them — no matter how good the underlying system is.

---

## The Full Vendor Journey

### Core Principle: One Page, Two Cards

The entire onboarding lives on a single page. **Card 1** gets them live. **Card 2** appears after they go live and shows them how to make agents sell better. No separate screens. No multi-step wizard. No dashboard they have to find later. The upsell is right there, in context, the moment they've committed.

---

### Card 1: Get Listed (The Form → Go Live)

One form. Everything above the fold. The vendor fills it out top to bottom, hits "Go Live," and they're done.

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  List your business on the agent internet               │
│                                                         │
│  ── YOUR BUSINESS ──────────────────────────────────    │
│                                                         │
│  Website URL                                            │
│  [ https://acme-ecommerce.com                       ]   │
│  [Analyze →]                                            │
│                                                         │
│         ↓ (auto-fills everything below)                  │
│                                                         │
│  Business Name          What You Do                     │
│  [ Acme E-Commerce  ]   [ All-in-one platform for    ]  │
│                          [ creators to launch and     ]  │
│                          [ sell physical products     ]  │
│                                                         │
│  Pricing                     Ships To                   │
│  [ $29/mo – $299/mo      ]  [ US, CA, UK            ]   │
│  [ 3 tiers, 14-day trial ]                              │
│                                                         │
│  Who's your ideal customer?                             │
│  [ Solo creators selling physical products           ]   │
│                                                         │
│  Who's NOT a good fit? (saves you money)                │
│  [ Enterprise teams, digital-only products           ]   │
│                                                         │
│  ── BUDGET ─────────────────────────────────────────    │
│                                                         │
│  Daily budget                                           │
│  [ $10 ]  [ $25 ]  [$50]  [ Custom: $__ ]              │
│                                                         │
│  You only pay when a user takes action.                 │
│  Estimated: 15-40 conversations/day at $25              │
│                                                         │
│  ── PAYMENT ────────────────────────────────────────    │
│                                                         │
│  Card: [ **** **** **** ____  ]                         │
│  Exp:  [ __/__ ]   CVC: [ ___ ]                        │
│                                                         │
│  You won't be charged until agents start                │
│  recommending you. Cancel anytime.                      │
│                                                         │
│              [ ★  Go Live  ★ ]                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**What happens underneath:**
- URL → scraper → auto-populate all fields (vendor just confirms/edits)
- "Go Live" → create campaign, activate listing, start serving to agents
- No CPC bidding — system sets bids based on category competitiveness
- No taxonomy picker, no category selector, no ad type choice

**Design rationale:** One form beats a wizard. Wizards create anxiety ("how many steps are left?") and drop-off between steps. A single form with auto-filled fields feels like confirming, not filling out. The vendor's job is to verify, not author.

---

### Card 2: Keep Going (Post-Live Enhancement)

This card appears **immediately after Go Live** — same page, scrolled into view. The vendor just committed. They're in "setup mode." This is the highest-intent moment to show them what's next.

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ✓ You're live! Agents can now recommend your business. │
│                                                         │
│  Here's what it looks like when an agent                │
│  recommends you:                                        │
│                                                         │
│  ┌───────────────────────────────────────────────┐      │
│  │ User: "I want to start selling handmade       │      │
│  │        candles online"                         │      │
│  │                                                │      │
│  │ Agent: "For handmade candles, I'd recommend    │      │
│  │  Acme. They're an all-in-one platform for      │      │
│  │  creators — plans start at $29/mo with a       │      │
│  │  14-day free trial. They ship to the US,       │      │
│  │  Canada, and UK."                              │      │
│  │                                                │      │
│  │ User: "What's their return policy?"            │      │
│  │                                                │      │
│  │ Agent: "I don't have details on Acme's         │      │
│  │  return policy. You'd need to check their      │      │
│  │  website."  ← ⚠️ This is where you lose them   │      │
│  └───────────────────────────────────────────────┘      │
│                                                         │
│  ── GIVE YOUR AGENT MORE TO WORK WITH ──────────────    │
│                                                         │
│  Right now, agents can only say what's on your          │
│  website. Help them close the deal:                     │
│                                                         │
│  ┌─────────────────────────────────────────────┐        │
│  │  📄 Upload Documents                         │        │
│  │  FAQ, pricing details, return policy,        │        │
│  │  case studies — anything a salesperson        │        │
│  │  would want to know.                         │        │
│  │                                              │        │
│  │  [Upload Files →]   or  [Paste Text →]       │        │
│  └─────────────────────────────────────────────┘        │
│                                                         │
│  ┌─────────────────────────────────────────────┐        │
│  │  🔧 Add Smart Capabilities                   │        │
│  │  Let agents calculate quotes, check          │        │
│  │  availability, or book appointments           │        │
│  │  on your behalf.                              │        │
│  │                                              │        │
│  │  [Add Pricing Calculator →]                  │        │
│  │  [Connect Booking System →]                  │        │
│  │  [Add Custom Capability →]                   │        │
│  └─────────────────────────────────────────────┘        │
│                                                         │
│  ┌─────────────────────────────────────────────┐        │
│  │  🎯 Set Conversation Triggers                │        │
│  │  Tell us when agents should recommend you    │        │
│  │  and when they shouldn't.                    │        │
│  │                                              │        │
│  │  [Set Up Triggers →]                         │        │
│  └─────────────────────────────────────────────┘        │
│                                                         │
│  Skip this for now? No problem — we'll show you         │
│  exactly what questions agents can't answer in           │
│  your dashboard, so you'll know what to add first.      │
│                                                         │
│  [Go to Dashboard →]                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Why this works:**
1. **The preview sells the problem.** The synthetic conversation deliberately includes a moment where the agent can't answer — the vendor sees exactly what happens when agents don't have enough info. It's not hypothetical. It's visceral.
2. **The enhancements solve the problem they just saw.** "Upload your return policy" is no longer an abstract feature — it's the fix for what they literally just watched fail.
3. **Same page = no drop-off.** They don't have to navigate to a settings page or remember to come back. The upsell is 200px below the button they just clicked.
4. **"Skip" is graceful, not dead-end.** The skip message promises the dashboard will tell them what to add — this is the bridge to the retention loop.

---

### The Dashboard (Retention Engine)

The dashboard exists for vendors who skipped Card 2 or who come back after their first week. It serves the same purpose — surface what agents can't answer and offer specific fixes — but now backed by real data instead of synthetic previews.

#### Conversation Feed: What Agents Said About You

```
┌─────────────────────────────────────────────────────┐
│  This Week: 142 conversations mentioned you          │
│                                                      │
│  Recent Agent Conversations                          │
│  ─────────────────────────────                       │
│                                                      │
│  ✅ "Acme is great for solo creators. Plans          │
│      start at $29/mo with a 14-day trial."           │
│     → User clicked through (revenue: $0.85)          │
│                                                      │
│  ✅ "For physical products, Acme handles             │
│      shipping to US, CA, and UK..."                   │
│     → User asked follow-up about pricing              │
│                                                      │
│  ⚠️ "I don't have enough information about            │
│      Acme's return policy to answer that."            │
│     → User moved on to competitor                     │
│                                                      │
│  ❌ "I'm not sure if Acme integrates with             │
│      Etsy — let me check..."                          │
│     → Agent couldn't confirm, user left               │
│                                                      │
│  [View All Conversations →]                           │
└──────────────────────────────────────────────────────┘
```

#### Questions Agents Couldn't Answer

```
┌─────────────────────────────────────────────────────┐
│  Top Unanswered Questions This Week                  │
│  ──────────────────────────────────                  │
│                                                      │
│  23x  "What's the return/refund policy?"             │
│        [Upload Return Policy →]                      │
│                                                      │
│  18x  "How much would it cost for [specific config]?"│
│        [Add Pricing Calculator →]                    │
│                                                      │
│  14x  "Do you integrate with [specific tool]?"       │
│        [Upload Integrations List →]                  │
│                                                      │
│  9x   "Can I see examples of stores built on Acme?"  │
│        [Upload Case Studies →]                        │
│                                                      │
│  Fixing the top 2 could increase your conversion     │
│  rate by an estimated 30-45%.                         │
└──────────────────────────────────────────────────────┘
```

**The growth loop:** More conversations → more unanswered questions → vendor uploads docs / adds capabilities → agents give better answers → more conversions → vendor stays and invests more.

**The key insight:** The ⚠️ and ❌ items aren't status indicators — they're upsell triggers. Each one maps to a specific action. The vendor isn't buying features, they're plugging gaps they can see in their own data.

| What the vendor sees | What's actually happening |
|---|---|
| "Upload your FAQ" | Adding a document to Layer 2 (Knowledge) |
| "Add a pricing calculator" | Creating a capability in Layer 3 (Smart Capabilities) |
| "Connect your booking API" | Registering a service endpoint in Layer 3 |
| "Upload case studies" | Adding documents to Layer 2 |

The 3-layer architecture is invisible. The vendor only sees: "agents couldn't answer this → here's how to fix it."

---

## Key Design Decisions

### 1. Why One Page with Two Cards (Not a Multi-Step Wizard)

**Rejected approach:** Multi-screen wizard (Screen 1 → 2 → 3 → 4)
- Every transition is a drop-off opportunity
- Creates "how many steps are left?" anxiety
- Separates the action (Go Live) from the upsell (enhancements)

**Chosen approach:** Single page, two cards
- Card 1 is a form the vendor confirms (not fills out — fields are auto-populated)
- Card 2 appears in-context the moment they go live
- No navigation, no separate settings page, no "come back later"
- The vendor is in setup mode — meet them there

### 2. Why the Preview Deliberately Shows a Failure

**Option A (rejected):** Happy-path preview (agent answers everything perfectly)
- Feels good but doesn't motivate action
- Vendor thinks "great, we're done" and never uploads docs

**Option B (chosen):** Preview shows agent hitting a wall
- Vendor sees the exact moment they'd lose a customer
- Creates immediate emotional response: "I need to fix that"
- The enhancements below the preview become the obvious fix
- Turns Card 2 from "nice to have" into "I should do this now"

### 3. Why No Bid Amounts in Onboarding

**Rejected approach:** Let vendors set CPC bids
- They have no context for what a bid should be
- Creates decision paralysis and bad outcomes

**Chosen approach:** Daily budget only, system sets bids
- Vendor controls spend, system optimizes delivery
- Can expose bid controls later for sophisticated advertisers

### 4. Why "Questions Agents Couldn't Answer" Is the Core Dashboard Metric

**Rejected metrics:**
- Impressions (vanity, doesn't drive action)
- Click-through rate (too abstract for non-marketers)
- Cost per click (only meaningful with comparison data)

**Chosen metric:** Unanswered questions
- Immediately actionable ("upload your FAQ to fix this")
- Creates natural upsell path (Layer 2 → Layer 3)
- Vendors intuitively understand "agents couldn't help my customer"
- Every unanswered question is a lost customer — that's emotional

---

## Implementation Sequence

### Sprint 1: Card 1 (Get Live Form)
- URL scraper → auto-populate all fields
- Budget selection (preset amounts + custom)
- Payment integration (Stripe)
- Campaign creation on submit
- Single-page form with sections (Business → Budget → Payment → Go Live)

### Sprint 2: Card 2 (Post-Live Enhancements)
- Synthetic conversation generator using Layer 1 data
- Deliberately include one unanswered-question moment in preview
- Document upload flow (drag-and-drop + paste text)
- Capability creation stubs (pricing calculator, booking, custom)
- Trigger configuration UI

### Sprint 3: Dashboard — Conversation Feed
- Capture agent conversation snippets (anonymized)
- Tag conversations: ✅ answered, ⚠️ partial, ❌ couldn't answer
- Display in feed format with revenue per conversation

### Sprint 4: Dashboard — Unanswered Questions & Nudges
- Aggregate "couldn't answer" patterns across conversations
- Cluster similar questions (NLP deduplication)
- Map each cluster to a specific action (upload doc, add capability, connect API)
- Show estimated impact ("fixing this could increase conversions by X%")
- One-click flows: suggestion → upload/configure → immediately active

---

## Metrics That Matter

### Onboarding
- **Time to live:** Target < 5 minutes (URL paste to live preview)
- **Drop-off per screen:** Track where vendors abandon
- **Preview engagement:** Do vendors read the preview? Edit their listing after?

### Retention
- **Dashboard return rate:** How often vendors check their dashboard
- **Doc upload rate:** % of vendors who upload at least one document (Layer 2)
- **Capability creation rate:** % of vendors who add at least one capability (Layer 3)
- **Unanswered-question-to-action rate:** When we suggest uploading a doc, how often do they?

### Revenue
- **Vendor lifetime value:** Total spend over time
- **Layer adoption → spend correlation:** Do vendors who add docs spend more? (Hypothesis: yes, because better answers → better conversion → higher ROI → higher budgets)

---

## What This Checkpoint Does NOT Cover

1. **Agent-side SDK changes** — This is purely the vendor-facing experience
2. **Auction mechanics** — Bidding logic stays as designed in earlier checkpoints
3. **Agent conversation capture** — Assumes we can log anonymized conversation snippets (needs privacy review)
4. **Billing system implementation** — Assumes Stripe integration (standard, well-documented)
5. **Multi-user vendor accounts** — v1 is single-user per listing

---

## Summary

The vendor journey is now:

```
CARD 1: GET LIVE              CARD 2: KEEP GOING            DASHBOARD (later)
──────────────────            ─────────────────             ─────────────────
Paste URL                     See preview (with gap!)       Real conversation data
Confirm auto-filled fields    Upload docs                   Unanswered questions
Set daily budget              Add capabilities              Specific fix suggestions
Add payment                   Set triggers                  Impact estimates
  ↓                             ↓                             ↓
[ ★ Go Live ★ ]              "Skip for now? We'll           Organic upsell via
                               show you what to add          vendor's own data
                               in your dashboard."
```

**One page. Two cards.** Card 1 is a form they confirm. Card 2 is the upsell that appears in-context the moment they commit. The preview deliberately shows an agent failing — so the enhancements below it feel like obvious fixes, not optional features. The dashboard catches anyone who skipped Card 2 and uses real data to drive the same actions.
