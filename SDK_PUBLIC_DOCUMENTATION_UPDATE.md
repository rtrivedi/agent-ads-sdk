# AttentionMarket SDK Documentation Update

## Overview
The AttentionMarket SDK enables developers to monetize their AI applications by displaying relevant sponsored content to users. Developers earn revenue when users interact with these ads.

## Getting Started

### Installation
```bash
npm install @the_ro_show/agent-ads-sdk
```

### Basic Setup
```javascript
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const client = new AttentionMarketClient({
  apiKey: 'your_api_key_here',
  agentId: 'your_agent_id_here'
});
```

## Serving Ads

### Context-Based Ad Selection
The SDK intelligently selects ads based on the user's context and conversation:

```javascript
// Get an ad based on user context
const ad = await client.decideFromContext({
  userMessage: "I need help with social media marketing",
  placement: 'sponsored_suggestion'
});

// The ad object contains:
// - creative: Title, body, and call-to-action text
// - click_url: Secure tracking URL for user clicks
// - payout: Amount you earn per click (in cents)
// - relevance_score: How well the ad matches the context
```

⚠️ **REVENUE REQUIREMENT:** Always use `decideFromContext()` to automatically track impressions. Without impression tracking, clicks will not generate revenue. The SDK handles this automatically—no additional code needed.

### Smart Context (v0.15.0+) 🎯

The SDK automatically detects user intent, interests, and conversation stage to improve relevance by **2-3x**:

**Auto-Detected Signals:**
- **Intent Stage**: research → comparison → ready_to_buy
- **User Interests**: Extracted from conversation (e.g., ['wedding', 'photography'])
- **Purchase Intent**: Boolean indicating readiness to take action
- **Session Tracking**: Multi-turn conversation continuity

**Performance Impact:**
- +65% CTR improvement
- +78% revenue impact
- Better user experience with more relevant ads

#### Automatic Detection (Zero Configuration)

```javascript
// Smart context works automatically - no code changes needed
const ad = await client.decideFromContext({
  userMessage: "Compare Pietra vs Shopify for starting an online store",
  conversationHistory: [
    "I want to start selling products online",
    "What platform should I use?"
  ]
});

// SDK automatically detects:
// - intent_stage: 'comparison' (from "Compare X vs Y" pattern)
// - interests: ['business', 'shopping', 'technology']
// - purchase_intent: true (action-oriented language)
```

#### Manual Context Hints (Advanced)

For apps with existing user profiles, provide explicit context for even better targeting:

```javascript
const ad = await client.decideFromContext({
  userMessage: "What's the best option for me?",

  // Override auto-detected user context
  user_context: {
    interests: ['wedding', 'photography', 'venues'],
    recent_topics: ['Austin venues', 'outdoor weddings'],
    purchase_intent: true
  },

  // Override auto-detected session context
  session_context: {
    session_id: 'session_abc123',  // Track across messages
    message_count: 8,
    intent_stage: 'ready_to_buy'
  }
});
```

#### Performance Impact

Expected improvements with Smart Context enabled:

| Feature | Expected CTR Improvement | Expected Revenue Impact |
|---------|-------------------------|------------------------|
| Intent Detection | +30-40% | +35-45% |
| Interest Matching | +20-30% | +25-35% |
| Session Tracking | +10-20% | +15-25% |
| **Combined** | **+50-70%** | **+60-80%** |

*Based on early testing. Actual results may vary.*

#### Best Practices

1. **Always include conversation history** - Provides crucial context for intent detection
2. **Use session IDs** - Track users across multiple messages for better targeting
3. **Let auto-detection work** - Only override when you have high-confidence signals
4. **Test with real conversations** - Measure CTR improvements in your specific use case

#### Claude Code Integration

Building with Claude Code? Use this prompt:

```
Add AttentionMarket smart context to improve ad relevance by 2-3x.
Update decideFromContext() calls to include conversationHistory.
Track sessions with unique session_id for multi-turn conversations.
```

### Displaying Ads to Users

#### Recommended Implementation
```javascript
// Display the ad content
<div className="sponsored-content">
  <span className="disclosure">Sponsored</span>
  <h3>{ad.creative.title}</h3>
  <p>{ad.creative.body}</p>
  <a href={ad.click_url} target="_blank" rel="noopener">
    {ad.creative.cta}
  </a>
</div>
```

### Click Tracking

Clicks are **automatically tracked** when users visit the `click_url`. No manual tracking code needed.

```javascript
// Browser redirect (recommended)
window.location.href = ad.click_url;

// OR shareable link (for SMS/email/chat)
const shareableLink = ad.tracking_url;
```

**Security:**
- Click URLs contain HMAC-signed tokens that prevent fraud
- Ensures accurate attribution and guaranteed payment
- Always use the provided URLs—direct URLs will not track clicks

⚠️ **Never modify or decode the click URL.** The URL automatically handles tracking and redirects users to the advertiser.

## Developer Controls

AttentionMarket provides fine-grained controls over ad quality, revenue, and brand safety.

### Quality & Brand Safety

#### 1. Minimum Quality Score

Filter ads by historical performance. Quality scores (0.0-1.0) are calculated from CTR, conversions, and user feedback.

```javascript
// Only show high-quality ads (premium app)
const ad = await client.decideFromContext({
  userMessage: "I need legal help",
  minQualityScore: 0.7  // Only ads with 0.7+ quality
});
```

**Quality Score Ranges:**
- 0.9-1.0: Excellent (top 10% of advertisers)
- 0.7-0.9: Good (above average performance)
- 0.5-0.7: Average (typical performance)
- 0.3-0.5: Below average
- 0.1-0.3: Poor (low engagement)

**Trade-off:** Higher threshold = better quality but lower fill rate

#### 2. Category Filtering (IAB Taxonomy 3.0)

Control which advertiser categories appear using the IAB Content Taxonomy 3.0 (704 categories across 38 top-level verticals).

**Allowed Categories (Whitelist):**
```javascript
// Wedding app: only wedding-related ads
const ad = await client.decideFromContext({
  userMessage: "Find me a venue",
  allowedCategories: [
    603,  // Weddings
    162,  // Photography
    190   // Restaurants
  ]
});
```

**Blocked Categories (Blacklist):**
```javascript
// Block sensitive content
const ad = await client.decideFromContext({
  userMessage: "Help me with something",
  blockedCategories: [
    601,  // Sensitive Topics (+ all children)
    300,  // Gambling
    450   // Adult Content
  ]
});
```

**Note:** Blocking a parent category automatically blocks all subcategories.

#### 3. Advertiser Blocklist

Block specific advertisers by ID (e.g., competitors, low performers):

```javascript
const ad = await client.decideFromContext({
  userMessage: "I need car insurance",
  blockedAdvertisers: ['adv_abc123', 'adv_xyz789']
});

// Advertiser IDs come from ad responses:
if (ad) {
  console.log(ad.advertiser_id);  // "adv_abc123"
}
```

### Revenue Optimization

#### 4. Minimum CPC Filter

Only show ads with bids at or above a specified cost-per-click (in cents):

```javascript
// Premium app: only show $2+ ads
const ad = await client.decideFromContext({
  userMessage: "I need car insurance",
  minCPC: 200  // Only ads bidding >= $2.00 per click
});
```

**Trade-off:** Higher threshold = more $ per click but lower fill rate

#### 5. Minimum Relevance Score

Only show ads with semantic similarity at or above a threshold (0.0-1.0):

```javascript
// Niche legal assistant: only highly relevant ads
const ad = await client.decideFromContext({
  userMessage: "Help with estate planning",
  minRelevanceScore: 0.8  // Only ads with 0.8+ semantic match
});
```

**Relevance Score Ranges:**
- 0.9-1.0: Perfect match (exact keyword match)
- 0.8-0.9: Highly relevant (same category)
- 0.7-0.8: Related (adjacent category)
- 0.5-0.7: Loosely related
- 0.25-0.5: Weak connection (backend minimum)

#### 6. Ranking Strategy

Choose how ads are ranked when multiple ads match:

```javascript
// Revenue mode (default): highest bid wins
const ad = await client.decideFromContext({
  userMessage: "I need legal help",
  optimizeFor: 'revenue'  // Rank by bid × quality × relevance
});

// Relevance mode: best semantic match wins
const ad = await client.decideFromContext({
  userMessage: "I need legal help",
  optimizeFor: 'relevance'  // Rank by semantic similarity only
});
```

**Important:** Winner never pays more than their max bid (second-price auction). Minimum clearing price of $0.25.

#### Combining Controls

Mix multiple controls for sophisticated targeting:

```javascript
// Premium legal assistant: only perfect-match, high-quality, high-value ads
const ad = await client.decideFromContext({
  userMessage: "I need estate planning help",

  // Quality & Brand Safety
  minQualityScore: 0.8,         // Only excellent advertisers
  allowedCategories: [318],     // Legal services only

  // Revenue Optimization
  minCPC: 300,                  // Only $3+ bids
  minRelevanceScore: 0.85,      // Only highly relevant
  optimizeFor: 'relevance'      // Best match wins
});

// Result: Hyper-targeted ads with high revenue and perfect UX
// Trade-off: Low fill rate (15-25%), but 3x higher revenue per impression
```

#### Claude Code Integration

Building with Claude Code? Use this prompt:

```
Add developer controls to AttentionMarket SDK:
- Only show ads with quality > 0.7
- Only show ads with CPC > $1.00 (100 cents)
- Only show ads with relevance > 0.8
- Block sensitive categories (gambling, adult content)
- Optimize for relevance instead of revenue
```

## Developer Earnings

### How Payments Work
1. **Second-price auction determines clearing price**
   - Winner pays just enough to beat second place + $0.01
2. **You earn 70% of the clearing price**
   - Platform keeps 30% for infrastructure and operations
3. **Typical earnings: $0.50-$15 per click** (category-dependent)
   - Insurance, legal, B2B: $3-$15 per click
   - E-commerce, consumer goods: $0.50-$3 per click
4. **Payment models:**
   - CPC (cost-per-click) for link and recommendation ads
   - CPA (cost-per-action) for service ads
5. **Minimum payout: $100 threshold**
6. **Payment schedule: Monthly via Stripe**

### Tracking Your Revenue

```javascript
// Check earnings in the developer portal
// Visit: https://api.attentionmarket.ai/dashboard

// Performance metrics are also available via the dashboard:
// - Click-through rate (CTR)
// - Average payout per click
// - Fill rate
// - Total revenue
```

### Payment Schedule
- Earnings are reconciled daily
- Minimum payout threshold: $100
- Payments processed monthly (NET-30 terms)
- Payment method: Stripe (supports ACH, wire transfer, PayPal)

## Best Practices

### 1. Respect User Experience
- Only show ads when relevant to the conversation
- Always include proper disclosure (e.g., "Sponsored")
- Limit frequency to maintain user trust

### 2. Optimize Relevance
- Provide rich context for better ad matching
- Include conversation history when available
- Use appropriate placement types

### 3. Track Performance
```javascript
// Monitor your performance metrics in the developer portal
// Visit: https://api.attentionmarket.ai/dashboard

// Metrics include:
// - Click-through rate (CTR)
// - Average payout per click
// - Fill rate (% of requests that return ads)
// - Total revenue and impressions
```

## Placement Types

### sponsored_suggestion (Most Common)
Best for conversational interfaces where ads appear as helpful suggestions:
```javascript
const ad = await client.decideFromContext({
  userMessage: userQuery,
  placement: 'sponsored_suggestion'
});
```

### sponsored_block
For dedicated ad sections in your UI:
```javascript
const ad = await client.decideFromContext({
  userMessage: userQuery,
  placement: 'sponsored_block'
});
```

### sponsored_tool
For AI agent service recommendations (agent-to-agent use cases):
```javascript
const ad = await client.decideFromContext({
  userMessage: userQuery,
  placement: 'sponsored_tool'
});
```

## Error Handling

### Validation Errors

The SDK validates parameters before making API calls:

```javascript
try {
  const ad = await client.decideFromContext({
    userMessage: userQuery,
    minQualityScore: -0.5  // ❌ Invalid: must be 0.0-1.0
  });
} catch (error) {
  console.error(error.message);
  // Output: "minQualityScore must be a number between 0.0 and 1.0"
}
```

**Common validation errors:**
- `minQualityScore must be a number between 0.0 and 1.0`
- `minCPC must be a non-negative number (cost-per-click in cents)`
- `minRelevanceScore must be a number between 0.0 and 1.0`
- `optimizeFor must be either "revenue" or "relevance"`
- `allowedCategories cannot be empty (would block all ads). Use blockedCategories to exclude specific categories, or omit to allow all.`
- `blockedAdvertisers must contain non-empty strings (advertiser IDs)`

### HTTP Errors

The API returns standard HTTP status codes:

```javascript
try {
  const ad = await client.decideFromContext({
    userMessage: userQuery,
    placement: 'sponsored_suggestion'
  });

  if (ad) {
    // Display ad
  } else {
    // No relevant ads available (no fill)
  }
} catch (error) {
  // Check error status code
  if (error.status === 400) {
    console.error('Bad request:', error.message);
  } else if (error.status === 401) {
    console.error('Authentication failed: Invalid API key');
  } else if (error.status === 429) {
    console.error('Rate limit exceeded. Try again in 60 seconds.');
  } else if (error.status === 500) {
    console.error('Server error. Contact support if this persists.');
  }

  // Continue without ads
}
```

**HTTP Status Codes:**
- `400 Bad Request` — Invalid parameters (see error message)
- `401 Unauthorized` — Missing or invalid API key
- `429 Too Many Requests` — Rate limit exceeded
- `500 Internal Server Error` — Server error (contact support)

## SDK API Reference

### Core Methods

```javascript
// 1. Get contextual ad (auto-tracks impression)
const ad = await client.decideFromContext({
  userMessage: "I need car insurance",
  conversationHistory: [...],
  placement: 'sponsored_suggestion'
});

// 2. Track conversion (purchase, signup, etc.)
await client.trackConversion(ad.tracking_token);

// 3. Get IAB categories
const categories = await client.getCategories({
  tier: 1  // Get 38 top-level categories
});
```

**Click Tracking:** Clicks are automatically tracked when users visit `ad.click_url`. No manual tracking needed.

## IAB Category Taxonomy

AttentionMarket uses the **IAB Content Taxonomy 3.0** for category filtering — 704 categories across 38 top-level verticals.

### Discovering Categories

```javascript
// Get all 38 top-level categories
const tier1 = await client.getCategories({ tier: 1 });
tier1.categories.forEach(cat => {
  console.log(`${cat.id}: ${cat.name}`);
});
// Output: 1: Automotive, 31: Insurance, 150: Attractions, etc.

// Get subcategories of "Automotive" (ID: 1)
const automotive = await client.getCategories({ parent_id: 1 });
// Returns: Auto Insurance (31), Auto Repair (34), Auto Parts (32), etc.

// Search for insurance-related categories
const insurance = await client.getCategories({ search: 'insurance' });
insurance.categories.forEach(cat => {
  console.log(cat.full_path);
});
// Output: "Automotive > Auto Insurance", "Personal Finance > Insurance", etc.
```

### Using Categories for Filtering

```javascript
// Whitelist wedding-related categories
const ad = await client.decideFromContext({
  userMessage: "Find me a venue",
  allowedCategories: [
    603,  // Weddings
    162,  // Photography
    190   // Restaurants
  ]
});

// Blacklist sensitive content
const ad = await client.decideFromContext({
  userMessage: "Help me with something",
  blockedCategories: [
    601,  // Sensitive Topics (blocks all children too)
    300,  // Gambling
    450   // Adult Content
  ]
});
```

**Parent-Child Relationships:**
- Blocking a parent category automatically blocks all subcategories
- Example: Blocking category `1` (Automotive) blocks Auto Insurance (31), Auto Repair (34), etc.
- **Precedence:** If `allowedCategories` is set, `blockedCategories` is ignored

## Compliance Requirements

### Required Disclosures
- All ads must be clearly labeled as sponsored content
- Use terms like "Sponsored", "Ad", or "Promoted"
- Disclosure must be visible without user interaction

### Prohibited Practices
- Do not click your own ads
- Do not incentivize users to click ads
- Do not hide or disguise ads as organic content
- Do not modify ad content or tracking URLs

## Troubleshooting

### Ads Not Appearing
- Verify your API credentials are correct
- Ensure you're providing meaningful context
- Check that your account is in good standing

### Earnings Not Updating
- Earnings are processed in batches (not real-time)
- Allow up to 24 hours for reconciliation
- Verify clicks are using the provided click_url

### Low Relevance Scores
- Provide more detailed user context
- Include conversation history when available
- Ensure context accurately reflects user intent

## Support

- **Documentation**: https://attentionmarket.ai/docs
- **Support Email**: support@attentionmarket.ai
- **Status Page**: https://status.attentionmarket.ai

## Mobile Integration (iOS, Android)

For non-Node.js platforms, use the REST API directly via HTTP requests.

### iOS Integration with Claude Code

**Quick Start Prompt:**
```
Create an iOS AdManager class for AttentionMarket SDK.
Use URLSession to make POST requests to the decide endpoint.
Credentials: apiKey=am_live_..., agentId=agt_..., supabaseAnonKey=...
Endpoint: https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/decide
Auto-track impressions, handle clicks via click_url.
```

**Expected Output:** Complete Swift class with:
- `fetchAd(userMessage:conversationHistory:)` method
- Automatic impression tracking
- Click URL handling
- Error handling and retry logic

### Android Integration with Claude Code

**Quick Start Prompt:**
```
Create an Android AdManager class for AttentionMarket SDK.
Use Retrofit/OkHttp to make POST requests to the decide endpoint.
Credentials: apiKey=am_live_..., agentId=agt_..., supabaseAnonKey=...
Endpoint: https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/decide
Auto-track impressions, handle clicks via Intent.
```

**Expected Output:** Complete Kotlin class with:
- `fetchAd(userMessage, conversationHistory)` suspend function
- Automatic impression tracking
- Click URL handling via Intent
- Error handling and retry logic

### REST API Reference

**Endpoint:** `POST https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/decide`

**Headers:**
```
Authorization: Bearer {apiKey}
apikey: {supabaseAnonKey}
Content-Type: application/json
```

**Request Body:**
```json
{
  "request_id": "req_unique_id",
  "agent_id": "agt_YOUR_AGENT_ID",
  "placement": {
    "type": "sponsored_suggestion"
  },
  "opportunity": {
    "user_message": "I need car insurance",
    "conversation_history": ["Previous messages..."]
  }
}
```

**Response:**
```json
{
  "creative": {
    "title": "Get 20% off car insurance",
    "body": "Compare quotes from top providers",
    "cta": "Get Quote"
  },
  "click_url": "https://...",
  "tracking_token": "trk_...",
  "payout": 76,
  "relevance_score": 0.87
}
```

**Full API Documentation:** [https://rtrivedi.github.io/agent-ads-sdk/docs/api-reference](https://rtrivedi.github.io/agent-ads-sdk/docs/api-reference)

## Changelog

### v0.15.1 (2026-02-26) - Bug Fixes & Security
- 🔒 **Fixed session leak** - sessionId now request-scoped, not instance-scoped
- 🛡️ **Added comprehensive input validation** - Prevents malformed requests
- 📊 **Capped context boost at 50%** - Maintains auction integrity
- 🎯 **Improved intent detection patterns** - Reduces false positives
- 🚀 **Performance optimizations** - Better handling of large conversation histories
- 🔍 **Limited arrays** - Prevents memory bloat (10 interests, 5 topics max)

### v0.15.0 (2026-02-26) - Smart Context
- 🎯 **Auto-detect user intent stage** - research → comparison → ready_to_buy
- 🧠 **Extract user interests** - Automatic extraction from conversation
- 📈 **Session tracking** - Multi-turn conversation support
- ⚡ **Context boosting** - Better ad relevance (+65% CTR improvement)
- 💰 **Revenue impact** - +78% revenue improvement reported in A/B tests

### v0.14.2 (2026-02-12)
- 🔗 **Claude Code integration support** - Ready-to-use prompts
- 📝 **Improved documentation** - Better examples and guides

### v0.14.0 (2026-02-11) - Payload Optimization
- 📦 **Minimal response format** - 84% smaller payload (3.2KB → 520B)
- ⚡ **Auto-impression tracking** - Built into minimal format
- 🎯 **Relevance score in response** - Frontend filtering support
- 🔧 **Three format options** - minimal, standard, verbose

### v0.9.0 (2026-02-11) - Impression Tracking Enforcement
- ✅ **Required impression tracking** - Clicks without impressions don't earn revenue
- 🛡️ **Fraud prevention** - Client-side filtering protection
- 📊 **Quality metrics** - Accurate CTR data for advertisers
- 🔄 **Auto-tracking** - Automatic in decideFromContext()

### v0.8.0 (2026-02-10) - Developer Controls
- 🎚️ **Quality score filtering** - minQualityScore parameter
- 📂 **IAB category filtering** - 704 categories, allowedCategories/blockedCategories
- 🚫 **Advertiser blocklist** - blockedAdvertisers parameter
- 💰 **Revenue optimization** - minCPC, minRelevanceScore, optimizeFor
- 📈 **Ranking strategies** - Revenue vs relevance modes

---

*For the latest updates and API reference, visit our [developer portal](https://attentionmarket.ai/developers)*