# Setting Up TRACKING_HMAC_SECRET in Supabase

## Why This Is Required
The HMAC secret is used to cryptographically sign click tracking tokens to prevent fraud. Without it, anyone could forge click events and steal revenue.

## Steps to Configure

### 1. Generate a Secure Secret
Use the following command to generate a cryptographically secure secret:
```bash
head -c 32 /dev/urandom | base64
```

Example output (DO NOT USE THIS - generate your own):
```
/HFEVcfPv/tSE44jV8Q6/6qwSTW+1HlhNRYwRlnh6Ak=
```

### 2. Add to Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/peruwnbrqkvmrldhpoom/settings/vault
2. Click "Edge Functions" in the left sidebar
3. Click "Secrets" tab
4. Click "New Secret"
5. Add the following:
   - **Name**: `TRACKING_HMAC_SECRET`
   - **Value**: Your generated secret from step 1
   - **Description**: HMAC key for signing click tracking tokens
6. Click "Save"

### 3. Verify Setup
After setting the secret, test that clicks are being tracked:

```bash
# Get an ad
curl -X POST "https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/decide" \
  -H "X-AM-API-Key: your_api_key" \
  -H "X-AM-Agent-ID: your_agent_id" \
  -d '{"context":"test query"}'

# Click the returned click_url
curl -I [click_url_from_response]

# Verify click was recorded in database
```

## Security Notes

- **NEVER** commit the secret to git
- **NEVER** share the secret publicly
- Rotate the secret periodically (every 90 days recommended)
- Keep a backup in a secure password manager

## Removing Temporary Code

After setting the secret in production, remove the temporary fallback code:

1. In `supabase/functions/_shared/tracking-token.ts`, remove lines 36-50 (the fallback to default secret)
2. In `supabase/functions/track-click/index.ts`, remove lines 65-80 (the bypass for failed validation)
3. Redeploy both functions

## Troubleshooting

If clicks aren't being tracked after setting the secret:

1. Verify the secret is set correctly in Supabase dashboard
2. Check that there are no extra spaces or newlines in the secret value
3. Ensure the functions have been redeployed after setting the secret
4. Check function logs for any HMAC validation errors

## Production Checklist

- [ ] Generated unique secure secret (32+ bytes)
- [ ] Added secret to Supabase dashboard
- [ ] Removed temporary fallback code
- [ ] Redeployed all functions
- [ ] Tested click tracking works
- [ ] Stored secret backup securely