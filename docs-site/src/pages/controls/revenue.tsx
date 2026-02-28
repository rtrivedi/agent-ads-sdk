import React from 'react';
import Link from 'next/link';
import CodeBlock from '../../components/CodeBlock';

export default function RevenuePage() {
  return (
    <div>
      <h1>Revenue Optimization</h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
        Maximize earnings with minimum CPC filters, relevance thresholds, and ranking strategies.
      </p>

      <div className="mb-12">
        <h2>Minimum CPC Filter</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Only show ads with bids at or above a specified cost-per-click threshold (in cents).
        </p>
        <CodeBlock language="typescript" code={`const ad = await client.decideFromContext({
  userMessage: "I need car insurance",
  minCPC: 100  // Only ads bidding >= $1.00 per click
});`} />
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Use Cases</h3>
          <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
            <li>Premium applications: 200+ for $2+ ads only</li>
            <li>High-value verticals: Filter out low-budget advertisers</li>
            <li>Revenue targets: Ensure minimum revenue per impression</li>
          </ul>
          <p className="text-slate-600 dark:text-slate-400 mt-4">
            <strong>Trade-off:</strong> Higher thresholds = higher revenue per ad but lower fill rate.
          </p>
        </div>
      </div>

      <div className="mb-12">
        <h2>Minimum Relevance Score</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Only show ads with semantic similarity at or above a threshold. Relevance scores range from 0.0 (unrelated) to 1.0 (perfect match).
        </p>
        <CodeBlock language="typescript" code={`const ad = await client.decideFromContext({
  userMessage: "Help me plan my wedding",
  minRelevanceScore: 0.8  // Only highly relevant ads
});`} />
      </div>

      <div className="mb-12">
        <h2>Ranking Strategy</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Choose how ads are ranked when multiple ads match the request.
        </p>
        <CodeBlock language="typescript" code={`// Revenue-optimized (default): highest bid wins
const ad = await client.decideFromContext({
  userMessage: "I need legal help",
  optimizeFor: 'revenue'  // Rank by bid × quality × relevance
});

// Relevance-optimized: best match wins
const ad = await client.decideFromContext({
  userMessage: "I need legal help",
  optimizeFor: 'relevance'  // Rank by semantic similarity only
});`} />
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
          <p className="text-blue-900 dark:text-blue-100 font-medium mb-2">Second-Price Auction</p>
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            Winner pays just enough to beat the next ad + $0.01, never more than their max bid. Minimum clearing price is $0.25.
          </p>
        </div>
      </div>

      <div className="mb-12">
        <h2>Combined Controls</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Combine multiple controls for precise ad selection:
        </p>
        <CodeBlock language="typescript" code={`// Premium legal assistant
const ad = await client.decideFromContext({
  userMessage: "I need estate planning help",
  minRelevanceScore: 0.8,    // Only highly relevant
  minCPC: 200,               // Only $2+ bids
  minQualityScore: 0.7,      // Only high-quality advertisers
  optimizeFor: 'relevance',  // Best match wins
  allowedCategories: [318]   // Legal services only
});`} />
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
        <h2>Next Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/api/parameters" className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-primary-500 transition-colors">
            <h3 className="font-semibold">Request Parameters →</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">See all available filtering parameters.</p>
          </Link>
          <Link href="/api/sdk" className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-primary-500 transition-colors">
            <h3 className="font-semibold">SDK Methods →</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Explore complete SDK reference.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
