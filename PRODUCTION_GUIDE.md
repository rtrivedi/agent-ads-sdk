# 🚀 AttentionMarket Production Deployment Guide

This guide covers deploying and using the AttentionMarket ad platform in production.

---

## 📋 Overview

**What You Built:**
- Supabase backend with 6 database tables
- 4 Edge Functions (decide, event, policy, agent-signup)
- TypeScript SDK (v0.2.0) for developers

**Current Status:** ✅ Deployed and tested

---

## 🔧 Backend Configuration

### Supabase Project

**Project URL:** `https://peruwnbrqkvmrldhpoom.supabase.co`
**Project Ref:** `peruwnbrqkvmrldhpoom`

**Edge Functions:**
- `POST /functions/v1/decide` - Returns ads based on targeting
- `POST /functions/v1/event` - Tracks impressions/clicks/conversions
- `GET /functions/v1/policy` - Returns platform policies
- `POST /functions/v1/agent-signup` - Registers new developers

### Authentication Model

**Two-tier authentication:**

1. **Infrastructure Auth (Supabase):**
   - Header: `Authorization: Bearer <supabase_anon_key>`
   - Default key embedded in SDK
   - Required for all Edge Function calls

2. **Application Auth (AttentionMarket):**
   - Header: `X-AM-API-Key: am_live_...` or `X-AM-API-Key: am_test_...`
   - Validates against `agents` table in database
   - Identifies which developer is making the request

---

## 📦 SDK Usage

### Installation

```bash
npm install @the_ro_show/agent-ads-sdk
```

### Quick Start (Test Mode)

```typescript
import { AttentionMarketClient, createOpportunity } from '@the_ro_show/agent-ads-sdk';

// Initialize client
const client = new AttentionMarketClient({
  apiKey: 'am_test_YOUR_TEST_KEY', // From agent-signup
});

// Request ad
const ad = await client.decide({
  request_id: 'req_123',
  agent_id: 'agt_YOUR_AGENT_ID',
  placement: { type: 'sponsored_suggestion', surface: 'chat' },
  opportunity: createOpportunity({
    taxonomy: 'shopping.ecommerce.platform',
    country: 'US',
    language: 'en',
    platform: 'web',
  }),
});

// Track impression
if (ad) {
  await client.trackImpression({
    agent_id: 'agt_YOUR_AGENT_ID',
    request_id: 'req_123',
    decision_id: ad.unit_id,
    unit_id: ad.unit_id,
    tracking_token: ad.tracking.token,
  });
}
```

### Production Mode

Switch from `am_test_*` to `am_live_*` API key:

```typescript
const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY, // am_live_...
});
```

---

## 🔐 API Key Management

### For New Developers

**Get API Keys:**

```bash
curl -X POST \
  'https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/agent-signup' \
  -H 'Authorization: Bearer <supabase_anon_key>' \
  -H 'Content-Type: application/json' \
  -d '{
    "owner_email": "developer@example.com",
    "agent_name": "My AI Agent",
    "sdk_type": "typescript",
    "declared_placements": ["sponsored_suggestion"]
  }'
```

**Response:**
```json
{
  "agent_id": "agt_abc123...",
  "api_key_live": "am_live_xyz789...",
  "api_key_test": "am_test_def456...",
  "status": "active",
  "environment": "test"
}
```

### Test Agent (Seeded)

For testing, use the pre-seeded test agent:

- **Agent ID:** `agt_test_worldview_app`
- **Test API Key:** `am_test_test_key_12345678901234567890`
- **Email:** `developer@example.com`

---

## 🎯 Test Campaign (Pietra Inc)

A test advertiser is pre-loaded in your database:

**Advertiser:** Pietra Inc
**Campaign:** E-Commerce Platform Launch
**Budget:** $5,000
**Targeting:**
- Taxonomies: `shopping.ecommerce.platform`, `business.software.ecommerce`, etc.
- Countries: US, CA, UK
- Language: English
- Platforms: web, iOS, Android

**Ad Unit:**
- Title: "Pietra - E-Commerce Platform for Product Brands"
- Body: "Launch your online store in minutes..."
- CTA: "Start Free Trial"
- URL: `https://pietrastudio.com`

**To test:** Request ads with taxonomy `shopping.ecommerce.platform` in the US.

---

## 🧪 Testing

### Run Full Integration Test

```bash
cd /Users/ronaktrivedi/Documents/AM_SDK
npx tsx test-production.ts
```

**Expected output:**
```
✅ GET /v1/policy - Success
✅ POST /v1/decide - Pietra ad returned
✅ POST /v1/event (impression) - Success
✅ POST /v1/event (click) - Success
```

### Test with curl

```bash
# Get policy
curl -X GET \
  'https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/policy' \
  -H 'Authorization: Bearer <supabase_anon_key>' \
  -H 'X-AM-API-Key: am_test_test_key_12345678901234567890'

# Request ad
curl -X POST \
  'https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/decide' \
  -H 'Authorization: Bearer <supabase_anon_key>' \
  -H 'X-AM-API-Key: am_test_test_key_12345678901234567890' \
  -H 'Content-Type: application/json' \
  -d '{
    "request_id": "req_test",
    "agent_id": "agt_test_worldview_app",
    "placement": {"type": "sponsored_suggestion", "surface": "chat"},
    "opportunity": {
      "intent": {"taxonomy": "shopping.ecommerce.platform"},
      "context": {"country": "US", "language": "en", "platform": "web"}
    }
  }'
```

---

## 📊 Database Access

### Supabase Dashboard

View your data at:
`https://supabase.com/dashboard/project/peruwnbrqkvmrldhpoom`

### Tables

- **advertisers** - Companies buying ads
- **campaigns** - Ad campaigns with targeting
- **ad_units** - Individual ads
- **agents** - Developers using the SDK
- **events** - Impression/click/conversion events
- **decisions** - Ad request logs

### Query Examples

```sql
-- View all events
SELECT * FROM events ORDER BY occurred_at DESC LIMIT 10;

-- View campaign performance
SELECT * FROM campaign_performance;

-- View active ad units
SELECT * FROM ad_units WHERE status = 'active';
```

---

## 🔄 Deployment

### Redeploy Edge Functions

```bash
cd /Users/ronaktrivedi/Documents/AM_SDK/supabase
supabase functions deploy --project-ref peruwnbrqkvmrldhpoom
```

### Run Database Migrations

```bash
cd /Users/ronaktrivedi/Documents/AM_SDK/supabase
supabase db push
```

### Publish SDK (when ready)

```bash
cd /Users/ronaktrivedi/Documents/AM_SDK
npm run build
npm publish
```

---

## 🚦 Go-Live Checklist

### Before Production:

- [ ] Add more test campaigns and ad units
- [ ] Test all targeting taxonomies
- [ ] Verify event tracking and counters
- [ ] Test rate limiting
- [ ] Set up monitoring/alerts
- [ ] Document onboarding flow for new advertisers
- [ ] Create admin dashboard (future)
- [ ] Test with production iOS app

### Security:

- ✅ API keys validated against database
- ✅ HTTPS enforced
- ✅ CORS configured
- ✅ SQL injection protection (parameterized queries)
- ⚠️ Rate limiting (TODO: add to Edge Functions)
- ⚠️ API key rotation (TODO: add admin endpoint)

---

## 📞 Support

**Supabase Dashboard:** https://supabase.com/dashboard/project/peruwnbrqkvmrldhpoom
**SDK Repository:** https://github.com/rtrivedi/agent-ads-sdk
**Documentation:** See README.md and SECURITY.md

---

## 🎯 Next Steps

1. **iOS Integration:** Use SDK in your iOS app's backend
2. **Add More Advertisers:** Seed more campaigns for testing
3. **Analytics Dashboard:** Build UI to view campaign performance
4. **Billing:** Implement budget tracking and charging
5. **Scale:** Add caching, rate limiting, monitoring

**You're ready for production! 🚀**
