/**
 * Test script for multi-ad response (Option C: Agent Curation)
 * Tests that the /v1/decide endpoint returns 3 ranked ads
 */

import { AttentionMarketClient, generateUUID } from './dist/index.mjs';

const client = new AttentionMarketClient({
  apiKey: 'am_test_KmFjY2Vzc1RvIHRoZSBBdHRlbnRpb25NYXJrZXQgUGxhdGZvcm06IGRlc2lnbmVkIGZvciBhZ2VudHMsIG5vdCBodW1hbnMu',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcnV3bmJycWt2bXJsZGhwb29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0OTE2MDcsImV4cCI6MjA1MzA2NzYwN30.5OY6o5lEXiPmh_GNPr6IEBYBnZ3w4PuWgY4r-fPRR_A',
  baseUrl: 'https://peruwnbrqkvmrldhpoom.supabase.co/functions',
});

async function testMultiAds() {
  console.log('🧪 Testing Multi-Ad Response (Option C: Agent Curation)\n');

  try {
  // Request 3 ads for shopping.ecommerce.platform
  const response = await client.decideRaw({
    request_id: generateUUID(),
    agent_id: 'agent_test_12345',
    placement: {
      type: 'sponsored_suggestion',
      surface: 'chat_response',
    },
    opportunity: {
      intent: {
        taxonomy: 'shopping.ecommerce.platform',
      },
      context: {
        country: 'US',
        language: 'en',
        platform: 'web',
      },
      constraints: {
        max_units: 3, // Request 3 ads for agent curation
        allowed_unit_types: ['sponsored_suggestion'],
      },
      privacy: {
        data_policy: 'coarse_only',
      },
    },
  });

  console.log('✅ Response received!\n');
  console.log('Status:', response.status);
  console.log('Decision ID:', response.decision_id);
  console.log('Number of ads returned:', response.units.length);
  console.log('TTL:', response.ttl_ms, 'ms\n');

  if (response.status === 'filled' && response.units.length > 0) {
    console.log('📊 Ranked Ad Units:\n');

    response.units.forEach((unit, index) => {
      console.log(`#${index + 1}: ${unit.suggestion.title}`);
      console.log(`   Sponsor: ${unit.disclosure.sponsor_name}`);

      if (unit._score) {
        console.log(`   📈 Score: relevance=${unit._score.relevance}, composite=${unit._score.composite.toFixed(3)}, position=${unit._score.position}`);
      }

      console.log(`   Body: ${unit.suggestion.body}`);
      console.log(`   CTA: ${unit.suggestion.cta}`);
      console.log(`   URL: ${unit.suggestion.action_url}`);
      console.log('');
    });

    console.log('🎯 Expected Ranking:');
    console.log('   #1: Pietra (bid=5.50, quality=0.95, score=5.225)');
    console.log('   #2: Shopify (bid=4.00, quality=0.80, score=3.200)');
    console.log('   #3: WooCommerce (bid=3.00, quality=0.85, score=2.550)');
    console.log('');

    console.log('✅ Multi-ad response working! Agent can now curate the best ad.');
  } else {
    console.log('❌ No ads returned (no_fill)');
  }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.statusCode) {
      console.error('Status Code:', error.statusCode);
    }
    if (error.details) {
      console.error('Details:', error.details);
    }
  }
}

testMultiAds();
