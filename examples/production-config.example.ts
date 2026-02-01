/**
 * Example: Production Configuration for AttentionMarket SDK
 *
 * Copy this file and update with your actual credentials:
 * cp examples/production-config.example.ts src/config.ts
 */

import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

// ============================================================================
// Production Configuration (for AttentionMarket hosted backend)
// ============================================================================

export const client = new AttentionMarketClient({
  // Your AttentionMarket API key (get from agent-signup)
  apiKey: process.env.ATTENTIONMARKET_API_KEY || 'am_live_YOUR_KEY_HERE',

  // Optional: Override backend URL (only if self-hosting)
  // Default points to AttentionMarket production API
  // baseUrl: 'https://api.attentionmarket.ai/v1',

  // Optional: Only needed if using custom Supabase backend
  // Leave undefined for default AttentionMarket backend
  // supabaseAnonKey: 'your-supabase-anon-key',
});

// ============================================================================
// Development/Test Configuration
// ============================================================================

export const testClient = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_TEST_KEY || 'am_test_YOUR_TEST_KEY',
});

// ============================================================================
// Self-Hosted Configuration (advanced)
// ============================================================================

export const selfHostedClient = new AttentionMarketClient({
  apiKey: 'am_live_YOUR_KEY',
  baseUrl: 'https://your-custom-backend.com/functions/v1',
  supabaseAnonKey: 'your-supabase-anon-key', // Required for Supabase backends
});
