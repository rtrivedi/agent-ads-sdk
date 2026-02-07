/**
 * Test script to verify click_context is written to Supabase
 *
 * This script:
 * 1. Calls the /decide API to get an ad
 * 2. Tracks an impression
 * 3. Tracks a click WITH click_context
 * 4. Queries Supabase to verify click_context was stored
 *
 * Run: npx tsx test-click-context.ts
 */

import { AttentionMarketClient, generateUUID } from './src/index.js';

// Configuration
const API_KEY = process.env.AM_API_KEY || '';
const AGENT_ID = process.env.AM_AGENT_ID || '';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://peruwnbrqkvmrldhpoom.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!API_KEY || !AGENT_ID) {
  console.error('❌ Missing required environment variables:');
  console.error('   AM_API_KEY - Your AttentionMarket API key');
  console.error('   AM_AGENT_ID - Your agent ID');
  console.error('\nSet them in your shell:');
  console.error('   export AM_API_KEY="am_test_..."');
  console.error('   export AM_AGENT_ID="agt_..."');
  process.exit(1);
}

if (!SUPABASE_KEY) {
  console.error('⚠️  SUPABASE_SERVICE_ROLE_KEY not set - will skip database verification');
}

async function testClickContext() {
  console.log('🧪 Testing click_context feature\n');

  // Initialize SDK client
  const client = new AttentionMarketClient({
    apiKey: API_KEY,
    agentId: AGENT_ID,
  });

  // Step 1: Get an ad using decideFromContext
  console.log('1️⃣  Requesting ad from API...');
  const ad = await client.decideFromContext({
    userMessage: 'My father passed away and I need help with estate planning',
    country: 'US',
    language: 'en',
    platform: 'web',
    placement: 'sponsored_suggestion',
  });

  if (!ad || ad.unit_type !== 'sponsored_suggestion') {
    console.log('❌ No ad returned - cannot test click_context');
    console.log('   This might mean:');
    console.log('   - No campaigns match this intent');
    console.log('   - All campaigns are out of budget');
    console.log('   - Agent is not approved yet');
    return;
  }

  console.log('✅ Received ad:');
  console.log(`   Title: ${ad.suggestion.title}`);
  console.log(`   Body: ${ad.suggestion.body}`);
  console.log(`   CTA: ${ad.suggestion.cta}`);
  console.log(`   URL: ${ad.suggestion.action_url}`);

  // Step 2: Track impression
  console.log('\n2️⃣  Tracking impression...');
  const requestId = generateUUID();
  await client.trackImpression({
    agent_id: AGENT_ID,
    request_id: requestId,
    decision_id: ad.unit_id,
    unit_id: ad.unit_id,
    tracking_token: ad.tracking.token,
  });
  console.log('✅ Impression tracked');

  // Step 3: Track click WITH click_context
  console.log('\n3️⃣  Tracking click with click_context...');

  // Simulate how a developer would display the ad
  const displayedMessage = `💼 ${ad.suggestion.title}\n\n${ad.suggestion.body}\n\n👉 ${ad.suggestion.cta}`;
  console.log('   Displayed to user:');
  console.log('   ' + displayedMessage.replace(/\n/g, '\n   '));

  const eventId = generateUUID();
  await client.trackClick({
    agent_id: AGENT_ID,
    request_id: requestId,
    decision_id: ad.unit_id,
    unit_id: ad.unit_id,
    tracking_token: ad.tracking.token,
    href: ad.suggestion.action_url,
    click_context: displayedMessage,
  });
  console.log(`✅ Click tracked with event_id: ${eventId}`);

  // Step 4: Verify in Supabase (if service role key available)
  if (SUPABASE_KEY) {
    console.log('\n4️⃣  Verifying click_context in Supabase...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for async write

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/events?event_type=eq.click&order=occurred_at.desc&limit=1`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      });

      if (!response.ok) {
        console.log('❌ Failed to query Supabase:', response.statusText);
        return;
      }

      const events = await response.json();
      if (events.length === 0) {
        console.log('⚠️  No click events found in database yet (may still be processing)');
        return;
      }

      const latestEvent = events[0];
      console.log('✅ Found click event in database:');
      console.log(`   Event ID: ${latestEvent.event_id}`);
      console.log(`   Event Type: ${latestEvent.event_type}`);
      console.log(`   Occurred At: ${latestEvent.occurred_at}`);
      console.log(`   Click Context (column): ${latestEvent.click_context ? '✅ PRESENT' : '❌ MISSING'}`);

      if (latestEvent.click_context) {
        console.log('\n   📝 Click Context Content:');
        console.log('   ' + latestEvent.click_context.replace(/\n/g, '\n   '));
        console.log('\n🎉 SUCCESS! click_context is being stored correctly!');
      } else {
        console.log('\n❌ FAIL: click_context column is NULL');
        console.log('   Metadata:', JSON.stringify(latestEvent.metadata, null, 2));
      }

    } catch (error) {
      console.error('❌ Error querying Supabase:', error);
    }
  } else {
    console.log('\n4️⃣  Skipping database verification (no SUPABASE_SERVICE_ROLE_KEY)');
    console.log('   To verify, check Supabase dashboard:');
    console.log(`   ${SUPABASE_URL}/project/peruwnbrqkvmrldhpoom/editor`);
    console.log('   Query: SELECT * FROM events WHERE event_type = \'click\' ORDER BY occurred_at DESC LIMIT 1;');
  }
}

// Run the test
testClickContext().catch(console.error);
