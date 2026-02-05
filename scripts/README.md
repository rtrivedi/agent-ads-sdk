# Test Scripts

This directory contains internal test scripts for development and debugging. These are not part of the public SDK.

## Usage

These scripts are for maintainers to test the SDK and backend. They require environment variables:

```bash
# Set environment variables
export ATTENTIONMARKET_API_KEY="am_test_..."
export SUPABASE_ANON_KEY="eyJ..."

# Run a test script
npx tsx scripts/test-taxonomy-system.ts
```

## Scripts

- `test-taxonomy-system.ts` - Tests taxonomy matching logic
- `test-campaign-creation.ts` - Tests campaign creation flow
- `test-multi-ads.ts` - Tests multi-ad responses
- `test-curl.sh` - Shell script for testing API endpoints
- `update-taxonomies.sh` - Updates taxonomy definitions in database

**Note:** These scripts may contain hardcoded values for testing. Do not use in production.
