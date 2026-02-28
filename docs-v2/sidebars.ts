import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  docsSidebar: [
    'introduction',
    'quickstart',
    'authentication',
    'personal-agents',
    {
      type: 'category',
      label: 'AI Applications',
      collapsed: false,
      items: [
        'applications/introduction',
        'applications/installation',
        'applications/basic-integration',
        'applications/placements',
        'applications/tracking',
        'applications/best-practices',
      ],
    },
    {
      type: 'category',
      label: 'AI Agents',
      collapsed: false,
      items: [
        'agents/introduction',
        'agents/setup',
        'agents/autonomous',
        'agents/tool-calling',
        'agents/formatting',
        'agents/error-handling',
      ],
    },
    {
      type: 'category',
      label: 'Developer Controls',
      collapsed: false,
      items: [
        'controls/quality',
        'controls/categories',
        'controls/revenue',
      ],
    },
  ],

  apiSidebar: [
    'api/sdk',
    'api/ad-types',
    'api/parameters',
    'api/responses',
    'api/errors',
  ],
};

export default sidebars;
