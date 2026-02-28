import React from 'react';
import Link from 'next/link';
import CodeBlock from '../components/CodeBlock';

export default function HomePage() {
  return (
    <div className="max-w-5xl">
      {/* Hero Section */}
      <div className="mb-16">
        <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Monetize Your AI Application
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
          AttentionMarket matches user intent with relevant sponsored content, enabling you to generate revenue from every conversation. Add contextual advertising to your AI chatbot, assistant, or agent in minutes.
        </p>
        <div className="flex items-center space-x-4">
          <Link
            href="/quickstart"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/api/sdk"
            className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            View API Reference
          </Link>
        </div>
      </div>

      {/* Code Example */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Simple Integration
        </h2>
        <CodeBlock
          language="typescript"
          code={`import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const client = new AttentionMarketClient({
  apiKey: 'am_live_YOUR_KEY',
  agentId: 'agt_YOUR_AGENT_ID'
});

// Request a contextual ad
const ad = await client.decideFromContext({
  userMessage: "I'm looking for car insurance",
  placement: 'sponsored_suggestion'
});

if (ad) {
  console.log(ad.creative.title);  // "Get 20% off car insurance"
  console.log(ad.creative.body);   // "Compare quotes from top providers"
  console.log(ad.click_url);       // Auto-tracked click URL
}`}
        />
      </div>

      {/* Feature Grid */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-8">
          Why AttentionMarket?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Contextual Matching
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Vector-based semantic search ensures ads match user intent. Only show relevant sponsored content that adds value to the conversation.
            </p>
          </div>
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Quality Controls
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Filter ads by quality score, relevance threshold, category, and minimum bid. Maintain brand safety while maximizing revenue.
            </p>
          </div>
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Automatic Tracking
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Impressions and clicks are automatically tracked via redirect URLs. No additional API calls required for basic monetization.
            </p>
          </div>
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Revenue Optimization
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Second-price auction ensures fair pricing. Optimize for revenue or relevance based on your application's priorities.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
          Get Started
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/quickstart"
            className="border border-slate-200 dark:border-slate-800 rounded-lg p-6 hover:border-primary-500 dark:hover:border-primary-500 transition-colors group"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400">
              Quickstart Guide →
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Install the SDK and serve your first ad in 5 minutes.
            </p>
          </Link>
          <Link
            href="/applications/introduction"
            className="border border-slate-200 dark:border-slate-800 rounded-lg p-6 hover:border-primary-500 dark:hover:border-primary-500 transition-colors group"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400">
              AI Applications →
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Integrate ads into chatbots, assistants, and conversational apps.
            </p>
          </Link>
          <Link
            href="/agents/introduction"
            className="border border-slate-200 dark:border-slate-800 rounded-lg p-6 hover:border-primary-500 dark:hover:border-primary-500 transition-colors group"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400">
              AI Agents →
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Enable autonomous agents to discover and call sponsored services.
            </p>
          </Link>
        </div>
      </div>

      {/* Additional Resources */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
          Resources
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">
              <Link href="/controls/quality" className="text-primary-600 dark:text-primary-400 hover:underline">
                Quality Controls
              </Link>
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Filter ads by quality score, category, and advertiser to maintain brand safety.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">
              <Link href="/controls/revenue" className="text-primary-600 dark:text-primary-400 hover:underline">
                Revenue Optimization
              </Link>
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Maximize earnings with minimum CPC filters and relevance-based ranking.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">
              <Link href="/api/errors" className="text-primary-600 dark:text-primary-400 hover:underline">
                Error Handling
              </Link>
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Learn how to handle validation errors, rate limits, and API failures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
