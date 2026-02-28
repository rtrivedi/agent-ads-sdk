import React from 'react';

interface APIEndpointProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  children?: React.ReactNode;
}

export default function APIEndpoint({ method, path, children }: APIEndpointProps) {
  const methodClass = `api-method api-method-${method.toLowerCase()}`;

  return (
    <div className="api-endpoint">
      <div style={{ marginBottom: '1rem' }}>
        <span className={methodClass}>{method}</span>
        <span className="api-path">{path}</span>
      </div>
      {children && (
        <div className="api-endpoint-content">
          {children}
        </div>
      )}
    </div>
  );
}