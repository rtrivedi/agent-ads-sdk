#!/usr/bin/env tsx
/**
 * Admin CLI for AttentionMarket Platform Monitoring
 *
 * Usage:
 *   tsx scripts/admin-cli.ts health        - System health overview
 *   tsx scripts/admin-cli.ts financial     - Financial metrics
 *   tsx scripts/admin-cli.ts campaigns     - Campaign analytics
 *   tsx scripts/admin-cli.ts fraud         - Fraud detection
 *   tsx scripts/admin-cli.ts activity      - Recent activity
 *   tsx scripts/admin-cli.ts all           - Complete dashboard
 */

const SUPABASE_URL = 'https://peruwnbrqkvmrldhpoom.supabase.co';
const ADMIN_KEY = process.env.ADMIN_KEY || 'am_admin_secret_key_2026';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: amount < 1 ? 4 : 2,
  }).format(amount || 0);
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return (num || 0).toLocaleString();
}

function formatPercent(num: number): string {
  return (num || 0).toFixed(1) + '%';
}

async function fetchMetrics(endpoint: string = 'all') {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-analytics/${endpoint}`, {
      headers: {
        'x-admin-key': ADMIN_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`${colors.red}❌ Failed to fetch metrics:${colors.reset}`, error.message);
    process.exit(1);
  }
}

function printHealth(health: any) {
  console.log(`\n${colors.bright}${colors.cyan}━━━ SYSTEM HEALTH ━━━${colors.reset}\n`);

  // Key metrics
  console.log(`${colors.bright}Active Campaigns:${colors.reset}    ${formatNumber(health.active_campaigns)}`);
  console.log(`${colors.bright}Active Advertisers:${colors.reset}  ${formatNumber(health.active_advertisers)}`);
  console.log(`${colors.bright}Active Agents (24h):${colors.reset} ${formatNumber(health.active_agents_24h)}`);
  console.log(`${colors.bright}Active Developers:${colors.reset}   ${formatNumber(health.active_developers)}`);

  console.log(`\n${colors.bright}Today's Activity:${colors.reset}`);
  console.log(`  Decisions:    ${formatNumber(health.decisions_today)}`);
  console.log(`  Impressions:  ${formatNumber(health.impressions_today)}`);
  console.log(`  Clicks:       ${formatNumber(health.clicks_today)}`);
  console.log(`  Revenue:      ${formatCurrency(health.revenue_today)}`);

  // Performance indicators
  const fillRateColor = health.fill_rate > 80 ? colors.green : health.fill_rate > 50 ? colors.yellow : colors.red;
  const ctrColor = health.ctr > 2 ? colors.green : health.ctr > 1 ? colors.yellow : colors.red;

  console.log(`\n${colors.bright}Performance:${colors.reset}`);
  console.log(`  Fill Rate:    ${fillRateColor}${formatPercent(health.fill_rate)}${colors.reset} (target: >80%)`);
  console.log(`  CTR:          ${ctrColor}${formatPercent(health.ctr)}${colors.reset} (target: >2%)`);
  console.log(`  Decisions/hr: ${formatNumber(health.decisions_per_hour)}`);

  if (health.errors_today > 0) {
    console.log(`\n${colors.red}⚠️  Errors today: ${health.errors_today}${colors.reset}`);
  }
}

function printFinancial(financial: any) {
  if (!financial || !financial.summary) return;

  console.log(`\n${colors.bright}${colors.green}━━━ FINANCIAL METRICS (30 DAYS) ━━━${colors.reset}\n`);

  const summary = financial.summary;
  console.log(`${colors.bright}Revenue:${colors.reset}`);
  console.log(`  Total:              ${formatCurrency(summary.total_revenue_30d)}`);
  console.log(`  Developer Earnings: ${formatCurrency(summary.total_developer_earnings_30d)} (70%)`);
  console.log(`  Platform Fees:      ${formatCurrency(summary.total_platform_fees_30d)} (30%)`);

  console.log(`\n${colors.bright}Advertiser Budgets:${colors.reset}`);
  console.log(`  Active Daily:       ${formatCurrency(summary.total_advertiser_budget)}`);
  console.log(`  Total Spent:        ${formatCurrency(summary.total_spent_all_time)}`);

  // Top advertisers
  if (financial.top_advertisers?.length > 0) {
    console.log(`\n${colors.bright}Top Advertisers:${colors.reset}`);
    financial.top_advertisers.slice(0, 5).forEach((adv: any) => {
      console.log(`  ${adv.advertiser_name}: ${formatCurrency(adv.total_spent)} spent`);
    });
  }

  // Top developers
  if (financial.top_developers?.length > 0) {
    console.log(`\n${colors.bright}Top Earning Developers:${colors.reset}`);
    financial.top_developers.slice(0, 5).forEach((dev: any) => {
      console.log(`  ${dev.agent_id}: ${formatCurrency(dev.total_earned)} earned`);
    });
  }
}

function printCampaigns(campaigns: any) {
  if (!campaigns) return;

  console.log(`\n${colors.bright}${colors.blue}━━━ CAMPAIGN ANALYTICS ━━━${colors.reset}\n`);

  console.log(`Total Active Campaigns: ${campaigns.total_active}`);
  console.log(`New (7 days):          ${campaigns.new_campaigns_7d}`);
  console.log(`Paused (7 days):       ${campaigns.paused_campaigns_7d}`);

  // Campaigns near budget limit
  if (campaigns.campaigns_near_budget_limit?.length > 0) {
    console.log(`\n${colors.yellow}⚠️  Campaigns Near Budget Limit:${colors.reset}`);
    campaigns.campaigns_near_budget_limit.slice(0, 5).forEach((c: any) => {
      const color = c.budget_used_pct > 95 ? colors.red : colors.yellow;
      console.log(`  ${color}${c.name}: ${formatPercent(c.budget_used_pct)} used${colors.reset}`);
    });
  }

  // High performing
  if (campaigns.high_performing_campaigns?.length > 0) {
    console.log(`\n${colors.green}🌟 High Performing:${colors.reset}`);
    campaigns.high_performing_campaigns.slice(0, 5).forEach((c: any) => {
      console.log(`  ${c.name}: ${formatPercent(c.ctr)} CTR (${c.clicks} clicks)`);
    });
  }

  // Low performing
  if (campaigns.low_performing_campaigns?.length > 0) {
    console.log(`\n${colors.red}📉 Low Performing:${colors.reset}`);
    campaigns.low_performing_campaigns.slice(0, 3).forEach((c: any) => {
      console.log(`  ${c.name}: ${formatPercent(c.ctr)} CTR (${c.impressions} impressions)`);
    });
  }
}

function printFraud(fraud: any) {
  if (!fraud) return;

  console.log(`\n${colors.bright}${colors.red}━━━ FRAUD DETECTION ━━━${colors.reset}\n`);

  let fraudDetected = false;

  // High velocity clickers
  if (fraud.high_velocity_clickers?.length > 0) {
    fraudDetected = true;
    console.log(`${colors.red}🚨 High Velocity Clickers:${colors.reset}`);
    fraud.high_velocity_clickers.slice(0, 5).forEach((agent: any) => {
      console.log(`  Agent ${agent.agent_id}: ${agent.clicks_per_minute} clicks/min`);
    });
  }

  // 100% CTR
  if (fraud.suspicious_100pct_ctr?.length > 0) {
    fraudDetected = true;
    console.log(`\n${colors.yellow}⚠️  Agents with 100% CTR:${colors.reset}`);
    fraud.suspicious_100pct_ctr.slice(0, 5).forEach((agent: any) => {
      console.log(`  Agent ${agent.agent_id}: ${agent.clicks}/${agent.impressions} clicks`);
    });
  }

  // Rate limit violations
  if (fraud.rate_limit_violations?.length > 0) {
    fraudDetected = true;
    console.log(`\n${colors.yellow}⚠️  Rate Limit Violations:${colors.reset}`);
    fraud.rate_limit_violations.slice(0, 5).forEach((violation: any) => {
      console.log(`  ${violation.rate_key}: ${violation.violation_count} violations`);
    });
  }

  if (!fraudDetected) {
    console.log(`${colors.green}✅ No fraud indicators detected${colors.reset}`);
  }
}

function printActivity(activity: any) {
  if (!activity || !activity.recent_events) return;

  console.log(`\n${colors.bright}${colors.cyan}━━━ RECENT ACTIVITY ━━━${colors.reset}\n`);

  activity.recent_events.slice(0, 10).forEach((event: any) => {
    const time = new Date(event.created_at).toLocaleTimeString();
    const typeColor =
      event.event_type === 'click' ? colors.blue :
      event.event_type === 'impression' ? colors.green :
      event.event_type === 'conversion' ? colors.yellow :
      colors.gray;

    console.log(
      `${colors.gray}${time}${colors.reset} ` +
      `${typeColor}${event.event_type}${colors.reset} ` +
      `${event.campaign_name || 'Unknown'} ` +
      `${event.amount ? formatCurrency(event.amount) : ''}`
    );
  });
}

async function main() {
  const command = process.argv[2] || 'health';

  console.log(`${colors.bright}\n🎯 AttentionMarket Admin CLI${colors.reset}`);
  console.log(`${colors.gray}Fetching ${command} metrics...${colors.reset}`);

  const startTime = Date.now();
  const data = await fetchMetrics(command);
  const loadTime = Date.now() - startTime;

  switch (command) {
    case 'health':
      printHealth(data);
      break;

    case 'financial':
      printFinancial(data);
      break;

    case 'campaigns':
      printCampaigns(data);
      break;

    case 'fraud':
      printFraud(data);
      break;

    case 'activity':
      printActivity(data);
      break;

    case 'all':
      if (data.health) printHealth(data.health);
      if (data.financial) printFinancial(data.financial);
      if (data.campaigns) printCampaigns(data.campaigns);
      if (data.fraud) printFraud(data.fraud);
      if (data.activity) printActivity(data.activity);
      break;

    default:
      console.error(`${colors.red}Unknown command: ${command}${colors.reset}`);
      console.log('\nAvailable commands:');
      console.log('  health     - System health overview');
      console.log('  financial  - Financial metrics');
      console.log('  campaigns  - Campaign analytics');
      console.log('  fraud      - Fraud detection');
      console.log('  activity   - Recent activity');
      console.log('  all        - Complete dashboard');
      process.exit(1);
  }

  console.log(`\n${colors.gray}Load time: ${loadTime}ms${colors.reset}\n`);
}

// Run the CLI
main().catch(console.error);