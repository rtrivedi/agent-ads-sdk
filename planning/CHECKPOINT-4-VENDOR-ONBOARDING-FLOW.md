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

### Phase 1: Get Live (< 5 minutes)

The goal is **time to first impression**. Every second between "I'm interested" and "agents are recommending me" is a second they might leave. Three screens. No optional steps. No "you can also..." sidebars.

#### Screen 1: Your Business

```
┌─────────────────────────────────────────────────────┐
│  Paste your website URL                             │
│  [ https://example.com                          ]   │
│                                                     │
│  [Analyze My Business →]                            │
└─────────────────────────────────────────────────────┘

          ↓ (2-3 seconds, show progress animation)

┌─────────────────────────────────────────────────────┐
│  Here's what we found:                              │
│                                                     │
│  Business: Acme E-Commerce Platform                 │
│  What you do: All-in-one platform for creators      │
│    to launch and sell physical products online       │
│  Pricing: $29/mo – $299/mo (3 tiers, 14-day trial) │
│  Ships to: US, CA, UK                               │
│                                                     │
│  ✏️ [Edit anything that's wrong]                     │
│                                                     │
│  Two quick questions to help agents find your        │
│  best customers:                                     │
│                                                     │
│  Who's your ideal customer?                          │
│  [ Solo creators selling physical products       ]   │
│                                                     │
│  Who's NOT a good fit? (saves you money)             │
│  [ Enterprise teams, digital-only products       ]   │
│                                                     │
│  [Looks Good →]                                      │
└─────────────────────────────────────────────────────┘
```

**What happens underneath:** URL → scraper → auto-generate Layer 1 (The Offer). The two free-text fields seed targeting signals. No taxonomy picker, no category selector, no ad type choice.

#### Screen 2: Budget

```
┌─────────────────────────────────────────────────────┐
│  Set your daily budget                               │
│                                                      │
│  How much do you want to spend per day?              │
│                                                      │
│     [ $10 ]  [ $25 ]  [$50]  [ Custom: $__ ]        │
│                                                      │
│  You only pay when a user takes action.              │
│  Estimated: 15-40 conversations/day at $25           │
│                                                      │
│  [Continue →]                                        │
└──────────────────────────────────────────────────────┘
```

**No CPC bidding.** No bid strategy. No "optimize for clicks vs. conversions." We set the bid internally based on category competitiveness. The vendor picks a daily spend. That's it.

#### Screen 3: Payment

```
┌─────────────────────────────────────────────────────┐
│  Add a payment method                                │
│                                                      │
│  [Credit Card]  [Invoice]                            │
│                                                      │
│  Card: [ **** **** **** ____  ]                      │
│  Exp:  [ __/__ ]  CVC: [ ___ ]                       │
│                                                      │
│  You won't be charged until agents start              │
│  recommending you. Cancel anytime.                    │
│                                                      │
│  [Go Live →]                                         │
└──────────────────────────────────────────────────────┘
```

#### Screen 4: Live Preview (The Aha Moment)

This is the screen that converts "I signed up" into "I get it."

```
┌─────────────────────────────────────────────────────┐
│  🎉  You're live! Here's what it looks like:         │
│                                                      │
│  ┌───────────────────────────────────────────┐       │
│  │ User: "I want to start selling handmade   │       │
│  │        candles online"                     │       │
│  │                                            │       │
│  │ Agent: "For handmade candles, I'd          │       │
│  │  recommend looking at Acme. They're an     │       │
│  │  all-in-one platform for creators selling  │       │
│  │  physical products — plans start at $29/mo │       │
│  │  with a 14-day free trial. They handle     │       │
│  │  shipping to the US, Canada, and UK."      │       │
│  │                                            │       │
│  │ User: "That sounds perfect, how do I       │       │
│  │        sign up?"                            │       │
│  │                                            │       │
│  │ Agent: "Here's the link: [Acme Free Trial] │       │
│  │  — you can start selling in about 15       │       │
│  │  minutes."                                  │       │
│  └───────────────────────────────────────────┘       │
│                                                      │
│  This is a real example of how AI agents will         │
│  recommend your business in conversations.            │
│                                                      │
│  Want agents to say more? You can upload docs,        │
│  connect APIs, and add capabilities anytime from      │
│  your dashboard.                                      │
│                                                      │
│  [Go to Dashboard →]                                  │
└──────────────────────────────────────────────────────┘
```

**Why this matters:** Vendors selling to humans understand websites, ads, and storefronts because they can see them. Agent recommendations are invisible — the vendor has no idea what agents are saying or how their product shows up. This preview makes the abstract concrete. It's also validation: if the preview sounds wrong, the vendor knows to edit their listing before real conversations happen.

**Implementation:** Generate 2-3 synthetic conversations using the vendor's Layer 1 data. Show the most compelling one. Optionally let them click through others.

---

### Phase 2: The Dashboard (Retention Engine)

The dashboard isn't analytics — it's a **coaching tool** that drives organic adoption of Layers 2 and 3 without us having to sell them.

#### 2A: What Agents Said About You

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
│  ⚠️ "Acme's pricing page shows 3 tiers but I'm       │
│      not sure which includes API access."             │
│     → User asked to compare with competitor           │
│                                                      │
│  ❌ "I'm not sure if Acme integrates with             │
│      Etsy — let me check..."                          │
│     → Agent couldn't confirm, user left               │
│                                                      │
│  [View All Conversations →]                           │
└──────────────────────────────────────────────────────┘
```

**The killer insight:** The ⚠️ and ❌ items are not just status indicators — they're upsell triggers. Each one maps directly to a specific action the vendor can take:

- "Agents can't answer return policy questions" → **Upload your FAQ** (Layer 2)
- "Agents can't calculate pricing for specific configs" → **Add a quote calculator** (Layer 3)
- "Agents can't confirm integration support" → **Upload your integrations doc** (Layer 2)

The vendor isn't buying features. They're plugging gaps they can see.

#### 2B: Questions Agents Couldn't Answer

```
┌─────────────────────────────────────────────────────┐
│  Top Unanswered Questions This Week                  │
│  ──────────────────────────────────                  │
│                                                      │
│  23x  "What's the return/refund policy?"             │
│        → Upload your returns policy                  │
│           [Add Document →]                           │
│                                                      │
│  18x  "How much would it cost for [specific config]?"│
│        → Add a pricing calculator                    │
│           [Add Capability →]                         │
│                                                      │
│  14x  "Do you integrate with [specific tool]?"       │
│        → Upload your integrations list               │
│           [Add Document →]                           │
│                                                      │
│  9x   "Can I see examples of stores built on Acme?"  │
│        → Upload case studies or portfolio             │
│           [Add Document →]                           │
│                                                      │
│  Fixing these could increase your conversion          │
│  rate by an estimated 30-45%.                         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**This is the growth loop:** More conversations → more unanswered questions → vendor uploads docs → agents give better answers → more conversions → vendor stays and invests more.

#### 2C: Suggested Next Steps

```
┌─────────────────────────────────────────────────────┐
│  Recommended Improvements                            │
│  ────────────────────────                            │
│                                                      │
│  🔴 High Impact                                      │
│  Upload your pricing details                         │
│  "18 users asked about custom pricing this week       │
│   and agents couldn't give a specific answer."        │
│  [Upload Pricing Doc →]                               │
│                                                      │
│  🟡 Medium Impact                                     │
│  Add your FAQ                                         │
│  "Agents answered 71% of questions correctly.         │
│   Adding your FAQ could push this above 90%."         │
│  [Upload FAQ →]                                       │
│                                                      │
│  🟢 Nice to Have                                      │
│  Connect your booking system                          │
│  "4 users asked about scheduling a demo but           │
│   agents had to send them to your website."            │
│  [Connect API →]                                      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

### Phase 3: Organic Layer Adoption

The vendor never sees "Layer 2" or "Layer 3." They see specific problems with specific solutions:

| What the vendor sees | What's actually happening |
|---|---|
| "Upload your FAQ" | Adding a document to Layer 2 (Knowledge) |
| "Add a pricing calculator" | Creating a capability in Layer 3 (Smart Capabilities) |
| "Connect your booking API" | Registering a service endpoint in Layer 3 |
| "Upload case studies" | Adding documents to Layer 2 |
| "Add a quote generator" | Creating a capability in Layer 3 |

The 3-layer architecture is invisible. The vendor only sees: "agents couldn't answer this → here's how to fix it."

---

## Key Design Decisions

### 1. Why Live Preview Before Dashboard (Not After Payment)

**Option A (rejected):** Payment → Dashboard → Preview later
- Problem: Vendor pays, sees numbers, doesn't understand what agents actually say
- Result: "I'm paying $25/day and I have no idea what's happening"

**Option B (chosen):** Payment → Live Preview → Dashboard
- Vendor sees exactly what agents say BEFORE entering the dashboard
- Sets expectations and builds confidence
- Preview becomes the reference point: "Is the real thing matching this?"

### 2. Why No Bid Amounts in Onboarding

**Rejected approach:** Let vendors set CPC bids
- Problem: They have no context for what a bid should be
- "$0.50? $5? $50? I have no idea what a conversation is worth"
- Creates decision paralysis and bad outcomes (too low = no traffic, too high = waste)

**Chosen approach:** Daily budget only, system sets bids
- Vendor controls spend, system optimizes delivery
- Can expose bid controls later for sophisticated advertisers
- Removes the most confusing decision from onboarding

### 3. Why "Questions Agents Couldn't Answer" Is the Core Metric

**Rejected metrics:**
- Impressions (vanity, doesn't drive action)
- Click-through rate (too abstract for non-marketers)
- Cost per click (only meaningful with comparison data)

**Chosen metric:** Unanswered questions
- Immediately actionable ("upload your FAQ to fix this")
- Creates natural upsell path (Layer 2 → Layer 3)
- Vendors intuitively understand "agents couldn't help my customer"
- Emotional hook: every unanswered question is a lost customer

---

## Implementation Sequence

### Sprint 1: Screens 1-3 (Get Live)
- URL scraper → auto-generate Layer 1
- Budget selection (preset amounts + custom)
- Payment integration (Stripe)
- Campaign creation on submit

### Sprint 2: Screen 4 (Live Preview)
- Synthetic conversation generator using Layer 1 data
- 2-3 conversation templates per business category
- Edit loop: preview → edit listing → re-preview

### Sprint 3: Dashboard — Conversation Log
- Capture agent conversation snippets (anonymized)
- Tag conversations: ✅ answered, ⚠️ partial, ❌ couldn't answer
- Display in feed format with revenue per conversation

### Sprint 4: Dashboard — Unanswered Questions
- Aggregate "couldn't answer" patterns across conversations
- Cluster similar questions (NLP deduplication)
- Map each cluster to a specific action (upload doc, add capability, connect API)
- Show estimated impact ("fixing this could increase conversions by X%")

### Sprint 5: Dashboard — Suggested Improvements
- Rank improvement suggestions by estimated impact
- One-click flows: "Upload FAQ" → drag-and-drop → immediately active
- Before/after: show how the same conversation changes after the fix

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
GET LIVE (5 min)          UNDERSTAND (week 1)         IMPROVE (ongoing)
─────────────────         ──────────────────          ─────────────────
Paste URL                 See conversations           Upload FAQ
Confirm listing           See what agents said        Add calculator
Set daily budget          See unanswered questions    Connect APIs
Pay                       See lost opportunities      Add capabilities
See live preview ← aha!         │                           │
                                │                           │
                                └── "upload FAQ to fix" ────┘
                                    (organic upsell)
```

The 3-layer architecture (Offer → Knowledge → Capabilities) is invisible to the vendor. They see problems and fixes. The dashboard drives Layer 2 and Layer 3 adoption without us selling features — the vendor's own data sells them.
