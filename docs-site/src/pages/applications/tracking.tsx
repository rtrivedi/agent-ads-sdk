import React from 'react';
import Link from 'next/link';
import CodeBlock from '../../components/CodeBlock';

export default function TrackingPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
        Tracking Events
      </h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
        Learn how to track impressions, clicks, and conversions to maximize revenue and improve ad quality.
      </p>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Automatic Impression Tracking
        </h2>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
          <p className="text-green-900 dark:text-green-100 font-medium mb-2">
            Impressions are Automatically Tracked
          </p>
          <p className="text-green-800 dark:text-green-200 text-sm">
            When using <code className="bg-green-100 dark:bg-green-800 px-1 py-0.5 rounded">decideFromContext()</code>, impressions are tracked automatically. You don't need to call any additional methods.
          </p>
        </div>
        <CodeBlock
          language="typescript"
          code={`// This automatically tracks an impression
const ad = await client.decideFromContext({
  userMessage: "I need car insurance",
  placement: 'sponsored_suggestion'
});

// Impression is recorded when ad is returned`}
        />
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Automatic Click Tracking
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Clicks are automatically tracked when users visit the <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">click_url</code>. This is the recommended approach.
        </p>
        <CodeBlock
          language="typescript"
          code={`// Use click_url for automatic tracking
const ad = await client.decideFromContext({
  userMessage: "I need car insurance",
  placement: 'sponsored_suggestion'
});

if (ad) {
  console.log(ad.click_url);
  // https://redirect.attentionmarket.ai/click?token=...
  // Click is tracked automatically when user visits this URL
}`}
        />

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
          <p className="text-blue-900 dark:text-blue-100 font-medium mb-2">
            Revenue Requirement
          </p>
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            As of v0.9.0, clicks without prior impressions will redirect users but will not generate revenue. Always display ads before allowing clicks.
          </p>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Manual Click Tracking
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          If you need to track clicks manually (e.g., for analytics), use <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">trackClickFromAd()</code>:
        </p>
        <CodeBlock
          language="typescript"
          code={`const ad = await client.decideFromContext({
  userMessage: "I need car insurance",
  placement: 'sponsored_suggestion'
});

// User clicks the ad
await client.trackClickFromAd(ad, {
  click_context: "User clicked 'Get Quotes' button"
});`}
        />

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-6 mb-3">
          Full Manual Tracking
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For advanced use cases, track clicks with full control:
        </p>
        <CodeBlock
          language="typescript"
          code={`await client.trackClick({
  agent_id: 'agt_YOUR_AGENT_ID',
  request_id: ad.request_id,
  decision_id: ad.decision_id,
  unit_id: ad._ad.unit_id,
  tracking_token: ad.tracking_token,
  href: ad.click_url,
  click_context: "User clicked on sponsored suggestion"
});`}
        />
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Conversion Tracking
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Track conversions (purchases, signups, etc.) to improve advertiser ROI and your quality score:
        </p>
        <CodeBlock
          language="typescript"
          code={`import { v4 as uuidv4 } from 'uuid';

// User completes a purchase after clicking an ad
await client.track({
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
});`}
        />

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
          <p className="text-blue-900 dark:text-blue-100 font-medium mb-2">
            Why Track Conversions?
          </p>
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            Conversion tracking helps advertisers measure ROI, which leads to higher bids and better quality ads for your application.
          </p>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Tracking URLs
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Every ad response includes multiple URL formats for different use cases:
        </p>
        <div className="space-y-4">
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">click_url</code> (Recommended)
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
              Auto-tracking redirect URL for browser clicks.
            </p>
            <code className="text-xs bg-slate-50 dark:bg-slate-800 p-2 rounded block overflow-x-auto">
              https://redirect.attentionmarket.ai/click?token=...
            </code>
          </div>
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">tracking_url</code>
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
              Server-side tracking URL for guaranteed click recording.
            </p>
            <code className="text-xs bg-slate-50 dark:bg-slate-800 p-2 rounded block overflow-x-auto">
              https://api.attentionmarket.ai/v1/track/click?token=...
            </code>
          </div>
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">tracked_url</code>
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
              Direct URL with tracking parameter (for SMS/email).
            </p>
            <code className="text-xs bg-slate-50 dark:bg-slate-800 p-2 rounded block overflow-x-auto">
              https://advertiser.com/landing?utm_source=attentionmarket&token=...
            </code>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Best Practices
        </h2>
        <div className="space-y-4">
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Always use click_url
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              This ensures clicks are tracked automatically without additional API calls.
            </p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Track conversions when possible
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Conversion tracking improves ad quality and can increase your revenue share.
            </p>
          </div>
          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Don't fabricate clicks or impressions
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Click fraud is detected and results in account suspension.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Next Steps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/controls/quality"
            className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-primary-500 transition-colors"
          >
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Quality Controls →
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Filter ads by quality score and category.
            </p>
          </Link>
          <Link
            href="/api/sdk"
            className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-primary-500 transition-colors"
          >
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              API Reference →
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Explore all SDK methods and parameters.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
