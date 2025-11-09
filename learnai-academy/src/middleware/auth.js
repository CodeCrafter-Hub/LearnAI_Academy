import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

/**
 * Authentication middleware for API routes
 * Verifies JWT token and attaches user data to request
 *
 * Usage in API routes:
 * ```javascript
 * import { requireAuth } from '@/middleware/auth';
 *
 * export async function GET(request) {
 *   const { user, error } = await requireAuth(request);
 *   if (error) return error;
 *
 *   // User is authenticated, proceed with logic
 *   return NextResponse.json({ data: 'protected data', user });
 * }
 * ```
 *
 * @param {Request} request - Next.js request object
 * @param {Object} options - Middleware options
 * @param {string[]} options.roles - Required roles (optional)
 * @returns {Promise<Object>} { user, error } - User data or error response
 */
export async function requireAuth(request, options = {}) {
  try {
    // Verify the token
    const user = verifyToken(request);

    // Check if token is valid
    if (!user) {
      return {
        user: null,
        error: NextResponse.json(
          {
            error: 'Authentication required',
            message: 'Please log in to access this resource'
          },
          { status: 401 }
        )
      };
    }

    // Check for required roles if specified
    if (options.roles && options.roles.length > 0) {
      if (!user.role || !options.roles.includes(user.role)) {
        return {
          user: null,
          error: NextResponse.json(
            {
              error: 'Insufficient permissions',
              message: `This resource requires one of the following roles: ${options.roles.join(', ')}`,
              requiredRoles: options.roles,
              userRole: user.role
            },
            { status: 403 }
          )
        };
      }
    }

    // Authentication successful
    return {
      user,
      error: null
    };
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return {
      user: null,
      error: NextResponse.json(
        {
          error: 'Authentication failed',
          message: error.message
        },
        { status: 401 }
      )
    };
  }
}

/**
 * Optional authentication middleware
 * Attaches user data if token is valid, but doesn't require authentication
 *
 * Usage:
 * ```javascript
 * const { user } = await optionalAuth(request);
 * if (user) {
 *   // User is logged in
 * } else {
 *   // User is not logged in (anonymous)
 * }
 * ```
 *
 * @param {Request} request - Next.js request object
 * @returns {Promise<Object>} { user } - User data or null
 */
export async function optionalAuth(request) {
  try {
    const user = verifyToken(request);
    return { user: user || null };
  } catch (error) {
    console.error('Optional auth error:', error);
    return { user: null };
  }
}

/**
 * Role-based authentication middleware
 * Convenience wrapper for requireAuth with specific roles
 *
 * @param {string[]} roles - Required roles
 * @returns {Function} Middleware function
 */
export function requireRoles(...roles) {
  return async (request) => {
    return requireAuth(request, { roles });
  };
}

/**
 * Admin-only authentication middleware
 *
 * @param {Request} request
 * @returns {Promise<Object>} { user, error }
 */
export async function requireAdmin(request) {
  return requireAuth(request, { roles: ['admin', 'super_admin'] });
}

/**
 * Teacher authentication middleware
 *
 * @param {Request} request
 * @returns {Promise<Object>} { user, error }
 */
export async function requireTeacher(request) {
  return requireAuth(request, { roles: ['teacher', 'admin', 'super_admin'] });
}

/**
 * Student authentication middleware
 *
 * @param {Request} request
 * @returns {Promise<Object>} { user, error }
 */
export async function requireStudent(request) {
  return requireAuth(request, { roles: ['student', 'teacher', 'admin', 'super_admin'] });
}

/**
 * Parent authentication middleware
 *
 * @param {Request} request
 * @returns {Promise<Object>} { user, error }
 */
export async function requireParent(request) {
  return requireAuth(request, { roles: ['parent', 'admin', 'super_admin'] });
}

/**
 * Higher-order function to wrap API route handlers with authentication
 *
 * Usage:
 * ```javascript
 * export const GET = withAuth(async (request, { user }) => {
 *   // Handler logic with authenticated user
 *   return NextResponse.json({ user });
 * });
 * ```
 *
 * @param {Function} handler - API route handler
 * @param {Object} options - Middleware options
 * @returns {Function} Wrapped handler
 */
export function withAuth(handler, options = {}) {
  return async (request, context) => {
    const { user, error } = await requireAuth(request, options);

    if (error) {
      return error;
    }

    // Attach user to context and call handler
    return handler(request, { ...context, user });
  };
}

/**
 * Middleware for Next.js middleware.ts file
 * Can be used in the root middleware to protect entire routes
 *
 * Usage in middleware.ts:
 * ```typescript
 * import { authMiddleware } from '@/middleware/auth';
 *
 * export default authMiddleware({
 *   publicRoutes: ['/login', '/register', '/'],
 *   protectedRoutes: ['/dashboard', '/learn', '/progress'],
 * });
 * ```
 *
 * @param {Object} config - Middleware configuration
 * @param {string[]} config.publicRoutes - Routes that don't require auth
 * @param {string[]} config.protectedRoutes - Routes that require auth
 * @returns {Function} Middleware function
 */
export function authMiddleware(config = {}) {
  const { publicRoutes = [], protectedRoutes = [] } = config;

  return async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Check if route is public
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // Check if route is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    if (!isProtectedRoute) {
      return NextResponse.next();
    }

    // Verify authentication for protected routes
    const user = verifyToken(request);
    if (!user) {
      // Redirect to login page
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  };
}