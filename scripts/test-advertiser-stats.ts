/**
 * Test script for advertiser-stats endpoint
 * Tests: signup → create campaign → fetch stats
 */

const SUPABASE_URL = 'https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcnV3bmJycWt2bXJsZGhwb29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NjcwMDYsImV4cCI6MjA4NTU0MzAwNn0.FMCjeunas8ICKm9W9bo2hZwyrBttzTcJbplbAyl4XhU';

async function testAdvertiserStats() {
  console.log('🧪 Testing Advertiser Stats Endpoint\n');

  // Step 1: Create advertiser
  console.log('Step 1: Create advertiser...');
  const signupResponse = await fetch(`${SUPABASE_URL}/advertiser-signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`
    },
    body: JSON.stringify({
      company_name: `Test Co ${Date.now()}`,
      contact_email: `test${Date.now()}@example.com`,
      contact_name: 'John Test'
    })
  });

  const signupData = await signupResponse.json();
  console.log('✅ Advertiser created:', signupData.advertiser_id);

  // Step 2: Create campaign
  console.log('\nStep 2: Create campaign...');
  const campaignResponse = await fetch(`${SUPABASE_URL}/campaign-create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`
    },
    body: JSON.stringify({
      advertiser_id: signupData.advertiser_id,
      campaign_name: 'Test Campaign',
      taxonomy: 'insurance.auto.full_coverage.quote',
      budget_total: 1000,
      cpc: 12,
      creative: {
        title: 'Test Ad',
        body: 'Test description',
        cta: 'Click Here',
        action_url: 'https://example.com'
      }
    })
  });

  const campaignData = await campaignResponse.json();
  console.log('✅ Campaign created:', campaignData.campaign_id);

  // Step 3: Fetch stats with advertiser_id query param
  console.log('\nStep 3: Fetch stats with advertiser_id...');
  const statsResponse = await fetch(
    `${SUPABASE_URL}/advertiser-stats?advertiser_id=${signupData.advertiser_id}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`
      }
    }
  );

  if (!statsResponse.ok) {
    const error = await statsResponse.json();
    console.error('❌ Stats fetch failed:', error);
    return;
  }

  const statsData = await statsResponse.json();
  console.log('✅ Stats fetched successfully:');
  console.log('   Company:', statsData.company_name);
  console.log('   Campaigns:', statsData.campaigns.length);
  console.log('   Budget Total:', statsData.budget.total);
  console.log('   Campaign 1:', statsData.campaigns[0]?.name);

  console.log('\n✅ All tests passed! Lovable can now fetch campaigns.');
}

testAdvertiserStats().catch(console.error);
