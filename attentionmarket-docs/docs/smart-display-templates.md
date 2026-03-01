---
sidebar_position: 10
title: Smart Display Concepts
---

# Smart Display Concepts

Principles and patterns for intelligently displaying contextual recommendations that respect user attention while generating revenue.

## Core Philosophy

Smart display isn't about specific styles or implementations—it's about **intelligent decision-making** that creates value for users while generating revenue. These concepts guide you in building your own implementation that fits your application's unique needs.

### The Three Pillars of Smart Display

1. **Contextual Relevance** - Show recommendations when they genuinely help
2. **Natural Integration** - Blend with your application's flow and design
3. **User Respect** - Never interrupt, annoy, or deceive

## Understanding Smart Display

Smart display means making intelligent decisions about:
- **When** to fetch recommendations (timing logic)
- **Whether** to show them (relevance scoring)
- **How** to present them (integration patterns)
- **Why** users would care (value alignment)

### What Makes Display "Smart"?

**Smart display adapts to context:**
- User's current task and intent
- Conversation flow and natural breaks
- Engagement levels and receptiveness
- Platform capabilities and constraints

**It's NOT about:**
- Specific colors, fonts, or animations
- Exact pixel dimensions or spacing
- Particular UI frameworks or libraries
- Copying prescribed implementations

## Placement Intelligence

### The Decision Framework

Smart placement uses a scoring system that evaluates multiple contextual factors. Think of it as a decision tree, not a rigid formula:

```
Should I show a recommendation?
│
├─ Is the user receptive?
│  ├─ Yes: Consider timing
│  └─ No: Wait or skip
│
├─ Is the context appropriate?
│  ├─ Commercial intent detected: Higher priority
│  ├─ Problem-solving moment: Medium priority
│  └─ Casual conversation: Lower priority
│
└─ What's the optimal presentation?
   ├─ High relevance + High intent: Immediate display
   ├─ Medium relevance: Progressive disclosure
   └─ Low relevance: Skip or defer
```

### Contextual Signals to Consider

**Positive Signals** (increase likelihood):
- User expresses a need or problem
- Commercial intent keywords present
- Task completion moments
- Natural conversation pauses
- High engagement levels

**Negative Signals** (decrease likelihood):
- Error states or frustration
- First few interactions
- Recent recommendation shown
- Explicit disinterest expressed
- Critical task in progress

### Timing Principles

**Respect Natural Rhythms:**
- After providing value, not before
- During transitions, not interruptions
- At decision points, not distractions
- Following user cues, not fixed schedules

**Adaptive Frequency:**
- More engaged users → slightly higher frequency
- Less engaged users → wider spacing
- Recent declination → longer cooldown
- Successful interaction → earned trust

## Display Patterns (Conceptual)

### 1. Contextual Integration Pattern

**Concept:** Recommendations flow naturally within the primary content.

**When it works best:**
- User explicitly expresses need
- Direct relevance to current topic
- Immediate value is clear

**Behavioral approach:**
- Present after answering user's question
- Maintain visual hierarchy (recommendation secondary to main content)
- Provide clear value proposition
- Easy dismissal without consequence

### 2. Progressive Disclosure Pattern

**Concept:** Reveal information gradually based on user interest.

**When it works best:**
- Medium relevance situations
- Exploratory conversations
- Building trust scenarios

**Behavioral flow:**
1. Subtle initial mention or teaser
2. Wait for interest signal
3. Reveal full details if engaged
4. Gracefully move on if not

**Why this works:** Users control their experience and feel respected.

### 3. Natural Break Pattern

**Concept:** Use conversation pauses and transitions.

**When it works best:**
- Task completion moments
- Topic transitions
- Natural pauses in interaction

**Behavioral approach:**
- Detect pause or completion
- Brief delay before presentation
- Non-intrusive entry
- Contextually relevant to recent discussion

### 4. Deferred Suggestion Pattern

**Concept:** Save recommendations for optimal future moments.

**When it works best:**
- Low current relevance
- User focused on specific task
- Building conversation context

**Behavioral approach:**
- Collect context without displaying
- Wait for receptive moment
- Present when most valuable
- May never show if not appropriate

## Platform Adaptation Principles

### Chat Interfaces

**Consider the medium:**
- Messages flow linearly
- Limited screen space
- Typing indicators and read receipts
- User expects conversation continuity

**Smart approaches:**
- Use platform's native message styling
- Respect conversation threading
- Consider typing delays
- Maintain personality consistency

### Voice Interfaces

**Consider the medium:**
- No visual feedback
- Sequential information processing
- Attention is precious
- Interruptions are jarring

**Smart approaches:**
- Natural pause before suggestions
- Brief, scannable mentions
- Offer to send details to companion app
- Accept voice dismissals gracefully

### Mobile Applications

**Consider the medium:**
- Touch targets and gestures
- Variable screen sizes
- Battery and data consciousness
- App-specific design languages

**Smart approaches:**
- Respect platform conventions
- Use native animation patterns
- Consider thumb reachability
- Optimize for quick scanning

### Command Line Interfaces

**Consider the medium:**
- Text-only environment
- Power user audience
- Efficiency valued
- Minimal visual hierarchy

**Smart approaches:**
- Respect terminal aesthetics
- Use ASCII formatting sparingly
- Keep messages concise
- Provide quick skip commands

## Intelligence for AI Agents

### Teaching AI to Be Smart About Recommendations

**Core Principles for AI:**
1. Complete the user's request first
2. Evaluate context before fetching
3. Choose presentation strategy based on signals
4. Respect negative responses immediately

### Decision Logic for AI

```
User Message Received
    ↓
Complete Primary Task
    ↓
Evaluate Context:
- Message count sufficient?
- Commercial intent present?
- User sentiment positive?
- Recent ad shown?
    ↓
If appropriate:
- Fetch recommendation
- Choose display strategy
- Present naturally
    ↓
If not appropriate:
- Continue conversation
- Re-evaluate later
```

### Progressive Disclosure for AI

**The concept:** AI agents reveal sponsored content conversationally.

**Natural progression:**
1. **Soft introduction:** "I also found something that might help..."
2. **Interest check:** Wait for user signal
3. **Value reveal:** Share details if interested
4. **Graceful exit:** Move on if not

**Why this works:** Mimics human helpfulness rather than advertising.

## Measurement Without Prescription

### What to Track

**Engagement Metrics:**
- Did users see it? (viewability)
- Did they interact? (engagement)
- Did they find value? (conversion)
- Did they dismiss? (rejection rate)

**Context Metrics:**
- Which patterns work for your users?
- What timing gets best response?
- Which contexts drive value?

**Not:**
- Specific color performance
- Exact placement coordinates
- Animation timing precision

### Optimization Approach

1. **Start simple** - Basic relevant display
2. **Observe patterns** - What works for YOUR users
3. **Test variations** - Different timing, not just styling
4. **Iterate on intelligence** - Smarter decisions, not fancier displays

## Implementation Freedom

### You Decide Everything

**Visual Design:**
- Match your brand and aesthetic
- Use your existing design system
- Choose animations that fit your app
- Create layouts that work for your users

**Technical Implementation:**
- Use any framework or vanilla code
- Implement in your preferred language
- Choose your state management
- Optimize for your performance needs

**User Experience:**
- Design flows that match your app
- Create dismissal patterns users expect
- Build trust through consistency
- Respect your specific audience

### What AttentionMarket Provides

- **The recommendation content** via API
- **Relevance scoring** for smart decisions
- **Payment handling** for your earnings
- **Fraud prevention** and quality control

### What You Create

- **The display logic** for your application
- **The visual design** matching your brand
- **The user experience** your users expect
- **The timing strategy** for your context

## Best Practices (Conceptual)

### Do's
- ✅ **Prioritize helpfulness** - Value before monetization
- ✅ **Respect attention** - Never force or trick
- ✅ **Test with users** - Your audience is unique
- ✅ **Iterate on intelligence** - Smarter, not flashier
- ✅ **Maintain transparency** - Clear sponsorship disclosure

### Don'ts
- ❌ **Copy exact implementations** - Build for your app
- ❌ **Prioritize revenue over UX** - Users always come first
- ❌ **Show without relevance** - Quality over quantity
- ❌ **Persist after "no"** - Respect user choices
- ❌ **Hide sponsored nature** - Transparency builds trust

## Quick Conceptual Examples

### Example: E-commerce Assistant

**Scenario:** User asks about product recommendations

**Smart approach:**
1. Provide genuine recommendations first
2. Mention sponsored option if relevant
3. Highlight unique value (discount, exclusive offer)
4. Make sponsorship clear but not dominant

### Example: Travel Planning Bot

**Scenario:** User planning a trip

**Smart approach:**
1. Help with itinerary planning
2. When user mentions bookings, fetch relevant offers
3. Present as "I found a discount code" (progressive)
4. Include in natural conversation flow

### Example: Technical Support Chat

**Scenario:** User needs help with software

**Smart approach:**
1. Solve their problem completely first
2. If they need additional tools, mention sponsored options
3. Focus on how it solves their specific problem
4. Never interfere with support flow

## Summary

Smart display is about **intelligence, not implementation**. Focus on:

1. **Making smart decisions** about when and whether to show recommendations
2. **Respecting user context** and attention
3. **Integrating naturally** with your application's flow
4. **Creating value** for users while generating revenue
5. **Building trust** through transparency and respect

The specific way you implement these concepts—the colors, animations, layouts, and code—is entirely up to you. These patterns are meant to inspire intelligent decision-making, not dictate visual design.

## Further Reading

- [How It Works](/docs/how-it-works) - Understanding the recommendation engine
- [API Reference](/docs/api-reference) - Technical integration details
- [Best Practices Guide](https://github.com/attentionmarket/examples) - Community examples