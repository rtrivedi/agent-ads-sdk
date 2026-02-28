import React from 'react';
import Link from 'next/link';
import CodeBlock from '../components/CodeBlock';

export default function QuickstartPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
        Quickstart Guide
      </h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
        Get started with AttentionMarket SDK in 5 minutes. This guide will walk you through installation, authentication, and serving your first ad.
      </p>

      {/* Prerequisites */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Prerequisites
        </h2>
        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
          <li>Node.js 16+ or Python 3.8+</li>
          <li>An AttentionMarket account (sign up at <a href="https://api.attentionmarket.ai" className="text-primary-600 dark:text-primary-400 hover:underline">api.attentionmarket.ai</a>)</li>
          <li>Your API key and Agent ID from the dashboard</li>
        </ul>
      </div>

      {/* Step 1: Installation */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Step 1: Install the SDK
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Install the AttentionMarket SDK using npm or yarn:
        </p>
        <CodeBlock
          language="bash"
          code="npm install @the_ro_show/agent-ads-sdk"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4">
          Or with yarn:
        </p>
        <CodeBlock
          language="bash"
          code="yarn add @the_ro_show/agent-ads-sdk"
        />
      </div>

      {/* Step 2: Get API Keys */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Step 2: Get Your API Keys
        </h2>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <p className="text-blue-900 dark:text-blue-100 font-medium mb-2">
            Test vs. Live Keys
          </p>
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            Use <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded">am_test_...</code> keys for development (no charges, test data only). Switch to <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded">am_live_...</code> keys in production.
          </p>
        </div>
        <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-400">
          <li>Sign in to your <a href="https://api.attentionmarket.ai" className="text-primary-600 dark:text-primary-400 hover:underline">AttentionMarket dashboard</a></li>
          <li>Navigate to "API Keys" in the sidebar</li>
          <li>Copy your API key (starts with <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">am_test_</code> or <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">am_live_</code>)</li>
          <li>Copy your Agent ID (starts with <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">agt_</code>)</li>
        </ol>
      </div>

      {/* Step 3: Initialize Client */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Step 3: Initialize the Client
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Create a new AttentionMarket client with your credentials:
        </p>
        <CodeBlock
          language="typescript"
          title="TypeScript/JavaScript"
          code={`import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const client = new AttentionMarketClient({
  apiKey: 'am_test_YOUR_KEY_HERE',
  agentId: 'agt_YOUR_AGENT_ID_HERE'
});`}
        />
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
          <p className="text-amber-900 dark:text-amber-100 font-medium mb-2">
            Security Best Practice
          </p>
          <p className="text-amber-800 dark:text-amber-200 text-sm">
            Never hardcode API keys in your source code. Use environment variables instead:
          </p>
          <CodeBlock
            language="typescript"
            code={`const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTION_MARKET_API_KEY,
  agentId: process.env.ATTENTION_MARKET_AGENT_ID
});`}
          />
        </div>
      </div>

      {/* Step 4: Request an Ad */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Step 4: Request Your First Ad
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">decideFromContext()</code> to request a contextual ad based on the user's message:
        </p>
        <CodeBlock
          language="typescript"
          code={`const ad = await client.decideFromContext({
  userMessage: "I'm looking for car insurance",
  placement: 'sponsored_suggestion'
});

if (ad) {
  console.log('Ad Title:', ad.creative.title);
  console.log('Ad Body:', ad.creative.body);
  console.log('Call to Action:', ad.creative.cta);
  console.log('Click URL:', ad.click_url);
  console.log('Payout:', ad.payout / 100, 'USD');
} else {
  console.log('No ad available for this context');
}`}
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4">
          The SDK automatically tracks impressions and returns ads with pre-tracked click URLs. When users click <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">click_url</code>, clicks are recorded automatically.
        </p>
      </div>

      {/* Step 5: Display the Ad */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Step 5: Display the Ad to Users
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Here's a complete example showing how to integrate ads into a chatbot:
        </p>
        <CodeBlock
          language="typescript"
          code={`async function handleUserMessage(userMessage: string) {
  // Get contextual ad
  const ad = await client.decideFromContext({
    userMessage: userMessage,
    placement: 'sponsored_suggestion'
  });

  // Generate AI response
  const aiResponse = await generateResponse(userMessage);

  // Include ad if available
  if (ad) {
    return {
      message: aiResponse,
      sponsoredContent: {
        title: ad.creative.title,
        body: ad.creative.body,
        cta: ad.creative.cta,
        clickUrl: ad.click_url,
        disclosure: ad.disclosure.label  // e.g., "Sponsored"
      }
    };
  }

  return { message: aiResponse };
}`}
        />
      </div>

      {/* Complete Example */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Complete Example
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Put it all together:
        </p>
        <CodeBlock
          language="typescript"
          code={`import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

// Initialize client
const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTION_MARKET_API_KEY,
  agentId: process.env.ATTENTION_MARKET_AGENT_ID
});

// Request contextual ad
async function getContextualAd(userMessage: string) {
  try {
    const ad = await client.decideFromContext({
      userMessage: userMessage,
      placement: 'sponsored_suggestion',
      minQualityScore: 0.5  // Optional: filter low-quality ads
    });

    return ad;
  } catch (error) {
    console.error('Failed to fetch ad:', error);
    return null;
  }
}

// Example usage
const ad = await getContextualAd("I'm looking for car insurance");

if (ad) {
  console.log(\`
    Title: \${ad.creative.title}
    Body: \${ad.creative.body}
    CTA: \${ad.creative.cta}
    Click URL: \${ad.click_url}
    Payout: $\${ad.payout / 100}
    Disclosure: \${ad.disclosure.label}
  \`);
}`}
        />
      </div>

      {/* Testing */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Testing Your Integration
        </h2>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
          <p className="text-green-900 dark:text-green-100 font-medium mb-2">
            Test Mode Benefits
          </p>
          <p className="text-green-800 dark:text-green-200 text-sm">
            Test API keys return realistic ad data without charging advertisers or generating real revenue. Perfect for development and testing.
          </p>
        </div>
        <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-400">
          <li>Use your test API key (<code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">am_test_...</code>)</li>
          <li>Make requests with various user messages to test contextual matching</li>
          <li>Verify impressions are tracked in your dashboard</li>
          <li>Click the <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">click_url</code> to test click tracking</li>
          <li>Check your dashboard to see tracked events</li>
        </ol>
      </div>

      {/* Next Steps */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Next Steps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/applications/basic-integration"
            className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-primary-500 transition-colors"
          >
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Complete Integration Guide →
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Learn best practices for integrating ads into your application.
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
              Filter ads by quality score, category, and relevance.
            </p>
          </Link>
          <Link
            href="/applications/tracking"
            className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-primary-500 transition-colors"
          >
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Tracking Events →
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Track conversions and optimize ad performance.
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
