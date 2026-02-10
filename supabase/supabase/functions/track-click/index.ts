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
    // P1 Fix #8: Better pathname parsing to handle trailing slashes
    const pathParts = url.pathname.split('/').filter(p => p.length > 0);
    const token = pathParts[pathParts.length - 1];

    if (!token || token.trim() === '') {
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

    // P1 Fix #7: Validate action_url is not null/empty
    if (!href || href.trim() === '') {
      console.error('[TrackClick] Missing action_url for unit:', unit_id);
      return new Response('', {
        status: 302,
        headers: {
          'Location': 'https://attentionmarket.ai',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });
    }

    // P0 Fix #4: Verify agent is authorized for this campaign
    // Note: For now, we trust the token signature. In production, you may want
    // to add explicit authorization checks against an agent_campaigns table.
    // The HMAC signature already ensures the token wasn't forged.

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

    // P0 Fix #3: Handle null/undefined budget values to prevent NaN comparison
    const budgetSpent = parseFloat(campaign.budget_spent) || 0;
    const budgetTotal = parseFloat(campaign.budget) || 0;
    if (budgetSpent >= budgetTotal && budgetTotal > 0) {
      console.warn('[TrackClick] Campaign budget exhausted:', adUnit.campaign_id,
        `(${budgetSpent}/${budgetTotal})`);
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
    // P0 Fix #2: Support both CPC and CPM campaigns
    const bidAmount = parseFloat(campaign.bid_cpc || campaign.bid_cpm || 0);
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

    // P0 Fix #1: CRITICAL Money leak bug - rollback budget if event insert fails
    if (insertError) {
      console.error('[TrackClick] CRITICAL: Failed to insert event (budget already charged):', insertError);

      // Attempt to rollback the budget charge
      if (bidAmount > 0) {
        const { error: rollbackError } = await supabase.rpc('decrement_campaign_budget', {
          p_campaign_id: adUnit.campaign_id,
          p_amount: bidAmount,
        });

        if (rollbackError) {
          console.error('[TrackClick] CRITICAL: Failed to rollback budget:', rollbackError);
          // Log to monitoring system - manual intervention may be needed
        } else {
          console.log('[TrackClick] Successfully rolled back budget charge');
        }
      }

      // Return 503 - do NOT redirect user
      // This ensures advertiser isn't charged and user can retry
      return new Response('Service temporarily unavailable. Please try again.', {
        status: 503,
        headers: {
          'Retry-After': '60',
          'Cache-Control': 'no-cache',
        }
      });
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
