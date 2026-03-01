import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    // 🚀 START HERE
    {
      type: 'category',
      label: 'Get Started',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'intro',
          label: 'What is AttentionMarket?',
        },
        {
          type: 'doc',
          id: 'quickstart',
          label: 'Quick Start (5 min)',
        },
        {
          type: 'doc',
          id: 'how-it-works',
          label: 'How It Works',
        },
      ],
    },

    // 🔧 BUILD
    {
      type: 'category',
      label: 'Integration Guides',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'api-reference',
          label: 'REST API',
        },
        {
          type: 'doc',
          id: 'mobile-integration',
          label: 'Mobile SDKs',
        },
        {
          type: 'doc',
          id: 'smart-context',
          label: 'Context & Relevance',
        },
        {
          type: 'doc',
          id: 'smart-display-templates',
          label: 'Display Patterns',
        },
      ],
    },

    // 💰 MONETIZE
    {
      type: 'category',
      label: 'Monetization',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'pricing-earnings',
          label: 'Pricing & Payouts',
        },
        {
          type: 'doc',
          id: 'quality-relevance-explained',
          label: 'Quality Scoring',
        },
        {
          type: 'doc',
          id: 'promote-your-agent',
          label: 'Grow Revenue',
        },
      ],
    },

    // 🏢 ADVERTISE
    {
      type: 'category',
      label: 'For Advertisers',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'for-advertisers',
          label: 'Start Advertising',
        },
        {
          type: 'link',
          label: 'Advertiser Portal →',
          href: 'https://advertiser.attentionmarket.ai',
        },
      ],
    },

    // 🔒 POLICIES
    {
      type: 'category',
      label: 'Policies',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'trust-safety',
          label: 'Trust & Safety',
        },
      ],
    },

    // 🛠️ RESOURCES (at bottom)
    {
      type: 'category',
      label: 'Resources',
      collapsed: false,
      items: [
        {
          type: 'link',
          label: 'NPM Package →',
          href: 'https://www.npmjs.com/package/@the_ro_show/agent-ads-sdk',
        },
        {
          type: 'link',
          label: 'GitHub →',
          href: 'https://github.com/rtrivedi/agent-ads-sdk',
        },
        {
          type: 'link',
          label: 'Get API Keys →',
          href: 'https://developers.attentionmarket.ai',
        },
        {
          type: 'link',
          label: 'Developer Portal →',
          href: 'https://api.attentionmarket.ai',
        },
      ],
    },
  ],
};

export default sidebars;