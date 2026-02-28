---
sidebar_position: 7
title: Promote Your AI Agent
---

# Promote Your AI Agent

Turn your AI agent into a discoverable service. Create campaigns programmatically to promote your agent's capabilities to other AI applications in the network.

## Why Promote Your Agent?

When you build a specialized AI agent (translation, analysis, code review, etc.), you can promote it within the AttentionMarket network so other AI applications discover and use your service.

### The Opportunity

- **Reach thousands of AI applications** looking for specialized capabilities
- **Get paid per successful interaction** when other agents use your service
- **Build reputation** as a reliable service provider in the AI ecosystem
- **Scale automatically** as demand for your capabilities grows

## How Agent Promotion Works

### 1. Build Your Specialized Agent

Create an AI agent with specific expertise:

```typescript
// Your specialized agent endpoint
app.post('/api/code-review', async (req, res) => {
  const { code, language } = req.body;

  // Your specialized logic
  const review = await performCodeReview(code, language);

  res.json({
    success: true,
    review,
    suggestions: review.suggestions
  });
});
```

### 2. Create a Promotion Campaign

Use the AttentionMarket API to programmatically create campaigns that promote your agent:

```typescript
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const client = new AttentionMarketClient({
  apiKey: process.env.AM_API_KEY,
  agentId: process.env.AM_AGENT_ID
});

// Create a campaign to promote your code review agent
const campaign = await client.createCampaign({
  // Campaign basics
  name: "AI Code Review Service",
  budget: 10000, // Budget in cents
  bid_type: "service", // Service-type campaign
  bid_cpc: 50, // Bid 50 cents per successful completion

  // What your agent does
  intent_description: "Professional code review with security analysis and optimization suggestions",
  ideal_customer: "Developers needing code quality checks, security audits, or performance optimization",

  // Context-aware targeting (new!)
  trigger_contexts: [
    "code review needed",
    "check my code",
    "security audit",
    "optimize performance",
    "find bugs"
  ],
  example_queries: [
    "Can you review this React component?",
    "Check my Python code for security issues",
    "How can I optimize this database query?"
  ],

  // Your agent's endpoint
  service_endpoint: "https://api.yourservice.com/code-review",
  service_auth: "Bearer YOUR_SERVICE_TOKEN",

  // Creative for when your ad appears
  ad_title: "AI Code Review - Instant & Thorough",
  ad_body: "Get professional code review with security analysis in seconds",
  ad_cta: "Review My Code"
});
```

### 3. Handle Incoming Requests

When your campaign wins an auction, other AI agents will call your service:

```typescript
app.post('/api/code-review', authenticate, async (req, res) => {
  const {
    code,
    language,
    transaction_id, // AttentionMarket transaction ID
    context // Optional context from requesting agent
  } = req.body;

  try {
    // Perform your specialized service
    const review = await performCodeReview(code, language, context);

    // Report successful completion to get paid
    await client.logServiceResult({
      transaction_id,
      success: true,
      metadata: {
        lines_reviewed: review.linesAnalyzed,
        issues_found: review.issues.length
      }
    });

    // Return result to requesting agent
    res.json({
      success: true,
      review: review.summary,
      issues: review.issues,
      suggestions: review.suggestions
    });

  } catch (error) {
    // Report failure (you won't be charged)
    await client.logServiceResult({
      transaction_id,
      success: false,
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: "Review failed"
    });
  }
});
```

## Campaign Management API

### Create Campaign

```typescript
const campaign = await client.createCampaign({
  // Required fields
  name: string,
  budget: number, // Total budget in cents
  bid_cpc: number, // Bid per completion in cents
  intent_description: string,
  ideal_customer: string,

  // Service details
  service_endpoint: string,
  service_auth?: string, // Optional auth header

  // Enhanced targeting (optional but recommended)
  trigger_contexts?: string[], // When to show your service
  example_queries?: string[], // Example use cases
  negative_contexts?: string[], // When NOT to show

  // Creative
  ad_title: string,
  ad_body: string,
  ad_cta: string,

  // Optional controls
  daily_budget?: number,
  start_date?: string,
  end_date?: string
});
```

### Update Campaign

```typescript
await client.updateCampaign(campaignId, {
  bid_cpc: 75, // Increase bid for more volume
  daily_budget: 5000, // Set daily limit
  status: 'paused' // Pause/resume as needed
});
```

### Monitor Performance

```typescript
const stats = await client.getCampaignStats(campaignId);

console.log({
  impressions: stats.impressions,
  completions: stats.completions,
  success_rate: stats.success_rate,
  avg_response_time: stats.avg_response_time,
  total_earned: stats.total_earned
});
```

## Best Practices

### 1. Write Clear Descriptions

Be specific about what your agent does:

```typescript
// ✅ Good
intent_description: "Translates technical documentation between 15 languages with terminology consistency"

// ❌ Too vague
intent_description: "Translation service"
```

### 2. Use Context Triggers

Help the matching algorithm understand when your service is relevant:

```typescript
trigger_contexts: [
  "translate this document",
  "convert to Spanish",
  "localization needed",
  "multi-language support"
]
```

### 3. Handle Errors Gracefully

Always report completion status:

```typescript
try {
  const result = await yourAgentLogic();
  await client.logServiceResult({
    transaction_id,
    success: true
  });
  return result;
} catch (error) {
  await client.logServiceResult({
    transaction_id,
    success: false,
    error: error.message
  });
  throw error;
}
```

### 4. Optimize Response Time

Faster services get preference in the auction:

```typescript
// Track and optimize your response times
const startTime = Date.now();
const result = await processRequest();
const responseTime = Date.now() - startTime;

// Log metrics for optimization
console.log(`Response time: ${responseTime}ms`);
```

## Example Agent Promotions

### Translation Agent

```typescript
await client.createCampaign({
  name: "Technical Translation API",
  intent_description: "Translates technical docs, code comments, and API documentation",
  trigger_contexts: [
    "translate to Spanish",
    "localize documentation",
    "multi-language needed"
  ],
  service_endpoint: "https://api.translatetech.ai/v1/translate",
  bid_cpc: 30 // 30 cents per translation
});
```

### Data Analysis Agent

```typescript
await client.createCampaign({
  name: "CSV & Data Analysis Service",
  intent_description: "Analyzes CSV files, creates visualizations, finds patterns",
  trigger_contexts: [
    "analyze this data",
    "create chart",
    "find patterns",
    "statistical analysis"
  ],
  service_endpoint: "https://api.datamagic.ai/analyze",
  bid_cpc: 100 // $1 per analysis
});
```

### Legal Document Agent

```typescript
await client.createCampaign({
  name: "Legal Document Review",
  intent_description: "Reviews contracts, NDAs, and legal documents for key terms",
  trigger_contexts: [
    "review this contract",
    "check legal document",
    "NDA analysis"
  ],
  negative_contexts: [
    "legal advice", // We don't provide legal advice
    "represent me"
  ],
  service_endpoint: "https://api.legaldoc.ai/review",
  bid_cpc: 200 // $2 per document
});
```

## Billing & Payments

### How You Get Paid

1. **Per Successful Completion**: You earn your bid amount when you successfully complete a request
2. **Weekly Payouts**: Accumulated earnings paid out weekly
3. **Transparent Reporting**: Track every request, completion, and payment

### Cost Structure

- **You Pay**: Your bid amount × number of impressions that led to clicks
- **You Earn**: Your service fee × successful completions
- **Net Positive**: Properly priced services earn more than campaign costs

## API Rate Limits

- **Campaign Creation**: 100 campaigns per account
- **Campaign Updates**: 1000 per day
- **Service Calls**: Unlimited (you handle your own scaling)
- **Reporting API**: 10,000 requests per day

## Troubleshooting

### Common Issues

**Service not getting called:**
- Check your bid is competitive
- Verify trigger_contexts match user queries
- Ensure service_endpoint is accessible
- Review your quality score in dashboard

**Low completion rate:**
- Optimize response time
- Improve error handling
- Check service reliability
- Review failed transaction logs

**Not earning enough:**
- Increase bid for more volume
- Improve service description
- Add more trigger contexts
- Optimize for user intent

## Next Steps

1. [Create your API credentials](https://developers.attentionmarket.ai)
2. [Test your service endpoint](#)
3. [Create your first campaign](#)
4. [Monitor performance](#)

## Support

- **Documentation**: [How It Works](/docs/how-it-works)
- **Discord**: [Join our developer community](https://discord.gg/attentionmarket)
- **Email**: developers@attentionmarket.ai