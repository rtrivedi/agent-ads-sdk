/**
 * Example: OpenAI Function Calling Integration
 *
 * This example demonstrates how to integrate AttentionMarket sponsored units
 * with OpenAI's GPT models using function calling (tool use).
 *
 * Run with: npx tsx examples/openai-function-calling.ts
 */

import {
  AttentionMarketClient,
  createOpportunity,
  generateUUID,
} from '../src/index.js';

// ============================================================================
// Step 1: Initialize the AttentionMarket SDK
// ============================================================================

const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY || 'am_test_...',
});

const AGENT_ID = process.env.ATTENTIONMARKET_AGENT_ID || 'agt_01HV...';

// ============================================================================
// Step 2: Define the function for OpenAI
// ============================================================================

/**
 * Function definition in OpenAI's format.
 * This is what you'd pass in the 'tools' array to the OpenAI Chat Completions API.
 */
const GET_SPONSORED_UNIT_FUNCTION = {
  type: 'function',
  function: {
    name: 'get_sponsored_unit',
    description:
      'Get a relevant sponsored suggestion or recommendation based on user intent. ' +
      'Use this when the user is asking about services, products, or actions where ' +
      'a commercial recommendation would add value.',
    parameters: {
      type: 'object',
      properties: {
        taxonomy: {
          type: 'string',
          description:
            'Category of the user intent (e.g., "local_services.movers.quote", "shopping.electronics.phones")',
        },
        query: {
          type: 'string',
          description: 'The user\'s original query text (helps improve relevance)',
        },
        context: {
          type: 'object',
          description: 'Contextual information about the user and platform',
          properties: {
            country: {
              type: 'string',
              description: 'ISO-3166 alpha-2 country code (e.g., "US", "GB")',
            },
            language: {
              type: 'string',
              description: 'BCP-47 language code (e.g., "en", "en-US", "es")',
            },
            platform: {
              type: 'string',
              enum: ['web', 'ios', 'android', 'desktop', 'voice', 'other'],
              description: 'Platform the user is using',
            },
            region: {
              type: 'string',
              description: 'Optional: State/province code (e.g., "CA", "NY")',
            },
            city: {
              type: 'string',
              description: 'Optional: City name (e.g., "San Francisco")',
            },
          },
          required: ['country', 'language', 'platform'],
        },
      },
      required: ['taxonomy', 'context'],
    },
  },
};

// ============================================================================
// Step 3: Implement the function handler
// ============================================================================

interface FunctionInput {
  taxonomy: string;
  query?: string;
  context: {
    country: string;
    language: string;
    platform: 'web' | 'ios' | 'android' | 'desktop' | 'voice' | 'other';
    region?: string;
    city?: string;
  };
}

/**
 * Handle the get_sponsored_unit function call from GPT.
 *
 * This function:
 * 1. Converts the function arguments to an Opportunity
 * 2. Calls decide() to get a sponsored unit
 * 3. Returns a JSON string for GPT to use in its response
 */
async function handleGetSponsoredUnit(args: FunctionInput) {
  const requestId = generateUUID();

  // Build opportunity from function arguments
  const opportunity = createOpportunity({
    taxonomy: args.taxonomy,
    query: args.query,
    country: args.context.country,
    language: args.context.language,
    platform: args.context.platform,
    region: args.context.region,
    city: args.context.city,
  });

  // Request a decision
  const unit = await client.decide({
    request_id: requestId,
    agent_id: AGENT_ID,
    placement: {
      type: 'sponsored_suggestion',
      surface: 'chat_response',
    },
    opportunity,
  });

  // Handle no-fill
  if (!unit) {
    return JSON.stringify({
      status: 'no_fill',
      message: 'No sponsored recommendation available',
    });
  }

  // Build response object for GPT
  const response: any = {
    status: 'filled',
    disclosure: {
      label: unit.disclosure.label,
      sponsor_name: unit.disclosure.sponsor_name,
      explanation: unit.disclosure.explanation,
    },
    tracking: {
      request_id: requestId,
      decision_id: 'decision_id', // Get from decideRaw() if needed
      unit_id: unit.unit_id,
      tracking_token: unit.tracking.token,
    },
  };

  // Add type-specific content
  if (unit.unit_type === 'sponsored_suggestion') {
    response.suggestion = {
      title: unit.suggestion.title,
      body: unit.suggestion.body,
      cta: unit.suggestion.cta,
      action_url: unit.suggestion.action_url,
    };
  }

  // Return as JSON string for OpenAI
  return JSON.stringify(response);
}

// ============================================================================
// Step 4: Track events
// ============================================================================

/**
 * Track impression after GPT's response is displayed to the user.
 */
async function trackImpression(trackingData: {
  request_id: string;
  decision_id: string;
  unit_id: string;
  tracking_token: string;
}) {
  await client.trackImpression({
    agent_id: AGENT_ID,
    ...trackingData,
    metadata: {
      surface: 'chat_response',
    },
  });
  console.log('✓ Impression tracked');
}

/**
 * Track click when user clicks the sponsored link.
 */
async function trackClick(
  trackingData: {
    request_id: string;
    decision_id: string;
    unit_id: string;
    tracking_token: string;
  },
  actionUrl: string,
  clickContext: string,
) {
  await client.trackClick({
    agent_id: AGENT_ID,
    ...trackingData,
    href: actionUrl,
    click_context: clickContext,
  });
  console.log('✓ Click tracked');
}

// ============================================================================
// Example Usage with OpenAI API (Pseudocode + Runnable SDK Parts)
// ============================================================================

async function main() {
  console.log('🤖 OpenAI Function Calling Example\n');

  /*
   * STEP 1: Send message to OpenAI with function definition
   *
   * const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
   *
   * const response = await openai.chat.completions.create({
   *   model: 'gpt-4',
   *   messages: [
   *     {
   *       role: 'user',
   *       content: 'I need to find movers in Brooklyn for this Saturday'
   *     }
   *   ],
   *   tools: [GET_SPONSORED_UNIT_FUNCTION],
   *   tool_choice: 'auto',
   * });
   */

  // STEP 2: GPT decides to call the function
  console.log('User: "I need to find movers in Brooklyn for Saturday"');
  console.log('GPT: [decides to call get_sponsored_unit]\n');

  // Simulate GPT extracting these arguments
  const functionArgs: FunctionInput = {
    taxonomy: 'local_services.movers.quote',
    query: 'Find movers in Brooklyn for Saturday',
    context: {
      country: 'US',
      language: 'en',
      platform: 'web',
      region: 'NY',
      city: 'New York',
    },
  };

  // STEP 3: Execute the function
  console.log('📞 Executing get_sponsored_unit function...');
  const functionResult = await handleGetSponsoredUnit(functionArgs);
  const resultData = JSON.parse(functionResult);

  if (resultData.status === 'no_fill') {
    console.log('❌ No sponsored unit available\n');
    return;
  }

  console.log('✅ Function returned sponsored unit:\n');
  console.log(`   Disclosure: [${resultData.disclosure.label}] ${resultData.disclosure.sponsor_name}`);
  console.log(`   Title: ${resultData.suggestion.title}`);
  console.log(`   Body: ${resultData.suggestion.body}`);
  console.log(`   CTA: ${resultData.suggestion.cta}`);
  console.log(`   URL: ${resultData.suggestion.action_url}\n`);

  /*
   * STEP 4: Send function result back to OpenAI
   *
   * const secondResponse = await openai.chat.completions.create({
   *   model: 'gpt-4',
   *   messages: [
   *     ...previousMessages,
   *     response.choices[0].message,  // The function call
   *     {
   *       role: 'tool',
   *       tool_call_id: response.choices[0].message.tool_calls[0].id,
   *       content: functionResult,
   *     }
   *   ],
   * });
   */

  // STEP 5: GPT incorporates the result into its response
  console.log('GPT: "I found a sponsored recommendation for you:\n');
  console.log(`[${resultData.disclosure.label}] ${resultData.disclosure.sponsor_name}`);

  const displayedMessage = `${resultData.suggestion.title}\n${resultData.suggestion.body}\n→ ${resultData.suggestion.cta}`;
  console.log(displayedMessage + '"\n');

  // STEP 6: Track impression after displaying to user
  console.log('📊 Tracking impression...');
  await trackImpression(resultData.tracking);

  // STEP 7: Track click when user interacts
  console.log('\n👆 User clicks the link...');
  await trackClick(resultData.tracking, resultData.suggestion.action_url, displayedMessage);

  console.log('\n✨ Example complete!');
}

// Run the example
main().catch(console.error);

/**
 * INTEGRATION CHECKLIST:
 *
 * 1. Function Definition:
 *    - Add GET_SPONSORED_UNIT_FUNCTION to your tools array
 *    - Set tool_choice to 'auto' to let GPT decide when to call it
 *
 * 2. Function Execution:
 *    - Check if response contains tool_calls
 *    - Extract arguments and call handleGetSponsoredUnit()
 *    - Send result back in a 'tool' role message
 *
 * 3. Response Handling:
 *    - GPT will naturally incorporate the function result
 *    - Ensure disclosure is preserved in the final output
 *
 * 4. Event Tracking:
 *    - Store tracking metadata from function result
 *    - Track impression when message is shown
 *    - Track click when user clicks action URL
 *
 * 5. Error Handling:
 *    - Handle no_fill gracefully (GPT will adapt its response)
 *    - Catch and log any SDK errors
 *    - Retry on transient failures if needed
 *
 * 6. Best Practices:
 *    - Only enable function when context suggests commercial intent
 *    - Always show disclosure prominently
 *    - Track events accurately for billing and reporting
 *    - Respect user privacy settings
 *
 * 7. SECURITY - HTML Rendering:
 *    - If displaying ads in HTML/web UI, ALWAYS sanitize content first
 *    - Use escapeHTML() for title, body, and cta before inserting into DOM
 *    - Use sanitizeURL() for action_url before creating links
 *    - Example:
 *      ```typescript
 *      import { escapeHTML, sanitizeURL } from '@the_ro_show/agent-ads-sdk';
 *
 *      const safeTitle = escapeHTML(unit.suggestion.title);
 *      const safeURL = sanitizeURL(unit.suggestion.action_url);
 *
 *      if (safeURL) {
 *        element.innerHTML = `<a href="${safeURL}">${safeTitle}</a>`;
 *      }
 *      ```
 *    - See SECURITY.md for complete XSS prevention guidelines
 */
