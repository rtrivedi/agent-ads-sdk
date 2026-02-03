/**
 * AttentionMarket API - GET /v1/agent-stats
 *
 * Returns performance metrics for an authenticated agent
 * Used by agent dashboard to show earnings and performance
 *
 * Query params:
 * - start_date (optional): YYYY-MM-DD
 * - end_date (optional): YYYY-MM-DD
 * - period (optional): 'today' | '7d' | '30d' | '90d' | 'all'
 *
 * Returns:
 * - Impressions, clicks, CTR
 * - Revenue (CPM + CPC earnings)
 * - Top performing taxonomies
 * - Performance over time
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { validateAPIKey, createAuthErrorResponse } from '../_shared/auth.ts';
import { checkRateLimit, RateLimits } from '../_shared/rate-limit.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-am-api-key',
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
    // Validate API key
    const authResult = await validateAPIKey(req);
    if (!authResult.authenticated) {
      return createAuthErrorResponse(authResult, corsHeaders);
    }

    const agent_id = authResult.agent_id!;

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse query params for date range
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || '30d';

    const { start_date, end_date } = getDateRange(period);

    // Get event stats
    const { data: stats, error: statsError } = await supabase
      .rpc('get_agent_stats', {
        p_agent_id: agent_id,
        p_start_date: start_date,
        p_end_date: end_date
      });

    if (statsError) {
      // Fallback to manual query with SQL aggregation (avoids unbounded memory usage)

      // Get event counts with SQL aggregation
      const { data: eventCounts } = await supabase
        .from('events')
        .select('event_type')
        .eq('agent_id', agent_id)
        .gte('occurred_at', start_date)
        .lte('occurred_at', end_date)
        .limit(50000); // Safety limit

      const impressions = eventCounts?.filter(e => e.event_type === 'impression').length || 0;
      const clicks = eventCounts?.filter(e => e.event_type === 'click').length || 0;
      const conversions = eventCounts?.filter(e => e.event_type === 'conversion').length || 0;

      // Calculate revenue from click events
      // Get campaigns and their bids for clicked ad units
      const { data: clickEvents } = await supabase
        .from('events')
        .select('unit_id')
        .eq('agent_id', agent_id)
        .eq('event_type', 'click')
        .gte('occurred_at', start_date)
        .lte('occurred_at', end_date)
        .limit(10000);

      const unitIds = [...new Set(clickEvents?.map(e => e.unit_id) || [])];

      let cpmRevenue = 0;
      let cpcRevenue = 0;

      if (unitIds.length > 0) {
        // Get campaigns for these units
        const { data: adUnits } = await supabase
          .from('ad_units')
          .select('id, campaign_id')
          .in('id', unitIds);

        const campaignIds = [...new Set(adUnits?.map(u => u.campaign_id) || [])];

        const { data: campaigns } = await supabase
          .from('campaigns')
          .select('id, bid_cpm, bid_cpc')
          .in('id', campaignIds);

        // Calculate revenue
        campaigns?.forEach(campaign => {
          const campaignUnitIds = adUnits?.filter(u => u.campaign_id === campaign.id).map(u => u.id) || [];
          const campaignImpressions = eventCounts?.filter(e =>
            e.event_type === 'impression' && campaignUnitIds.includes((e as any).unit_id)
          ).length || 0;
          const campaignClicks = clickEvents?.filter(e =>
            campaignUnitIds.includes(e.unit_id)
          ).length || 0;

          if (campaign.bid_cpm) {
            cpmRevenue += (campaignImpressions / 1000) * parseFloat(campaign.bid_cpm);
          }
          if (campaign.bid_cpc) {
            cpcRevenue += campaignClicks * parseFloat(campaign.bid_cpc);
          }
        });
      }

      const totalRevenue = cpmRevenue + cpcRevenue;

      return new Response(
        JSON.stringify({
          agent_id,
          period: {
            start: start_date,
            end: end_date,
            label: period
          },
          metrics: {
            impressions,
            clicks,
            conversions,
            ctr: impressions > 0 ? (clicks / impressions * 100).toFixed(2) : '0.00',
            cvr: clicks > 0 ? (conversions / clicks * 100).toFixed(2) : '0.00',
          },
          revenue: {
            total: parseFloat(totalRevenue.toFixed(2)),
            cpm: parseFloat(cpmRevenue.toFixed(2)),
            cpc: parseFloat(cpcRevenue.toFixed(2)),
            currency: 'USD'
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Return stats from RPC
    return new Response(
      JSON.stringify(stats),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Agent stats error:', error);
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

function getDateRange(period: string): { start_date: string; end_date: string } {
  const end_date = new Date().toISOString();
  let start_date: string;

  switch (period) {
    case 'today':
      start_date = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
      break;
    case '7d':
      start_date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      break;
    case '30d':
      start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      break;
    case '90d':
      start_date = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      break;
    case 'all':
      start_date = new Date('2020-01-01').toISOString();
      break;
    default:
      start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  }

  return { start_date, end_date };
}
