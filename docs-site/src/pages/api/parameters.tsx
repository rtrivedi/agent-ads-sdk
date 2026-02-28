import React from 'react';
import CodeBlock from '../../components/CodeBlock';

export default function ParametersPage() {
  return (
    <div>
      <h1>Request Parameters</h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
        Complete reference for all request parameters in decideFromContext().
      </p>

      <div className="space-y-8 mb-12">
        <div className="border-l-4 border-primary-500 pl-4">
          <h3 className="font-mono text-sm text-primary-600 dark:text-primary-400 mb-2">userMessage</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2"><strong>Type:</strong> string (required)</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm">The current user message to match against ads.</p>
        </div>

        <div className="border-l-4 border-slate-300 dark:border-slate-700 pl-4">
          <h3 className="font-mono text-sm text-slate-900 dark:text-slate-100 mb-2">placement</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2"><strong>Type:</strong> 'sponsored_suggestion' | 'sponsored_block' | 'sponsored_tool'</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Where the ad will be displayed in your application.</p>
        </div>

        <div className="border-l-4 border-slate-300 dark:border-slate-700 pl-4">
          <h3 className="font-mono text-sm text-slate-900 dark:text-slate-100 mb-2">conversationHistory</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2"><strong>Type:</strong> string[] (optional)</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Previous messages in the conversation. Limited to last 5 messages.</p>
        </div>

        <div className="border-l-4 border-slate-300 dark:border-slate-700 pl-4">
          <h3 className="font-mono text-sm text-slate-900 dark:text-slate-100 mb-2">minQualityScore</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2"><strong>Type:</strong> number (0.0-1.0, optional)</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Minimum quality score threshold for ads.</p>
        </div>

        <div className="border-l-4 border-slate-300 dark:border-slate-700 pl-4">
          <h3 className="font-mono text-sm text-slate-900 dark:text-slate-100 mb-2">minCPC</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2"><strong>Type:</strong> number (cents, optional)</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Minimum cost-per-click in cents (e.g., 100 = $1.00).</p>
        </div>

        <div className="border-l-4 border-slate-300 dark:border-slate-700 pl-4">
          <h3 className="font-mono text-sm text-slate-900 dark:text-slate-100 mb-2">minRelevanceScore</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2"><strong>Type:</strong> number (0.0-1.0, optional)</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Minimum semantic relevance score threshold.</p>
        </div>

        <div className="border-l-4 border-slate-300 dark:border-slate-700 pl-4">
          <h3 className="font-mono text-sm text-slate-900 dark:text-slate-100 mb-2">optimizeFor</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2"><strong>Type:</strong> 'revenue' | 'relevance' (optional, default: 'revenue')</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Ranking strategy for ad selection.</p>
        </div>

        <div className="border-l-4 border-slate-300 dark:border-slate-700 pl-4">
          <h3 className="font-mono text-sm text-slate-900 dark:text-slate-100 mb-2">allowedCategories</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2"><strong>Type:</strong> number[] (optional)</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Whitelist of IAB category IDs. Only these categories will be shown.</p>
        </div>

        <div className="border-l-4 border-slate-300 dark:border-slate-700 pl-4">
          <h3 className="font-mono text-sm text-slate-900 dark:text-slate-100 mb-2">blockedCategories</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2"><strong>Type:</strong> number[] (optional)</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Blacklist of IAB category IDs. These categories will never be shown.</p>
        </div>

        <div className="border-l-4 border-slate-300 dark:border-slate-700 pl-4">
          <h3 className="font-mono text-sm text-slate-900 dark:text-slate-100 mb-2">blockedAdvertisers</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2"><strong>Type:</strong> string[] (optional)</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm">List of advertiser IDs to block.</p>
        </div>

        <div className="border-l-4 border-slate-300 dark:border-slate-700 pl-4">
          <h3 className="font-mono text-sm text-slate-900 dark:text-slate-100 mb-2">country</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2"><strong>Type:</strong> string (optional, default: 'US')</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm">ISO 3166-1 alpha-2 country code.</p>
        </div>

        <div className="border-l-4 border-slate-300 dark:border-slate-700 pl-4">
          <h3 className="font-mono text-sm text-slate-900 dark:text-slate-100 mb-2">language</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2"><strong>Type:</strong> string (optional, default: 'en')</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm">ISO 639-1 language code.</p>
        </div>

        <div className="border-l-4 border-slate-300 dark:border-slate-700 pl-4">
          <h3 className="font-mono text-sm text-slate-900 dark:text-slate-100 mb-2">platform</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2"><strong>Type:</strong> 'web' | 'ios' | 'android' | 'desktop' | 'voice' | 'other' (optional)</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Platform where the ad will be displayed.</p>
        </div>
      </div>
    </div>
  );
}
