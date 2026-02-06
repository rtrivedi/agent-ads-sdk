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
import { checkRateLimit, RateLimits } from '../_shared/rate-limit.ts';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-am-api-key',
  'Access-Control-Expose-Headers': 'X-Taxonomy-Warning',
};

// Backward compatibility: OLD → NEW taxonomy mapping (remove after 2026-05-04)
const DEPRECATED_TAXONOMIES: Record<string, string> = {
  'shopping.ecommerce.platform': 'business.ecommerce.platform.trial',
  'shopping.online_store': 'business.ecommerce.platform.trial',
  'shopping.store_setup': 'business.ecommerce.platform.trial',
  'shopping.electronics.search': 'shopping.electronics.computers.compare',
  'shopping.electronics.phones': 'shopping.electronics.phones.compare',
  'local_services.movers.quote': 'home_services.moving.local.quote',
  'local_services.contractors.home': 'home_services.remodeling.kitchen.quote',
  'local_services.cleaning': 'home_services.cleaning.regular.book',
  'local_services.cleaners.quote': 'home_services.cleaning.regular.book',
  'local_services.plumbers.quote': 'home_services.plumbing.emergency.quote',
  'local_services.electricians.quote': 'home_services.electrical.repair.quote',
  'local_services.restaurants.search': 'travel.experiences.dining.book',
  'local_services.pet_care.dog_walking': 'personal_services.pet_care.walking.book',
  'local_services.lawyers.consultation': 'legal.general.consultation',
  'business.productivity.tools': 'business.saas.project_management.trial',
  'business.software.ecommerce': 'business.ecommerce.platform.trial',
  'business.startup.tools': 'business.saas.crm.trial',
  'travel.booking.hotels': 'travel.hotels.luxury.book',
  'travel.booking.flights': 'travel.flights.domestic.book',
  'travel.flights.search': 'travel.flights.domestic.compare',
  'travel.experiences': 'travel.experiences.tours.book',
};

// Hierarchical taxonomy matching: Calculate relevance score
function calculateTaxonomyRelevance(requestedTaxonomy: string, targetedTaxonomies: string[]): number {
  let maxRelevance = 0;

  for (const targeted of targetedTaxonomies) {
    const relevance = getTaxonomyMatchScore(requestedTaxonomy, targeted);
    if (relevance > maxRelevance) {
      maxRelevance = relevance;
    }
  }

  return maxRelevance;
}

// Get match score between requested and targeted taxonomy
function getTaxonomyMatchScore(requested: string, targeted: string): number {
  // Exact match
  if (requested === targeted) {
    return 1.0;
  }

  const requestedParts = requested.split('.');
  const targetedParts = targeted.split('.');

  // Check if targeted is a prefix of requested
  // Example: targeted="insurance.auto" matches requested="insurance.auto.full_coverage.quote"
  let matchingLevels = 0;
  for (let i = 0; i < targetedParts.length; i++) {
    if (i >= requestedParts.length || requestedParts[i] !== targetedParts[i]) {
      break;
    }
    matchingLevels++;
  }

  // Calculate relevance based on matching depth
  if (matchingLevels === 0) return 0;
  if (matchingLevels === 1) return 0.5; // Vertical match only (e.g., "insurance")
  if (matchingLevels === 2) return 0.7; // Category match (e.g., "insurance.auto")
  if (matchingLevels === 3) return 0.9; // Subcategory match (e.g., "insurance.auto.full_coverage")
  if (matchingLevels === 4) return 1.0; // Full match with intent

  return 0;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Rate limiting: 1000 requests per minute per IP
  const rateLimitResponse = checkRateLimit(req, RateLimits.DECIDE);
  if (rateLimitResponse) {
    return rateLimitResponse;
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
      context,           // NEW: Full conversation context for semantic matching
      user_intent,       // NEW: Detected user intent
    } = requestBody;

    // Validate required fields
    if (!request_id || !agent_id || !placement || !opportunity) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract targeting criteria from opportunity
    let taxonomy = opportunity.intent.taxonomy;
    const country = opportunity.context.country;
    const language = opportunity.context.language;
    const platform = opportunity.context.platform;

    // Handle deprecated taxonomies (backward compatibility)
    let taxonomyWarning: string | undefined;
    if (DEPRECATED_TAXONOMIES[taxonomy]) {
      taxonomyWarning = `Taxonomy '${taxonomy}' is deprecated. Use '${DEPRECATED_TAXONOMIES[taxonomy]}' instead. Old taxonomies will be removed on 2026-05-04.`;
      console.warn(`⚠️  DEPRECATED: ${taxonomyWarning}`);
      taxonomy = DEPRECATED_TAXONOMIES[taxonomy];
    }

    // Generate decision ID
    const decision_id = `dec_${crypto.randomUUID()}`;

    // Generate context embedding for semantic matching (if context provided)
    let context_embedding = null;
    let useSemanticMatching = false;

    if (context || user_intent) {
      const openaiKey = Deno.env.get('OPENAI_API_KEY');
      if (openaiKey) {
        try {
          const contextText = [context, user_intent].filter(Boolean).join('\n');

          const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'text-embedding-3-small',
              input: contextText,
            }),
          });

          if (embeddingResponse.ok) {
            const embeddingData = await embeddingResponse.json();
            context_embedding = embeddingData.data[0].embedding;
            useSemanticMatching = true;
          }
        } catch (error) {
          console.warn('Failed to generate context embedding:', error);
          // Fall back to taxonomy matching
        }
      }
    }

    // Query database for matching ad units
    // Match on:
    // 1. Campaign is active
    // 2. Taxonomy matches (hierarchical matching - will filter in code)
    // 3. Country matches (or campaign targets all countries)
    // 4. Language matches (or campaign targets all languages)
    // 5. Platform matches (or campaign targets all platforms)
    // 6. Campaign has budget remaining

    // Get vertical from taxonomy for broad filtering (e.g., "insurance" from "insurance.auto.full_coverage.quote")
    const taxonomyParts = taxonomy.split('.');
    const vertical = taxonomyParts[0];

    // Query for matching campaigns
    // Two modes: Semantic matching (if context embedding available) OR taxonomy matching (fallback)
    let adUnits;
    let queryError;

    if (useSemanticMatching && context_embedding) {
      // Semantic matching via vector similarity
      const { data, error } = await supabase.rpc('find_ads_by_semantic_similarity', {
        query_embedding: JSON.stringify(context_embedding),
        match_threshold: 0.65,  // Minimum similarity score (0-1)
        match_count: 50,
        placement_type: placement.type
      });
      adUnits = data;
      queryError = error;
    } else {
      // Taxonomy matching (existing logic)
      const { data, error } = await supabase
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
        .limit(50);
      adUnits = data;
      queryError = error;
    }

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
    const scoredAds = filteredAds
      .map((ad: any) => {
        const campaign = ad.campaigns;

        // Use different scoring based on match method
        let relevance: number;
        let compositeScore: number;

        if (useSemanticMatching && ad.semantic_similarity !== undefined) {
          // For semantic matching: use similarity score from SQL function
          relevance = ad.semantic_similarity;
          const bidAmount = campaign.bid_cpc || campaign.bid_cpm || 1.0;
          const quality = campaign.quality_score || 1.0;
          compositeScore = relevance * bidAmount * quality;
        } else {
          // For taxonomy matching: use hierarchical taxonomy relevance
          relevance = calculateTaxonomyRelevance(
            taxonomy,
            campaign.targeting_taxonomies || []
          );
          const bidAmount = campaign.bid_cpm || campaign.bid_cpc || 1.0;
          const quality = campaign.quality_score || 1.0;
          compositeScore = bidAmount * quality * relevance;
        }

        return {
          ...ad,
          _relevance_score: relevance,
          _composite_score: compositeScore,
        };
      })
      .filter((ad: any) => ad._relevance_score > 0); // Only include ads with some relevance

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
      // Semantic matching analytics
      conversation_context: context || null,
      user_intent_detected: user_intent || null,
      match_method: useSemanticMatching ? 'semantic' : 'taxonomy',
      semantic_similarity_score: useSemanticMatching && matchingAds.length > 0
        ? matchingAds[0]?.semantic_similarity || null
        : null,
      scoring_metadata: {
        scoring_method: useSemanticMatching ? 'semantic_v1' : 'composite_v1',
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
    const responseHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };
    if (taxonomyWarning) {
      responseHeaders['X-Taxonomy-Warning'] = taxonomyWarning;
    }

    return new Response(
      JSON.stringify({
        request_id,
        decision_id,
        status: 'filled',
        ttl_ms: 300000, // 5 minutes
        units: formattedUnits,
      }),
      {
        headers: responseHeaders,
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
