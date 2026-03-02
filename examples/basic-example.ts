/**
 * Basic Example - Get ads and track clicks
 * Run with: npx tsx examples/basic-example.ts
 */

import { AttentionMarketClient } from '../src/index.js';

const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY || 'am_test_...',
  agentId: process.env.ATTENTIONMARKET_AGENT_ID || 'your_agent_id'
});

async function main() {
  // Get an ad based on user message
  const ad = await client.decideFromContext({
    userMessage: "I need car insurance"
  });

  if (!ad) {
    console.log('No ad available');
    return;
  }

  // Display the ad
  console.log('\n[Sponsored]', ad.disclosure.sponsor_name);
  console.log(ad.creative.title);
  console.log(ad.creative.body);
  console.log('→', ad.creative.cta);
  console.log('');

  const displayMessage = `[Sponsored] ${ad.disclosure.sponsor_name}\n${ad.creative.title}\n${ad.creative.body}\n→ ${ad.creative.cta}`;

  // Click tracking happens automatically when user clicks the URL!
  // The click_url contains an HMAC-signed tracking token that ensures fraud prevention.
  // Simply redirect the user to ad.click_url when they click.
  console.log('✓ Click URL ready (tracking built-in):', ad.click_url);
}

main().catch(console.error);
