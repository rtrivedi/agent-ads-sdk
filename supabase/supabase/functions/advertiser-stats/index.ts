/**
 * AttentionMarket API - GET /v1/advertiser-stats
 *
 * Returns campaign performance metrics for authenticated advertiser
 * Used by advertiser dashboard to show spend, impressions, clicks, ROI
 *
 * Query params:
 * - campaign_id (optional): Filter by specific campaign
 * - period (optional): 'today' | '7d' | '30d' | '90d' | 'all'
 *
 * Returns:
 * - Total spend, budget remaining
 * - Impressions, clicks, conversions
 * - CTR, CVR, Cost per click/conversion
 * - Campaign breakdown
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { checkRateLimit, RateLimits } from '../_shared/rate-limit.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-advertiser-key',
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

    // Parse query params first
    const url = new URL(req.url);
    const advertiser_id = url.searchParams.get('advertiser_id');
    const campaign_id = url.searchParams.get('campaign_id');
    const period = url.searchParams.get('period') || '30d';

    // Authenticate advertiser (support two methods)
    let advertiser;

    if (advertiser_id) {
      // Method 1: advertiser_id query param (for Lovable UI after login)
      const { data } = await supabase
        .from('advertisers')
        .select('id, company_name, status, wallet_balance')
        .eq('id', advertiser_id)
        .single();
      advertiser = data;
    } else {
      // Method 2: X-Advertiser-Key header (for programmatic API)
      const advertiserKey = req.headers.get('X-Advertiser-Key');
      if (!advertiserKey) {
        return new Response(
          JSON.stringify({
            error: 'auth_error',
            message: 'Must provide advertiser_id query param or X-Advertiser-Key header'
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data } = await supabase
        .from('advertisers')
        .select('id, company_name, status, wallet_balance')
        .eq('api_key', advertiserKey)
        .single();
      advertiser = data;
    }

    if (!advertiser) {
      return new Response(
        JSON.stringify({
          error: 'auth_error',
          message: 'Advertiser not found'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { start_date, end_date } = getDateRange(period);

    // Get campaigns
    let campaignsQuery = supabase
      .from('campaigns')
      .select('id, name, budget, budget_spent, bid_cpm, bid_cpc, status, created_at')
      .eq('advertiser_id', advertiser.id);

    if (campaign_id) {
      campaignsQuery = campaignsQuery.eq('id', campaign_id);
    }

    const { data: campaigns, error: campaignsError } = await campaignsQuery;

    if (campaignsError) {
      throw campaignsError;
    }

    // Get ad units for these campaigns
    const campaignIds = campaigns?.map(c => c.id) || [];

    const { data: adUnits } = await supabase
      .from('ad_units')
      .select('id, campaign_id')
      .in('campaign_id', campaignIds)
      .limit(1000); // Safety limit

    const unitIds = adUnits?.map(u => u.id) || [];

    // Get events for these ad units with safety limit
    const { data: events } = await supabase
      .from('events')
      .select('event_type, unit_id, occurred_at')
      .in('unit_id', unitIds)
      .gte('occurred_at', start_date)
      .lte('occurred_at', end_date)
      .limit(100000); // Safety limit - prevent unbounded query

    // Calculate metrics
    const impressions = events?.filter(e => e.event_type === 'impression').length || 0;
    const clicks = events?.filter(e => e.event_type === 'click').length || 0;
    const conversions = events?.filter(e => e.event_type === 'conversion').length || 0;

    // Calculate spend (simplified - actual billing would be more complex)
    const totalBudget = campaigns?.reduce((sum, c) => sum + parseFloat(c.budget || 0), 0) || 0;
    const totalSpent = campaigns?.reduce((sum, c) => sum + parseFloat(c.budget_spent || 0), 0) || 0;

    // Calculate costs based on pricing model
    let cpmCost = 0;
    let cpcCost = 0;

    campaigns?.forEach(campaign => {
      const campaignAdUnits = adUnits?.filter(u => u.campaign_id === campaign.id) || [];
      const campaignUnitIds = campaignAdUnits.map(u => u.id);
      const campaignImpressions = events?.filter(e =>
        e.event_type === 'impression' && campaignUnitIds.includes(e.unit_id)
      ).length || 0;
      const campaignClicks = events?.filter(e =>
        e.event_type === 'click' && campaignUnitIds.includes(e.unit_id)
      ).length || 0;

      if (campaign.bid_cpm) {
        cpmCost += (campaignImpressions / 1000) * parseFloat(campaign.bid_cpm);
      }
      if (campaign.bid_cpc) {
        cpcCost += campaignClicks * parseFloat(campaign.bid_cpc);
      }
    });

    const estimatedSpend = cpmCost + cpcCost;

    return new Response(
      JSON.stringify({
        advertiser_id: advertiser.id,
        company_name: advertiser.company_name,
        wallet_balance: parseFloat(advertiser.wallet_balance || 0),
        period: {
          start: start_date,
          end: end_date,
          label: period
        },
        budget: {
          total: totalBudget,
          spent: estimatedSpend,
          remaining: totalBudget - estimatedSpend,
          currency: 'USD'
        },
        metrics: {
          impressions,
          clicks,
          conversions,
          ctr: impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00',
          cvr: clicks > 0 ? ((conversions / clicks) * 100).toFixed(2) : '0.00',
          cost_per_click: clicks > 0 ? (estimatedSpend / clicks).toFixed(2) : '0.00',
          cost_per_conversion: conversions > 0 ? (estimatedSpend / conversions).toFixed(2) : '0.00',
        },
        spend_breakdown: {
          cpm_spend: cpmCost.toFixed(2),
          cpc_spend: cpcCost.toFixed(2),
          total: estimatedSpend.toFixed(2)
        },
        campaigns: campaigns?.map(c => {
          const campaignAdUnits = adUnits?.filter(u => u.campaign_id === c.id) || [];
          const campaignUnitIds = campaignAdUnits.map(u => u.id);
          const campImpressions = events?.filter(e =>
            e.event_type === 'impression' && campaignUnitIds.includes(e.unit_id)
          ).length || 0;
          const campClicks = events?.filter(e =>
            e.event_type === 'click' && campaignUnitIds.includes(e.unit_id)
          ).length || 0;

          return {
            campaign_id: c.id,
            name: c.name,
            status: c.status,
            budget: parseFloat(c.budget),
            spent: parseFloat(c.budget_spent || 0),
            impressions: campImpressions,
            clicks: campClicks,
            ctr: campImpressions > 0 ? ((campClicks / campImpressions) * 100).toFixed(2) : '0.00',
          };
        }) || []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Advertiser stats error:', error);
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
