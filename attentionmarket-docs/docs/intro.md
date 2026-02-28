---
sidebar_position: 1
title: Introduction
slug: /intro
---

# AttentionMarket SDK Documentation

Build new revenue streams for your AI applications with contextual advertising that users actually appreciate.

## What is AttentionMarket?

AttentionMarket is an advertising exchange designed specifically for AI applications. We help developers monetize their chatbots, assistants, and agents by displaying contextually relevant sponsored content.

Unlike traditional advertising, we use the context of user conversations to match intent with appropriate advertisers - no tracking, no cookies, just pure contextual relevance.

## Why We Exist

We're building an open network where AI can discover the best products and services to help users solve their problems.

In a world where AI is becoming the primary interface for information and decision-making, we believe developers should control their own monetization destiny - not be dependent on the whims of model providers or tech giants.

**Our principles:**
- **Developer Independence** - Your monetization shouldn't depend on OpenAI, Google, or Meta's policies
- **Transparent Marketplace** - Open auction system with clear pricing and quality metrics
- **User-First Experience** - Ads must be helpful, relevant, and clearly disclosed
- **Network Neutrality** - We don't favor any advertiser or developer - quality and relevance win
- **Economic Fairness** - Developers keep the majority of revenue, with transparent fee structures

We're creating the economic infrastructure for the AI ecosystem - where developers can build sustainable businesses, advertisers can reach engaged audiences, and users get helpful recommendations without invasive tracking.

## How It Works

Our SDK integrates seamlessly with your existing AI application:

1. **Context Analysis** - We analyze the user's message and conversation history
2. **Intent Matching** - Our system identifies relevant advertiser campaigns
3. **Ad Selection** - The highest quality, most relevant ad is returned
4. **Display Control** - You decide how and when to show recommendations
5. **Automatic Tracking** - Clicks and conversions are tracked automatically

## Two Ways to Build on AttentionMarket

### 1. Monetize Your AI Application <span style={{fontSize: '0.75rem', color: 'var(--am-text-success)', marginLeft: '0.5rem', fontWeight: '600'}}>Available Now</span>

Turn your chatbot, assistant, or agent into a revenue stream by displaying contextually relevant recommendations. Your AI already understands user intent - now it can suggest products and services that actually help.

**Simple and direct:**
- **Get paid when users click** - Advertisers pay you directly, $0.15-$0.35 per click
- **5-minute integration** - Three lines of code, works with any AI framework

**Perfect for:** ChatGPT plugins, Discord bots, Slack apps, customer support agents, AI assistants

### 2. Build Discoverable AI Agents <span style={{fontSize: '0.75rem', color: 'var(--am-text-tertiary)', marginLeft: '0.5rem', fontWeight: '600'}}>Coming Q2 2024</span>

Create specialized AI agents that other AI applications can discover and use. When your agent solves problems for users across the network, you earn revenue.

**How it will work:**
- Build an agent with specific expertise (legal, finance, travel, etc.)
- List it in the AttentionMarket agent directory
- Other AI apps call your agent when users need your expertise
- You earn each time your agent provides value

**Example:** Your tax preparation agent gets discovered by financial planning bots, personal assistants, and business tools - earning you revenue across the entire AI ecosystem.

[Join the Agent Marketplace Waitlist →](https://attentionmarket.ai/agent-marketplace)

## Quick Example

```typescript
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const client = new AttentionMarketClient({
  apiKey: process.env.AM_API_KEY,
  agentId: process.env.AM_AGENT_ID
});

// Get contextually relevant ad based on user input
const ad = await client.decideFromContext({
  userMessage: "I need insurance for my new car",
  conversationHistory: [...],
  placement: 'sponsored_suggestion'
});

if (ad) {
  // Display the sponsored recommendation
  console.log(`${ad.creative.title} - ${ad.creative.body}`);
  console.log(`Learn more: ${ad.click_url}`);
}
```

## Installation

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="npm" label="npm" default>

```bash
npm install @the_ro_show/agent-ads-sdk
```

</TabItem>
<TabItem value="yarn" label="yarn">

```bash
yarn add @the_ro_show/agent-ads-sdk
```

</TabItem>
<TabItem value="pnpm" label="pnpm">

```bash
pnpm add @the_ro_show/agent-ads-sdk
```

</TabItem>
</Tabs>

## Getting Started

- [Quickstart Guide](/docs/quickstart) - 5-minute integration walkthrough
- [API Reference](/docs/smart-context) - Complete SDK documentation
- [Developer Portal](https://developers.attentionmarket.ai) - Get API keys and track earnings
- [Pricing & Earnings](/docs/pricing-earnings) - Understand monetization rates
- [Trust & Safety](/docs/trust-safety) - Quality controls and policies

## Resources

- **GitHub Repository**: [github.com/rtrivedi/agent-ads-sdk](https://github.com/rtrivedi/agent-ads-sdk)
- **NPM Package**: [@the_ro_show/agent-ads-sdk](https://www.npmjs.com/package/@the_ro_show/agent-ads-sdk)
- **Developer Portal**: [developers.attentionmarket.ai](https://developers.attentionmarket.ai)