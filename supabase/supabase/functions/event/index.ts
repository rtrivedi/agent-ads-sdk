/**
 * AttentionMarket API - POST /v1/event
 *
 * Tracks ad events (impressions, clicks, conversions, etc.) to YOUR database.
 * This is called by developers using @the_ro_show/agent-ads-sdk
 *
 * Deploy: supabase functions deploy event
 * Call: POST https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/event
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
    const eventData = await req.json();
    const {
      event_id,
      occurred_at,
      agent_id,
      request_id,
      decision_id,
      unit_id,
      event_type,
      tracking_token,
      metadata,
    } = eventData;

    // Validate required fields
    if (!event_id || !occurred_at || !agent_id || !unit_id || !event_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get ad unit to extract campaign_id and taxonomy
    const { data: adUnit, error: adError } = await supabase
      .from('ad_units')
      .select('campaign_id')
      .eq('id', unit_id)
      .single();

    if (adError) {
      console.error('Error fetching ad unit:', adError);
    }

    // Insert event into database
    const { error: insertError } = await supabase.from('events').insert({
      event_id,
      event_type,
      occurred_at,
      agent_id,
      request_id,
      decision_id,
      ad_unit_id: unit_id,
      campaign_id: adUnit?.campaign_id,
      tracking_token,
      metadata,
    });

    if (insertError) {
      console.error('Error inserting event:', insertError);
      throw insertError;
    }

    // Update ad unit counters (denormalized for performance)
    // Note: This uses a direct SQL query to increment counters atomically
    if (event_type === 'impression') {
      const { error: updateError } = await supabase
        .rpc('increment_impressions', { unit_uuid: unit_id });

      if (updateError) {
        console.error('Error incrementing impressions:', updateError);
        // Continue anyway - event was logged successfully
      }
    } else if (event_type === 'click') {
      const { error: updateError } = await supabase
        .rpc('increment_clicks', { unit_uuid: unit_id });

      if (updateError) {
        console.error('Error incrementing clicks:', updateError);
        // Continue anyway - event was logged successfully
      }
    } else if (event_type === 'conversion') {
      const { error: updateError } = await supabase
        .rpc('increment_conversions', { unit_uuid: unit_id });

      if (updateError) {
        console.error('Error incrementing conversions:', updateError);
        // Continue anyway - event was logged successfully
      }
    }

    // Return success
    return new Response(
      JSON.stringify({ accepted: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in event function:', error);
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
