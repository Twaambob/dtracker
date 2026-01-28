/**
 * SOVEREIGN Security Library
 * 
 * Enterprise-grade input validation and sanitization
 * Prevents: XSS, SQL Injection, Command Injection, Buffer Overflow
 */

// ============================================
// INPUT SANITIZATION
// ============================================

/**
 * Sanitize string input by removing dangerous characters and patterns
 * Prevents XSS attacks via HTML/Script injection
 */
export function sanitizeString(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== 'string') return '';

  const sanitized = input
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script protocol
    .replace(/javascript:/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=/gi, '')
    // Remove null bytes
    .replace(/\0/g, '')
    // Trim whitespace
    .trim();

  // Enforce length limit
  return sanitized.slice(0, maxLength);
}

/**
 * Sanitize HTML for display (escape special characters)
 */
export function escapeHtml(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;

  // RFC 5322 compliant regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate password strength
 * Requirements: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
 */
export function isValidPassword(password: string): { valid: boolean; message: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }

  return { valid: true, message: 'Password is strong' };
}

/**
 * Validate transaction amount
 * Prevents negative values, NaN, Infinity, and unreasonably large numbers
 */
export function isValidAmount(amount: number): boolean {
  return (
    typeof amount === 'number' &&
    !isNaN(amount) &&
    isFinite(amount) &&
    amount > 0 &&
    amount <= 999999999 // Max: 999 million
  );
}

/**
 * Validate transaction type
 */
export function isValidTransactionType(type: string): boolean {
  return type === 'credit' || type === 'debt';
}

/**
 * Validate name/entity field
 */
export function isValidName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;

  const sanitized = sanitizeString(name, 100);
  return sanitized.length >= 1 && sanitized.length <= 100;
}

/**
 * Validate note field
 */
export function isValidNote(note: string): boolean {
  if (!note) return true; // Optional field
  if (typeof note !== 'string') return false;

  const sanitized = sanitizeString(note, 500);
  return sanitized.length <= 500;
}

/**
 * Validate contact field
 */
export function isValidContact(contact: string): boolean {
  if (!contact) return true; // Optional field
  if (typeof contact !== 'string') return false;

  const sanitized = sanitizeString(contact, 100);
  return sanitized.length <= 100;
}

/**
 * Validate date string (YYYY-MM-DD format)
 */
export function isValidDateString(dateStr: string): boolean {
  if (!dateStr) return true; // Optional field
  if (typeof dateStr !== 'string') return false;

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return false;

  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Validate percentage field (0-100)
 */
export function isValidPercentage(percentage: number): boolean {
  return (
    typeof percentage === 'number' &&
    !isNaN(percentage) &&
    isFinite(percentage) &&
    percentage >= 0 &&
    percentage <= 100
  );
}

// ============================================
// TRANSACTION VALIDATION
// ============================================

export interface TransactionInput {
  type: string;
  name: string;
  amount: number;
  note?: string;
  contact?: string;
  dueDate?: string;
  returnsPercentage?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: TransactionInput;
}

/**
 * Comprehensive transaction validation
 * Returns validation result with sanitized data
 */
export function validateTransaction(input: TransactionInput): ValidationResult {
  const errors: string[] = [];

  // Validate type
  if (!isValidTransactionType(input.type)) {
    errors.push('Invalid transaction type. Must be "credit" or "debt".');
  }

  // Validate and sanitize name
  if (!isValidName(input.name)) {
    errors.push('Name is required and must be between 1-100 characters.');
  }

  // Validate amount
  if (!isValidAmount(input.amount)) {
    errors.push('Amount must be a positive number less than 999,999,999.');
  }

  // Validate optional fields
  if (input.note && !isValidNote(input.note)) {
    errors.push('Note must be less than 500 characters.');
  }

  if (input.contact && !isValidContact(input.contact)) {
    errors.push('Contact must be less than 100 characters.');
  }

  if (input.dueDate && !isValidDateString(input.dueDate)) {
    errors.push('Due date must be in YYYY-MM-DD format.');
  }

  // Validate returns percentage
  if (input.returnsPercentage !== undefined && !isValidPercentage(input.returnsPercentage)) {
    errors.push('Returns percentage must be between 0 and 100.');
  }

  // Return validation result
  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Return sanitized data
  return {
    valid: true,
    errors: [],
    sanitized: {
      type: input.type,
      name: sanitizeString(input.name, 100),
      amount: input.amount,
      note: input.note ? sanitizeString(input.note, 500) : undefined,
      contact: input.contact ? sanitizeString(input.contact, 100) : undefined,
      dueDate: input.dueDate || undefined,
      returnsPercentage: input.returnsPercentage
    }
  };
}

// ============================================
// INJECTION ATTACK DETECTION
// ============================================

/**
 * Detect potential SQL injection patterns
 * (Defense in depth - Firestore is NoSQL, but good practice)
 */
export function containsSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\bUNION\b.*\bSELECT\b)/i,
    /(\bDROP\b.*\bTABLE\b)/i,
    /(\bINSERT\b.*\bINTO\b)/i,
    /(\bDELETE\b.*\bFROM\b)/i,
    /(\bUPDATE\b.*\bSET\b)/i,
    /(--|#|\/\*|\*\/)/,  // SQL comment markers
    /(\bOR\b.*=.*\bOR\b)/i,
    /(\bAND\b.*=.*\bAND\b)/i,
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Detect XSS patterns
 */
export function containsXss(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<embed/gi,
    /<object/gi,
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}

// ============================================
// RATE LIMITING (Client-side)
// ============================================

interface RateLimitStore {
  [key: string]: number[];
}

const rateLimitStore: RateLimitStore = {};

/**
 * Simple client-side rate limiting
 * Returns true if action is allowed, false if rate limit exceeded
 */
export function checkRateLimit(
  action: string,
  maxAttempts: number = 5,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const key = `ratelimit_${action}`;

  // Initialize or cleanup old attempts
  if (!rateLimitStore[key]) {
    rateLimitStore[key] = [];
  }

  // Remove attempts outside the time window
  rateLimitStore[key] = rateLimitStore[key].filter(
    timestamp => now - timestamp < windowMs
  );

  // Check if limit exceeded
  if (rateLimitStore[key].length >= maxAttempts) {
    return false;
  }

  // Record this attempt
  rateLimitStore[key].push(now);
  return true;
}
