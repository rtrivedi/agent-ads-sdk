import React from 'react';
import CodeBlock from '../../components/CodeBlock';

export default function ResponsesPage() {
  return (
    <div>
      <h1>Response Formats</h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
        Complete reference for all API response formats.
      </p>

      <div className="mb-12">
        <h2>AdResponse</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Returned by <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">decideFromContext()</code>:
        </p>
        <CodeBlock language="typescript" code={`interface AdResponse {
  request_id: string;
  decision_id: string;
  advertiser_id: string;
  ad_type: 'link' | 'recommendation' | 'service';
  payout: number;  // Amount earned on conversion (in cents)

  creative: {
    title: string;
    body: string;
    cta: string;
    teaser?: string;      // Recommendation ads only
    promo_code?: string;  // Recommendation ads only
    message?: string;     // Recommendation ads only
  };

  click_url: string;        // Tracked click URL (use this)
  tracking_url?: string;    // Server-side tracking URL
  tracked_url?: string;     // Direct URL with tracking param
  tracking_token: string;   // For manual event tracking

  disclosure: {
    label: string;         // e.g., "Sponsored"
    explanation: string;
    sponsor_name: string;
  };

  _ad: {
    unit_id: string;
    campaign_id: string;
    _quality_score: number;
    _relevance_score: number;
  };
}`} />
      </div>

      <div className="mb-12">
        <h2>ServiceAdResponse</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Returned by <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">getService()</code>:
        </p>
        <CodeBlock language="typescript" code={`interface ServiceAdResponse {
  service_endpoint: string;  // API endpoint to call
  service_auth: string;       // Bearer token for authentication
  transaction_id: string;     // Track this transaction
  payout: number;            // Amount earned on completion (in cents)

  creative: {
    title: string;
    body: string;
  };

  disclosure: {
    label: string;
    sponsor_name: string;
  };
}`} />
      </div>

      <div className="mb-12">
        <h2>CategoryResponse</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Returned by <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">getCategories()</code>:
        </p>
        <CodeBlock language="typescript" code={`interface CategoryResponse {
  categories: Array<{
    id: number;
    name: string;
    parent_id: number | null;
    tier: number;
    full_path: string;
  }>;
}`} />
      </div>
    </div>
  );
}
