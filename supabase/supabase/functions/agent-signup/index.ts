/**
 * AttentionMarket API - POST /v1/agent/signup
 *
 * Registers a new developer/agent to use AttentionMarket ads.
 * Creates agent record and generates API keys.
 *
 * Deploy: supabase functions deploy agent-signup
 * Call: POST https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/agent-signup
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { checkRateLimit, RateLimits } from '../_shared/rate-limit.ts';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Rate limiting: 5 signups per minute per IP
  const rateLimitResponse = checkRateLimit(req, RateLimits.SIGNUP);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request
    const requestBody = await req.json();
    const {
      owner_email,
      agent_name,
      sdk_type,
      declared_placements,
      declared_capabilities,
    } = requestBody;

    // Validate required fields
    if (!owner_email || !agent_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: owner_email, agent_name' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(owner_email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate agent_id (agt_...)
    const agent_id = `agt_${crypto.randomUUID().replace(/-/g, '').substring(0, 24)}`;

    // Generate API keys
    const api_key_live = `am_live_${crypto.randomUUID().replace(/-/g, '')}`;
    const api_key_test = `am_test_${crypto.randomUUID().replace(/-/g, '')}`;

    // Insert agent into database
    const { data: agent, error: insertError } = await supabase
      .from('agents')
      .insert({
        agent_id,
        api_key_live,
        api_key_test,
        owner_email,
        agent_name,
        sdk_type: sdk_type || 'unknown',
        environment: 'test', // Start in test mode
        declared_placements: declared_placements || [],
        declared_capabilities: declared_capabilities || [],
        status: 'active',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting agent:', insertError);

      // Check if email already exists
      if (insertError.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'Agent with this email already exists' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw insertError;
    }

    // Return agent credentials
    return new Response(
      JSON.stringify({
        agent_id,
        api_key_live,
        api_key_test,
        owner_email,
        agent_name,
        environment: 'test',
        status: 'active',
        message: 'Agent created successfully. Use api_key_test for development and api_key_live for production.',
        next_steps: [
          'Install SDK: npm install @the_ro_show/agent-ads-sdk',
          'Initialize SDK with your api_key_test',
          'Test integration with /v1/decide endpoint',
          'When ready for production, switch to api_key_live',
        ],
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in agent-signup function:', error);
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
