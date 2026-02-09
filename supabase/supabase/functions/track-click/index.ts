/**
 * AttentionMarket API - GET /track-click/:token
 *
 * Click tracking redirect service for environments where developers
 * can't call trackClick() directly (chatbots, WhatsApp, SMS, etc.)
 *
 * Flow:
 * 1. User clicks tracking URL: https://track.attentionmarket.ai/c/{token}
 * 2. We decode token, validate, record click
 * 3. Redirect user to advertiser's site
 *
 * Deploy: supabase functions deploy track-click
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { validateTrackingToken } from '../_shared/tracking-token.ts';
import { checkRateLimit, RateLimits } from '../_shared/rate-limit.ts';

serve(async (req) => {
  // Rate limiting: prevent spam
  const rateLimitResponse = checkRateLimit(req, RateLimits.DECIDE);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const url = new URL(req.url);
    const token = url.pathname.split('/').pop();

    if (!token) {
      return new Response('Invalid tracking URL', { status: 400 });
    }

    // Validate and decode tracking token (throws on invalid/expired)
    let payload;
    try {
      payload = await validateTrackingToken(token);
    } catch (error) {
      console.error('[TrackClick] Token validation failed:', error.message);
      // Graceful degradation: redirect to homepage instead of advertiser
      return new Response('', {
        status: 302,
        headers: {
          'Location': 'https://attentionmarket.ai',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });
    }

    const { u: unit_id, a: agent_id } = payload;

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get ad unit and campaign info
    const { data: adUnit, error: adError } = await supabase
      .from('ad_units')
      .select('id, campaign_id, action_url, campaigns!inner(bid_cpc, status, budget_spent, budget)')
      .eq('id', unit_id)
      .single();

    if (adError || !adUnit) {
      console.error('[TrackClick] Ad unit not found:', unit_id);
      return new Response('', {
        status: 302,
        headers: {
          'Location': 'https://attentionmarket.ai',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });
    }

    const campaign = adUnit.campaigns;
    const href = adUnit.action_url;

    // Check campaign is active and has budget
    if (campaign.status !== 'active') {
      console.warn('[TrackClick] Campaign not active:', adUnit.campaign_id);
      return new Response('', {
        status: 302,
        headers: {
          'Location': href,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });
    }

    if (parseFloat(campaign.budget_spent) >= parseFloat(campaign.budget)) {
      console.warn('[TrackClick] Campaign budget exhausted:', adUnit.campaign_id);
      return new Response('', {
        status: 302,
        headers: {
          'Location': href,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });
    }

    // Generate event ID
    const event_id = `evt_${crypto.randomUUID()}`;
    const occurred_at = new Date().toISOString();

    // Extract optional click context from query params
    const click_context = url.searchParams.get('ctx');

    // CRITICAL PATH: Increment campaign budget FIRST (atomic operation)
    const bidAmount = parseFloat(campaign.bid_cpc);
    if (bidAmount > 0) {
      const { error: budgetError } = await supabase.rpc('increment_campaign_budget', {
        p_campaign_id: adUnit.campaign_id,
        p_amount: bidAmount,
      });

      if (budgetError) {
        console.error('[TrackClick] CRITICAL: Failed to increment budget:', budgetError);
        // Don't track click if we can't charge advertiser
        return new Response('Service temporarily unavailable. Please try again.', {
          status: 503,
          headers: {
            'Retry-After': '60',
            'Cache-Control': 'no-cache',
          }
        });
      }
    }

    // Budget charged successfully - now record the click event
    const { error: insertError } = await supabase.from('events').insert({
      event_id,
      event_type: 'click',
      occurred_at,
      agent_id,
      request_id: null, // Not available in tracking URL (simplified)
      decision_id: null, // Not available in tracking URL (simplified)
      ad_unit_id: unit_id,
      campaign_id: adUnit.campaign_id,
      tracking_token: token,
      click_context,
      metadata: {
        href,
        user_agent: req.headers.get('user-agent'),
        referer: req.headers.get('referer'),
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      }
    });

    if (insertError) {
      console.error('[TrackClick] Failed to insert event (budget already charged):', insertError);
      // We charged budget but couldn't record event - this is bad but rare
      // Continue with redirect (developer will get credit during reconciliation if event exists)
    }

    // Increment click counter (fire and forget - not critical)
    supabase.rpc('increment_clicks', { unit_uuid: unit_id }).catch(err => {
      console.error('[TrackClick] Failed to increment click counter:', err);
    });

    // Redirect to advertiser site
    return new Response('', {
      status: 302,
      headers: {
        'Location': href,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });

  } catch (error) {
    console.error('[TrackClick] Unexpected error:', error);
    return new Response('Internal error', { status: 500 });
  }
});
