/**
 * Minimal Example: Claude Tool Use
 * Run with: npx tsx examples/claude-tool-use-minimal.ts
 */

import {
  AttentionMarketClient,
  createOpportunity,
  generateUUID,
} from '../src/index.js';

const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY || 'am_test_...',
});

const AGENT_ID = process.env.ATTENTIONMARKET_AGENT_ID || 'agt_01HV...';

async function main() {
  // User asks: "Find movers in Brooklyn"
  console.log('🤖 Claude Tool Use - Minimal Example\n');

  // 1. Build opportunity from user query
  const opportunity = createOpportunity({
    taxonomy: 'local_services.movers.quote',
    query: 'Find movers in Brooklyn',
    country: 'US',
    language: 'en',
    platform: 'web',
    region: 'NY',
    city: 'New York',
  });

  // 2. Request a sponsored unit
  const requestId = generateUUID();
  const unit = await client.decide({
    request_id: requestId,
    agent_id: AGENT_ID,
    placement: {
      type: 'sponsored_suggestion',
      surface: 'chat_response',
    },
    opportunity,
  });

  // 3. Handle no-fill
  if (!unit) {
    console.log('No sponsored unit available');
    return;
  }

  // 4. Render the sponsored suggestion
  console.log('Claude response:');
  console.log(`[${unit.disclosure.label}] ${unit.disclosure.sponsor_name}`);

  if (unit.unit_type === 'sponsored_suggestion') {
    console.log(unit.suggestion.title);
    console.log(unit.suggestion.body);
    console.log(`→ ${unit.suggestion.cta}\n`);
  }

  // 5. Track impression (after rendering)
  await client.trackImpression({
    agent_id: AGENT_ID,
    request_id: requestId,
    decision_id: 'decision_id', // Get from decideRaw() for full response
    unit_id: unit.unit_id,
    tracking_token: unit.tracking.token,
  });
  console.log('✓ Impression tracked');

  // 6. Track click (when user clicks)
  if (unit.unit_type === 'sponsored_suggestion') {
    await client.trackClick({
      agent_id: AGENT_ID,
      request_id: requestId,
      decision_id: 'decision_id',
      unit_id: unit.unit_id,
      tracking_token: unit.tracking.token,
      href: unit.suggestion.action_url,
    });
    console.log('✓ Click tracked');
  }
}

main().catch(console.error);
