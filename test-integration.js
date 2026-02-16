#!/usr/bin/env node
/**
 * Test Integration Script for AI Agents
 *
 * This script validates that the AttentionMarket SDK is properly installed
 * and configured for test mode.
 *
 * Usage: node test-integration.js
 *
 * Success: Exit code 0, prints "✅ Integration successful!"
 * Failure: Exit code 1, prints error details
 */

require('dotenv').config();
const { AttentionMarketClient } = require('@the_ro_show/agent-ads-sdk');

async function testIntegration() {
  console.log('🧪 Testing AttentionMarket SDK integration...\n');

  // Step 1: Check environment variables
  console.log('📋 Checking environment variables...');

  const agentId = process.env.ATTENTIONMARKET_AGENT_ID;
  const testKey = process.env.ATTENTIONMARKET_TEST_KEY;

  if (!agentId) {
    console.error('❌ Missing ATTENTIONMARKET_AGENT_ID in .env file');
    console.error('   Add: ATTENTIONMARKET_AGENT_ID=agt_...');
    process.exit(1);
  }

  if (!testKey) {
    console.error('❌ Missing ATTENTIONMARKET_TEST_KEY in .env file');
    console.error('   Add: ATTENTIONMARKET_TEST_KEY=am_test_...');
    process.exit(1);
  }

  // Validate format
  if (!agentId.startsWith('agt_')) {
    console.error('❌ Invalid ATTENTIONMARKET_AGENT_ID format');
    console.error(`   Expected: agt_... (got: ${agentId.substring(0, 10)}...)`);
    process.exit(1);
  }

  if (!testKey.startsWith('am_test_')) {
    console.error('❌ Invalid ATTENTIONMARKET_TEST_KEY format');
    console.error(`   Expected: am_test_... (got: ${testKey.substring(0, 10)}...)`);
    process.exit(1);
  }

  console.log(`✅ Agent ID found: ${agentId}`);
  console.log(`✅ Test key found: ${testKey.substring(0, 15)}...`);
  console.log('');

  // Step 2: Initialize client
  console.log('🔧 Initializing SDK client...');

  let client;
  try {
    client = new AttentionMarketClient({
      apiKey: testKey,
      agentId: agentId,
      testMode: true
    });
    console.log('✅ SDK client initialized');
    console.log('');
  } catch (error) {
    console.error('❌ Failed to initialize SDK client');
    console.error(`   Error: ${error.message}`);
    process.exit(1);
  }

  // Step 3: Make test API call
  console.log('📡 Making test API call...');

  try {
    const ad = await client.decideFromContext({
      userMessage: "I need car insurance"
    });

    if (!ad) {
      console.log('⚠️  No ad returned (this is OK - no matching campaigns)');
      console.log('   Integration is working, but test with different queries');
      console.log('');
      console.log('✅ Integration successful! (API call worked)');
      process.exit(0);
    }

    // Validate ad structure
    if (!ad.creative || !ad.creative.title) {
      console.error('❌ Invalid ad structure returned');
      console.error('   Expected ad.creative.title, got:', JSON.stringify(ad, null, 2));
      process.exit(1);
    }

    if (!ad.click_url) {
      console.error('❌ Missing click_url in ad response');
      console.error('   Ad:', JSON.stringify(ad, null, 2));
      process.exit(1);
    }

    console.log('✅ Integration successful!');
    console.log('');
    console.log('📄 Test ad received:');
    console.log(`   Title: ${ad.creative.title}`);
    console.log(`   Body: ${ad.creative.body}`);
    console.log(`   CTA: ${ad.creative.cta}`);
    console.log(`   Click URL: ${ad.click_url.substring(0, 60)}...`);
    console.log('');
    console.log('🎉 You\'re ready to integrate into your application!');
    console.log('   Next step: Run validate-production.js');

    process.exit(0);

  } catch (error) {
    console.error('❌ API call failed');
    console.error(`   Error: ${error.message}`);

    // Provide helpful hints based on error
    if (error.message.includes('Invalid API key') || error.message.includes('authentication')) {
      console.error('');
      console.error('   💡 Hint: Check that your test key is correct in .env');
      console.error('      Format should be: am_test_... (48 characters)');
    } else if (error.message.includes('Agent not found')) {
      console.error('');
      console.error('   💡 Hint: Check that your agent_id is correct in .env');
      console.error('      Format should be: agt_... (20 characters)');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
      console.error('');
      console.error('   💡 Hint: Check your internet connection');
    }

    console.error('');
    console.error('   Full error details:');
    console.error('   ', error);

    process.exit(1);
  }
}

// Run test
testIntegration().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
