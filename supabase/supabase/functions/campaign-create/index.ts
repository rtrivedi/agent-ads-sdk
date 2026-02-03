/**
 * AttentionMarket API - POST /v1/campaign-create
 *
 * Creates a new ad campaign for authenticated advertiser
 * Handles campaign configuration, targeting, and budget
 *
 * Requires advertiser authentication (dashboard API key)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { checkRateLimit, RateLimits } from '../_shared/rate-limit.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-advertiser-key',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Rate limiting: 20 campaigns per minute per IP
  const rateLimitResponse = checkRateLimit(req, RateLimits.CAMPAIGN);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    // Authenticate advertiser
    const advertiserKey = req.headers.get('X-Advertiser-Key');
    if (!advertiserKey) {
      return new Response(
        JSON.stringify({
          error: 'auth_error',
          message: 'Missing X-Advertiser-Key header'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find advertiser by API key (using indexed column for fast lookup)
    const { data: advertisers } = await supabase
      .from('advertisers')
      .select('id, status')
      .eq('api_key', advertiserKey);

    if (!advertisers || advertisers.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'auth_error',
          message: 'Invalid advertiser API key'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const advertiser = advertisers[0];
    if (advertiser.status !== 'active') {
      return new Response(
        JSON.stringify({
          error: 'account_suspended',
          message: 'Advertiser account is not active'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse campaign data
    const body = await req.json();
    const {
      name,
      targeting_taxonomies,
      targeting_countries,
      targeting_languages,
      targeting_platforms,
      budget,
      bid_cpm,
      bid_cpc,
      start_date,
      end_date,
    } = body;

    // Validate required fields
    if (!name || !targeting_taxonomies || !budget) {
      return new Response(
        JSON.stringify({
          error: 'validation_error',
          message: 'name, targeting_taxonomies, and budget are required'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate pricing model (must have CPM or CPC)
    if (!bid_cpm && !bid_cpc) {
      return new Response(
        JSON.stringify({
          error: 'validation_error',
          message: 'Must specify bid_cpm or bid_cpc (or both)'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate budget range
    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum) || budgetNum < 100) {
      return new Response(
        JSON.stringify({
          error: 'validation_error',
          message: 'Minimum budget is $100'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (budgetNum > 100000) {
      return new Response(
        JSON.stringify({
          error: 'validation_error',
          message: 'Maximum budget is $100,000 per campaign. Contact sales for larger budgets.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate bid ranges
    if (bid_cpm) {
      const cpmNum = parseFloat(bid_cpm);
      if (isNaN(cpmNum) || cpmNum < 0.01 || cpmNum > 100) {
        return new Response(
          JSON.stringify({
            error: 'validation_error',
            message: 'CPM bid must be between $0.01 and $100.00'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (bid_cpc) {
      const cpcNum = parseFloat(bid_cpc);
      if (isNaN(cpcNum) || cpcNum < 0.01 || cpcNum > 100) {
        return new Response(
          JSON.stringify({
            error: 'validation_error',
            message: 'CPC bid must be between $0.01 and $100.00'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Generate campaign ID
    const campaign_id = crypto.randomUUID();

    // Insert campaign
    const { data: campaign, error: insertError } = await supabase
      .from('campaigns')
      .insert({
        id: campaign_id,
        advertiser_id: advertiser.id,
        name,
        targeting_taxonomies: Array.isArray(targeting_taxonomies) ? targeting_taxonomies : [targeting_taxonomies],
        targeting_countries: targeting_countries || null,
        targeting_languages: targeting_languages || null,
        targeting_platforms: targeting_platforms || null,
        budget: parseFloat(budget),
        budget_spent: 0,
        bid_cpm: bid_cpm ? parseFloat(bid_cpm) : null,
        bid_cpc: bid_cpc ? parseFloat(bid_cpc) : null,
        quality_score: 1.0, // Default quality score
        start_date: start_date || null,
        end_date: end_date || null,
        status: 'active',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create campaign:', insertError);
      return new Response(
        JSON.stringify({
          error: 'database_error',
          message: 'Failed to create campaign',
          details: insertError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        campaign_id,
        name,
        status: 'active',
        budget: {
          total: budget,
          spent: 0,
          remaining: budget,
          currency: 'USD'
        },
        targeting: {
          taxonomies: targeting_taxonomies,
          countries: targeting_countries,
          languages: targeting_languages,
          platforms: targeting_platforms
        },
        pricing: {
          cpm: bid_cpm || null,
          cpc: bid_cpc || null
        },
        created_at: campaign.created_at,
        message: 'Campaign created successfully',
        next_steps: [
          'Create ad units for this campaign',
          'Monitor performance in dashboard',
          'Adjust bids based on results'
        ]
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Campaign create error:', error);
    return new Response(
      JSON.stringify({
        error: 'internal_error',
        message: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
