---
sidebar_position: 8
title: Quality Score & Relevance Explained
---

# Understanding Quality Score & Relevance

Simple, straightforward explanation of how we calculate your ad performance metrics.

## Your Quality Score

**Your Quality Score is like a credit score for your ads.** It starts at 50% and updates daily based on how users respond to your ads.

### What Makes Your Score Go Up 📈

- **People click your ads** - If 10% of people click instead of 5%, your score improves
- **People complete actions** - When someone who clicked actually signs up or buys
- **Your landing page loads fast** - Under 2 seconds is good
- **Your ad matches what users want** - Relevant ads get clicked more

### What Makes Your Score Go Down 📉

- **Low click rates** - If people see but don't click your ads
- **High bounce rate** - People click but immediately leave your site
- **Slow website** - Takes more than 3 seconds to load
- **Complaints** - Users report your ad as misleading

### Why Quality Score Saves You Money

**Higher score = Lower costs**

Here's a real example:

| Advertiser | Bid | Quality Score | Auction Score | Who Wins? |
|------------|-----|---------------|---------------|-----------|
| **You** | $4.00 | 1.0 (Great!) | 4.0 | **You win and pay less!** |
| Competitor | $5.00 | 0.8 (Good) | 4.0 | Loses despite higher bid |

**Result:** You pay $1 less per click than your competitor, even though they bid higher!

## How Relevance Works

**Relevance measures how well your ad matches what the user is talking about.** Think of it like a matching game.

### Simple Example

Let's say a user asks their AI assistant:

> "I need affordable car insurance for a new driver"

Here's what happens:

#### Step 1: We Identify Topics
- ✅ Car insurance
- ✅ Budget/affordable
- ✅ New driver

#### Step 2: We Check Your Ad
Does your ad mention:
- Car insurance? ✓
- Pricing/affordability? ✓
- New drivers? ✓

**Result: High Relevance Score = Your ad shows up!**

### Good Match vs Poor Match

:::tip Good Match Example
**User says:** "Best credit card for travel"
**Your ad:** "Earn 3x points on flights and hotels"
**Result:** ✅ Your ad shows up
:::

:::danger Poor Match Example
**User says:** "Best credit card for travel"
**Your ad:** "Low-interest personal loans"
**Result:** ❌ Your ad doesn't show
:::

## How Scoring Works

Our system combines your bid with quality and relevance factors to determine ad placement. Higher quality and relevance lead to better placement and lower costs.

In our second-price auction, you only pay slightly more than needed to beat the competition, ensuring you never overpay.

## Real-World Scoring Examples

### Example 1: High-Quality Advertiser

```yaml
Your Campaign: "Spring Insurance Special"
Bid: $4.00
Quality Score: 0.95 (Excellent CTR, fast site)
Relevance: 0.90 (Perfect keyword match)

Auction Score: $4.00 × 0.95 × 0.90 = 3.42
You Pay: Whatever beats the next competitor + $0.01
```

### Example 2: New Advertiser

```yaml
Your Campaign: "Insurance Quotes"
Bid: $4.00
Quality Score: 0.50 (New account, no history)
Relevance: 0.90 (Good match)

Auction Score: $4.00 × 0.50 × 0.90 = 1.80
You Pay: Need to improve quality or increase bid
```

## Pro Tips to Improve Your Scores

### Quick Wins for Quality Score

1. **Write specific ads**
   - ❌ "Cheap Insurance"
   - ✅ "Car Insurance for Teens - Save 25%"

2. **Match your landing page**
   - If your ad says "instant quote" → Deliver instant quote
   - If your ad says "free trial" → Don't ask for credit card

3. **Speed up your website**
   - Use tools like Google PageSpeed Insights
   - Compress images
   - Use a CDN

4. **Test different messages**
   - Create 3-5 ad variations
   - See which gets more clicks
   - Keep the winners, drop the losers

### Quick Wins for Relevance

1. **Use specific keywords**
   - Instead of "insurance" use "car insurance for new drivers"
   - Instead of "software" use "project management for startups"

2. **Target the right intent**
   - Research phase: "Learn about..." "What is..."
   - Comparison phase: "X vs Y" "Best option..."
   - Purchase phase: "Buy now" "Get quote"

3. **Write natural ad copy**
   - Match how real people talk
   - Address their actual problem
   - Offer a clear solution

## Your Daily Dashboard

We show you everything transparently:

```
Quality Score: 0.75 ↑ (Yesterday: 0.72)
├── CTR: 8.5% (Good)
├── Landing Page: Fast (1.2s)
├── Bounce Rate: 35% (Good)
└── User Feedback: Positive

Average Relevance: 0.82
├── High-match impressions: 75%
├── Medium-match impressions: 20%
└── Low-match impressions: 5%

This Week's Performance:
├── Impressions: 12,450
├── Clicks: 1,057 (8.5% CTR)
├── Avg CPC: $3.25 (down from $3.50)
└── Quality Bonus Saved: $264
```

## Frequently Asked Questions

<details>
<summary>How often does my Quality Score update?</summary>

Daily at midnight UTC. You'll see changes reflected in your dashboard the next morning.
</details>

<details>
<summary>What's a good Quality Score?</summary>

- 0.8-1.0 = Excellent (top 20% of advertisers)
- 0.6-0.8 = Good (average)
- 0.4-0.6 = Needs improvement
- Below 0.4 = Urgent attention needed
</details>

<details>
<summary>Can I see my competitors' scores?</summary>

No, but you can see category averages in your dashboard to understand where you stand.
</details>

<details>
<summary>How fast will I see improvements?</summary>

- CTR improvements: Within 24 hours
- Landing page improvements: Within 2-3 days
- Overall quality score: 3-7 days of consistent improvement
</details>

<details>
<summary>What if my score drops suddenly?</summary>

Check your dashboard alerts. Common causes:
- Landing page went down
- Ad copy changed
- New competitor with better relevance
- Seasonal changes in user behavior
</details>

## The Bottom Line

**Good ads that users actually want to click cost less and perform better.**

We reward quality because everyone wins:
- ✅ **You** get more customers for less money
- ✅ **Developers** earn more from higher CTRs
- ✅ **Users** see ads that actually help them

## Need Help Improving?

Our team can help optimize your campaigns:

- 📊 **Dashboard**: See your scores in real-time
- 💡 **Recommendations**: Get specific improvement tips
- 📧 **Support**: advertisers@attentionmarket.ai
- 💬 **Live Chat**: Mon-Fri 9am-5pm PST

---

*Remember: Start with a lower bid and great quality rather than a high bid and poor quality. You'll save money and get better results!*