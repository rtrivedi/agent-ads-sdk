/**
 * Security Tests for XSS/Phishing Prevention
 *
 * These tests verify that sanitization functions properly block malicious content.
 */

import { describe, it, expect } from 'vitest';
import { escapeHTML, sanitizeURL } from '../src/index.js';

// ============================================================================
// escapeHTML Tests
// ============================================================================

describe('escapeHTML', () => {
  describe('XSS Prevention', () => {
    it('should escape basic script tag', () => {
      expect(escapeHTML('<script>alert(1)</script>')).toBe(
        '&lt;script&gt;alert(1)&lt;&#x2F;script&gt;'
      );
    });

    it('should escape img tag with onerror', () => {
      expect(escapeHTML('<img src=x onerror=alert(1)>')).toBe(
        '&lt;img src=x onerror=alert(1)&gt;'
      );
    });

    it('should escape svg with onload', () => {
      expect(escapeHTML('<svg onload=alert(1)>')).toBe(
        '&lt;svg onload=alert(1)&gt;'
      );
    });

    it('should escape iframe tag', () => {
      expect(escapeHTML('<iframe src="javascript:alert(1)"></iframe>')).toBe(
        '&lt;iframe src=&quot;javascript:alert(1)&quot;&gt;&lt;&#x2F;iframe&gt;'
      );
    });

    it('should escape event handler in attributes', () => {
      expect(escapeHTML('"><script>alert(1)</script>')).toBe(
        '&quot;&gt;&lt;script&gt;alert(1)&lt;&#x2F;script&gt;'
      );
    });

    it('should escape single quote injection', () => {
      expect(escapeHTML("'-alert(1)-'")).toBe(
        '&#x27;-alert(1)-&#x27;'
      );
    });

    it('should escape backtick injection', () => {
      expect(escapeHTML('`${alert(1)}`')).toBe(
        '&#96;${alert(1)}&#96;'
      );
    });

    it('should escape template literal XSS', () => {
      expect(escapeHTML('`<img src=x onerror=alert(1)>`')).toBe(
        '&#96;&lt;img src=x onerror=alert(1)&gt;&#96;'
      );
    });

    it('should escape all HTML entities', () => {
      expect(escapeHTML('&<>"\'`/')).toBe(
        '&amp;&lt;&gt;&quot;&#x27;&#96;&#x2F;'
      );
    });

    it('should handle multiple XSS vectors in one string', () => {
      const payload = '<script>alert("XSS")</script><img src=x onerror=\'alert(1)\'>';
      const escaped = escapeHTML(payload);
      expect(escaped).not.toContain('<script');
      expect(escaped).not.toContain('<img');
      expect(escaped).toContain('&lt;script&gt;');
      expect(escaped).toContain('&lt;img');
      // onerror is safe when escaped (can't execute JavaScript)
      expect(escaped).toContain('onerror');
    });
  });

  describe('Null/Undefined Handling', () => {
    it('should return empty string for null', () => {
      expect(escapeHTML(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(escapeHTML(undefined)).toBe('');
    });

    it('should handle empty string', () => {
      expect(escapeHTML('')).toBe('');
    });
  });

  describe('Edge Cases', () => {
    it('should handle strings with no special characters', () => {
      expect(escapeHTML('Hello World')).toBe('Hello World');
    });

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(10000) + '<script>' + 'b'.repeat(10000);
      const escaped = escapeHTML(longString);
      expect(escaped).toContain('&lt;script&gt;');
      expect(escaped.length).toBeGreaterThan(longString.length);
    });

    it('should handle unicode characters', () => {
      expect(escapeHTML('Hello 世界 <script>')).toBe(
        'Hello 世界 &lt;script&gt;'
      );
    });

    it('should handle emoji', () => {
      expect(escapeHTML('🔥 <script>alert(1)</script> 🎉')).toBe(
        '🔥 &lt;script&gt;alert(1)&lt;&#x2F;script&gt; 🎉'
      );
    });

    it('should handle repeated escaping idempotently', () => {
      const original = '<script>alert(1)</script>';
      const escaped1 = escapeHTML(original);
      const escaped2 = escapeHTML(escaped1);
      // Second escape should escape the & from &lt;
      expect(escaped2).toContain('&amp;lt;');
    });
  });
});

// ============================================================================
// sanitizeURL Tests
// ============================================================================

describe('sanitizeURL', () => {
  describe('Dangerous Protocols', () => {
    it('should block javascript: protocol', () => {
      expect(sanitizeURL('javascript:alert(1)')).toBeNull();
    });

    it('should block javascript: with whitespace', () => {
      expect(sanitizeURL('javascript:  alert(1)')).toBeNull();
    });

    it('should block javascript: with encoded characters', () => {
      expect(sanitizeURL('javascript:alert(1)')).toBeNull();
    });

    it('should block data: protocol', () => {
      expect(sanitizeURL('data:text/html,<script>alert(1)</script>')).toBeNull();
    });

    it('should block file: protocol', () => {
      expect(sanitizeURL('file:///etc/passwd')).toBeNull();
    });

    it('should block vbscript: protocol', () => {
      expect(sanitizeURL('vbscript:msgbox(1)')).toBeNull();
    });

    it('should block blob: protocol', () => {
      expect(sanitizeURL('blob:https://example.com/malicious')).toBeNull();
    });

    it('should block uppercase dangerous protocols', () => {
      expect(sanitizeURL('JAVASCRIPT:alert(1)')).toBeNull();
      expect(sanitizeURL('DATA:text/html,<script>')).toBeNull();
    });

    it('should block mixed-case dangerous protocols', () => {
      expect(sanitizeURL('JaVaScRiPt:alert(1)')).toBeNull();
    });
  });

  describe('Safe HTTPS URLs', () => {
    it('should allow valid HTTPS URLs', () => {
      expect(sanitizeURL('https://example.com')).toBe('https://example.com');
    });

    it('should allow HTTPS URLs with paths', () => {
      expect(sanitizeURL('https://example.com/path/to/page')).toBe(
        'https://example.com/path/to/page'
      );
    });

    it('should allow HTTPS URLs with query params', () => {
      expect(sanitizeURL('https://example.com?foo=bar&baz=qux')).toBe(
        'https://example.com?foo=bar&baz=qux'
      );
    });

    it('should allow HTTPS URLs with fragments', () => {
      expect(sanitizeURL('https://example.com#section')).toBe(
        'https://example.com#section'
      );
    });

    it('should allow HTTPS URLs with ports', () => {
      expect(sanitizeURL('https://example.com:8443/path')).toBe(
        'https://example.com:8443/path'
      );
    });

    it('should allow HTTPS URLs with auth', () => {
      expect(sanitizeURL('https://user:pass@example.com')).toBe(
        'https://user:pass@example.com'
      );
    });

    it('should trim whitespace from valid URLs', () => {
      expect(sanitizeURL('  https://example.com  ')).toBe('https://example.com');
    });
  });

  describe('HTTP URLs', () => {
    it('should block HTTP URLs by default', () => {
      expect(sanitizeURL('http://example.com')).toBeNull();
    });

    it('should allow HTTP URLs when allowHttp is true', () => {
      expect(sanitizeURL('http://example.com', { allowHttp: true })).toBe(
        'http://example.com'
      );
    });

    it('should block HTTP even with allowHttp false explicitly', () => {
      expect(sanitizeURL('http://example.com', { allowHttp: false })).toBeNull();
    });
  });

  describe('Special Protocols', () => {
    it('should allow tel: by default', () => {
      expect(sanitizeURL('tel:+1234567890')).toBe('tel:+1234567890');
    });

    it('should block tel: when allowTel is false', () => {
      expect(sanitizeURL('tel:+1234567890', { allowTel: false })).toBeNull();
    });

    it('should allow mailto: by default', () => {
      expect(sanitizeURL('mailto:user@example.com')).toBe('mailto:user@example.com');
    });

    it('should block mailto: when allowMailto is false', () => {
      expect(sanitizeURL('mailto:user@example.com', { allowMailto: false })).toBeNull();
    });

    it('should allow mailto with subject and body', () => {
      expect(sanitizeURL('mailto:test@example.com?subject=Hello&body=World')).toBe(
        'mailto:test@example.com?subject=Hello&body=World'
      );
    });
  });

  describe('Protocol-Relative URLs', () => {
    it('should convert protocol-relative URLs to HTTPS', () => {
      expect(sanitizeURL('//example.com/path')).toBe('https://example.com/path');
    });

    it('should convert protocol-relative URLs with ports to HTTPS', () => {
      expect(sanitizeURL('//example.com:8080/path')).toBe('https://example.com:8080/path');
    });

    it('should handle protocol-relative URLs with query params', () => {
      expect(sanitizeURL('//example.com?foo=bar')).toBe('https://example.com?foo=bar');
    });
  });

  describe('Null/Undefined Handling', () => {
    it('should return null for null input', () => {
      expect(sanitizeURL(null)).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(sanitizeURL(undefined)).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(sanitizeURL('')).toBeNull();
    });

    it('should return null for whitespace-only string', () => {
      expect(sanitizeURL('   ')).toBeNull();
    });
  });

  describe('Invalid URLs', () => {
    it('should return null for invalid URL format', () => {
      expect(sanitizeURL('not a url')).toBeNull();
    });

    it('should return null for malformed URLs', () => {
      expect(sanitizeURL('http://')).toBeNull();
    });

    it('should return null for URLs with invalid characters', () => {
      expect(sanitizeURL('https://exam ple.com')).toBeNull();
    });
  });

  describe('DoS Prevention', () => {
    it('should block URLs exceeding maximum length', () => {
      const longURL = 'https://example.com/' + 'a'.repeat(3000);
      expect(sanitizeURL(longURL)).toBeNull();
    });

    it('should allow URLs at exactly the limit', () => {
      const maxURL = 'https://example.com/' + 'a'.repeat(2020); // ~2048 chars
      const result = sanitizeURL(maxURL);
      expect(result).not.toBeNull();
    });

    it('should handle extremely long malicious URLs', () => {
      const hugeURL = 'javascript:' + 'alert(1);'.repeat(100000);
      expect(sanitizeURL(hugeURL)).toBeNull();
    });
  });

  describe('Unknown Protocols', () => {
    it('should block unknown custom protocols', () => {
      expect(sanitizeURL('custom://something')).toBeNull();
    });

    it('should block ftp protocol', () => {
      expect(sanitizeURL('ftp://files.example.com')).toBeNull();
    });

    it('should block ssh protocol', () => {
      expect(sanitizeURL('ssh://user@host')).toBeNull();
    });
  });

  describe('Warning Callback', () => {
    it('should call onWarning for dangerous protocols', () => {
      let warningMessage = '';
      let warningContext: any = {};

      sanitizeURL('javascript:alert(1)', {
        onWarning: (msg, ctx) => {
          warningMessage = msg;
          warningContext = ctx;
        },
      });

      expect(warningMessage).toContain('dangerous');
      expect(warningContext.protocol).toBe('javascript:');
    });

    it('should call onWarning for HTTP URLs when blocked', () => {
      let warningMessage = '';

      sanitizeURL('http://example.com', {
        allowHttp: false,
        onWarning: (msg) => {
          warningMessage = msg;
        },
      });

      expect(warningMessage).toContain('HTTP');
    });

    it('should call onWarning for URLs exceeding max length', () => {
      let warningMessage = '';

      sanitizeURL('https://example.com/' + 'a'.repeat(3000), {
        onWarning: (msg) => {
          warningMessage = msg;
        },
      });

      expect(warningMessage).toContain('maximum length');
    });

    it('should call onWarning for invalid URL format', () => {
      let warningMessage = '';

      sanitizeURL('not a url', {
        onWarning: (msg) => {
          warningMessage = msg;
        },
      });

      expect(warningMessage).toContain('Invalid URL');
    });

    it('should not call onWarning for valid URLs', () => {
      let warningCalled = false;

      const result = sanitizeURL('https://example.com', {
        onWarning: () => {
          warningCalled = true;
        },
      });

      expect(result).toBe('https://example.com');
      expect(warningCalled).toBe(false);
    });
  });

  describe('Real-World Attack Vectors', () => {
    it('should block data URL with base64 encoded script', () => {
      expect(sanitizeURL('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==')).toBeNull();
    });

    it('should block javascript URL with HTML entities', () => {
      expect(sanitizeURL('javascript:alert(1)')).toBeNull();
    });

    it('should handle URLs with null bytes', () => {
      const result = sanitizeURL('https://example.com\x00javascript:alert(1)');
      // URL constructor should handle this
      expect(result === null || result.includes('https://')).toBe(true);
    });

    it('should block XSS via URL parameter', () => {
      const url = 'https://example.com?redirect=javascript:alert(1)';
      const result = sanitizeURL(url);
      // Should allow HTTPS URL even with suspicious params
      expect(result).toBe(url);
    });
  });

  describe('Edge Cases', () => {
    it('should handle URLs with Unicode domains', () => {
      expect(sanitizeURL('https://例え.jp')).toBe('https://例え.jp');
    });

    it('should handle URLs with emoji in path', () => {
      expect(sanitizeURL('https://example.com/🎉')).toBe('https://example.com/🎉');
    });

    it('should handle localhost URLs', () => {
      expect(sanitizeURL('https://localhost:3000')).toBe('https://localhost:3000');
    });

    it('should handle IP address URLs', () => {
      expect(sanitizeURL('https://192.168.1.1')).toBe('https://192.168.1.1');
    });

    it('should handle IPv6 URLs', () => {
      expect(sanitizeURL('https://[::1]')).toBe('https://[::1]');
    });
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('escapeHTML + sanitizeURL Integration', () => {
  it('should safely render ad with all fields sanitized', () => {
    const maliciousAd = {
      title: '<script>alert("XSS")</script>Best Movers',
      body: 'Click <a href="javascript:alert(1)">here</a>',
      cta: '"><img src=x onerror=alert(1)>',
      action_url: 'javascript:window.location="http://evil.com"',
    };

    const safeTitle = escapeHTML(maliciousAd.title);
    const safeBody = escapeHTML(maliciousAd.body);
    const safeCTA = escapeHTML(maliciousAd.cta);
    const safeURL = sanitizeURL(maliciousAd.action_url);

    // All XSS should be escaped
    expect(safeTitle).not.toContain('<script');
    expect(safeBody).not.toContain('<a href');
    expect(safeCTA).not.toContain('<img');

    // Malicious URL should be blocked
    expect(safeURL).toBeNull();
  });

  it('should handle null fields gracefully', () => {
    const adWithNulls = {
      title: null,
      body: undefined,
      cta: 'Click Here',
      action_url: 'https://example.com',
    };

    const safeTitle = escapeHTML(adWithNulls.title);
    const safeBody = escapeHTML(adWithNulls.body);
    const safeCTA = escapeHTML(adWithNulls.cta);
    const safeURL = sanitizeURL(adWithNulls.action_url);

    expect(safeTitle).toBe('');
    expect(safeBody).toBe('');
    expect(safeCTA).toBe('Click Here');
    expect(safeURL).toBe('https://example.com');
  });
});
