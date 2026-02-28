import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
}

export default function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="feature-card-premium">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}