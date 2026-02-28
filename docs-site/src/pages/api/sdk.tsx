import React from 'react';
import Link from 'next/link';
import CodeBlock from '../../components/CodeBlock';

export default function SDKMethodsPage() {
  return (
    <div>
      <h1>SDK Methods</h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
        Complete reference for all AttentionMarket SDK methods.
      </p>

      <div className="mb-12">
        <h2>decideFromContext()</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Request a contextual ad based on user message and conversation history. Automatically tracks impressions.
        </p>
        <CodeBlock language="typescript" code={`const ad = await client.decideFromContext({
  userMessage: "I need car insurance",
  conversationHistory: ["Previous messages..."],  // Optional
  placement: 'sponsored_suggestion',
  
  // Quality filters (optional)
  minQualityScore: 0.7,
  allowedCategories: [31],
  blockedCategories: [601],
  blockedAdvertisers: ['adv_123'],
  
  // Revenue optimization (optional)
  minCPC: 100,
  minRelevanceScore: 0.8,
  optimizeFor: 'revenue',  // or 'relevance'
  
  // Geographic/platform targeting (optional)
  country: 'US',
  language: 'en',
  platform: 'web'
});`} />
      </div>

      <div className="mb-12">
        <h2>trackClickFromAd()</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Track a click event from an ad object.
        </p>
        <CodeBlock language="typescript" code={`await client.trackClickFromAd(ad, {
  click_context: "User clicked 'Get Quotes' button"
});`} />
      </div>

      <div className="mb-12">
        <h2>track()</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Track custom events (conversions, impressions, clicks).
        </p>
        <CodeBlock language="typescript" code={`await client.track({
  event_id: \`evt_\${uuidv4()}\`,
  event_type: 'conversion',
  occurred_at: new Date().toISOString(),
  agent_id: 'agt_YOUR_AGENT_ID',
  request_id: ad.request_id,
  decision_id: ad.decision_id,
  unit_id: ad._ad.unit_id,
  tracking_token: ad.tracking_token,
  metadata: {
    conversion_value: 99.99,
    conversion_type: 'purchase'
  }
});`} />
      </div>

      <div className="mb-12">
        <h2>getService()</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Get a sponsored service ad for autonomous agents.
        </p>
        <CodeBlock language="typescript" code={`const service = await client.getService({
  taskDescription: "Translate document to Spanish",
  placement: 'sponsored_tool'
});`} />
      </div>

      <div className="mb-12">
        <h2>logServiceResult()</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Report the success or failure of a service call.
        </p>
        <CodeBlock language="typescript" code={`await client.logServiceResult({
  transaction_id: service.transaction_id,
  success: true
});`} />
      </div>

      <div className="mb-12">
        <h2>getCategories()</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Discover available IAB categories for filtering.
        </p>
        <CodeBlock language="typescript" code={`// Get top-level categories
const tier1 = await client.getCategories({ tier: 1 });

// Get subcategories
const sub = await client.getCategories({ parent_id: 1 });

// Search categories
const results = await client.getCategories({ search: 'insurance' });`} />
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
        <h2>Next Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/api/parameters" className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-primary-500 transition-colors">
            <h3 className="font-semibold">Request Parameters →</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">See all available parameters.</p>
          </Link>
          <Link href="/api/responses" className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-primary-500 transition-colors">
            <h3 className="font-semibold">Response Formats →</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Understand response structures.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
