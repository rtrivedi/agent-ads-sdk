/**
 * AttentionMarket Click Redirect & Tracking
 *
 * Handles click tracking with server-side attribution
 *
 * Flow:
 * 1. User clicks ad link
 * 2. Hits this function with tracking token
 * 3. We log the click event (billable)
 * 4. Redirect user to advertiser destination
 *
 * URL format: /v1/click/trk_abc123
 *
 * This ensures:
 * - All clicks are tracked (can't be skipped)
 * - Server-side verification (can't be faked)
 * - Real-time attribution
 * - Accurate billing
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

serve(async (req) => {
  try {
    // Extract tracking token from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const trackingToken = pathParts[pathParts.length - 1]; // Last part of path

    if (!trackingToken || !trackingToken.startsWith('trk_')) {
      return new Response('Invalid tracking token', { status: 400 });
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Look up the original decision to get ad unit info
    // tracking_token → decision_id → ad_unit_id → destination_url
    const { data: events, error: lookupError } = await supabase
      .from('events')
      .select('decision_id, unit_id, agent_id, request_id')
      .eq('tracking_token', trackingToken)
      .eq('event_type', 'impression')
      .order('occurred_at', { ascending: false })
      .limit(1);

    if (lookupError || !events || events.length === 0) {
      console.error('Tracking token not found:', trackingToken);
      // Fail gracefully - redirect to generic page
      return Response.redirect('https://attentionmarket.ai', 302);
    }

    const impression = events[0];

    // Get ad unit to find destination URL
    const { data: adUnit, error: adError } = await supabase
      .from('ad_units')
      .select('action_url, campaign_id')
      .eq('id', impression.unit_id)
      .single();

    if (adError || !adUnit) {
      console.error('Ad unit not found:', impression.unit_id);
      return Response.redirect('https://attentionmarket.ai', 302);
    }

    // Log click event (BILLABLE)
    const clickEvent = {
      event_id: `evt_${crypto.randomUUID()}`,
      occurred_at: new Date().toISOString(),
      agent_id: impression.agent_id,
      request_id: impression.request_id,
      decision_id: impression.decision_id,
      unit_id: impression.unit_id,
      event_type: 'click',
      tracking_token: trackingToken,
      metadata: {
        user_agent: req.headers.get('user-agent'),
        referer: req.headers.get('referer'),
        ip_hash: hashIP(req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip')),
      },
    };

    // Insert click event (don't wait - fire and forget for speed)
    supabase.from('events').insert(clickEvent).then(({ error }) => {
      if (error) {
        console.error('Failed to log click event:', error);
      }
    });

    // Increment click counter on ad_unit (atomic)
    supabase.rpc('increment_clicks', { unit_uuid: impression.unit_id }).then(({ error }) => {
      if (error) {
        console.error('Failed to increment clicks:', error);
      }
    });

    // Redirect to advertiser destination (FAST - don't block on DB writes)
    return Response.redirect(adUnit.action_url, 302);

  } catch (error) {
    console.error('Click redirect error:', error);
    // Fail gracefully
    return Response.redirect('https://attentionmarket.ai', 302);
  }
});

/**
 * Hash IP address for privacy (GDPR compliance)
 * We don't store raw IPs, only hashes for fraud detection
 */
function hashIP(ip: string | null): string {
  if (!ip) return 'unknown';

  // Simple hash for fraud detection without storing PII
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);

  return Array.from(data)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, 16);
}
