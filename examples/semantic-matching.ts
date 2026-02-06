/**
 * Example: Semantic Intent Matching
 *
 * Shows two ways to get ads:
 * 1. EASY MODE: decideFromContext() - Just pass user message
 * 2. ADVANCED MODE: decide() - Full control over request
 */

import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY!,
  agentId: 'agt_your_agent_id',  // Optional: auto-fills agent_id in requests
  baseUrl: 'https://peruwnbrqkvmrldhpoom.supabase.co/functions',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcnV3bmJycWt2bXJsZGhwb29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NjcwMDYsImV4cCI6MjA4NTU0MzAwNn0.FMCjeunas8ICKm9W9bo2hZwyrBttzTcJbplbAyl4XhU'
});

// ============================================================================
// EASY MODE: Semantic matching from conversation context
// ============================================================================

async function easyModeExample() {
  console.log('🚀 EASY MODE: decideFromContext()');
  console.log('----------------------------------------\n');

  // Example 1: Estate planning query
  const ad1 = await client.decideFromContext({
    userMessage: "My father passed away and I need help organizing his estate",
    placement: 'sponsored_suggestion'
  });

  if (ad1 && ad1.unit_type === 'sponsored_suggestion') {
    console.log('✅ Got estate planning ad:');
    console.log(`   Title: ${ad1.title}`);
    console.log(`   Body: ${ad1.body}`);
    console.log(`   CTA: ${ad1.cta}`);
    console.log(`   URL: ${ad1.action_url}\n`);
  }

  // Example 2: With conversation history for better context
  const ad2 = await client.decideFromContext({
    userMessage: "What are my options?",
    conversationHistory: [
      "User: I'm turning 65 next month",
      "Agent: Congratulations! Are you thinking about retirement planning?",
      "User: Yes, especially healthcare"
    ],
    suggestedCategory: 'insurance',  // Optional hint
    placement: 'sponsored_suggestion'
  });

  if (ad2 && ad2.unit_type === 'sponsored_suggestion') {
    console.log('✅ Got insurance ad with context:');
    console.log(`   Title: ${ad2.title}`);
    console.log(`   Sponsor: ${ad2.disclosure.sponsor_name}\n`);
  }

  // Example 3: Travel query
  const ad3 = await client.decideFromContext({
    userMessage: "I want to book a trip to Japan for cherry blossom season",
    placement: 'sponsored_suggestion',
    country: 'US',
    language: 'en'
  });

  if (ad3 && ad3.unit_type === 'sponsored_suggestion') {
    console.log('✅ Got travel ad:');
    console.log(`   Title: ${ad3.title}\n`);
  }
}

// ============================================================================
// ADVANCED MODE: Full control with taxonomy + semantic context
// ============================================================================

async function advancedModeExample() {
  console.log('🎯 ADVANCED MODE: decide() with full control');
  console.log('----------------------------------------\n');

  const ad = await client.decide({
    request_id: `req_${Date.now()}`,
    agent_id: 'agt_your_agent_id',
    placement: {
      type: 'sponsored_suggestion',
      surface: 'chat'
    },
    opportunity: {
      intent: {
        taxonomy: 'legal.estate.planning.consultation',
        query: 'estate planning help'
      },
      context: {
        country: 'US',
        language: 'en',
        platform: 'web'
      },
      constraints: {
        max_units: 1,
        allowed_unit_types: ['sponsored_suggestion']
      },
      privacy: {
        data_policy: 'coarse_only'
      }
    },
    // NEW: Add semantic context for better matching
    context: "User's father recently passed away. They need help with estate organization, wills, and inheritance paperwork.",
    user_intent: "seeking legal guidance for estate planning"
  });

  if (ad && ad.unit_type === 'sponsored_suggestion') {
    console.log('✅ Got ad with taxonomy + semantic context:');
    console.log(`   Title: ${ad.title}`);
    console.log(`   Body: ${ad.body}`);
    console.log(`   Tracking token: ${ad.tracking.tracking_token}\n`);
  }
}

// ============================================================================
// Run examples
// ============================================================================

async function main() {
  console.log('📊 AttentionMarket Semantic Matching Examples\n');
  console.log('================================================\n');

  try {
    await easyModeExample();
    console.log('\n================================================\n');
    await advancedModeExample();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();
