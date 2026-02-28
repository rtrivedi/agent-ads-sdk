import React from 'react';
import Link from 'next/link';
import CodeBlock from '../../components/CodeBlock';

export default function ApplicationsIntroductionPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
        AI Applications
      </h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
        Monetize your AI chatbot, assistant, or conversational application with contextual advertising. AttentionMarket makes it easy to add relevant sponsored content that enhances user experience while generating revenue.
      </p>

      {/* What are AI Applications */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          What are AI Applications?
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          AI applications are conversational interfaces powered by large language models. They include:
        </p>
        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-6">
          <li><strong className="text-slate-900 dark:text-slate-100">Chatbots</strong> - Customer support, sales assistants, FAQ bots</li>
          <li><strong className="text-slate-900 dark:text-slate-100">Virtual Assistants</strong> - Personal productivity, scheduling, task management</li>
          <li><strong className="text-slate-900 dark:text-slate-100">Domain Specialists</strong> - Legal, medical, financial advisors</li>
          <li><strong className="text-slate-900 dark:text-slate-100">Content Generators</strong> - Writing tools, code assistants, creative tools</li>
        </ul>
        <p className="text-slate-600 dark:text-slate-400">
          AttentionMarket helps you monetize these applications by showing contextually relevant ads based on user intent.
        </p>
      </div>

      {/* How It Works */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          How It Works
        </h2>
        <div className="space-y-6">
          <div className="border-l-4 border-primary-500 pl-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              1. User Sends Message
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Your application receives a message from the user (e.g., "I'm looking for car insurance").
            </p>
          </div>
          <div className="border-l-4 border-primary-500 pl-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              2. Request Contextual Ad
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Your application calls <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">decideFromContext()</code> with the user's message and conversation history.
            </p>
          </div>
          <div className="border-l-4 border-primary-500 pl-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              3. AI Matches Intent
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              AttentionMarket uses vector embeddings to match user intent with relevant advertiser campaigns (e.g., insurance comparison services).
            </p>
          </div>
          <div className="border-l-4 border-primary-500 pl-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              4. Display Ad to User
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Your application shows the ad alongside the AI response. Impressions are automatically tracked.
            </p>
          </div>
          <div className="border-l-4 border-primary-500 pl-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              5. User Clicks Ad
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              When the user clicks the <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">click_url</code>, they're redirected to the advertiser. Clicks are automatically tracked and you earn revenue.
            </p>
          </div>
        </div>
      </div>

      {/* Example Use Case */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Example: Insurance Chatbot
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Here's how a customer support chatbot might integrate AttentionMarket:
        </p>
        <CodeBlock
          language="typescript"
          code={`async function handleUserMessage(message: string) {
  // Get contextual ad based on user's message
  const ad = await client.decideFromContext({
    userMessage: message,
    placement: 'sponsored_suggestion'
  });

  // Generate AI response
  const aiResponse = await generateAIResponse(message);

  // Return both AI response and ad
  return {
    response: aiResponse,
    sponsoredAd: ad ? {
      title: ad.creative.title,
      body: ad.creative.body,
      cta: ad.creative.cta,
      url: ad.click_url,
      disclosure: ad.disclosure.label
    } : null
  };
}

// Example user interaction
const result = await handleUserMessage(
  "My car insurance is too expensive"
);

console.log(result.response);
// "I can help you find better rates. Have you compared quotes recently?"

console.log(result.sponsoredAd);
// {
//   title: "Compare Car Insurance Quotes",
//   body: "Get quotes from top providers in 2 minutes",
//   cta: "Get Free Quotes",
//   url: "https://redirect.attentionmarket.ai/...",
//   disclosure: "Sponsored"
// }`}
        />
      </div>

      {/* Benefits */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Benefits for AI Applications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Contextual Relevance
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Ads are matched to user intent using AI, ensuring relevance. No keyword stuffing or manual targeting needed.
            </p>
          </div>
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Non-Intrusive
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Ads are clearly labeled as sponsored content and blend naturally into the conversation flow.
            </p>
          </div>
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Easy Integration
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Add monetization in minutes with a simple SDK. No complex ad server setup or inventory management.
            </p>
          </div>
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Developer Control
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Filter ads by quality, category, relevance, and bid amount. You decide what ads to show.
            </p>
          </div>
        </div>
      </div>

      {/* Ad Placements */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Ad Placement Types
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          AttentionMarket supports three placement types for different UX patterns:
        </p>
        <div className="space-y-4">
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <code className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 px-2 py-1 rounded text-sm font-mono">
                sponsored_suggestion
              </code>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Sponsored Suggestion (Most Common)
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Display ads as conversational suggestions within the chat flow. Feels natural and relevant.
                </p>
              </div>
            </div>
          </div>
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <code className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 px-2 py-1 rounded text-sm font-mono">
                sponsored_block
              </code>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Sponsored Block
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Display ads in a dedicated section of your UI (sidebar, banner, etc.). Traditional ad placement.
                </p>
              </div>
            </div>
          </div>
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <code className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 px-2 py-1 rounded text-sm font-mono">
                sponsored_tool
              </code>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Sponsored Tool (AI Agents)
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  For autonomous agents that can call external services. See <Link href="/agents/introduction" className="text-primary-600 dark:text-primary-400 hover:underline">AI Agents documentation</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Next Steps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/applications/installation"
            className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-primary-500 transition-colors"
          >
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Installation →
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Install the SDK and configure authentication.
            </p>
          </Link>
          <Link
            href="/applications/basic-integration"
            className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-primary-500 transition-colors"
          >
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Basic Integration →
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Complete example of integrating ads into a chatbot.
            </p>
          </Link>
          <Link
            href="/applications/placements"
            className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-primary-500 transition-colors"
          >
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Ad Placements →
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Learn about different placement types and best practices.
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
