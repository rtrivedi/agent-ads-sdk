/**
 * AttentionMarket API - POST /v1/campaign-update
 *
 * Update campaign status (pause/resume) for authenticated advertiser
 *
 * Input: { campaign_id, status, advertiser_id }
 * Output: { success: true, campaign: {...} }
 *
 * Deploy: supabase functions deploy campaign-update
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { checkRateLimit, RateLimits } from '../_shared/rate-limit.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Rate limiting: 60 updates per minute per IP
  const rateLimitResponse = checkRateLimit(req, RateLimits.STATS);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { campaign_id, status, advertiser_id } = body;

    // Validate required fields
    if (!campaign_id || !advertiser_id) {
      return new Response(
        JSON.stringify({
          error: 'validation_error',
          message: 'campaign_id and advertiser_id are required'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate status value
    const validStatuses = ['active', 'paused', 'completed'];
    if (status && !validStatuses.includes(status)) {
      return new Response(
        JSON.stringify({
          error: 'validation_error',
          message: `status must be one of: ${validStatuses.join(', ')}`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify advertiser owns this campaign
    const { data: campaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('id, advertiser_id, name, status')
      .eq('id', campaign_id)
      .eq('advertiser_id', advertiser_id)
      .single();

    if (fetchError || !campaign) {
      return new Response(
        JSON.stringify({
          error: 'not_found',
          message: 'Campaign not found or you do not have permission to update it'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update campaign status
    const { data: updatedCampaign, error: updateError } = await supabase
      .from('campaigns')
      .update({
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaign_id)
      .eq('advertiser_id', advertiser_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating campaign:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        campaign: {
          id: updatedCampaign.id,
          name: updatedCampaign.name,
          status: updatedCampaign.status,
          updated_at: updatedCampaign.updated_at,
        },
        message: `Campaign ${status === 'paused' ? 'paused' : 'resumed'} successfully`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Campaign update error:', error);
    return new Response(
      JSON.stringify({
        error: 'internal_error',
        message: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
