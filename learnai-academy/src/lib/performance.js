import { logPerformance } from './logger.js';

/**
 * Performance Monitoring Utility
 * 
 * Tracks performance metrics for API calls, database queries, and AI operations
 */

class PerformanceMonitor {
  /**
   * Track API endpoint performance
   */
  static trackEndpoint(endpoint, duration, statusCode, metadata = {}) {
    logPerformance('api_endpoint', duration, 'ms', {
      endpoint,
      statusCode,
      ...metadata,
    });

    // Track slow endpoints (> 1 second)
    if (duration > 1000) {
      logPerformance('slow_endpoint', duration, 'ms', {
        endpoint,
        statusCode,
        threshold: 1000,
        ...metadata,
      });
    }
  }

  /**
   * Track database query performance
   */
  static trackDatabaseQuery(operation, duration, table, metadata = {}) {
    logPerformance('database_query', duration, 'ms', {
      operation,
      table,
      ...metadata,
    });

    // Track slow queries (> 500ms)
    if (duration > 500) {
      logPerformance('slow_query', duration, 'ms', {
        operation,
        table,
        threshold: 500,
        ...metadata,
      });
    }
  }

  /**
   * Track AI API call performance
   */
  static trackAICall(agentType, duration, tokens, cost, metadata = {}) {
    logPerformance('ai_call', duration, 'ms', {
      agentType,
      tokens,
      cost,
      ...metadata,
    });

    // Track expensive AI calls
    if (cost && cost > 0.01) {
      logPerformance('expensive_ai_call', cost, 'USD', {
        agentType,
        tokens,
        duration,
        ...metadata,
      });
    }
  }

  /**
   * Track cache hit/miss rates
   */
  static trackCache(cacheKey, hit, duration, metadata = {}) {
    logPerformance('cache_operation', duration, 'ms', {
      cacheKey,
      hit,
      ...metadata,
    });
  }

  /**
   * Create a performance timer for async operations
   */
  static async timeOperation(operationName, operation, metadata = {}) {
    const startTime = Date.now();
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      logPerformance(operationName, duration, 'ms', {
        success: true,
        ...metadata,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      logPerformance(operationName, duration, 'ms', {
        success: false,
        error: error.message,
        ...metadata,
      });

      throw error;
    }
  }

  /**
   * Track page load performance (client-side)
   */
  static trackPageLoad(pageName, loadTime, metadata = {}) {
    if (typeof window !== 'undefined') {
      logPerformance('page_load', loadTime, 'ms', {
        page: pageName,
        ...metadata,
      });
    }
  }

  /**
   * Track component render performance
   */
  static trackComponentRender(componentName, renderTime, metadata = {}) {
    if (typeof window !== 'undefined') {
      logPerformance('component_render', renderTime, 'ms', {
        component: componentName,
        ...metadata,
      });
    }
  }
}

export default PerformanceMonitor;

