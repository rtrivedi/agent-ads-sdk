/**
 * Testing with MockAttentionMarketClient
 *
 * This example shows how to test your agent integration using mock ad data
 * without needing real advertiser campaigns.
 *
 * Run with: npx tsx examples/test-with-mocks.ts
 */

import {
  MockAttentionMarketClient,
  createOpportunity,
  generateUUID,
} from '../src/index.js';

console.log('🧪 Testing SDK Integration with Mock Client\n');
console.log('=' .repeat(70));

// Initialize mock client
const mockClient = new MockAttentionMarketClient({
  latencyMs: 150, // Simulate 150ms API latency
  fillRate: 1.0, // 100% fill rate for testing
  verbose: true, // Log mock activity
});

console.log('\n📋 Available Mock Taxonomies:');
mockClient.getAvailableTaxonomies().forEach((taxonomy) => {
  console.log(`  - ${taxonomy}`);
});

console.log('\n' + '='.repeat(70));

/**
 * Test Case 1: Movers Query
 */
async function testMoversQuery() {
  console.log('\n🔍 TEST CASE 1: Local Services - Movers');
  console.log('-'.repeat(70));

  const userQuery = 'Find movers in Brooklyn for this Saturday';
  console.log(`\nUser Query: "${userQuery}"\n`);

  const opportunity = createOpportunity({
    taxonomy: 'local_services.movers.quote',
    country: 'US',
    language: 'en',
    platform: 'web',
    query: userQuery,
    region: 'NY',
    city: 'New York',
  });

  const requestId = generateUUID();
  const unit = await mockClient.decide({
    request_id: requestId,
    agent_id: 'agt_test_mock',
    placement: {
      type: 'sponsored_suggestion',
      surface: 'chat_response',
    },
    opportunity,
  });

  if (unit && unit.unit_type === 'sponsored_suggestion') {
    console.log('✅ Received sponsored unit:\n');
    console.log(`[${unit.disclosure.label}] ${unit.disclosure.sponsor_name}`);
    console.log(`\n${unit.suggestion.title}`);
    console.log(unit.suggestion.body);
    console.log(`\n→ ${unit.suggestion.cta}`);
    console.log(`   ${unit.suggestion.action_url}\n`);

    // Track impression
    await mockClient.trackImpression({
      agent_id: 'agt_test_mock',
      request_id: requestId,
      decision_id: 'dec_test',
      unit_id: unit.unit_id,
      tracking_token: unit.tracking.token,
    });

    // Simulate click
    await mockClient.trackClick({
      agent_id: 'agt_test_mock',
      request_id: requestId,
      decision_id: 'dec_test',
      unit_id: unit.unit_id,
      tracking_token: unit.tracking.token,
      href: unit.suggestion.action_url,
    });
  } else {
    console.log('❌ No sponsored unit received');
  }
}

/**
 * Test Case 2: Restaurant Query
 */
async function testRestaurantQuery() {
  console.log('\n🔍 TEST CASE 2: Local Services - Restaurants');
  console.log('-'.repeat(70));

  const userQuery = 'Best Italian restaurants in Manhattan';
  console.log(`\nUser Query: "${userQuery}"\n`);

  const opportunity = createOpportunity({
    taxonomy: 'local_services.restaurants.search',
    country: 'US',
    language: 'en',
    platform: 'web',
    query: userQuery,
    region: 'NY',
    city: 'New York',
  });

  const unit = await mockClient.decide({
    request_id: generateUUID(),
    agent_id: 'agt_test_mock',
    placement: {
      type: 'sponsored_suggestion',
      surface: 'chat_response',
    },
    opportunity,
  });

  if (unit && unit.unit_type === 'sponsored_suggestion') {
    console.log('✅ Received sponsored unit:\n');
    console.log(`[${unit.disclosure.label}] ${unit.disclosure.sponsor_name}`);
    console.log(`\n${unit.suggestion.title}`);
    console.log(unit.suggestion.body);
    console.log(`\n→ ${unit.suggestion.cta}\n`);
  }
}

/**
 * Test Case 3: No Fill Scenario
 */
async function testNoFillScenario() {
  console.log('\n🔍 TEST CASE 3: Unsupported Taxonomy (No Fill)');
  console.log('-'.repeat(70));

  const userQuery = 'Find a dog walker';
  console.log(`\nUser Query: "${userQuery}"\n`);

  const opportunity = createOpportunity({
    taxonomy: 'local_services.pet_care.dog_walking', // Not in mock data
    country: 'US',
    language: 'en',
    platform: 'web',
    query: userQuery,
  });

  const unit = await mockClient.decide({
    request_id: generateUUID(),
    agent_id: 'agt_test_mock',
    placement: {
      type: 'sponsored_suggestion',
      surface: 'chat_response',
    },
    opportunity,
  });

  if (unit) {
    console.log('✅ Received sponsored unit');
  } else {
    console.log('✅ No sponsored unit (expected - taxonomy not in mock data)');
    console.log('   Your app should handle this gracefully.\n');
  }
}

/**
 * Test Case 4: Using decideRaw for Full Response
 */
async function testDecideRaw() {
  console.log('\n🔍 TEST CASE 4: Full Response with decideRaw()');
  console.log('-'.repeat(70));

  const opportunity = createOpportunity({
    taxonomy: 'local_services.plumbers.quote',
    country: 'US',
    language: 'en',
    platform: 'web',
    query: 'Emergency plumber needed',
  });

  const response = await mockClient.decideRaw({
    request_id: generateUUID(),
    agent_id: 'agt_test_mock',
    placement: {
      type: 'sponsored_suggestion',
      surface: 'chat_response',
    },
    opportunity,
  });

  console.log('\nFull Response:');
  console.log(`  Status: ${response.status}`);
  console.log(`  Decision ID: ${response.decision_id}`);
  console.log(`  TTL: ${response.ttl_ms}ms`);
  console.log(`  Units: ${response.units.length}`);

  if (response.units.length > 0) {
    console.log(`  First Unit: ${response.units[0].suggestion.title}\n`);
  }
}

/**
 * Test Case 5: Custom Mock Ad
 */
async function testCustomMock() {
  console.log('\n🔍 TEST CASE 5: Adding Custom Mock Ad');
  console.log('-'.repeat(70));

  // Add a custom mock unit
  mockClient.addMockUnit('local_services.lawyers.consultation', {
    unit_id: 'unit_custom_lawyer_001',
    unit_type: 'sponsored_suggestion',
    disclosure: {
      label: 'Sponsored',
      sponsor_name: 'Smith & Associates Law',
    },
    tracking: {
      token: 'trk_custom_lawyer',
      impression_url: 'https://mock.example.com/imp',
      click_url: 'https://mock.example.com/click',
    },
    suggestion: {
      title: 'Free Legal Consultation - Personal Injury Lawyers',
      body: 'Experienced attorneys. No fees unless we win. Call 24/7 for free case review.',
      cta: 'Call Now →',
      action_url: 'tel:+1-555-LAWYER',
    },
  });

  const opportunity = createOpportunity({
    taxonomy: 'local_services.lawyers.consultation',
    country: 'US',
    language: 'en',
    platform: 'web',
    query: 'Need a personal injury lawyer',
  });

  const unit = await mockClient.decide({
    request_id: generateUUID(),
    agent_id: 'agt_test_mock',
    placement: {
      type: 'sponsored_suggestion',
      surface: 'chat_response',
    },
    opportunity,
  });

  if (unit && unit.unit_type === 'sponsored_suggestion') {
    console.log('✅ Received custom mock unit:\n');
    console.log(`[${unit.disclosure.label}] ${unit.disclosure.sponsor_name}`);
    console.log(`\n${unit.suggestion.title}\n`);
  }
}

/**
 * Test Case 6: Simulating Low Fill Rate
 */
async function testLowFillRate() {
  console.log('\n🔍 TEST CASE 6: Simulating Low Fill Rate (50%)');
  console.log('-'.repeat(70));

  const lowFillClient = new MockAttentionMarketClient({
    fillRate: 0.5, // 50% fill rate
    verbose: false, // Less noisy
  });

  console.log('\nMaking 10 requests...\n');

  let fillCount = 0;
  for (let i = 0; i < 10; i++) {
    const unit = await lowFillClient.decide({
      request_id: generateUUID(),
      agent_id: 'agt_test_mock',
      placement: {
        type: 'sponsored_suggestion',
        surface: 'chat_response',
      },
      opportunity: createOpportunity({
        taxonomy: 'local_services.movers.quote',
        country: 'US',
        language: 'en',
        platform: 'web',
        query: 'Find movers',
      }),
    });

    if (unit) {
      fillCount++;
      process.stdout.write('✓');
    } else {
      process.stdout.write('○');
    }
  }

  console.log(`\n\nFill Rate: ${fillCount}/10 (${fillCount * 10}%)`);
  console.log('Your app should handle no-fill scenarios gracefully.\n');
}

/**
 * Run all tests
 */
async function runAllTests() {
  await testMoversQuery();
  await testRestaurantQuery();
  await testNoFillScenario();
  await testDecideRaw();
  await testCustomMock();
  await testLowFillRate();

  console.log('\n' + '='.repeat(70));
  console.log('\n✅ All tests completed!');
  console.log('\n💡 Next Steps:');
  console.log('   1. Use MockAttentionMarketClient during development');
  console.log('   2. Switch to AttentionMarketClient for production');
  console.log('   3. Test your app handles both filled and no-fill responses\n');
}

runAllTests().catch(console.error);
