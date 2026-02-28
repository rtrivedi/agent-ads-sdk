import React from 'react';

interface ResponseViewerProps {
  status: 'success' | 'error';
  statusCode: number;
  response: any;
}

export default function ResponseViewer({ status, statusCode, response }: ResponseViewerProps) {
  return (
    <div className="response-viewer">
      <div className="response-header">
        <div className={`response-status ${status === 'success' ? 'status-success' : 'status-error'}`}>
          <span>{status === 'success' ? '✓' : '✗'}</span>
          <span>{statusCode} {status === 'success' ? 'OK' : 'Error'}</span>
        </div>
      </div>
      <div className="response-body">
        <pre style={{ margin: 0 }}>
          {JSON.stringify(response, null, 2)}
        </pre>
      </div>
    </div>
  );
}