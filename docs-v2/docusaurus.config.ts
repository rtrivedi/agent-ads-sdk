import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'AttentionMarket SDK',
  tagline: 'Monetize AI applications with contextual advertising',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://docs.attentionmarket.ai',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'attentionmarket', // Usually your GitHub org/user name.
  projectName: 'agent-ads-sdk', // Usually your repo name.

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl:
            'https://github.com/rtrivedi/agent-ads-sdk/tree/main/docs-v2/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'AttentionMarket',
      logo: {
        alt: 'AttentionMarket Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiSidebar',
          position: 'left',
          label: 'API Reference',
        },
        {
          href: 'https://api.attentionmarket.ai',
          label: 'Dashboard',
          position: 'right',
        },
        {
          href: 'https://github.com/rtrivedi/agent-ads-sdk',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Quick Start',
              to: '/quickstart',
            },
            {
              label: 'Applications',
              to: '/applications/introduction',
            },
            {
              label: 'Agents',
              to: '/agents/introduction',
            },
            {
              label: 'API Reference',
              to: '/api/sdk',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Dashboard',
              href: 'https://api.attentionmarket.ai',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/rtrivedi/agent-ads-sdk',
            },
            {
              label: 'NPM Package',
              href: 'https://www.npmjs.com/package/@the_ro_show/agent-ads-sdk',
            },
          ],
        },
        {
          title: 'Support',
          items: [
            {
              label: 'Email Support',
              href: 'mailto:support@attentionmarket.ai',
            },
            {
              label: 'Report Issues',
              href: 'https://github.com/rtrivedi/agent-ads-sdk/issues',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} AttentionMarket. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.vsDark,
      additionalLanguages: ['bash', 'json', 'typescript', 'javascript', 'python'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
