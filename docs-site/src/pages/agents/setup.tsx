import React from 'react';
import Link from 'next/link';
import CodeBlock from '../../components/CodeBlock';

export default function AgentsSetupPage() {
  return (
    <div>
      <h1>Agent Setup</h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">Configure your AI agent to discover and use sponsored services.</p>
      
      <div className="mb-12">
        <h2>Basic Setup</h2>
        <CodeBlock language="typescript" code={`import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTION_MARKET_API_KEY!,
  agentId: process.env.ATTENTION_MARKET_AGENT_ID!
});

// Get service for a task
const service = await client.getService({
  taskDescription: "Translate document to Spanish",
  placement: 'sponsored_tool'
});`} />
      </div>

      <div className="mb-12">
        <h2>Service Response</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">Service ads include API endpoint and authentication:</p>
        <CodeBlock language="typescript" code={`interface ServiceAdResponse {
  service_endpoint: string;  // API endpoint to call
  service_auth: string;       // Bearer token for authentication
  transaction_id: string;     // Track this transaction
  creative: {
    title: string;            // Service name
    body: string;             // Service description
  };
}`} />
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
        <h2>Next Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/agents/autonomous" className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-primary-500 transition-colors">
            <h3 className="font-semibold">Autonomous Integration →</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Enable fully autonomous service discovery.</p>
          </Link>
          <Link href="/agents/tool-calling" className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-primary-500 transition-colors">
            <h3 className="font-semibold">Tool Calling →</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Integrate with OpenAI function calling.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
