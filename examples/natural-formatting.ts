/**
 * Example: Natural Ad Formatting
 *
 * Shows how to make ads feel conversational while preserving tracking.
 */

import { AttentionMarketClient, formatNatural, formatInlineMention, validateAdFits } from '@the_ro_show/agent-ads-sdk';

const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY!,
  agentId: 'agt_your_agent_id',
  baseUrl: 'https://peruwnbrqkvmrldhpoom.supabase.co/functions',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcnV3bmJycWt2bXJsZGhwb29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NjcwMDYsImV4cCI6MjA4NTU0MzAwNn0.FMCjeunas8ICKm9W9bo2hZwyrBttzTcJbplbAyl4XhU'
});

async function main() {
  console.log('📝 Natural Ad Formatting Examples\n');

  // Get an ad
  const ad = await client.decideFromContext({
    userMessage: "My father passed away and I need help organizing his estate"
  });

  if (!ad) {
    console.log('No ad available');
    return;
  }

  console.log('Raw ad data:');
  console.log(`  Title: ${ad.suggestion.title}`);
  console.log(`  Body: ${ad.suggestion.body}`);
  console.log(`  CTA: ${ad.suggestion.cta}\n`);

  // ============================================================================
  // Example 1: Conversational formatting
  // ============================================================================
  console.log('1️⃣  Conversational Style');
  console.log('----------------------------------------');

  const conversational = formatNatural(ad, {
    style: 'conversational',
    userContext: "User's father recently passed away"
  });

  console.log(conversational.text);
  console.log(`\n[${conversational.cta}] → ${conversational.actionUrl}\n`);

  // Tracking still works!
  await client.track({
    event_id: conversational.tracking.eventId,
    event_type: 'impression',
    request_id: 'req_123',
    agent_id: client['agentId']!,
    tracking_token: conversational.tracking.trackingToken,
    occurred_at: new Date().toISOString()
  });
  console.log('✅ Impression tracked\n');

  // ============================================================================
  // Example 2: Helpful assistant style
  // ============================================================================
  console.log('2️⃣  Helpful Style');
  console.log('----------------------------------------');

  const helpful = formatNatural(ad, {
    style: 'helpful'
  });

  console.log(helpful.text);
  console.log('\n');

  // ============================================================================
  // Example 3: Direct and concise
  // ============================================================================
  console.log('3️⃣  Direct Style');
  console.log('----------------------------------------');

  const direct = formatNatural(ad, {
    style: 'direct',
    includeDisclosure: false  // Disclosure shown separately
  });

  console.log(direct.text);
  console.log(`\n_${direct.disclosure.label} by ${direct.disclosure.sponsorName}_\n`);

  // ============================================================================
  // Example 4: Length-constrained formatting
  // ============================================================================
  console.log('4️⃣  Mobile-optimized (max 100 chars)');
  console.log('----------------------------------------');

  const mobile = formatNatural(ad, {
    style: 'conversational',
    maxLength: 100
  });

  console.log(mobile.text);
  console.log(`Length: ${mobile.text.length} chars\n`);

  // ============================================================================
  // Example 5: Inline mention
  // ============================================================================
  console.log('5️⃣  Inline Mention');
  console.log('----------------------------------------');

  const mention = formatInlineMention(ad);

  console.log(`You might want to check out ${mention.text}`);
  console.log('Compact format for inline references\n');

  // ============================================================================
  // Example 6: Validate ad fits UI constraints
  // ============================================================================
  console.log('6️⃣  UI Constraint Validation');
  console.log('----------------------------------------');

  const validation = validateAdFits(ad, {
    maxTitleChars: 50,
    maxBodyChars: 150,
    maxCtaChars: 15
  });

  if (validation.fits) {
    console.log('✅ Ad fits within UI constraints');
  } else {
    console.log('❌ Ad too long:');
    validation.violations.forEach(v => console.log(`   - ${v}`));
  }

  // ============================================================================
  // Example 7: User clicks formatted ad
  // ============================================================================
  console.log('\n7️⃣  Tracking Click Event');
  console.log('----------------------------------------');

  // When user clicks the formatted ad, tracking data is preserved
  await client.track({
    event_id: conversational.tracking.eventId,
    event_type: 'click',
    request_id: 'req_123',
    agent_id: client['agentId']!,
    tracking_token: conversational.tracking.trackingToken,
    occurred_at: new Date().toISOString()
  });

  console.log('✅ Click tracked successfully');
  console.log(`   Event ID: ${conversational.tracking.eventId}`);
  console.log(`   Tracking Token: ${conversational.tracking.trackingToken.substring(0, 20)}...`);
  console.log(`   Action URL: ${conversational.actionUrl}\n`);

  console.log('✨ All formatting preserves tracking data!');
}

main().catch(console.error);
