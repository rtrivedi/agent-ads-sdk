#!/bin/bash

echo "🚀 Deploying Admin Analytics to Supabase"
echo "========================================"
echo ""

# Deploy the admin-analytics edge function
echo "1. Deploying admin-analytics edge function..."
supabase functions deploy admin-analytics
echo "✅ Function deployed"

# Deploy the updated event function
echo ""
echo "2. Deploying updated event function..."
supabase functions deploy event
echo "✅ Event function updated"

echo ""
echo "3. SQL Migration Status:"
echo "   The admin analytics SQL functions need to be applied manually."
echo "   Please go to: https://supabase.com/dashboard/project/peruwnbrqkvmrldhpoom/sql/new"
echo "   And paste the contents of: supabase/migrations/20260301_add_admin_analytics.sql"
echo ""

echo "4. Testing Admin Dashboard Access..."
# Test if the admin function is accessible
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  "https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/admin-analytics/health" \
  -H "x-admin-key: am_admin_secret_key_2026")

if [ "$RESPONSE" = "200" ]; then
  echo "✅ Admin dashboard function is accessible!"
  echo ""
  echo "You can now test the dashboard at:"
  echo "   Web: Open admin-dashboard.html in your browser"
  echo "   CLI: npx tsx scripts/admin-cli.ts health"
elif [ "$RESPONSE" = "401" ]; then
  echo "⚠️  Admin function deployed but needs authentication"
  echo "   Update your admin key in the dashboard"
else
  echo "❌ Admin function returned HTTP $RESPONSE"
  echo "   Check Supabase logs for details"
fi

echo ""
echo "📝 IMPORTANT: Apply the SQL migration manually:"
echo "   1. Go to: https://supabase.com/dashboard/project/peruwnbrqkvmrldhpoom/sql/new"
echo "   2. Paste contents of: supabase/migrations/20260301_add_admin_analytics.sql"
echo "   3. Click 'Run'"
echo ""
echo "Once SQL is applied, the full dashboard will work!"