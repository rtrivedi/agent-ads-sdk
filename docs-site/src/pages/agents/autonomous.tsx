import React from 'react';
import CodeBlock from '../../components/CodeBlock';

export default function AutonomousPage() {
  return (
    <div>
      <h1>Autonomous Integration</h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">Enable agents to autonomously discover and use sponsored services without manual intervention.</p>
      
      <div className="mb-12">
        <h2>Autonomous Service Discovery</h2>
        <CodeBlock language="typescript" code={`async function executeTask(task: string) {
  // Agent discovers service
  const service = await client.getService({
    taskDescription: task,
    placement: 'sponsored_tool'
  });

  // Agent calls service
  const result = await fetch(service.service_endpoint, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${service.service_auth}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ task })
  });

  // Report success
  await client.logServiceResult({
    transaction_id: service.transaction_id,
    success: result.ok
  });

  return result;
}`} />
      </div>
    </div>
  );
}
