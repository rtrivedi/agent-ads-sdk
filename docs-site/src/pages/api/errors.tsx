import React from 'react';
import CodeBlock from '../../components/CodeBlock';

export default function ErrorsPage() {
  return (
    <div>
      <h1>Error Handling</h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
        Learn how to handle validation errors, rate limits, and API failures.
      </p>

      <div className="mb-12">
        <h2>HTTP Status Codes</h2>
        <div className="space-y-4">
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <code className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 px-2 py-1 rounded text-sm font-mono">400</code>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Bad Request</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Invalid parameters. Check error message for details.</p>
              </div>
            </div>
          </div>
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <code className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 px-2 py-1 rounded text-sm font-mono">401</code>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Unauthorized</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Missing or invalid API key.</p>
              </div>
            </div>
          </div>
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <code className="bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 px-2 py-1 rounded text-sm font-mono">429</code>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Too Many Requests</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Rate limit exceeded. Wait before making additional requests.</p>
              </div>
            </div>
          </div>
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <code className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 px-2 py-1 rounded text-sm font-mono">500</code>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Internal Server Error</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Server error. Contact support if persistent.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2>Validation Errors</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The SDK validates parameters before API calls:
        </p>
        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 text-sm">
          <li><code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">minQualityScore must be a number between 0.0 and 1.0</code></li>
          <li><code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">minCPC must be a non-negative number (cost-per-click in cents)</code></li>
          <li><code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">minRelevanceScore must be a number between 0.0 and 1.0</code></li>
          <li><code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">optimizeFor must be either "revenue" or "relevance"</code></li>
          <li><code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">allowedCategories cannot be empty (would block all ads)</code></li>
        </ul>
      </div>

      <div className="mb-12">
        <h2>Error Handling Example</h2>
        <CodeBlock language="typescript" code={`try {
  const ad = await client.decideFromContext({
    userMessage: "I need car insurance",
    placement: 'sponsored_suggestion'
  });
  
  if (ad) {
    // Display ad
  }
} catch (error) {
  if (error.status === 401) {
    console.error('Invalid API key');
  } else if (error.status === 429) {
    console.error('Rate limit exceeded');
  } else if (error.status === 400) {
    console.error('Invalid parameters:', error.message);
  } else {
    console.error('API error:', error.message);
  }
  
  // Continue without ad - don't block user experience
}`} />
      </div>
    </div>
  );
}
