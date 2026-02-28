import React from 'react';
import Link from 'next/link';
import CodeBlock from '../../components/CodeBlock';

export default function PlacementsPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
        Ad Placements
      </h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
        Learn about different ad placement types and when to use each one for optimal user experience and revenue.
      </p>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Placement Types
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          AttentionMarket supports three placement types, each designed for different user experience patterns:
        </p>

        <div className="space-y-8">
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
              sponsored_suggestion
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Display ads as conversational suggestions within the chat flow. This is the most natural placement for AI applications.
            </p>
            <div className="bg-slate-50 dark:bg-slate-800 rounded p-4 mb-4">
              <p className="text-slate-900 dark:text-slate-100 font-medium mb-2">Example:</p>
              <div className="space-y-2 text-sm">
                <div className="bg-white dark:bg-slate-700 rounded p-2">
                  <strong>User:</strong> "I'm looking for car insurance"
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                  <strong>Agent:</strong> "I can help you compare rates..."
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded p-3 border-l-4 border-green-500">
                  <div className="text-xs text-slate-500 mb-1">Sponsored</div>
                  <div className="font-semibold">Compare Car Insurance Quotes</div>
                  <div className="text-sm">Get quotes from top providers in 2 minutes</div>
                </div>
              </div>
            </div>
            <CodeBlock
              language="typescript"
              code={`const ad = await client.decideFromContext({
  userMessage: "I'm looking for car insurance",
  placement: 'sponsored_suggestion'
});`}
            />
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
              sponsored_block
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Display ads in a dedicated section of your UI (sidebar, banner, etc.). Traditional display advertising placement.
            </p>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              <strong>Best for:</strong> Web applications with sidebars, dashboards, or persistent ad spaces.
            </p>
            <CodeBlock
              language="typescript"
              code={`const ad = await client.decideFromContext({
  userMessage: "I'm looking for car insurance",
  placement: 'sponsored_block'
});`}
            />
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
              sponsored_tool
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              For autonomous AI agents that can call external services and APIs. Agents discover and use sponsored tools based on task requirements.
            </p>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              <strong>Best for:</strong> Autonomous agents with tool-calling capabilities (OpenAI function calling, LangChain tools, etc.)
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              See <Link href="/agents/introduction" className="text-primary-600 dark:text-primary-400 hover:underline">AI Agents documentation</Link> for details.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Choosing the Right Placement
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-slate-200 dark:border-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Application Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Recommended Placement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Chat-based assistants</td>
                <td className="px-4 py-3"><code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">sponsored_suggestion</code></td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Voice assistants</td>
                <td className="px-4 py-3"><code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">sponsored_suggestion</code></td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Web dashboards</td>
                <td className="px-4 py-3"><code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">sponsored_block</code></td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Mobile apps</td>
                <td className="px-4 py-3"><code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">sponsored_suggestion</code></td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Autonomous agents</td>
                <td className="px-4 py-3"><code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">sponsored_tool</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Best Practices
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              1. Match Placement to User Intent
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              Show conversational ads (<code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">sponsored_suggestion</code>) when users are actively seeking information. Use block ads (<code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">sponsored_block</code>) for background monetization.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              2. Always Include Disclosure
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              Display <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">ad.disclosure.label</code> (e.g., "Sponsored") to clearly mark ads. This is required by advertising standards.
            </p>
            <CodeBlock
              language="typescript"
              code={`<div className="text-xs text-gray-500 mb-1">
  {ad.disclosure.label}  {/* "Sponsored" */}
</div>`}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              3. Don't Over-Monetize
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Show ads contextually, not on every message. Quality over quantity leads to better click-through rates and user satisfaction.
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
            href="/applications/tracking"
            className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-primary-500 transition-colors"
          >
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Tracking Events →
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Learn how to track clicks and conversions.
            </p>
          </Link>
          <Link
            href="/controls/quality"
            className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-primary-500 transition-colors"
          >
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Quality Controls →
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Filter ads by quality, category, and relevance.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
