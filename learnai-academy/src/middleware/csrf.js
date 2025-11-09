import { cookies } from 'next/headers';
import crypto from 'crypto';

/**
 * CSRF Protection Middleware
 * 
 * Implements CSRF token generation and validation
 */

const CSRF_TOKEN_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';

/**
 * Generate a CSRF token
 * @returns {string} CSRF token
 */
export function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Get or create CSRF token for the current session
 * @returns {Promise<string>} CSRF token
 */
export async function getCSRFToken() {
  const cookieStore = cookies();
  let token = cookieStore.get(CSRF_TOKEN_NAME)?.value;

  if (!token) {
    token = generateCSRFToken();
    cookieStore.set(CSRF_TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
  }

  return token;
}

/**
 * Validate CSRF token from request
 * @param {Request} request - Next.js request object
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
export async function validateCSRFToken(request) {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  const method = request.method;
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return { valid: true };
  }

  try {
    const cookieStore = cookies();
    const cookieToken = cookieStore.get(CSRF_TOKEN_NAME)?.value;
    const headerToken = request.headers.get(CSRF_HEADER_NAME);

    if (!cookieToken) {
      return {
        valid: false,
        error: 'CSRF token not found in cookies',
      };
    }

    if (!headerToken) {
      return {
        valid: false,
        error: 'CSRF token not found in request header',
      };
    }

    // Use constant-time comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(cookieToken),
      Buffer.from(headerToken)
    );

    if (!isValid) {
      return {
        valid: false,
        error: 'CSRF token mismatch',
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: 'CSRF validation failed',
    };
  }
}

/**
 * Middleware to require CSRF token for state-changing operations
 * @param {Function} handler - Route handler
 * @returns {Function} Wrapped handler with CSRF protection
 */
export function withCSRFProtection(handler) {
  return async function csrfProtectedHandler(request, context) {
    const validation = await validateCSRFToken(request);

    if (!validation.valid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'CSRF token validation failed',
          details: validation.error,
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return handler(request, context);
  };
}

/**
 * Get CSRF token for client-side use (via API endpoint)
 * This is safe because it's only for displaying the token, not validating
 */
export async function getCSRFTokenForClient() {
  const token = await getCSRFToken();
  return token;
}

export default {
  generateCSRFToken,
  getCSRFToken,
  validateCSRFToken,
  withCSRFProtection,
  getCSRFTokenForClient,
  CSRF_TOKEN_NAME,
  CSRF_HEADER_NAME,
};

