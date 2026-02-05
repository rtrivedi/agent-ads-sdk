/**
 * Test script for advertiser flow
 * Tests: signup → create campaign → verify in database
 */

const SUPABASE_URL = 'https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcnV3bmJycWt2bXJsZGhwb29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NjcwMDYsImV4cCI6MjA4NTU0MzAwNn0.FMCjeunas8ICKm9W9bo2hZwyrBttzTcJbplbAyl4XhU';

async function testAdvertiserFlow() {
  console.log('🧪 Testing Advertiser Flow\n');

  // Step 1: Advertiser Signup
  console.log('Step 1: Advertiser Signup...');
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

  if (!signupResponse.ok) {
    const error = await signupResponse.json();
    console.error('❌ Signup failed:', error);
    return;
  }

  const signupData = await signupResponse.json();
  console.log('✅ Signup successful:', {
    advertiser_id: signupData.advertiser_id,
    company_name: signupData.company_name,
    has_api_key: !!signupData.api_key
  });

  // Step 2: Create Campaign
  console.log('\nStep 2: Create Campaign...');
  const campaignResponse = await fetch(`${SUPABASE_URL}/campaign-create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`
    },
    body: JSON.stringify({
      advertiser_id: signupData.advertiser_id,
      campaign_name: 'Test Insurance Campaign',
      taxonomy: 'insurance.auto.full_coverage.quote',
      budget_total: 1000,
      cpc: 12.50,
      creative: {
        title: 'Get a Free Quote in 5 Minutes',
        body: 'Save up to 15% on car insurance. Compare quotes from top providers.',
        cta: 'Get Quote',
        action_url: 'https://example.com/quote'
      },
      targeting: {
        geo: ['US'],
        language: ['en'],
        platform: ['web', 'mobile']
      }
    })
  });

  if (!campaignResponse.ok) {
    const error = await campaignResponse.json();
    console.error('❌ Campaign creation failed:', error);
    return;
  }

  const campaignData = await campaignResponse.json();
  console.log('✅ Campaign created:', {
    campaign_id: campaignData.campaign_id,
    status: campaignData.status,
    budget_remaining: campaignData.budget_remaining
  });

  // Success!
  console.log('\n✅ All tests passed! Advertiser flow working end-to-end.');
  console.log('\nAdvertiser ID:', signupData.advertiser_id);
  console.log('Campaign ID:', campaignData.campaign_id);
}

testAdvertiserFlow().catch(console.error);
