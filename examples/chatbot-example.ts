/**
 * Chatbot Example - Using tracking_url for shared links
 * Run with: npx tsx examples/chatbot-example.ts
 *
 * Use this when you DON'T control the click (WhatsApp, Telegram, shared links, etc.)
 */

import { AttentionMarketClient } from '../src/index.js';

const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY || 'am_test_...',
  agentId: process.env.ATTENTIONMARKET_AGENT_ID || 'your_agent_id'
});

async function main() {
  // Get an ad
  const ad = await client.decideFromContext({
    userMessage: "I need car insurance"
  });

  if (!ad) {
    console.log('No ad available');
    return;
  }

  // Display the ad with tracking_url
  console.log('\n[Sponsored]', ad.disclosure.sponsor_name);
  console.log(ad.creative.title);
  console.log(ad.creative.body);
  console.log('→', ad.creative.cta);
  console.log('');

  // Share this link - tracking happens automatically when clicked
  console.log('Share this link (tracks clicks automatically):');
  console.log(ad.tracking_url);
  console.log('');
  console.log('Use tracking_url when:');
  console.log('- Sharing in chat apps (WhatsApp, Telegram, iMessage)');
  console.log('- Sending via email or SMS');
  console.log('- Posting in messages/feeds');
  console.log('- Any scenario where you need server-side redirect tracking');
}

main().catch(console.error);
