import React from 'react';
import CodeBlock from '../../components/CodeBlock';

export default function FormattingPage() {
  return (
    <div>
      <h1>Response Formatting</h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">Format service ad responses for different agent frameworks.</p>
      
      <div className="mb-12">
        <h2>Format for Agent Output</h2>
        <CodeBlock language="typescript" code={`const service = await client.getService({
  taskDescription: "Translate document",
  placement: 'sponsored_tool'
});

// Format for agent consumption
const toolResult = {
  tool_name: service.creative.title,
  description: service.creative.body,
  endpoint: service.service_endpoint,
  auth_header: \`Bearer \${service.service_auth}\`,
  transaction_id: service.transaction_id
};`} />
      </div>
    </div>
  );
}
