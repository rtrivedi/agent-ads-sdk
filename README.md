# AttentionMarket Agent Ads SDK

[![npm version](https://badge.fury.io/js/@the_ro_show%2Fagent-ads-sdk.svg)](https://www.npmjs.com/package/@the_ro_show/agent-ads-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

Ad network for AI agents. Pass user messages, get contextually relevant ads, earn revenue.

**Simple integration. High revenue. Production-ready.**

```bash
npm install @the_ro_show/agent-ads-sdk
```

## How It Works

```typescript
// User asks your AI agent
const userMessage = "I need car insurance";

// Get a relevant ad
const ad = await client.decideFromContext({ userMessage });

// Show it to the user
console.log(ad.creative.title);    // → "Get 20% off car insurance"
console.log(ad.creative.body);     // → "Compare quotes in minutes"
console.log(ad.creative.cta);      // → "Get a Quote"
console.log(ad.click_url);         // → Auto-tracking URL

// That's it! Clicks track automatically when user follows the link
```

**Result:**
```
User: "My car insurance renewal is coming up and the price went up a lot.
      Should I shop around?"

AI Agent: Yes, definitely worth shopping around! Prices can vary significantly
between providers. Here are some well-rated options to compare:

1. State Farm - Large national provider with local agents
2. Geico - Known for competitive online quotes
3. Allstate - Comprehensive coverage options

Also, I have access to a special deal - 20% off with Progressive where
you can compare quotes in minutes. Want me to send you the link?

User: "Sure, send it over"

AI Agent: Here you go! This should help you compare and save:
https://progressive.com/quote?ref=am_abc123

💰 You earn $5-$150 per click | 70% revenue share
```

## Why This SDK

**For AI Agent Developers:**
- **$5-$150 per click** - High-value leads (insurance, legal, finance, B2B)
- **70% revenue share** - You keep most of the earnings
- **No user friction** - Free for users, monetize without paywalls
- **2 functions** - Simple API: init, get ads (clicks track automatically)
- **Production-ready** - Rate limiting, error handling, retry logic built-in

---

## Quick Start

### 1. Get API Key

Sign up at [api.attentionmarket.ai](https://api.attentionmarket.ai) to receive:
- Test key: `am_test_...`
- Live key: `am_live_...`
- Agent ID

### 2. Basic Usage

```typescript
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY,
  agentId: 'your_agent_id'
});

// Get an ad
const ad = await client.decideFromContext({
  userMessage: "I need car insurance"
});

if (ad) {
  console.log(ad.creative.title);      // "Get 20% off car insurance"
  console.log(ad.creative.body);       // "Compare quotes in minutes"
  console.log(ad.creative.cta);        // "Get a Quote"
  console.log(ad.click_url);           // Auto-tracking URL

  // That's it! Share ad.click_url with user
  // Clicks track automatically, you get paid
}
```

---

## Core API

### Get Ads

```typescript
const ad = await client.decideFromContext({
  userMessage: "I need car insurance"
});
```

Returns: `creative.title`, `creative.body`, `creative.cta`, `click_url`

**All URLs auto-track clicks** - No manual tracking code needed!

When user clicks any link, we:
1. Track the click automatically
2. Redirect to advertiser
3. Credit your account

Works in chat apps, emails, SMS, web apps - anywhere users can click links.

---

### Track Clicks

**✅ Automatic (Recommended)**

Clicks track automatically - no code needed! Just share the ad URL:

```typescript
const ad = await client.decideFromContext({ userMessage });

// Share this with users - clicks track automatically
const link = ad.click_url;

// Works in: chat apps, email, SMS, web apps, anywhere
```

**📊 Optional: Track Impressions**

Track when you *show* an ad (before user clicks):

```typescript
await client.track({
  agent_id: 'your_agent_id',
  event_type: 'ad_impression',
  metadata: {
    decision_id: ad.offer_id,
    unit_id: ad.offer_id,
    surface: 'chat_message'
  }
});
```

<details>
<summary>Advanced: Manual click tracking (legacy)</summary>

If you need to track clicks manually (not recommended - auto-tracking is easier):

```typescript
// Before redirecting to ad.click_url
await client.trackClickFromAd(ad, {
  click_context: "What you showed the user"
});

// Then redirect: window.location.href = ad.click_url
```

**Note:** Auto-tracking is simpler and works in more scenarios (email, SMS, etc).

</details>

---

## API Reference

### Essential Functions

#### `new AttentionMarketClient(config)`
Initialize the SDK with your API key and agent ID

```typescript
const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY,
  agentId: 'your_agent_id'
});
```

#### `client.decideFromContext(params)`
Get a contextually relevant ad based on user's message

```typescript
const ad = await client.decideFromContext({
  userMessage: "I need car insurance"
});
// Returns: { creative, click_url, tracking_url, tracking_token, ... }
```

#### `ad.click_url` ⭐ NEW: Auto-tracking
All ad URLs now track clicks automatically via server-side redirects

```typescript
const ad = await client.decideFromContext({ userMessage });

// Just share this URL - clicks track automatically!
const link = ad.click_url;

// When user clicks:
// 1. We track the click
// 2. User is redirected to advertiser
// 3. You get paid
```

**No manual tracking code needed.** Works in chat apps, emails, SMS, anywhere.

#### `client.track(event)` (Optional)
Track impressions or custom events

```typescript
await client.track({
  agent_id: 'your_agent_id',
  event_type: 'ad_impression',
  metadata: {
    decision_id: ad.offer_id,
    surface: 'chat'
  }
});
```

### Testing

#### `MockAttentionMarketClient`
Mock client for testing without API calls

```typescript
import { MockAttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const client = new MockAttentionMarketClient({
  fillRate: 1.0,     // Always return ads
  latencyMs: 100,    // Simulate API latency
  verbose: true      // Log activity
});
```

### Utilities

#### `escapeHTML(text)` & `sanitizeURL(url)`
Sanitize ad content before rendering in HTML

```typescript
import { escapeHTML, sanitizeURL } from '@the_ro_show/agent-ads-sdk';

const safeTitle = escapeHTML(ad.creative.title);
const safeURL = sanitizeURL(ad.click_url);
```

---

## Advanced Features

<details>
<summary><strong>Click to view: Complete example, testing, security, and advanced APIs</strong></summary>

<br>

### Complete Example

Full integration including ad retrieval, display, and click tracking:

```typescript
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY,
  agentId: 'your_agent_id'
});

async function handleUserMessage(userMessage: string) {
  const ad = await client.decideFromContext({ userMessage });

  if (!ad) {
    return null;  // No ads available
  }

  // Display ad (customize as needed)
  const displayMessage = `\n[Sponsored] ${ad.disclosure.sponsor_name}\n${ad.creative.title}\n${ad.creative.body}\n${ad.creative.cta}\n`;
  console.log(displayMessage);

  // Track click when user clicks
  await client.trackClick({
    agent_id: 'your_agent_id',
    request_id: ad.request_id,
    decision_id: ad.offer_id,
    unit_id: ad.offer_id,
    tracking_token: ad.tracking_token,
    href: ad.click_url,
    click_context: displayMessage  // What was actually shown
  });

  return ad;
}
```

---

### Testing

#### `MockAttentionMarketClient`

Mock client for testing without API calls. Simulates latency and fill rate behavior.

```typescript
import { MockAttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const client = new MockAttentionMarketClient({
  fillRate: 1.0,     // Always return ads (0.0 = never, 0.5 = 50%)
  latencyMs: 100,    // Simulate API latency
  verbose: true      // Log activity
});

// Works exactly like the real client
const ad = await client.decideFromContext({ userMessage: "test" });
```

---

### Using Test vs Live Keys

**Test Environment:**
```typescript
const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_TEST_KEY  // am_test_...
});
```

**Production Environment:**
```typescript
const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY  // am_live_...
});
```

---

### Security

#### Server-Side Only

**IMPORTANT:** This SDK must run server-side. Never expose your API key in client-side code.

**✅ Supported:**
- Node.js servers
- Serverless functions (AWS Lambda, Vercel, Cloudflare Workers)
- Server-side rendering (Next.js, Remix)

**❌ Not supported:**
- Browser JavaScript
- Client-side React/Vue/Angular
- Mobile apps

#### API Key Management

Store your API key in environment variables:

```bash
export ATTENTIONMARKET_API_KEY=am_live_...
```

Never commit API keys to version control. Add to `.gitignore`:

```
.env
.env.local
```

#### Sanitize Ad Content

Ad content comes from third-party advertisers. Always sanitize before rendering in HTML:

```typescript
import { escapeHTML, sanitizeURL } from '@the_ro_show/agent-ads-sdk';

const safeTitle = escapeHTML(ad.creative.title);
const safeURL = sanitizeURL(ad.click_url);

if (safeURL) {
  element.innerHTML = `<a href="${safeURL}">${safeTitle}</a>`;
}
```

---

### Manual Category Targeting

#### `decide()` - Specify exact categories

When you know the exact category, use manual taxonomy matching for deterministic results.

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

See [TAXONOMY_SYSTEM.md](./TAXONOMY_SYSTEM.md) for all categories.

---

### 🌐 Intenture Network APIs (Agent-to-Agent)

#### `requestOffer()` - Intent-key based matching

When you KNOW what the user wants (they said "order coffee" or "book lawyer"), use intent-keys like `coffee.purchase.delivery` for deterministic matching.

```typescript
const offer = await client.requestOffer({
  placementId: 'order_card',
  intentKey: 'coffee.purchase.delivery',
  context: { geo: { city: 'SF', country: 'US' } }
});
```

#### `requestOfferFromContext()` - Semantic discovery

When you're NOT sure what they need (they said "I'm so tired"), pass the conversation and let semantic search find relevant offers.

```typescript
const offer = await client.requestOfferFromContext({
  placementId: 'chat_suggestion',
  userMessage: "I'm so tired, long day at work...",
  conversationHistory: ["How was your day?", "Exhausting"],
  context: { geo: { city: 'NYC' } }
});
```

#### Revenue Share (Preview)

If another agent sends users to you, include their agent_id to split revenue (0-50%). Currently in preview mode - payouts activate Q2 2026.

```typescript
const offer = await client.requestOffer({
  intentKey: 'legal.divorce.consultation',
  sourceAgentId: 'agt_referrer_123',  // Agent who sent the user
  revenueSharePct: 30,                 // Give them 30% of revenue
  // ... other params
});
```

---

### 🧠 Intent Detection

#### `detectIntent()` - Auto-detect user journey stage

Analyzes queries to determine if they're researching, comparing, getting quotes, or ready to buy.

```typescript
detectIntent("What is car insurance?")        // → 'research'
detectIntent("Compare car insurance options") // → 'compare'
detectIntent("Get car insurance quote")       // → 'quote'
detectIntent("I want to buy car insurance")   // → 'apply'
```

#### `buildTaxonomy()` - Type-safe taxonomy builder

```typescript
const taxonomy = buildTaxonomy('insurance', 'auto', 'full_coverage', 'quote');
// → "insurance.auto.full_coverage.quote"
```

#### `suggestTaxonomies()` - Smart taxonomy recommendations

```typescript
const suggestions = suggestTaxonomies("I need a lawyer for divorce");
// → ['legal.family.divorce.consultation', 'legal.family.custody.consultation']
```

#### Taxonomy Utilities
- `isValidTaxonomy(taxonomy)` - Validate taxonomy format
- `parseTaxonomy(taxonomy)` - Parse into components
- `getBaseTaxonomy(taxonomy)` - Get taxonomy without intent
- `matchesTaxonomy(tax1, tax2)` - Check if taxonomies match
- `getVertical(taxonomy)` - Extract industry vertical

---

### 🎨 Response Formatting

#### `formatNatural()` - Convert ads into natural conversation

```typescript
const formatted = formatNatural(ad, {
  tone: 'friendly',
  includeDisclosure: true
});
// → "I found a great option for you! [Sponsored: Lemonade]..."
```

#### `formatInlineMention()` - Subtle in-message placement

```typescript
const mention = formatInlineMention(ad);
// → "Btw, Lemonade offers 20% off for new drivers [Sponsored]"
```

#### `validateAdFits()` - Check if ad matches context

```typescript
const fits = validateAdFits(ad, conversationContext);
if (fits) {
  // Show the ad
}
```

---

### 📊 Event Tracking

#### `trackImpression()` - Log when users see an ad

```typescript
await client.trackImpression({
  agent_id: 'your_agent_id',
  request_id: decision.request_id,
  decision_id: decision.decision_id,
  unit_id: ad.unit_id,
  tracking_token: ad.tracking.token
});
```

---

### 🛠️ Helper Utilities

#### `createOpportunity()` - Build opportunity objects

```typescript
const opportunity = createOpportunity({
  taxonomy: 'insurance.auto.quote',
  country: 'US'
});
```

#### Security Helpers
- `escapeHTML(text)` - Sanitize ad content before rendering
- `sanitizeURL(url)` - Validate and sanitize URLs

#### ID Generation
- `generateUUID()` - Create unique request IDs
- `generateTimestamp()` - Generate API-compatible timestamps

---

### ⚠️ Error Handling

#### `APIRequestError` - API returned an error

Thrown when the backend rejects your request. Includes detailed error message and request_id.

#### `NetworkError` - Connection failed

Network issues or backend unavailable. Includes automatic retry logic.

#### `TimeoutError` - Request exceeded timeout

Request took too long (default 5s). Configure with `timeoutMs` in constructor.

```typescript
try {
  const decision = await client.decide(request);
} catch (error) {
  if (error instanceof TimeoutError) {
    console.log('Request timed out, try again');
  } else if (error instanceof NetworkError) {
    console.log('Network issue, retrying...');
  } else if (error instanceof APIRequestError) {
    console.log('API error:', error.message);
  }
}
```

</details>

---

## Monetize Your AI Agent

Stop giving away your AI agent for free. Start earning revenue from every conversation.

**Traditional monetization (hard):**
- Paywalls → 95% of users leave before paying
- Subscriptions → $10-20/month per user (if they convert)
- Usage limits → Frustrates users, kills growth

**AttentionMarket (easy):**
- **Free for users** → No friction, keep all your users
- **Earn per click** → $5-$150 per click on high-value ads (insurance, legal, finance)
- **70% revenue share** → You keep most of the earnings
- **Contextual ads** → Only show relevant ads when users have commercial intent

**Example earnings:**
- 1,000 users/month × 5% click rate × $50 avg = **$1,750/month** (you keep $1,225)
- 10,000 users/month × 3% click rate × $75 avg = **$22,500/month** (you keep $15,750)

**Integration time:** 10 minutes. Four functions. Production-ready.

---

## Examples

**Basic integration** (~50 lines):
- [basic-example.ts](./examples/basic-example.ts) - Get ads and track clicks

**Chatbot integration** (~45 lines):
- [chatbot-example.ts](./examples/chatbot-example.ts) - Using `tracking_url` for shared links

**Testing** (~320 lines):
- [test-with-mocks.ts](./examples/test-with-mocks.ts) - Test without API calls

Run any example:
```bash
npx tsx examples/basic-example.ts
```

---

## For AI Agents

**AI agents:** Read **[AI_AGENT_SETUP_GUIDE.md](./AI_AGENT_SETUP_GUIDE.md)** for complete step-by-step integration instructions.

**Developers:** Give this document to your AI agent (Claude, ChatGPT, etc.) and say:
> "Please integrate the AttentionMarket SDK following the AI_AGENT_SETUP_GUIDE.md"

The agent will handle: getting credentials, installing SDK, writing integration code, testing, and deployment setup.

---

## Support

- **Issues:** [GitHub Issues](https://github.com/rtrivedi/agent-ads-sdk/issues)
- **Email:** support@attentionmarket.com

---

## License

MIT
