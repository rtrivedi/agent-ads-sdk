# Taxonomy Migration Guide
**Upgrading to Revenue-Optimized Taxonomy Structure**

---

## Overview

AttentionMarket is migrating to a new 4-tier taxonomy system designed to maximize advertiser revenue and improve targeting precision.

**Old Format:** `category.subcategory.action`
**New Format:** `vertical.category.subcategory.intent`

**Migration Timeline:**
- ✅ **Today**: New taxonomies available (Phase 1)
- ⚠️ **+30 days**: Old taxonomies deprecated (warnings)
- ❌ **+90 days**: Old taxonomies removed (breaking change)

---

## What's Changing

### Structure
```diff
- shopping.ecommerce.platform
+ business.ecommerce.platform.trial

- local_services.movers.quote
+ home_services.moving.local.quote

- business.productivity.tools
+ business.saas.project_management.trial
```

### Benefits
1. **Better targeting**: More granular options for advertisers
2. **Higher revenue**: Optimized for high-CPC categories
3. **Clearer intent**: Explicit journey stage (research vs. buy)
4. **More scale**: 50+ categories → 200+ categories over time

---

## Complete Migration Mapping

### Shopping & E-commerce

| Old Taxonomy | New Taxonomy | Notes |
|--------------|--------------|-------|
| `shopping.ecommerce.platform` | `business.ecommerce.platform.trial` | Now B2B focused |
| `shopping.online_store` | `business.ecommerce.platform.trial` | Same as above |
| `shopping.store_setup` | `business.ecommerce.platform.trial` | Same as above |
| `shopping.electronics.search` | `shopping.electronics.computers.compare` | More specific |
| `shopping.electronics.phones` | `shopping.electronics.phones.compare` | Added intent |

### Local Services → Home Services

| Old Taxonomy | New Taxonomy | Notes |
|--------------|--------------|-------|
| `local_services.movers.quote` | `home_services.moving.local.quote` | Specify local vs. long-distance |
| `local_services.contractors.home` | `home_services.remodeling.kitchen.quote` | Choose specific service |
| `local_services.cleaning` | `home_services.cleaning.regular.book` | Specify service type |
| `local_services.cleaners.quote` | `home_services.cleaning.regular.book` | Same as above |
| `local_services.plumbers.quote` | `home_services.plumbing.emergency.quote` | Specify emergency vs. installation |
| `local_services.electricians.quote` | `home_services.electrical.repair.quote` | Specify repair vs. installation |
| `local_services.restaurants.search` | `travel.experiences.dining.book` | Moved to travel vertical |
| `local_services.pet_care.dog_walking` | `personal_services.pet_care.walking.book` | New vertical |
| `local_services.lawyers.consultation` | `legal.{specific_practice}.consultation` | Choose practice area |

### Business Tools → Business (B2B)

| Old Taxonomy | New Taxonomy | Notes |
|--------------|--------------|-------|
| `business.productivity.tools` | `business.saas.project_management.trial` | Choose specific SaaS category |
| `business.software.ecommerce` | `business.ecommerce.platform.trial` | Clearer naming |
| `business.startup.tools` | `business.saas.crm.trial` | Choose specific tool type |

### Travel (Already structured well)

| Old Taxonomy | New Taxonomy | Notes |
|--------------|--------------|-------|
| `travel.booking.hotels` | `travel.hotels.luxury.book` | Added specificity |
| `travel.booking.flights` | `travel.flights.domestic.book` | Added specificity |
| `travel.flights.search` | `travel.flights.domestic.compare` | Changed intent |
| `travel.experiences` | `travel.experiences.tours.book` | Added specificity |

---

## For Agent Developers

### Step 1: Audit Your Taxonomies

Find all places where you use taxonomies:

```bash
# Search your codebase
grep -r "taxonomy:" .
grep -r "local_services" .
grep -r "shopping.ecommerce" .
```

### Step 2: Update Taxonomy Mappings

**Before:**
```typescript
function classifyIntent(query: string) {
  if (query.includes('online store')) {
    return { taxonomy: 'shopping.ecommerce.platform' };
  }
  if (query.includes('movers')) {
    return { taxonomy: 'local_services.movers.quote' };
  }
}
```

**After:**
```typescript
function classifyIntent(query: string) {
  // Online store setup → B2B e-commerce platform
  if (query.includes('online store') || query.includes('start selling online')) {
    return { taxonomy: 'business.ecommerce.platform.trial' };
  }

  // Moving services → specify local vs. long-distance
  if (query.includes('movers') || query.includes('moving company')) {
    const isLongDistance = query.match(/cross.country|long.distance|interstate/i);
    return {
      taxonomy: isLongDistance
        ? 'home_services.moving.long_distance.quote'
        : 'home_services.moving.local.quote'
    };
  }
}
```

### Step 3: Add Intent Detection

The new taxonomy requires explicit intent modifiers:

```typescript
function detectIntent(query: string): string {
  // Research intent
  if (query.match(/what is|how does|learn about|tell me about/i)) {
    return 'research';
  }

  // Compare intent
  if (query.match(/best|compare|vs|options|which|top/i)) {
    return 'compare';
  }

  // Quote/pricing intent
  if (query.match(/price|cost|how much|quote|estimate/i)) {
    return 'quote';
  }

  // Trial intent
  if (query.match(/try|demo|free trial|test/i)) {
    return 'trial';
  }

  // Book/schedule intent
  if (query.match(/book|schedule|appointment|reserve/i)) {
    return 'book';
  }

  // Apply intent
  if (query.match(/apply|sign up|get started|register/i)) {
    return 'apply';
  }

  // Consultation intent
  if (query.match(/talk to|speak with|consult|meet with/i)) {
    return 'consultation';
  }

  // Default to compare
  return 'compare';
}

// Usage
function buildTaxonomy(vertical: string, category: string, subcategory: string, query: string): string {
  const intent = detectIntent(query);
  return `${vertical}.${category}.${subcategory}.${intent}`;
}
```

### Step 4: Update SDK Calls

**Before:**
```typescript
const decision = await client.decide({
  placement: { type: 'sponsored_suggestion' },
  context: {
    taxonomy: 'shopping.ecommerce.platform',
    query: userQuery,
    country: 'US'
  }
});
```

**After:**
```typescript
const decision = await client.decide({
  placement: { type: 'sponsored_suggestion' },
  context: {
    taxonomy: 'business.ecommerce.platform.trial', // ← New format
    query: userQuery,
    country: 'US'
  }
});
```

### Step 5: Test

```bash
# Use test environment
export AM_API_KEY="am_test_..."

# Test with new taxonomies
node test-new-taxonomy.ts
```

---

## For Advertisers

### Step 1: Review Your Campaigns

Log into your advertiser dashboard and review targeting taxonomies.

### Step 2: Update Campaign Targeting

**Old Campaign:**
```json
{
  "targeting_taxonomies": ["shopping.ecommerce.platform"]
}
```

**New Campaign:**
```json
{
  "targeting_taxonomies": [
    "business.ecommerce.platform.trial",
    "business.ecommerce.platform.compare",
    "business.ecommerce.platform.research"
  ]
}
```

**Why multiple taxonomies?**
- `.trial` → High intent buyers (higher CPC)
- `.compare` → Researching options (medium CPC)
- `.research` → Early stage (lower CPC)

### Step 3: Adjust Bids by Intent

```yaml
Campaign 1: High Intent
  Taxonomies:
    - business.ecommerce.platform.trial
    - business.ecommerce.platform.apply
  CPC Bid: $8.00

Campaign 2: Medium Intent
  Taxonomies:
    - business.ecommerce.platform.compare
  CPC Bid: $4.00

Campaign 3: Awareness
  Taxonomies:
    - business.ecommerce.platform.research
  CPC Bid: $1.50
```

---

## API Changes

### `/v1/decide` (Agent-facing)

**No breaking changes** - Just update taxonomy format:

```diff
{
  "placement": {"type": "sponsored_suggestion"},
  "context": {
-    "taxonomy": "shopping.ecommerce.platform",
+    "taxonomy": "business.ecommerce.platform.trial",
    "query": "start online store"
  }
}
```

### `/v1/campaign-create` (Advertiser-facing)

**No breaking changes** - Just update taxonomy array:

```diff
{
  "name": "Pietra E-commerce Campaign",
- "targeting_taxonomies": ["shopping.ecommerce.platform"],
+ "targeting_taxonomies": [
+   "business.ecommerce.platform.trial",
+   "business.ecommerce.platform.compare"
+ ],
  "budget": 5000
}
```

---

## Database Migration

### For Self-Hosted Deployments

```sql
-- Update existing campaigns with new taxonomy format
-- Run this AFTER reviewing your mappings

-- Example: Migrate shopping.ecommerce.platform
UPDATE campaigns
SET targeting_taxonomies = ARRAY['business.ecommerce.platform.trial']
WHERE 'shopping.ecommerce.platform' = ANY(targeting_taxonomies);

-- Example: Migrate movers
UPDATE campaigns
SET targeting_taxonomies = ARRAY[
  'home_services.moving.local.quote',
  'home_services.moving.long_distance.quote'
]
WHERE 'local_services.movers.quote' = ANY(targeting_taxonomies);

-- Add multiple intents for broader targeting
UPDATE campaigns
SET targeting_taxonomies = ARRAY[
  'business.ecommerce.platform.trial',
  'business.ecommerce.platform.compare',
  'business.ecommerce.platform.research'
]
WHERE 'business.ecommerce.platform.trial' = ANY(targeting_taxonomies);
```

---

## Backward Compatibility (30-Day Window)

### Automatic Mapping (Temporary)

During the 30-day deprecation period, old taxonomies will auto-map:

```typescript
// Backend automatically converts
'shopping.ecommerce.platform' → 'business.ecommerce.platform.trial'
'local_services.movers.quote' → 'home_services.moving.local.quote'

// You'll see warnings in logs:
// ⚠️  DEPRECATED: 'shopping.ecommerce.platform' is deprecated.
//    Use 'business.ecommerce.platform.trial' instead.
//    Old taxonomies will be removed on 2026-05-04.
```

**Warning logs will appear:**
- In SDK client logs
- In API response headers (`X-Taxonomy-Warning`)
- In advertiser dashboard

---

## Testing Your Migration

### 1. Test with Mock Client

```typescript
import { MockAttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const mockClient = new MockAttentionMarketClient({
  defaultBehavior: 'show',
  defaultCountry: 'US'
});

// Add mock for new taxonomy
mockClient.addMockUnit('business.ecommerce.platform.trial', {
  unit_id: 'unit_test_001',
  unit_type: 'sponsored_suggestion',
  suggestion: {
    title: 'Test Ad',
    body: 'This is a test',
    cta: 'Learn More',
    action_url: 'https://example.com'
  },
  disclosure: {
    label: 'Sponsored',
    sponsor_name: 'Test Company',
    explanation: 'This is a paid advertisement'
  },
  tracking: {
    token: 'test_token'
  }
});

// Test
const decision = await mockClient.decide({
  placement: { type: 'sponsored_suggestion' },
  context: {
    taxonomy: 'business.ecommerce.platform.trial', // ← New taxonomy
    query: 'start online store'
  }
});

console.log(decision); // Should return test ad
```

### 2. Test with Production API

```bash
# Get test API key
export AM_API_KEY="am_test_..."

# Test new taxonomy
curl -X POST https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/decide \
  -H "X-AM-API-Key: $AM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "placement": {"type": "sponsored_suggestion"},
    "context": {
      "taxonomy": "business.ecommerce.platform.trial",
      "query": "start online store",
      "country": "US"
    }
  }'
```

---

## FAQ

### Q: Do I need to update immediately?
**A:** No. You have 90 days. Old taxonomies will work with warnings for 30 days, then break after 90 days.

### Q: What happens if I use an old taxonomy after 90 days?
**A:** API will return `no_fill` (no ads) and log an error.

### Q: Can I target multiple intents in one campaign?
**A:** Yes! This is recommended for broader reach:
```javascript
targeting_taxonomies: [
  'business.ecommerce.platform.trial',    // High intent
  'business.ecommerce.platform.compare',  // Medium intent
  'business.ecommerce.platform.research'  // Low intent
]
```

### Q: What if I don't know the user's intent?
**A:** Omit the intent modifier and it defaults to `.compare`:
```javascript
taxonomy: 'business.ecommerce.platform'  // Same as .compare
```

### Q: Are old taxonomies completely gone?
**A:** Yes, after 90 days. They won't match any campaigns.

### Q: Will my existing campaigns stop working?
**A:** Only if you don't migrate them. Update your `targeting_taxonomies` before the deadline.

### Q: How do I request a new taxonomy?
**A:** Submit a request via the advertiser/agent dashboard. Reviewed quarterly.

---

## Support

**Questions?**
- Email: support@attentionmarket.com
- Docs: https://docs.attentionmarket.com
- Migration tool: Coming soon (auto-migrate campaigns)

**Need help migrating?**
- Book consultation: https://attentionmarket.com/migrate
- Join Slack: https://attentionmarket.com/slack
