import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

/**
 * Verify JWT token from request
 * Supports both httpOnly cookies (preferred) and Authorization header (legacy)
 *
 * @param {Request} request - Next.js request object
 * @returns {Promise<Object|null>} Decoded token payload or null if invalid
 */
export async function verifyToken(request) {
  try {
    // Skip during build time
    if (process.env.NEXT_PHASE === 'phase-production-build' || !request) {
      return null;
    }

    // Check JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return null;
    }

    let token = null;

    // First, try to get token from httpOnly cookie (secure method)
    try {
      const cookieStore = await cookies();
      token = cookieStore.get('auth_token')?.value;
    } catch (error) {
      // cookies() not available in this context, fall back to header
      // This can happen during build or in certain edge cases
    }

    // Fallback to Authorization header for backward compatibility
    if (!token && request) {
      const authHeader = request.headers?.get('authorization');
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
    // Don't log JWT errors in production to avoid noise
    if (process.env.NODE_ENV === 'development') {
      console.error('Token verification error:', error.message);
    }
    return null;
  }
}

/**
 * Generate JWT token
 *
 * @param {Object} payload - Token payload (userId, email, role)
 * @returns {string} JWT token
 */
export function generateToken(payload) {
  // Validate JWT_SECRET strength
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters for security');
  }

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * Require authentication middleware
 * Throws error if user is not authenticated
 *
 * @param {Request} request - Next.js request object
 * @returns {Promise<Object>} Decoded user token
 */
export async function requireAuth(request) {
  const user = verifyToken(request);

  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}

/**
 * Set authentication cookie
 *
 * @param {NextResponse} response - Next.js response object
 * @param {string} token - JWT token to store
 */
export function setAuthCookie(response, token) {
  response.cookies.set('auth_token', token, {
    httpOnly: true, // Prevent XSS attacks
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax', // CSRF protection
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/', // Available throughout the app
  });

  return response;
}

/**
 * Clear authentication cookie
 *
 * @param {NextResponse} response - Next.js response object
 */
export function clearAuthCookie(response) {
  response.cookies.delete('auth_token');
  return response;
}
