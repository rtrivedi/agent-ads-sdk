# 🎯 AttentionMarket Admin Dashboard Guide

## Overview

The admin dashboard provides comprehensive monitoring and analytics for your AttentionMarket platform. It includes real-time metrics, financial reconciliation, fraud detection, and campaign performance tracking.

---

## Quick Start

### 1. Deploy the Admin Analytics Function

```bash
# Deploy the edge function
supabase functions deploy admin-analytics

# Apply the database migrations
supabase db push
```

### 2. Set Your Admin Key

For security, create a unique admin key:

```bash
# Generate a secure admin key
openssl rand -hex 32

# Add it to Supabase secrets
# Go to: Dashboard → Settings → Edge Functions → Secrets
# Add: ADMIN_KEY = [your generated key]
```

### 3. Access the Dashboard

#### **Web Dashboard**
Open `admin-dashboard.html` in your browser and update the admin key:

```javascript
// Line 290 in admin-dashboard.html
const ADMIN_KEY = 'your_admin_key_here';
```

#### **Command Line Interface**
```bash
# Set your admin key
export ADMIN_KEY="your_admin_key_here"

# View system health
tsx scripts/admin-cli.ts health

# View all metrics
tsx scripts/admin-cli.ts all
```

---

## Dashboard Sections

### 📊 System Health
Real-time overview of platform status:
- **Active Campaigns**: Currently running ad campaigns
- **Today's Revenue**: Total revenue generated today
- **Fill Rate**: Percentage of ad requests filled (target: >80%)
- **Click Rate (CTR)**: Click-through rate (industry avg: 2-3%)
- **Decisions/Hour**: Ad serving request rate
- **Active Agents**: Unique agents in last 24 hours

**What to Watch:**
- Fill rate below 50% indicates inventory issues
- CTR below 0.5% suggests targeting problems
- Sudden drops in decisions/hour may indicate API issues

### 💰 Financial Overview
30-day financial metrics and reconciliation:
- **Total Revenue**: Gross platform revenue
- **Developer Earnings**: 70% revenue share to developers
- **Platform Fees**: 30% platform commission
- **Active Budget**: Total daily budget across all campaigns
- **Top Advertisers**: Highest spending advertisers
- **Top Developers**: Highest earning developers

**Key Insights:**
- Monitor advertiser concentration (avoid over-dependence)
- Track developer earnings distribution
- Verify 70/30 split is maintained

### 📈 Campaign Performance
Campaign health and optimization opportunities:
- **Campaigns Near Budget**: Campaigns >80% spent (may pause soon)
- **High Performing**: Best CTR campaigns
- **Low Performing**: Campaigns with CTR <0.5%
- **New Campaigns**: Recently launched (last 7 days)

**Action Items:**
- Contact advertisers near budget limits
- Pause/optimize low-performing campaigns
- Celebrate high performers with advertisers

### 🚨 Fraud Detection
Automated fraud and anomaly detection:
- **High Velocity Clickers**: Agents with suspicious click rates
- **100% CTR Agents**: Every impression becomes a click
- **Rate Limit Violations**: Excessive API usage
- **HMAC Failures**: Invalid click tracking attempts

**Response Protocol:**
1. Investigate flagged agents
2. Review click patterns
3. Consider blocking suspicious agents
4. Notify affected advertisers if fraud confirmed

### ⚡ Real-time Activity
Live feed of platform events:
- Impressions (green)
- Clicks (blue)
- Conversions (yellow)
- Errors (red)

**Usage:**
- Monitor during campaign launches
- Debug integration issues
- Verify tracking is working

### 🚀 API Performance
System reliability metrics:
- **Current QPS**: Queries per second
- **24h Fill Rate**: Overall ad inventory availability
- **Endpoint Statistics**: Success rates by endpoint
- **Hourly Breakdown**: Traffic patterns

**Thresholds:**
- QPS: Can handle up to 100 QPS per agent
- Fill Rate: Should stay above 80%
- Success Rate: Should be >99% for all endpoints

---

## Admin CLI Commands

Quick command-line access to metrics:

```bash
# System health check
tsx scripts/admin-cli.ts health

# Financial metrics (30-day)
tsx scripts/admin-cli.ts financial

# Campaign performance
tsx scripts/admin-cli.ts campaigns

# Fraud detection
tsx scripts/admin-cli.ts fraud

# Recent activity (last 50 events)
tsx scripts/admin-cli.ts activity

# Complete dashboard dump
tsx scripts/admin-cli.ts all
```

### CLI Environment Variables
```bash
export ADMIN_KEY="your_admin_key"  # Your admin API key
```

---

## Monitoring Best Practices

### Daily Checks (5 minutes)
1. Review System Health section
2. Check for fraud warnings
3. Verify fill rate >80%
4. Look for campaigns near budget

### Weekly Review (30 minutes)
1. Financial reconciliation
2. Campaign performance analysis
3. Developer earnings distribution
4. API performance trends

### Monthly Analysis (1 hour)
1. Top advertiser/developer changes
2. Platform growth metrics
3. Fraud pattern analysis
4. System capacity planning

---

## Alert Thresholds

Set up alerts for these critical metrics:

| Metric | Warning | Critical |
|--------|---------|----------|
| Fill Rate | <70% | <50% |
| CTR | <0.5% | <0.1% |
| Errors/Hour | >10 | >100 |
| QPS Drop | -50% | -75% |
| Revenue Drop | -30% | -50% |
| Fraud Indicators | >5 | >10 |

---

## SQL Queries for Deep Dives

### Revenue by Hour (Last 24h)
```sql
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as clicks,
  SUM(bid_cpc) as revenue
FROM events e
JOIN campaigns c ON c.id = e.campaign_id
WHERE e.event_type = 'click'
  AND e.created_at > NOW() - INTERVAL '24 hours'
GROUP BY 1
ORDER BY 1 DESC;
```

### Campaign ROI Analysis
```sql
SELECT
  c.name,
  c.budget_spent,
  COUNT(DISTINCT e.id) as total_events,
  SUM(CASE WHEN e.event_type = 'conversion' THEN 1 ELSE 0 END) as conversions,
  c.budget_spent / NULLIF(SUM(CASE WHEN e.event_type = 'conversion' THEN 1 ELSE 0 END), 0) as cost_per_conversion
FROM campaigns c
LEFT JOIN events e ON e.campaign_id = c.id
GROUP BY c.id, c.name, c.budget_spent
ORDER BY conversions DESC;
```

### Agent Quality Score
```sql
SELECT
  agent_id,
  COUNT(CASE WHEN event_type = 'impression' THEN 1 END) as impressions,
  COUNT(CASE WHEN event_type = 'click' THEN 1 END) as clicks,
  COUNT(CASE WHEN event_type = 'conversion' THEN 1 END) as conversions,
  ROUND(100.0 * COUNT(CASE WHEN event_type = 'click' THEN 1 END) /
        NULLIF(COUNT(CASE WHEN event_type = 'impression' THEN 1 END), 0), 2) as ctr,
  ROUND(100.0 * COUNT(CASE WHEN event_type = 'conversion' THEN 1 END) /
        NULLIF(COUNT(CASE WHEN event_type = 'click' THEN 1 END), 0), 2) as conversion_rate
FROM events
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY agent_id
HAVING COUNT(*) > 100  -- Significant traffic only
ORDER BY ctr DESC;
```

---

## Troubleshooting

### Dashboard Won't Load
1. Check admin-analytics function is deployed
2. Verify ADMIN_KEY is correct
3. Check browser console for CORS errors
4. Ensure Supabase project is running

### Metrics Look Wrong
1. Check timezone settings (uses UTC)
2. Verify migrations were applied
3. Run `SELECT get_system_health()` directly in SQL
4. Check for NULL values in campaigns table

### High Fraud Indicators
1. Review agent patterns over time
2. Check for testing/development agents
3. Verify HMAC secret is configured
4. Consider implementing IP-based rate limiting

---

## Security Notes

1. **Never expose admin key in client code** for production
2. **Rotate admin keys** every 90 days
3. **Limit admin access** to specific IP ranges if possible
4. **Log all admin access** for audit trail
5. **Use HTTPS only** for dashboard access

---

## Next Steps

1. **Set up automated alerts** using Supabase webhooks
2. **Create custom reports** for advertisers
3. **Build developer dashboard** with their specific metrics
4. **Implement data export** for accounting
5. **Add predictive analytics** for budget forecasting

---

**Support:** For issues or questions, check the logs in Supabase Dashboard → Functions → Logs