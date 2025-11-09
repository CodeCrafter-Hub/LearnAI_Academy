import { redis } from '../../lib/redis.js';
import crypto from 'crypto';

class CacheService {
  /**
   * Cache common AI responses
   */
  async getCachedResponse(subjectId, topicId, question) {
    try {
      const key = this.generateResponseKey(subjectId, topicId, question);
      const cached = await redis.get(key);
      
      if (cached) {
        console.log('Cache hit for response');
        return JSON.parse(cached);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached response:', error);
      return null;
    }
  }

  async cacheResponse(subjectId, topicId, question, response, ttl = 3600) {
    try {
      const key = this.generateResponseKey(subjectId, topicId, question);
      await redis.setex(key, ttl, JSON.stringify(response));
    } catch (error) {
      console.error('Error caching response:', error);
    }
  }

  /**
   * Cache student progress for quick access
   */
  async getStudentProgress(studentId) {
    try {
      const key = `progress:${studentId}`;
      const cached = await redis.get(key);
      
      if (cached) {
        return JSON.parse(cached);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached progress:', error);
      return null;
    }
  }

  async setStudentProgress(studentId, progress, ttl = 300) {
    try {
      const key = `progress:${studentId}`;
      await redis.setex(key, ttl, JSON.stringify(progress));
    } catch (error) {
      console.error('Error caching progress:', error);
    }
  }

  async invalidateStudentCache(studentId) {
    try {
      const pattern = `progress:${studentId}*`;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }
  }

  /**
   * Cache subjects and topics (rarely change)
   */
  async getCachedSubjects() {
    try {
      const cached = await redis.get('subjects:all');
      if (cached) {
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      console.error('Error getting cached subjects:', error);
      return null;
    }
  }

  async setCachedSubjects(subjects, ttl = 86400) {
    try {
      await redis.setex('subjects:all', ttl, JSON.stringify(subjects));
    } catch (error) {
      console.error('Error caching subjects:', error);
    }
  }

  /**
   * Rate limiting helpers
   */
  async checkRateLimit(key, maxRequests, windowSeconds) {
    try {
      const current = await redis.incr(key);
      
      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }
      
      return {
        allowed: current <= maxRequests,
        current,
        limit: maxRequests,
      };
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return { allowed: true, current: 0, limit: maxRequests };
    }
  }

  /**
   * Helper methods
   */
  generateResponseKey(subjectId, topicId, question) {
    const hash = crypto
      .createHash('md5')
      .update(question.toLowerCase().trim())
      .digest('hex');
    return `response:${subjectId}:${topicId}:${hash}`;
  }

  async clearAll() {
    try {
      await redis.flushdb();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Generic cache operations
   */
  async get(key) {
    try {
      const value = await redis.get(key);
      return value;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      await redis.setex(key, ttl, typeof value === 'string' ? value : JSON.stringify(value));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  async delete(key) {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Error deleting cache:', error);
      // Don't throw - fail gracefully
    }
  }
}

export const cacheService = new CacheService();
export default cacheService;
