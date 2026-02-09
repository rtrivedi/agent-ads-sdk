#!/bin/bash

# View developer earnings summary
# Use this to review earnings before processing manual payouts

ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcnV3bmJycWt2bXJsZGhwb29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NjcwMDYsImV4cCI6MjA4NTU0MzAwNn0.FMCjeunas8ICKm9W9bo2hZwyrBttzTcJbplbAyl4XhU"

echo "📊 Developer Earnings Summary"
echo "========================================"
echo ""

# Query the developer_earnings_summary view
curl -s "https://peruwnbrqkvmrldhpoom.supabase.co/rest/v1/developer_earnings_summary?select=*" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" | jq '.'

echo ""
echo "========================================"
echo ""
echo "💡 To process payouts:"
echo "   1. Review pending_earnings and available_balance"
echo "   2. Wire transfer to developer"
echo "   3. Create payout record in database"
echo "   4. Update developer available_balance and total_paid_out"
