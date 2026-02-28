import React from 'react';
import CodeBlock from '../../components/CodeBlock';

export default function AdTypesPage() {
  return (
    <div>
      <h1>Ad Types</h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
        AttentionMarket supports three ad types: Link ads, Recommendation ads, and Service ads.
      </p>

      <div className="mb-12">
        <h2>Link Ads (Type 1)</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Traditional click-through ads with title, body, CTA, and destination URL.
        </p>
        <CodeBlock language="typescript" code={`{
  ad_type: 'link',
  creative: {
    title: "Pietra - Launch Your Product Brand",
    body: "Turn your idea into a real product with Pietra",
    cta: "Get Started"
  },
  click_url: "https://redirect.attentionmarket.ai/...",
  payout: 250  // $2.50 per click
}`} />
      </div>

      <div className="mb-12">
        <h2>Recommendation Ads (Type 2)</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Conversational teaser-based ads with optional promo codes.
        </p>
        <CodeBlock language="typescript" code={`{
  ad_type: 'recommendation',
  creative: {
    title: "20% off E-commerce Platform",
    body: "Build your online store with Shopify",
    cta: "Claim Discount",
    teaser: "Interested in 20% off e-commerce?",  // Optional
    promo_code: "CREATOR20",  // Optional
    message: "Use code CREATOR20 for 20% off"  // Optional
  },
  click_url: "https://redirect.attentionmarket.ai/...",
  payout: 300  // $3.00 per click
}`} />
        <p className="text-slate-600 dark:text-slate-400 mt-4">
          <strong>Note:</strong> Payment is triggered by clicks, not teaser acceptance. Teaser is an optional UX enhancement.
        </p>
      </div>

      <div className="mb-12">
        <h2>Service Ads (Type 3)</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Agent-to-agent API calls for autonomous service discovery.
        </p>
        <CodeBlock language="typescript" code={`{
  ad_type: 'service',
  creative: {
    title: "DeepL Translation API",
    body: "High-quality neural translation"
  },
  service_endpoint: "https://api.deepl.com/v2/translate",
  service_auth: "Bearer sk_...",
  transaction_id: "txn_...",
  payout: 500  // $5.00 per successful completion
}`} />
      </div>
    </div>
  );
}
