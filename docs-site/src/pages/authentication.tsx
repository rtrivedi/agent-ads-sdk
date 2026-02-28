import React from 'react';
import Link from 'next/link';
import CodeBlock from '../components/CodeBlock';

export default function AuthenticationPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
        Authentication
      </h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
        All API requests require authentication via an API key. Learn how to get your keys and authenticate SDK requests.
      </p>

      {/* API Key Types */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          API Key Types
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          AttentionMarket provides two types of API keys for different environments:
        </p>

        <div className="space-y-6">
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded text-xs font-mono font-semibold">
                am_test_...
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Test Keys
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-3">
                  Use test keys during development and testing. Test mode provides:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                  <li>Realistic ad data from test campaigns</li>
                  <li>No charges to advertisers</li>
                  <li>No real revenue generated</li>
                  <li>Same rate limits as live keys</li>
                  <li>Full access to all SDK features</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-2 py-1 rounded text-xs font-mono font-semibold">
                am_live_...
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Live Keys
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-3">
                  Use live keys in production. Live mode provides:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                  <li>Real advertisers and campaigns</li>
                  <li>Actual revenue from clicks and conversions</li>
                  <li>Production-level SLA guarantees</li>
                  <li>Access to all ad inventory</li>
                  <li>Real-time analytics and reporting</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-6">
          <p className="text-amber-900 dark:text-amber-100 font-medium mb-2">
            Important: Keep Keys Secure
          </p>
          <p className="text-amber-800 dark:text-amber-200 text-sm">
            API keys have full access to your account. Never commit keys to version control, share them publicly, or expose them in client-side code.
          </p>
        </div>
      </div>

      {/* Getting API Keys */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Getting Your API Keys
        </h2>
        <ol className="list-decimal list-inside space-y-3 text-slate-600 dark:text-slate-400">
          <li>
            Sign in to your <a href="https://api.attentionmarket.ai" className="text-primary-600 dark:text-primary-400 hover:underline">AttentionMarket dashboard</a>
          </li>
          <li>
            Navigate to <strong className="text-slate-900 dark:text-slate-100">API Keys</strong> in the sidebar
          </li>
          <li>
            Click <strong className="text-slate-900 dark:text-slate-100">Create API Key</strong>
          </li>
          <li>
            Choose your environment (Test or Live)
          </li>
          <li>
            Copy your API key and Agent ID (you won't be able to see the full key again)
          </li>
        </ol>
      </div>

      {/* Agent ID */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Agent ID
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Every API key is associated with an Agent ID (starts with <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">agt_</code>). The Agent ID identifies your application in the AttentionMarket ecosystem and is required for most SDK methods.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Your Agent ID is displayed alongside your API key in the dashboard.
        </p>
      </div>

      {/* SDK Configuration */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          SDK Configuration
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Initialize the SDK with your API key and Agent ID:
        </p>
        <CodeBlock
          language="typescript"
          title="Basic Configuration"
          code={`import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const client = new AttentionMarketClient({
  apiKey: 'am_live_YOUR_KEY_HERE',
  agentId: 'agt_YOUR_AGENT_ID_HERE'
});`}
        />

        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-8 mb-4">
          Advanced Configuration
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The SDK supports additional configuration options:
        </p>
        <CodeBlock
          language="typescript"
          code={`const client = new AttentionMarketClient({
  apiKey: 'am_live_YOUR_KEY_HERE',
  agentId: 'agt_YOUR_AGENT_ID_HERE',

  // Optional: Custom API endpoint (defaults to production)
  baseUrl: 'https://api.attentionmarket.ai/v1',

  // Optional: Request timeout in milliseconds
  timeoutMs: 4000,

  // Optional: Automatic retry count for failed requests
  maxRetries: 2
});`}
        />
      </div>

      {/* Environment Variables */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Using Environment Variables
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Store API keys in environment variables to keep them secure:
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-6 mb-3">
          Node.js / Next.js
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-3">
          Create a <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">.env.local</code> file:
        </p>
        <CodeBlock
          language="bash"
          title=".env.local"
          code={`ATTENTION_MARKET_API_KEY=am_live_YOUR_KEY_HERE
ATTENTION_MARKET_AGENT_ID=agt_YOUR_AGENT_ID_HERE`}
        />
        <p className="text-slate-600 dark:text-slate-400 mb-3 mt-4">
          Use in your code:
        </p>
        <CodeBlock
          language="typescript"
          code={`const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTION_MARKET_API_KEY!,
  agentId: process.env.ATTENTION_MARKET_AGENT_ID!
});`}
        />

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-8 mb-3">
          Python
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-3">
          Create a <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">.env</code> file and use python-dotenv:
        </p>
        <CodeBlock
          language="bash"
          title=".env"
          code={`ATTENTION_MARKET_API_KEY=am_live_YOUR_KEY_HERE
ATTENTION_MARKET_AGENT_ID=agt_YOUR_AGENT_ID_HERE`}
        />
        <CodeBlock
          language="python"
          code={`import os
from dotenv import load_dotenv
from attention_market import AttentionMarketClient

load_dotenv()

client = AttentionMarketClient(
    api_key=os.getenv('ATTENTION_MARKET_API_KEY'),
    agent_id=os.getenv('ATTENTION_MARKET_AGENT_ID')
)`}
        />

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-6">
          <p className="text-red-900 dark:text-red-100 font-medium mb-2">
            Never Commit API Keys
          </p>
          <p className="text-red-800 dark:text-red-200 text-sm mb-2">
            Add <code className="bg-red-100 dark:bg-red-800 px-1 py-0.5 rounded">.env</code> and <code className="bg-red-100 dark:bg-red-800 px-1 py-0.5 rounded">.env.local</code> to your <code className="bg-red-100 dark:bg-red-800 px-1 py-0.5 rounded">.gitignore</code>:
          </p>
          <CodeBlock
            language="bash"
            title=".gitignore"
            code={`.env
.env.local
.env.*.local`}
          />
        </div>
      </div>

      {/* Rate Limits */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Rate Limits
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          API requests are rate-limited to ensure fair resource allocation:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Per IP Address
            </h3>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1">
              60 requests/minute
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Applies to all requests from the same IP
            </p>
          </div>
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Per API Key
            </h3>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1">
              100 requests/minute
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Applies to all requests with the same key
            </p>
          </div>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mt-4">
          If you exceed rate limits, the API will return a <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">429 Too Many Requests</code> error. Contact support if you need higher limits.
        </p>
      </div>

      {/* Error Handling */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Authentication Errors
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The API returns specific error codes for authentication issues:
        </p>
        <div className="space-y-4">
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <code className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 px-2 py-1 rounded text-sm font-mono">
                401
              </code>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Unauthorized
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Missing or invalid API key. Verify your key is correct and not expired.
                </p>
              </div>
            </div>
          </div>
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <code className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 px-2 py-1 rounded text-sm font-mono">
                429
              </code>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Too Many Requests
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Rate limit exceeded. Wait before making additional requests or contact support for higher limits.
                </p>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-6 mb-3">
          Example Error Handling
        </h3>
        <CodeBlock
          language="typescript"
          code={`try {
  const ad = await client.decideFromContext({
    userMessage: "I need car insurance",
    placement: 'sponsored_suggestion'
  });
} catch (error) {
  if (error.status === 401) {
    console.error('Invalid API key. Check your credentials.');
  } else if (error.status === 429) {
    console.error('Rate limit exceeded. Please try again later.');
  } else {
    console.error('API error:', error.message);
  }
}`}
        />
      </div>

      {/* Next Steps */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Next Steps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/quickstart"
            className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-primary-500 transition-colors"
          >
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Quickstart Guide →
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Get started with your first ad request in 5 minutes.
            </p>
          </Link>
          <Link
            href="/api/errors"
            className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-primary-500 transition-colors"
          >
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Error Handling →
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Learn how to handle all API error codes.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
