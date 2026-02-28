import React from 'react';
import Link from 'next/link';
import CodeBlock from '../../components/CodeBlock';

export default function QualityPage() {
  return (
    <div>
      <h1>Quality Controls</h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
        Filter ads by quality score and advertiser to maintain brand safety and user experience.
      </p>

      <div className="mb-12">
        <h2>Minimum Quality Score</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Quality scores range from 0.0 (worst) to 1.0 (best) and are calculated from click-through rates, conversion rates, and user feedback.
        </p>
        <CodeBlock language="typescript" code={`const ad = await client.decideFromContext({
  userMessage: "I need legal help",
  minQualityScore: 0.7  // Only show ads with quality >= 0.7
});`} />
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Recommended Thresholds</h3>
          <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
            <li><strong>0.8+</strong> - Premium applications (high-quality experiences only)</li>
            <li><strong>0.7+</strong> - Brand-sensitive contexts (avoid low-quality advertisers)</li>
            <li><strong>0.5+</strong> - General applications (balanced quality and fill rate)</li>
          </ul>
        </div>
      </div>

      <div className="mb-12">
        <h2>Advertiser Blocklist</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Block specific advertisers by ID (e.g., based on user feedback or competitive conflicts).
        </p>
        <CodeBlock language="typescript" code={`const ad = await client.decideFromContext({
  userMessage: "I need legal help",
  blockedAdvertisers: ['adv_abc123', 'adv_xyz789']
});`} />
        <p className="text-slate-600 dark:text-slate-400 mt-4">
          Advertiser IDs are included in ad responses as <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">advertiser_id</code>.
        </p>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
        <h2>Next Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/controls/categories" className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-primary-500 transition-colors">
            <h3 className="font-semibold">Category Filtering →</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Filter ads by IAB category taxonomy.</p>
          </Link>
          <Link href="/controls/revenue" className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-primary-500 transition-colors">
            <h3 className="font-semibold">Revenue Optimization →</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Maximize earnings with CPC and relevance filters.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
