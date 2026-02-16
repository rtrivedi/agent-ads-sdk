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
- **Secure dashboard** with key regeneration and earnings tracking

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

## 🤖 For AI Agents: Self-Integration

**Your human gave you API credentials?** You can integrate autonomously in 5 steps (~2 minutes):

```bash
# 1. Install
npm install @the_ro_show/agent-ads-sdk

# 2. Store credentials
cat > .env <<'EOF'
ATTENTIONMARKET_AGENT_ID=agt_YOUR_ID
ATTENTIONMARKET_API_KEY=am_live_YOUR_KEY
ATTENTIONMARKET_TEST_KEY=am_test_YOUR_KEY
EOF

# 3. Test
node test-integration.js

# 4. Integrate (add to your code)
# See AI_AGENT_INTEGRATION.md for code examples

# 5. Validate
node validate-production.js
```

**Complete guide:** See [AI_AGENT_INTEGRATION.md](./AI_AGENT_INTEGRATION.md) for:
- Step-by-step validation scripts
- Code integration patterns
- Troubleshooting decision tree
- Machine-readable JSON schema

**Success criteria:** `validate-production.js` shows 4/4 ✅ checks passed

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

## Advertising Exchange (v0.8.0+)

The SDK now supports **3 ad types** optimized for different use cases:

### Ad Types

| Ad Type | Billing Model | Format | Payout |
|---------|---------------|--------|---------|
| **Link** | Pay-per-click | Direct offer + link | $5-$150 per click |
| **Recommendation** | Pay-per-click | Teaser + promo code + link | $8-$75 per click |
| **Service** | Pay-per-completion | Agent-to-agent API call | $10-$500 per completion |

All ads use **second-price auctions** - you earn the second-highest bid + $0.01, not the winner's full bid. This creates fair market pricing and maximizes your long-term revenue.

---

### 1. Link Ads (Pay-Per-Click)

**Traditional PPC model** - you earn when user clicks the ad.

```typescript
const ad = await client.decideFromContext({
  userMessage: "I need car insurance"
});

if (ad && ad.ad_type === 'link') {
  console.log(ad.creative.title);      // "Get 20% off car insurance"
  console.log(ad.payout);              // $15.50 (second-price clearing price)
  console.log(ad.click_url);           // Auto-tracking URL

  // Share link with user - you earn when they click
}
```

**Earnings:** Immediate payment when user clicks the link.

---

### 2. Recommendation Ads (Conversational + Promo Code)

**Click-based billing with conversational UX** - includes optional teaser question to prime user interest.

```typescript
// Get recommendation ad
const ad = await client.decideFromContext({
  userMessage: "I want to sell products online"
});

if (ad && ad.ad_type === 'recommendation') {
  // Option A: Conversational (use the teaser)
  if (ad.teaser) {
    console.log(ad.teaser);
    // "Interested in 20% off an e-commerce platform?"

    // User: "Yes!" or "Tell me more"
  }

  // Show the offer
  console.log(`${ad.creative.title} - Use code ${ad.promo_code}`);
  console.log(ad.click_url);
  // "Try Pietra - Use code STARTUP20"
  // https://tracking.ai/r/abc123

  // User clicks → You earn $12.50 ✅

  // ─────────────────────────────────────

  // Option B: Direct (skip teaser)
  console.log(`${ad.creative.title} - ${ad.creative.body}`);
  console.log(`Code: ${ad.promo_code}`);
  console.log(ad.click_url);

  // User clicks → You earn $12.50 ✅
}
```

**Why teasers work:**
- Primes user interest with a question
- User says "yes" → More likely to click
- Feels conversational, not salesy
- **Higher click-through rates** (psychology: commitment)

**Earnings:** Payment on click (fraud-proof, no trust issues).

---

### 3. Service Ads (Pay-Per-Completion)

**Outcome-based billing** - you earn when service completes successfully. Perfect for agent-to-agent interactions.

```typescript
// User needs a task done
const service = await client.getService({
  taskDescription: "Draft a non-disclosure agreement",
  geo: { country: 'US', region: 'CA' }
});

if (service) {
  console.log(service.service_description); // "AI-powered legal document drafting"
  console.log(service.payout);              // $45.00 (second-price clearing price)

  // Call the service endpoint
  const response = await fetch(service.service_endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${service.service_auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      task: "Draft NDA",
      parties: ["Company A", "Company B"],
      jurisdiction: "California"
    })
  });

  const result = await response.json();

  // Log completion (triggers payment if successful)
  const completion = await client.logServiceResult({
    transaction_id: service.transaction_id,
    success: response.ok,
    metadata: {
      execution_time_ms: 1500,
      document_length: result.document?.length
    }
  });

  if (completion.payment_triggered) {
    console.log(`Earned $${completion.payment_amount}!`);
    // → Earned $45.00!
  }
}
```

**Earnings:** Payment triggered only on successful completion (`success: true`).

---

### Understanding Second-Price Auctions

Unlike traditional first-price auctions where winner pays their full bid, **second-price auctions** create fair market pricing:

**Example:**
- Advertiser A bids $20 (quality score: 1.0) → Auction score: 20.0
- Advertiser B bids $15 (quality score: 0.9) → Auction score: 13.5
- Advertiser C bids $10 (quality score: 0.8) → Auction score: 8.0

**Result:**
- Winner: Advertiser A
- **You earn:** $13.50 (second-place score ÷ winner's quality) + $0.01 = **$13.51**

This benefits you because:
1. **Fair pricing** - You earn market rate, not inflated bids
2. **Higher quality** - Advertisers compete on relevance, not just price
3. **Long-term revenue** - Sustainable ecosystem keeps advertisers coming back

---

### Quality Scoring

Campaigns start with quality score **0.5** and adjust based on performance:

| Ad Type | Quality Factors | Score Range |
|---------|----------------|-------------|
| Link | CTR, conversion rate | 0.1 - 1.0 |
| Recommendation | Positive response rate | 0.1 - 1.0 |
| Service | Success rate | 0.1 - 1.0 |

**Higher quality = higher earnings** - Quality score multiplies the bid amount in auction ranking.

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

**Rotating API Keys:**

If your key is compromised, regenerate it from your [developer dashboard](https://api.attentionmarket.ai):
1. Click "Regenerate Keys" in your dashboard
2. Confirm with your password
3. Copy your new keys (shown once)
4. Update your environment variables
5. Redeploy within 1 hour (old keys expire after grace period)

**Security features:**
- Old keys remain valid for 1 hour (zero-downtime rotation)
- Rate limiting prevents brute force attacks (5 attempts)
- Full audit trail of all key changes

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
