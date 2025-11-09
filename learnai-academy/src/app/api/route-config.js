/**
 * Central configuration for API route dynamic rendering
 * 
 * All API routes that use authentication, cookies, or headers
 * must be marked as dynamic to prevent static generation errors.
 */

export const API_ROUTE_CONFIG = {
  // Force all API routes to be dynamic by default
  dynamic: 'force-dynamic',
  // Disable static generation for API routes
  revalidate: 0,
};

