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

**Here's an example implementation:**

```tsx
// Example: React component showing contextual integration
import React, { useState, useEffect } from 'react';
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

export const ContextualRecommendation: React.FC<{ userMessage: string }> = ({ userMessage }) => {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    // Only fetch if user expresses clear intent
    if (userMessage.match(/looking for|need|recommend|suggest/i)) {
      fetchRecommendation();
    }
  }, [userMessage]);

  const fetchRecommendation = async () => {
    const client = new AttentionMarketClient({ /* your config */ });
    const result = await client.decideFromContext({
      userMessage,
      placement: 'contextual_promotion'
    });

    if (result && result.relevance_score > 0.7) {
      setAd(result);
    }
  };

  if (!ad) return null;

  // Your styling choice - this is just one approach
  return (
    <div style={{
      marginTop: '1rem',
      padding: '1rem',
      borderLeft: '3px solid #your-brand-color',
      background: '#your-background'
    }}>
      <small style={{ opacity: 0.7 }}>Sponsored</small>
      <h4>{ad.creative.title}</h4>
      <p>{ad.creative.body}</p>
      <a href={ad.click_url} target="_blank" rel="sponsored">
        {ad.creative.cta} →
      </a>
    </div>
  );
};
```

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

**Here's an example implementation:**

```typescript
// Example: TypeScript class for progressive disclosure
class ProgressiveDisclosure {
  private recommendation: Ad | null = null;
  private state: 'idle' | 'teased' | 'revealed' = 'idle';

  async handleUserMessage(message: string, context: ConversationContext) {
    // Fetch recommendation if relevant
    if (this.detectIntent(message)) {
      this.recommendation = await client.decideFromContext({
        userMessage: message,
        conversationHistory: context.history
      });
    }

    // Show teaser if appropriate
    if (this.recommendation && this.shouldTease(context)) {
      await this.showTeaser();
    }
  }

  async showTeaser() {
    // Example teaser - adapt to your voice
    await displayMessage("By the way, I found a 20% discount that might help. Interested?");
    this.state = 'teased';
  }

  async handleResponse(response: string) {
    if (this.state !== 'teased') return;

    if (response.match(/yes|sure|tell me|interested/i)) {
      await this.revealFull();
    } else if (response.match(/no|not interested|skip/i)) {
      await displayMessage("No problem! Let me know if you change your mind.");
      this.reset();
    }
  }

  async revealFull() {
    const rec = this.recommendation!;
    await displayMessage(`
      ${rec.creative.title}
      ${rec.creative.body}

      ${rec.creative.promo_code ? `Code: ${rec.creative.promo_code}` : ''}
      Learn more: ${rec.click_url}

      (Sponsored by ${rec.disclosure.sponsor_name})
    `);
    this.state = 'revealed';
  }

  private reset() {
    this.recommendation = null;
    this.state = 'idle';
  }
}
```

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

**Here's an example implementation:**

```javascript
// Example: JavaScript natural break detection
class NaturalBreakDetector {
  constructor(client) {
    this.client = client;
    this.lastMessageTime = Date.now();
    this.pauseThreshold = 3000; // 3 seconds
    this.pendingRecommendation = null;
  }

  onUserMessage(message) {
    this.lastMessageTime = Date.now();

    // Check for task completion signals
    if (this.isTaskComplete(message)) {
      setTimeout(() => this.checkForBreak(), 1500);
    }
  }

  isTaskComplete(message) {
    const completionSignals = [
      /thanks|thank you/i,
      /that('s| is) (helpful|great|perfect)/i,
      /got it|makes sense/i,
      /done|finished|completed/i
    ];

    return completionSignals.some(pattern => pattern.test(message));
  }

  async checkForBreak() {
    const timeSinceLastMessage = Date.now() - this.lastMessageTime;

    if (timeSinceLastMessage >= this.pauseThreshold) {
      // Natural pause detected
      const ad = await this.client.decideFromContext({
        userMessage: this.lastUserMessage,
        placement: 'natural_break'
      });

      if (ad && ad.relevance_score > 0.6) {
        this.showBreakRecommendation(ad);
      }
    }
  }

  showBreakRecommendation(ad) {
    // Your UI implementation - this is just an example
    setTimeout(() => {
      displayWithTransition({
        content: `
          <div class="break-suggestion">
            <div class="divider">• • •</div>
            <p>You might also find this helpful:</p>
            <h4>${ad.creative.title}</h4>
            <p>${ad.creative.body}</p>
            <a href="${ad.click_url}">${ad.creative.cta}</a>
            <small>Sponsored by ${ad.disclosure.sponsor_name}</small>
          </div>
        `,
        animation: 'fade-in'
      });
    }, 500);
  }
}
```

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

**Here's an example implementation:**

```typescript
// Example: TypeScript deferred recommendation queue
class DeferredRecommendationQueue {
  private queue: Array<{
    ad: Ad;
    fetchedAt: number;
    context: string;
  }> = [];

  private maxQueueSize = 3;
  private maxAge = 10 * 60 * 1000; // 10 minutes

  async collectRecommendation(userMessage: string, context: ConversationContext) {
    // Fetch but don't display immediately
    const ad = await client.decideFromContext({
      userMessage,
      conversationHistory: context.history
    });

    if (ad && ad.relevance_score > 0.5) {
      this.queue.push({
        ad,
        fetchedAt: Date.now(),
        context: userMessage
      });

      // Keep queue size manageable
      if (this.queue.length > this.maxQueueSize) {
        this.queue.shift(); // Remove oldest
      }
    }
  }

  checkForOpportunity(currentContext: ConversationContext): Ad | null {
    // Clean expired recommendations
    this.cleanExpired();

    // Check if now is a good time
    if (!this.isGoodTiming(currentContext)) {
      return null;
    }

    // Find most relevant deferred recommendation
    const relevant = this.queue
      .filter(item => this.isStillRelevant(item, currentContext))
      .sort((a, b) => b.ad.relevance_score - a.ad.relevance_score);

    if (relevant.length > 0) {
      const selected = relevant[0];
      // Remove from queue once shown
      this.queue = this.queue.filter(item => item !== selected);
      return selected.ad;
    }

    return null;
  }

  private isGoodTiming(context: ConversationContext): boolean {
    return (
      context.messageCount > 5 &&
      context.userEngagement > 0.6 &&
      !context.hasRecentError &&
      context.timeSinceLastAd > 300000 // 5 minutes
    );
  }

  private isStillRelevant(item: any, context: ConversationContext): boolean {
    // Your relevance logic here
    const topicMatch = context.currentTopic === item.context;
    const notExpired = Date.now() - item.fetchedAt < this.maxAge;
    return topicMatch && notExpired;
  }

  private cleanExpired() {
    const now = Date.now();
    this.queue = this.queue.filter(
      item => now - item.fetchedAt < this.maxAge
    );
  }
}
```

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

**Here's an example implementation:**

```typescript
// Example: Slack-style message format
const formatForSlack = (ad: Ad) => ({
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `💡 *${ad.creative.title}*\n${ad.creative.body}`
      }
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: ad.creative.cta },
          url: ad.click_url,
          style: "primary"
        }
      ]
    },
    {
      type: "context",
      elements: [
        { type: "mrkdwn", text: `_Sponsored by ${ad.disclosure.sponsor_name}_` }
      ]
    }
  ]
});

// Example: WhatsApp interactive message
const formatForWhatsApp = (ad: Ad) => ({
  type: "interactive",
  interactive: {
    type: "button",
    body: {
      text: `${ad.creative.title}\n\n${ad.creative.body}\n\n_Sponsored_`
    },
    action: {
      buttons: [
        {
          type: "reply",
          reply: {
            id: `view_${ad.id}`,
            title: ad.creative.cta
          }
        }
      ]
    }
  }
});

// Example: Discord embed
const formatForDiscord = (ad: Ad) => ({
  embeds: [{
    title: ad.creative.title,
    description: ad.creative.body,
    color: 0x37FF81, // Your brand color
    fields: [
      {
        name: "Special Offer",
        value: ad.creative.promo_code || "Learn more",
        inline: true
      }
    ],
    footer: {
      text: `Sponsored by ${ad.disclosure.sponsor_name}`
    },
    url: ad.click_url
  }]
});
```

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

**Here's an example implementation:**

```javascript
// Example: Alexa skill voice recommendation
class VoiceRecommendation {
  async handleIntentWithRecommendation(intent, session) {
    // First, complete the user's request
    const primaryResponse = await this.handleIntent(intent);

    // Check if we should add a recommendation
    if (this.shouldAddRecommendation(intent, session)) {
      const ad = await this.fetchRecommendation(intent);

      if (ad) {
        return this.buildProgressiveVoiceResponse(primaryResponse, ad);
      }
    }

    return primaryResponse;
  }

  buildProgressiveVoiceResponse(primaryResponse, ad) {
    return {
      speak: `
        <speak>
          ${primaryResponse}
          <break time="500ms"/>
          By the way,
          <break time="300ms"/>
          ${ad.creative.teaser || `I found something from ${ad.disclosure.sponsor_name} that might help.`}
          Say "tell me more" if you're interested.
        </speak>
      `,
      reprompt: "Would you like to hear about the offer?",
      card: {
        type: "Simple",
        title: ad.creative.title,
        content: `${ad.creative.body}\n\nSponsored by ${ad.disclosure.sponsor_name}`
      },
      shouldEndSession: false
    };
  }

  handleTellMeMore(session) {
    const ad = session.attributes.pendingRecommendation;

    return {
      speak: `
        <speak>
          ${ad.creative.body}
          <break time="500ms"/>
          I've sent the details to your Alexa app.
          ${ad.creative.promo_code ? `The promo code is <say-as interpret-as="spell-out">${ad.creative.promo_code}</say-as>` : ''}
        </speak>
      `,
      card: {
        type: "LinkAccount",
        title: ad.creative.title,
        url: ad.click_url
      }
    };
  }
}
```

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

**Here's an example implementation:**

```swift
// Example: SwiftUI expandable card for iOS
import SwiftUI

struct SmartRecommendationCard: View {
    let ad: AttentionMarketAd
    @State private var isExpanded = false
    @State private var hasTrackedImpression = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Subtle header
            HStack {
                Image(systemName: "sparkle")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text("Suggestion")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Spacer()
                Text("Sponsored")
                    .font(.caption2)
                    .foregroundColor(.tertiary)
            }

            // Main content
            VStack(alignment: .leading, spacing: 8) {
                Text(ad.creative.title)
                    .font(.headline)

                if isExpanded {
                    Text(ad.creative.body)
                        .font(.body)
                        .foregroundColor(.secondary)
                        .transition(.opacity)

                    Button(action: {
                        trackClick()
                        openURL(ad.clickUrl)
                    }) {
                        HStack {
                            Text(ad.creative.cta)
                            Image(systemName: "arrow.right.circle")
                        }
                    }
                    .buttonStyle(.borderedProminent)
                }
            }
            .onTapGesture {
                withAnimation(.spring()) {
                    isExpanded.toggle()
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: isExpanded ? 4 : 2)
        .onAppear {
            if !hasTrackedImpression {
                trackImpression()
                hasTrackedImpression = true
            }
        }
    }
}

// Example: React Native for cross-platform
const MobileRecommendation = ({ ad }) => {
  const [expanded, setExpanded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    setExpanded(!expanded);
    Animated.timing(fadeAnim, {
      toValue: expanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity onPress={toggleExpand} activeOpacity={0.7}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.sponsored}>Sponsored</Text>
        </View>
        <Text style={styles.title}>{ad.creative.title}</Text>
        {expanded && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.body}>{ad.creative.body}</Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => Linking.openURL(ad.click_url)}
            >
              <Text style={styles.ctaText}>{ad.creative.cta}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </TouchableOpacity>
  );
};
```

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

**Here's an example implementation:**

```typescript
// Example: Node.js CLI tool with chalk
import chalk from 'chalk';
import ora from 'ora';

class CLIRecommendations {
  display(ad: Ad, options = {}) {
    const { minimal = false, color = true } = options;

    if (minimal) {
      // Minimal mode for power users
      console.log(`\n💡 ${ad.creative.title} - ${ad.click_url} (sponsored)`);
      return;
    }

    // Standard display with formatting
    const c = color ? chalk : {
      dim: (s) => s,
      blue: (s) => s,
      cyan: (s) => s,
      bold: (s) => s
    };

    console.log('\n' + c.dim('─'.repeat(50)));
    console.log(c.blue('💡 Suggestion') + ' ' + c.dim('(Sponsored)'));
    console.log(c.bold(ad.creative.title));
    console.log(ad.creative.body);

    if (ad.creative.promo_code) {
      console.log(c.cyan(`Code: ${ad.creative.promo_code}`));
    }

    console.log(c.cyan(`→ ${ad.creative.cta}: ${ad.click_url}`));
    console.log(c.dim(`From: ${ad.disclosure.sponsor_name}`));
    console.log(c.dim('─'.repeat(50)) + '\n');
  }

  async showWithProgress(fetchPromise: Promise<Ad>) {
    const spinner = ora('Finding relevant suggestions...').start();

    try {
      const ad = await fetchPromise;

      if (ad && ad.relevance_score > 0.7) {
        spinner.succeed('Found a relevant suggestion:');
        this.display(ad);
      } else {
        spinner.stop();
        // Don't show anything if not relevant
      }
    } catch (error) {
      spinner.stop();
      // Silently fail - don't interrupt user's workflow
    }
  }

  // Interactive mode for CLI tools
  async interactive(ad: Ad) {
    const inquirer = require('inquirer');

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: `💡 ${ad.creative.title} (Sponsored)`,
        choices: [
          { name: 'View details', value: 'view' },
          { name: 'Open in browser', value: 'open' },
          { name: 'Copy link', value: 'copy' },
          { name: 'Skip', value: 'skip' }
        ]
      }
    ]);

    switch (action) {
      case 'view':
        console.log(`\n${ad.creative.body}`);
        if (ad.creative.promo_code) {
          console.log(`Promo Code: ${ad.creative.promo_code}`);
        }
        console.log(`Link: ${ad.click_url}\n`);
        break;
      case 'open':
        require('open')(ad.click_url);
        console.log('Opening in browser...');
        break;
      case 'copy':
        require('clipboardy').writeSync(ad.click_url);
        console.log('Link copied to clipboard!');
        break;
      case 'skip':
        // Do nothing
        break;
    }
  }
}

// Usage in a CLI command
const cli = new CLIRecommendations();

// After completing a task
async function afterTaskCompletion(task) {
  console.log('✅ Task completed successfully!');

  // Fetch recommendation based on task context
  const ad = await client.decideFromContext({
    userMessage: task.description,
    placement: 'cli_completion'
  });

  if (ad) {
    // Show after a brief delay
    setTimeout(() => cli.display(ad, { minimal: process.env.MINIMAL }), 1000);
  }
}
```

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

**Here's an example implementation:**

```typescript
// Example: AI agent with smart recommendation capabilities
class AIAgentWithRecommendations {
  private client: AttentionMarketClient;
  private conversationState = {
    messageCount: 0,
    lastAdAt: 0,
    pendingRecommendation: null,
    userSentiment: 'neutral' as 'positive' | 'neutral' | 'negative'
  };

  async processUserMessage(message: string, history: string[]) {
    this.conversationState.messageCount++;

    // Step 1: Always complete user's request first
    const primaryResponse = await this.generateResponse(message, history);

    // Step 2: Evaluate if we should fetch a recommendation
    const shouldFetch = this.evaluateContext(message);

    if (shouldFetch) {
      const recommendation = await this.fetchSmartRecommendation(message, history);

      if (recommendation) {
        // Step 3: Choose presentation strategy
        return this.formatWithRecommendation(primaryResponse, recommendation);
      }
    }

    return primaryResponse;
  }

  evaluateContext(message: string): boolean {
    // Don't show too early
    if (this.conversationState.messageCount < 3) return false;

    // Respect frequency
    const messagesSinceLastAd = this.conversationState.messageCount - this.conversationState.lastAdAt;
    if (messagesSinceLastAd < 5) return false;

    // Check sentiment
    if (this.conversationState.userSentiment === 'negative') return false;

    // Detect commercial intent
    const hasIntent = /need|looking for|recommend|suggest|help with|best/.test(message.toLowerCase());

    return hasIntent;
  }

  async fetchSmartRecommendation(message: string, history: string[]) {
    const ad = await this.client.decideFromContext({
      userMessage: message,
      conversationHistory: history,
      placement: 'ai_conversation'
    });

    // Only return if highly relevant
    return ad && ad.relevance_score > 0.75 ? ad : null;
  }

  formatWithRecommendation(primaryResponse: string, ad: Ad) {
    this.conversationState.pendingRecommendation = ad;
    this.conversationState.lastAdAt = this.conversationState.messageCount;

    // Progressive disclosure approach
    return {
      message: primaryResponse,
      followUp: {
        delay: 1500,
        content: `By the way, ${ad.creative.teaser || "I found something that might help with this."}`,
        awaitResponse: true
      }
    };
  }

  handleFollowUpResponse(userResponse: string) {
    const ad = this.conversationState.pendingRecommendation;
    if (!ad) return null;

    // Check for interest
    if (userResponse.match(/yes|sure|tell me|what is it|interested/i)) {
      return this.revealRecommendation(ad);
    } else if (userResponse.match(/no|not interested|skip/i)) {
      this.conversationState.pendingRecommendation = null;
      return "No problem! Let me know if you need anything else.";
    }

    // Ambiguous response - continue normally
    return null;
  }

  revealRecommendation(ad: Ad) {
    return `
${ad.creative.title}

${ad.creative.body}

${ad.creative.promo_code ? `Promo code: ${ad.creative.promo_code}` : ''}

You can learn more here: ${ad.click_url}

(Sponsored by ${ad.disclosure.sponsor_name})
    `.trim();
  }
}

// Example: System prompt for LLMs like Claude or ChatGPT
const SMART_RECOMMENDATION_SYSTEM_PROMPT = `
You have access to sponsored recommendations via AttentionMarket.

RULES:
1. ALWAYS complete the user's request FIRST before considering recommendations
2. Only show recommendations that are genuinely helpful and relevant
3. Use progressive disclosure - tease first, reveal only if interested
4. Clearly disclose sponsorship when revealing
5. Never push if user shows disinterest

WHEN TO SHOW:
- User expresses a need or problem
- After successfully helping (not before)
- When commercial intent is detected
- During natural conversation breaks

HOW TO SHOW:
1. Complete their request
2. Brief pause/transition
3. "By the way, I found [teaser]"
4. If interested → full details + disclosure
5. If not → move on gracefully

EXAMPLE:
User: "I need to book a flight to Paris"
You: [Complete flight booking help first]
You: "By the way, I found a 15% discount code for Paris hotels. Interested?"
User: "Sure!"
You: "[Full details with sponsor disclosure]"
`;
```

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