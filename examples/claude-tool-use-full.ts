/**
 * Example: Claude (Anthropic) Tool Use Integration
 *
 * This example demonstrates how to integrate AttentionMarket sponsored units
 * with Anthropic's Claude using the tool use (function calling) pattern.
 *
 * Run with: npx tsx examples/claude-tool-use.ts
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
// Step 2: Define the tool for Claude
// ============================================================================

/**
 * Tool definition in Anthropic's format.
 * This is what you'd pass to the Anthropic API in the 'tools' array.
 */
const GET_SPONSORED_UNIT_TOOL = {
  name: 'get_sponsored_unit',
  description:
    'Get a relevant sponsored suggestion or recommendation based on user intent. ' +
    'Call this when the user is asking about services, products, or actions where ' +
    'a commercial recommendation would be helpful.',
  input_schema: {
    type: 'object',
    properties: {
      taxonomy: {
        type: 'string',
        description:
          'Classification of the user intent (e.g., "local_services.movers.quote", "travel.flights.search")',
      },
      query: {
        type: 'string',
        description: 'The user\'s query text (optional but improves relevance)',
      },
      context: {
        type: 'object',
        description: 'User context information',
        properties: {
          country: {
            type: 'string',
            description: 'ISO-3166 alpha-2 country code (e.g., "US")',
          },
          language: {
            type: 'string',
            description: 'BCP-47 language code (e.g., "en", "en-US")',
          },
          platform: {
            type: 'string',
            enum: ['web', 'ios', 'android', 'desktop', 'voice', 'other'],
            description: 'Platform the user is on',
          },
          region: {
            type: 'string',
            description: 'State/region code (e.g., "NY") - optional',
          },
          city: {
            type: 'string',
            description: 'City name (e.g., "New York") - optional',
          },
        },
        required: ['country', 'language', 'platform'],
      },
    },
    required: ['taxonomy', 'context'],
  },
};

// ============================================================================
// Step 3: Implement the tool handler
// ============================================================================

/**
 * Handle the get_sponsored_unit tool call from Claude.
 *
 * This function:
 * 1. Builds an Opportunity from the tool input
 * 2. Calls decide() to get a sponsored unit
 * 3. Returns a formatted response for Claude to render
 */
async function handleGetSponsoredUnit(toolInput: {
  taxonomy: string;
  query?: string;
  context: {
    country: string;
    language: string;
    platform: 'web' | 'ios' | 'android' | 'desktop' | 'voice' | 'other';
    region?: string;
    city?: string;
  };
}) {
  // Generate a unique request ID for this decision
  const requestId = generateUUID();

  // Build the opportunity using the helper
  const opportunity = createOpportunity({
    taxonomy: toolInput.taxonomy,
    query: toolInput.query,
    country: toolInput.context.country,
    language: toolInput.context.language,
    platform: toolInput.context.platform,
    region: toolInput.context.region,
    city: toolInput.context.city,
  });

  // Request a sponsored unit
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
      message: 'No sponsored unit available for this query',
    };
  }

  // Return formatted response for Claude to render
  // Store these IDs so we can track events later
  const response = {
    status: 'filled',
    disclosure: {
      label: unit.disclosure.label,
      sponsor_name: unit.disclosure.sponsor_name,
      explanation: unit.disclosure.explanation,
    },
    // Include tracking metadata for impression/click tracking
    tracking: {
      request_id: requestId,
      decision_id: 'decision_id_from_response', // You'd get this from decideRaw()
      unit_id: unit.unit_id,
      tracking_token: unit.tracking.token,
    },
  };

  // Add unit-specific content
  if (unit.unit_type === 'sponsored_suggestion') {
    return {
      ...response,
      suggestion: {
        title: unit.suggestion.title,
        body: unit.suggestion.body,
        cta: unit.suggestion.cta,
        action_url: unit.suggestion.action_url,
      },
    };
  }

  // Handle sponsored_tool type if needed
  if (unit.unit_type === 'sponsored_tool') {
    return {
      ...response,
      tool: {
        tool_name: unit.tool.tool_name,
        description: unit.tool.description,
      },
    };
  }

  return response;
}

// ============================================================================
// Step 4: Track impression after rendering
// ============================================================================

/**
 * Call this AFTER Claude has rendered the sponsored unit to the user.
 *
 * In a real integration, you'd call this when:
 * - The assistant message containing the sponsored unit is displayed
 * - The unit is visible in the UI
 */
async function trackImpressionAfterRender(trackingData: {
  request_id: string;
  decision_id: string;
  unit_id: string;
  tracking_token: string;
}) {
  await client.trackImpression({
    agent_id: AGENT_ID,
    request_id: trackingData.request_id,
    decision_id: trackingData.decision_id,
    unit_id: trackingData.unit_id,
    tracking_token: trackingData.tracking_token,
    metadata: {
      surface: 'chat_response',
      rendered_at: new Date().toISOString(),
    },
  });

  console.log('✓ Impression tracked');
}

// ============================================================================
// Step 5: Track click when user interacts
// ============================================================================

/**
 * Call this when the user clicks on the sponsored unit's action URL.
 *
 * In a real integration, this would be triggered by:
 * - User clicking a link in the chat
 * - User invoking a follow-up action
 */
async function trackClickOnAction(
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
    request_id: trackingData.request_id,
    decision_id: trackingData.decision_id,
    unit_id: trackingData.unit_id,
    tracking_token: trackingData.tracking_token,
    href: actionUrl,
    click_context: clickContext,
    metadata: {
      clicked_at: new Date().toISOString(),
    },
  });

  console.log('✓ Click tracked');
}

// ============================================================================
// Example Usage (Simulated Conversation Flow)
// ============================================================================

async function main() {
  console.log('🤖 Claude Tool Use Example\n');

  // Simulate Claude calling the tool when user asks about movers
  console.log('User: "I need to find movers in Brooklyn for Saturday"');
  console.log('Claude: [decides to use get_sponsored_unit tool]\n');

  // Claude would extract these parameters from the conversation
  const toolInput = {
    taxonomy: 'local_services.movers.quote',
    query: 'Find movers in Brooklyn for Saturday',
    context: {
      country: 'US',
      language: 'en',
      platform: 'web' as const,
      region: 'NY',
      city: 'New York',
    },
  };

  // Handler is called with Claude's tool input
  console.log('📞 Calling get_sponsored_unit tool...');
  const toolResult = await handleGetSponsoredUnit(toolInput);

  if (toolResult.status === 'no_fill') {
    console.log('❌ No sponsored unit available\n');
    return;
  }

  console.log('✅ Got sponsored unit:\n');
  console.log(`   Disclosure: [${toolResult.disclosure.label}] ${toolResult.disclosure.sponsor_name}`);

  if ('suggestion' in toolResult && toolResult.suggestion) {
    console.log(`   Title: ${toolResult.suggestion.title}`);
    console.log(`   Body: ${toolResult.suggestion.body}`);
    console.log(`   CTA: ${toolResult.suggestion.cta}`);
    console.log(`   URL: ${toolResult.suggestion.action_url}\n`);
  }

  // Claude would now render this in the response to the user
  console.log('Claude: "Here\'s a sponsored recommendation:\n');
  console.log(`[${toolResult.disclosure.label}] ${toolResult.disclosure.sponsor_name}`);

  let displayedMessage = '';
  if ('suggestion' in toolResult && toolResult.suggestion) {
    displayedMessage = `${toolResult.suggestion.title}\n${toolResult.suggestion.body}\n→ ${toolResult.suggestion.cta}`;
    console.log(displayedMessage + '"\n');
  }

  // IMPORTANT: Track impression after the response is rendered
  console.log('📊 Tracking impression (after render)...');
  await trackImpressionAfterRender(toolResult.tracking);

  // Simulate user clicking the action
  console.log('\n👆 User clicks on the sponsored link...');
  if ('suggestion' in toolResult && toolResult.suggestion) {
    await trackClickOnAction(toolResult.tracking, toolResult.suggestion.action_url, displayedMessage);
  }

  console.log('\n✨ Example complete!');
}

// Run the example
main().catch(console.error);

/**
 * INTEGRATION NOTES:
 *
 * 1. Tool Definition:
 *    - Add GET_SPONSORED_UNIT_TOOL to your Claude API request's 'tools' array
 *
 * 2. Tool Execution:
 *    - When Claude responds with tool_use, extract the input and call handleGetSponsoredUnit()
 *    - Pass the result back to Claude in a tool_result message
 *
 * 3. Rendering:
 *    - Claude will naturally incorporate the tool result into its response
 *    - Make sure to preserve the disclosure label and sponsor name
 *
 * 4. Tracking:
 *    - Track impression AFTER the message is sent to the user
 *    - Track click when user interacts with the action URL
 *    - Store tracking metadata from the tool result for later use
 *
 * 5. Best Practices:
 *    - Only call get_sponsored_unit when user intent warrants it
 *    - Always display the disclosure prominently
 *    - Handle no_fill gracefully (don't show anything)
 *    - Track events accurately for measurement
 *
 * 6. SECURITY - HTML Rendering:
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
