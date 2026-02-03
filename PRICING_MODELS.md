# AttentionMarket Pricing Models

## Supported Models

### 1. CPM (Cost Per Mille) - Cost Per 1000 Impressions
- Advertiser pays for ad visibility
- Best for: Brand awareness, high-volume campaigns
- Example: $5.50 CPM = advertiser pays $5.50 per 1,000 impressions

### 2. CPC (Cost Per Click) - Cost Per Click
- Advertiser pays only when user clicks
- Best for: Performance marketing, ROI-focused campaigns
- Example: $0.50 CPC = advertiser pays $0.50 per click

---

## How Campaigns Choose Their Model

When creating a campaign, advertiser sets:
- **CPM campaigns**: `bid_cpm = 5.50`, `bid_cpc = NULL`
- **CPC campaigns**: `bid_cpm = NULL`, `bid_cpc = 0.50`
- **Hybrid** (future): Set both, use whichever performs better

---

## Scoring Logic (How We Rank Ads)

### Problem: How do we compare CPM vs CPC campaigns in the same auction?

**Solution: Normalize to eCPM (effective CPM)**

```
CPM campaign: eCPM = bid_cpm
CPC campaign: eCPM = bid_cpc × 1000 × estimated_CTR
```

**Example:**
- Campaign A: CPM = $5.50 → eCPM = $5.50
- Campaign B: CPC = $0.50, CTR = 2% → eCPM = $0.50 × 1000 × 0.02 = $10.00

Campaign B wins! (Higher eCPM)

### Composite Score Formula
```
composite_score = eCPM × quality_score × relevance
```

---

## Implementation Phases

### Phase 1 (NOW - MVP)
- ✅ Support CPM campaigns only
- ✅ Simple scoring: `bid_cpm × quality × relevance`
- ✅ Get advertisers onboarded quickly

### Phase 2 (Next 3 months)
- ✅ Support CPC campaigns
- ✅ Track CTR per campaign (clicks / impressions)
- ✅ Use historical CTR for eCPM calculation
- ✅ Unified auction (CPM + CPC compete together)

### Phase 3 (6-12 months)
- ✅ CPA (Cost Per Action) - pay for conversions
- ✅ Real-time CTR prediction (ML model)
- ✅ Dynamic bidding

---

## Why Start with CPM for MVP

**1. Simpler to build**
- No CTR estimation needed
- No click tracking required for billing
- Straightforward pricing

**2. Easier to sell initially**
- "You pay $100, we guarantee 10,000 impressions"
- Predictable spend for advertiser
- Easier to explain value prop

**3. Lower risk for you**
- You get paid regardless of performance
- Don't need proven CTR data yet
- Cash flow from day 1

**But add CPC within 3 months** - it's what performance marketers want.

---

## Recommended Startup Pricing Strategy

### Month 1-2: CPM Only
- Prove the platform works
- Get baseline CTR data
- Focus: Volume + fill rate

### Month 3-4: Add CPC Option
- "We now support performance-based pricing!"
- Attract ROI-focused advertisers
- Focus: Click quality + conversions

### Month 6+: Optimize Both
- CPM for brand campaigns
- CPC for direct response
- Best of both worlds

---

## Database Schema (Already Ready!)

```sql
campaigns:
  bid_cpm      DECIMAL(10,2)  -- NULL if CPC campaign
  bid_cpc      DECIMAL(10,2)  -- NULL if CPM campaign
  pricing_model TEXT           -- 'cpm' | 'cpc' | 'cpa'

events:
  event_type   TEXT            -- 'impression' | 'click' | 'conversion'

-- Billing happens by counting events:
-- CPM: COUNT(*) WHERE event_type = 'impression' / 1000 × bid_cpm
-- CPC: COUNT(*) WHERE event_type = 'click' × bid_cpc
```

---

## Example: Both Models in Action

**Advertiser A (Brand - Coca-Cola)**
- Goal: Awareness
- Model: CPM
- Bid: $8.00 CPM
- Budget: $10,000 → 1,250,000 guaranteed impressions

**Advertiser B (Performance - Shopify)**
- Goal: Signups
- Model: CPC
- Bid: $2.00 CPC
- Budget: $10,000 → ~5,000 clicks (if CTR = 2%)

**Both compete in same auction!**
- Coca-Cola eCPM = $8.00
- Shopify eCPM = $2.00 × 1000 × 0.02 = $40.00

Shopify wins (willing to pay more per impression because they convert well).

---

## Bottom Line

**You're right: CPC is critical for startups.**

But **launch with CPM first** (simpler), then **add CPC fast** (within 3 months).

Your database already supports both. Just need to:
1. Add `pricing_model` column to campaigns
2. Update scoring logic to calculate eCPM
3. Track CTR per campaign
4. Bill based on event type

Want me to implement the CPC scoring logic now? Or wait until you have some CTR data from CPM campaigns?
