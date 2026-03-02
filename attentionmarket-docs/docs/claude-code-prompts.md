---
sidebar_position: 1.7
title: Prompt Library
---

# Claude Code Prompt Library

Ready-to-copy prompts for every integration scenario. Just replace credentials and paste into Claude Code.

## Basic Integration Prompts

### Minimal Setup (Fastest)

```
Integrate AttentionMarket SDK with minimal setup.

Credentials:
- API Key: am_test_YOUR_KEY_HERE
- Agent ID: agt_YOUR_AGENT_ID_HERE

Create a simple wrapper function that:
1. Takes user message as input
2. Returns ad if relevant (score > 0.7)
3. Returns null if no relevant ad
4. Handles errors gracefully

Include .env setup and test script.
```

**Use when:** Quick proof-of-concept, testing, simple apps

**Expected output:** Single function + .env + test

---

### Production-Ready Integration

```
Integrate AttentionMarket SDK for production use.

Credentials:
- API Key: am_test_YOUR_KEY_HERE
- Agent ID: agt_YOUR_AGENT_ID_HERE

Requirements:
1. Auto-detect framework from package.json
2. Error handling with retries (max 2)
3. Timeout protection (2 second max)
4. Graceful degradation if ads fail
5. TypeScript with full type safety
6. Test script with multiple queries
7. Environment variable validation

Generate complete, production-ready code.
```

**Use when:** Production apps, high uptime requirements

**Expected output:** Complete integration + tests + error handling

---

## Smart Context Prompts

### Basic Smart Context

```
Integrate AttentionMarket with Smart Context for better relevance.

Credentials: am_test_YOUR_KEY, agt_YOUR_ID

Add Smart Context features:
1. Track conversation history (last 5 messages)
2. Auto-detect user intent stage
3. Extract interests from conversation
4. Use session IDs for continuity
5. Only show ads when relevance > 0.8

Expected improvement: 2-3x better CTR
```

**Use when:** Multi-turn conversations, chatbots, assistants

**Expected improvement:** +50-70% CTR

---

### Advanced Smart Context

```
Integrate AttentionMarket with advanced Smart Context.

Credentials: am_test_YOUR_KEY, agt_YOUR_ID

Build a context-aware system that:
1. Maintains conversation history across sessions
2. Detects intent stage (research, comparison, ready-to-buy)
3. Tracks user interests and topics
4. Calculates decision momentum
5. Adjusts ad strategy based on user journey:
   - Research stage → Educational ads
   - Comparison stage → Competitive ads
   - Ready-to-buy → Action-oriented CTAs
6. Stores session data in Redis/memory
7. Includes analytics dashboard

Expected metrics:
- CTR: 12-18%
- Relevance score: 0.85+ average
- Revenue per impression: $0.20-$0.80
```

**Use when:** Enterprise apps, high-value users, complex flows

**Expected improvement:** +60-80% CTR

---

## Revenue Optimization Prompts

### Maximum Revenue

```
Integrate AttentionMarket optimized for maximum revenue.

Credentials: am_test_YOUR_KEY, agt_YOUR_ID

Revenue optimization:
1. High-quality ads only (minQualityScore: 0.7)
2. Minimum bid threshold:
   - Insurance/Legal: $3.00+ (minCPC: 300)
   - E-commerce: $1.50+ (minCPC: 150)
   - General: $1.00+ (minCPC: 100)
3. Block low-revenue categories
4. Use Smart Context for better targeting
5. Track conversions to optimize quality score
6. A/B test different relevance thresholds
7. Dashboard showing:
   - Revenue per impression
   - CTR by category
   - Fill rate vs revenue tradeoff

Expected metrics:
- Revenue per impression: $0.30-$1.20
- CTR: 10-15%
- Fill rate: 30-50% (lower but higher value)
```

**Use when:** Monetization is primary goal

**Expected revenue:** 2-3x higher per impression

---

### Balanced Revenue & UX

```
Integrate AttentionMarket balancing revenue and user experience.

Credentials: am_test_YOUR_KEY, agt_YOUR_ID

Balanced approach:
1. Quality threshold: 0.6 (good but not restrictive)
2. Minimum CPC: $0.75 (minCPC: 75)
3. Relevance threshold: 0.7 (highly relevant only)
4. Smart Context enabled
5. Frequency capping (max 1 ad per 3 messages)
6. Category allow list for brand alignment
7. User can dismiss ads (track dismissals)

Expected metrics:
- CTR: 8-12%
- Revenue per impression: $0.15-$0.50
- Fill rate: 50-70%
- User satisfaction: High
```

**Use when:** Premium apps, brand-sensitive contexts

**Expected outcome:** High revenue without annoying users

---

## Brand Safety Prompts

### Family-Friendly Apps

```
Integrate AttentionMarket with strict brand safety controls.

Credentials: am_test_YOUR_KEY, agt_YOUR_ID

Brand safety requirements:
1. Block all sensitive categories:
   - Gambling (category 601)
   - Adult content (category 602)
   - Alcohol (category 603)
   - Political content (category 604)
2. Minimum quality score: 0.8 (excellent only)
3. Manual review option for borderline content
4. User reporting feature for inappropriate ads
5. Category allowlist instead of blocklist

Only show ads from: education, technology, family products, entertainment
```

**Use when:** Kids apps, educational platforms, family services

---

### Enterprise/B2B Apps

```
Integrate AttentionMarket for enterprise B2B application.

Credentials: am_test_YOUR_KEY, agt_YOUR_ID

Enterprise requirements:
1. Professional categories only (B2B tools, enterprise software)
2. Block consumer categories (retail, gaming, entertainment)
3. High quality threshold: 0.8
4. Minimum CPC: $5.00 (enterprise ads only)
5. Relevance threshold: 0.85
6. Display in dedicated "Partner Spotlight" section
7. Professional styling (corporate color scheme)

Expected audience: Business professionals, decision makers
```

**Use when:** B2B apps, enterprise tools, professional services

---

## Platform-Specific Prompts

### Discord Bot

```
Integrate AttentionMarket into my Discord bot.

Credentials: am_test_YOUR_KEY, agt_YOUR_ID

Discord-specific features:
1. Display ads as rich embeds with thumbnail
2. Track channel context for relevance
3. Rate limit: max 1 ad per 5 messages per channel
4. Only show ads in allowed channels (configurable)
5. Slash command to disable ads per user
6. Analytics per server
7. Premium servers can disable ads (monetization hook)

Format: Use EmbedBuilder with branded colors
```

**Expected CTR:** 12-18%

---

### Slack App

```
Integrate AttentionMarket into my Slack workspace app.

Credentials: am_test_YOUR_KEY, agt_YOUR_ID

Slack-specific features:
1. Display using Block Kit (buttons + formatted text)
2. Respect channel preferences (opt-out)
3. Only show in public channels (not DMs)
4. Track workspace context for relevance
5. Admin dashboard for workspace settings
6. Usage analytics per channel

Expected integration: Event API + Block Kit
```

**Expected CTR:** 10-14%

---

### Next.js App

```
Integrate AttentionMarket into my Next.js app (App Router).

Credentials: am_test_YOUR_KEY, agt_YOUR_ID

Next.js-specific features:
1. API route for ad requests (server-side)
2. React component for display (client-side)
3. Server-side rendering safe
4. Edge runtime compatible
5. Streaming support for long responses
6. Integration with Next.js analytics
7. TypeScript throughout

Use App Router conventions (app/ directory)
```

**Expected CTR:** 8-12%

---

## Testing & Verification Prompts

### Comprehensive Test Suite

```
Create a comprehensive test suite for my AttentionMarket integration.

Credentials: am_test_YOUR_KEY, agt_YOUR_ID

Test coverage:
1. Unit tests for wrapper functions
2. Integration tests with real API calls
3. Error handling tests (network failures, timeouts)
4. Performance tests (latency, throughput)
5. Relevance threshold testing
6. Display component rendering tests
7. Analytics tracking verification

Include:
- Jest/Vitest configuration
- Mock data for unit tests
- Test queries for integration tests
- Coverage reports
```

---

### A/B Testing Setup

```
Set up A/B testing for AttentionMarket ad performance.

Credentials: am_test_YOUR_KEY, agt_YOUR_ID

Test variations:
1. Relevance threshold (0.6 vs 0.7 vs 0.8)
2. Display position (inline vs sidebar vs modal)
3. With vs without Smart Context
4. Revenue optimization vs relevance optimization
5. Different quality score thresholds

Track metrics:
- CTR per variant
- Revenue per impression
- User engagement (clicks, time on page)
- Fill rate

Include analytics dashboard comparing variants.
```

---

## Mobile Integration Prompts

### iOS App (Swift)

```
Integrate AttentionMarket into my iOS app using REST API.

Credentials: am_test_YOUR_KEY, agt_YOUR_ID

iOS-specific requirements:
1. Create AdManager class using URLSession
2. Async/await for API calls
3. Combine framework for reactive updates
4. SwiftUI view for ad display
5. Track impressions and clicks
6. Handle offline gracefully
7. Cache ads for better performance

Endpoint: POST https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/decide

Generate complete Swift code with SwiftUI components.
```

---

### Android App (Kotlin)

```
Integrate AttentionMarket into my Android app using REST API.

Credentials: am_test_YOUR_KEY, agt_YOUR_ID

Android-specific requirements:
1. Create AdRepository using Retrofit
2. Kotlin Coroutines for async operations
3. Jetpack Compose for UI
4. Track impressions and clicks
5. Handle lifecycle correctly (no memory leaks)
6. Offline-first architecture
7. Material Design 3 styling

Endpoint: POST https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/decide

Generate complete Kotlin code with Compose UI.
```

---

## Advanced Features Prompts

### Conversion Tracking

```
Add conversion tracking to my AttentionMarket integration.

Credentials: am_test_YOUR_KEY, agt_YOUR_ID

Track conversions when users:
1. Complete a purchase
2. Sign up for account
3. Book a consultation
4. Download a resource
5. Complete onboarding

Requirements:
1. Track conversion with tracking_token
2. Include conversion value and type
3. Retry failed conversion tracking
4. Analytics dashboard showing:
   - Conversion rate per ad
   - Revenue attribution
   - Best performing campaigns
```

---

### Multi-Language Support

```
Integrate AttentionMarket with multi-language support.

Credentials: am_test_YOUR_KEY, agt_YOUR_ID

Support languages:
- English (en)
- Spanish (es)
- French (fr)
- German (de)

Features:
1. Auto-detect user language from conversation
2. Request ads in user's language
3. Fallback to English if language unavailable
4. Display currency based on location
5. Localized disclosure labels
6. Track performance by language

Expected: Higher relevance in native language
```

---

## Analytics & Monitoring Prompts

### Analytics Dashboard

```
Create an analytics dashboard for AttentionMarket performance.

Credentials: am_test_YOUR_KEY, agt_YOUR_ID

Dashboard metrics:
1. Real-time CTR
2. Revenue per impression (hourly, daily, monthly)
3. Fill rate trends
4. Top performing queries
5. Category performance breakdown
6. Quality score distribution
7. Conversion funnel

Tech stack: Next.js + Recharts for visualizations
Data source: Track all ad requests, impressions, clicks
```

---

### Monitoring & Alerts

```
Set up monitoring and alerts for AttentionMarket integration.

Credentials: am_test_YOUR_KEY, agt_YOUR_ID

Monitor:
1. API error rate (alert if > 5%)
2. Fill rate drops (alert if < 30%)
3. Average latency (alert if > 500ms)
4. CTR anomalies (sudden drops)
5. Revenue drops (day-over-day comparison)

Integration: Sentry for errors, Datadog for metrics
Alerts: Email + Slack notifications
```

---

## Migration Prompts

### Migrate from Another Ad Network

```
Migrate my app from Google AdSense to AttentionMarket.

Current setup: Google AdSense with ad units in React components

Credentials: am_test_YOUR_KEY, agt_YOUR_ID

Migration requirements:
1. Maintain existing ad positions
2. A/B test AdSense vs AttentionMarket
3. Track comparative performance
4. Gradual rollout (10% → 50% → 100%)
5. Fallback to AdSense if AttentionMarket fails
6. Performance comparison dashboard

Show me step-by-step migration plan.
```

---

## Quick Reference

| Scenario | Prompt Name | Expected Time |
|----------|------------|---------------|
| Quick PoC | Minimal Setup | 2 min |
| Production | Production-Ready | 5 min |
| Better CTR | Smart Context | 5 min |
| Max Revenue | Maximum Revenue | 5 min |
| Brand Safety | Family-Friendly | 3 min |
| Discord | Discord Bot | 4 min |
| Mobile | iOS/Android | 8 min |
| Analytics | Analytics Dashboard | 10 min |

## Need Help?

- **Quick Start**: [5-Minute Integration](/docs/claude-code-quickstart)
- **Framework Examples**: [Pattern Library](/docs/claude-code-patterns)
- **Support**: support@attentionmarket.ai
