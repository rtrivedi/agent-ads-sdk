/**
 * Test script for advertiser login
 * Tests: signup → login with credentials
 */

const SUPABASE_URL = 'https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcnV3bmJycWt2bXJsZGhwb29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NjcwMDYsImV4cCI6MjA4NTU0MzAwNn0.FMCjeunas8ICKm9W9bo2hZwyrBttzTcJbplbAyl4XhU';

async function testAdvertiserLogin() {
  console.log('🧪 Testing Advertiser Login\n');

  // Step 1: Create new advertiser
  console.log('Step 1: Create test advertiser...');
  const email = `test${Date.now()}@example.com`;
  const signupResponse = await fetch(`${SUPABASE_URL}/advertiser-signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`
    },
    body: JSON.stringify({
      company_name: `Test Co ${Date.now()}`,
      contact_email: email,
      contact_name: 'John Test'
    })
  });

  if (!signupResponse.ok) {
    const error = await signupResponse.json();
    console.error('❌ Signup failed:', error);
    return;
  }

  const signupData = await signupResponse.json();
  console.log('✅ Signup successful');
  console.log('   Email:', email);
  console.log('   API Key:', signupData.api_key.substring(0, 20) + '...');

  // Step 2: Login with credentials
  console.log('\nStep 2: Login with credentials...');
  const loginResponse = await fetch(`${SUPABASE_URL}/advertiser-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`
    },
    body: JSON.stringify({
      contact_email: email,
      api_key: signupData.api_key
    })
  });

  if (!loginResponse.ok) {
    const error = await loginResponse.json();
    console.error('❌ Login failed:', error);
    return;
  }

  const loginData = await loginResponse.json();
  console.log('✅ Login successful:', {
    advertiser_id: loginData.advertiser_id,
    company_name: loginData.company_name,
    status: loginData.status
  });

  // Step 3: Test with wrong credentials
  console.log('\nStep 3: Test with wrong API key (should fail)...');
  const badLoginResponse = await fetch(`${SUPABASE_URL}/advertiser-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`
    },
    body: JSON.stringify({
      contact_email: email,
      api_key: 'wrong_key_123'
    })
  });

  if (badLoginResponse.status === 401) {
    const error = await badLoginResponse.json();
    console.log('✅ Invalid credentials rejected correctly:', error.message);
  } else {
    console.error('❌ Should have rejected invalid credentials');
    return;
  }

  // Success!
  console.log('\n✅ All tests passed! Login endpoint working correctly.');
}

testAdvertiserLogin().catch(console.error);
