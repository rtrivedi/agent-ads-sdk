# Complete Replit Prompt for Campaign Creation UI

## Context
I'm building a campaign creation wizard for AttentionMarket, an AI-powered advertising platform. The system matches ads based on semantic context using embeddings, not demographics. I need to update my existing campaign creation UI to support context-aware targeting.

## Current State
I have a basic campaign form started. I need to reorganize it into a 6-step wizard with proper context fields and API integration.

## Backend API Endpoints

### 1. Create Campaign
```javascript
POST https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/campaign-create

Headers:
{
  "Authorization": "Bearer YOUR_ANON_KEY",
  "Content-Type": "application/json"
}

Body:
{
  // Required fields
  "name": "Summer Sale 2024",
  "budget": 10000, // Total budget in cents ($100.00)
  "daily_budget": 1000, // Daily budget in cents ($10.00)
  "bid_cpc": 50, // Max bid per click in cents ($0.50)
  "ad_type": "link_ad", // or "service_ad"

  // Context fields for embedding generation (CRITICAL)
  "intent_description": "Helps couples plan their perfect wedding without stress",
  "ideal_customer": "Couples planning a wedding in the next 6-12 months",
  "trigger_contexts": [
    "planning a wedding",
    "need wedding venue",
    "wedding stress"
  ],
  "example_queries": [
    "how to plan a wedding",
    "wedding venue ideas",
    "wedding planning checklist"
  ],
  "negative_contexts": [
    "free wedding planning",
    "DIY wedding",
    "courthouse wedding"
  ],

  // Ad content
  "ad_title": "Plan Your Dream Wedding",
  "ad_body": "Professional wedding planning made easy. Save time and reduce stress.",
  "ad_cta": "Get Started Free",
  "ad_url": "https://example.com/signup",
  "promo_code": "SAVE20" // optional
}

Response:
{
  "success": true,
  "campaign_id": "camp_abc123",
  "message": "Campaign created successfully"
}
```

### 2. Enrich Campaign (Automatic after creation)
```javascript
// This is called automatically after campaign creation
POST https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/enrich-campaign

Body:
{
  "campaign_id": "camp_abc123"
}

// This generates 7 embeddings:
// 1. Problem embedding (from intent_description)
// 2. Solution embedding (from ideal_customer + product info)
// 3. Audience embedding (from ideal_customer)
// 4. Use cases embedding (auto-generated)
// 5. Trigger contexts embedding (from trigger_contexts array)
// 6. Example queries embedding (from example_queries array)
// 7. Negative contexts embedding (from negative_contexts array)
```

### 3. Save Draft (Optional)
```javascript
POST https://YOUR_BACKEND/api/campaign-drafts

Body:
{
  "draft_data": { ...partial campaign data },
  "current_step": 3,
  "user_id": "user_123"
}
```

## Complete UI Implementation

### File Structure
```
src/
  components/
    CampaignWizard.jsx       // Main wizard container
    TagInput.jsx             // Reusable tag input component
    LivePreview.jsx          // Ad preview component
    StepIndicator.jsx        // Progress indicator
  steps/
    Step1Basics.jsx          // Campaign basics
    Step2Solution.jsx        // Problem/solution
    Step3Triggers.jsx        // Context triggers (KEY!)
    Step4Audience.jsx        // Target audience
    Step5Creative.jsx        // Ad creative
    Step6Review.jsx          // Review & launch
  utils/
    api.js                   // API calls
    validation.js            // Form validation
```

### Main Component: CampaignWizard.jsx
```jsx
import React, { useState, useEffect } from 'react';
import StepIndicator from './StepIndicator';
import Step1Basics from '../steps/Step1Basics';
import Step2Solution from '../steps/Step2Solution';
import Step3Triggers from '../steps/Step3Triggers';
import Step4Audience from '../steps/Step4Audience';
import Step5Creative from '../steps/Step5Creative';
import Step6Review from '../steps/Step6Review';

const SUPABASE_URL = 'https://peruwnbrqkvmrldhpoom.supabase.co';
const ANON_KEY = 'YOUR_ANON_KEY_HERE'; // Replace with actual key

export default function CampaignWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [campaignData, setCampaignData] = useState({
    // Step 1: Basics
    name: '',
    daily_budget: 10, // Default $10
    budget: 100, // Default $100 total
    bid_cpc: 0.50, // Default $0.50

    // Step 2: Solution
    intent_description: '',
    value_proposition: '',

    // Step 3: Context Triggers (CRITICAL FOR EMBEDDINGS)
    trigger_contexts: [],
    example_queries: [],
    negative_contexts: [],

    // Step 4: Audience
    ideal_customer: '',
    interests: [],

    // Step 5: Creative
    ad_type: 'link_ad',
    ad_title: '',
    ad_body: '',
    ad_cta: 'Learn More',
    ad_url: '',
    promo_code: '',
  });

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveDraft();
    }, 30000);
    return () => clearInterval(interval);
  }, [campaignData]);

  const saveDraft = async () => {
    try {
      await fetch('/api/campaign-drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft_data: campaignData,
          current_step: currentStep,
        }),
      });
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  const updateCampaignData = (updates) => {
    setCampaignData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const validateStep = (step) => {
    switch(step) {
      case 0: // Basics
        return campaignData.name && campaignData.daily_budget >= 10;
      case 1: // Solution
        return campaignData.intent_description.length >= 50 &&
               campaignData.value_proposition.length >= 20;
      case 2: // Triggers
        return campaignData.trigger_contexts.length >= 1; // At least one trigger required
      case 3: // Audience
        return campaignData.ideal_customer.length >= 20;
      case 4: // Creative
        return campaignData.ad_title && campaignData.ad_body && campaignData.ad_url;
      default:
        return true;
    }
  };

  const launchCampaign = async () => {
    try {
      // Convert dollars to cents for API
      const apiData = {
        ...campaignData,
        budget: Math.round(campaignData.budget * 100),
        daily_budget: Math.round(campaignData.daily_budget * 100),
        bid_cpc: Math.round(campaignData.bid_cpc * 100),
      };

      const response = await fetch(`${SUPABASE_URL}/functions/v1/campaign-create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      const result = await response.json();

      if (result.success) {
        // Campaign created successfully
        // The backend will automatically call enrich-campaign to generate embeddings
        alert(`Campaign launched! ID: ${result.campaign_id}`);
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to launch campaign:', error);
      alert('Failed to launch campaign. Please try again.');
    }
  };

  const steps = [
    <Step1Basics data={campaignData} updateData={updateCampaignData} />,
    <Step2Solution data={campaignData} updateData={updateCampaignData} />,
    <Step3Triggers data={campaignData} updateData={updateCampaignData} />,
    <Step4Audience data={campaignData} updateData={updateCampaignData} />,
    <Step5Creative data={campaignData} updateData={updateCampaignData} />,
    <Step6Review data={campaignData} onLaunch={launchCampaign} />,
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <StepIndicator currentStep={currentStep} />

      <div className="mt-8">
        {steps[currentStep]}
      </div>

      <div className="flex justify-between mt-8">
        {currentStep > 0 && (
          <button onClick={handleBack} className="btn-secondary">
            ← Back
          </button>
        )}

        {currentStep < 5 ? (
          <button onClick={handleNext} className="btn-primary ml-auto">
            Continue →
          </button>
        ) : (
          <button onClick={launchCampaign} className="btn-primary ml-auto">
            🚀 Launch Campaign
          </button>
        )}
      </div>

      <div className="text-center text-sm text-gray-500 mt-4">
        Auto-saved 2 seconds ago
      </div>
    </div>
  );
}
```

### Critical Component: Step3Triggers.jsx (Context-Aware Matching)
```jsx
import React from 'react';
import TagInput from '../components/TagInput';

export default function Step3Triggers({ data, updateData }) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">
          🎯 This is what makes us different!
        </h3>
        <p className="text-blue-800 text-sm">
          Unlike traditional ads, we match based on conversation context.
          The AI understands WHEN your solution is relevant, not just keywords.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          When should your ad appear? (Required)
          <span className="text-red-500 ml-1">*</span>
        </label>
        <TagInput
          tags={data.trigger_contexts}
          onAddTag={(tag) => updateData({
            trigger_contexts: [...data.trigger_contexts, tag]
          })}
          onRemoveTag={(index) => {
            const newTags = [...data.trigger_contexts];
            newTags.splice(index, 1);
            updateData({ trigger_contexts: newTags });
          }}
          maxTags={10}
          placeholder="Type a situation and press Enter (e.g., 'user asking about wedding venues')"
        />
        <p className="text-sm text-gray-600 mt-1">
          {data.trigger_contexts.length}/10 triggers added • These generate context embeddings
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Example phrases users might say
        </label>
        <TagInput
          tags={data.example_queries}
          onAddTag={(tag) => updateData({
            example_queries: [...data.example_queries, tag]
          })}
          onRemoveTag={(index) => {
            const newTags = [...data.example_queries];
            newTags.splice(index, 1);
            updateData({ example_queries: newTags });
          }}
          maxTags={10}
          placeholder="What would someone type? (e.g., 'how to plan a wedding')"
        />
        <p className="text-sm text-gray-600 mt-1">
          {data.example_queries.length}/10 phrases added
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          When NOT to show your ad (Negative Contexts)
        </label>
        <TagInput
          tags={data.negative_contexts}
          onAddTag={(tag) => updateData({
            negative_contexts: [...data.negative_contexts, tag]
          })}
          onRemoveTag={(index) => {
            const newTags = [...data.negative_contexts];
            newTags.splice(index, 1);
            updateData({ negative_contexts: newTags });
          }}
          maxTags={10}
          placeholder="Avoid these contexts (e.g., 'looking for free options')"
          variant="danger"
        />
        <p className="text-sm text-gray-600 mt-1">
          {data.negative_contexts.length}/10 exclusions added • Prevents wasted impressions
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold mb-2">How Context Matching Works</h4>
        <ol className="text-sm space-y-2">
          <li>1. Your contexts are converted into semantic embeddings</li>
          <li>2. When users chat with AI, their messages create embeddings</li>
          <li>3. We match based on meaning, not keywords</li>
          <li>4. Your ad appears when context similarity is high</li>
        </ol>
      </div>
    </div>
  );
}
```

### TagInput Component
```jsx
import React, { useState } from 'react';

export default function TagInput({
  tags = [],
  onAddTag,
  onRemoveTag,
  maxTags = 10,
  placeholder,
  variant = 'default'
}) {
  const [input, setInput] = useState('');

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && input.trim() && tags.length < maxTags) {
      e.preventDefault();
      onAddTag(input.trim());
      setInput('');
    }
  };

  const colorClasses = variant === 'danger'
    ? 'bg-red-100 text-red-700 border-red-300'
    : 'bg-blue-100 text-blue-700 border-blue-300';

  return (
    <div className={`border rounded-lg p-3 ${
      variant === 'danger' ? 'border-red-200' : 'border-gray-300'
    }`}>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <span key={index} className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${colorClasses}`}>
            {tag}
            <button
              onClick={() => onRemoveTag(index)}
              className="text-lg hover:opacity-70"
              type="button"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      {tags.length < maxTags && (
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="w-full outline-none bg-transparent"
        />
      )}
    </div>
  );
}
```

### Step1Basics.jsx (Updated with $10 default)
```jsx
export default function Step1Basics({ data, updateData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Campaign Basics</h2>
      <p className="text-gray-600">Let's start with the essentials. Start with just $10 to test performance.</p>

      <div>
        <label className="block text-sm font-medium mb-2">
          Campaign Name
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => updateData({ name: e.target.value })}
          placeholder="e.g., Summer Sale 2024"
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Daily Budget (USD)
          </label>
          <input
            type="number"
            min="10"
            value={data.daily_budget}
            onChange={(e) => updateData({ daily_budget: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum $10/day • Start small and scale
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Total Budget (USD)
          </label>
          <input
            type="number"
            min="10"
            value={data.budget}
            onChange={(e) => updateData({ budget: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Campaign stops at this limit
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Max Bid per Click (CPC)
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="0.10"
            max="5.00"
            step="0.10"
            value={data.bid_cpc}
            onChange={(e) => updateData({ bid_cpc: parseFloat(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>$0.10</span>
            <span className="font-semibold">${data.bid_cpc.toFixed(2)}</span>
            <span>$5.00</span>
          </div>
        </div>
        <div className="bg-blue-50 rounded p-3 mt-2">
          <p className="text-sm">
            <strong>Estimated Performance:</strong><br/>
            • {Math.round(data.daily_budget / data.bid_cpc)} - {Math.round(data.daily_budget / data.bid_cpc * 2)} clicks/day<br/>
            • 2,000 - 5,000 impressions/day
          </p>
        </div>
      </div>
    </div>
  );
}
```

### Step2Solution.jsx
```jsx
export default function Step2Solution({ data, updateData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Define Your Solution</h2>
      <p className="text-gray-600">Help our AI understand what problem you solve.</p>

      <div>
        <label className="block text-sm font-medium mb-2">
          What problem does your product solve?
          <span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          value={data.intent_description}
          onChange={(e) => updateData({ intent_description: e.target.value })}
          rows={4}
          maxLength={500}
          placeholder="Describe the specific pain point your product addresses. Be specific about the problem and its impact on your customers."
          className="w-full px-4 py-2 border rounded-lg"
        />
        <p className="text-sm text-gray-500 mt-1">
          {data.intent_description.length}/500 characters (min 50)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          What's your value proposition?
          <span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          value={data.value_proposition}
          onChange={(e) => updateData({ value_proposition: e.target.value })}
          rows={3}
          maxLength={300}
          placeholder="In one sentence, what makes you different? Focus on the outcome, not features."
          className="w-full px-4 py-2 border rounded-lg"
        />
        <p className="text-sm text-gray-500 mt-1">
          {data.value_proposition.length}/300 characters (min 20)
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-semibold text-amber-900 mb-2">💡 Writing Tips</h4>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>• Be specific about the problem</li>
          <li>• Include emotional impact</li>
          <li>• Quantify the pain if possible</li>
          <li>• Focus on outcomes, not features</li>
        </ul>
      </div>
    </div>
  );
}
```

### LivePreview Component
```jsx
export default function LivePreview({ title, body, cta, promoCode }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 sticky top-4">
      <h3 className="font-semibold mb-4">Live Preview</h3>

      <div className="bg-white rounded-lg border shadow-sm p-4">
        <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
          <span>🤖</span>
          <span>Sponsored • AttentionMarket</span>
        </div>

        <h4 className="font-semibold text-lg mb-2">
          {title || 'Your ad title will appear here'}
        </h4>

        <p className="text-gray-600 text-sm mb-3">
          {body || 'Your ad description will appear here. Make it compelling!'}
        </p>

        {promoCode && (
          <div className="text-sm text-blue-600 mb-3">
            🎫 Promo: {promoCode}
          </div>
        )}

        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          {cta || 'Learn More'} →
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        This is how your ad will appear in AI chat conversations
      </p>
    </div>
  );
}
```

## Styling (Tailwind Classes)

```css
/* Add to your global CSS */
.btn-primary {
  @apply bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition;
}

/* Form inputs */
input[type="text"],
input[type="number"],
input[type="url"],
textarea,
select {
  @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}
```

## Important Implementation Notes

1. **Default Budget**: Set to $10 (this is our "test mode" without calling it that)

2. **Context Fields are CRITICAL**: The `trigger_contexts`, `example_queries`, and `negative_contexts` arrays are what power our semantic matching. These get converted to embeddings on the backend.

3. **API Flow**:
   - User fills out 6-step form
   - Click "Launch Campaign" → POST to `/campaign-create`
   - Backend automatically calls `/enrich-campaign` to generate embeddings
   - Campaign is now live and matching conversations

4. **Validation Requirements**:
   - Step 1: Name required, minimum $10 budget
   - Step 2: Intent description (50+ chars), value prop (20+ chars)
   - Step 3: At least 1 trigger context (THIS IS KEY!)
   - Step 4: Ideal customer (20+ chars)
   - Step 5: All ad fields required

5. **The Secret Sauce**: Step 3 (Context Triggers) is what makes us different from Google/Facebook ads. The backend converts these into embeddings that match against user conversations semantically, not just keywords.

6. **Embedding Generation**: When the campaign is created, the backend generates 7 different embeddings:
   - Problem embedding (from intent_description)
   - Solution embedding
   - Audience embedding
   - Use cases embedding
   - Triggers embedding (from trigger_contexts)
   - Examples embedding (from example_queries)
   - Negatives embedding (from negative_contexts)

Build this as a modern React app with smooth transitions between steps, real-time validation, and a professional look. The goal is to make creating context-aware campaigns feel effortless while capturing the rich semantic data we need for AI-powered matching.

Make sure the TagInput component works smoothly - it's critical for Step 3. Users should be able to type naturally and press Enter to add tags, with visual feedback and easy removal.