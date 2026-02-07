/**
 * Example: Google Gemini Function Calling Integration
 *
 * This example demonstrates how to integrate AttentionMarket sponsored units
 * with Google's Gemini models using function calling (tool use).
 *
 * Run with: npx tsx examples/gemini-function-calling.ts
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
// Step 2: Define the function declaration for Gemini
// ============================================================================

/**
 * Function declaration in Gemini's format.
 * This is what you'd pass in the 'tools' array to the Gemini API.
 */
const GET_SPONSORED_UNIT_DECLARATION = {
  name: 'get_sponsored_unit',
  description:
    'Retrieve a relevant sponsored suggestion or recommendation based on user intent. ' +
    'Use this function when the user is asking about services, products, or commercial actions ' +
    'where a paid recommendation would be valuable and appropriate.',
  parameters: {
    type: 'object',
    properties: {
      taxonomy: {
        type: 'string',
        description:
          'Taxonomy classification of user intent (e.g., "local_services.movers.quote", "shopping.phones")',
      },
      query: {
        type: 'string',
        description: 'The user\'s query text (optional but improves matching)',
      },
      context: {
        type: 'object',
        description: 'User and platform context',
        properties: {
          country: {
            type: 'string',
            description: 'ISO-3166 alpha-2 country code (e.g., "US")',
          },
          language: {
            type: 'string',
            description: 'BCP-47 language code (e.g., "en", "ja")',
          },
          platform: {
            type: 'string',
            description: 'User platform',
            enum: ['web', 'ios', 'android', 'desktop', 'voice', 'other'],
          },
          region: {
            type: 'string',
            description: 'Optional state/province code (e.g., "CA")',
          },
          city: {
            type: 'string',
            description: 'Optional city name (e.g., "Tokyo")',
          },
        },
        required: ['country', 'language', 'platform'],
      },
    },
    required: ['taxonomy', 'context'],
  },
};

// ============================================================================
// Step 3: Implement the function handler
// ============================================================================

interface FunctionArgs {
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
 * Handle the get_sponsored_unit function call from Gemini.
 *
 * Returns an object that Gemini will use in its response generation.
 */
async function handleGetSponsoredUnit(args: FunctionArgs) {
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

  // Get a decision
  const unit = await client.decide({
    request_id: requestId,
    agent_id: AGENT_ID,
    placement: {
      type: 'sponsored_suggestion',
      surface: 'chat_response',
    },
    opportunity,
  });

  // Handle no-fill case
  if (!unit) {
    return {
      status: 'no_fill',
      message: 'No sponsored recommendation available for this query',
    };
  }

  // Build structured response
  const response: any = {
    status: 'filled',
    disclosure: {
      label: unit.disclosure.label,
      sponsor_name: unit.disclosure.sponsor_name,
      explanation: unit.disclosure.explanation,
    },
    tracking: {
      request_id: requestId,
      decision_id: 'decision_id', // Get from decideRaw() for full data
      unit_id: unit.unit_id,
      tracking_token: unit.tracking.token,
    },
  };

  // Add unit-specific content
  if (unit.unit_type === 'sponsored_suggestion') {
    response.suggestion = {
      title: unit.suggestion.title,
      body: unit.suggestion.body,
      cta: unit.suggestion.cta,
      action_url: unit.suggestion.action_url,
    };
  }

  return response;
}

// ============================================================================
// Step 4: Track events
// ============================================================================

/**
 * Track impression after Gemini's response is shown to user.
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
 * Track click when user clicks the sponsored action.
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
// Example Usage with Gemini API (Pseudocode + Runnable SDK Parts)
// ============================================================================

async function main() {
  console.log('🤖 Google Gemini Function Calling Example\n');

  /*
   * STEP 1: Initialize Gemini with function declarations
   *
   * import { GoogleGenerativeAI } from '@google/generative-ai';
   *
   * const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
   * const model = genAI.getGenerativeModel({
   *   model: 'gemini-pro',
   *   tools: [
   *     {
   *       functionDeclarations: [GET_SPONSORED_UNIT_DECLARATION],
   *     },
   *   ],
   * });
   */

  /*
   * STEP 2: Start a chat and send user message
   *
   * const chat = model.startChat();
   * const result = await chat.sendMessage(
   *   'I need to find movers in Brooklyn for this Saturday'
   * );
   */

  // STEP 3: Gemini decides to call the function
  console.log('User: "I need to find movers in Brooklyn for Saturday"');
  console.log('Gemini: [decides to call get_sponsored_unit]\n');

  // Simulate Gemini extracting function arguments
  const functionArgs: FunctionArgs = {
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

  // STEP 4: Execute the function
  console.log('📞 Executing get_sponsored_unit function...');
  const functionResult = await handleGetSponsoredUnit(functionArgs);

  if (functionResult.status === 'no_fill') {
    console.log('❌ No sponsored unit available\n');
    /*
     * Send function response back to Gemini:
     *
     * const finalResult = await chat.sendMessage([
     *   {
     *     functionResponse: {
     *       name: 'get_sponsored_unit',
     *       response: functionResult,
     *     },
     *   },
     * ]);
     */
    return;
  }

  console.log('✅ Function returned sponsored unit:\n');
  console.log(`   Disclosure: [${functionResult.disclosure.label}] ${functionResult.disclosure.sponsor_name}`);
  console.log(`   Title: ${functionResult.suggestion.title}`);
  console.log(`   Body: ${functionResult.suggestion.body}`);
  console.log(`   CTA: ${functionResult.suggestion.cta}`);
  console.log(`   URL: ${functionResult.suggestion.action_url}\n`);

  /*
   * STEP 5: Send function response back to Gemini
   *
   * const finalResult = await chat.sendMessage([
   *   {
   *     functionResponse: {
   *       name: 'get_sponsored_unit',
   *       response: functionResult,
   *     },
   *   },
   * ]);
   *
   * const geminiResponse = finalResult.response.text();
   */

  // STEP 6: Gemini incorporates the result into its response
  console.log('Gemini: "I found a sponsored recommendation for your move:\n');
  console.log(`[${functionResult.disclosure.label}] ${functionResult.disclosure.sponsor_name}`);

  const displayedMessage = `${functionResult.suggestion.title}\n${functionResult.suggestion.body}\n${functionResult.suggestion.cta}`;
  console.log(displayedMessage + '"\n');

  // STEP 7: Track impression after response is displayed
  console.log('📊 Tracking impression...');
  await trackImpression(functionResult.tracking);

  // STEP 8: Track click when user interacts
  console.log('\n👆 User clicks the sponsored link...');
  await trackClick(functionResult.tracking, functionResult.suggestion.action_url, displayedMessage);

  console.log('\n✨ Example complete!');
}

// Run the example
main().catch(console.error);

/**
 * INTEGRATION GUIDE:
 *
 * 1. Function Declaration Setup:
 *    - Add GET_SPONSORED_UNIT_DECLARATION to your tools array
 *    - Include when initializing the generative model
 *    - Gemini will automatically decide when to call it
 *
 * 2. Function Execution Flow:
 *    - Check result.functionCalls() for function call requests
 *    - Extract arguments and call handleGetSponsoredUnit()
 *    - Send response back using functionResponse format
 *
 * 3. Response Handling:
 *    - Gemini will naturally weave function results into its response
 *    - Ensure disclosure is prominently displayed
 *    - Handle both filled and no_fill states gracefully
 *
 * 4. Event Tracking:
 *    - Store tracking metadata from function result
 *    - Track impression when chat message is shown
 *    - Track click when user clicks action URL
 *    - Use metadata to enrich event context
 *
 * 5. Error Handling:
 *    - Catch SDK errors and return structured error responses
 *    - Let Gemini handle no_fill naturally (it will adapt)
 *    - Log tracking failures but don't block user experience
 *
 * 6. Best Practices:
 *    - Only declare function in appropriate contexts
 *    - Always display disclosure information
 *    - Track events accurately for billing
 *    - Test with various user queries
 *    - Monitor function call frequency
 *
 * 7. Testing:
 *    - Test with test API keys first
 *    - Verify disclosure is always shown
 *    - Confirm tracking events fire correctly
 *    - Check no_fill handling
 *
 * 8. SECURITY - HTML Rendering:
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
