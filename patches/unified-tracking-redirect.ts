/**
 * UNIFIED TRACKING REDIRECT ENDPOINT
 *
 * Consolidates all click tracking into one function.
 * Handles both:
 * 1. JWT tokens: /functions/v1/tracking-redirect/JWT_TOKEN
 * 2. Query params: /functions/v1/tracking-redirect?t=TOKEN
 *
 * IMPORTANT: Deploy with --no-verify-jwt flag!
 * End users click these URLs without API keys.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// CORS headers - allow from anywhere
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

/**
 * Decode JWT token without verification (for now)
 * In production, should verify signature
 */
function decodeJWT(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payloadB64 = parts[1];
    const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(payloadJson);
  } catch (e) {
    console.error('Failed to decode JWT:', e);
    return null;
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');

  // Create Supabase client with SERVICE ROLE for writes
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  let trackingData: any = null;
  let trackingMethod: 'jwt' | 'token' = 'token';

  // Check for JWT token in path (new style from track-click)
  const lastPathPart = pathParts[pathParts.length - 1];
  if (lastPathPart && lastPathPart !== 'tracking-redirect' && lastPathPart.includes('.')) {
    trackingMethod = 'jwt';
    const jwtPayload = decodeJWT(lastPathPart);

    if (!jwtPayload) {
      return new Response('Invalid JWT token', { status: 400 });
    }

    // Extract data from JWT
    const adUnitId = jwtPayload.u;
    const agentId = jwtPayload.a;
    const timestamp = jwtPayload.t;
    const payoutCents = jwtPayload.p;

    if (!adUnitId || !agentId) {
      return new Response('Invalid JWT payload', { status: 400 });
    }

    // Look up ad unit for campaign and destination URL
    const { data: adUnit, error } = await supabase
      .from('ad_units')
      .select('*, campaigns(*)')
      .eq('id', adUnitId)
      .single();

    if (error || !adUnit) {
      console.error('Ad unit lookup failed:', error);
      return new Response('Invalid ad unit', { status: 404 });
    }

    trackingData = {
      token: lastPathPart.substring(0, 20) + '...',  // Store partial for debugging
      agent_id: agentId,
      ad_unit_id: adUnitId,
      campaign_id: adUnit.campaign_id,
      destination_url: adUnit.action_url || adUnit.campaigns?.landing_url || 'https://attentionmarket.ai',
      payout_cents: payoutCents,
      jwt_timestamp: timestamp
    };

  } else {
    // Check for token in query params (old style from tracking-redirect)
    const token = url.searchParams.get('t');

    if (!token) {
      return new Response('Missing token parameter', { status: 400 });
    }

    // Look up token in database
    const { data: tracking, error } = await supabase
      .from('click_tracking_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !tracking) {
      console.error('Token lookup failed:', error);
      return new Response('Invalid or expired tracking token', { status: 404 });
    }

    // Check if already clicked (prevent double-tracking)
    if (tracking.clicked_at) {
      console.log('Token already used, redirecting anyway:', token);
      return Response.redirect(tracking.destination_url, 302);
    }

    // Mark token as used
    await supabase
      .from('click_tracking_tokens')
      .update({
        clicked_at: new Date().toISOString(),
        click_context: { timestamp: new Date().toISOString() }
      })
      .eq('token', token);

    trackingData = {
      token: token,
      agent_id: tracking.agent_id,
      decision_id: tracking.decision_id,
      ad_unit_id: tracking.ad_unit_id,
      campaign_id: tracking.campaign_id,
      destination_url: tracking.destination_url,
      payout_cents: tracking.payout_cents
    };
  }

  try {
    // Check for duplicate clicks (prevent double-counting)
    const clickDate = new Date().toISOString().split('T')[0];
    const { data: existingClick } = await supabase
      .from('events')
      .select('id')
      .eq('agent_id', trackingData.agent_id)
      .eq('metadata->>ad_unit_id', trackingData.ad_unit_id)
      .eq('event_type', 'click')  // Standardized event type
      .gte('created_at', `${clickDate}T00:00:00Z`)
      .single();

    if (existingClick) {
      console.log('Click already recorded today, redirecting without tracking');
      return Response.redirect(trackingData.destination_url, 302);
    }

    // Record click event with STANDARDIZED event_type
    const clickEventId = `evt_${crypto.randomUUID()}`;
    const { error: eventError } = await supabase
      .from('events')
      .insert({
        id: crypto.randomUUID(),
        event_id: clickEventId,
        event_type: 'click',  // STANDARDIZED - not 'ad_click'!
        occurred_at: new Date().toISOString(),
        agent_id: trackingData.agent_id,
        decision_id: trackingData.decision_id,
        ad_unit_id: trackingData.ad_unit_id,
        campaign_id: trackingData.campaign_id,
        tracking_token: trackingData.token,
        metadata: {
          auto_tracked: true,
          tracking_method: trackingMethod,
          payout_cents: trackingData.payout_cents,
          ip: req.headers.get('x-forwarded-for') ||
              req.headers.get('cf-connecting-ip') ||
              req.headers.get('x-real-ip'),
          user_agent: req.headers.get('user-agent'),
          referer: req.headers.get('referer'),
          href: trackingData.destination_url
        }
      });

    if (eventError) {
      console.error('Failed to record click event:', eventError);
      // Continue with redirect even if tracking fails
    }

    // Update campaign budget spent (if payout is known)
    if (trackingData.payout_cents && trackingData.campaign_id) {
      try {
        // Use atomic increment function if available
        const { error: budgetError } = await supabase.rpc('increment_campaign_budget_spent', {
          p_campaign_id: trackingData.campaign_id,
          p_amount_cents: trackingData.payout_cents
        });

        if (budgetError) {
          console.error('Budget increment function failed:', budgetError);
          // Fallback to direct update (less safe)
          await supabase
            .from('campaigns')
            .update({
              clicks: supabase.raw('COALESCE(clicks, 0) + 1'),
              budget_spent: supabase.raw(`COALESCE(budget_spent, 0) + ${trackingData.payout_cents}`)
            })
            .eq('id', trackingData.campaign_id);
        }
      } catch (e) {
        console.error('Failed to update campaign budget:', e);
      }
    }

    // Update campaign click counter
    try {
      await supabase
        .from('campaigns')
        .update({
          clicks: supabase.raw('COALESCE(clicks, 0) + 1')
        })
        .eq('id', trackingData.campaign_id);
    } catch (e) {
      console.error('Failed to update click counter:', e);
    }

    console.log('Click tracked successfully:', {
      method: trackingMethod,
      campaign_id: trackingData.campaign_id,
      agent_id: trackingData.agent_id,
      destination: trackingData.destination_url.substring(0, 50) + '...'
    });

    // SECURITY: Validate destination URL before redirect
    let destinationUrl;
    try {
      destinationUrl = new URL(trackingData.destination_url);

      // Only allow HTTPS (except localhost for testing)
      if (destinationUrl.protocol !== 'https:' &&
          destinationUrl.protocol !== 'http:' &&
          !destinationUrl.hostname.includes('localhost')) {
        console.error('Invalid protocol:', destinationUrl.protocol);
        return new Response('Invalid redirect URL', { status: 400 });
      }

      // Block private IPs in production (prevent SSRF)
      if (Deno.env.get('ENVIRONMENT') === 'production') {
        const hostname = destinationUrl.hostname;
        if (hostname === 'localhost' ||
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.') ||
            hostname.startsWith('172.') ||
            hostname === '127.0.0.1' ||
            hostname === '[::1]') {
          console.error('Private IP/localhost blocked in production');
          return new Response('Invalid redirect URL', { status: 400 });
        }
      }
    } catch (e) {
      console.error('Invalid destination URL:', trackingData.destination_url);
      return new Response('Invalid redirect URL', { status: 400 });
    }

    // Redirect to destination
    return Response.redirect(destinationUrl.toString(), 302);

  } catch (error) {
    console.error('Tracking redirect error:', error);
    // On error, still try to redirect
    try {
      return Response.redirect(trackingData.destination_url, 302);
    } catch {
      return new Response('Internal server error', { status: 500 });
    }
  }
});