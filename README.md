# AttentionMarket Agent Ads SDK

[![npm version](https://badge.fury.io/js/@the_ro_show%2Fagent-ads-sdk.svg)](https://www.npmjs.com/package/@the_ro_show/agent-ads-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

**The first ad network built for AI agents.** Monetize your AI agent with contextual, high-intent sponsored suggestions. Open source, transparent, developer-first.

- 🚀 **5-minute integration** - npm install + 5 lines of code
- 💰 **70% revenue share** - You keep the majority, we only win when you do
- 🎯 **10-15% CTR** - High-intent placements, not banner ads
- 🔓 **100% Open Source** - Audit every line, full transparency

## Quick Start

### 1. Get Your API Key

**Sign up at [attentionmarket.com/signup](https://attentionmarket.com/signup)** (30 seconds, free forever)

You'll receive:
- Test key: `am_test_...` (for development)
- Live key: `am_live_...` (for production)

### 2. Install

```bash
npm install @the_ro_show/agent-ads-sdk
```

### 3. Integrate (5 lines of code)

```typescript
import { AttentionMarketClient, detectIntent, buildTaxonomy } from '@the_ro_show/agent-ads-sdk';

const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY  // Your test or live key
});

// When your agent helps users, show relevant ads
const userQuery = "I need car insurance for my Honda";
const intent = detectIntent(userQuery);  // → "quote" or "compare" or "research"
const taxonomy = buildTaxonomy('insurance', 'auto', 'full_coverage', intent);

const decision = await client.decide({
  request_id: crypto.randomUUID(),
  agent_id: 'your_agent_id',
  placement: { type: 'sponsored_suggestion' },
  opportunity: {
    intent: { taxonomy },  // "insurance.auto.full_coverage.quote"
    context: { country: 'US', language: 'en', platform: 'web' }
  }
});

if (decision.status === 'filled') {
  const ad = decision.units[0];
  console.log(`[Sponsored] ${ad.suggestion.title}`);
  // User clicks → You earn $5-50
}
```

**That's it!** Start earning from relevant ads.

---

## 🆕 What's New in v0.4.0

### Hierarchical Taxonomy Matching

Target broadly, match specifically:

```typescript
// Advertiser targets: "insurance.auto"
// Your agent requests: "insurance.auto.full_coverage.quote"
// ✅ Matches! (0.7 relevance score)

// Your agent requests: "insurance.auto.liability.compare"
// ✅ Also matches! (0.7 relevance score)

// Your agent requests: "insurance.home.flood.quote"
// ❌ No match (different category)
```

**Result:** 3x more ad inventory, higher fill rates.

### New Helper Functions

**Auto-detect user intent:**
```typescript
import { detectIntent } from '@the_ro_show/agent-ads-sdk';

detectIntent("What is car insurance?")           // → 'research'
detectIntent("Compare car insurance options")    // → 'compare'
detectIntent("Get car insurance quote")          // → 'quote'
detectIntent("I want to buy car insurance")      // → 'apply'
```

**Build taxonomies easily:**
```typescript
import { buildTaxonomy } from '@the_ro_show/agent-ads-sdk';

const taxonomy = buildTaxonomy('insurance', 'auto', 'full_coverage', 'quote');
// → "insurance.auto.full_coverage.quote"
```

**Get taxonomy suggestions:**
```typescript
import { suggestTaxonomies } from '@the_ro_show/agent-ads-sdk';

const suggestions = suggestTaxonomies("I need a lawyer for divorce");
// → ['legal.family.divorce.consultation', 'legal.family.custody.consultation']
```

**Validate taxonomies:**
```typescript
import { isValidTaxonomy, parseTaxonomy } from '@the_ro_show/agent-ads-sdk';

isValidTaxonomy('insurance.auto.full_coverage.quote')  // → true
isValidTaxonomy('invalid.format')                      // → false

const parsed = parseTaxonomy('insurance.auto.full_coverage.quote');
// → { vertical: 'insurance', category: 'auto', subcategory: 'full_coverage', intent: 'quote' }
```

---

## Common Taxonomies

### Insurance ($20-54 CPC)
```typescript
'insurance.auto.full_coverage.quote'
'insurance.auto.liability.compare'
'insurance.home.standard.quote'
'insurance.life.term.compare'
'insurance.health.individual.quote'
```

### Legal ($50-150 CPC)
```typescript
'legal.personal_injury.accident.consultation'
'legal.family.divorce.consultation'
'legal.criminal.defense.consultation'
'legal.immigration.visa.consultation'
'legal.estate_planning.will.consultation'
```

### Financial Services ($15-50 CPC)
```typescript
'financial.loans.personal.quote'
'financial.loans.mortgage.compare'
'financial.credit_cards.rewards.compare'
'financial.investing.brokerage.trial'
```

### B2B SaaS ($10-100 CPC)
```typescript
'business.saas.crm.trial'
'business.saas.project_management.trial'
'business.ecommerce.platform.trial'
'business.saas.marketing_automation.trial'
```

### Home Services ($5-30 CPC)
```typescript
'home_services.moving.local.quote'
'home_services.cleaning.regular.book'
'home_services.plumbing.emergency.quote'
'home_services.remodeling.kitchen.quote'
```

**See all 50+ taxonomies:** [TAXONOMY_SYSTEM.md](./TAXONOMY_SYSTEM.md)

---

## Complete Example

```typescript
import {
  AttentionMarketClient,
  buildTaxonomy,
  detectIntent
} from '@the_ro_show/agent-ads-sdk';

const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY
});

async function showRelevantAd(userQuery: string) {
  // 1. Detect what the user wants
  const intent = detectIntent(userQuery);

  // 2. Build taxonomy (or use your own logic)
  let taxonomy: string;
  if (/insurance|car|auto/i.test(userQuery)) {
    taxonomy = buildTaxonomy('insurance', 'auto', 'full_coverage', intent);
  } else if (/lawyer|legal|divorce/i.test(userQuery)) {
    taxonomy = buildTaxonomy('legal', 'family', 'divorce', 'consultation');
  } else {
    return null; // No relevant ads
  }

  // 3. Request ads
  const decision = await client.decide({
    request_id: crypto.randomUUID(),
    agent_id: 'your_agent_id',
    placement: { type: 'sponsored_suggestion' },
    opportunity: {
      intent: { taxonomy },
      context: {
        country: 'US',
        language: 'en',
        platform: 'web'
      }
    }
  });

  // 4. Show ad if available
  if (decision.status === 'filled') {
    const ad = decision.units[0];

    console.log(`\n[${ad.disclosure.label}] ${ad.disclosure.sponsor_name}`);
    console.log(ad.suggestion.title);
    console.log(ad.suggestion.body);
    console.log(`→ ${ad.suggestion.cta}\n`);

    // 5. Track impression (for billing)
    await client.trackImpression({
      agent_id: 'your_agent_id',
      request_id: decision.request_id,
      decision_id: decision.decision_id,
      unit_id: ad.unit_id,
      tracking_token: ad.tracking.token
    });

    // 6. Track click when user clicks (you earn money!)
    // await client.trackClick({ ... });

    return ad;
  }

  return null; // No ads available
}

// Example usage
await showRelevantAd("I need car insurance for my Honda");
await showRelevantAd("I need a divorce lawyer in California");
```

---

## API Reference

### Client Methods

**`client.decide(request)`** - Get ads (convenience method)
```typescript
const decision = await client.decide({
  request_id: crypto.randomUUID(),
  agent_id: 'your_agent_id',
  placement: { type: 'sponsored_suggestion' },
  opportunity: {
    intent: { taxonomy: 'insurance.auto.full_coverage.quote' },
    context: { country: 'US', language: 'en', platform: 'web' }
  }
});
```

**`client.decideRaw(request)`** - Get full response with metadata
```typescript
const response = await client.decideRaw(request);
// Returns: { status, request_id, decision_id, units[], ttl_ms }
```

**`client.trackImpression(params)`** - Track when ad is shown
```typescript
await client.trackImpression({
  agent_id: 'your_agent_id',
  request_id: 'req_123',
  decision_id: 'dec_456',
  unit_id: 'unit_789',
  tracking_token: 'trk_abc'
});
```

**`client.trackClick(params)`** - Track when ad is clicked (you earn $)
```typescript
await client.trackClick({
  agent_id: 'your_agent_id',
  request_id: 'req_123',
  decision_id: 'dec_456',
  unit_id: 'unit_789',
  tracking_token: 'trk_abc',
  href: 'https://advertiser.com'
});
```

### Helper Functions

- `buildTaxonomy(vertical, category, subcategory, intent?)` - Build taxonomy string
- `detectIntent(query)` - Auto-detect user intent from query
- `suggestTaxonomies(query)` - Get relevant taxonomy suggestions
- `isValidTaxonomy(taxonomy)` - Validate taxonomy format
- `parseTaxonomy(taxonomy)` - Parse taxonomy into components
- `getBaseTaxonomy(taxonomy)` - Get taxonomy without intent
- `matchesTaxonomy(tax1, tax2)` - Check if taxonomies match
- `getVertical(taxonomy)` - Extract industry vertical

### Security Helpers

- `escapeHTML(text)` - Escape HTML to prevent XSS
- `sanitizeURL(url)` - Validate and sanitize URLs

**Always sanitize ad content before rendering!**

---

## Testing

### Mock Client (No API calls)

```typescript
import { MockAttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const client = new MockAttentionMarketClient({
  fillRate: 1.0,     // Always return ads
  latencyMs: 100,    // Simulate API latency
  verbose: true      // Log activity
});

// Works exactly like real client, but returns mock data
const decision = await client.decide(request);
```

### Test Taxonomies

Use your test key with real API:
```typescript
const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_TEST_KEY  // am_test_...
});
```

---

## Security

### ⚠️ CRITICAL: Server-Side Only

**Never use this SDK in browsers or mobile apps.** Your API key has full access to your account.

✅ **Safe:** Node.js, serverless functions, server-side rendering
❌ **Unsafe:** Browser JavaScript, React/Vue components, mobile apps

### Sanitize Ad Content

Always escape ad content before rendering:

```typescript
import { escapeHTML, sanitizeURL } from '@the_ro_show/agent-ads-sdk';

const safeTitle = escapeHTML(ad.suggestion.title);
const safeURL = sanitizeURL(ad.suggestion.action_url);

if (safeURL) {
  element.innerHTML = `<a href="${safeURL}">${safeTitle}</a>`;
}
```

**See [SECURITY.md](./SECURITY.md) for complete guidelines.**

---

## Examples

**Minimal integrations** (< 80 lines):
- [Claude Tool Use](./examples/claude-tool-use-minimal.ts)
- [OpenAI Function Calling](./examples/openai-function-calling-minimal.ts)
- [Google Gemini](./examples/gemini-function-calling-minimal.ts)

**Full integrations** (production-ready):
- [Claude Complete](./examples/claude-tool-use-full.ts)
- [OpenAI Complete](./examples/openai-function-calling-full.ts)
- [Safe Web Rendering](./examples/safe-web-rendering.ts)

Run any example:
```bash
npx tsx examples/claude-tool-use-minimal.ts
```

---

## Documentation

- **[Simple Integration Guide](./SIMPLE_INTEGRATION_GUIDE.md)** - Step-by-step for beginners
- **[Taxonomy System](./TAXONOMY_SYSTEM.md)** - Complete taxonomy reference
- **[Migration Guide](./TAXONOMY_MIGRATION_GUIDE.md)** - Upgrading from older versions
- **[Security Guide](./SECURITY.md)** - Security best practices
- **[Advertiser Guide](./ADVERTISER_ONBOARDING_GUIDE.md)** - For advertisers

---

## Features

- ✅ **Hierarchical matching** - Advertisers target broadly, agents match specifically
- ✅ **Auto-intent detection** - Automatically detect research vs quote vs apply
- ✅ **50+ high-value taxonomies** - Insurance, legal, finance, B2B SaaS, and more
- ✅ **TypeScript support** - Full type definitions included
- ✅ **Automatic retries** - Exponential backoff for failed requests
- ✅ **Mock client** - Test without API calls
- ✅ **Security helpers** - XSS protection, URL sanitization
- ✅ **Zero dependencies** - No external runtime dependencies

---

## Pricing

**Free to use.** You earn money when users click ads:

- **Insurance:** $20-54 per click
- **Legal:** $50-150 per click
- **Financial:** $15-50 per click
- **B2B SaaS:** $10-100 per click
- **Home Services:** $5-30 per click

**You keep 70% of revenue.** Paid monthly via Stripe.

---

## Requirements

- Node.js 18 or higher
- TypeScript 5.3+ (for development)

---

## Support

- **Issues:** [GitHub Issues](https://github.com/rtrivedi/agent-ads-sdk/issues)
- **Docs:** [SIMPLE_INTEGRATION_GUIDE.md](./SIMPLE_INTEGRATION_GUIDE.md)
- **Email:** support@attentionmarket.com

---

## License

MIT

---

## Changelog

### v0.4.0 (2026-02-03)

**New Features:**
- ✨ Hierarchical taxonomy matching (3x more inventory)
- ✨ `buildTaxonomy()` helper function
- ✨ `detectIntent()` auto-intent detection
- ✨ `suggestTaxonomies()` get relevant taxonomies
- ✨ `isValidTaxonomy()` and `parseTaxonomy()` validators
- ✨ 50 Phase 1 high-value taxonomies (insurance, legal, finance, etc.)

**Improvements:**
- 🎯 Relevance scoring (1.0 → 0.9 → 0.7 → 0.5)
- 🔄 Backward compatibility for old taxonomies (90-day migration window)
- 📚 Complete taxonomy documentation

**Breaking Changes:**
- None! Fully backward compatible.

### v0.2.1

- Initial public release
- Multi-ad response support
- Mock client for testing
- Security helpers (escapeHTML, sanitizeURL)
