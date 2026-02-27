# 🤖 Claude Code Integration Guide for AttentionMarket SDK

**Copy-paste prompts for integrating contextual ads into your AI applications with Claude Code**

> **v0.15.1 Update**: Now with Smart Context for 2-3x better ad relevance!

---

## Quick Navigation
- [Quick Start (One-Line Integration)](#quick-start-one-line-integration)
- [Smart Context Integration (NEW)](#smart-context-integration-new)
- [Natural Conversation Integration](#natural-conversation-integration)
- [Advanced Filtering & Safety](#advanced-filtering--safety)
- [Testing & Analytics](#testing--analytics)
- [Common Integration Patterns](#common-integration-patterns)
- [Performance Benchmarks](#performance-benchmarks)

---

## Quick Start (One-Line Integration)

### Copy this prompt into Claude Code:

```
I want to add AttentionMarket ads to my AI chatbot with minimal code. Here are my credentials:
- API Key: am_test_YOUR_KEY_HERE
- Agent ID: agt_YOUR_AGENT_ID

Requirements:
1. Install @the_ro_show/agent-ads-sdk
2. Create a simple wrapper function that takes user message and returns an ad if relevant
3. Use the minimal response format for best performance (84% smaller, ~520B)
4. Only show ads when genuinely relevant (relevance score > 0.7)
5. Auto-track impressions and clicks
6. Return null gracefully when no relevant ads

The wrapper should be a single async function I can call like:
const ad = await getRelevantAd(userMessage);

Show me the complete implementation with error handling.
```

### What Claude will build:
- Complete SDK setup with your credentials
- Single `getRelevantAd()` function
- Automatic impression tracking
- Click tracking via `click_url`
- Graceful no-fill handling

---

## Smart Context Integration (NEW)

### Copy this prompt for v0.15.1+ smart context features:

```
I want to integrate AttentionMarket ads with the new v0.15.1 smart context features.
My credentials: am_test_YOUR_KEY, agt_YOUR_AGENT_ID

Build an integration that:
1. Tracks conversation history for better context
2. Auto-detects user intent stage (research vs comparison vs ready to buy)
3. Extracts user interests from the conversation
4. Uses session IDs for multi-turn conversations
5. Only shows highly relevant ads based on intent stage

Example: If user is in "research" stage, show informational ads.
If they're "ready to buy", show action-oriented ads with CTAs.

The function should accept:
- userMessage: string
- conversationHistory: string[]
- sessionId?: string

Return enhanced ad with relevance scoring.
```

### What Claude will build:
- Session tracking across conversations
- Intent stage detection
- Interest extraction
- Context-aware ad matching
- 2-3x better CTR through smart targeting

---

## Natural Conversation Integration

### Copy this prompt for seamless ad integration:

```
Help me integrate AttentionMarket ads naturally into my Claude-based AI assistant.

Context:
- My app is a [chatbot/voice assistant/AI companion]
- Users ask questions about [your domain: legal/medical/shopping/etc]
- I want ads to feel helpful, not intrusive

Requirements:
1. Ads should only appear when genuinely helpful to the user
2. Clear disclosure: "Sponsored" or "Partner offer" label
3. Maintain natural conversation flow
4. Present ads as one option among organic suggestions
5. Track both impressions and clicks automatically

Show me:
1. How to detect when an ad would be helpful
2. Natural ways to introduce sponsored content
3. Example conversation flows with integrated ads
4. How to handle user reactions (positive/negative)

Include these conversation patterns:
- User asks for recommendations → Include sponsored option
- User has a problem → Suggest sponsored solution if relevant
- User comparing options → Show sponsored alternative

Make the integration feel like a helpful assistant, not a salesperson.
```

### What Claude will build:
- Context detection logic
- Natural ad presentation templates
- Conversation flow examples
- FTC-compliant disclosure patterns
- User feedback handling

---

## Advanced Filtering & Safety

### Copy this prompt for enterprise-grade controls:

```
I need AttentionMarket integration with strict brand safety and revenue optimization controls.

My requirements:

BRAND SAFETY:
- Block categories: [601] (all sensitive content including gambling, adult)
- Block specific advertisers: ['competitor_id_1', 'competitor_id_2']
- Only show ads from allowed categories: [31, 150, 190] (Insurance, Travel, Restaurants)

QUALITY CONTROLS:
- Minimum relevance score: 0.75 (only highly relevant ads)
- Minimum quality score: 0.6 (established advertisers only)
- Minimum CPC: 150 cents ($1.50 per click)

PERFORMANCE:
- Optimize for: revenue (maximize earnings)
- Fallback behavior: Show nothing rather than irrelevant ads
- Cache category list for 24 hours

Show me:
1. Complete configuration with all safety controls
2. How to dynamically adjust filters based on context
3. How to log blocked ads for compliance
4. How to A/B test different thresholds
5. Category discovery code to find relevant IAB categories

Include error handling and graceful degradation.
```

### What Claude will build:
- Complete safety configuration
- Dynamic filter adjustment
- Compliance logging system
- A/B testing framework
- Category browser utility

---

## Testing & Analytics

### Copy this prompt for comprehensive testing:

```
Set up a complete testing and analytics environment for AttentionMarket integration.

Requirements:

TESTING ENVIRONMENT:
1. Easy switch between test/live keys via environment variables
2. Detailed logging of all ad requests and responses
3. Mock ad responses for unit testing
4. Performance timing (API latency tracking)

ANALYTICS TRACKING:
1. Track these metrics:
   - Impression count
   - Click count
   - CTR (click-through rate)
   - Revenue (estimated from payout field)
   - Fill rate (ads shown / ads requested)
   - Relevance scores distribution

2. Create dashboard data structure:
   - Hourly/daily/monthly aggregates
   - Per-category performance
   - Per-placement performance

DEBUGGING TOOLS:
1. Debug mode that logs:
   - User message
   - Context sent to API
   - Full response
   - Why ads were shown/not shown

2. Test scenarios:
   - No ads available
   - API timeout
   - Invalid credentials
   - Rate limiting

Show me complete implementation with:
- Environment-based configuration
- Analytics collector class
- Debug logger
- Test data generator
- Sample test cases
```

### What Claude will build:
- Environment configuration system
- Analytics tracking class
- Debug logging framework
- Comprehensive test suite
- Mock data generators

---

## Common Integration Patterns

### 1. Q&A Pattern
```javascript
// User asks question → AI answers → Related ad if relevant

const handleQuestion = async (question) => {
  // Get AI response first
  const answer = await generateAIResponse(question);

  // Check if ad would be helpful
  const ad = await client.decideFromContext({
    userMessage: question,
    conversationHistory: [answer],
    placement: 'sponsored_suggestion',
    minRelevanceScore: 0.7
  });

  if (ad) {
    return {
      answer,
      sponsoredSuggestion: {
        label: "Sponsored",
        title: ad.creative.title,
        body: ad.creative.body,
        cta: ad.creative.cta,
        url: ad.click_url
      }
    };
  }

  return { answer };
};
```

### 2. Recommendation Pattern
```javascript
// AI suggests options → Includes sponsored option clearly marked

const getRecommendations = async (need) => {
  const organicOptions = await findOrganicOptions(need);

  const ad = await client.decideFromContext({
    userMessage: need,
    placement: 'sponsored_suggestion'
  });

  if (ad && ad.relevance_score > 0.8) {
    return [
      ...organicOptions,
      {
        type: 'sponsored',
        label: '⭐ Partner Offer',
        ...ad.creative,
        url: ad.click_url
      }
    ];
  }

  return organicOptions;
};
```

### 3. Problem-Solution Pattern
```javascript
// User has problem → AI offers sponsored solution if helpful

const solveProblem = async (problem) => {
  const solution = await analyzeProblem(problem);

  const ad = await client.decideFromContext({
    userMessage: problem,
    minRelevanceScore: 0.85,  // High threshold for problems
    optimizeFor: 'relevance'
  });

  if (ad) {
    solution.sponsoredHelp = {
      preface: "I found a service that might help:",
      ...ad.creative,
      disclosure: "Sponsored - I may earn a commission",
      url: ad.click_url
    };
  }

  return solution;
};
```

---

## Performance Benchmarks

### What to Expect

| Metric | AttentionMarket Performance |
|--------|----------------------------|
| **Average CTR** | 5-12% (varies by relevance) |
| **Revenue per Click** | $0.50 - $15.00 |
| **Fill Rate** | 40-60% (highly contextual) |
| **API Latency** | < 100ms (p95) |
| **Payload Size** | ~520 bytes (minimal format) |

### Optimization Tips

1. **Higher Relevance = Higher CTR**
   - Use `minRelevanceScore: 0.7+` for better CTR
   - Trade-off: Lower fill rate but higher quality

2. **Context is King**
   - Include conversation history for better matches
   - More context = better ad relevance

3. **Timing Matters**
   - Show ads after providing value
   - Not on first interaction
   - After establishing trust

4. **Clear Disclosure = Better Trust**
   - "Sponsored" or "Ad" label
   - Explain the value proposition
   - Be transparent about commissions

---

## Mobile App Integration

### For React Native / Flutter:

```
I'm building a [React Native/Flutter] mobile app with an AI assistant.

Requirements:
1. Install and configure AttentionMarket SDK
2. Handle both iOS and Android
3. Optimize for mobile UI/UX:
   - Compact ad format
   - Touch-friendly CTAs
   - Native share buttons
4. Handle deep links for click tracking
5. Offline queue for impression tracking

Show me:
1. Platform-specific setup
2. Mobile-optimized ad component
3. Deep link configuration
4. Offline resilience
5. App store compliance considerations
```

---

## Troubleshooting Prompts

### When things aren't working:

```
My AttentionMarket integration isn't working. Help me debug:

Symptoms:
- [Describe what's happening]

Current code:
[Paste your implementation]

I need:
1. Diagnostic code to identify the issue
2. Common problems and solutions
3. How to verify credentials are correct
4. How to test the API directly with curl
5. How to check if impressions are being tracked

Include step-by-step debugging process.
```

---

## Best Practices Summary

### DO ✅
- Always use `click_url` (auto-tracked, fraud-proof)
- Set reasonable `minRelevanceScore` (0.6-0.8)
- Include conversation context
- Show clear "Sponsored" labels
- Handle no-fill gracefully
- Use test keys during development

### DON'T ❌
- Don't manipulate ad content
- Don't hide sponsored labels
- Don't show ads for every query
- Don't cache ads (they expire)
- Don't track clicks manually
- Don't use live keys in development

---

## Getting Help

- **Documentation**: [github.com/rtrivedi/agent-ads-sdk](https://github.com/rtrivedi/agent-ads-sdk)
- **Get API Keys**: [api.attentionmarket.ai](https://api.attentionmarket.ai)
- **Support**: Open an issue on GitHub

---

*Last updated: February 2026 | SDK v0.14.2*