# Advertiser Authentication - Lovable Integration

**Date:** 2026-02-14
**Change:** Added advertiser-login endpoint to simplify Lovable integration

---

## What Changed

Created new endpoint: `POST /functions/v1/advertiser-login`

**Purpose:** Returns Supabase Auth JWT for campaign creation without requiring Lovable to integrate Supabase Auth SDK directly.

---

## For Lovable - Integration Steps

### Step 1: Login (get JWT)

```javascript
const response = await fetch('https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/advertiser-login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'advertiser@company.com',
    password: 'password123'
  })
})

const data = await response.json()
// Returns: { access_token, advertiser_id, company_name, expires_in }

// Store access_token for future requests
localStorage.setItem('am_token', data.access_token)
localStorage.setItem('advertiser_id', data.advertiser_id)
```

### Step 2: Create Campaign (use JWT)

```javascript
const accessToken = localStorage.getItem('am_token')
const advertiserId = localStorage.getItem('advertiser_id')

const response = await fetch('https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/campaign-create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`  // ← JWT from login
  },
  body: JSON.stringify({
    advertiser_id: advertiserId,
    name: "My Campaign",
    budget: 1000,
    bid_cpc: 0.5,
    ad_type: "link",
    intent_description: "People looking to start a business",
    ideal_customer: "Entrepreneurs",
    problem_solved: "Need business formation services",
    value_proposition: "Easy LLC formation",
    title: "Start Your LLC Today",
    body: "Professional business formation in minutes",
    cta: "Get Started",
    landing_url: "https://example.com"
  })
})
```

### Step 3: Handle Token Expiration

JWT expires after 1 hour. Either:

**Option A:** Re-login when expired
```javascript
if (response.status === 401) {
  // Token expired, login again
  await loginAgain()
}
```

**Option B:** Use refresh_token (advanced)
```javascript
// Use refresh_token from login response to get new access_token
```

---

## How It Works

1. **advertiser-login** calls Supabase Auth server-side with email/password
2. Supabase Auth returns JWT (valid for 1 hour)
3. Lovable stores JWT and uses it for campaign-create
4. **campaign-create** verifies JWT and checks `user.email === advertiser.contact_email`

---

## Security Features

✅ JWT-based authentication (industry standard)
✅ Ownership verification (user must own advertiser account)
✅ Tokens expire after 1 hour
✅ Rate limited (10 login attempts per minute)
✅ Production-safe error messages

---

## REVERT Instructions (if needed)

If this causes issues, revert in 2 steps:

### 1. Remove advertiser-login function
```bash
supabase functions delete advertiser-login
rm supabase/functions/advertiser-login/index.ts
```

### 2. Disable JWT verification on campaign-create

Edit `supabase/config.toml`:
```toml
[functions.campaign-create]
verify_jwt = false  # Disable auth temporarily
```

Then redeploy:
```bash
supabase functions deploy campaign-create
```

### 3. Update campaign-create code

Edit `supabase/functions/campaign-create/index.ts`:

Comment out lines 31-58 (JWT verification)
Comment out lines 131-137 (ownership verification)

---

## Testing

### Test 1: Login works
```bash
curl -X POST https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/advertiser-login \
  -H "Content-Type: application/json" \
  -d '{"email":"ronak+pietra@pietrastudio.com","password":"YOUR_PASSWORD"}'

# Should return: { access_token, advertiser_id, ... }
```

### Test 2: Campaign creation with JWT
```bash
# Get token from test 1
TOKEN="eyJhbGciOi..."

curl -X POST https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/campaign-create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"advertiser_id":"...","name":"Test",...}'

# Should succeed
```

### Test 3: Invalid credentials rejected
```bash
curl -X POST https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/advertiser-login \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@email.com","password":"wrong"}'

# Should return 401: Invalid credentials
```

---

## Files Modified

**New files:**
- `supabase/functions/advertiser-login/index.ts`

**Existing files (no changes needed):**
- `supabase/functions/campaign-create/index.ts` (already has JWT verification)
- `supabase/config.toml` (already configured)

---

## Next Steps for Lovable

1. Update advertiser portal to call `/v1/advertiser-login` on login
2. Store `access_token` in localStorage or session
3. Pass `Authorization: Bearer {token}` header to `/v1/campaign-create`
4. Handle 401 errors (token expired, re-login)

**Estimate:** 30 minutes of Lovable development work
