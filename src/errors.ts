/**
 * Error classes for AttentionMarket SDK.
 * Surfaces HTTP status, API error codes, messages, and request_id.
 */

import type { APIError } from './types.js';

export class AttentionMarketError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AttentionMarketError';
    Object.setPrototypeOf(this, AttentionMarketError.prototype);
  }
}

export class APIRequestError extends AttentionMarketError {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly requestId?: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    statusCode: number,
    apiError: APIError,
  ) {
    super(apiError.message);
    this.name = 'APIRequestError';
    this.statusCode = statusCode;
    this.errorCode = apiError.error;
    if (apiError.request_id !== undefined) {
      this.requestId = apiError.request_id;
    }
    if (apiError.details !== undefined) {
      this.details = apiError.details;
    }
    Object.setPrototypeOf(this, APIRequestError.prototype);
  }
}

export class NetworkError extends AttentionMarketError {
  public readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'NetworkError';
    if (cause !== undefined) {
      this.cause = cause;
    }
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class TimeoutError extends AttentionMarketError {
  constructor(message: string = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}
