# Advertiser Flow - Implementation Spec for Lovable

## Project Overview

Build an advertiser onboarding and campaign management flow for AttentionMarket. Advertisers should be able to:
1. Sign up (company info)
2. Create ad campaigns (targeting, budget, creative)
3. View campaign performance dashboard

**Design consistency:** Match the existing developer signup flow (dark theme, modern, clean)

---

## Technical Configuration

### API Endpoints

All API calls use this Supabase backend:

**Base URL:** `https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1`

**Authentication Header (all requests):**
```javascript
{
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcnV3bmJycWt2bXJsZGhwb29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NjcwMDYsImV4cCI6MjA4NTU0MzAwNn0.FMCjeunas8ICKm9W9bo2hZwyrBttzTcJbplbAyl4XhU'
}
```

### Endpoints Used

1. **Advertiser Signup:** `POST /advertiser-signup`
2. **Create Campaign:** `POST /campaign-create`
3. **Get Stats:** `GET /advertiser-stats?advertiser_id={id}`

---

## Screen 1: Advertiser Signup Form

### Purpose
Collect basic company information to create an advertiser account.

### Component Name
`AdvertiserSignup` or `AdvertiserSignupForm`

### Layout
- Max width: 600px
- Centered on page
- Card/modal style with padding
- Dark theme consistent with developer flow

### UI Elements

#### Header Section
```
Title: "Start Advertising to AI Agents"
Subtitle: "Reach users at high-intent moments. 30-second setup."
```

#### Form Fields

**1. Company Name**
- Type: `<Input type="text">`
- Label: "Company Name"
- Placeholder: "Acme Inc"
- Required: Yes
- Validation:
  - Min length: 2 characters
  - Max length: 100 characters
  - Error message: "Company name must be 2-100 characters"

**2. Contact Email**
- Type: `<Input type="email">`
- Label: "Contact Email"
- Placeholder: "you@company.com"
- Required: Yes
- Validation:
  - Must be valid email format
  - Error message: "Please enter a valid email address"

**3. Contact Name**
- Type: `<Input type="text">`
- Label: "Your Name"
- Placeholder: "Jane Smith"
- Required: Yes
- Validation:
  - Min length: 2 characters
  - Max length: 50 characters
  - Error message: "Name must be 2-50 characters"

#### Submit Button
- Text: "Create Account"
- Style: Primary button, full width
- Height: 48px minimum
- Loading state: Show spinner + text "Creating account..."
- Disabled when: Form is invalid or submitting

#### Footer Text
```
Small text below button:
"Free to start. No credit card required."
```

### API Integration

**Endpoint:** `POST /advertiser-signup`

**Request:**
```typescript
const response = await fetch(
  'https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/advertiser-signup',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcnV3bmJycWt2bXJsZGhwb29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NjcwMDYsImV4cCI6MjA4NTU0MzAwNn0.FMCjeunas8ICKm9W9bo2hZwyrBttzTcJbplbAyl4XhU'
    },
    body: JSON.stringify({
      company_name: "Acme Inc",
      contact_email: "you@company.com",
      contact_name: "Jane Smith"
    })
  }
);
```

**Success Response (200):**
```json
{
  "advertiser_id": "adv_abc123",
  "api_key": "am_adv_xyz789...",
  "company_name": "Acme Inc",
  "status": "active"
}
```

**Error Response (400):**
```json
{
  "error": "advertiser_exists",
  "message": "This email is already registered"
}
```

### State Management

**After successful signup:**
1. Store `advertiser_id` and `company_name` in component state or localStorage
2. Navigate to Screen 2 (Campaign Creation)
3. Pass advertiser info to next screen

**Error handling:**
- Show error message in Alert component above the submit button
- Map error codes to user-friendly messages:
  - `advertiser_exists`: "This email is already registered"
  - `invalid_email`: "Please enter a valid email address"
  - Network errors: "Connection error. Please try again."

---

## Screen 2: Create First Campaign

### Purpose
Guide advertiser through creating their first ad campaign.

### Component Name
`CampaignCreation` or `CreateCampaignForm`

### Layout
- Max width: 800px
- Centered on page
- Form with clear sections
- Dark theme

### UI Elements

#### Header Section
```
Title: "✅ Welcome, [Company Name]!"
Subtitle: "Let's create your first campaign"
```

#### Section 1: Campaign Basics

**1. Campaign Name**
- Type: `<Input type="text">`
- Label: "Campaign Name"
- Placeholder: "Summer Auto Insurance Leads"
- Required: Yes
- Validation: 3-100 characters
- Help text: "Internal name for tracking"

**2. Category Dropdown**
- Type: `<Select>` dropdown
- Label: "What are you advertising?"
- Required: Yes
- Help text: "We'll match your ads to relevant agent conversations"
- Options (display text → taxonomy value):

```typescript
const categories = [
  { label: "Auto Insurance - Quotes", value: "insurance.auto.full_coverage.quote" },
  { label: "Auto Insurance - Full Coverage", value: "insurance.auto.full_coverage.quote" },
  { label: "Home Insurance - Quotes", value: "insurance.home.full_coverage.quote" },
  { label: "Life Insurance - Quotes", value: "insurance.life.term.quote" },
  { label: "Health Insurance - Quotes", value: "insurance.health.individual.quote" },
  { label: "Legal - Divorce Consultation", value: "legal.family.divorce.consultation" },
  { label: "Legal - Immigration Consultation", value: "legal.immigration.visa.consultation" },
  { label: "Legal - Criminal Defense", value: "legal.criminal.defense.consultation" },
  { label: "Legal - Estate Planning", value: "legal.estate.planning.consultation" },
  { label: "Business Formation", value: "business.formation.incorporation.service" },
  { label: "E-commerce Platform Trial", value: "business.ecommerce.platform.trial" },
  { label: "Moving Services - Local Quote", value: "home_services.moving.local.quote" },
  { label: "HVAC Services - Quote", value: "home_services.hvac.repair.quote" },
  { label: "Accounting Services", value: "business.accounting.bookkeeping.service" },
  { label: "Financial - Personal Loans", value: "financial.loans.personal.application" },
  { label: "Financial - Credit Cards", value: "financial.credit_cards.rewards.application" }
];
```

#### Section 2: Budget & Pricing

**3. Total Budget**
- Type: `<Input type="number">` with $ prefix
- Label: "Total Budget"
- Placeholder: "1000"
- Required: Yes
- Min value: 100
- Help text: "Minimum $100. You can add more anytime."
- Validation: Must be >= 100

**4. Cost Per Click (CPC)**
- Type: `<Input type="number">` with $ prefix and .00 decimals
- Label: "Cost Per Click"
- Placeholder: "12.00"
- Required: Yes
- Min value: 1
- Max value: 100
- Step: 0.01
- Help text: "Recommended: $8-20 for insurance, $5-15 for services"
- Validation: Must be between $1 and $100

**5. Estimated Performance Display (calculated, read-only)**

Show below budget fields:
```typescript
const estimatedClicks = Math.floor(totalBudget / cpc);
const estimatedImpressions = Math.floor(estimatedClicks * 10); // Assuming 10% CTR

// Display:
`Estimated clicks: ~${estimatedClicks} clicks`
`Estimated reach: ~${estimatedImpressions} impressions (assuming 10% CTR)`
```

Style: Muted text, small font

#### Section 3: Your Ad

**6. Ad Title**
- Type: `<Input type="text">`
- Label: "Ad Title"
- Placeholder: "Get a Free Quote in 5 Minutes"
- Required: Yes
- Max length: 60 characters
- Show character counter: "45/60 characters"
- Validation: 10-60 characters

**7. Ad Description**
- Type: `<Textarea>` (3-4 rows)
- Label: "Ad Description"
- Placeholder: "Save up to 15% on car insurance. Compare quotes from top providers. No commitment required."
- Required: Yes
- Max length: 200 characters
- Show character counter: "120/200 characters"
- Validation: 20-200 characters

**8. Call to Action**
- Type: `<Input type="text">`
- Label: "Call to Action Button"
- Placeholder: "Get Quote"
- Required: Yes
- Max length: 20 characters
- Help text: "Keep it short and action-oriented"
- Validation: 5-20 characters

**9. Landing Page URL**
- Type: `<Input type="url">`
- Label: "Landing Page URL"
- Placeholder: "https://yoursite.com/quote?ref=attentionmarket"
- Required: Yes
- Validation: Must start with https://
- Help text: "Where users go when they click your ad"

#### Ad Preview Card

Live preview that updates as user types:

```jsx
<Card className="bg-card/50 p-6 border-primary/20">
  <h3 className="text-sm font-semibold mb-4">Preview</h3>

  <div className="space-y-3">
    <div className="text-xs text-muted-foreground">--- Sponsored ---</div>

    <h4 className="text-lg font-semibold">{adTitle || "Your Ad Title"}</h4>

    <p className="text-sm text-muted-foreground">
      {adDescription || "Your ad description will appear here..."}
    </p>

    <button className="bg-primary text-primary-foreground px-4 py-2 rounded">
      {callToAction || "Call to Action"} →
    </button>

    <div className="text-xs text-muted-foreground">
      (Sponsored by {companyName})
    </div>
  </div>
</Card>
```

#### Action Buttons

**Primary Button:**
- Text: "Launch Campaign"
- Style: Primary button, large
- Position: Bottom right
- Loading state: Show spinner + "Creating campaign..."

**Secondary Button (optional for MVP):**
- Text: "Save as Draft"
- Style: Ghost/outline button
- Position: Bottom left
- Action: Save with status='draft' instead of 'active'

### API Integration

**Endpoint:** `POST /campaign-create`

**Request:**
```typescript
const response = await fetch(
  'https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/campaign-create',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcnV3bmJycWt2bXJsZGhwb29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NjcwMDYsImV4cCI6MjA4NTU0MzAwNn0.FMCjeunas8ICKm9W9bo2hZwyrBttzTcJbplbAyl4XhU'
    },
    body: JSON.stringify({
      advertiser_id: "adv_abc123", // From Screen 1
      campaign_name: "Summer Auto Insurance Leads",
      taxonomy: "insurance.auto.full_coverage.quote", // From dropdown
      budget_total: 1000,
      cpc: 12.00,
      creative: {
        title: "Get a Free Quote in 5 Minutes",
        body: "Save up to 15% on car insurance. Compare quotes from top providers.",
        cta: "Get Quote",
        action_url: "https://yoursite.com/quote?ref=attentionmarket"
      },
      targeting: {
        geo: ["US"],
        language: ["en"],
        platform: ["web", "mobile"]
      },
      status: "active" // or "draft" if "Save as Draft" clicked
    })
  }
);
```

**Success Response (200):**
```json
{
  "campaign_id": "cmp_xyz789",
  "status": "active",
  "budget_remaining": 1000,
  "created_at": "2026-02-05T12:00:00Z"
}
```

**Error Response (400):**
```json
{
  "error": "invalid_budget",
  "message": "Budget must be at least $100"
}
```

### State Management

**After successful campaign creation:**
1. Show success message: "✅ Campaign launched!"
2. Wait 2 seconds
3. Navigate to Screen 3 (Dashboard)
4. Pass advertiser_id to dashboard

**Error handling:**
- Show error Alert above submit button
- Map common errors:
  - `invalid_budget`: "Budget must be at least $100"
  - `invalid_url`: "Please enter a valid URL starting with https://"
  - `invalid_cpc`: "CPC must be between $1 and $100"

---

## Screen 3: Advertiser Dashboard

### Purpose
Show campaign performance and allow creating additional campaigns.

### Component Name
`AdvertiserDashboard`

### Layout
- Full width (max 1200px)
- Header bar at top
- Campaign cards/list below
- Dark theme

### UI Elements

#### Header Bar

**Left side:**
```
Company name: [Company Name]
Total budget: "$234 / $1,000 spent"
```

**Right side:**
```
[+ Create Campaign] button
[Settings] icon button (optional for MVP)
```

#### Campaign List

Each campaign displayed as a card:

```jsx
<Card className="p-6">
  {/* Header */}
  <div className="flex justify-between items-start mb-4">
    <h3 className="text-xl font-semibold">{campaign.campaign_name}</h3>
    <Badge variant={status === 'active' ? 'success' : 'secondary'}>
      {status === 'active' ? '● Active' : '○ Paused'}
    </Badge>
  </div>

  {/* Category */}
  <p className="text-sm text-muted-foreground mb-4">
    Category: {categoryLabel}
  </p>

  {/* Budget Progress */}
  <div className="mb-4">
    <div className="flex justify-between text-sm mb-2">
      <span>Budget</span>
      <span>${budgetSpent} / ${budgetTotal} spent</span>
    </div>
    <Progress value={(budgetSpent / budgetTotal) * 100} />
  </div>

  {/* Performance Stats */}
  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
    <div>
      <div className="text-muted-foreground">Impressions</div>
      <div className="font-semibold">{impressions.toLocaleString()}</div>
    </div>
    <div>
      <div className="text-muted-foreground">Clicks</div>
      <div className="font-semibold">{clicks} ({ctr}% CTR)</div>
    </div>
    <div>
      <div className="text-muted-foreground">Cost</div>
      <div className="font-semibold">${cost}</div>
    </div>
  </div>

  {/* Action Buttons */}
  <div className="flex gap-2">
    <Button variant="outline" size="sm">View Details</Button>
    <Button variant="outline" size="sm">Edit</Button>
    <Button variant="outline" size="sm">
      {status === 'active' ? 'Pause' : 'Resume'}
    </Button>
  </div>
</Card>
```

#### Empty State

If no campaigns exist:

```jsx
<Card className="p-12 text-center">
  <div className="text-4xl mb-4">📊</div>
  <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
  <p className="text-muted-foreground mb-6">
    Create your first campaign to start reaching AI agent users
  </p>
  <Button onClick={navigateToCampaignCreation}>
    + Create Campaign
  </Button>
</Card>
```

### API Integration

**Endpoint:** `GET /advertiser-stats?advertiser_id={id}`

**Request:**
```typescript
const response = await fetch(
  `https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/advertiser-stats?advertiser_id=${advertiserId}`,
  {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcnV3bmJycWt2bXJsZGhwb29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NjcwMDYsImV4cCI6MjA4NTU0MzAwNn0.FMCjeunas8ICKm9W9bo2hZwyrBttzTcJbplbAyl4XhU'
    }
  }
);
```

**Success Response (200):**
```json
{
  "advertiser": {
    "advertiser_id": "adv_abc123",
    "company_name": "Acme Inc",
    "budget_total": 1000,
    "budget_spent": 234
  },
  "campaigns": [
    {
      "campaign_id": "cmp_xyz789",
      "campaign_name": "Summer Auto Insurance Leads",
      "taxonomy": "insurance.auto.full_coverage.quote",
      "status": "active",
      "budget_total": 1000,
      "budget_remaining": 766,
      "budget_spent": 234,
      "cpc": 12.00,
      "stats": {
        "impressions": 1234,
        "clicks": 156,
        "ctr": 0.126,
        "cost": 234
      },
      "creative": {
        "title": "Get a Free Quote in 5 Minutes",
        "body": "Save up to 15% on car insurance...",
        "cta": "Get Quote",
        "action_url": "https://..."
      }
    }
  ]
}
```

### State Management

**Display logic:**
- Map taxonomy back to human-readable category label
- Calculate CTR: `(clicks / impressions) * 100`
- Format numbers with commas: `1234 → 1,234`
- Format currency: `234 → $234`
- Show budget progress as percentage

**Refresh data:**
- Poll endpoint every 30 seconds while on dashboard
- Or add manual refresh button

**Create Campaign button:**
- Opens Screen 2 (Campaign Creation) as modal or new view
- Pass advertiser_id to pre-fill

---

## Navigation Flow

```
Landing Page
    ↓ Click "Advertiser Sign Up"
Screen 1: Signup Form
    ↓ Submit successful
Screen 2: Create Campaign
    ↓ Campaign created
Screen 3: Dashboard
    ↓ Click "+ Create Campaign"
Screen 2: Create Campaign (repeat)
```

---

## Design System

### Colors

Use existing dark theme:
- **Background:** Dark gray/black
- **Cards:** Slightly lighter gray with subtle border
- **Primary:** Green/teal (for active, success states)
- **Muted:** Gray for secondary text
- **Warning:** Yellow (for paused campaigns)
- **Error:** Red

### Typography

- **Page titles:** 32px, bold
- **Card headings:** 20-24px, semibold
- **Body text:** 16px, regular
- **Help text:** 14px, muted color
- **Labels:** 14px, medium weight

### Spacing

- **Form fields:** 16px gap between fields
- **Sections:** 32px gap between sections
- **Card padding:** 24px
- **Button height:** 44px minimum (touch-friendly)

### Components

Use shadcn/ui or similar:
- `<Card>` for containers
- `<Input>` for text fields
- `<Select>` for dropdowns
- `<Textarea>` for multiline text
- `<Button>` with variants (primary, outline, ghost)
- `<Badge>` for status indicators
- `<Progress>` for budget bars
- `<Alert>` for error messages

### Responsive

- **Mobile (<768px):**
  - Stack all form fields vertically
  - Full-width buttons
  - Single column campaign list

- **Tablet (768px-1024px):**
  - Max width 800px for forms
  - Two-column grid for stats

- **Desktop (>1024px):**
  - Max width 1200px
  - Side-by-side layouts where appropriate

---

## Error Handling

### Network Errors
Show toast notification or alert:
```
"Connection error. Please try again."
```

### Validation Errors
Show inline below the field in red text

### API Errors
Map error codes to user-friendly messages:

| Error Code | User Message |
|------------|--------------|
| `advertiser_exists` | "This email is already registered" |
| `invalid_budget` | "Budget must be at least $100" |
| `invalid_url` | "Please enter a valid URL starting with https://" |
| `invalid_cpc` | "CPC must be between $1 and $100" |
| `invalid_taxonomy` | "Please select a valid category" |
| Generic/unknown | "Something went wrong. Please try again." |

---

## Session/State Management

### Option 1: Local Storage (Simple)

After Screen 1 signup:
```typescript
localStorage.setItem('advertiser_id', 'adv_abc123');
localStorage.setItem('company_name', 'Acme Inc');
```

Read in subsequent screens:
```typescript
const advertiserId = localStorage.getItem('advertiser_id');
```

### Option 2: React Context/State (Better)

Create `AdvertiserContext`:
```typescript
interface AdvertiserContext {
  advertiserId: string | null;
  companyName: string | null;
  setAdvertiser: (id: string, name: string) => void;
}
```

Use throughout the flow to share state.

---

## Testing Checklist

### Screen 1: Signup
- [ ] Form validation works (required fields, email format)
- [ ] Submit button disabled when form invalid
- [ ] Loading state shows during API call
- [ ] Success: navigates to Screen 2
- [ ] Error: shows error message
- [ ] Duplicate email: shows "already registered" message

### Screen 2: Campaign Creation
- [ ] All fields have proper validation
- [ ] Character counters update live
- [ ] Ad preview updates as user types
- [ ] Budget/CPC calculations show correctly
- [ ] Dropdown has all categories
- [ ] Submit button disabled when form invalid
- [ ] Success: shows confirmation and navigates to dashboard
- [ ] Error: shows error message inline

### Screen 3: Dashboard
- [ ] Empty state shows when no campaigns
- [ ] Campaign cards display all data correctly
- [ ] CTR calculated correctly
- [ ] Progress bar shows budget percentage
- [ ] Status badges show correct colors (green=active, yellow=paused)
- [ ] Create Campaign button opens Screen 2
- [ ] Data refreshes (manually or auto)

---

## Future Enhancements (Out of Scope for MVP)

- Login flow for returning advertisers
- Edit campaign functionality
- Pause/resume campaign from dashboard
- View detailed analytics (clicks over time, etc.)
- Add funds to budget
- Email notifications for budget alerts
- Multi-user accounts (team access)

---

## Questions?

If you need clarification on any part of this spec, check:
- Repository: https://github.com/rtrivedi/agent-ads-sdk
- Architecture docs: `/docs/ARCHITECTURE.md`
- Backend function code: `/supabase/supabase/functions/`

---

**Ready to build!** This spec should be complete enough to implement all 3 screens with full functionality.
