# Checkpoint 5: Implementation Spec — Vendor Onboarding (Build Doc)

**Date:** 2026-03-14
**Status:** Ready to build
**Implements:** Checkpoint 4 (Vendor Onboarding & Retention Loop)
**Data models from:** Checkpoints 1 (Offer), 2 (Knowledge), 3 (Capabilities)

---

## What We're Building

A single-page vendor onboarding experience with two cards:

1. **Card 1** — A form (mostly auto-filled from URL scrape) ending in a "Go Live" button
2. **Card 2** — Appears after Go Live: a simulated agent conversation showing a gap, followed by three enhancement options (Upload Docs, Add Capabilities, Set Triggers)

This doc is the build spec. Wireframes live in Checkpoint 4. Data model definitions live in Checkpoints 2-3. This doc covers: what to build, what endpoints to create, what database tables to add, and the exact user flows.

---

## Card 1: Get Listed

### User Flow

```
1. Vendor lands on page
2. Pastes URL into input field
3. Clicks "Analyze" (or auto-triggers on paste)
4. Loading state (2-3s): "Reading your website..."
5. Form populates with scraped data:
   - Business name (editable)
   - Description / what you do (editable textarea)
   - Pricing summary (editable)
   - Geography / ships to (editable)
6. Two free-text fields (empty, vendor fills in):
   - "Who's your ideal customer?"
   - "Who's NOT a good fit?"
7. Budget section:
   - Preset buttons: $10, $25, $50
   - Custom input field
   - Helper text: "You only pay when a user takes action"
   - Estimate text: "~15-40 conversations/day at $25" (dynamic)
8. Payment section:
   - Stripe Elements embed (card number, expiry, CVC)
   - "You won't be charged until agents start recommending you"
9. "Go Live" button
```

### API: `POST /v1/vendor/scrape`

Scrapes the vendor's URL and returns structured Layer 1 data.

**Request:**
```json
{
  "url": "https://acme-ecommerce.com"
}
```

**Response:**
```json
{
  "name": "Acme E-Commerce",
  "description": "All-in-one platform for creators to launch and sell physical products online",
  "pricing": {
    "model": "subscription",
    "entry": "$29/mo",
    "ceiling": "$299/mo",
    "summary": "$29/mo – $299/mo (3 tiers, 14-day trial)"
  },
  "geography": ["US", "CA", "UK"],
  "trial": {
    "available": true,
    "duration": "14 days",
    "requires_cc": false
  },
  "detected_category": "ecommerce_platform",
  "raw_attributes": {
    "integrations": ["Shopify", "WooCommerce", "Stripe"],
    "features": ["custom packaging", "international shipping", "analytics"]
  }
}
```

**Implementation:**
- Edge Function: `supabase/functions/vendor-scrape/index.ts`
- Uses headless fetch (not browser) — grab HTML, parse with cheerio or similar
- Pass key page content to LLM with structured output prompt
- Extract: name, description, pricing tiers, geography, trial info, features
- Rate limit: 10 requests/min per IP (prevent abuse)
- No auth required (pre-signup endpoint)

### API: `POST /v1/vendor/go-live`

Creates the vendor account, listing, campaign, and Stripe customer in one atomic operation.

**Request:**
```json
{
  "url": "https://acme-ecommerce.com",
  "name": "Acme E-Commerce",
  "description": "All-in-one platform for creators...",
  "pricing": {
    "model": "subscription",
    "entry": "$29/mo",
    "ceiling": "$299/mo",
    "summary": "$29/mo – $299/mo (3 tiers, 14-day trial)"
  },
  "geography": ["US", "CA", "UK"],
  "trial": { "available": true, "duration": "14 days", "requires_cc": false },
  "ideal_customer": "Solo creators selling physical products",
  "not_ideal_for": "Enterprise teams, digital-only products",
  "daily_budget": 25.00,
  "stripe_payment_method_id": "pm_1234567890",
  "email": "vendor@acme.com"
}
```

**Response:**
```json
{
  "vendor_id": "vnd_abc123",
  "listing_id": "lst_xyz789",
  "api_key": "am_adv_...",
  "status": "live",
  "preview_conversations": [
    {
      "messages": [
        { "role": "user", "content": "I want to start selling handmade candles online" },
        { "role": "agent", "content": "For handmade candles, I'd recommend Acme..." },
        { "role": "user", "content": "What's their return policy?" },
        { "role": "agent", "content": "I don't have details on Acme's return policy. You'd need to check their website." }
      ],
      "gap_highlighted": "return policy"
    }
  ]
}
```

**What this does (in order):**
1. Create Stripe customer + attach payment method
2. Insert into `vendors` table
3. Insert into `listings` table (Layer 1 data)
4. Insert into `campaigns` table (daily budget, system-set bid)
5. Generate 2-3 synthetic preview conversations using listing data
6. Return vendor credentials + preview data for Card 2

**Implementation:**
- Edge Function: `supabase/functions/vendor-go-live/index.ts`
- Stripe SDK for customer creation + payment method attachment
- LLM call to generate preview conversations (one happy path, one with a gap)
- Campaign bid auto-set: look up average CPC for detected category, use that
- This is a single POST that does everything — no multi-step wizard state

---

## Card 2: Keep Going

### User Flow

Card 2 appears on the same page after Go Live succeeds. The page smooth-scrolls down to reveal it. Card 1 collapses or dims.

```
1. Success banner: "You're live! Agents can now recommend your business."
2. Preview conversation: rendered as a chat UI
   - Shows agent recommending the vendor (happy path)
   - Shows agent hitting a wall (gap moment, highlighted with warning color)
   - The gap is generated from what we DIDN'T find on their website
3. Section header: "Give your agent more to work with"
4. Three enhancement cards (collapsed by default, expand on click):

   a. Upload Documents
      - Drag-and-drop zone + "Paste Text" tab
      - Accepts: PDF, DOCX, TXT, MD, or raw text
      - Helper: "FAQ, pricing details, return policy, case studies"
      - On upload: show processing spinner → "Agents can now answer X questions"

   b. Add Smart Capabilities
      - Template picker (cards):
        - Quote Calculator
        - Plan Recommender
        - Compatibility Checker
        - Eligibility Checker
        - Availability Checker
      - Each template expands into a rule editor (plain text textarea)
      - "Test it" box: enter sample inputs, see output

   c. Set Conversation Triggers
      - "When should agents recommend you?"
        Textarea with examples: "User is looking for e-commerce platform,
        user wants to sell physical products online"
      - "When should agents NOT recommend you?"
        Textarea with examples: "User needs digital product delivery,
        user is enterprise with 500+ employees"

5. Skip message: "Skip for now? No problem — we'll show you exactly
   what questions agents can't answer in your dashboard."
6. "Go to Dashboard" button
```

### API: `POST /v1/vendor/upload-docs`

Ingests documents into the vendor's knowledge base (Layer 1b from CP2).

**Request:**
```
Content-Type: multipart/form-data

listing_id: "lst_xyz789"
files: [FAQ.pdf, Pricing-Details.pdf]
```

OR for pasted text:
```json
{
  "listing_id": "lst_xyz789",
  "text_content": "Our return policy is...",
  "doc_name": "Return Policy"
}
```

**Response:**
```json
{
  "docs_processed": 2,
  "topics_covered": ["pricing", "shipping", "returns", "integrations"],
  "topics_still_missing": ["compliance", "onboarding"],
  "questions_answerable": 47
}
```

**Implementation:**
- Edge Function: `supabase/functions/vendor-upload-docs/index.ts`
- PDF/DOCX → text extraction (use pdf-parse, mammoth)
- Chunk text (512-token chunks, 50-token overlap)
- Embed chunks (OpenAI text-embedding-3-small or similar)
- Store in `listing_docs` table + vector embeddings in `listing_doc_chunks`
- Run topic detection LLM call on full doc set → update listing.topics_covered
- Auth: vendor API key required

### API: `POST /v1/vendor/add-capability`

Creates a smart capability for the listing (Layer 1c from CP3).

**Request:**
```json
{
  "listing_id": "lst_xyz789",
  "template": "quote_calculator",
  "name": "Custom Quote Calculator",
  "description": "Calculate exact monthly cost based on team size and features",
  "rules": "Starter is $29/mo for 1-2 users with base features. Growth is $99/mo for 3-10 users, adds API and intl shipping. Pro is $249/mo for 11-50 users, adds SSO and priority support. Annual billing gets 20% off. Promo SPRING20 gives additional 20% off for 3 months.",
  "inputs": [
    { "name": "team_size", "type": "number", "description": "Number of team members", "required": true },
    { "name": "features_needed", "type": "string[]", "description": "Required features", "required": false },
    { "name": "billing", "type": "string", "description": "monthly or annual", "required": true, "enum": ["monthly", "annual"] },
    { "name": "promo_code", "type": "string", "description": "Promo code if any", "required": false }
  ]
}
```

**Response:**
```json
{
  "capability_id": "cap_abc123",
  "status": "active",
  "test_url": "/v1/invoke"
}
```

**Implementation:**
- Edge Function: `supabase/functions/vendor-add-capability/index.ts`
- Store rules + input schema in `listing_capabilities` table
- Validate input schema (types, required fields, enums)
- Auth: vendor API key required

### API: `POST /v1/vendor/set-triggers`

Sets conversation triggers for when agents should/shouldn't recommend this listing.

**Request:**
```json
{
  "listing_id": "lst_xyz789",
  "recommend_when": "User is looking for an e-commerce platform, user wants to sell physical products online, user is a creator or small business",
  "do_not_recommend_when": "User needs digital product delivery, user is enterprise with 500+ employees, user needs B2B wholesale features"
}
```

**Response:**
```json
{
  "listing_id": "lst_xyz789",
  "triggers_active": true,
  "positive_signals_parsed": 3,
  "negative_signals_parsed": 3
}
```

**Implementation:**
- Edge Function: `supabase/functions/vendor-set-triggers/index.ts`
- Parse free-text into structured signals (LLM call to extract discrete conditions)
- Store in `listing_signals` table
- These signals feed into the `/decide` auction as relevance boosters/penalties
- Auth: vendor API key required

---

## Database Schema

### New Tables

```sql
-- Vendor accounts (advertisers rebranded for the new flow)
CREATE TABLE vendors (
  vendor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  api_key TEXT NOT NULL UNIQUE DEFAULT 'am_adv_' || encode(gen_random_bytes(24), 'hex'),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Listings (the core unit — replaces "campaigns" as the vendor-facing concept)
CREATE TABLE listings (
  listing_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(vendor_id) NOT NULL,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  pricing JSONB NOT NULL,           -- { model, entry, ceiling, summary }
  geography TEXT[],
  trial JSONB,                      -- { available, duration, requires_cc }
  ideal_customer TEXT,
  not_ideal_for TEXT,
  detected_category TEXT,
  raw_attributes JSONB,             -- everything else scraped
  status TEXT DEFAULT 'active',     -- active, paused, archived
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Campaigns (budget/bidding layer, linked to listing)
-- Kept separate because one listing could have multiple campaigns later
CREATE TABLE listing_campaigns (
  campaign_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(listing_id) NOT NULL,
  daily_budget DECIMAL NOT NULL,
  daily_spent DECIMAL DEFAULT 0,
  system_bid DECIMAL NOT NULL,       -- auto-set, not vendor-chosen
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Documents uploaded by vendor (Layer 1b: Knowledge)
CREATE TABLE listing_docs (
  doc_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(listing_id) NOT NULL,
  doc_name TEXT NOT NULL,
  doc_type TEXT NOT NULL,            -- pdf, docx, txt, text_paste
  raw_text TEXT NOT NULL,
  chunk_count INTEGER DEFAULT 0,
  topics_detected TEXT[],
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vector chunks for RAG (Layer 1b)
-- Requires: CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE listing_doc_chunks (
  chunk_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id UUID REFERENCES listing_docs(doc_id) NOT NULL,
  listing_id UUID REFERENCES listings(listing_id) NOT NULL,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),            -- text-embedding-3-small dimensions
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast similarity search
CREATE INDEX idx_doc_chunks_embedding ON listing_doc_chunks
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Smart Capabilities (Layer 1c)
CREATE TABLE listing_capabilities (
  capability_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(listing_id) NOT NULL,
  template TEXT,                     -- quote_calculator, plan_recommender, etc.
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  rules TEXT NOT NULL,               -- plain-language business logic
  input_schema JSONB NOT NULL,       -- array of { name, type, description, required, enum? }
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Conversation Triggers (structured signals for /decide)
CREATE TABLE listing_signals (
  signal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(listing_id) NOT NULL,
  signal_type TEXT NOT NULL,         -- 'positive' or 'negative'
  raw_text TEXT NOT NULL,            -- vendor's free-text input
  parsed_conditions JSONB,           -- LLM-extracted structured conditions
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Query logs (for Question Intelligence dashboard)
CREATE TABLE listing_query_logs (
  query_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(listing_id) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  confidence DECIMAL,
  answered BOOLEAN NOT NULL,          -- could we answer from docs?
  sources JSONB,                      -- which docs/chunks
  agent_id UUID,                      -- which agent asked
  intent_stage TEXT,
  conversion BOOLEAN DEFAULT false,   -- did user convert after this answer?
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Capability invocation logs
CREATE TABLE listing_invocation_logs (
  invocation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(listing_id) NOT NULL,
  capability_id UUID REFERENCES listing_capabilities(capability_id) NOT NULL,
  inputs JSONB NOT NULL,
  result JSONB,
  confidence DECIMAL,
  agent_id UUID,
  intent_stage TEXT,
  conversion BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Indexes

```sql
-- Fast lookup by vendor
CREATE INDEX idx_listings_vendor ON listings(vendor_id);
CREATE INDEX idx_listing_docs_listing ON listing_docs(listing_id);
CREATE INDEX idx_listing_capabilities_listing ON listing_capabilities(listing_id);
CREATE INDEX idx_listing_signals_listing ON listing_signals(listing_id);

-- Query log analytics
CREATE INDEX idx_query_logs_listing_created ON listing_query_logs(listing_id, created_at DESC);
CREATE INDEX idx_query_logs_unanswered ON listing_query_logs(listing_id, answered) WHERE answered = false;

-- Invocation analytics
CREATE INDEX idx_invocation_logs_capability ON listing_invocation_logs(capability_id, created_at DESC);
```

---

## Edge Functions to Build

| Function | Auth | Purpose |
|---|---|---|
| `vendor-scrape` | None (rate-limited) | Scrape URL → return structured listing data |
| `vendor-go-live` | None (creates account) | Create vendor + listing + campaign + Stripe customer |
| `vendor-upload-docs` | Vendor API key | Ingest documents → chunk → embed → store |
| `vendor-add-capability` | Vendor API key | Create smart capability from template + rules |
| `vendor-set-triggers` | Vendor API key | Set positive/negative conversation signals |
| `query` | Agent API key | Agent asks listing a question (RAG over docs) |
| `invoke` | Agent API key | Agent invokes a capability with inputs |

`query` and `invoke` are the agent-facing endpoints from CP2 and CP3. The `vendor-*` endpoints are new.

---

## Synthetic Preview Generation

When `vendor-go-live` succeeds, we generate preview conversations to show in Card 2. This is a single LLM call.

**Prompt structure:**
```
You are generating a realistic AI agent conversation to show a business
owner what it looks like when an agent recommends their product.

Business: {name}
Description: {description}
Pricing: {pricing.summary}
Geography: {geography}
Trial: {trial}
Category: {detected_category}

Generate a 4-message conversation:
1. User asks about a need that matches this business
2. Agent recommends the business using the facts above
3. User asks a follow-up question that CANNOT be answered from the
   information above (e.g., return policy, specific integration,
   detailed pricing for a custom configuration)
4. Agent says it doesn't have that information

The gap in message 4 should feel like a real missed opportunity.
Make the conversation natural, not salesy.

Return JSON: { messages: [{role, content}], gap_highlighted: string }
```

**Why the gap matters:** It's the emotional hook that makes Card 2 feel like an obvious next step rather than an upsell. The vendor sees exactly what happens when agents don't have enough info — and the enhancement options below are the fix.

---

## What Connects to Existing Code

### `/decide` endpoint changes

The existing `/decide` endpoint needs to start returning listing data (Layer 1 + 1b + 1c) instead of just campaign/ad unit data. This is the bridge between the new listing model and the existing auction system.

**Current `/decide` returns:** campaign creative (title, body, CTA, action_url)
**New `/decide` returns:** listing data + knowledge_base availability + capability schemas

This is a migration, not a rewrite. The auction logic stays the same. The response shape expands.

### SDK client changes

The `AttentionMarketClient` needs new methods:
- `client.queryListing(listingId, question)` — calls `/query`
- `client.invokeCability(listingId, capabilityId, inputs)` — calls `/invoke`

These are additive. Existing methods (`decideFromContext`, `trackConversion`, etc.) stay unchanged.

---

## Build Order

### Phase 1: Card 1 (Get Live)
1. `vendor-scrape` endpoint
2. `vendors` + `listings` + `listing_campaigns` tables (migration)
3. `vendor-go-live` endpoint (including Stripe integration)
4. Frontend: single-page form with auto-fill

### Phase 2: Card 2 (Enhance)
5. Synthetic preview generation (part of `vendor-go-live`)
6. `vendor-upload-docs` endpoint + `listing_docs` + `listing_doc_chunks` tables
7. `vendor-add-capability` endpoint + `listing_capabilities` table
8. `vendor-set-triggers` endpoint + `listing_signals` table
9. Frontend: Card 2 UI with preview + three enhancement sections

### Phase 3: Agent-Facing Endpoints
10. `query` endpoint (RAG over listing docs)
11. `invoke` endpoint (execute capability rules via LLM)
12. Update `/decide` to return listing data + capability schemas
13. SDK: add `queryListing()` and `invokeCapability()` methods

### Phase 4: Dashboard
14. `listing_query_logs` + `listing_invocation_logs` tables
15. Dashboard: conversation feed (what agents said)
16. Dashboard: unanswered questions (clustered, with action buttons)
17. Dashboard: suggested improvements (ranked by estimated impact)

---

## Migration Strategy

The existing system has `advertisers`, `campaigns`, `ad_units`, etc. The new model introduces `vendors`, `listings`, and `listing_campaigns`. We don't want to break the existing system.

**Approach:** Build the new tables alongside the old ones. The `vendor-go-live` endpoint creates entries in BOTH the new `listings` table AND the existing `campaigns` table (for backward compatibility with the auction system). Over time, migrate `/decide` to query `listings` directly.

This means:
- `vendor-go-live` creates a `listings` row AND a `campaigns` row (with the listing_id as a foreign key)
- `/decide` continues to query `campaigns` but joins to `listings` for the richer data
- No existing functionality breaks during the migration

---

## Open Questions (Decide During Build)

1. **Vector DB:** pgvector (in Supabase) vs. external (Pinecone, Weaviate)? Recommend pgvector for MVP — keeps everything in one place, good enough for early scale.

2. **Embedding model:** OpenAI text-embedding-3-small (1536 dims) vs. text-embedding-3-large (3072 dims)? Recommend small for MVP — cheaper, faster, sufficient quality.

3. **LLM for scraping/preview/capability execution:** Claude Haiku (fast, cheap) vs. Sonnet (better quality)? Recommend Haiku for scraping + preview generation, Sonnet for capability execution where accuracy matters.

4. **Stripe integration depth:** Just collect payment method (charge later) vs. create subscription immediately? Recommend: collect payment method only, charge daily based on actual spend. Simpler, lower friction, matches "you won't be charged until agents recommend you."
