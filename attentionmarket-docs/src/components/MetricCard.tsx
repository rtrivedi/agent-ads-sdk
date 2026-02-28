import React from 'react';

interface MetricCardProps {
  value: string;
  label: string;
  change?: string;
}

export default function MetricCard({ value, label, change }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
      {change && (
        <div className="metric-change">
          <span>↑</span>
          <span>{change}</span>
        </div>
      )}
    </div>
  );
}