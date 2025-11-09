/**
 * Authentication Middleware
 *
 * This module re-exports the authentication utilities from lib/auth.js
 * to maintain backward compatibility with code that imports from middleware/auth.js
 */

export { verifyToken, generateToken, requireAuth } from '../lib/auth.js';

/**
 * Require specific role
 * @param {Request} request - Next.js request object
 * @param {string|string[]} roles - Required role(s)
 * @returns {Promise<Object>} Decoded user token
 */
export async function requireRole(request, roles) {
  const user = await requireAuth(request);
  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  if (!roleArray.includes(user.role)) {
    throw new Error(`Access denied. Required role: ${roleArray.join(' or ')}`);
  }
  
  return user;
}