/**
 * AttentionMarket API - POST /v1/advertiser-signup
 *
 * Public endpoint for advertiser registration
 * Creates advertiser account for campaign management
 *
 * Flow:
 * 1. Validate email and company info
 * 2. Generate advertiser_id
 * 3. Generate dashboard API key
 * 4. Store in advertisers table
 * 5. Return credentials + dashboard URL
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { checkRateLimit, RateLimits } from '../_shared/rate-limit.ts';
import { hashPassword, validatePassword } from '../_shared/password.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Rate limiting: 5 signups per minute per IP
  const rateLimitResponse = checkRateLimit(req, RateLimits.SIGNUP);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const {
      contact_email,
      company_name,
      contact_name,
      password,
      website,
      industry,
    } = body;

    // Validate required fields
    if (!contact_email || !company_name || !contact_name || !password) {
      return new Response(
        JSON.stringify({
          error: 'validation_error',
          message: 'contact_email, company_name, contact_name, and password are required'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return new Response(
        JSON.stringify({
          error: 'validation_error',
          message: passwordValidation.error
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email
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

    // Check for duplicate
    const { data: existing } = await supabase
      .from('advertisers')
      .select('id')
      .eq('contact_email', contact_email)
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({
          error: 'duplicate_error',
          message: 'Advertiser with this email already exists',
          advertiser_id: existing.id
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate advertiser_id
    const advertiser_id = crypto.randomUUID();

    // Generate dashboard API key (still used for programmatic access)
    const dashboard_api_key = `adv_${generateSecureToken(64)}`;

    // Hash password
    const password_hash = await hashPassword(password);

    // Insert advertiser
    const { data: advertiser, error: insertError } = await supabase
      .from('advertisers')
      .insert({
        id: advertiser_id,
        contact_email,
        company_name,
        contact_name,
        password_hash,
        website: website || null,
        industry: industry || null,
        status: 'active',
        api_key: dashboard_api_key // Kept for programmatic API access
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create advertiser:', insertError);
      return new Response(
        JSON.stringify({
          error: 'database_error',
          message: 'Failed to create advertiser account'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return success (simplified for Lovable UI)
    return new Response(
      JSON.stringify({
        advertiser_id,
        api_key: dashboard_api_key,
        company_name,
        status: 'active'
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Advertiser signup error:', error);
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

function generateSecureToken(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, length);
}
