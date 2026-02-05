/**
 * AttentionMarket API - POST /v1/advertiser-login
 *
 * Public endpoint for advertiser login
 * Validates credentials and returns advertiser session info
 *
 * Flow:
 * 1. Validate email and API key
 * 2. Look up advertiser in database
 * 3. Return advertiser details for session
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

  // Rate limiting: 10 login attempts per minute per IP
  const rateLimitResponse = checkRateLimit(req, RateLimits.SIGNUP);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { contact_email, api_key } = body;

    // Validate required fields
    if (!contact_email || !api_key) {
      return new Response(
        JSON.stringify({
          error: 'validation_error',
          message: 'contact_email and api_key are required'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact_email)) {
      return new Response(
        JSON.stringify({
          error: 'validation_error',
          message: 'Invalid email format'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Look up advertiser by email and API key
    const { data: advertiser, error: queryError } = await supabase
      .from('advertisers')
      .select('id, company_name, contact_email, status')
      .eq('contact_email', contact_email)
      .eq('api_key', api_key)
      .single();

    if (queryError || !advertiser) {
      return new Response(
        JSON.stringify({
          error: 'invalid_credentials',
          message: 'Invalid email or API key'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if account is active
    if (advertiser.status !== 'active') {
      return new Response(
        JSON.stringify({
          error: 'account_suspended',
          message: `Account is ${advertiser.status}. Contact support@attentionmarket.com`
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return success
    return new Response(
      JSON.stringify({
        advertiser_id: advertiser.id,
        company_name: advertiser.company_name,
        status: advertiser.status
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Advertiser login error:', error);
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
