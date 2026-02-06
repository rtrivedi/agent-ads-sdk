/**
 * Test script for password-based authentication
 * Tests: signup with password → login with password
 */

const SUPABASE_URL = 'https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcnV3bmJycWt2bXJsZGhwb29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NjcwMDYsImV4cCI6MjA4NTU0MzAwNn0.FMCjeunas8ICKm9W9bo2hZwyrBttzTcJbplbAyl4XhU';

async function testPasswordAuth() {
  console.log('🧪 Testing Password-Based Authentication\n');

  const email = `test${Date.now()}@example.com`;
  const password = 'TestPassword123';

  // Step 1: Signup with password
  console.log('Step 1: Signup with password...');
  const signupResponse = await fetch(`${SUPABASE_URL}/advertiser-signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`
    },
    body: JSON.stringify({
      company_name: `Test Co ${Date.now()}`,
      contact_email: email,
      contact_name: 'John Test',
      password: password
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
  console.log('   Advertiser ID:', signupData.advertiser_id);

  // Step 2: Login with correct password
  console.log('\nStep 2: Login with correct password...');
  const loginResponse = await fetch(`${SUPABASE_URL}/advertiser-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`
    },
    body: JSON.stringify({
      contact_email: email,
      password: password
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

  // Step 3: Try login with wrong password
  console.log('\nStep 3: Try login with wrong password (should fail)...');
  const badLoginResponse = await fetch(`${SUPABASE_URL}/advertiser-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`
    },
    body: JSON.stringify({
      contact_email: email,
      password: 'WrongPassword123'
    })
  });

  if (badLoginResponse.status === 401) {
    const error = await badLoginResponse.json();
    console.log('✅ Invalid password rejected correctly:', error.message);
  } else {
    console.error('❌ Should have rejected invalid password');
    return;
  }

  // Step 4: Test weak password validation
  console.log('\nStep 4: Test weak password validation...');
  const weakPwResponse = await fetch(`${SUPABASE_URL}/advertiser-signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`
    },
    body: JSON.stringify({
      company_name: 'Test Co',
      contact_email: `test2${Date.now()}@example.com`,
      contact_name: 'Jane Test',
      password: '123' // Too short
    })
  });

  if (weakPwResponse.status === 400) {
    const error = await weakPwResponse.json();
    console.log('✅ Weak password rejected:', error.message);
  } else {
    console.error('❌ Should have rejected weak password');
    return;
  }

  console.log('\n✅ All tests passed! Password authentication working correctly.');
  console.log('\n📝 Tell Lovable:');
  console.log('   Answer: A - Email + Password');
  console.log('   Signup: POST /advertiser-signup with { contact_email, company_name, contact_name, password }');
  console.log('   Login: POST /advertiser-login with { contact_email, password }');
}

testPasswordAuth().catch(console.error);
