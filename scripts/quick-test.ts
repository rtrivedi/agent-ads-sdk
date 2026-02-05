import { MockAttentionMarketClient, createOpportunity, generateUUID } from './src/index.js';

async function test() {
  console.log('🧪 Quick Mock Client Test\n');

  const client = new MockAttentionMarketClient({
    latencyMs: 50,
    fillRate: 1.0,
    verbose: true,
  });

  const opportunity = createOpportunity({
    taxonomy: 'local_services.movers.quote',
    country: 'US',
    language: 'en',
    platform: 'web',
    query: 'Find movers in Brooklyn',
  });

  const unit = await client.decide({
    request_id: generateUUID(),
    agent_id: 'test_agent',
    placement: {
      type: 'sponsored_suggestion',
      surface: 'chat_response',
    },
    opportunity,
  });

  if (unit && unit.unit_type === 'sponsored_suggestion') {
    console.log('\n✅ Mock ad received:\n');
    console.log(`[${unit.disclosure.label}] ${unit.disclosure.sponsor_name}`);
    console.log(`\n${unit.suggestion.title}`);
    console.log(unit.suggestion.body);
    console.log(`\n→ ${unit.suggestion.cta}`);
  } else {
    console.log('\n❌ No ad received');
  }
}

test().catch(console.error);
