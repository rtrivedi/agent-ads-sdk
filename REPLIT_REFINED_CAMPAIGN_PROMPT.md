# Refined Campaign Creation UI - Implementation Guide

## Quick Changes to Current Implementation

### 1. Remove Test Mode
- Remove the test mode toggle completely
- Set default budget to $10 (this IS the test mode)
- Landing page will explain "$10 minimum to start"

### 2. Reorganize the Flow

## UPDATED 6-Step Flow

---

### Step 1: Campaign Basics (UPDATE CURRENT)
```jsx
// Remove test mode, set $10 default
<div className="space-y-6">
  <div>
    <label>Campaign Name</label>
    <input
      type="text"
      placeholder="e.g. Summer Sale 2024"
      defaultValue="Summer Sale 2024"
    />
  </div>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <label>Daily Budget</label>
      <input
        type="number"
        min="10"
        defaultValue="10"  // Changed from 50
        placeholder="$10 minimum"
      />
      <span className="text-sm text-gray-500">Start with $10 to test performance</span>
    </div>

    <div>
      <label>Total Budget (USD)</label>
      <input
        type="number"
        min="10"
        defaultValue="100"  // Reasonable starting point
        placeholder="Campaign stops at this limit"
      />
    </div>
  </div>

  <div>
    <label>Max Bid per Click</label>
    <div className="flex items-center gap-4">
      <span>$0.10</span>
      <input
        type="range"
        min="0.10"
        max="5.00"
        step="0.10"
        defaultValue="0.50"
        className="flex-1"
      />
      <span>$5.00</span>
    </div>
    <div className="text-center text-sm text-gray-600">
      Current bid: $0.50 • Est. 20-40 clicks/day
    </div>
  </div>
</div>
```

---

### Step 2: Define Your Solution (NEW SECTION)
```jsx
<div className="space-y-6">
  <div>
    <label>What problem does your product solve?</label>
    <textarea
      rows={4}
      maxLength={500}
      placeholder="Describe the specific pain point your product addresses. Be specific about the problem and its impact."
      className="w-full"
    />
    <span className="text-sm text-gray-500">0/500 characters</span>
  </div>

  <div>
    <label>What's your value proposition?</label>
    <textarea
      rows={3}
      maxLength={300}
      placeholder="In one sentence, what makes you different? Focus on the outcome, not features."
      className="w-full"
    />
    <span className="text-sm text-gray-500">0/300 characters</span>
  </div>
</div>
```

---

### Step 3: Situational Triggers (MOST IMPORTANT - NEW)
```jsx
<div className="space-y-6">
  <div className="bg-blue-50 p-4 rounded-lg mb-6">
    <p className="text-sm">
      <strong>🎯 This is what makes us different!</strong> We match based on conversation context,
      not keywords. Tell us WHEN your solution is most relevant.
    </p>
  </div>

  <div>
    <label>When should your ad appear? (Trigger Contexts)</label>
    <TagInput
      placeholder="Type a situation and press Enter (e.g., 'user asking about wedding venues')"
      tags={triggerContexts}
      onAddTag={(tag) => setTriggerContexts([...triggerContexts, tag])}
      onRemoveTag={(index) => /* remove logic */}
      maxTags={10}
    />
    <span className="text-sm text-gray-500">{triggerContexts.length}/10 triggers</span>
  </div>

  <div>
    <label>Example phrases users might say</label>
    <TagInput
      placeholder="What would someone type? (e.g., 'need help planning wedding')"
      tags={exampleQueries}
      onAddTag={(tag) => setExampleQueries([...exampleQueries, tag])}
      maxTags={10}
    />
    <span className="text-sm text-gray-500">{exampleQueries.length}/10 phrases</span>
  </div>

  <div>
    <label>When NOT to show your ad (Negative Contexts)</label>
    <TagInput
      placeholder="Avoid these contexts (e.g., 'looking for free options')"
      tags={negativeContexts}
      onAddTag={(tag) => setNegativeContexts([...negativeContexts, tag])}
      maxTags={10}
      variant="danger"
    />
    <span className="text-sm text-gray-500">{negativeContexts.length}/10 exclusions</span>
  </div>
</div>
```

---

### Step 4: Target Audience (MERGE WITH EXISTING)
```jsx
<div className="space-y-6">
  <div>
    <label>Who is your ideal customer?</label>
    <textarea
      rows={3}
      placeholder="e.g. Couples planning a wedding in the US, typically 6-12 months before their date"
      defaultValue="Couples planning a wedding in the US"
      className="w-full"
    />
  </div>

  <div>
    <label>What problem does your product solve?</label>
    <textarea
      rows={4}
      placeholder="Describe the pain point your product or service addresses"
      className="w-full"
    />
  </div>

  <div>
    <label>What's your value proposition?</label>
    <textarea
      rows={2}
      placeholder="In one sentence, what makes you different?"
      className="w-full"
    />
  </div>
</div>
```

---

### Step 5: Ad Creative (UPDATE EXISTING)
Keep your current implementation but add:
- Character counters for title (60 chars) and description (150 chars)
- Make CTA a dropdown with common options
- Add the live preview on the right side

```jsx
<div className="grid grid-cols-2 gap-6">
  <div className="space-y-4">
    {/* Your existing form fields */}
    <div>
      <label>Ad Title</label>
      <input
        maxLength={60}
        placeholder="e.g. Try Something Blue Free"
      />
      <span className="text-sm">{title.length}/60</span>
    </div>

    {/* ... other fields ... */}
  </div>

  <div className="sticky top-4">
    <LivePreview
      title={adTitle}
      description={adDescription}
      cta={callToAction}
      promoCode={promoCode}
    />
  </div>
</div>
```

---

### Step 6: Review & Launch (NEW)
```jsx
<div className="space-y-6">
  <div className="grid grid-cols-2 gap-4">
    <SummaryCard title="Campaign Settings">
      <p>Name: {campaignName}</p>
      <p>Budget: ${totalBudget} (${dailyBudget}/day)</p>
      <p>Max CPC: ${maxBid}</p>
    </SummaryCard>

    <SummaryCard title="Context Matching">
      <p>{triggerContexts.length} trigger contexts</p>
      <p>{exampleQueries.length} example phrases</p>
      <p>{negativeContexts.length} negative contexts</p>
    </SummaryCard>
  </div>

  <div className="bg-green-50 p-6 rounded-lg">
    <h3 className="font-semibold mb-2">✅ Ready to Launch</h3>
    <ul className="space-y-2 text-sm">
      <li>✓ Budget configured (starting at $10)</li>
      <li>✓ Context triggers added</li>
      <li>✓ Ad creative complete</li>
      <li>✓ Landing page verified</li>
    </ul>
  </div>

  <div className="flex gap-4">
    <button className="btn-secondary">Save as Draft</button>
    <button className="btn-primary">
      🚀 Launch Campaign
    </button>
  </div>
</div>
```

---

## Component Updates Needed

### 1. Add TagInput Component
```jsx
function TagInput({ tags, onAddTag, onRemoveTag, maxTags, placeholder, variant }) {
  const [input, setInput] = useState('');

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && input.trim() && tags.length < maxTags) {
      e.preventDefault();
      onAddTag(input.trim());
      setInput('');
    }
  };

  return (
    <div className={`border rounded-lg p-3 ${variant === 'danger' ? 'border-red-300' : 'border-gray-300'}`}>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <span key={index} className={`px-3 py-1 rounded-full text-sm ${
            variant === 'danger' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {tag}
            <button onClick={() => onRemoveTag(index)} className="ml-2">×</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={tags.length >= maxTags}
        className="w-full outline-none"
      />
    </div>
  );
}
```

### 2. Add LivePreview Component
```jsx
function LivePreview({ title, description, cta, promoCode }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg sticky top-4">
      <h3 className="font-semibold mb-4">Live Preview</h3>
      <div className="bg-white p-4 rounded border">
        <div className="text-xs text-gray-500 mb-2">🤖 Sponsored • Megan Inc</div>
        <h4 className="font-semibold">{title || 'Your ad title'}</h4>
        <p className="text-sm text-gray-600 mt-2">
          {description || 'Your ad description will appear here'}
        </p>
        {promoCode && (
          <div className="mt-2 text-sm text-blue-600">
            Promo: {promoCode}
          </div>
        )}
        <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded">
          {cta || 'Learn More'} →
        </button>
      </div>
    </div>
  );
}
```

### 3. Update Navigation
```jsx
const steps = [
  'Campaign Basics',
  'Define Solution',
  'Context Triggers', // This is the key differentiator
  'Target Audience',
  'Ad Creative',
  'Review & Launch'
];

// Add step indicator at top
<div className="flex justify-between mb-8">
  {steps.map((step, index) => (
    <div key={index} className={`flex items-center ${
      index <= currentStep ? 'text-blue-600' : 'text-gray-400'
    }`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200'
      }`}>
        {index + 1}
      </div>
      <span className="ml-2 text-sm">{step}</span>
    </div>
  ))}
</div>
```

---

## API Integration

```javascript
// When submitting the campaign
const campaignData = {
  // Basics
  name: campaignName,
  budget: totalBudget * 100, // Convert to cents
  daily_budget: dailyBudget * 100,
  bid_cpc: maxBid * 100,

  // Context (THE KEY PART)
  intent_description: problemStatement,
  ideal_customer: idealCustomer,
  trigger_contexts: triggerContexts, // Array of strings
  example_queries: exampleQueries,   // Array of strings
  negative_contexts: negativeContexts, // Array of strings

  // Ad
  ad_type: 'link_ad',
  ad_title: adTitle,
  ad_body: adDescription,
  ad_cta: callToAction,
  ad_url: landingUrl,
  promo_code: promoCode || null
};

// POST to your API
fetch('/api/campaigns', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(campaignData)
});
```

---

## Key Points for Implementation

1. **Default $10 budget** - This IS the test mode, no toggle needed
2. **Step 3 (Context Triggers)** - Make this visually distinct, it's our differentiator
3. **Live preview** - Show how the ad appears in AI conversations
4. **Character limits** - Enforce on all text fields
5. **Validation** - Require at least 1 trigger context before launching
6. **Auto-save** - Save draft every 30 seconds

The focus should be on making the context triggers (Step 3) feel powerful and unique, since that's what makes AttentionMarket different from traditional ad platforms.