#!/bin/bash
# Setup script for TRACKING_HMAC_SECRET

echo "AttentionMarket HMAC Secret Setup"
echo "=================================="
echo ""

# Generate a secure secret
echo "Generating secure HMAC secret..."
SECRET=$(head -c 32 /dev/urandom | base64)
echo ""
echo "Your HMAC Secret (save this securely):"
echo "----------------------------------------"
echo "$SECRET"
echo "----------------------------------------"
echo ""

echo "Next Steps:"
echo "1. Go to: https://supabase.com/dashboard/project/peruwnbrqkvmrldhpoom/settings/vault/secrets"
echo "2. Click 'New Secret'"
echo "3. Set Name: TRACKING_HMAC_SECRET"
echo "4. Set Value: $SECRET"
echo "5. Click 'Save'"
echo ""
echo "After setting the secret, deploy the functions:"
echo "npx supabase functions deploy decide --no-verify-jwt"
echo "npx supabase functions deploy track-click --no-verify-jwt"
echo "npx supabase functions deploy reconcile-earnings --no-verify-jwt"
echo ""
echo "⚠️  IMPORTANT: Save this secret in a password manager!"
echo "⚠️  You won't be able to see it again in Supabase dashboard!"