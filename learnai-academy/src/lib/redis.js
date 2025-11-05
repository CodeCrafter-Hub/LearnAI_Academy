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

  // Only create client if we're not in build phase
  // During build, DATABASE_URL might not be set, and we don't need Redis
  if (typeof window === 'undefined' && process.env.DATABASE_URL) {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      globalForRedis.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        // Don't fail on connection errors during build
        lazyConnect: true,
      });
      return globalForRedis.redis;
    } catch (error) {
      console.warn('Redis client initialization failed:', error.message);
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

// Export lazy getter
export const redis = new Proxy({}, {
  get(target, prop) {
    const client = getRedisClient();
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export default redis;
