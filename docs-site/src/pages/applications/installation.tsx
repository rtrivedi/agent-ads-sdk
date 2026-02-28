import React from 'react';
import Link from 'next/link';
import CodeBlock from '../../components/CodeBlock';

export default function ApplicationsInstallationPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
        Installation
      </h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
        Install the AttentionMarket SDK and configure authentication for your AI application.
      </p>

      {/* NPM Installation */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Install via NPM
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Install the SDK using npm or yarn:
        </p>
        <CodeBlock
          language="bash"
          code="npm install @the_ro_show/agent-ads-sdk"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          Or with yarn:
        </p>
        <CodeBlock
          language="bash"
          code="yarn add @the_ro_show/agent-ads-sdk"
        />
      </div>

      {/* Requirements */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Requirements
        </h2>
        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
          <li>Node.js 16 or higher</li>
          <li>TypeScript 4.5+ (optional but recommended)</li>
          <li>Modern browser or Node.js environment</li>
        </ul>
      </div>

      {/* Import */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Import the SDK
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Import the SDK in your application:
        </p>
        <CodeBlock
          language="typescript"
          title="TypeScript/JavaScript (ESM)"
          code={`import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';`}
        />
        <CodeBlock
          language="javascript"
          title="JavaScript (CommonJS)"
          code={`const { AttentionMarketClient } = require('@the_ro_show/agent-ads-sdk');`}
        />
      </div>

      {/* Configuration */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Configure the Client
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Initialize the client with your API key and Agent ID:
        </p>
        <CodeBlock
          language="typescript"
          code={`const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTION_MARKET_API_KEY!,
  agentId: process.env.ATTENTION_MARKET_AGENT_ID!
});`}
        />

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
          <p className="text-blue-900 dark:text-blue-100 font-medium mb-2">
            Getting API Keys
          </p>
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            Sign up at <a href="https://api.attentionmarket.ai" className="underline">api.attentionmarket.ai</a> to get your API key and Agent ID. See the <Link href="/authentication" className="underline">Authentication guide</Link> for details.
          </p>
        </div>
      </div>

      {/* Environment Variables */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Environment Variables
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Store your credentials in environment variables for security:
        </p>
        <CodeBlock
          language="bash"
          title=".env.local"
          code={`ATTENTION_MARKET_API_KEY=am_live_YOUR_KEY_HERE
ATTENTION_MARKET_AGENT_ID=agt_YOUR_AGENT_ID_HERE`}
        />
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
          <p className="text-amber-900 dark:text-amber-100 font-medium mb-2">
            Security Warning
          </p>
          <p className="text-amber-800 dark:text-amber-200 text-sm">
            Never commit API keys to version control. Add <code className="bg-amber-100 dark:bg-amber-800 px-1 py-0.5 rounded">.env.local</code> to your <code className="bg-amber-100 dark:bg-amber-800 px-1 py-0.5 rounded">.gitignore</code> file.
          </p>
        </div>
      </div>

      {/* Advanced Configuration */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Advanced Configuration
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Customize client behavior with optional parameters:
        </p>
        <CodeBlock
          language="typescript"
          code={`const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTION_MARKET_API_KEY!,
  agentId: process.env.ATTENTION_MARKET_AGENT_ID!,

  // Optional: Custom API endpoint
  baseUrl: 'https://api.attentionmarket.ai/v1',

  // Optional: Request timeout (default: 4000ms)
  timeoutMs: 5000,

  // Optional: Automatic retry count (default: 2)
  maxRetries: 3
});`}
        />
      </div>

      {/* TypeScript */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          TypeScript Support
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The SDK is written in TypeScript and includes full type definitions. No additional @types package needed.
        </p>
        <CodeBlock
          language="typescript"
          code={`import { AttentionMarketClient, AdResponse } from '@the_ro_show/agent-ads-sdk';

const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTION_MARKET_API_KEY!,
  agentId: process.env.ATTENTION_MARKET_AGENT_ID!
});

// Full type inference
const ad: AdResponse | null = await client.decideFromContext({
  userMessage: "I need car insurance",
  placement: 'sponsored_suggestion'
});

if (ad) {
  // TypeScript knows the structure
  console.log(ad.creative.title);
  console.log(ad.click_url);
  console.log(ad.payout);
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
            href="/applications/basic-integration"
            className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-primary-500 transition-colors"
          >
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Basic Integration →
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Complete example of integrating ads into your chatbot.
            </p>
          </Link>
          <Link
            href="/authentication"
            className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-primary-500 transition-colors"
          >
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Authentication →
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Learn about API keys and authentication.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
