import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

/**
 * Error types for standardized error handling
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

/**
 * Higher-order function to wrap API route handlers with error handling
 *
 * Usage:
 * ```javascript
 * import { withErrorHandler } from '@/middleware/errorHandler';
 *
 * export const GET = withErrorHandler(async (request) => {
 *   // Your handler logic
 *   // Any thrown errors will be caught and formatted
 *   const data = await fetchData();
 *   return NextResponse.json({ data });
 * });
 * ```
 *
 * @param {Function} handler - API route handler function
 * @returns {Function} Wrapped handler with error handling
 */
export function withErrorHandler(handler) {
  return async (request, context) => {
    try {
      // Execute the handler
      const response = await handler(request, context);
      return response;
    } catch (error) {
      // Log the error
      logger.error('API Error:', {
        error: error.message,
        stack: error.stack,
        path: request.nextUrl?.pathname,
        method: request.method,
        statusCode: error.statusCode,
      });

      // Handle different error types
      if (error instanceof AppError) {
        return NextResponse.json(
          {
            error: error.code,
            message: error.message,
            ...(error.details && { details: error.details }),
          },
          { status: error.statusCode }
        );
      }

      // Handle Prisma errors
      if (error.code && error.code.startsWith('P')) {
        return handlePrismaError(error);
      }

      // Handle Zod validation errors
      if (error.name === 'ZodError') {
        return handleZodError(error);
      }

      // Handle JWT errors
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return NextResponse.json(
          {
            error: 'AUTHENTICATION_ERROR',
            message: 'Invalid or expired token',
          },
          { status: 401 }
        );
      }

      // Generic error response (don't expose internal errors in production)
      const isDevelopment = process.env.NODE_ENV === 'development';

      return NextResponse.json(
        {
          error: 'INTERNAL_ERROR',
          message: isDevelopment ? error.message : 'An unexpected error occurred',
          ...(isDevelopment && { stack: error.stack }),
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Handle Prisma database errors
 * @param {Error} error - Prisma error
 * @returns {NextResponse} Formatted error response
 */
function handlePrismaError(error) {
  const errorMap = {
    P2002: {
      status: 409,
      code: 'DUPLICATE_ENTRY',
      message: 'A record with this value already exists',
    },
    P2025: {
      status: 404,
      code: 'NOT_FOUND',
      message: 'The requested record was not found',
    },
    P2003: {
      status: 400,
      code: 'FOREIGN_KEY_CONSTRAINT',
      message: 'Invalid reference to related record',
    },
    P2014: {
      status: 400,
      code: 'INVALID_RELATION',
      message: 'The change violates a required relation',
    },
  };

  const mappedError = errorMap[error.code] || {
    status: 500,
    code: 'DATABASE_ERROR',
    message: 'A database error occurred',
  };

  logger.error('Prisma Error:', {
    code: error.code,
    meta: error.meta,
    message: error.message,
  });

  return NextResponse.json(
    {
      error: mappedError.code,
      message: mappedError.message,
      ...(process.env.NODE_ENV === 'development' && { details: error.meta }),
    },
    { status: mappedError.status }
  );
}

/**
 * Handle Zod validation errors
 * @param {Error} error - Zod validation error
 * @returns {NextResponse} Formatted error response
 */
function handleZodError(error) {
  const errors = error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return NextResponse.json(
    {
      error: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: errors,
    },
    { status: 400 }
  );
}

/**
 * Async error boundary for catching async errors
 *
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
export function asyncHandler(fn) {
  return (request, context) => {
    return Promise.resolve(fn(request, context)).catch((error) => {
      throw error; // Let withErrorHandler catch it
    });
  };
}

/**
 * Validate request body with Zod schema
 *
 * Usage:
 * ```javascript
 * const schema = z.object({
 *   name: z.string(),
 *   email: z.string().email(),
 * });
 *
 * const body = await validateRequest(request, schema);
 * ```
 *
 * @param {Request} request - Next.js request
 * @param {ZodSchema} schema - Zod validation schema
 * @returns {Promise<Object>} Validated data
 */
export async function validateRequest(request, schema) {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error.name === 'ZodError') {
      throw new ValidationError('Validation failed', error.errors);
    }
    throw error;
  }
}

/**
 * Combine error handler with auth middleware
 *
 * Usage:
 * ```javascript
 * export const GET = withAuthAndErrorHandler(async (request, { user }) => {
 *   // Handler with auth and error handling
 * });
 * ```
 */
export function withAuthAndErrorHandler(handler, authOptions = {}) {
  return withErrorHandler(async (request, context) => {
    const { requireAuth } = await import('@/middleware/auth');
    const { user, error } = await requireAuth(request, authOptions);

    if (error) {
      return error;
    }

    return handler(request, { ...context, user });
  });
}