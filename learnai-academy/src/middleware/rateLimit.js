import { cacheService } from '../services/cache/cacheService.js';

/**
 * Rate Limiting Middleware
 *
 * Prevents API abuse by limiting requests per time window
 * Uses Redis for distributed rate limiting
 */

/**
 * Rate limit configuration for different endpoint types
 */
const RATE_LIMITS = {
  auth: {
    maxRequests: 5,
    windowSeconds: 60, // 5 requests per minute
  },
  ai: {
    maxRequests: 20,
    windowSeconds: 60, // 20 requests per minute
  },
  api: {
    maxRequests: 100,
    windowSeconds: 60, // 100 requests per minute
  },
  assessment: {
    maxRequests: 10,
    windowSeconds: 60, // 10 requests per minute
  },
};

/**
 * Apply rate limiting to a request
 *
 * @param {Request} request - Next.js request object
 * @param {string} identifier - Unique identifier (userId or IP)
 * @param {string} limitType - Type of rate limit (auth, ai, api, assessment)
 * @returns {Promise<Object>} Rate limit result
 */
export async function rateLimit(request, identifier, limitType = 'api') {
  try {
    const config = RATE_LIMITS[limitType] || RATE_LIMITS.api;
    const key = `ratelimit:${limitType}:${identifier}`;

    const result = await cacheService.checkRateLimit(
      key,
      config.maxRequests,
      config.windowSeconds
    );

    return {
      allowed: result.allowed,
      current: result.current,
      limit: result.limit,
      remaining: Math.max(0, result.limit - result.current),
      resetAt: Date.now() + (config.windowSeconds * 1000),
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Allow request if rate limiting fails (fail open)
    return {
      allowed: true,
      current: 0,
      limit: 100,
      remaining: 100,
      resetAt: Date.now() + 60000,
    };
  }
}

/**
 * Get client identifier from request
 * Uses userId if authenticated, otherwise IP address
 *
 * @param {Request} request - Next.js request object
 * @param {Object} user - Authenticated user object (optional)
 * @returns {string} Client identifier
 */
export function getClientIdentifier(request, user = null) {
  if (user && user.userId) {
    return `user:${user.userId}`;
  }

  // Get IP address from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';

  return `ip:${ip}`;
}

/**
 * Middleware wrapper for rate limiting
 *
 * @param {string} limitType - Type of rate limit to apply
 * @returns {Function} Middleware function
 */
export function withRateLimit(limitType = 'api') {
  return async function rateLimitMiddleware(request, user = null) {
    const identifier = getClientIdentifier(request, user);
    const result = await rateLimit(request, identifier, limitType);

    if (!result.allowed) {
      const error = new Error('Rate limit exceeded');
      error.statusCode = 429;
      error.headers = {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': result.resetAt.toString(),
        'Retry-After': Math.ceil(
          (result.resetAt - Date.now()) / 1000
        ).toString(),
      };
      throw error;
    }

    return {
      rateLimitHeaders: {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.resetAt.toString(),
      },
    };
  };
}

/**
 * Add rate limit headers to response
 *
 * @param {NextResponse} response - Next.js response object
 * @param {Object} headers - Rate limit headers
 * @returns {NextResponse} Response with headers
 */
export function addRateLimitHeaders(response, headers) {
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
  return response;
}

export default {
  rateLimit,
  withRateLimit,
  getClientIdentifier,
  addRateLimitHeaders,
  RATE_LIMITS,
};
