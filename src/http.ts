/**
 * HTTP client with retry logic, timeout handling, and authentication.
 * Retry policy: only on 408, 429, 500, 502, 503, 504
 * Max retries: 2 (configurable)
 * Backoff: exponential with jitter
 */

import { APIRequestError, NetworkError, TimeoutError } from './errors.js';
import type { APIError } from './types.js';

export interface HTTPClientConfig {
  apiKey?: string;
  baseUrl: string;
  timeoutMs: number;
  maxRetries: number;
}

const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

export class HTTPClient {
  constructor(private config: HTTPClientConfig) {}

  async request<T>(
    method: 'GET' | 'POST',
    path: string,
    options: {
      body?: unknown;
      headers?: Record<string, string>;
      idempotencyKey?: string;
    } = {},
  ): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const response = await this.makeRequest(url, method, options);
        return response as T;
      } catch (error) {
        lastError = error as Error;

        // Don't retry if it's not a retryable error
        if (!this.shouldRetry(error, attempt)) {
          throw error;
        }

        // Wait before retrying
        if (attempt < this.config.maxRetries) {
          await this.backoff(attempt);
        }
      }
    }

    // All retries exhausted
    throw lastError;
  }

  private async makeRequest(
    url: string,
    method: 'GET' | 'POST',
    options: {
      body?: unknown;
      headers?: Record<string, string>;
      idempotencyKey?: string;
    },
  ): Promise<unknown> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      if (options.idempotencyKey) {
        headers['Idempotency-Key'] = options.idempotencyKey;
      }

      const response = await fetch(url, {
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle non-OK responses
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({
          error: 'unknown_error',
          message: 'Failed to parse error response',
          request_id: 'unknown',
        }));

        throw new APIRequestError(response.status, errorBody as APIError);
      }

      // Parse successful response
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle abort (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError();
      }

      // Re-throw API errors
      if (error instanceof APIRequestError) {
        throw error;
      }

      // Network errors
      throw new NetworkError('Network request failed', error as Error);
    }
  }

  private shouldRetry(error: unknown, attempt: number): boolean {
    // Don't retry if we've exhausted attempts
    if (attempt >= this.config.maxRetries) {
      return false;
    }

    // Retry on timeout
    if (error instanceof TimeoutError) {
      return true;
    }

    // Retry on network errors
    if (error instanceof NetworkError) {
      return true;
    }

    // Retry on specific HTTP status codes
    if (error instanceof APIRequestError) {
      return RETRYABLE_STATUS_CODES.has(error.statusCode);
    }

    return false;
  }

  private async backoff(attempt: number): Promise<void> {
    // Exponential backoff: 100ms * 2^attempt + jitter
    const baseDelay = 100 * Math.pow(2, attempt);
    const jitter = Math.random() * 100;
    const delay = baseDelay + jitter;

    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}
