import React from 'react';
import Link from 'next/link';
import CodeBlock from '../../components/CodeBlock';

export default function BasicIntegrationPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
        Basic Integration
      </h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
        Learn how to integrate AttentionMarket ads into your AI application with complete examples.
      </p>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Complete Chatbot Example
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          This example shows a complete integration with a conversational AI application:
        </p>
        <CodeBlock
          language="typescript"
          code={`import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';
import { generateAIResponse } from './ai';  // Your AI logic

const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTION_MARKET_API_KEY!,
  agentId: process.env.ATTENTION_MARKET_AGENT_ID!
});

async function handleUserMessage(
  userMessage: string,
  conversationHistory: string[] = []
) {
  // Request contextual ad (automatically tracks impression)
  const ad = await client.decideFromContext({
    userMessage: userMessage,
    conversationHistory: conversationHistory,
    placement: 'sponsored_suggestion',
    minQualityScore: 0.5  // Filter low-quality ads
  });

  // Generate AI response
  const aiResponse = await generateAIResponse(userMessage);

  // Return response with optional ad
  return {
    message: aiResponse,
    ad: ad ? {
      title: ad.creative.title,
      body: ad.creative.body,
      cta: ad.creative.cta,
      clickUrl: ad.click_url,
      payout: ad.payout / 100,  // Convert cents to dollars
      disclosure: ad.disclosure.label
    } : null
  };
}

// Example usage
const result = await handleUserMessage(
  "I'm looking for car insurance",
  ["User: My insurance is too expensive"]
);

console.log(result);
// {
//   message: "I can help you find better rates...",
//   ad: {
//     title: "Compare Car Insurance Quotes",
//     body: "Get quotes from top providers in 2 minutes",
//     cta: "Get Free Quotes",
//     clickUrl: "https://redirect.attentionmarket.ai/...",
//     payout: 2.50,
//     disclosure: "Sponsored"
//   }
// }`}
        />
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          React Component Example
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Here's how to display ads in a React application:
        </p>
        <CodeBlock
          language="typescript"
          code={`import React from 'react';

interface SponsoredAdProps {
  title: string;
  body: string;
  cta: string;
  clickUrl: string;
  disclosure: string;
}

export function SponsoredAd({ title, body, cta, clickUrl, disclosure }: SponsoredAdProps) {
  return (
    <div className="border rounded-lg p-4 bg-blue-50">
      <div className="text-xs text-gray-500 mb-2">{disclosure}</div>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-gray-700 mb-3">{body}</p>
      <a
        href={clickUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {cta}
      </a>
    </div>
  );
}

// Usage in chat interface
function ChatMessage({ message, ad }) {
  return (
    <div>
      <div className="mb-4">{message}</div>
      {ad && <SponsoredAd {...ad} />}
    </div>
  );
}`}
        />
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Conversation History
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Include conversation history for better ad matching:
        </p>
        <CodeBlock
          language="typescript"
          code={`const conversationHistory = [
  "User: My car insurance is too expensive",
  "Agent: I can help you find better rates",
  "User: What are my options?"
];

const ad = await client.decideFromContext({
  userMessage: "What are my options?",
  conversationHistory: conversationHistory,
  placement: 'sponsored_suggestion'
});

// The SDK understands full context and returns relevant insurance ads`}
        />
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
          <p className="text-blue-900 dark:text-blue-100 font-medium mb-2">
            Automatic Truncation
          </p>
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            The SDK automatically limits history to the last 5 messages to prevent token overflow.
          </p>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Error Handling
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Always handle errors gracefully to maintain user experience:
        </p>
        <CodeBlock
          language="typescript"
          code={`async function getAd(userMessage: string) {
  try {
    const ad = await client.decideFromContext({
      userMessage: userMessage,
      placement: 'sponsored_suggestion'
    });
    return ad;
  } catch (error) {
    console.error('Failed to fetch ad:', error);
    // Continue without ad - don't block user experience
    return null;
  }
}`}
        />
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Multiple Placements
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Request ads for different placements in the same conversation:
        </p>
        <CodeBlock
          language="typescript"
          code={`// Get inline conversational ad
const inlineAd = await client.decideFromContext({
  userMessage: "I need car insurance",
  placement: 'sponsored_suggestion'
});

// Get sidebar banner ad
const sidebarAd = await client.decideFromContext({
  userMessage: "I need car insurance",
  placement: 'sponsored_block'
});

// Different placements may return different ads based on format`}
        />
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Best Practices
        </h2>
        <div className="space-y-4">
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Do: Show ads contextually
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Display ads when they add value to the conversation, not randomly.
            </p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Do: Use quality filters
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Set <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">minQualityScore</code> to filter low-quality advertisers.
            </p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Do: Label ads clearly
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Always display <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">ad.disclosure.label</code> to indicate sponsored content.
            </p>
          </div>
          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Don't: Block on ad requests
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              If ad requests fail, continue without ads. Don't degrade user experience.
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
            href="/applications/placements"
            className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-primary-500 transition-colors"
          >
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Ad Placements →
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Learn about placement types and best practices.
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
              Track conversions and optimize performance.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
