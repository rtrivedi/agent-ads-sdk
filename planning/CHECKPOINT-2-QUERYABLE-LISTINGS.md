# Checkpoint 2: Queryable Listings & Business Knowledge Layer

**Date:** 2026-03-14
**Status:** Approved direction, pre-implementation
**Builds on:** Checkpoint 1 (Product Vision & Campaign Creation Framework)

---

## The Problem Checkpoint 1 Doesn't Solve

Checkpoint 1 gives agents structured facts about a listing (Layer 1) and fit signals (Layer 2). But when a user asks a **specific question** about a product, the agent hits a wall:

```
User:  "I want to start selling candles online"
Agent: "Acme looks like a great fit — $29/mo, Shopify integration, 14-day trial."
User:  "Do they handle international shipping? Can I use my own packaging?"
Agent: "...I'm not sure. You'd need to check their website."

❌  User leaves. Opens browser. Digs through FAQ. Maybe gives up.
```

The agent has marketing-grade data but not **decision-grade knowledge.** The entire sales funnel breaks because the agent has to punt to a website.

Website scraping can't fix this. Scraped pages contain what the business chose to put on their landing page — not answers to the thousands of specific questions users actually ask.

---

## The Solution: Every Listing Gets a Queryable Agent

Business uploads their docs (FAQ, pricing details, product specs, policies). We host an LLM over those docs. Now other agents don't just **see** the listing — they can **ask it questions.**

```
User:  "I want to start selling candles online"
Agent: "Acme looks like a good fit. Let me check the specifics..."

Agent → Acme's listing: "International shipping? Custom packaging?"
Acme's listing → Agent: "International shipping on Growth plan
  ($99/mo), 40+ countries. Custom packaging on all plans —
  upload designs in brand portal."

Agent: "Acme supports international shipping on their $99/mo plan
  (40+ countries) and custom packaging on all plans. They have a
  14-day free trial. Want me to set one up?"

✅  User converts in the same conversation.
```

**The sales cycle collapses from "go check their website" to "here's your answer, want to proceed?"**

---

## Why This Can't Be Replicated By Scraping

| What the website says | What the user actually needs to know |
|---|---|
| "Ships worldwide" | "Do you ship to Brazil? What's the duty situation?" |
| "Starting at $29/mo" | "Actual cost for 3 users with SSO and API access?" |
| "Easy returns" | "Can I return a custom-engraved item?" |
| "Enterprise ready" | "Do you support SOC2? Can you sign a BAA?" |

These answers exist in the business's internal docs — support articles, detailed pricing sheets, policy documents, product specs — but they're NOT on the landing page an agent would scrape.

**We become the place where businesses put the information they want agents to know.** Not marketing copy. Decision-grade knowledge.

---

## The 10x Value Chain

```
Without us:
  Agent recommends → User clicks → Reads website → Has questions
  → Contacts support → Waits hours/days → Maybe converts

  Time to answer: hours to days
  Conversion: low (each handoff loses people)

With us:
  Agent recommends → Agent asks listing questions on behalf of user
  → User gets complete answer → Converts in session

  Time to answer: seconds
  Conversion: dramatically higher (no handoffs)
```

**For the consumer:** Real answers without leaving the agent. No more "check their website."

**For the business:** Every agent becomes a knowledgeable sales rep for your product. Docs answer questions 24/7 across thousands of agents simultaneously.

**For us:** Every question-answer pair is proprietary data. Which questions get asked? Which answers convert? This feeds Layer 3 (Proof) and makes listings smarter over time.

---

## Updated Data Framework

Building on Checkpoint 1's 3 layers:

```
Layer 1:  The Offer      — structured facts (auto-detected from URL)
Layer 1b: The Knowledge   — queryable docs (business uploads)         ← NEW
Layer 2:  The Fit         — who it's for / not for (advertiser writes)
Layer 3:  The Proof       — quality, match accuracy, agent trust (we generate)
```

Layer 1b is what turns a static listing into a live, queryable agent representative for every business on the platform.

---

## What The Business Does (MVP)

Not a complex integration. Not an API. **Documents.**

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  Make your listing smarter.                                  │
│                                                              │
│  Agents will answer user questions using your docs.          │
│  The more you share, the better agents sell for you.         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                                                      │    │
│  │  Acme-Pricing-Details.pdf             processed      │    │
│  │  FAQ-Full.pdf                         processed      │    │
│  │  Shipping-Policy.pdf                  processed      │    │
│  │  Product-Catalog-2026.pdf             processed      │    │
│  │                                                      │    │
│  │              [ + Upload more docs ]                   │    │
│  │                                                      │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Or paste a link to your help center / docs site:    │    │
│  │  ┌──────────────────────────────────────────────┐    │    │
│  │  │ https://help.acme.com                        │    │    │
│  │  └──────────────────────────────────────────────┘    │    │
│  │  We'll crawl and index it automatically.             │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  -- What agents can answer now ────────────────────────────  │
│                                                              │
│  OK  Pricing questions (4 tiers detected, add-ons, billing)  │
│  OK  Shipping & returns (40+ countries, 30-day returns)      │
│  OK  Product specs (147 products indexed)                    │
│  OK  Integrations & compatibility (12 platforms)             │
│  !!  Compliance & security (partial — upload SOC2/BAA docs?) │
│  --  Onboarding process (no docs found — add setup guide?)   │
│                                                              │
│  -- Test it ─────────────────────────────────────────────    │
│                                                              │
│  Ask a question like an agent would:                         │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ What's the total cost for a team of 5 with API       │    │
│  │ access and custom packaging?                         │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  "Growth plan at $99/mo covers up to 5 team members.         │
│   API access included on Growth and above. Custom            │
│   packaging available on all plans at no extra cost.          │
│   Total: $99/mo. With SPRING20: $79.20/mo for 3 months."    │
│                                                              │
│   Source: Acme-Pricing-Details.pdf (pg 3),                   │
│           FAQ-Full.pdf (pg 12)                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

The **"Test it"** box is critical. The advertiser asks a question like an agent would and sees exactly how their listing responds. This is the moment they go "oh, THIS is why I should upload more docs."

---

## Three Compounding Advantages From Hosted Compute

Beyond answering questions, the fact that we host the LLM + have the docs + process the queries unlocks three things that are nearly free to build but compound massively over time.

### Advantage 1: Question Intelligence (passive, zero-cost, massive signal)

Every query is logged. The business gets insight they **literally cannot get anywhere else:**

```
┌─────────────────────────────────────────────────────────┐
│  Question Intelligence — Acme (last 30 days)            │
│                                                         │
│  Top questions agents ask about you:                    │
│                                                         │
│  1. "International shipping?"          asked 143 times  │
│     OK  Answered from: Shipping-Policy.pdf              │
│     -> 34 conversions (24% conversion rate)             │
│                                                         │
│  2. "SOC2 / compliance?"              asked 89 times    │
│     !!  NOT ANSWERED — no docs found                    │
│     -> 0 conversions (agents moved on)                  │
│     ** Upload compliance docs to capture this demand    │
│                                                         │
│  3. "Can I use with Shopify?"         asked 72 times    │
│     OK  Answered from: FAQ-Full.pdf                     │
│     -> 28 conversions (39% conversion rate)             │
│                                                         │
│  4. "Refund policy for custom items?" asked 61 times    │
│     !!  PARTIAL — generic policy found, not custom-item │
│     -> 8 conversions (13% conversion rate)              │
│     ** Add custom-item refund details to improve this   │
│                                                         │
│  You're missing an estimated 89 conversions/mo          │
│  from unanswered questions.                             │
│                                                         │
│  [ Upload docs to fill gaps ]                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Why this compounds:** Business uploads more docs → answers improve → conversions go up → business uploads even more docs. The gap detection creates a self-reinforcing improvement loop. And the data itself is proprietary — no one else has "what agents actually ask about your product."

**Build cost:** Logging queries we're already processing. A weekly rollup LLM call to categorize and detect gaps. Trivial.

### Advantage 2: Intent-Aware Response Framing (already have the pieces)

We already detect intent stage in v0.15.0 (research → comparison → ready_to_buy). Use it to frame the same answer differently:

```
Same question: "How much does Acme cost?"
Same docs:     Acme-Pricing-Details.pdf

─────────────────────────────────────────────────────

Intent: RESEARCH
  "Acme offers 4 tiers: Starter ($29/mo), Growth ($99/mo),
   Pro ($249/mo), Enterprise (custom). All include core
   features. Main differences are team size, API access,
   and support level."

   Framing: comprehensive, educational, no pressure

─────────────────────────────────────────────────────

Intent: COMPARISON
  "Acme Growth at $99/mo includes up to 5 team members,
   API access, and custom packaging — the features most
   comparable to [competitor] at $129/mo. Key differentiator:
   international shipping to 40+ countries included."

   Framing: positioned against alternatives, highlights edges

─────────────────────────────────────────────────────

Intent: READY_TO_BUY
  "Growth plan, $99/mo. 14-day free trial, no credit card
   required. Current promo SPRING20 saves 20% for 3 months
   ($79.20/mo). Cancel anytime."

   Framing: direct, action-oriented, removes friction
```

**Why this compounds:** As we see which framing converts at each stage, we tune the system prompts. The responses get smarter over time without the business doing anything.

**Build cost:** A system prompt variable we already have. Near zero.

### Advantage 3: Auto-Generated Listing Content From Docs

The biggest friction for businesses joining the platform is **writing the listing.** Layer 2 (The Fit) asks them to describe who they're for, use cases, differentiators. Most businesses will stare at a blank form.

Instead: they upload docs, we generate the listing for them.

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  We generated your listing from your docs.               │
│  Review and edit anything that's off.                    │
│                                                          │
│  Category (detected): E-commerce Platform                │
│                                                          │
│  Summary:                                                │
│  ┌──────────────────────────────────────────────────┐    │
│  │ All-in-one platform for physical product sellers. │    │
│  │ Sourcing, fulfillment, and storefront. Ships to  │    │
│  │ 40+ countries. Plans from $29/mo.                │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  Best for:                                               │
│  ┌──────────────────────────────────────────────────┐    │
│  │ - Creators launching physical product brands      │    │
│  │ - Small teams (1-50) selling physical goods       │    │
│  │ - Sellers wanting international reach             │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  Not ideal for:                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │ - Digital-only products (no digital fulfillment)  │    │
│  │ - Enterprise 500+ employee orgs (see Enterprise)  │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  Key capabilities (6 detected):                          │
│  OK Product sourcing    OK Order fulfillment             │
│  OK Custom packaging    OK International shipping        │
│  OK Shopify integration OK Analytics dashboard           │
│                                                          │
│  Pricing (extracted):                                    │
│  Starter $29/mo -> Growth $99/mo -> Pro $249/mo          │
│                                                          │
│  [ Looks good, publish ]    [ Edit before publishing ]   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Why this compounds:** Lower onboarding friction → more businesses join → more listings → more valuable for agents → more businesses join. The classic marketplace flywheel, but AI removes the content creation bottleneck.

**Build cost:** One LLM call over the ingested docs with a structured output prompt. We're already processing the docs for RAG — this is a byproduct.

---

## Technical Architecture (MVP)

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Business    │     │  Our Platform    │     │  User's Agent   │
│             │     │                  │     │                 │
│ Upload docs ├────>│ Chunk + embed    │     │ User asks about │
│             │     │ Store in vector  │     │ "candle selling" │
│             │     │ DB               │     │                 │
│             │     │                  │     │                 │
│             │     │  /decide         │<────┤ Query: relevant  │
│             │     │  returns listing │     │ products?        │
│             │     │  + query_url     ├────>│                 │
│             │     │                  │     │ Got Acme listing │
│             │     │                  │     │                 │
│             │     │  /query          │<────┤ "International   │
│             │     │  LLM + RAG over  │     │  shipping? Cost  │
│             │     │  business docs   ├────>│  for 5 users?"   │
│             │     │                  │     │                 │
│             │     │  Log query +     │     │ Got answers.     │
│             │     │  answer + outcome│     │ Recommend to user│
│             │     │                  │     │                 │
└─────────────┘     └──────────────────┘     └─────────────────┘
```

### New Components to Build

1. **Doc ingestion pipeline** — upload/crawl → chunk → embed → store (standard RAG)
2. **`/query` endpoint** — agent sends question + listing ID → LLM answers from docs → response
3. **Intent-aware framing** — system prompt variable based on detected intent stage
4. **Auto-listing generation** — one LLM call on ingested docs to populate Layer 1 + Layer 2
5. **Query logging + gap detection** — passive analytics on every query
6. **Business dashboard** — question intelligence view

Items 3, 4, and 5 are essentially **free byproducts** of building items 1 and 2.

### Updated TypeScript Interface

```typescript
interface AgentListing {
  // Layer 1: The Offer (auto-detected, advertiser confirms)
  url: string;
  name: string;
  category: BusinessCategory;
  pitch: string;
  pricing: PricingStructure;
  trial: TrialInfo | null;
  promo: PromoInfo | null;
  attributes: Record<string, any>;

  // Layer 1b: The Knowledge (business uploads, we host)       ← NEW
  knowledge_base: {
    docs_count: number;
    topics_covered: string[];        // what agents CAN ask about
    topics_missing: string[];        // gaps we've detected
    query_url: string;               // endpoint agents call to ask questions
    last_updated: string;
  };

  // Layer 2: The Fit (advertiser provides, we structure)
  ideal_customer: string;
  not_ideal_for: string;
  positive_signals: Signal[];
  negative_signals: Signal[];

  // Layer 3: The Proof (platform-generated, proprietary)
  quality_score: number;
  match_accuracy: number;
  intent_scores: Record<string, number>;
  agent_trust: {
    agents_serving: number;
    repeat_rate: number;
  };
  query_intelligence: {                                        ← NEW
    total_queries: number;
    answer_rate: number;             // % of queries we could answer
    top_converting_topics: string[];
    unanswered_demand: string[];     // topics agents ask about but we can't answer
  };
}

// What the /query endpoint accepts and returns
interface QueryRequest {
  listing_id: string;
  question: string;
  intent_stage?: 'research' | 'comparison' | 'ready_to_buy';
  user_context?: string;             // optional context for better answers
}

interface QueryResponse {
  answer: string;
  confidence: number;                // 0-1, how well docs cover this question
  sources: {
    doc_name: string;
    page?: number;
    chunk_preview: string;
  }[];
  suggested_followup?: string;       // "You might also want to ask about..."
}
```

---

## What We Explicitly Exclude From MVP

| Idea | Why not MVP |
|---|---|
| **Proactive qualification** ("Are you US-based?") | Requires back-and-forth agent protocol, too complex for v1 |
| **Competitive intelligence** ("Your competitor covers SOC2") | Sensitive — build trust first before comparing listings |
| **Warm lead handoff** (send context to sales team) | Requires CRM integration, webhook setup. Not zero-integration |
| **Dynamic pricing responses** (adjust based on user budget) | Could feel manipulative. Get trust model right first |
| **Multi-turn agent conversations** with listing | Single question-answer for MVP. Multi-turn is v2 |

All good ideas for v2. MVP = **upload docs → we do the rest.**

---

## The Defensible Network Effect

```
More businesses upload docs
  → Agents get better answers
    → Agents query us more often
      → We have more signal data (Layer 3)
        → Listings perform better
          → More businesses upload docs
```

**The defensible asset isn't the LLM. It's the corpus.** Thousands of businesses' internal docs, pricing details, policies, and specs — structured and queryable — is something no competitor can replicate by scraping the web.

---

## Combined Flow: Checkpoint 1 + Checkpoint 2

```
Business onboarding (3 steps, unchanged from CP1):

  1. Paste URL → auto-detect Layer 1 (Offer)
  2. Confirm facts + write Layer 2 (Fit)
  3. Set budget → Go Live

  NEW: Optional step after going live:
  4. Upload docs → Layer 1b (Knowledge) goes live
     - Auto-generates improved listing content
     - Enables queryable agent endpoint
     - Dashboard shows question intelligence

Agent interaction flow:

  1. User asks agent for help with something
  2. Agent calls /decide → gets ranked listings with Layer 1 + 2 data
  3. Agent evaluates listings, picks best match
  4. IF listing has knowledge_base:
     a. Agent calls /query with specific user questions
     b. Gets decision-grade answers framed for user's intent stage
     c. Presents complete answer to user
  5. User converts in-session (no website visit needed)
  6. All queries logged → feeds Layer 3 (Proof) + question intelligence
```

---

## What's Decided (Checkpoint 1 + 2)

- Campaign creation: URL → confirm → budget → live
- 3-layer data model (Offer / Fit / Proof)
- Layer 1b (Knowledge): queryable doc-backed agent for each listing
- Delivery surfaces are system-decided, not advertiser-chosen
- Negative fit signals as a differentiator and cost optimization lever
- Platform-generated proof data as the long-term moat
- Question intelligence as a business retention and improvement tool
- Intent-aware response framing using existing intent detection
- Auto-listing generation from uploaded docs

## What's NOT Decided Yet

- Database schema changes (for listings + knowledge base + query logs)
- Vector DB choice for embeddings (pgvector in Supabase? external?)
- LLM choice for hosted /query endpoint (cost vs quality tradeoff)
- Doc ingestion: chunking strategy, embedding model
- Rate limiting / pricing for /query endpoint (per-query cost to advertiser?)
- How auto-listing generation prompt is structured
- SDK API changes for new listing data and /query endpoint
- Migration plan from current campaign model to listing model
- Dashboard design (question intelligence view)
