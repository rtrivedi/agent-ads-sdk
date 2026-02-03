/**
 * AttentionMarket API - POST /v1/decide
 *
 * Returns ads from YOUR database based on targeting rules.
 * This is called by developers using @the_ro_show/agent-ads-sdk
 *
 * Deploy: supabase functions deploy decide
 * Call: POST https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/decide
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request
    const requestBody = await req.json();
    const {
      request_id,
      agent_id,
      placement,
      opportunity,
    } = requestBody;

    // Validate required fields
    if (!request_id || !agent_id || !placement || !opportunity) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract targeting criteria from opportunity
    const taxonomy = opportunity.intent.taxonomy;
    const country = opportunity.context.country;
    const language = opportunity.context.language;
    const platform = opportunity.context.platform;

    // Generate decision ID
    const decision_id = `dec_${crypto.randomUUID()}`;

    // Query database for matching ad units
    // Match on:
    // 1. Campaign is active
    // 2. Taxonomy matches (campaign.targeting_taxonomies contains requested taxonomy)
    // 3. Country matches (or campaign targets all countries)
    // 4. Language matches (or campaign targets all languages)
    // 5. Platform matches (or campaign targets all platforms)
    // 6. Campaign has budget remaining

    const { data: adUnits, error: queryError } = await supabase
      .from('ad_units')
      .select(`
        *,
        campaigns!inner(
          id,
          advertiser_id,
          targeting_taxonomies,
          targeting_countries,
          targeting_languages,
          targeting_platforms,
          status,
          budget,
          budget_spent,
          bid_cpm,
          bid_cpc,
          quality_score
        )
      `)
      .eq('status', 'active')
      .eq('campaigns.status', 'active')
      .eq('unit_type', placement.type)
      .contains('campaigns.targeting_taxonomies', [taxonomy])
      .limit(50); // Get more candidates for ranking (will limit after scoring)

    if (queryError) {
      console.error('Database query error:', queryError);
      throw queryError;
    }

    // Filter by country, language, platform (if specified in targeting)
    const filteredAds = (adUnits || []).filter((ad: any) => {
      const campaign = ad.campaigns;

      // Check country (if campaign specifies countries)
      if (campaign.targeting_countries && campaign.targeting_countries.length > 0) {
        if (!campaign.targeting_countries.includes(country)) {
          return false;
        }
      }

      // Check language (if campaign specifies languages)
      if (campaign.targeting_languages && campaign.targeting_languages.length > 0) {
        if (!campaign.targeting_languages.includes(language)) {
          return false;
        }
      }

      // Check platform (if campaign specifies platforms)
      if (campaign.targeting_platforms && campaign.targeting_platforms.length > 0) {
        if (!campaign.targeting_platforms.includes(platform)) {
          return false;
        }
      }

      // Check budget remaining
      if (campaign.budget_spent >= campaign.budget) {
        return false;
      }

      return true;
    });

    // Score and rank ads (Option C: Agent Curation)
    // This enables agents to get multiple ads and choose the best one
    const scoredAds = filteredAds.map((ad: any) => {
      const campaign = ad.campaigns;

      // Calculate relevance score (0-1)
      let relevance = 0;

      // Exact taxonomy match (currently only signal, weight: 1.0)
      if (campaign.targeting_taxonomies?.includes(taxonomy)) {
        relevance = 1.0;
      }

      // Future: Add keyword matching here (Phase 2)
      // Future: Add embedding similarity here (Phase 2)

      // Calculate composite score: bid × quality × relevance
      const bidAmount = campaign.bid_cpm || 1.0;
      const quality = campaign.quality_score || 1.0;
      const compositeScore = bidAmount * quality * relevance;

      return {
        ...ad,
        _relevance_score: relevance,
        _composite_score: compositeScore,
      };
    });

    // Sort by composite score (highest first)
    scoredAds.sort((a, b) => b._composite_score - a._composite_score);

    // Limit to requested number (default 3 for agent curation)
    const maxUnits = opportunity.constraints?.max_units || 3;
    const matchingAds = scoredAds.slice(0, maxUnits);

    // Log decision to database with scoring metadata
    await supabase.from('decisions').insert({
      request_id,
      decision_id,
      agent_id,
      placement_type: placement.type,
      placement_surface: placement.surface,
      taxonomy,
      country,
      language,
      platform,
      region: opportunity.context?.region,
      city: opportunity.context?.city,
      status: matchingAds.length > 0 ? 'filled' : 'no_fill',
      ad_unit_ids: matchingAds.map((ad: any) => ad.id),
      candidate_ad_count: filteredAds.length, // Total ads that matched before ranking
      scoring_metadata: {
        scoring_method: 'composite_v1', // bid × quality × relevance
        top_scores: matchingAds.slice(0, 5).map((ad: any) => ({
          unit_id: ad.id,
          relevance: ad._relevance_score,
          composite: ad._composite_score,
        })),
        requested_max: maxUnits,
        returned_count: matchingAds.length,
      },
    });

    // No fill - return empty
    if (matchingAds.length === 0) {
      return new Response(
        JSON.stringify({
          request_id,
          decision_id,
          status: 'no_fill',
          ttl_ms: 300000, // 5 minutes
          units: [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format ad units in AttentionMarket API format
    const formattedUnits = matchingAds.map((ad: any, index: number) => {
      const trackingToken = `trk_${crypto.randomUUID()}`;

      return {
        unit_id: ad.id,
        unit_type: ad.unit_type,
        disclosure: {
          label: ad.disclosure_label,
          explanation: ad.disclosure_explanation,
          sponsor_name: ad.sponsor_name,
        },
        tracking: {
          token: trackingToken,
          impression_url: `${supabaseUrl}/functions/v1/event`,
          click_url: `${supabaseUrl}/functions/v1/click/${trackingToken}`, // ← Server-side click tracking
        },
        suggestion: {
          title: ad.title,
          body: ad.body,
          cta: ad.cta,
          action_url: ad.action_url, // ← Real URL (show this to user in web/GUI)
          tracking_url: `${supabaseUrl}/functions/v1/click/${trackingToken}`, // ← Optional: server-side redirect
          tracked_url: `${ad.action_url}${ad.action_url.includes('?') ? '&' : '?'}ref=am_${trackingToken}`, // ← For SMS/email (tracking param)
        },
        // Include scoring metadata for agent curation (Option C)
        _score: {
          relevance: ad._relevance_score,
          composite: ad._composite_score,
          position: index + 1, // 1-indexed position for tracking
        },
      };
    });

    // Return filled response
    return new Response(
      JSON.stringify({
        request_id,
        decision_id,
        status: 'filled',
        ttl_ms: 300000, // 5 minutes
        units: formattedUnits,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in decide function:', error);
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
