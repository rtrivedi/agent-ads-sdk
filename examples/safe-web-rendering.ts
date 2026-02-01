/**
 * Example: Safe Web Rendering with XSS Prevention
 *
 * This example demonstrates how to safely render AttentionMarket ads in a web UI
 * with proper sanitization to prevent XSS and phishing attacks.
 *
 * Run with: npx tsx examples/safe-web-rendering.ts
 */

import {
  MockAttentionMarketClient,
  createOpportunity,
  generateUUID,
  escapeHTML,
  sanitizeURL,
} from '../src/index.js';

// ============================================================================
// Setup
// ============================================================================

const client = new MockAttentionMarketClient({
  verbose: true,
  fillRate: 1.0,
});

// ============================================================================
// UNSAFE Rendering (DON'T DO THIS!)
// ============================================================================

/**
 * ❌ DANGEROUS: Direct HTML injection without sanitization
 *
 * This approach is VULNERABLE to XSS attacks. A malicious advertiser could
 * inject JavaScript that steals cookies, redirects users, or performs actions
 * on their behalf.
 */
function renderAdUnsafe(container: { innerHTML: string }, unit: any) {
  // DON'T DO THIS - vulnerable to XSS!
  container.innerHTML = `
    <div class="sponsored-ad">
      <div class="disclosure">[${unit.disclosure.label}] ${unit.disclosure.sponsor_name}</div>
      <h3>${unit.suggestion.title}</h3>
      <p>${unit.suggestion.body}</p>
      <a href="${unit.suggestion.action_url}">${unit.suggestion.cta}</a>
    </div>
  `;

  // If title contains: <img src=x onerror="alert('XSS')">
  // This executes JavaScript!
}

// ============================================================================
// SAFE Rendering (DO THIS!)
// ============================================================================

/**
 * ✅ SAFE: Sanitized HTML rendering
 *
 * This approach escapes all HTML special characters and validates URLs
 * to prevent XSS and phishing attacks.
 */
function renderAdSafe(container: { innerHTML: string }, unit: any) {
  // Escape all text content
  const safeLabel = escapeHTML(unit.disclosure.label);
  const safeSponsorName = escapeHTML(unit.disclosure.sponsor_name);
  const safeTitle = escapeHTML(unit.suggestion.title);
  const safeBody = escapeHTML(unit.suggestion.body);
  const safeCTA = escapeHTML(unit.suggestion.cta);

  // Validate and sanitize URL
  const safeURL = sanitizeURL(unit.suggestion.action_url);

  // Block rendering if URL is dangerous
  if (!safeURL) {
    console.error('Dangerous URL detected, blocking ad:', unit.suggestion.action_url);
    return;
  }

  // Safe to inject - all content is escaped
  container.innerHTML = `
    <div class="sponsored-ad">
      <div class="disclosure">[${safeLabel}] ${safeSponsorName}</div>
      <h3>${safeTitle}</h3>
      <p>${safeBody}</p>
      <a href="${safeURL}" target="_blank" rel="noopener noreferrer">${safeCTA}</a>
    </div>
  `;
}

// ============================================================================
// BEST: Framework-Native Rendering (React Example)
// ============================================================================

/**
 * ✅ BEST: Use framework's built-in escaping
 *
 * Modern frameworks like React, Vue, and Angular automatically escape
 * content by default. Just make sure to validate URLs.
 */
function ReactAdComponent({ unit }: any) {
  const safeURL = sanitizeURL(unit.suggestion.action_url);

  if (!safeURL) {
    console.error('Dangerous URL detected, blocking ad');
    return null;
  }

  // React automatically escapes text content
  return `
    <div className="sponsored-ad">
      <div className="disclosure">
        [{unit.disclosure.label}] {unit.disclosure.sponsor_name}
      </div>
      <h3>{unit.suggestion.title}</h3>
      <p>{unit.suggestion.body}</p>
      <a href={safeURL} target="_blank" rel="noopener noreferrer">
        {unit.suggestion.cta}
      </a>
    </div>
  `;
}

// ============================================================================
// Demo
// ============================================================================

async function main() {
  console.log('🔒 Safe Web Rendering Example\n');

  // Get a mock ad
  const opportunity = createOpportunity({
    taxonomy: 'local_services.movers.quote',
    query: 'Find movers in Brooklyn',
    country: 'US',
    language: 'en',
    platform: 'web',
  });

  const unit = await client.decide({
    request_id: generateUUID(),
    agent_id: 'test_agent',
    placement: {
      type: 'sponsored_suggestion',
      surface: 'chat_response',
    },
    opportunity,
  });

  if (!unit || unit.unit_type !== 'sponsored_suggestion') {
    console.log('No ad available');
    return;
  }

  // Simulate rendering
  const mockContainer = { innerHTML: '' };

  console.log('✅ SAFE RENDERING:');
  renderAdSafe(mockContainer, unit);
  console.log(mockContainer.innerHTML);

  console.log('\n✅ Security checks passed:');
  console.log('  - Title escaped:', escapeHTML(unit.suggestion.title));
  console.log('  - URL validated:', sanitizeURL(unit.suggestion.action_url));

  // Example of blocking dangerous content
  console.log('\n🚫 BLOCKING DANGEROUS CONTENT:');
  const maliciousUnit = {
    ...unit,
    suggestion: {
      ...unit.suggestion,
      title: '<img src=x onerror="alert(\'XSS\')">',
      action_url: 'javascript:alert(document.cookie)',
    },
  };

  const escapedTitle = escapeHTML(maliciousUnit.suggestion.title);
  const validatedURL = sanitizeURL(maliciousUnit.suggestion.action_url);

  console.log('  Original title:', maliciousUnit.suggestion.title);
  console.log('  Escaped title:', escapedTitle);
  console.log('  Original URL:', maliciousUnit.suggestion.action_url);
  console.log('  Validated URL:', validatedURL || 'BLOCKED');

  if (!validatedURL) {
    console.log('  ✓ Dangerous URL blocked successfully!');
  }

  console.log('\n✨ Example complete!');
  console.log('\n📖 See SECURITY.md for complete guidelines');
}

main().catch(console.error);

/**
 * SECURITY CHECKLIST:
 *
 * ✅ Always use escapeHTML() for text content (title, body, cta)
 * ✅ Always use sanitizeURL() for links (action_url)
 * ✅ Block rendering if sanitizeURL() returns null
 * ✅ Use target="_blank" rel="noopener noreferrer" for external links
 * ✅ Never use dangerouslySetInnerHTML or v-html with unsanitized content
 * ✅ Prefer framework-native rendering (React, Vue, Angular)
 * ✅ Test with malicious input to verify sanitization works
 *
 * DANGEROUS PATTERNS TO AVOID:
 *
 * ❌ Direct innerHTML assignment without escaping
 * ❌ Using ad content in eval() or Function()
 * ❌ Trusting URL schemes without validation
 * ❌ Rendering HTML from ad content without sanitization
 * ❌ Exposing API keys in client-side code
 *
 * For complete security guidelines, see:
 * https://github.com/rtrivedi/agent-ads-sdk/blob/main/SECURITY.md
 */
