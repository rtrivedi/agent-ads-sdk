# Checkpoint 1: Product Vision & Campaign Creation Framework

**Date:** 2026-03-14
**Status:** Approved direction, pre-implementation

---

## Core Positioning

> **Google made your business searchable by people. We make your product actionable by their AI agents.**

- You're not creating an ad. You're listing your product on the agent internet.
- Every business needed a website when Google became how people found things. Every business will need an agent listing when AI agents become how people do things.

---

## Campaign Creation Flow

**3 steps. That's it.**

1. **Paste your URL** — we scrape and auto-detect everything
2. **Confirm what we found** + provide 2 free-text fields (ideal customer, not ideal for)
3. **Set budget** → Go Live

No ad types. No channels. No targeting. No creative. No teaser copy. No "delivery surface" selection. The system handles all of that.

### The Confirm Step (what the advertiser sees)

```
We found this on your site:                    Correct?

  Pricing: $29/mo, $99/mo, $299/mo tiers       [yes]
  Free trial: 14 days, no credit card           [yes]
  Integrations: Shopify, WooCommerce, Stripe    [yes] [+ add more]
  Ships to: US only                             [no] → "US, CA, UK, EU"

Help agents find your best customers.

  Describe your ideal customer in a sentence:
  [ Solo creators who want to sell physical products
    online without dealing with inventory              ]

  Who is NOT a good fit?  (this lowers your costs)
  [ Large teams or anyone selling digital products     ]
```

---

## 3-Layer Data Framework

### Layer 1: The Offer (auto-detected, advertiser confirms)

**What a scrape gets you:** marketing copy
**What an agent needs:** comparable facts

Universal fields (every listing):
- `price_model` — subscription, one-time, per-use, free, freemium
- `price_entry` — lowest tier price
- `price_ceiling` — highest tier price
- `commitment` — contract length, cancel policy
- `trial` — available, days, credit card required
- `promo` — code, value, expiration

Category-specific fields (auto-detected):
- **SaaS:** integrations[], api: bool, sso: bool
- **E-commerce:** ships_to[], return_days, in_stock: bool
- **Service:** turnaround, availability, licensed: bool
- **Financial:** apr_range, min_credit, insured: bool
- **Education:** duration, format, prerequisite, cert: bool

### Layer 2: The Fit (advertiser provides, no one else has this)

Two free-text fields, parsed into structured signals:
- `ideal_customer` — who agents SHOULD recommend this to
- `not_ideal_for` — who agents should NOT recommend this to
- `positive_signals[]` — auto-parsed from ideal_customer text
- `negative_signals[]` — auto-parsed from not_ideal_for text

**Key insight:** Bad matches destroy quality score. Advertisers are incentivized to be honest about fit because it lowers their costs. This is the opposite of Google/Facebook where advertisers want every impression.

### Layer 3: The Proof (platform-generated, our moat)

Data that only exists because of our platform:
- `quality_score` — CTR, conversion rate, complaint rate (already built)
- `match_accuracy` — how well does this listing match users agents send to it
- `intent_scores` — per-intent match rates (e.g., "start selling online": 0.91)
- `agent_trust` — agents_serving count, repeat_recommendation_rate

**This is the moat.** Compounds over time. No one else has it.

---

## Three Delivery Surfaces (invisible to advertiser)

The system auto-decides which surface to use. The advertiser never chooses.

| Surface | What happens | Payment | Maps to |
|---|---|---|---|
| Conversational | Agent mentions product while chatting with user | Per click | Link/Rec ads (Type 1/2) |
| Agent Marketplace | Agent evaluates structured listing alongside competitors | Per selection | Auction system |
| Autonomous Action | Agent provisions/signs up directly via API | Per completion | Service ads (Type 3) |

Autonomous action is an optional upgrade path (connect API from dashboard), not in creation flow.

---

## The Flywheel

```
Advertiser provides Fit data (Layer 2)
  → Agents make better matches
    → Users click/convert more
      → Proof layer improves (Layer 3)
        → Agents trust listing more
          → Advertiser sees lower costs
            → Advertiser refines Fit data
              → (repeat)
```

---

## TypeScript Interface (what we store per listing)

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
  attributes: Record<string, any>;  // category-specific typed fields

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
}
```

---

## Cross-Business-Type Examples

| | SaaS (Acme) | Local Service (Plumber) | Financial (Credit Card) | Education (Course) |
|---|---|---|---|---|
| **Offer** | $29/mo, 14-day trial, Shopify integration | $95/hr, licensed, weekdays | 19.9% APR, $200 bonus, no fee | $499, 8 weeks, self-paced, cert |
| **Fit** | Solo creators, physical products | Homeowners, residential | Good credit (700+), travel | Beginners, career changers |
| **Proof** | 0.82 quality, 91% on "start selling" | 0.71 quality, 88% on "emergency plumber" | 0.65 quality, weak on "student cards" | 0.78 quality, 34% repeat rate |

---

## Differentiation Summary

| | Google Ads | Facebook Ads | **AttentionMarket** |
|---|---|---|---|
| **You create** | Campaigns, ad groups, keywords, copy | Audiences, creatives, placements | **A URL + 2 sentences** |
| **Targeting** | You pick keywords | You pick demographics | **Agents match intent automatically** |
| **Creative** | You write headlines | You design images/video | **Auto-extracted from site** |
| **The "ad"** | Text shown to human | Image shown to human | **Structured listing evaluated by agents** |
| **Conversion** | Human clicks → lands on site → maybe buys | Same | **Agent can complete action in-session** |

---

## What's Decided
- Campaign creation: URL → confirm → budget → live
- 3-layer data model (Offer / Fit / Proof)
- Delivery surfaces are system-decided, not advertiser-chosen
- Negative fit signals as a differentiator and cost optimization lever
- Platform-generated proof data as the long-term moat

## What's NOT Decided Yet
- Database schema changes needed
- SDK API changes for new listing data
- How URL scraping/auto-detection works technically
- Dashboard design (post-launch analytics)
- Pricing model details (budget tiers, auction mechanics updates)
- How "agent trust" and "match accuracy" are calculated
- Migration plan from current campaign model to listing model
