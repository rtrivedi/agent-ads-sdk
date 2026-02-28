import React from 'react';
import CodeBlock from '../../components/CodeBlock';

export default function ToolCallingPage() {
  return (
    <div>
      <h1>Tool Calling Integration</h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">Integrate AttentionMarket services with OpenAI function calling and LangChain tools.</p>
      
      <div className="mb-12">
        <h2>OpenAI Function Calling</h2>
        <CodeBlock language="typescript" code={`const tools = [{
  type: "function",
  function: {
    name: "get_sponsored_service",
    description: "Get a sponsored API service to accomplish a task",
    parameters: {
      type: "object",
      properties: {
        taskDescription: {
          type: "string",
          description: "Description of the task to accomplish"
        }
      },
      required: ["taskDescription"]
    }
  }
}];

// When agent calls get_sponsored_service
async function handleToolCall(taskDescription: string) {
  const service = await client.getService({
    taskDescription,
    placement: 'sponsored_tool'
  });
  return service;
}`} />
      </div>
    </div>
  );
}
