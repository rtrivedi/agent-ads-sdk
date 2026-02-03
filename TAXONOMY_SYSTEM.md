# AttentionMarket Taxonomy System
**Revenue-Optimized Ad Targeting Structure**

---

## Overview

AttentionMarket uses a **4-tier hierarchical taxonomy** designed to maximize advertiser revenue while providing flexible targeting:

```
VERTICAL.CATEGORY.SUBCATEGORY.INTENT
```

**Examples:**
```
insurance.auto.full_coverage.quote
legal.personal_injury.accident.consultation
business.saas.crm.trial
healthcare.dental.cosmetic.book
```

---

## Tier Structure

### Tier 1: Vertical (Industry)
15 major industry verticals

### Tier 2: Category (Product/Service Type)
Broad product or service classification within vertical

### Tier 3: Subcategory (Specific Offering)
Specific product, service, or solution

### Tier 4: Intent (User Journey Stage)
Signal indicating user's readiness to buy

---

## Intent Modifiers (Tier 4)

All taxonomies support these intent suffixes:

| Intent | Meaning | CPC Multiplier | Example User Query |
|--------|---------|----------------|-------------------|
| `.research` | Learning, browsing | 0.5x | "What is term life insurance?" |
| `.compare` | Evaluating options | 1.0x | "Best CRM software comparison" |
| `.quote` | Getting prices | 1.5x | "Get auto insurance quote" |
| `.trial` | Free trial signup | 1.5x | "Start free CRM trial" |
| `.book` | Schedule/purchase | 2.0x | "Book dentist appointment" |
| `.apply` | Application process | 2.0x | "Apply for credit card" |
| `.consultation` | Schedule meeting | 2.0x | "Talk to injury lawyer" |

**Usage:**
- If intent is unclear, omit suffix (defaults to `.compare`)
- Multiple intents can apply, use most specific

---

## Phase 1: Launch Taxonomies (Top 50 High-Value)

### 1. Financial Services (Avg CPC: $15-50)
**Revenue Potential: Very High** | **Target Advertisers: Banks, fintech, investment platforms**

```
financial_services.credit_cards.rewards.apply
financial_services.credit_cards.rewards.compare
financial_services.credit_cards.balance_transfer.apply
financial_services.credit_cards.cashback.apply
financial_services.loans.personal.apply
financial_services.loans.personal.compare
financial_services.loans.business.apply
financial_services.loans.mortgage.apply
financial_services.loans.auto.apply
financial_services.investing.brokerage.trial
financial_services.investing.robo_advisor.trial
financial_services.investing.crypto.trial
financial_services.banking.checking.apply
financial_services.banking.savings.compare
financial_services.tax_services.filing.book
```

---

### 2. Insurance (Avg CPC: $20-54)
**Revenue Potential: Very High** | **Target Advertisers: Insurance carriers, brokers**

```
insurance.auto.full_coverage.quote
insurance.auto.liability.quote
insurance.health.individual.quote
insurance.health.family.quote
insurance.life.term.quote
insurance.life.whole.quote
insurance.home.owners.quote
insurance.home.renters.quote
insurance.business.liability.quote
insurance.business.professional.quote
insurance.pet.dogs.quote
insurance.pet.cats.quote
insurance.travel.trip.quote
insurance.disability.income.quote
```

---

### 3. Legal Services (Avg CPC: $50-150)
**Revenue Potential: Very High** | **Target Advertisers: Law firms, legal networks**

```
legal.personal_injury.accident.consultation
legal.personal_injury.medical_malpractice.consultation
legal.personal_injury.workplace.consultation
legal.family_law.divorce.consultation
legal.family_law.custody.consultation
legal.criminal.defense.consultation
legal.business.contracts.consultation
legal.business.incorporation.consultation
legal.immigration.visa.consultation
legal.immigration.citizenship.consultation
legal.estate_planning.wills.consultation
legal.bankruptcy.personal.consultation
legal.employment.wrongful_termination.consultation
```

---

### 4. Healthcare (Avg CPC: $10-50)
**Revenue Potential: High** | **Target Advertisers: Medical practices, health services**

```
healthcare.dental.general.book
healthcare.dental.cosmetic.consultation
healthcare.dental.orthodontics.consultation
healthcare.vision.glasses.book
healthcare.vision.lasik.consultation
healthcare.mental_health.therapy.book
healthcare.mental_health.psychiatry.book
healthcare.primary_care.doctor.book
healthcare.urgent_care.walk_in.book
healthcare.specialists.dermatology.book
healthcare.elective.plastic_surgery.consultation
healthcare.wellness.weight_loss.consultation
healthcare.telehealth.virtual_visit.book
```

---

### 5. Real Estate (Avg CPC: $10-30)
**Revenue Potential: High** | **Target Advertisers: Realtors, brokers, mortgage lenders**

```
real_estate.buying.agents.consultation
real_estate.buying.mortgage.quote
real_estate.selling.agents.consultation
real_estate.selling.valuation.quote
real_estate.renting.apartments.book
real_estate.renting.houses.book
real_estate.investing.properties.consultation
real_estate.commercial.office.consultation
real_estate.property_management.services.quote
```

---

### 6. Business (B2B SaaS & Services) (Avg CPC: $10-100)
**Revenue Potential: Very High** | **Target Advertisers: SaaS companies, agencies**

```
business.saas.crm.trial
business.saas.marketing_automation.trial
business.saas.accounting.trial
business.saas.hr.trial
business.saas.project_management.trial
business.saas.email_marketing.trial
business.saas.analytics.trial
business.services.marketing_agency.consultation
business.services.seo_agency.consultation
business.services.web_development.quote
business.services.graphic_design.quote
business.ecommerce.platform.trial
business.ecommerce.payment_processing.trial
business.financial.business_credit_card.apply
```

---

### 7. Education (Avg CPC: $10-40)
**Revenue Potential: Medium-High** | **Target Advertisers: Online courses, bootcamps, universities**

```
education.online_learning.coding_bootcamp.apply
education.online_learning.data_science.trial
education.online_learning.marketing.trial
education.degrees.undergraduate.apply
education.degrees.mba.apply
education.professional.certification.apply
education.k12.tutoring.book
education.k12.test_prep.trial
education.language.english.trial
```

---

### 8. Home Services (Avg CPC: $5-30)
**Revenue Potential: Medium-High** | **Target Advertisers: Local contractors, national franchises**

```
home_services.hvac.repair.quote
home_services.hvac.installation.quote
home_services.roofing.repair.quote
home_services.roofing.replacement.quote
home_services.plumbing.emergency.quote
home_services.plumbing.installation.quote
home_services.electrical.repair.quote
home_services.electrical.installation.quote
home_services.solar.installation.consultation
home_services.remodeling.kitchen.quote
home_services.remodeling.bathroom.quote
home_services.cleaning.regular.book
home_services.moving.local.quote
home_services.moving.long_distance.quote
home_services.landscaping.maintenance.quote
home_services.pest_control.treatment.quote
```

---

### 9. Automotive (Avg CPC: $5-20)
**Revenue Potential: Medium** | **Target Advertisers: Dealerships, auto services**

```
automotive.buying.new.quote
automotive.buying.used.quote
automotive.selling.trade_in.quote
automotive.insurance.auto.quote
automotive.repair.general.book
automotive.repair.body.quote
automotive.parts.aftermarket.compare
automotive.rentals.short_term.book
```

---

### 10. Shopping (E-commerce) (Avg CPC: $1-10)
**Revenue Potential: Medium** | **Target Advertisers: E-commerce platforms, retailers**

```
shopping.ecommerce.platform.trial
shopping.ecommerce.marketplace.research
shopping.electronics.computers.compare
shopping.electronics.phones.compare
shopping.fashion.clothing.compare
shopping.home.furniture.compare
shopping.beauty.skincare.compare
shopping.specialty.pets.compare
```

---

## Phase 2: Expansion Taxonomies (+100 categories)

**Launch Timeline: 3-6 months after Phase 1**

### Additional Verticals:

```
11. Travel & Hospitality
travel.flights.domestic.book
travel.hotels.luxury.book
travel.vacation_rentals.beach.book
travel.cruises.caribbean.book
travel.experiences.tours.book
travel.car_rentals.airport.book

12. Technology (B2C)
technology.software.antivirus.trial
technology.software.vpn.trial
technology.hosting.web.trial
technology.domains.registration.book
technology.electronics.laptops.compare
technology.electronics.tablets.compare

13. Professional Services
professional_services.accounting.tax_prep.book
professional_services.consulting.business.consultation
professional_services.photography.wedding.quote
professional_services.event_planning.wedding.consultation
professional_services.coaching.business.consultation
professional_services.coaching.life.consultation

14. Personal Services
personal_services.beauty.salon.book
personal_services.beauty.spa.book
personal_services.fitness.gym_membership.trial
personal_services.fitness.personal_training.consultation
personal_services.childcare.daycare.consultation
personal_services.pet_care.grooming.book
personal_services.pet_care.veterinary.book

15. Entertainment & Media
entertainment.streaming.video.trial
entertainment.streaming.music.trial
entertainment.gaming.subscriptions.trial
entertainment.events.concerts.book
entertainment.events.sports.book
```

---

## Phase 3: Community Requests (Ongoing)

**Process:**
1. Agent developers request new taxonomies via dashboard
2. AttentionMarket reviews for:
   - Advertiser demand
   - Revenue potential
   - Naming consistency
3. Approved taxonomies added quarterly

**Requirements for new taxonomy:**
- Follows 4-tier structure
- Maps to existing vertical
- Has 5+ potential advertisers
- Not duplicate of existing taxonomy

---

## Taxonomy Pricing Tiers

### Tier 1: Premium (Min CPC $10+)
- `legal.*`
- `insurance.*`
- `financial_services.*`
- `business.saas.*`
- `healthcare.elective.*`

### Tier 2: Standard (Min CPC $5-10)
- `business.services.*`
- `education.degrees.*`
- `real_estate.*`
- `home_services.solar.*`
- `home_services.remodeling.*`

### Tier 3: Value (Min CPC $1-5)
- `home_services.cleaning.*`
- `home_services.moving.*`
- `automotive.*`
- `shopping.*`
- `travel.*`

---

## For Advertisers: How to Choose Taxonomy

### Step 1: Identify Your Vertical
Match your business to one of 15 verticals

### Step 2: Choose Category + Subcategory
Be as specific as possible for best targeting

### Step 3: Consider Intent
- **Awareness campaigns** → `.research`
- **Consideration campaigns** → `.compare`
- **Conversion campaigns** → `.quote`, `.book`, `.apply`, `.trial`

### Step 4: Test Multiple Taxonomies
Start with 3-5 relevant taxonomies, measure performance

**Example: Pietra (E-commerce Platform)**
```yaml
Primary:
  - business.ecommerce.platform.trial
  - business.saas.ecommerce.trial

Secondary:
  - shopping.ecommerce.platform.research
  - business.services.web_development.compare

Test:
  - education.online_learning.entrepreneurship.trial
```

---

## For Agents: How to Map User Intent to Taxonomy

### Pattern Recognition

**Financial Questions:**
```
"best credit cards" → financial_services.credit_cards.rewards.compare
"apply for mortgage" → financial_services.loans.mortgage.apply
"open savings account" → financial_services.banking.savings.apply
```

**Service Questions:**
```
"need a lawyer for accident" → legal.personal_injury.accident.consultation
"get auto insurance quote" → insurance.auto.full_coverage.quote
"book dentist appointment" → healthcare.dental.general.book
```

**Business Questions:**
```
"best CRM software" → business.saas.crm.compare
"start online store" → business.ecommerce.platform.trial
"hire marketing agency" → business.services.marketing_agency.consultation
```

### Intent Detection

| User Language | Intent Modifier |
|---------------|----------------|
| "what is", "how does", "learn about" | `.research` |
| "best", "compare", "vs", "options" | `.compare` |
| "price", "cost", "how much", "quote" | `.quote` |
| "free trial", "try", "demo" | `.trial` |
| "book", "schedule", "appointment" | `.book` |
| "apply", "sign up", "get started" | `.apply` |
| "talk to", "speak with", "consult" | `.consultation` |

---

## Migration from Old Taxonomy

### Mapping Table

| Old Taxonomy | New Taxonomy |
|--------------|--------------|
| `shopping.ecommerce.platform` | `business.ecommerce.platform.trial` |
| `local_services.movers.quote` | `home_services.moving.local.quote` |
| `local_services.plumbers.quote` | `home_services.plumbing.emergency.quote` |
| `local_services.electricians.quote` | `home_services.electrical.repair.quote` |
| `local_services.cleaning` | `home_services.cleaning.regular.book` |
| `local_services.contractors.home` | `home_services.remodeling.kitchen.quote` |
| `business.productivity.tools` | `business.saas.project_management.trial` |
| `business.software.ecommerce` | `business.ecommerce.platform.trial` |
| `business.startup.tools` | `business.saas.crm.trial` |

**Migration Timeline:**
- **Immediately**: New taxonomies available
- **30 days**: Old taxonomies deprecated (warning logs)
- **90 days**: Old taxonomies removed (breaking change)

---

## Revenue Projections

### Phase 1 (50 Taxonomies)
- **Potential Advertisers**: 5,000-10,000
- **High-value categories**: 35/50 (70%)
- **Revenue potential**: $500k-2M/month at scale

### Phase 2 (150 Taxonomies)
- **Potential Advertisers**: 20,000-50,000
- **High-value categories**: 80/150 (53%)
- **Revenue potential**: $2M-10M/month at scale

### Phase 3 (200+ Taxonomies)
- **Potential Advertisers**: 50,000-100,000+
- **Long-tail coverage**: Niche markets
- **Revenue potential**: $10M-50M/month at scale

---

## Implementation Notes

### Database Schema
```sql
-- Campaigns table already supports arrays
targeting_taxonomies TEXT[]

-- Example
UPDATE campaigns SET targeting_taxonomies = ARRAY[
  'insurance.auto.full_coverage.quote',
  'insurance.auto.liability.quote'
] WHERE campaign_id = '...';
```

### SDK Usage
```typescript
// Agents specify taxonomy in decide() call
const decision = await client.decide({
  placement: { type: 'sponsored_suggestion' },
  context: {
    taxonomy: 'insurance.auto.full_coverage.quote', // ← New format
    query: 'get car insurance quote',
    country: 'US'
  }
});
```

### Matching Logic
```typescript
// Backend matches:
// 1. Exact match
// 2. Prefix match (broader targeting)
// 3. Vertical match (broadest targeting)

// Examples:
// Request: insurance.auto.full_coverage.quote
// Matches campaigns targeting:
//   - insurance.auto.full_coverage.quote (exact)
//   - insurance.auto.full_coverage (broader - any intent)
//   - insurance.auto (even broader - any auto insurance)
//   - insurance (broadest - any insurance)
```

---

## Governance

**Who can add taxonomies:**
- Phase 1-2: AttentionMarket only
- Phase 3: Community requests (reviewed quarterly)

**Taxonomy requirements:**
1. Follows `vertical.category.subcategory[.intent]` format
2. Maps to existing vertical (no new verticals without approval)
3. Has clear advertiser use case
4. Not duplicate of existing taxonomy
5. Consistent with taxonomy naming conventions

**Request process:**
1. Agent/advertiser submits request via dashboard
2. Includes: taxonomy, use case, estimated demand
3. AttentionMarket reviews within 30 days
4. Approved taxonomies added in next quarterly update

---

## Summary

✅ **Revenue-optimized**: Prioritizes high-CPC verticals
✅ **Scalable**: 4-tier hierarchy supports 1000s of taxonomies
✅ **Flexible**: Intent modifiers adapt to user journey
✅ **Advertiser-friendly**: Clear targeting options
✅ **Agent-friendly**: Intuitive naming, easy to map queries

**Next Steps:**
1. Deploy Phase 1 taxonomies (50 categories)
2. Update SDK documentation with new format
3. Migrate existing campaigns to new taxonomy
4. Launch advertiser education campaign
5. Monitor adoption and iterate
