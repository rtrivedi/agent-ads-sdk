# Advertiser Onboarding Guide
**AttentionMarket Taxonomy System**

---

## What is AttentionMarket?

AttentionMarket helps you reach high-intent users through **AI agents**—specialized bots that help people make purchasing decisions.

**Examples of AI agents:**
- InsuranceAdvisorAI (helps users find insurance)
- TravelBuddyAgent (plans trips and finds deals)
- HomeServiceFinder (connects users with contractors)
- LegalHelperBot (finds lawyers and legal services)

When users ask these agents for help, your ads appear as **sponsored suggestions**—relevant, helpful recommendations that feel native to the conversation.

---

## How Targeting Works: The Taxonomy System

Instead of keywords, we use **hierarchical taxonomies** (industry → category → product → intent).

### Taxonomy Format

```
vertical.category.subcategory.intent

Examples:
  insurance.auto.full_coverage.quote
  legal.family.divorce.consultation
  business.saas.crm.trial
```

### Why This is Better Than Keywords

**Traditional Ads (Keywords):**
- You bid on: "car insurance quote"
- Only matches: "car insurance quote" (exact match)
- Misses: "I need comprehensive auto coverage" ❌

**AttentionMarket (Taxonomies):**
- You target: `insurance.auto`
- Matches ALL of these: ✅
  - `insurance.auto.full_coverage.quote`
  - `insurance.auto.liability.compare`
  - `insurance.auto.full_coverage.research`
  - `insurance.auto.umbrella.apply`

**Result:** Target once, reach hundreds of specific user queries.

---

## How to Choose Your Taxonomies

### Step 1: Find Your Vertical

What industry are you in?

| Vertical | Examples |
|----------|----------|
| `insurance` | Auto, home, life, health insurance |
| `legal` | Lawyers, legal services |
| `business` | B2B SaaS, e-commerce platforms |
| `financial` | Loans, credit cards, investing |
| `healthcare` | Doctors, specialists, treatments |
| `real_estate` | Buying, selling, renting |
| `home_services` | Movers, cleaners, contractors |
| `automotive` | Car buying, repairs, parts |
| `shopping` | E-commerce, products |
| `education` | Online courses, degrees, certifications |

### Step 2: Choose Your Category & Subcategory

Be as **specific** or **broad** as you want:

**Broad Targeting (Recommended):**
```
insurance.auto
```
- Reaches: All auto insurance queries
- Best for: Large budgets, broad offerings

**Specific Targeting:**
```
insurance.auto.full_coverage
```
- Reaches: Only full coverage queries
- Best for: Niche products, testing

### Step 3: Target Multiple Intent Stages

Users go through a journey. Target all stages to maximize reach:

```
insurance.auto.full_coverage.research  ← Early (browsing)
insurance.auto.full_coverage.compare   ← Middle (considering)
insurance.auto.full_coverage.quote     ← Late (ready to buy)
insurance.auto.full_coverage.apply     ← Final (converting)
```

**Recommended:** Target at the **category level** to catch all intents:
```
insurance.auto
```
This automatically matches research, compare, quote, AND apply stages.

---

## Phase 1 Taxonomies (Available Now)

### Insurance ($20-54 CPC)

```
insurance.auto.full_coverage.{quote|compare|research|apply}
insurance.auto.liability.{quote|compare|research|apply}
insurance.auto.umbrella.{quote|compare|research|apply}
insurance.home.standard.{quote|compare|research|apply}
insurance.home.flood.{quote|compare|research|apply}
insurance.renters.basic.{quote|compare|research|apply}
insurance.life.term.{quote|compare|research|apply}
insurance.life.whole.{quote|compare|research|apply}
insurance.health.individual.{quote|compare|research|apply}
insurance.health.family.{quote|compare|research|apply}
insurance.business.general_liability.{quote|compare|research|apply}
insurance.business.professional_liability.{quote|compare|research|apply}
insurance.travel.trip.{quote|compare|research|apply}
insurance.pet.comprehensive.{quote|compare|research|apply}
```

**Recommended:** Target `insurance.auto` or `insurance.home` (catches all subcategories + intents)

### Legal ($50-150 CPC)

```
legal.personal_injury.accident.{consultation|quote|compare}
legal.family.divorce.{consultation|quote|compare}
legal.family.custody.{consultation|quote|compare}
legal.criminal.defense.{consultation|quote|compare}
legal.immigration.visa.{consultation|quote|compare|apply}
legal.immigration.citizenship.{consultation|quote|compare|apply}
legal.bankruptcy.chapter_7.{consultation|quote|compare}
legal.bankruptcy.chapter_13.{consultation|quote|compare}
legal.estate_planning.will.{consultation|quote|compare}
legal.estate_planning.trust.{consultation|quote|compare}
legal.business.incorporation.{consultation|quote|compare}
legal.business.contracts.{consultation|quote|compare}
legal.real_estate.transaction.{consultation|quote|compare}
```

**Recommended:** Target `legal.personal_injury` or `legal.family` (highest volume)

### Financial Services ($15-50 CPC)

```
financial.loans.personal.{quote|compare|research|apply}
financial.loans.mortgage.{quote|compare|research|apply}
financial.loans.auto.{quote|compare|research|apply}
financial.loans.student.{quote|compare|research|apply}
financial.credit_cards.rewards.{quote|compare|research|apply}
financial.credit_cards.balance_transfer.{quote|compare|research|apply}
financial.credit_cards.business.{quote|compare|research|apply}
financial.investing.brokerage.{trial|compare|research}
financial.investing.robo_advisor.{trial|compare|research}
financial.banking.checking.{compare|research|apply}
financial.banking.savings.{compare|research|apply}
financial.insurance.disability.{quote|compare|research|apply}
financial.debt.consolidation.{quote|compare|research|apply}
financial.credit_repair.services.{quote|compare|research|apply}
financial.tax_services.preparation.{quote|book|compare}
```

**Recommended:** Target `financial.loans` or `financial.credit_cards`

### B2B SaaS ($10-100 CPC)

```
business.saas.crm.{trial|compare|research|quote}
business.saas.project_management.{trial|compare|research|quote}
business.saas.marketing_automation.{trial|compare|research|quote}
business.saas.email_marketing.{trial|compare|research|quote}
business.saas.analytics.{trial|compare|research|quote}
business.saas.accounting.{trial|compare|research|quote}
business.saas.hr.{trial|compare|research|quote}
business.saas.communication.{trial|compare|research|quote}
business.ecommerce.platform.{trial|compare|research|quote}
business.ecommerce.payments.{trial|compare|research|quote}
business.ecommerce.shipping.{trial|compare|research|quote}
business.web.hosting.{trial|compare|research|quote}
business.web.domains.{trial|compare|research|quote}
business.security.cybersecurity.{trial|compare|research|quote}
```

**Recommended:** Target `business.saas.crm` or `business.ecommerce.platform`

### Healthcare ($10-50 CPC)

```
healthcare.doctors.primary_care.{book|research|compare}
healthcare.doctors.specialists.{book|research|compare}
healthcare.dental.general.{book|research|compare}
healthcare.dental.cosmetic.{book|research|compare|quote}
healthcare.vision.eye_exam.{book|research|compare}
healthcare.vision.lasik.{consultation|quote|compare}
healthcare.mental_health.therapy.{book|research|compare}
healthcare.mental_health.psychiatry.{book|research|compare}
healthcare.urgent_care.walk_in.{research|compare}
healthcare.pharmacy.prescription.{compare|research}
healthcare.labs.testing.{book|research|compare}
healthcare.telehealth.virtual_visit.{book|research|compare}
healthcare.weight_loss.programs.{trial|consultation|compare}
```

**Recommended:** Target `healthcare.dental` or `healthcare.vision`

### Real Estate ($10-30 CPC)

```
real_estate.buy.residential.{research|compare}
real_estate.buy.commercial.{research|compare}
real_estate.sell.home.{quote|compare}
real_estate.rent.apartment.{research|compare}
real_estate.rent.house.{research|compare}
real_estate.property_management.services.{quote|compare}
real_estate.mortgage.rates.{quote|compare|research}
real_estate.refinance.home.{quote|compare|research}
real_estate.appraisal.home.{quote|book}
```

**Recommended:** Target `real_estate.buy` or `real_estate.mortgage`

### Home Services ($5-30 CPC)

```
home_services.moving.local.{quote|compare|research|book}
home_services.moving.long_distance.{quote|compare|research|book}
home_services.cleaning.regular.{quote|compare|research|book}
home_services.cleaning.deep.{quote|compare|research|book}
home_services.plumbing.emergency.{quote|book}
home_services.plumbing.installation.{quote|compare|book}
home_services.electrical.repair.{quote|book}
home_services.electrical.installation.{quote|compare|book}
home_services.hvac.repair.{quote|book}
home_services.hvac.installation.{quote|compare|book}
home_services.landscaping.maintenance.{quote|compare|book}
home_services.landscaping.design.{quote|compare|book}
home_services.remodeling.kitchen.{quote|compare|consultation}
home_services.remodeling.bathroom.{quote|compare|consultation}
home_services.painting.interior.{quote|compare|book}
home_services.roofing.repair.{quote|compare|book}
home_services.pest_control.treatment.{quote|compare|book}
```

**Recommended:** Target `home_services.moving` or `home_services.cleaning`

### Automotive ($5-25 CPC)

```
automotive.buying.new_car.{research|compare|quote}
automotive.buying.used_car.{research|compare|quote}
automotive.selling.trade_in.{quote|research}
automotive.repairs.general.{quote|book|research}
automotive.repairs.transmission.{quote|book}
automotive.parts.replacement.{research|compare}
automotive.insurance.coverage.{quote|compare|research}
automotive.financing.loan.{quote|compare|apply}
automotive.tires.replacement.{quote|compare|book}
```

**Recommended:** Target `automotive.buying` or `automotive.repairs`

### Shopping ($1-10 CPC)

```
shopping.electronics.computers.{compare|research}
shopping.electronics.phones.{compare|research}
shopping.electronics.tablets.{compare|research}
shopping.fashion.clothing.{compare|research}
shopping.fashion.shoes.{compare|research}
shopping.home.furniture.{compare|research}
shopping.home.appliances.{compare|research}
shopping.beauty.skincare.{compare|research}
shopping.beauty.makeup.{compare|research}
shopping.sports.equipment.{compare|research}
```

**Recommended:** Target `shopping.electronics` or `shopping.fashion`

### Education ($10-40 CPC)

```
education.online.courses.{trial|compare|research}
education.online.degrees.{compare|research|apply}
education.online.certifications.{compare|research|apply}
education.tutoring.academic.{book|compare|research}
education.tutoring.test_prep.{book|compare|research}
education.language.learning.{trial|compare|research}
education.professional.development.{compare|research|apply}
education.bootcamp.coding.{compare|research|apply}
```

**Recommended:** Target `education.online.courses` or `education.bootcamp`

---

## Creating Your First Campaign

### Example: Auto Insurance Company

**What you sell:** Auto insurance quotes

**Step 1: Choose Taxonomies**
```
insurance.auto  ← Targets ALL auto insurance queries
```

Or be more specific:
```
insurance.auto.full_coverage.quote
insurance.auto.liability.quote
insurance.auto.umbrella.quote
```

**Step 2: Set Your Bid**
- Industry average CPC: $20-54
- Start with: $25 CPC
- Test and adjust based on results

**Step 3: Create Your Ad**
```
Title: "Get Auto Insurance Quotes - Compare & Save"
Body: "Compare quotes from top insurers in 2 minutes. Save up to 40% on coverage. Free, no obligation."
CTA: "Get Free Quote →"
```

**Step 4: Launch**
- Minimum budget: $500
- Recommended: $2,000-5,000 to test
- Monitor performance daily

---

## Best Practices

### ✅ DO

1. **Target broadly** - `insurance.auto` is better than `insurance.auto.full_coverage.quote`
2. **Test multiple creatives** - A/B test titles, CTAs, and messaging
3. **Start with higher bids** - Win auctions early, then optimize down
4. **Target all intent stages** - Research, compare, quote, apply
5. **Monitor daily** - Check performance and adjust bids

### ❌ DON'T

1. **Don't target too narrowly** - You'll miss most queries
2. **Don't set bids too low** - Industry-average CPCs exist for a reason
3. **Don't ignore intent stages** - Users at "research" stage still convert later
4. **Don't use generic ads** - Be specific to the taxonomy you're targeting
5. **Don't forget disclosure** - Always clearly label ads as "Sponsored"

---

## Pricing Guidance

| Vertical | Avg CPC | Recommended Starting Bid |
|----------|---------|--------------------------|
| Legal | $50-150 | $75 |
| Insurance | $20-54 | $30 |
| Financial | $15-50 | $25 |
| Healthcare | $10-50 | $20 |
| B2B SaaS | $10-100 | $25 |
| Real Estate | $10-30 | $15 |
| Home Services | $5-30 | $12 |
| Automotive | $5-25 | $10 |
| Education | $10-40 | $15 |
| Shopping | $1-10 | $3 |

---

## API Integration

### Create a Campaign (via API)

```bash
curl -X POST 'https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/campaign-create' \
  -H 'Content-Type: application/json' \
  -H 'X-Advertiser-Key: YOUR_API_KEY' \
  -d '{
    "name": "Auto Insurance - Full Coverage",
    "targeting_taxonomies": [
      "insurance.auto.full_coverage.quote",
      "insurance.auto.full_coverage.compare",
      "insurance.auto.full_coverage.research"
    ],
    "budget": 5000,
    "bid_cpc": 25.00,
    "targeting_countries": ["US", "CA"],
    "targeting_languages": ["en"]
  }'
```

### Response

```json
{
  "campaign_id": "uuid-here",
  "name": "Auto Insurance - Full Coverage",
  "status": "active",
  "budget": {
    "total": 5000,
    "spent": 0,
    "remaining": 5000,
    "currency": "USD"
  },
  "targeting": {
    "taxonomies": [
      "insurance.auto.full_coverage.quote",
      "insurance.auto.full_coverage.compare",
      "insurance.auto.full_coverage.research"
    ],
    "countries": ["US", "CA"],
    "languages": ["en"]
  },
  "pricing": {
    "cpc": 25.00
  },
  "next_steps": [
    "Create ad units for this campaign",
    "Monitor performance in dashboard",
    "Adjust bids based on results"
  ]
}
```

---

## Getting Help

**Documentation:**
- Complete taxonomy reference: `TAXONOMY_SYSTEM.md`
- Developer integration: `DEVELOPER_INTEGRATION_GUIDE.md`

**Support:**
- Email: support@attentionmarket.com
- Dashboard: https://attentionmarket.com/dashboard

**Best Results:**
- Start with broad targeting (`vertical.category`)
- Target multiple intent stages
- Set competitive bids (see pricing guidance above)
- Test and optimize continuously

---

**Ready to get started?** [Create your first campaign →]
