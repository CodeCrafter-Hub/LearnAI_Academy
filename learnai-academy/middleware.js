import { NextResponse } from 'next/server';

/**
 * Global Next.js middleware for security headers
 * This runs on every request before it reaches the API routes or pages
 */
export function middleware(request) {
  const response = NextResponse.next();

  // Security Headers

  // Content Security Policy - prevent XSS attacks
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval
    "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // Prevent clickjacking attacks
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection (legacy browsers)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer Policy - control how much referrer information is shared
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy - restrict browser features
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(self), geolocation=(), payment=()'
  );

  // HSTS - Force HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}

/**
 * Configure which routes this middleware runs on
 * Match all routes except static files and Next.js internal routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, favicon.png (favicon files)
     * - public folder files
     * - API routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|favicon\\.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
