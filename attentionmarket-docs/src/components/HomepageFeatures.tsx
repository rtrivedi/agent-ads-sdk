import React from 'react';
import FeatureCard from './FeatureCard';

const features = [
  {
    title: 'Your Users Won\'t Hate You',
    description: 'Context-aware promotions that actually help users. No creepy tracking, no irrelevant garbage. Just helpful suggestions when they make sense.',
  },
  {
    title: 'You Keep Control (And Most of the Money)',
    description: 'No vendor lock-in. No platform fees. No mysterious deductions. See exactly what you\'ll earn before showing anything.',
  },
  {
    title: 'Zero Dependencies, Zero Headaches',
    description: 'No bloated SDKs. No build steps. No configuration hell. One endpoint, one response, done.',
  },
];

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className="features-section">
      <div className="container">
        <div className="text--center">
          <h2>Why Developers Actually Love This</h2>
          <p className="hero-subtitle">
            We solved the problems you've been quietly suffering through
          </p>
        </div>
        <div className="feature-grid">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} {...feature} />
          ))}
        </div>

        <div className="metrics-section">
          <h2 className="text--center">What Developers Are Saying</h2>
          <div className="testimonial-grid" style={{marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem'}}>
            <div className="testimonial-card" style={{padding: '1.5rem', background: 'var(--ifm-card-background-color)', borderRadius: '8px', borderLeft: '4px solid #37FF81'}}>
              <p style={{fontStyle: 'italic', marginBottom: '1rem'}}>"I added this to my Discord bot on a Friday night. Woke up Saturday with $47 in earnings. Literally made money while I slept."</p>
              <p style={{fontWeight: 600, fontSize: '0.9rem'}}>— AI Discord Bot Dev</p>
            </div>
            <div className="testimonial-card" style={{padding: '1.5rem', background: 'var(--ifm-card-background-color)', borderRadius: '8px', borderLeft: '4px solid #37FF81'}}>
              <p style={{fontStyle: 'italic', marginBottom: '1rem'}}>"Finally, a way to monetize that doesn't make me feel like I'm selling out my users. The promotions are actually helpful."</p>
              <p style={{fontWeight: 600, fontSize: '0.9rem'}}>— ChatGPT Plugin Creator</p>
            </div>
            <div className="testimonial-card" style={{padding: '1.5rem', background: 'var(--ifm-card-background-color)', borderRadius: '8px', borderLeft: '4px solid #37FF81'}}>
              <p style={{fontStyle: 'italic', marginBottom: '1rem'}}>"30 seconds to integrate. No joke. Copy, paste, deploy. Now covering my OpenAI API costs and then some."</p>
              <p style={{fontWeight: 600, fontSize: '0.9rem'}}>— Indie Hacker</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}