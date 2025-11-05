import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const JWT_COOKIE_NAME = 'auth_token';
const CSRF_COOKIE_NAME = 'csrf_token';

/**
 * Verify JWT token from cookies or Authorization header
 * Prioritizes cookies for security, falls back to header for API compatibility
 */
export function verifyToken(request) {
  try {
    let token = null;

    // Try to get token from cookie first (most secure)
    try {
      const cookieStore = cookies();
      token = cookieStore.get(JWT_COOKIE_NAME)?.value;
    } catch (e) {
      // cookies() may fail in some contexts, fall back to header
    }

    // Fall back to Authorization header if no cookie
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return decoded;
  } catch (error) {
    console.error('Token verification error:', error.message);
    return null;
  }
}

/**
 * Generate JWT token
 */
export function generateToken(payload) {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(request) {
  try {
    const cookieStore = cookies();
    const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;

    // Get token from header
    const headerToken = request.headers.get('x-csrf-token');

    if (!cookieToken || !headerToken) {
      return false;
    }

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(cookieToken),
      Buffer.from(headerToken)
    );
  } catch (error) {
    console.error('CSRF verification error:', error.message);
    return false;
  }
}

/**
 * Set authentication cookies (httpOnly, secure, sameSite)
 */
export function setAuthCookies(token, csrfToken) {
  const cookieStore = cookies();
  const isProduction = process.env.NODE_ENV === 'production';

  // Set JWT token cookie (httpOnly - not accessible via JavaScript)
  cookieStore.set(JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction, // HTTPS only in production
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  // Set CSRF token cookie (accessible via JavaScript for header)
  cookieStore.set(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false, // Must be readable by JavaScript
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Clear authentication cookies
 */
export function clearAuthCookies() {
  const cookieStore = cookies();

  cookieStore.delete(JWT_COOKIE_NAME);
  cookieStore.delete(CSRF_COOKIE_NAME);
}

/**
 * Get CSRF token from cookies
 */
export function getCSRFToken() {
  try {
    const cookieStore = cookies();
    return cookieStore.get(CSRF_COOKIE_NAME)?.value || null;
  } catch (error) {
    return null;
  }
}

/**
 * Require authentication (throws if not authenticated)
 */
export async function requireAuth(request) {
  const user = verifyToken(request);

  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}
