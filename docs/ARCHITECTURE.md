# AttentionMarket Architecture

This document explains how AttentionMarket works under the hood. Understanding the architecture will help you integrate effectively and contribute to the project.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Core Components](#core-components)
3. [Ad Serving Flow](#ad-serving-flow)
4. [Taxonomy System](#taxonomy-system)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Security Model](#security-model)

---

## System Overview

AttentionMarket is a three-sided marketplace connecting:

1. **AI Agents** (supply) - Show sponsored suggestions to users
2. **Advertisers** (demand) - Pay for high-intent leads
3. **Platform** (marketplace) - Matches demand to supply

### High-Level Architecture

```
┌─────────────────┐
│   AI Agent      │  (Your chatbot, assistant, etc.)
│   + SDK         │
└────────┬────────┘
         │ API Request
         ▼
┌─────────────────┐
│  Edge Functions │  (Supabase)
│  /decide        │  ← Ad serving logic
│  /event         │  ← Click/impression tracking
│  /policy        │  ← Campaign rules
└────────┬────────┘
         │ SQL Queries
         ▼
┌─────────────────┐
│   PostgreSQL    │  (Supabase)
│   - campaigns   │
│   - agents      │
│   - events      │
└─────────────────┘
```

---

## Core Components

### 1. TypeScript SDK (`/src`)

**Purpose:** Makes integration dead simple for developers

**Key Files:**
- `client.ts` - Main `AttentionMarketClient` class
- `helpers.ts` - `detectIntent()`, `buildTaxonomy()`, `suggestTaxonomies()`
- `types.ts` - TypeScript interfaces for requests/responses

**Example Usage:**
```typescript
const client = new AttentionMarketClient({ apiKey: 'am_test_...' });
const decision = await client.decide({ ... });
```

### 2. Backend Functions (`/supabase/functions`)

**Purpose:** Ad serving, tracking, campaign management

**Key Endpoints:**

| Endpoint | Purpose | Auth Required |
|----------|---------|---------------|
| `/decide` | Ad serving (real-time auction) | API Key |
| `/event` | Click/impression tracking | API Key |
| `/policy` | Retrieve campaign targeting rules | API Key |
| `/agent-signup` | Developer registration | None (rate-limited) |
| `/campaign-create` | Advertiser creates campaigns | Advertiser API Key |
| `/click` | Legacy click tracking | API Key |
| `/agent-stats` | Developer revenue dashboard | API Key |
| `/advertiser-stats` | Advertiser analytics | Advertiser API Key |
| `/advertiser-signup` | Advertiser registration | None (rate-limited) |

### 3. Database (`/supabase/migrations`)

**Purpose:** Store campaigns, agents, events, revenue

**Key Tables:**
- `agents` - Registered developers
- `advertisers` - Registered advertisers
- `campaigns` - Active ad campaigns
- `events` - Impressions and clicks
- `payouts` - Revenue splits and payments

---

## Ad Serving Flow

### Step-by-Step: How an Ad Gets Served

```
1. User asks agent: "I need car insurance"
   ↓
2. Agent calls detectIntent(query) → "quote"
   ↓
3. Agent builds taxonomy: buildTaxonomy('insurance', 'auto', 'full_coverage', 'quote')
   → "insurance.auto.full_coverage.quote"
   ↓
4. Agent calls client.decide() with taxonomy
   ↓
5. Backend /decide function:
   - Queries campaigns WHERE taxonomy LIKE 'insurance.auto%'
   - Filters by budget, targeting rules, status
   - Ranks by bid price (CPC)
   - Returns highest-paying ad
   ↓
6. Agent shows ad: "[Sponsored] Get a Geico Quote"
   ↓
7. User clicks → Agent calls client.trackClick()
   ↓
8. Backend records event, increments spend, queues payout
```

### Code Flow in `/decide`

```typescript
// 1. Validate request
if (!validAPIKey(request.headers)) return 401;
if (!validTaxonomy(opportunity.intent.taxonomy)) return 400;

// 2. Find matching campaigns (hierarchical matching)
const campaigns = await db.query(`
  SELECT * FROM campaigns
  WHERE status = 'active'
    AND budget_remaining > 0
    AND $1 LIKE taxonomy || '%'  -- Hierarchical match
  ORDER BY cpc DESC
  LIMIT 1
`);

// 3. Apply targeting filters (geo, language, platform)
const eligible = campaigns.filter(c =>
  matchesGeo(c, context.country) &&
  matchesLanguage(c, context.language)
);

// 4. Return highest bid
return eligible[0] || { status: 'no_fill' };
```

---

## Taxonomy System

### What is a Taxonomy?

A **taxonomy** is a hierarchical category describing user intent:

```
insurance.auto.full_coverage.quote
└──┬───┘ └─┬─┘ └─────┬──────┘ └┬─┘
vertical  cat  subcategory  intent
```

### Hierarchical Matching

**Advertisers target broad categories:**
```typescript
campaign.targeting.taxonomy = "insurance.auto"
```

**Agents request specific intents:**
```typescript
opportunity.intent.taxonomy = "insurance.auto.full_coverage.quote"
```

**Match logic:**
```typescript
// Does "insurance.auto.full_coverage.quote" match "insurance.auto"?
if (agentTaxonomy.startsWith(campaignTaxonomy)) {
  // ✅ MATCH - Show this ad
}
```

### Why Hierarchical?

- **Advertisers** don't know exact user intent (research vs quote)
- **Agents** know exact context ("user asked for quote")
- **Platform** matches specific demand to broad supply

### Phase 1 Taxonomies (50 Categories)

See `/src/helpers.ts` for full list. Examples:

- `insurance.{auto|home|life|health}.{coverage}.{research|compare|quote|apply}`
- `legal.{family|immigration|criminal}.{service}.{consultation|quote|hire}`
- `financial.{loans|credit_cards|investment}.{product}.{research|compare|apply}`

---

## Database Schema

### Key Tables

#### `agents`
```sql
CREATE TABLE agents (
  agent_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_email TEXT NOT NULL UNIQUE,
  agent_name TEXT NOT NULL,
  api_key_test TEXT NOT NULL UNIQUE,
  api_key_live TEXT NOT NULL UNIQUE,
  revenue_share DECIMAL DEFAULT 0.70,  -- 70% to developer
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `campaigns`
```sql
CREATE TABLE campaigns (
  campaign_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID REFERENCES advertisers(advertiser_id),
  taxonomy TEXT NOT NULL,  -- e.g., "insurance.auto"
  cpc DECIMAL NOT NULL,    -- Cost per click
  budget_total DECIMAL NOT NULL,
  budget_remaining DECIMAL NOT NULL,
  status TEXT DEFAULT 'active',
  targeting JSONB,  -- { geo: ['US'], language: ['en'], ... }
  creative JSONB,   -- { title, body, cta, action_url }
  created_at TIMESTAMPTZ DEFAULT now()
);

-- GIN index for fast taxonomy matching
CREATE INDEX idx_campaigns_taxonomy ON campaigns USING gin(taxonomy gin_trgm_ops);
```

#### `events`
```sql
CREATE TABLE events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,  -- 'impression' or 'click'
  agent_id UUID REFERENCES agents(agent_id),
  campaign_id UUID REFERENCES campaigns(campaign_id),
  request_id TEXT NOT NULL,
  taxonomy TEXT NOT NULL,
  revenue_agent DECIMAL,     -- 70% of CPC
  revenue_platform DECIMAL,  -- 30% of CPC
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## API Endpoints

### `/decide` - Ad Serving

**Request:**
```typescript
POST /v1/decide
{
  "request_id": "req_12345",
  "agent_id": "agt_abc123",
  "placement": { "type": "sponsored_suggestion" },
  "opportunity": {
    "intent": { "taxonomy": "insurance.auto.full_coverage.quote" },
    "context": { "country": "US", "language": "en", "platform": "web" }
  }
}
```

**Response (filled):**
```typescript
{
  "status": "filled",
  "units": [{
    "unit_id": "ad_xyz789",
    "suggestion": {
      "title": "Geico - Car Insurance Quote",
      "body": "Get a free quote in 5 minutes. Save up to 15%.",
      "cta": "Get Quote",
      "action_url": "https://geico.com/quote?ref=am_xyz"
    },
    "disclosure": {
      "sponsor_name": "Geico",
      "type": "sponsored_suggestion"
    },
    "tracking": {
      "token": "trk_abc123",
      "impression_url": "/v1/event",
      "click_url": "/v1/event"
    }
  }]
}
```

**Response (no fill):**
```typescript
{
  "status": "no_fill",
  "reason": "No campaigns match taxonomy 'crypto.defi.lending.quote'"
}
```

### `/event` - Tracking

**Request (impression):**
```typescript
POST /v1/event
{
  "event_type": "impression",
  "agent_id": "agt_abc123",
  "request_id": "req_12345",
  "unit_id": "ad_xyz789",
  "tracking_token": "trk_abc123"
}
```

**Request (click):**
```typescript
POST /v1/event
{
  "event_type": "click",
  "agent_id": "agt_abc123",
  "request_id": "req_12345",
  "unit_id": "ad_xyz789",
  "tracking_token": "trk_abc123"
}
```

**Response:**
```typescript
{
  "success": true,
  "revenue_earned": 8.40  // 70% of $12 CPC
}
```

---

## Security Model

### API Key Types

| Type | Format | Purpose | Storage |
|------|--------|---------|---------|
| Test Key | `am_test_[32_chars]` | Development/testing | `.env` file |
| Live Key | `am_live_[32_chars]` | Production | `.env` file (never commit!) |
| Advertiser Key | `am_adv_[32_chars]` | Campaign management | Advertiser dashboard |

### Authentication Flow

```typescript
// 1. Client sends API key in header
Authorization: Bearer am_test_abc123...

// 2. Backend validates key
const agent = await db.query(`
  SELECT agent_id, api_key_test, api_key_live
  FROM agents
  WHERE api_key_test = $1 OR api_key_live = $1
`, [apiKey]);

if (!agent) return 401 Unauthorized;

// 3. Proceed with request
```

### Rate Limiting

- **Per API key:** 1000 requests/minute
- **Per IP:** 100 requests/minute (signup endpoints)
- **Implementation:** Supabase Edge Functions + Upstash Redis

### Security Best Practices

1. **Never commit API keys** - Use `.env` files
2. **Use test keys in development** - Separate from production
3. **Rotate keys if compromised** - Contact support
4. **Verify HTTPS** - All requests over TLS
5. **Monitor unusual patterns** - Dashboard shows traffic spikes

---

## Performance Optimizations

### 1. Taxonomy Indexing
```sql
-- GIN index for fast LIKE queries
CREATE INDEX idx_campaigns_taxonomy ON campaigns USING gin(taxonomy gin_trgm_ops);
```

### 2. Edge Functions (Low Latency)
- Deployed globally on Supabase Edge Network
- <100ms response time (p95)
- Serverless autoscaling

### 3. Caching (Future)
- Campaign targeting rules cached in Redis
- TTL: 5 minutes
- Invalidated on campaign updates

### 4. Connection Pooling
- Supabase Pooler handles DB connections
- Prevents connection exhaustion

---

## Monitoring & Observability

### Metrics Tracked

- **Ad serving:** requests/sec, fill rate, latency
- **Revenue:** clicks, impressions, payouts
- **Errors:** 4xx/5xx rates, failed transactions

### Logging

```typescript
// Example: /decide function logs
console.log({
  event: 'ad_decision',
  request_id: req.request_id,
  taxonomy: req.opportunity.intent.taxonomy,
  status: 'filled',
  cpc: campaign.cpc,
  latency_ms: Date.now() - startTime
});
```

### Alerts (Future)

- Fill rate drops below 50%
- Error rate exceeds 1%
- Budget exhaustion for high-performing campaigns

---

## Scaling Considerations

### Current Capacity
- **Edge Functions:** 1M+ requests/day
- **Database:** 10K campaigns, 1K agents
- **Cost:** ~$50/month (Supabase Pro)

### Future Scaling (1000 agents, 10K campaigns)
- Add read replicas for `/decide` queries
- Implement campaign cache in Redis
- Split events table by month (partitioning)
- CDN for static ad creatives

---

## Contributing to Architecture

See [CONTRIBUTING.md](../CONTRIBUTING.md) for how to propose changes.

**Questions?** Open a [Discussion](https://github.com/rtrivedi/agent-ads-sdk/discussions) or email support@attentionmarket.com.
