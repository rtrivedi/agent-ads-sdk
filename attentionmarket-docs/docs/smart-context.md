---
sidebar_position: 3
title: Context-Aware Matching
---

# Context-Aware Matching

AttentionMarket uses semantic embeddings to understand conversation context and deliver relevant promotions. This system automatically improves ad relevance by understanding the meaning behind conversations, not just keywords.

## How It Works

### Semantic Understanding vs Keyword Matching

Traditional advertising relies on keyword matching. We use multi-dimensional semantic embeddings to understand actual intent:

```typescript
// The SDK automatically benefits from semantic matching
const ad = await client.decideFromContext({
  userMessage: "Our code reviews are taking forever",
  conversationHistory: [
    "We're a growing team",
    "Need to speed up our development process"
  ]
});

// Behind the scenes:
// - Generates semantic embedding of the conversation
// - Matches against campaign embeddings using multiple dimensions
// - Evaluates relevance using proprietary algorithms
// - Returns the most contextually relevant promotion
```

### The Matching Algorithm

Our proprietary scoring system evaluates multiple factors:

- **Problem-Solution Fit**: How well does the promotion solve the user's problem?
- **Contextual Relevance**: Is this the right time and situation?
- **Historical Patterns**: Does this match successful past interactions?
- **Audience Alignment**: Is this the right type of user?
- **Negative Filtering**: Avoiding irrelevant or unwanted matches

The exact weights and calculations are continuously optimized based on performance data.

## Why Context-Aware Matching Works Better

Semantic understanding improves relevance in several ways:

| Benefit | How It Helps |
|---------|-------------|
| **Better Intent Understanding** | Matches meaning, not just keywords |
| **Reduced False Positives** | Avoids irrelevant keyword matches |
| **Context Awareness** | Understands conversation flow |

## Integration Guide

### Basic Integration

No code changes required. The SDK automatically uses context-aware matching:

```typescript
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const client = new AttentionMarketClient({
  apiKey: process.env.AM_API_KEY,
  agentId: process.env.AM_AGENT_ID
});

// Automatic context-aware matching
const ad = await client.decideFromContext({
  userMessage: "I need insurance for my new car"
});
```

### Enhanced Context (Recommended)

Provide conversation history for better matching:

```typescript
const ad = await client.decideFromContext({
  userMessage: "What about comprehensive coverage?",
  conversationHistory: [
    "I just bought a 2024 Tesla Model 3",
    "I'm a new driver in California",
    "Looking for good insurance rates"
  ]
});

// The system now understands:
// - User owns a new Tesla (high-value vehicle)
// - New driver (specific insurance needs)
// - Location context (California regulations)
// - Price-conscious (looking for "good rates")
```

### Multi-Turn Conversations

Track conversation sessions for continuity:

```typescript
class ConversationHandler {
  private sessionId: string;
  private history: string[] = [];

  constructor(private client: AttentionMarketClient) {
    this.sessionId = `session_${Date.now()}`;
  }

  async processMessage(userMessage: string) {
    // Get contextually relevant promotion
    const ad = await this.client.decideFromContext({
      userMessage,
      conversationHistory: this.history.slice(-10), // Last 10 messages
      session_context: {
        session_id: this.sessionId,
        message_count: this.history.length + 1
      }
    });

    // Update history for next turn
    this.history.push(userMessage);

    return ad;
  }
}
```

## What Makes Context-Aware Matching Better

### 1. Understands Meaning, Not Just Keywords

```typescript
// These different phrases all match the same intent:
"Our PRs are piling up"
"Code review bottleneck"
"Takes forever to get feedback on pull requests"
"Review process is too slow"

// All would match campaigns targeting code review solutions
```

### 2. Avoids Irrelevant Matches

Campaigns can specify negative contexts to prevent bad matches:

```typescript
// User says: "We need manual review for compliance"
// System recognizes negative context for automation tools
// Won't show ads for automated code review tools
```

### 3. Contextual Relevance

The system understands conversation flow:

```typescript
// Message 1: "I'm planning a trip"
// Message 2: "Need to find accommodation"
// Message 3: "What's the best option?"

// Without context: "What's the best option?" is ambiguous
// With context: System knows it's about travel accommodation
```

## Implementation Examples

### Discord Bot

```typescript
import { Client } from 'discord.js';
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const amClient = new AttentionMarketClient({
  apiKey: process.env.AM_API_KEY!,
  agentId: process.env.AM_AGENT_ID!
});

// Track conversation per channel
const channelHistory = new Map<string, string[]>();

bot.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const channelId = message.channel.id;
  const history = channelHistory.get(channelId) || [];

  // Process message and get response
  const response = await processUserMessage(message.content);

  // Get contextually relevant promotion
  const ad = await amClient.decideFromContext({
    userMessage: message.content,
    conversationHistory: history.slice(-10)
  });

  // Update history
  history.push(message.content);
  channelHistory.set(channelId, history);

  // Send response with optional promotion
  if (ad && ad.relevance_score > 0.7) {
    await message.reply({
      content: response,
      embeds: [{
        title: "Sponsored",
        description: ad.creative.body,
        url: ad.click_url
      }]
    });
  } else {
    await message.reply(response);
  }
});
```

### ChatGPT Plugin

```typescript
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

export class ChatGPTPlugin {
  private client: AttentionMarketClient;

  constructor() {
    this.client = new AttentionMarketClient({
      apiKey: process.env.AM_API_KEY!,
      agentId: process.env.AM_AGENT_ID!
    });
  }

  async handleQuery(query: string, context: any) {
    // Generate AI response
    const aiResponse = await this.generateResponse(query, context);

    // Get relevant promotion
    const ad = await this.client.decideFromContext({
      userMessage: query,
      conversationHistory: context.history || []
    });

    // Return combined response
    return {
      answer: aiResponse,
      sponsored_recommendation: ad ? {
        title: ad.creative.title,
        description: ad.creative.body,
        link: ad.click_url,
        disclaimer: "Sponsored"
      } : null
    };
  }
}
```

### Slack App

```typescript
import { App } from '@slack/bolt';
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const amClient = new AttentionMarketClient({
  apiKey: process.env.AM_API_KEY!,
  agentId: process.env.AM_AGENT_ID!
});

app.message(async ({ message, say }) => {
  // Get thread history for context
  const thread = await getThreadHistory(message.ts);

  // Process with context
  const ad = await amClient.decideFromContext({
    userMessage: message.text,
    conversationHistory: thread.messages.map(m => m.text)
  });

  // Respond with optional promotion
  if (ad) {
    await say({
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: "Here's a relevant resource:" }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${ad.creative.title}*\n${ad.creative.body}\n<${ad.click_url}|Learn more>`
          },
          accessory: {
            type: "button",
            text: { type: "plain_text", text: "View" },
            url: ad.click_url
          }
        }
      ]
    });
  }
});
```

## Best Practices

### 1. Always Include Recent Context

```typescript
// ✅ Good - provides context
const ad = await client.decideFromContext({
  userMessage: "What's the pricing?",
  conversationHistory: [
    "I need project management software",
    "For a team of 10 people"
  ]
});

// ❌ Bad - ambiguous without context
const ad = await client.decideFromContext({
  userMessage: "What's the pricing?"
});
```

### 2. Limit History Length

Keep the last 5-10 messages for optimal performance:

```typescript
const ad = await client.decideFromContext({
  userMessage: currentMessage,
  conversationHistory: allMessages.slice(-10) // Last 10 only
});
```

### 3. Use Session Tracking

For multi-turn conversations, maintain session continuity:

```typescript
const sessionId = `session_${userId}_${Date.now()}`;

// Use same session ID throughout conversation
const ad = await client.decideFromContext({
  userMessage,
  conversationHistory,
  session_context: {
    session_id: sessionId,
    message_count: messageNumber
  }
});
```

## Performance Impact

Expected improvements with Smart Context enabled:

| Feature | Expected CTR Improvement | Expected Revenue Impact |
|---------|-------------------------|------------------------|
| Intent Detection | +30-40% | +35-45% |
| Interest Matching | +20-30% | +25-35% |
| Session Tracking | +10-20% | +15-25% |
| **Combined** | **+50-70%** | **+60-80%** |

*Based on early testing. Actual results may vary.*

## Claude Code Integration

Building with Claude Code? Use this prompt for seamless integration:

```
Add AttentionMarket smart context to improve ad relevance by 2-3x.
Update all decideFromContext() calls to include conversationHistory.
Track sessions with unique session_id for multi-turn conversations.
Implement session tracking to maintain context across messages.
```

Expected output: Complete integration with conversation history tracking, session management, and optimized context handling.

## Technical Details

### Embedding Generation

Our system generates multiple specialized embeddings for each campaign, covering:

- Problem understanding and solution matching
- Audience profiling and targeting
- Contextual triggers and use cases
- Pattern matching and filtering

The specific architecture and embedding dimensions are proprietary technology that enables our industry-leading matching accuracy.

### Matching Process

Our system uses advanced semantic matching to find the most relevant promotions for each conversation. The process considers context, intent, and multiple quality factors to deliver optimal results.

### Performance Characteristics

- **Low Latency**: Minimal overhead for real-time applications
- **Context Window**: Supports multi-turn conversations
- **Optimized Caching**: Improved response times for frequent queries
- **High Relevance**: Advanced matching algorithms ensure quality results

## Privacy & Security

- **No Raw Data Sharing**: Conversation history never shared with advertisers
- **Semantic Only**: Only abstract embeddings used for matching
- **No Personal Data**: System doesn't store user identifiers
- **Ephemeral Processing**: Context cleared after each request

## FAQ

<details>
<summary>Will this work with my existing integration?</summary>

Yes, context-aware matching is automatic and backward compatible. Your existing code will benefit immediately without changes.
</details>

<details>
<summary>How much context should I provide?</summary>

The last 5-10 messages usually provide sufficient context. More than 10 messages has diminishing returns and may increase latency.
</details>

<details>
<summary>Does this increase API latency?</summary>

Minimal impact - typically adds less than 50ms. The semantic matching happens in parallel with other processing.
</details>

<details>
<summary>Can advertisers see my users' conversations?</summary>

No. Advertisers never see raw conversation data. They only receive aggregated performance metrics (impressions, clicks, CTR).
</details>

<details>
<summary>What if the context understanding is wrong?</summary>

The system fails gracefully. Even without perfect context understanding, the base semantic matching ensures relevant results.
</details>

## Migration from v0.14.x

No code changes required. To benefit from enhanced matching:

```bash
# Update SDK
npm update @the_ro_show/agent-ads-sdk
```

Optional: Add conversation history for better results:

```typescript
// Before (still works)
const ad = await client.decideFromContext({
  userMessage: "I need insurance"
});

// After (recommended for better relevance)
const ad = await client.decideFromContext({
  userMessage: "I need insurance",
  conversationHistory: previousMessages
});
```

## Next Steps

- [How It Works](/docs/how-it-works) - Understand the auction system
- [Pricing & Earnings](/docs/pricing-earnings) - See revenue potential
- [Quality Controls](/docs/quality-relevance-explained) - Fine-tune selection