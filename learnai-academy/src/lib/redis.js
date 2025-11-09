import Redis from 'ioredis';

const globalForRedis = global;

/**
 * Get or create Redis client (lazy initialization)
 * This prevents build errors when Redis is not available
 */
function getRedisClient() {
  // Return existing client if available
  if (globalForRedis.redis) {
    return globalForRedis.redis;
  }

  // Only create client if REDIS_URL is explicitly set
  // Redis is optional - app works without it
  if (typeof window === 'undefined' && process.env.REDIS_URL) {
    try {
      const redisUrl = process.env.REDIS_URL;
      const client = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        // Don't fail on connection errors - use lazy connect
        lazyConnect: true,
        // Enable offline queue to prevent errors when Redis is down
        enableOfflineQueue: false,
        // Don't throw errors on connection failures
        showFriendlyErrorStack: false,
      });

      // Handle connection errors gracefully
      client.on('error', (error) => {
        // Only log in development, don't crash the app
        if (process.env.NODE_ENV === 'development') {
          console.warn('Redis connection error (app continues without cache):', error.message);
        }
      });

      // Mark as connected when ready
      client.on('ready', () => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Redis connected successfully');
        }
      });

      globalForRedis.redis = client;
      return globalForRedis.redis;
    } catch (error) {
      console.warn('Redis client initialization failed (app continues without cache):', error.message);
      // Return a mock client
      return createMockRedis();
    }
  }

  // Return mock client during build or when Redis is not available
  return createMockRedis();
}

/**
 * Create a mock Redis client for build time
 */
function createMockRedis() {
  return {
    get: async () => null,
    set: async () => 'OK',
    del: async () => 0,
    exists: async () => 0,
    expire: async () => 0,
    ttl: async () => -1,
    keys: async () => [],
    flushdb: async () => 'OK',
    quit: async () => 'OK',
    disconnect: async () => {},
    on: () => {},
    once: () => {},
    emit: () => {},
  };
}

// Export lazy getter with error handling
export const redis = new Proxy({}, {
  get(target, prop) {
    const client = getRedisClient();
    const value = client[prop];
    
    // If it's a function, wrap it with error handling
    if (typeof value === 'function') {
      return async (...args) => {
        try {
          // Check if client is actually a Redis client (not mock)
          if (client && typeof client.get === 'function' && client.constructor.name === 'Redis') {
            return await value.apply(client, args);
          } else {
            // Mock client - return appropriate default
            if (prop === 'get') return null;
            if (prop === 'set' || prop === 'setex') return 'OK';
            if (prop === 'del') return 0;
            if (prop === 'keys') return [];
            if (prop === 'incr') return 1;
            if (prop === 'expire') return 0;
            if (prop === 'flushdb') return 'OK';
            return null;
          }
        } catch (error) {
          // If Redis connection fails, return appropriate defaults
          if (error.code === 'ECONNREFUSED' || error.message?.includes('connect')) {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`Redis operation '${prop}' failed (connection refused), using fallback`);
            }
            // Return appropriate defaults based on operation
            if (prop === 'get') return null;
            if (prop === 'set' || prop === 'setex') return 'OK';
            if (prop === 'del') return 0;
            if (prop === 'keys') return [];
            if (prop === 'incr') return 1;
            if (prop === 'expire') return 0;
            if (prop === 'flushdb') return 'OK';
            return null;
          }
          // Re-throw other errors
          throw error;
        }
      };
    }
    return value;
  },
});

export default redis;
