#!/bin/bash

# AttentionMarket SDK - Pre-Launch Verification Script
# Run this before going live to ensure everything is configured

set -e

echo "🚀 AttentionMarket Pre-Launch Check v1.0"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}✗ Not in SDK root directory${NC}"
    exit 1
fi

echo "1. Checking SDK Build..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ SDK builds successfully${NC}"
else
    echo -e "${RED}✗ SDK build failed${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "2. Checking Environment Variables..."

# Check for Supabase URL and Key
if [ -z "$SUPABASE_URL" ]; then
    echo -e "${YELLOW}⚠ SUPABASE_URL not set (needed for testing)${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✓ SUPABASE_URL configured${NC}"
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo -e "${YELLOW}⚠ SUPABASE_ANON_KEY not set (needed for testing)${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✓ SUPABASE_ANON_KEY configured${NC}"
fi

echo ""
echo "3. Checking Critical Edge Function Secrets..."
echo "   (You need to verify these in Supabase Dashboard)"
echo ""
echo "   Required secrets:"
echo "   - ${YELLOW}TRACKING_HMAC_SECRET${NC} - For click fraud prevention"
echo "   - ${YELLOW}OPENAI_API_KEY${NC} - For semantic matching (optional but recommended)"
echo ""
echo "   Go to: https://supabase.com/dashboard/project/peruwnbrqkvmrldhpoom/settings/vault"
echo ""

echo "4. Testing API Endpoints..."

# Test decide endpoint
if [ ! -z "$SUPABASE_URL" ] && [ ! -z "$SUPABASE_ANON_KEY" ]; then
    echo -n "   Testing /decide endpoint... "
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST "$SUPABASE_URL/functions/v1/decide" \
        -H "apikey: $SUPABASE_ANON_KEY" \
        -H "Content-Type: application/json" \
        -d '{"agent_id":"test","placement":"test","count":1}')

    if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "204" ]; then
        echo -e "${GREEN}✓ (HTTP $RESPONSE)${NC}"
    else
        echo -e "${RED}✗ (HTTP $RESPONSE)${NC}"
        ERRORS=$((ERRORS + 1))
    fi
fi

echo ""
echo "5. Checking Database Migrations..."
echo "   Run these commands to verify:"
echo "   ${YELLOW}supabase db status${NC}"
echo "   ${YELLOW}supabase db push${NC} (if migrations pending)"
echo ""

echo "6. Security Checklist:"
# Check for removed methods in SDK
if grep -q "trackClick\|trackClickFromAd" src/client.ts 2>/dev/null; then
    echo -e "${RED}✗ Manual click tracking methods still present (security risk)${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ Manual click tracking removed (v0.16.0)${NC}"
fi

# Check for HTTPS enforcement
if grep -q "https://" src/client.ts 2>/dev/null; then
    echo -e "${GREEN}✓ HTTPS enforcement present${NC}"
else
    echo -e "${YELLOW}⚠ Verify HTTPS enforcement${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "7. NPM Package Status:"
NPM_VERSION=$(npm view @the_ro_show/agent-ads-sdk version 2>/dev/null || echo "not found")
LOCAL_VERSION=$(node -p "require('./package.json').version")
echo "   Published version: $NPM_VERSION"
echo "   Local version: $LOCAL_VERSION"

if [ "$NPM_VERSION" != "$LOCAL_VERSION" ]; then
    echo -e "${YELLOW}⚠ Local version differs from published${NC}"
    echo "   Run: ${YELLOW}npm publish${NC} to update"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✓ Versions match${NC}"
fi

echo ""
echo "========================================"
echo "RESULTS:"
echo ""

if [ $ERRORS -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}✅ All checks passed! Ready for launch.${NC}"
    else
        echo -e "${YELLOW}⚠️  $WARNINGS warnings found. Review before launch.${NC}"
    fi
else
    echo -e "${RED}❌ $ERRORS errors found. Fix before launch!${NC}"
    exit 1
fi

echo ""
echo "📋 FINAL MANUAL CHECKS:"
echo "1. Verify TRACKING_HMAC_SECRET is set in Supabase"
echo "2. Set up error tracking (Sentry/DataDog)"
echo "3. Configure monitoring dashboard"
echo "4. Review rate limits for expected traffic"
echo "5. Test with a real ad campaign"
echo ""
echo "🚀 Good luck with your launch!"