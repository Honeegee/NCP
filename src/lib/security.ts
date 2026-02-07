/**
 * Security utilities for authentication endpoints
 * Implements rate limiting, account lockout, and password validation
 */

// Rate limiting configuration
interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// Account lockout tracking
interface LockoutRecord {
  attempts: number;
  lockedUntil: number | null;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const lockoutMap = new Map<string, LockoutRecord>();

// Rate limit configurations for different endpoints
export const RATE_LIMITS = {
  LOGIN: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  FORGOT_PASSWORD: { maxAttempts: 3, windowMs: 15 * 60 * 1000 }, // 3 attempts per 15 minutes
  RESET_PASSWORD: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  CHANGE_PASSWORD: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
};

// Account lockout configuration
const LOCKOUT_CONFIG = {
  MAX_FAILED_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 30 * 60 * 1000, // 30 minutes
};

/**
 * Check rate limit for a given identifier (IP or email)
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const key = `ratelimit:${identifier}`;
  const record = rateLimitMap.get(key);

  // Clean up expired entries
  if (record && now > record.resetTime) {
    rateLimitMap.delete(key);
  }

  const current = rateLimitMap.get(key);

  if (!current) {
    rateLimitMap.set(key, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true };
  }

  if (current.count >= config.maxAttempts) {
    const retryAfter = Math.ceil((current.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  current.count++;
  return { allowed: true };
}

/**
 * Check if an account is locked out
 */
export function checkAccountLockout(email: string): {
  isLocked: boolean;
  remainingTime?: number;
} {
  const now = Date.now();
  const record = lockoutMap.get(email);

  if (!record) {
    return { isLocked: false };
  }

  // Check if lockout has expired
  if (record.lockedUntil && now > record.lockedUntil) {
    lockoutMap.delete(email);
    return { isLocked: false };
  }

  if (record.lockedUntil) {
    const remainingTime = Math.ceil((record.lockedUntil - now) / 1000);
    return { isLocked: true, remainingTime };
  }

  return { isLocked: false };
}

/**
 * Record a failed login attempt
 */
export function recordFailedLogin(email: string): {
  shouldLockout: boolean;
  attemptsRemaining: number;
} {
  const record = lockoutMap.get(email) || { attempts: 0, lockedUntil: null };
  record.attempts++;

  if (record.attempts >= LOCKOUT_CONFIG.MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_CONFIG.LOCKOUT_DURATION_MS;
    lockoutMap.set(email, record);
    return { shouldLockout: true, attemptsRemaining: 0 };
  }

  lockoutMap.set(email, record);
  const attemptsRemaining =
    LOCKOUT_CONFIG.MAX_FAILED_ATTEMPTS - record.attempts;
  return { shouldLockout: false, attemptsRemaining };
}

/**
 * Clear failed login attempts (on successful login)
 */
export function clearFailedLogins(email: string): void {
  lockoutMap.delete(email);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (password.length > 128) {
    errors.push("Password must not exceed 128 characters");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&* etc.)");
  }

  // Check for consecutive identical characters (more than 3 in a row)
  if (/(.)\1\1\1/.test(password)) {
    errors.push("Password cannot contain 4 or more consecutive identical characters");
  }

  // Common weak passwords to block
  const weakPasswords = [
    'password', 'password123', '12345678', '123456789', '1234567890',
    'qwerty', 'qwerty123', 'admin', 'admin123', 'letmein', 'welcome',
    'monkey', 'dragon', 'baseball', 'football', 'superman', 'iloveyou',
    'sunshine', 'master', 'hello', 'freedom', 'whatever', 'trustno1'
  ];
  
  if (weakPasswords.includes(password.toLowerCase())) {
    errors.push("Password is too common or easily guessable");
  }

  // Check for common patterns
  const commonPatterns = [
    /^[a-zA-Z]+$/, // Only letters
    /^\d+$/, // Only numbers
    /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/, // Only special characters
    /^(.)\1+$/, // All same character
    /^123456789/, // Sequential numbers
    /^qwerty/, // Keyboard patterns
    /^abcdef/, // Sequential letters
  ];
  
  if (commonPatterns.some(pattern => pattern.test(password))) {
    errors.push("Password follows a common pattern that is easy to guess");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get client IP address from request
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") || // Cloudflare
    "unknown"
  );
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Generate secure random token
 */
export async function generateSecureToken(bytes: number = 32): Promise<string> {
  // Use Web Crypto API for browser compatibility
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(bytes);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // For Node.js environment, use dynamic import
  try {
    const crypto = await import('crypto');
    return crypto.randomBytes(bytes).toString('hex');
  } catch {
    throw new Error("No secure random number generator available");
  }
}

/**
 * Check if token format is valid
 */
export function isValidTokenFormat(token: string): boolean {
  // Token should be 64 characters (32 bytes in hex)
  return /^[a-f0-9]{64}$/i.test(token);
}

/**
 * Clean up expired rate limit and lockout records
 * Should be called periodically
 */
export function cleanupExpiredRecords(): void {
  const now = Date.now();

  // Clean rate limit records
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }

  // Clean lockout records
  for (const [key, record] of lockoutMap.entries()) {
    if (record.lockedUntil && now > record.lockedUntil) {
      lockoutMap.delete(key);
    }
  }
}

// Clean up every 5 minutes
setInterval(cleanupExpiredRecords, 5 * 60 * 1000);
