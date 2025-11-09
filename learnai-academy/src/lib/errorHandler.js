import { NextResponse } from 'next/server';
import { logError } from './logger.js';

/**
 * Standardized Error Handler
 * 
 * Provides consistent error responses across the API
 */

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(statusCode, message, errors = [], metadata = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.metadata = metadata;
  }
}

/**
 * Create standardized error response
 * @param {Error|ApiError} error - Error object
 * @param {Request} request - Request object (optional)
 * @returns {NextResponse} Standardized error response
 */
export function errorResponse(error, request = null) {
  // Log the error
  logError('API Error', error, {
    url: request?.url,
    method: request?.method,
    statusCode: error.statusCode || 500,
  });

  // Determine status code
  const statusCode = error.statusCode || 500;

  // Determine error message
  let message = error.message || 'An error occurred';
  
  // Don't expose internal errors in production
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'Internal server error';
  }

  // Build response
  const response = {
    success: false,
    error: message,
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      metadata: error.metadata,
    }),
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Handle validation errors (Zod)
 */
export function validationErrorResponse(zodError) {
  const errors = zodError.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return errorResponse(
    new ApiError(400, 'Validation failed', errors),
    null
  );
}

/**
 * Handle authentication errors
 */
export function authErrorResponse(message = 'Authentication required') {
  return errorResponse(
    new ApiError(401, message),
    null
  );
}

/**
 * Handle authorization errors
 */
export function forbiddenErrorResponse(message = 'Access denied') {
  return errorResponse(
    new ApiError(403, message),
    null
  );
}

/**
 * Handle not found errors
 */
export function notFoundErrorResponse(resource = 'Resource') {
  return errorResponse(
    new ApiError(404, `${resource} not found`),
    null
  );
}

/**
 * Handle rate limit errors
 */
export function rateLimitErrorResponse(retryAfter = null) {
  const error = new ApiError(
    429,
    'Too many requests. Please try again later.',
    [],
    { retryAfter }
  );
  
  const response = errorResponse(error, null);
  
  if (retryAfter) {
    response.headers.set('Retry-After', retryAfter.toString());
  }
  
  return response;
}

/**
 * Handle database errors
 */
export function databaseErrorResponse(error) {
  // Don't expose database details
  const message = process.env.NODE_ENV === 'production'
    ? 'Database error occurred'
    : error.message;

  return errorResponse(
    new ApiError(503, message),
    null
  );
}

/**
 * Wrap async route handler with error handling
 * @param {Function} handler - Route handler function
 * @returns {Function} Wrapped handler with error handling
 */
export function withErrorHandler(handler) {
  return async function errorHandledHandler(request, context) {
    try {
      return await handler(request, context);
    } catch (error) {
      // Handle known error types
      if (error instanceof ApiError) {
        return errorResponse(error, request);
      }

      // Handle Zod validation errors
      if (error.name === 'ZodError') {
        return validationErrorResponse(error);
      }

      // Handle Prisma errors
      if (error.code && error.code.startsWith('P')) {
        return databaseErrorResponse(error);
      }

      // Handle unknown errors
      return errorResponse(error, request);
    }
  };
}

/**
 * Create success response
 */
export function successResponse(data, statusCode = 200, metadata = {}) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...metadata,
    },
    { status: statusCode }
  );
}

export default {
  ApiError,
  errorResponse,
  validationErrorResponse,
  authErrorResponse,
  forbiddenErrorResponse,
  notFoundErrorResponse,
  rateLimitErrorResponse,
  databaseErrorResponse,
  withErrorHandler,
  successResponse,
};

