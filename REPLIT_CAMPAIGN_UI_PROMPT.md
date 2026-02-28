# Campaign Creation UI - Replit Implementation Prompt

## Context
I'm building a campaign creation flow for AttentionMarket, an advertising platform where AI agents match ads based on semantic context rather than demographics. The system uses embeddings to match user conversations with relevant campaigns.

## Tech Stack
- React with TypeScript
- Tailwind CSS for styling
- Supabase for backend
- The UI should feel modern, clean, and guide advertisers through creating context-aware campaigns

## Campaign Creation Flow - 6 Steps

### Step 1: Campaign Basics
**Purpose**: Capture fundamental campaign information and budget

**Fields**:
- Campaign Name (text input)
  - Placeholder: "e.g., Summer AI Tools Promotion"
  - Helper: "Internal name to identify your campaign"

- Daily Budget (currency input)
  - Min: $10
  - Default: $50
  - Helper: "Average daily spend. You can change this anytime."

- Total Budget (currency input)
  - Min: $50
  - Helper: "Campaign stops when this limit is reached"

- Bid per Click (currency slider)
  - Range: $0.10 - $5.00
  - Default: $0.50
  - Show: "Estimated 100-200 clicks/day" (dynamic based on bid)

- Test Mode Toggle (NEW)
  - Label: "Start in Test Mode"
  - Helper: "Launch with $10 budget to test performance risk-free"
  - When ON: Override budgets to $10, show badge "TEST MODE - $10 Budget"

**UI Design**:
- Card layout with clear sections
- Progress indicator showing Step 1 of 6
- Auto-save indicator

---

### Step 2: Define Your Solution
**Purpose**: Capture what problem the product solves (generates problem embedding)

**Fields**:
- What problem does your product solve? (textarea)
  - Min: 50 characters
  - Max: 500 characters
  - Placeholder: "e.g., Developers spend hours reviewing code manually, leading to delays and missed bugs"
  - Helper: "Describe the specific pain point your product addresses"

- Value Proposition (textarea)
  - Min: 30 characters
  - Max: 300 characters
  - Placeholder: "e.g., Automated code review in seconds with AI-powered insights"
  - Helper: "How does your product solve this problem?"

**Best Practice Tips** (show in sidebar):
- Be specific about the problem
- Use emotional language that resonates
- Focus on outcomes, not features

---

### Step 3: Situational Triggers (NEW - Context-Aware)
**Purpose**: Define when the ad should appear based on conversation context

**Fields**:
- When should your ad appear? (tag input array)
  - Max: 10 triggers
  - Placeholder: "Type a situation and press Enter"
  - Examples shown as chips:
    - "user asking about [your problem space]"
    - "expressing frustration with current solution"
    - "researching alternatives"
    - "comparing options"

- Example user phrases (tag input array)
  - Max: 10 phrases
  - Placeholder: "What might users say? Press Enter to add"
  - Helper: "Real phrases your ideal customer might type"
  - Examples:
    - "how to review code faster"
    - "automated PR review tools"
    - "code review best practices"

- Negative contexts (tag input array)
  - Max: 10 contexts
  - Placeholder: "When NOT to show your ad"
  - Helper: "Avoid irrelevant impressions"
  - Examples:
    - "looking for free solutions"
    - "enterprise security audit"
    - "manual review only"

**UI Design**:
- Tag inputs with X to remove
- Drag to reorder tags
- Character count for each tag (max 100 chars)
- Show "Generates context embeddings for better matching" info box

---

### Step 4: Target Audience
**Purpose**: Define who the ideal customer is (generates audience embedding)

**Fields**:
- Who is your ideal customer? (textarea)
  - Placeholder: "e.g., Development teams at startups and scale-ups who ship code daily"
  - Helper: "Be specific about role, company type, and needs"

- Customer Interests (tag input)
  - Placeholder: "Add interests, tools, or topics"
  - Suggestions: "DevOps", "CI/CD", "Code Quality", "Agile", etc.

- Company/Team Size (optional multi-select)
  - [ ] Individuals
  - [ ] Small teams (2-10)
  - [ ] Medium teams (11-50)
  - [ ] Large teams (50+)

---

### Step 5: Create Your Ad
**Purpose**: Design the actual ad content users will see

**Ad Type Selector** (tabs or radio):
1. **Smart Link Ad** (default)
   - Shows in AI responses with link
   - Best for: Products, services, content

2. **API Integration**
   - Your API is called directly by AI
   - Best for: Tools, calculations, real-time data

**For Smart Link Ad**:
- Headline (text input)
  - Max: 60 characters
  - Preview shown in real-time

- Description (textarea)
  - Max: 150 characters
  - Helper: "Compelling description of your offer"

- Call-to-Action (dropdown + custom)
  - Options: "Learn More", "Get Started", "Try Free", "View Demo", "Custom..."

- Landing Page URL (url input)
  - Validation: Must be valid URL
  - Helper: "Where users go when they click"

- Promo Code (optional)
  - Placeholder: "SAVE20"
  - Helper: "Optional code for tracking or discounts"

**For API Integration**:
- API Endpoint URL
- Authentication Method (Bearer Token, API Key, None)
- Request Template (JSON editor)
- Response Handler (code editor)

**Live Preview Panel** (sticky sidebar):
Show how the ad will appear in an AI chat:
```
🤖 AI: Based on your need for faster code reviews, here's a relevant solution:

[AD PREVIEW]
📊 Sponsored
**[Headline]**
[Description]
→ [CTA Button]
```

---

### Step 6: Review & Launch
**Purpose**: Final review and confirmation before launch

**Sections**:
1. **Campaign Summary**
   - All key details in read-only cards
   - "Edit" link for each section

2. **Estimated Performance**
   - Daily impressions: ~1,000-5,000
   - Estimated CTR: 2-4%
   - Daily clicks: 20-200
   - Daily spend: $10-100

3. **Semantic Matching Preview**
   - "Your ad will match conversations about:"
   - List generated topics based on embeddings

4. **Pre-Launch Checklist**
   - ✅ Budget configured
   - ✅ At least 3 trigger contexts added
   - ✅ Ad content complete
   - ✅ Landing page verified
   - ⚠️ Test mode enabled (if active)

5. **Launch Options**:
   - "Launch Campaign" (primary button)
   - "Save as Draft" (secondary)
   - "Launch in Test Mode" (if not already)

---

## Component Structure

```jsx
// Main container
<CampaignWizard>
  <ProgressHeader currentStep={step} totalSteps={6} />

  <div className="flex gap-6">
    <MainContent className="flex-1">
      <StepContent />
      <NavigationButtons />
    </MainContent>

    <Sidebar className="w-80">
      <LivePreview /> // For step 5
      <Tips />        // Context-sensitive tips
      <Help />        // FAQ and support
    </Sidebar>
  </div>
</CampaignWizard>
```

## Key Features to Implement

1. **Auto-save**: Save draft every 10 seconds
2. **Validation**: Real-time field validation with helpful error messages
3. **Progress Persistence**: Users can leave and return to continue
4. **Smart Defaults**: Pre-fill with intelligent defaults
5. **Responsive**: Works on tablet and mobile
6. **Keyboard Navigation**: Tab through fields, Enter to proceed
7. **Help System**: Tooltips, examples, and inline help
8. **Analytics**: Track drop-off points and completion rate

## API Endpoints

```typescript
// Create campaign
POST /functions/v1/campaign-create
{
  name: string,
  intent_description: string,
  ideal_customer: string,
  trigger_contexts?: string[],
  example_queries?: string[],
  negative_contexts?: string[],
  budget: number,
  daily_budget?: number,
  bid_cpc: number,
  ad_type: 'link_ad' | 'service_ad',
  ad_title: string,
  ad_body: string,
  ad_cta: string,
  ad_url: string,
  test_mode?: boolean
}

// Save draft
POST /api/campaign-drafts
{
  ...partial campaign data,
  current_step: number
}
```

## Design System

```css
/* Colors */
--primary: #3B82F6 (blue-500)
--secondary: #10B981 (emerald-500)
--accent: #F59E0B (amber-500)
--danger: #EF4444 (red-500)
--background: #FAFAFA
--card: #FFFFFF
--text: #1F2937
--text-muted: #6B7280

/* Spacing */
--space-xs: 0.5rem
--space-sm: 1rem
--space-md: 1.5rem
--space-lg: 2rem
--space-xl: 3rem

/* Components */
- Cards with subtle shadows
- Smooth transitions (150ms)
- Clear focus states
- Loading skeletons
- Toast notifications for actions
```

## State Management

```typescript
interface CampaignDraft {
  // Step 1
  name: string
  daily_budget: number
  total_budget: number
  bid_cpc: number
  test_mode: boolean

  // Step 2
  intent_description: string
  value_proposition: string

  // Step 3
  trigger_contexts: string[]
  example_queries: string[]
  negative_contexts: string[]

  // Step 4
  ideal_customer: string
  interests: string[]
  team_size: string[]

  // Step 5
  ad_type: 'link_ad' | 'service_ad'
  ad_title: string
  ad_body: string
  ad_cta: string
  ad_url: string
  promo_code?: string

  // API fields (if service_ad)
  service_endpoint?: string
  service_auth?: any

  // Meta
  current_step: number
  last_saved: Date
  validation_errors: Record<string, string>
}
```

## Implementation Priority

1. **Phase 1 (MVP)**: Steps 1, 2, 5, 6 - Basic campaign creation
2. **Phase 2**: Step 3 - Context triggers (THE KEY DIFFERENTIATOR)
3. **Phase 3**: Step 4 - Advanced audience targeting
4. **Phase 4**: API Integration ad type
5. **Phase 5**: Analytics and optimization recommendations

## Success Metrics

- Completion rate > 60%
- Average time to complete < 5 minutes
- Test mode adoption > 30%
- Context fields usage > 80%
- User satisfaction > 4.5/5

## Example Code for Step 3 (Context Triggers)

```jsx
function StepThreeTriggers({ campaign, updateCampaign }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          When should your ad appear?
          <span className="text-muted ml-2">Max 10 triggers</span>
        </label>
        <TagInput
          value={campaign.trigger_contexts}
          onChange={(tags) => updateCampaign({ trigger_contexts: tags })}
          placeholder="Type a situation and press Enter"
          maxTags={10}
          suggestions={TRIGGER_SUGGESTIONS}
        />
        <p className="text-sm text-muted mt-1">
          These situations trigger your ad to appear in relevant conversations
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Example user phrases
        </label>
        <TagInput
          value={campaign.example_queries}
          onChange={(tags) => updateCampaign({ example_queries: tags })}
          placeholder="What might users say?"
          maxTags={10}
          examples={[
            "how to review code faster",
            "automated PR reviews",
            "speed up development"
          ]}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Negative contexts
          <Tooltip content="Prevent wasted impressions by excluding irrelevant contexts" />
        </label>
        <TagInput
          value={campaign.negative_contexts}
          onChange={(tags) => updateCampaign({ negative_contexts: tags })}
          placeholder="When NOT to show your ad"
          maxTags={10}
          variant="danger"
        />
      </div>

      <InfoBox type="info">
        💡 <strong>Pro Tip:</strong> The more specific your triggers,
        the better your ads will match relevant conversations.
        Think about the exact moment when users need your solution.
      </InfoBox>
    </div>
  )
}
```

---

## Instructions for Replit

Build this campaign creation wizard as a modern React component with TypeScript. Focus on:
1. Clean, intuitive UX that guides users step-by-step
2. Real-time validation and helpful feedback
3. Mobile-responsive design
4. Smooth animations between steps
5. Clear visual hierarchy with proper spacing
6. Test mode prominently featured to reduce advertiser risk

The goal is to make campaign creation feel effortless while capturing rich context data for our semantic matching engine. Emphasize the unique "context-aware" aspects that differentiate us from traditional ad platforms.

Make it feel premium but approachable - like Stripe's onboarding flow meets LinkedIn's campaign manager.