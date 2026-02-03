/**
 * AttentionMarket API - GET /v1/policy
 *
 * Returns platform policies and guidelines for ad content.
 * This is called by developers using @the_ro_show/agent-ads-sdk
 *
 * Deploy: supabase functions deploy policy
 * Call: GET https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/policy
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { validateAPIKey, createAuthErrorResponse } from '../_shared/auth.ts';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-am-api-key',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate API key
    const authResult = await validateAPIKey(req);
    if (!authResult.authenticated) {
      return createAuthErrorResponse(authResult, corsHeaders);
    }

    // Return AttentionMarket platform policies
    const policy = {
      version: '1.0.0',
      last_updated: '2026-02-01',

      // Content policies
      content: {
        prohibited_content: [
          'Adult content or sexually explicit material',
          'Violence or graphic content',
          'Illegal goods or services',
          'Fraudulent or misleading claims',
          'Hate speech or discriminatory content',
          'Malware or phishing attempts',
        ],
        required_disclosures: {
          sponsored_content: 'Must clearly label sponsored content',
          data_collection: 'Must disclose any data collection',
          affiliate_links: 'Must disclose affiliate relationships',
        },
      },

      // Targeting policies
      targeting: {
        prohibited_targeting: [
          'Sensitive categories (health conditions, financial status)',
          'Discriminatory targeting (race, religion, etc.)',
          'Children under 13',
        ],
        allowed_taxonomies: [
          'shopping.*',
          'local_services.*',
          'business.*',
          'travel.*',
          'entertainment.*',
          'food.*',
          'health.fitness.*',
        ],
      },

      // Display policies
      display: {
        max_ad_units_per_request: 3,
        min_ttl_ms: 60000, // 1 minute
        max_ttl_ms: 3600000, // 1 hour
        required_elements: {
          disclosure_label: 'Required on all ad units',
          sponsor_name: 'Required on all ad units',
        },
      },

      // Event tracking policies
      tracking: {
        required_events: ['impression', 'click'],
        optional_events: ['conversion', 'dismiss', 'hide_advertiser', 'report'],
        event_deduplication: 'Events with same event_id will be deduplicated',
        timestamp_tolerance_ms: 300000, // 5 minutes
      },

      // Budget and billing policies
      billing: {
        minimum_campaign_budget: 100.00, // $100
        minimum_daily_budget: 10.00, // $10
        payment_terms: 'Prepaid campaigns only',
        refund_policy: 'Unused budget refunded within 30 days',
      },

      // Rate limits
      rate_limits: {
        decide_endpoint: {
          requests_per_minute: 100,
          requests_per_hour: 5000,
        },
        event_endpoint: {
          requests_per_minute: 500,
          requests_per_hour: 25000,
        },
      },

      // Support
      support: {
        email: 'support@attentionmarket.ai',
        documentation: 'https://docs.attentionmarket.ai',
        status_page: 'https://status.attentionmarket.ai',
      },
    };

    return new Response(
      JSON.stringify(policy),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in policy function:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
