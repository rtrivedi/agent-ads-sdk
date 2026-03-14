# Checkpoint 3: Smart Capabilities — Business Logic as a Service

**Date:** 2026-03-14
**Status:** Approved direction, pre-implementation
**Builds on:** Checkpoint 2 (Queryable Listings & Business Knowledge Layer)

---

## The Problem Checkpoint 2 Doesn't Solve

Checkpoint 2 gives agents the ability to **ask questions** about a listing and get decision-grade answers. But answers are still passive. The agent asks, the listing responds. When a user needs something **calculated, evaluated, or decided** — not just answered — the agent hits the next wall:

```
User:  "I want to start selling candles online"
Agent: "Acme looks great. Growth plan at $99/mo covers international shipping."
User:  "What would it actually cost for my 5-person team with API access,
        custom packaging, and annual billing? And I have a promo code."

Agent → Acme's listing: "Cost for 5 users, API, custom packaging, annual, promo?"
Listing → Agent: "Growth plan is $99/mo for up to 10 users. API access is
  included on Growth. Custom packaging available on all plans. Annual
  billing offers a 20% discount. Promo SPRING20 gives additional 20% off."

Agent: "Based on their pricing docs, it looks like... $99/mo with 20% annual
  discount is $79.20/mo, and with the promo it might be... $63.36/mo? I think?
  You should verify that on their site."

❌  The agent has ALL the facts but can't DO the math with confidence.
   It's reading a pricing page, not running a calculator.
```

Queryable docs answer **"what"** — Smart Capabilities calculate **"for you."**

A human sales rep doesn't just recite the pricing page. They pull up the configurator, punch in your numbers, and say "here's your exact quote." That's business logic, not business knowledge. And right now, there's nowhere for a business to put that logic where agents can use it.

---

## The Solution: Declarative Business Logic Agents Can Execute

The business describes their logic — pricing rules, eligibility criteria, recommendation frameworks — in plain language or structured rules. We store it. When an agent invokes a capability, we execute the logic against the user's specific inputs and return a precise, calculated answer.

```
User:  "What would it actually cost for my 5-person team with API access,
        custom packaging, and annual billing? I have code SPRING20."

Agent → Acme's listing [invoke: quote_calculator]:
  { team_size: 5, features: ["api", "custom_packaging"],
    billing: "annual", promo_code: "SPRING20" }

Listing → Agent:
  { plan: "Growth", base_price: 99, annual_discount: 19.80,
    promo_discount: 15.84, final_price: 63.36,
    explanation: "Growth plan ($99/mo) covers up to 10 users and
    includes API access + custom packaging. Annual billing saves
    20% ($79.20/mo). SPRING20 saves additional 20% for 3 months
    ($63.36/mo months 1-3, then $79.20/mo)." }

Agent: "Your exact cost: $63.36/mo for the first 3 months, then $79.20/mo
  after the promo ends. That's the Growth plan with annual billing. API
  access and custom packaging are included. Want to start the 14-day
  free trial?"

✅  Precise. Confident. No "I think" or "you should verify."
```

**The progression across checkpoints:**
- CP1: Here's a listing with structured facts → agent can **describe** the product
- CP2: Here's a queryable knowledge base → agent can **answer questions** about it
- CP3: Here are executable capabilities → agent can **do things** with it

Each step collapses more work from the user.

---

## What The Business Does

No code. No API. Declarative rules that our LLM executes.

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Smart Capabilities — Acme                               │
│                                                          │
│  These let agents DO things for users, not just          │
│  answer questions. Each one is a reason for an agent     │
│  to choose your listing over a competitor.               │
│                                                          │
│  ── Active Capabilities ──────────────────────────────   │
│                                                          │
│  [1] Custom Quote Calculator                             │
│      "Given team size, features needed, and billing      │
│       cycle, return the exact monthly cost including     │
│       any applicable discounts."                         │
│                                                          │
│      Inputs: team_size, features[], billing_cycle        │
│      Logic:                                              │
│        - Starter: 1-2 users, base features, $29/mo      │
│        - Growth: 3-10 users, +API +intl, $99/mo         │
│        - Pro: 11-50 users, +SSO +priority, $249/mo      │
│        - Annual billing: 20% discount                    │
│        - Promo SPRING20: additional 20% for 3 months     │
│                                                          │
│      Used 847 times last month | 31% conversion rate     │
│                                                          │
│  [2] Plan Recommender                                    │
│      "Based on user's needs, recommend the right plan    │
│       and explain why."                                  │
│                                                          │
│      Inputs: use_case, team_size, must_have_features[]   │
│      Logic:                                              │
│        - Selling physical goods + international?         │
│            → Growth ($99/mo)                             │
│        - Need SSO or dedicated support?                  │
│            → Pro ($249/mo)                               │
│        - Solo creator, US only?                          │
│            → Starter ($29/mo)                            │
│                                                          │
│      Used 412 times last month | 44% conversion rate     │
│                                                          │
│  [3] Compatibility Checker                               │
│      "Check if user's existing tools work with us."      │
│                                                          │
│      Inputs: current_tools[], platform                   │
│      Logic:                                              │
│        - Native: Shopify, WooCommerce, Stripe, PayPal    │
│        - Via Zapier: 200+ tools                          │
│        - Not supported: custom/self-hosted platforms      │
│                                                          │
│      Used 623 times last month | 52% conversion rate     │
│                                                          │
│  [ + Add capability ]                                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Templates: 2 Minutes to Launch

Most capabilities fall into common patterns. We offer templates:

| Template | What the business fills in | What agents can do |
|---|---|---|
| **Quote Calculator** | Tier names, prices, discounts, promo rules | "Exact cost for your situation: $X/mo" |
| **Plan Recommender** | Decision criteria per plan | "Based on your needs, here's which plan and why" |
| **Compatibility Checker** | Supported integrations/platforms | "Yes/no, it works with your stack" |
| **Eligibility Checker** | Requirements, criteria, qualifications | "You qualify / don't qualify because..." |
| **Availability Checker** | Hours, service areas, capacity rules | "Available Tuesday 2-4pm in your area" |
| **Comparison Builder** | Differentiators vs named competitors | "Here's how we compare on your priorities" |

Business picks template → fills in their data → capability goes live. That's it.

---

## Why This Is The Agent-to-Agent Unlock

Static websites and consumer-side LLMs can't do this. Here's why:

| | Static website | Consumer LLM | Queryable docs (CP2) | **Smart Capabilities** |
|---|---|---|---|---|
| "How much does it cost?" | Pricing page | Scrapes pricing page | Answers from pricing PDF | **"For your 5-person team with API + annual billing: $63.36/mo for 3 months, then $79.20/mo"** |
| "Will it work for me?" | Feature list | Guesses from features | Answers from FAQ | **"Yes — native Shopify integration. But your custom ERP needs Zapier ($20/mo extra)."** |
| "Which plan should I get?" | Comparison table | Interprets the table | Answers from docs | **"Growth. You need API (not in Starter) but not SSO (Pro). Saves you $150/mo vs Pro."** |
| "Am I eligible?" | "Contact us" | Can't know | Answers generically | **"Yes — 720 credit score exceeds 680 minimum. Pre-approved at 4.2% APR."** |

The key difference: everything before Smart Capabilities gives the agent **information to interpret.** Smart Capabilities give the agent **answers to relay.** The agent goes from "I think..." to "Your exact answer is..."

**This is the gap between informational and transactional.** And transactional is where the money is.

---

## How Capabilities Change the Agent Protocol

When a listing has capabilities, `/decide` advertises them. The requesting agent sees what it can **do**, not just what it can answer:

```
Agent calls /decide → gets listing with:
  - Layer 1:  Acme, e-commerce, $29-249/mo, 14-day trial
  - Layer 1b: Queryable knowledge base (pricing, shipping, 147 products)
  - Layer 2:  Best for solo creators, not for digital products
  - Layer 1c: Capabilities:                                        ← NEW
      - quote_calculator(team_size, features[], billing, promo_code)
      - plan_recommender(use_case, team_size, must_have_features[])
      - compatibility_checker(current_tools[], platform)
  - Layer 3:  0.82 quality, 91% intent match, 31-52% capability conversion

Agent decides: "User needs a quote → invoke quote_calculator"
```

Capabilities are machine-readable. The agent doesn't need to parse a paragraph to figure out what it can do — it sees a structured schema with typed inputs and descriptions. This is **agent-to-agent negotiation** — something a website literally cannot do.

---

## Updated Data Framework

Building on Checkpoint 1's 3 layers and Checkpoint 2's Layer 1b:

```
Layer 1:  The Offer        — structured facts (auto-detected from URL)
Layer 1b: The Knowledge    — queryable docs (business uploads)
Layer 1c: The Capabilities — executable logic (business declares)          ← NEW
Layer 2:  The Fit          — who it's for / not for (advertiser writes)
Layer 3:  The Proof        — quality, match accuracy, agent trust (we generate)
```

Layer 1 tells agents what the product **is.**
Layer 1b lets agents ask what the product **knows.**
Layer 1c lets agents use what the product **does.**

---

## Implementation: Three Approaches, Simplest First

### Approach 1 (MVP): LLM-Interpreted Rules

Business writes rules in plain language. We store them. When invoked, we pass the rules + inputs to an LLM and return the result. No code, no logic engine. One LLM call.

```
Business enters:
  Name: "Quote Calculator"
  Description: "Calculate exact monthly cost"
  Rules: "Starter is $29/mo for 1-2 users with base features.
          Growth is $99/mo for 3-10 users, adds API and intl shipping.
          Pro is $249/mo for 11-50 users, adds SSO and priority support.
          Annual billing gets 20% off. Promo SPRING20 gives additional
          20% off for the first 3 months."
  Inputs: team_size (number), features_needed (string[]), billing (string)

We execute:
  System prompt: "You are a pricing calculator. Execute these rules exactly.
    Return structured JSON with plan name, base price, discounts, and final price.
    Do NOT make up prices. If inputs don't match any rule, say so."
  + Business rules
  + User inputs
  → LLM returns structured answer
```

**Why this works for MVP:**
- It's one more LLM call on top of what CP2 already builds
- Business doesn't write code
- Structured output gives the agent machine-readable results
- We can validate outputs against the rules for obvious errors
- Cost: ~$0.001-0.01 per invocation (cheap enough to absorb)

**Known limitations of LLM-interpreted rules:**
- May get math wrong on edge cases (mitigated by structured output + validation)
- Slower than deterministic logic (~500ms vs ~10ms)
- Harder to guarantee exact reproducibility

### Approach 2 (v2): Structured Decision Engine

For capabilities that need deterministic accuracy (pricing, eligibility), we build a visual rule builder:

```
IF team_size <= 2 THEN plan = "Starter", price = 29
IF team_size <= 10 THEN plan = "Growth", price = 99
IF team_size <= 50 THEN plan = "Pro", price = 249
IF billing = "annual" THEN discount = price * 0.20
IF promo_code = "SPRING20" THEN promo = (price - discount) * 0.20 FOR 3 months
```

Deterministic execution. Zero LLM cost per invocation. Sub-10ms.

### Approach 3 (v3): API Connectors

Business connects real APIs — live inventory, real-time pricing, booking systems. This is the existing Type 3 service ad, but with guided setup and schema discovery. For businesses that already have APIs, this is the most powerful option.

**The migration path is clean:** Start with LLM rules (Approach 1), graduate to deterministic engine (Approach 2) for high-volume capabilities, and connect APIs (Approach 3) when the business is ready. All three use the same agent-facing schema, so the requesting agent doesn't know or care how the capability is implemented.

---

## Technical Architecture

```
┌─────────────┐     ┌───────────────────────┐     ┌──────────────────┐
│  Business    │     │  Our Platform         │     │  User's Agent    │
│             │     │                       │     │                  │
│ Define      │     │  Store capability      │     │ User asks:       │
│ capability  ├────>│  schema + rules        │     │ "how much for    │
│ via template│     │                       │     │  5 people?"      │
│             │     │                       │     │                  │
│             │     │  /decide              │<────┤ Query listings   │
│             │     │  returns listing +     │     │                  │
│             │     │  capability schemas   ├────>│ Sees: Acme has   │
│             │     │                       │     │ quote_calculator  │
│             │     │                       │     │                  │
│             │     │  /invoke              │<────┤ Invoke with      │
│             │     │  executes rules       │     │ {team_size: 5,   │
│             │     │  against inputs       │     │  billing: annual} │
│             │     │  returns result       ├────>│                  │
│             │     │                       │     │ Got: $63.36/mo   │
│             │     │  Log invocation +     │     │ Tell user.       │
│             │     │  outcome              │     │                  │
│             │     │                       │     │                  │
└─────────────┘     └───────────────────────┘     └──────────────────┘
```

### New Components to Build

1. **Capability definition UI** — template picker + rule editor (business-facing)
2. **`/invoke` endpoint** — agent sends capability_id + inputs → execute rules → structured response
3. **Capability schema in `/decide` response** — agent sees what capabilities are available
4. **Invocation logging** — every invocation logged with inputs, outputs, conversion outcome
5. **Capability analytics dashboard** — usage, conversion rates, A/B between rule versions

Items 4 and 5 are byproducts of items 1-3, same as CP2's query intelligence.

### New Endpoint: `/invoke`

```
POST /v1/invoke
{
  "listing_id": "lst_abc123",
  "capability_id": "cap_quote_calc",
  "inputs": {
    "team_size": 5,
    "features_needed": ["api", "custom_packaging"],
    "billing": "annual",
    "promo_code": "SPRING20"
  },
  "intent_stage": "ready_to_buy"
}

Response:
{
  "capability_id": "cap_quote_calc",
  "result": {
    "plan": "Growth",
    "base_price_monthly": 99.00,
    "annual_discount": 19.80,
    "promo_discount": 15.84,
    "final_price_monthly": 63.36,
    "promo_duration_months": 3,
    "price_after_promo": 79.20
  },
  "explanation": "Growth plan ($99/mo) covers up to 10 users and includes
    API access + custom packaging. Annual billing saves 20% ($79.20/mo).
    SPRING20 saves additional 20% for 3 months ($63.36/mo months 1-3,
    then $79.20/mo).",
  "confidence": 0.95,
  "next_steps": "14-day free trial available. No credit card required.",
  "sources": ["Business-defined pricing rules (v3, updated 2026-03-10)"]
}
```

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

  // Layer 1b: The Knowledge (business uploads, we host)
  knowledge_base: {
    docs_count: number;
    topics_covered: string[];
    topics_missing: string[];
    query_url: string;
    last_updated: string;
  };

  // Layer 1c: Smart Capabilities (business declares, we execute)    ← NEW
  capabilities: SmartCapability[];

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
  query_intelligence: {
    total_queries: number;
    answer_rate: number;
    top_converting_topics: string[];
    unanswered_demand: string[];
  };
  capability_intelligence: {                                         // ← NEW
    total_invocations: number;
    capabilities: Record<string, {
      invocations: number;
      conversion_rate: number;
    }>;
  };
}

// Smart Capability schema — what agents see and can invoke
interface SmartCapability {
  id: string;
  name: string;                        // "Custom Quote Calculator"
  description: string;                 // what it does (for the agent to decide whether to invoke)
  inputs: CapabilityInput[];           // what the agent needs to provide
  invoke_url: string;                  // endpoint to call
}

interface CapabilityInput {
  name: string;                        // "team_size"
  type: 'number' | 'string' | 'string[]' | 'boolean';
  description: string;                 // "Number of team members"
  required: boolean;
  enum?: string[];                     // optional: constrained values (e.g., ["annual", "monthly"])
}

// What the agent sends to /invoke
interface InvokeRequest {
  listing_id: string;
  capability_id: string;
  inputs: Record<string, any>;
  intent_stage?: 'research' | 'comparison' | 'ready_to_buy';
}

// What the agent gets back
interface InvokeResponse {
  capability_id: string;
  result: Record<string, any>;         // structured, machine-readable output
  explanation: string;                 // natural language for the agent to relay
  confidence: number;                  // 0-1, how well inputs matched the rules
  next_steps?: string;                 // "Start free trial?" / "Book appointment?"
  sources: string[];                   // what rules/data produced this result
}
```

---

## The Compounding Effect

Every invocation generates data no one else has:

```
┌─────────────────────────────────────────────────────────┐
│  Capability Intelligence — Acme (last 30 days)           │
│                                                          │
│  [1] Quote Calculator                                    │
│      Invocations: 847                                    │
│      Conversion rate: 31%                                │
│      Avg inputs: team_size=4.2, billing=annual (68%)     │
│      Most common promo: SPRING20 (used in 42% of quotes) │
│                                                          │
│      Insight: Users who get a quote are 3.1x more likely │
│      to convert than users who only read pricing docs.   │
│                                                          │
│  [2] Plan Recommender                                    │
│      Invocations: 412                                    │
│      Conversion rate: 44%   ← highest converting         │
│      Top recommendation: Growth (61%)                    │
│      Top trigger: "need API access" (in 73% of inputs)   │
│                                                          │
│      Insight: Users who get a recommendation convert     │
│      4.4x more than those who browse plans themselves.    │
│                                                          │
│  [3] Compatibility Checker                               │
│      Invocations: 623                                    │
│      Conversion rate: 52%                                │
│      Top checked: Shopify (34%), WooCommerce (28%)       │
│      Dealbreaker: "not supported" responses → 3% convert │
│                                                          │
│      Insight: Compatibility confirmation is the #1       │
│      conversion driver. Add more integrations.           │
│                                                          │
│  Combined impact: Listings with 3+ capabilities          │
│  convert at 2.7x the rate of listings with docs only.    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

This feeds Layer 3 (Proof) with a new dimension:

```
Agents see: Acme's compatibility_checker converts at 52%.
Agents learn: When user asks "does it work with Shopify?",
  invoke the checker instead of just reading docs.
Result: More invocations → better data → smarter agents → repeat.
```

**The flywheel:**
```
Business adds capability
  → Agents can DO more for users with this listing
    → Higher conversion rate
      → Agents preferentially select this listing
        → Business sees the data, adds more capabilities
          → (repeat)
```

---

## Categories That Unlock First

Some capabilities are high-value across many verticals:

| Capability | Natural for | User value | Why agents love it |
|---|---|---|---|
| **Quote Calculator** | SaaS, services, insurance | "Exactly $X for your situation" | Eliminates "I think..." |
| **Plan Recommender** | SaaS, subscriptions, education | "This plan, because..." | Agent sounds authoritative |
| **Compatibility Checker** | SaaS, tools, platforms | "Yes/no with your stack" | Prevents bad recommendations |
| **Eligibility Checker** | Financial, insurance, education, govt | "You qualify because..." | Saves user from applying and failing |
| **Availability Checker** | Services, local businesses, appointments | "Open Tuesday 2-4pm" | Actionable, not just informational |
| **Comparison Builder** | Any vs competitors | "Better on X, worse on Y" | Honest = trustworthy |

---

## What We Explicitly Exclude From MVP

| Idea | Why not MVP |
|---|---|
| **Multi-step workflows** (book → pay → confirm) | Requires state machine, session management. v2. |
| **Real-time API connectors** (live inventory, dynamic pricing) | Requires business to have an API. That's Approach 3. |
| **Capability chaining** (quote → recommend → check compatibility) | Agent can invoke sequentially today. Platform-level chaining is over-engineering. |
| **User-facing capability discovery** ("what can you do?") | Agents decide when to invoke. Users don't need to see the menu. |
| **Capability marketplace** (sell your capability to other businesses) | Interesting but premature. Get single-business working first. |

---

## Combined Flow: Checkpoint 1 + 2 + 3

```
Business onboarding:

  1. Paste URL → auto-detect Layer 1 (Offer)
  2. Confirm facts + write Layer 2 (Fit)
  3. Set budget → Go Live
  4. Optional: Upload docs → Layer 1b (Knowledge) goes live
  5. Optional: Add capabilities → Layer 1c (Capabilities) goes live       ← NEW
     - Pick from templates (Quote Calculator, Plan Recommender, etc.)
     - Fill in your rules/logic
     - Test with sample inputs
     - Publish

Agent interaction flow:

  1. User asks agent for help with something
  2. Agent calls /decide → gets ranked listings with Layer 1 + 2 data
     + capability schemas (Layer 1c)
  3. Agent evaluates listings, picks best match
  4. IF listing has knowledge_base AND user has a question:
     a. Agent calls /query → gets answer from docs
  5. IF listing has capabilities AND user needs calculation/evaluation:     ← NEW
     a. Agent calls /invoke with structured inputs
     b. Gets precise, calculated result
     c. Presents confident answer to user
  6. User converts in-session
  7. All queries + invocations logged → feeds Layer 3 (Proof)
```

---

## The Strategic Position

```
                    Information ──────────────────── Transaction

CP1 (Offer):       "Acme is $29-249/mo"
CP2 (Knowledge):   "Growth includes API, ships to 40 countries"
CP3 (Capability):  "Your exact cost: $63.36/mo. Start trial?"     ← NEW
                                                                    ↑
                                                            money is here
```

This is where we stop being an "ad platform with RAG" and become the **agent-to-agent commerce protocol.** Docs answer questions. Capabilities transact. That's the gap between "interesting" and "indispensable."

---

## What's Decided (Checkpoint 1 + 2 + 3)

- Campaign creation: URL → confirm → budget → live
- 3-layer data model (Offer / Fit / Proof)
- Layer 1b (Knowledge): queryable doc-backed agent for each listing
- Layer 1c (Capabilities): declarative business logic agents can invoke
- Capability templates for common patterns (quote, recommend, check, etc.)
- Three-phase implementation: LLM rules → deterministic engine → API connectors
- Capabilities advertised in /decide response as structured schemas
- New /invoke endpoint for capability execution
- Capability intelligence as extension of Layer 3 (Proof)
- Delivery surfaces are system-decided, not advertiser-chosen
- Negative fit signals as a differentiator and cost optimization lever

## What's NOT Decided Yet

- Database schema for capabilities (rules storage, invocation logs)
- LLM execution strategy (which model, prompt structure, output validation)
- Capability versioning (how businesses update rules without breaking agents)
- Pricing model for invocations (free? per-invocation fee? included in budget?)
- Rate limiting for /invoke (prevent abuse, especially with LLM costs)
- Validation strategy (how we verify LLM output matches business rules)
- Template design details (exact fields, UX for rule editor)
- How capabilities interact with the auction (do capabilities boost score?)
- Migration path: when/how to push businesses from Approach 1 → 2 → 3
- SDK API changes for capability discovery and invocation
