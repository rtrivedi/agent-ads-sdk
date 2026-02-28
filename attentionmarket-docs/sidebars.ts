import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Introduction',
    },
    {
      type: 'doc',
      id: 'quickstart',
      label: 'Quickstart',
    },
    {
      type: 'category',
      label: 'Core Concepts',
      collapsed: false,
      items: [
        'smart-context',
        'how-it-works',
        'quality-relevance-explained',
      ],
    },
    {
      type: 'category',
      label: 'Monetization',
      collapsed: false,
      items: [
        'pricing-earnings',
        'for-advertisers',
        'promote-your-agent',
      ],
    },
    {
      type: 'doc',
      id: 'trust-safety',
      label: 'Trust & Safety',
    },
    {
      type: 'category',
      label: 'Quick Links',
      collapsed: true,
      items: [
        {
          type: 'link',
          label: 'NPM Package',
          href: 'https://www.npmjs.com/package/@the_ro_show/agent-ads-sdk',
        },
        {
          type: 'link',
          label: 'GitHub',
          href: 'https://github.com/rtrivedi/agent-ads-sdk',
        },
        {
          type: 'link',
          label: 'Get API Keys',
          href: 'https://developers.attentionmarket.ai',
        },
        {
          type: 'link',
          label: 'Developer Portal',
          href: 'https://api.attentionmarket.ai',
        },
        {
          type: 'link',
          label: 'For Advertisers',
          href: 'https://advertiser.attentionmarket.ai',
        },
      ],
    },
  ],
};

export default sidebars;