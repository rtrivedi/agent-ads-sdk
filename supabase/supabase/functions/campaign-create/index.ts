/**
 * AttentionMarket API - POST /v1/campaign-create
 *
 * Creates a new ad campaign with creative for authenticated advertiser
 * Simplified for Lovable UI - accepts advertiser_id and creates both campaign + ad_unit
 *
 * Auth: Can use advertiser_id in body OR X-Advertiser-Key header
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const {
      advertiser_id,
      campaign_name,
      taxonomy,
      budget_total,
      cpc,
      creative,
      targeting,
      status,
      intent_description,    // NEW: Plain English description of what advertiser solves
      ideal_customer,        // NEW: Who is the ideal customer
      trigger_contexts,      // NEW: Array of trigger phrases
    } = body;

    // Validate required fields
    if (!campaign_name || !taxonomy || !budget_total || !cpc || !creative) {
      return new Response(
        JSON.stringify({
          error: 'validation_error',
          message: 'campaign_name, taxonomy, budget_total, cpc, and creative are required'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate creative fields
    if (!creative.title || !creative.body || !creative.cta || !creative.action_url) {
      return new Response(
        JSON.stringify({
          error: 'validation_error',
          message: 'creative must include title, body, cta, and action_url'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find advertiser (by advertiser_id from body OR X-Advertiser-Key header)
    let advertiser;

    if (advertiser_id) {
      // Use advertiser_id from body (Lovable UI flow)
      const { data } = await supabase
        .from('advertisers')
        .select('id, company_name, status')
        .eq('id', advertiser_id)
        .single();
      advertiser = data;
    } else {
      // Use X-Advertiser-Key header (programmatic API flow)
      const advertiserKey = req.headers.get('X-Advertiser-Key');
      if (!advertiserKey) {
        return new Response(
          JSON.stringify({
            error: 'auth_error',
            message: 'Must provide advertiser_id in body or X-Advertiser-Key header'
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data } = await supabase
        .from('advertisers')
        .select('id, company_name, status')
        .eq('api_key', advertiserKey)
        .single();
      advertiser = data;
    }

    if (!advertiser) {
      return new Response(
        JSON.stringify({
          error: 'auth_error',
          message: 'Advertiser not found'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (advertiser.status !== 'active') {
      return new Response(
        JSON.stringify({
          error: 'account_suspended',
          message: 'Advertiser account is not active'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate taxonomy format
    function isValidTaxonomy(tax: string): boolean {
      const parts = tax.split('.');
      if (parts.length < 3 || parts.length > 4) return false;
      const validIntents = ['research', 'compare', 'quote', 'trial', 'book', 'apply', 'consultation', 'service'];
      if (parts.length === 4 && !validIntents.includes(parts[3])) return false;
      return parts.every(part => /^[a-z0-9_]+$/.test(part));
    }

    if (!isValidTaxonomy(taxonomy)) {
      return new Response(
        JSON.stringify({
          error: 'validation_error',
          message: `Invalid taxonomy format: "${taxonomy}". Must be 'vertical.category.subcategory[.intent]'`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate budget range
    const budgetNum = parseFloat(budget_total);
    if (isNaN(budgetNum) || budgetNum < 100) {
      return new Response(
        JSON.stringify({
          error: 'invalid_budget',
          message: 'Budget must be at least $100'
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

    // Validate CPC range
    const cpcNum = parseFloat(cpc);
    if (isNaN(cpcNum) || cpcNum < 1 || cpcNum > 100) {
      return new Response(
        JSON.stringify({
          error: 'invalid_cpc',
          message: 'CPC must be between $1 and $100'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate URL format
    if (!creative.action_url.startsWith('https://')) {
      return new Response(
        JSON.stringify({
          error: 'invalid_url',
          message: 'Landing page URL must start with https://'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate campaign ID
    const campaign_id = crypto.randomUUID();

    // Generate semantic intent embedding (if intent provided)
    let intent_embedding = null;
    if (intent_description || ideal_customer || trigger_contexts) {
      const openaiKey = Deno.env.get('OPENAI_API_KEY');
      if (openaiKey) {
        try {
          // Combine all intent signals into one text
          const intentText = [
            intent_description || '',
            ideal_customer ? `Ideal customer: ${ideal_customer}` : '',
            trigger_contexts?.length ? `Triggers: ${trigger_contexts.join(', ')}` : ''
          ].filter(Boolean).join('\n');

          // Generate embedding via OpenAI
          const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'text-embedding-3-small',
              input: intentText,
            }),
          });

          if (embeddingResponse.ok) {
            const embeddingData = await embeddingResponse.json();
            intent_embedding = embeddingData.data[0].embedding;
          } else {
            console.warn('Failed to generate intent embedding:', await embeddingResponse.text());
          }
        } catch (error) {
          console.warn('Error generating intent embedding:', error);
          // Don't fail campaign creation if embedding fails
        }
      }
    }

    // Insert campaign
    const { data: campaign, error: campaignError} = await supabase
      .from('campaigns')
      .insert({
        id: campaign_id,
        advertiser_id: advertiser.id,
        name: campaign_name,
        targeting_taxonomies: [taxonomy], // Convert single taxonomy to array
        targeting_countries: targeting?.geo || ['US'],
        targeting_languages: targeting?.language || ['en'],
        targeting_platforms: targeting?.platform || ['web', 'mobile'],
        budget: budgetNum,
        budget_spent: 0,
        bid_cpc: cpcNum,
        bid_cpm: null, // Not using CPM for MVP
        status: status || 'active',
        // NEW: Semantic intent fields
        intent_description: intent_description || null,
        ideal_customer: ideal_customer || null,
        trigger_contexts: trigger_contexts || null,
        intent_embedding: intent_embedding ? JSON.stringify(intent_embedding) : null,
      })
      .select()
      .single();

    if (campaignError) {
      console.error('Failed to create campaign:', campaignError);
      return new Response(
        JSON.stringify({
          error: 'database_error',
          message: 'Failed to create campaign',
          details: campaignError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate ad unit ID
    const ad_unit_id = crypto.randomUUID();

    // Insert ad unit with creative
    const { error: adUnitError } = await supabase
      .from('ad_units')
      .insert({
        id: ad_unit_id,
        campaign_id: campaign.id,
        unit_type: 'sponsored_suggestion',
        title: creative.title,
        body: creative.body,
        cta: creative.cta,
        action_url: creative.action_url,
        sponsor_name: advertiser.company_name,
        disclosure_label: 'Sponsored',
        disclosure_explanation: `Sponsored by ${advertiser.company_name}`,
        status: status || 'active',
      });

    if (adUnitError) {
      console.error('Failed to create ad unit:', adUnitError);
      // Rollback: delete the campaign
      await supabase.from('campaigns').delete().eq('id', campaign_id);

      return new Response(
        JSON.stringify({
          error: 'database_error',
          message: 'Failed to create ad creative',
          details: adUnitError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return success
    return new Response(
      JSON.stringify({
        campaign_id,
        status: campaign.status,
        budget_remaining: budgetNum,
        created_at: campaign.created_at
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
