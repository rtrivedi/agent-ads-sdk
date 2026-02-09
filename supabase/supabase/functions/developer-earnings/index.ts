/**
 * AttentionMarket API - GET /v1/developer-earnings
 *
 * Returns earnings summary for authenticated developer
 * Used by developer dashboard to show earnings, balance, payout history
 *
 * Authentication: X-API-Key header with developer's api_key
 *
 * Returns:
 * - Current balances (pending, available, lifetime, paid_out)
 * - This month's stats
 * - Payout eligibility
 * - Recent earnings breakdown
 * - Payout history
 *
 * Deploy: supabase functions deploy developer-earnings
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { checkRateLimit, RateLimits } from '../_shared/rate-limit.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Rate limiting: 60 requests per minute per IP
  const rateLimitResponse = checkRateLimit(req, RateLimits.STATS);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate developer via X-API-Key header
    const apiKey = req.headers.get('X-API-Key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'auth_error',
          message: 'X-API-Key header required'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: developer, error: authError } = await supabase
      .from('developers')
      .select(`
        id,
        agent_id,
        agent_name,
        pending_earnings,
        available_balance,
        lifetime_earnings,
        total_paid_out,
        revenue_share_pct,
        payout_threshold,
        payout_schedule,
        last_payout_at
      `)
      .eq('api_key', apiKey)
      .single();

    if (authError || !developer) {
      return new Response(
        JSON.stringify({
          error: 'auth_error',
          message: 'Invalid API key'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get this month's stats
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: recentEarnings } = await supabase
      .from('earnings')
      .select('id, gross_amount, net_amount, occurred_at, status')
      .eq('developer_id', developer.id)
      .gte('occurred_at', thirtyDaysAgo)
      .order('occurred_at', { ascending: false })
      .limit(100);

    const clicksThisMonth = recentEarnings?.length || 0;
    const pendingThisMonth = recentEarnings
      ?.filter(e => e.status === 'pending')
      .reduce((sum, e) => sum + parseFloat(e.net_amount), 0) || 0;

    // Get detailed earnings breakdown (last 100)
    const { data: earningsBreakdown } = await supabase
      .from('earnings')
      .select(`
        id,
        gross_amount,
        platform_fee,
        net_amount,
        status,
        occurred_at,
        campaigns(id, name, advertisers(company_name))
      `)
      .eq('developer_id', developer.id)
      .order('occurred_at', { ascending: false })
      .limit(100);

    // Get payout history
    const { data: payouts } = await supabase
      .from('payouts')
      .select(`
        id,
        amount,
        currency,
        status,
        payment_method,
        transaction_id,
        period_start,
        period_end,
        click_count,
        revenue_before_share,
        platform_fee,
        initiated_at,
        completed_at
      `)
      .eq('developer_id', developer.id)
      .order('completed_at', { ascending: false })
      .limit(20);

    // Check payout eligibility
    const eligibleForPayout = parseFloat(developer.available_balance) >= parseFloat(developer.payout_threshold);

    return new Response(
      JSON.stringify({
        developer: {
          id: developer.id,
          agent_id: developer.agent_id,
          agent_name: developer.agent_name,
        },
        balances: {
          pending_earnings: parseFloat(developer.pending_earnings || 0).toFixed(2),
          available_balance: parseFloat(developer.available_balance || 0).toFixed(2),
          lifetime_earnings: parseFloat(developer.lifetime_earnings || 0).toFixed(2),
          total_paid_out: parseFloat(developer.total_paid_out || 0).toFixed(2),
          currency: 'USD'
        },
        this_month: {
          clicks: clicksThisMonth,
          pending_amount: pendingThisMonth.toFixed(2),
        },
        payout_info: {
          revenue_share_pct: parseFloat(developer.revenue_share_pct || 70),
          payout_threshold: parseFloat(developer.payout_threshold || 100).toFixed(2),
          payout_schedule: developer.payout_schedule || 'monthly',
          last_payout_at: developer.last_payout_at,
          eligible_for_payout: eligibleForPayout,
          next_payout_estimate: estimateNextPayout(developer.payout_schedule, developer.last_payout_at),
        },
        recent_earnings: earningsBreakdown?.map(e => ({
          id: e.id,
          gross_amount: parseFloat(e.gross_amount).toFixed(2),
          platform_fee: parseFloat(e.platform_fee).toFixed(2),
          net_amount: parseFloat(e.net_amount).toFixed(2),
          status: e.status,
          occurred_at: e.occurred_at,
          campaign_name: e.campaigns?.name || 'Unknown',
          advertiser: e.campaigns?.advertisers?.company_name || 'Unknown',
        })) || [],
        payouts: payouts?.map(p => ({
          id: p.id,
          amount: parseFloat(p.amount).toFixed(2),
          currency: p.currency,
          status: p.status,
          payment_method: p.payment_method,
          transaction_id: p.transaction_id,
          period: {
            start: p.period_start,
            end: p.period_end,
          },
          stats: {
            clicks: p.click_count,
            revenue_before_share: parseFloat(p.revenue_before_share || 0).toFixed(2),
            platform_fee: parseFloat(p.platform_fee || 0).toFixed(2),
          },
          completed_at: p.completed_at,
        })) || []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Developer earnings error:', error);
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

function estimateNextPayout(schedule: string, lastPayoutAt: string | null): string | null {
  if (!lastPayoutAt) return null;

  const lastPayout = new Date(lastPayoutAt);
  let nextPayout: Date;

  switch (schedule) {
    case 'weekly':
      nextPayout = new Date(lastPayout.getTime() + 7 * 24 * 60 * 60 * 1000);
      break;
    case 'monthly':
      nextPayout = new Date(lastPayout);
      nextPayout.setMonth(nextPayout.getMonth() + 1);
      break;
    case 'manual':
      return null;
    default:
      return null;
  }

  return nextPayout.toISOString();
}
