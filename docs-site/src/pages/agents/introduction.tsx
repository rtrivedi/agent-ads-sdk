import React from 'react';
import Link from 'next/link';
import CodeBlock from '../../components/CodeBlock';

export default function AgentsIntroductionPage() {
  return (
    <div>
      <h1>AI Agents</h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
        Enable autonomous AI agents to discover and use sponsored services through tool calling and function execution.
      </p>

      <div className="mb-12">
        <h2>What are AI Agents?</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          AI agents are autonomous systems that can make decisions, call external tools, and execute tasks without direct user intervention. Unlike chatbots that respond to user messages, agents can:
        </p>
        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
          <li>Break down complex tasks into steps</li>
          <li>Discover and call external APIs autonomously</li>
          <li>Chain multiple tool calls together</li>
          <li>Make decisions based on tool outputs</li>
        </ul>
      </div>

      <div className="mb-12">
        <h2>Service Ads for Agents</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          AttentionMarket enables agents to discover sponsored services (APIs) that can help accomplish tasks. For example:
        </p>
        <CodeBlock
          language="typescript"
          code={`// Agent needs to translate a document
const service = await client.getService({
  taskDescription: "Translate document from English to Spanish",
  placement: 'sponsored_tool'
});

// Agent receives API endpoint and authentication
console.log(service.service_endpoint);
// https://api.translation-service.com/v1/translate

// Agent calls the service
const result = await fetch(service.service_endpoint, {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${service.service_auth}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: documentText,
    source_lang: 'en',
    target_lang: 'es'
  })
});

// Agent reports success
await client.logServiceResult({
  transaction_id: service.transaction_id,
  success: true
});`}
        />
      </div>

      <div className="mb-12">
        <h2>How It Works</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-primary-500 pl-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">1. Agent Identifies Task</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Agent determines it needs an external service (e.g., "translate document")</p>
          </div>
          <div className="border-l-4 border-primary-500 pl-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">2. Request Service</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Agent calls <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">getService()</code> with task description</p>
          </div>
          <div className="border-l-4 border-primary-500 pl-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">3. Receive Credentials</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">AttentionMarket returns service endpoint, auth token, and transaction ID</p>
          </div>
          <div className="border-l-4 border-primary-500 pl-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">4. Execute Service</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Agent calls the service endpoint with provided authentication</p>
          </div>
          <div className="border-l-4 border-primary-500 pl-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">5. Report Result</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Agent reports success/failure to AttentionMarket for billing</p>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2>Integration Patterns</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          AttentionMarket supports multiple agent frameworks:
        </p>
        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
          <li><strong>OpenAI Function Calling</strong> - Agents with tool definitions</li>
          <li><strong>LangChain Tools</strong> - Custom tools and agents</li>
          <li><strong>AutoGPT/BabyAGI</strong> - Autonomous task executors</li>
          <li><strong>Custom Agents</strong> - Any system that can call APIs</li>
        </ul>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
        <h2>Next Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/agents/setup" className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-primary-500 transition-colors">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Agent Setup →</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Configure your agent for service discovery.</p>
          </Link>
          <Link href="/agents/autonomous" className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-primary-500 transition-colors">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Autonomous Integration →</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Enable fully autonomous service discovery.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
