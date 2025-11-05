import { cacheService } from '@/services/cache/cacheService';
import { NextResponse } from 'next/server';

export async function rateLimitMiddleware(request, maxRequests = 100, windowSeconds = 900) {
  try {
    // Get client identifier (IP or user ID)
    const identifier = getClientIdentifier(request);
    const key = `ratelimit:${identifier}`;
    
    // Check rate limit
    const result = await cacheService.checkRateLimit(key, maxRequests, windowSeconds);
    
    if (!result.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: windowSeconds,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': (Date.now() + windowSeconds * 1000).toString(),
          },
        }
      );
    }
    
    return null; // Allow request to proceed
  } catch (error) {
    console.error('Rate limit error:', error);
    return null; // Allow on error
  }
}

function getClientIdentifier(request) {
  // Try to get user ID from token
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return `user:${decoded.userId}`;
    } catch (error) {
      // Fall through to IP
    }
  }
  
  // Use IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
  return `ip:${ip}`;
}
