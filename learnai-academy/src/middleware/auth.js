/**
 * Authentication Middleware
 *
 * This module re-exports the authentication utilities from lib/auth.js
 * to maintain backward compatibility with code that imports from middleware/auth.js
 */

export { verifyToken, generateToken, requireAuth, requireRole } from '../lib/auth.js';