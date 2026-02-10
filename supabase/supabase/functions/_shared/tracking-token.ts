/**
 * Shared utilities for tracking token generation and validation
 *
 * Simplified token format:
 * {
 *   u: unit_id,      // Which ad unit
 *   a: agent_id,     // Which developer gets credit
 *   t: timestamp     // Unix timestamp (seconds)
 * }
 *
 * Token structure: base64url(json).base64url(hmac_signature)
 */

// Constants
export const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const TOKEN_MAX_LENGTH = 2048; // Prevent DOS

// Base64URL encoding/decoding
export function base64urlEncode(data: string): string {
  return btoa(data)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function base64urlDecode(data: string): string {
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  return atob(base64 + padding);
}

// Get HMAC key (throws if not configured)
async function getHMACKey(operation: 'sign' | 'verify'): Promise<CryptoKey> {
  const secret = Deno.env.get('TRACKING_HMAC_SECRET');
  if (!secret) {
    throw new Error('TRACKING_HMAC_SECRET environment variable not configured');
  }

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);

  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [operation]
  );
}

// Sign data with HMAC
async function signData(data: string): Promise<string> {
  const key = await getHMACKey('sign');
  const encoder = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(data)
  );

  // Convert signature to base64url (avoiding stack overflow from spread operator)
  const signatureBytes = new Uint8Array(signatureBuffer);
  let binaryString = '';
  for (let i = 0; i < signatureBytes.length; i++) {
    binaryString += String.fromCharCode(signatureBytes[i]);
  }

  return base64urlEncode(binaryString);
}

// Verify signature
async function verifySignature(data: string, signature: string): Promise<boolean> {
  const key = await getHMACKey('verify');
  const encoder = new TextEncoder();

  // Decode signature from base64url
  const signatureBase64 = base64urlDecode(signature);
  const signatureBytes = new Uint8Array(signatureBase64.length);

  // P2 Fix #15: Validate character codes are in valid byte range
  for (let i = 0; i < signatureBase64.length; i++) {
    const charCode = signatureBase64.charCodeAt(i);
    if (charCode > 255) {
      throw new Error('Invalid signature encoding: contains non-byte characters');
    }
    signatureBytes[i] = charCode;
  }

  return await crypto.subtle.verify(
    'HMAC',
    key,
    signatureBytes,
    encoder.encode(data)
  );
}

// Token payload interface
export interface TrackingTokenPayload {
  u: string;  // unit_id
  a: string;  // agent_id
  t: number;  // timestamp (seconds since epoch)
}

// Generate signed tracking token
export async function generateTrackingToken(
  unitId: string,
  agentId: string
): Promise<string> {
  const payload: TrackingTokenPayload = {
    u: unitId,
    a: agentId,
    t: Math.floor(Date.now() / 1000), // Unix timestamp in seconds
  };

  const jsonData = JSON.stringify(payload);
  const encodedData = base64urlEncode(jsonData);
  const signature = await signData(encodedData);

  return `${encodedData}.${signature}`;
}

// Validate and decode tracking token
export async function validateTrackingToken(token: string): Promise<TrackingTokenPayload> {
  // Validate token length
  if (!token || token.length > TOKEN_MAX_LENGTH) {
    throw new Error('Invalid token: length exceeds maximum');
  }

  // Split token into data and signature
  const parts = token.split('.');
  if (parts.length !== 2) {
    throw new Error('Invalid token: malformed format');
  }

  const [encodedData, providedSignature] = parts;

  // Verify signature
  const isValid = await verifySignature(encodedData, providedSignature);
  if (!isValid) {
    throw new Error('Invalid token: signature verification failed');
  }

  // P1 Fix #6: Add proper error handling for decoding and parsing
  let jsonData: string;
  try {
    jsonData = base64urlDecode(encodedData);
  } catch (e) {
    throw new Error('Invalid token: malformed encoding');
  }

  let payload: any;
  try {
    payload = JSON.parse(jsonData);
  } catch (e) {
    throw new Error('Invalid token: malformed payload JSON');
  }

  // P1 Fix #5: Validate required fields with type checking and empty string validation
  if (!payload.u || typeof payload.u !== 'string' || payload.u.trim() === '') {
    throw new Error('Invalid token: missing or invalid unit_id');
  }
  if (!payload.a || typeof payload.a !== 'string' || payload.a.trim() === '') {
    throw new Error('Invalid token: missing or invalid agent_id');
  }
  if (!payload.t || typeof payload.t !== 'number' || payload.t <= 0) {
    throw new Error('Invalid token: missing or invalid timestamp');
  }

  const validatedPayload: TrackingTokenPayload = {
    u: payload.u,
    a: payload.a,
    t: payload.t,
  };

  // Check token age
  const tokenAgeMs = Date.now() - (validatedPayload.t * 1000);
  if (tokenAgeMs > TOKEN_MAX_AGE_MS) {
    throw new Error('Invalid token: expired (older than 7 days)');
  }

  if (tokenAgeMs < -60000) { // Token from future (allow 1 min clock skew)
    throw new Error('Invalid token: timestamp in future');
  }

  return validatedPayload;
}
