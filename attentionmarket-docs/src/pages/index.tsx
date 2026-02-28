import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import HomepageFeatures from '../components/HomepageFeatures';

function HomepageHeader() {
  return (
    <header className="hero-gradient">
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">
            Stop Leaving Money on the Table
            <br />
            Your AI Agent Should Be Profitable
          </h1>

          <p className="hero-subtitle">
            Every AI conversation has monetization potential. AttentionMarket turns context into revenue
            with zero ad networks, zero negotiations, zero minimums. Just one API call.
          </p>

          <div className="hero-metrics">
            <div className="hero-metric">
              <span className="hero-metric-value">30 seconds</span>
              <span className="hero-metric-label">to first revenue</span>
            </div>
            <div className="hero-metric">
              <span className="hero-metric-value">Zero</span>
              <span className="hero-metric-label">dependencies</span>
            </div>
            <div className="hero-metric">
              <span className="hero-metric-value">You own</span>
              <span className="hero-metric-label">your users</span>
            </div>
          </div>

          <div className="hero-buttons">
            <Link
              className="button button--primary button--lg hero-button-primary"
              to="/docs/quickstart">
              Get Started →
            </Link>
            <Link
              className="button button--outline button--lg hero-button-secondary"
              to="https://github.com/rtrivedi/agent-ads-sdk">
              View on GitHub
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();

  return (
    <Layout
      title={`Contextual Promotions for AI`}
      description="The open promotion network for AI applications. Match user intent with relevant sponsors using conversation context.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}