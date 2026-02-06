/**
 * Password hashing utilities using Web Crypto API (scrypt)
 * Compatible with Deno Deploy / Supabase Edge Functions
 */

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Hash a password using PBKDF2 (Web Crypto API)
 * @param password - Plain text password
 * @returns Promise<string> - Hashed password (base64 encoded salt:hash)
 */
export async function hashPassword(password: string): Promise<string> {
  // Generate random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Import password as key
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  // Derive key using PBKDF2
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );

  // Convert to base64 and combine salt:hash
  const saltB64 = btoa(String.fromCharCode(...salt));
  const hashB64 = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));

  return `${saltB64}:${hashB64}`;
}

/**
 * Verify a password against a hash
 * @param password - Plain text password
 * @param storedHash - Stored hash (salt:hash format)
 * @returns Promise<boolean> - True if password matches
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    // Split salt and hash
    const [saltB64, hashB64] = storedHash.split(':');
    if (!saltB64 || !hashB64) {
      return false;
    }

    // Decode salt
    const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));

    // Import password as key
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    // Derive key using same parameters
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );

    // Compare hashes using constant-time comparison to prevent timing attacks
    const newHashB64 = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));

    // Constant-time comparison: always compare full length
    if (newHashB64.length !== hashB64.length) {
      return false;
    }

    let mismatch = 0;
    for (let i = 0; i < newHashB64.length; i++) {
      mismatch |= newHashB64.charCodeAt(i) ^ hashB64.charCodeAt(i);
    }

    return mismatch === 0;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns { valid: boolean, error?: string }
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }

  if (password.length > 128) {
    return { valid: false, error: 'Password must be less than 128 characters' };
  }

  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter || !hasNumber) {
    return { valid: false, error: 'Password must contain at least one letter and one number' };
  }

  return { valid: true };
}
