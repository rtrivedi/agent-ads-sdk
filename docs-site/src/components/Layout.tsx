import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  {
    title: 'Get Started',
    links: [
      { title: 'Overview', href: '/' },
      { title: 'Quickstart', href: '/quickstart' },
      { title: 'Authentication', href: '/authentication' },
    ],
  },
  {
    title: 'AI Applications',
    links: [
      { title: 'Introduction', href: '/applications/introduction' },
      { title: 'Installation', href: '/applications/installation' },
      { title: 'Basic Integration', href: '/applications/basic-integration' },
      { title: 'Ad Placements', href: '/applications/placements' },
      { title: 'Tracking Events', href: '/applications/tracking' },
      { title: 'Best Practices', href: '/applications/best-practices' },
    ],
  },
  {
    title: 'AI Agents',
    links: [
      { title: 'Introduction', href: '/agents/introduction' },
      { title: 'Agent Setup', href: '/agents/setup' },
      { title: 'Autonomous Integration', href: '/agents/autonomous' },
      { title: 'Tool Calling', href: '/agents/tool-calling' },
      { title: 'Response Formatting', href: '/agents/formatting' },
      { title: 'Error Handling', href: '/agents/error-handling' },
    ],
  },
  {
    title: 'Controls & Optimization',
    links: [
      { title: 'Quality Controls', href: '/controls/quality' },
      { title: 'Category Filtering', href: '/controls/categories' },
      { title: 'Revenue Optimization', href: '/controls/revenue' },
      { title: 'Date Range Filtering', href: '/controls/date-filtering' },
    ],
  },
  {
    title: 'API Reference',
    links: [
      { title: 'SDK Methods', href: '/api/sdk' },
      { title: 'Ad Types', href: '/api/ad-types' },
      { title: 'Request Parameters', href: '/api/parameters' },
      { title: 'Response Formats', href: '/api/responses' },
      { title: 'Error Codes', href: '/api/errors' },
    ],
  },
];

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              AttentionMarket
            </span>
          </Link>
          <nav className="flex items-center space-x-6">
            <Link
              href="/quickstart"
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              Quickstart
            </Link>
            <Link
              href="/api/sdk"
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              API Reference
            </Link>
            <a
              href="https://github.com/rtrivedi/agent-ads-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              GitHub
            </a>
            <a
              href="https://api.attentionmarket.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              Get API Keys
            </a>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 flex">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 pr-8">
          <nav className="sticky top-24 space-y-8">
            {navigation.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`block text-sm py-1 px-3 rounded-md transition-colors ${
                          router.pathname === link.href
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl">
          <div className="prose prose-slate dark:prose-invert">
            {children}
          </div>
        </main>

        {/* Right Sidebar - Table of Contents (placeholder) */}
        <aside className="w-48 flex-shrink-0 pl-8">
          <div className="sticky top-24">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
              On This Page
            </h3>
            {/* TOC will be generated per-page */}
          </div>
        </aside>
      </div>
    </div>
  );
}
