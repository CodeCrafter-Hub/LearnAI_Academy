import PerformanceMonitor from '@/lib/performance.js';

/**
 * Performance Tracking Middleware
 * 
 * Automatically tracks performance metrics for API routes
 */

/**
 * Wrap an API route handler with performance tracking
 * 
 * @param {Function} handler - API route handler function
 * @param {string} routeName - Name of the route for tracking
 * @returns {Function} Wrapped handler with performance tracking
 */
export function withPerformanceTracking(handler, routeName) {
  return async function trackedHandler(request, context) {
    const startTime = Date.now();
    let statusCode = 200;
    let error = null;

    try {
      const response = await handler(request, context);
      
      // Extract status code from response
      if (response && typeof response.status === 'number') {
        statusCode = response.status;
      }

      const duration = Date.now() - startTime;
      
      PerformanceMonitor.trackEndpoint(
        routeName || request.url,
        duration,
        statusCode,
        {
          method: request.method,
        }
      );

      return response;
    } catch (err) {
      error = err;
      statusCode = err.statusCode || 500;
      const duration = Date.now() - startTime;

      PerformanceMonitor.trackEndpoint(
        routeName || request.url,
        duration,
        statusCode,
        {
          method: request.method,
          error: err.message,
        }
      );

      throw err;
    }
  };
}

/**
 * Track database operation performance
 */
export function trackDatabaseOperation(operation, table) {
  return async function trackedOperation(...args) {
    const startTime = Date.now();
    try {
      const result = await operation(...args);
      const duration = Date.now() - startTime;
      
      PerformanceMonitor.trackDatabaseQuery(
        operation.name || 'unknown',
        duration,
        table,
        { success: true }
      );

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      PerformanceMonitor.trackDatabaseQuery(
        operation.name || 'unknown',
        duration,
        table,
        { success: false, error: error.message }
      );

      throw error;
    }
  };
}

export default {
  withPerformanceTracking,
  trackDatabaseOperation,
};

