import { redis } from '../../lib/redis.js';
import prisma from '../../lib/prisma.js';

/**
 * CurriculumCache - Caching service for generated curriculum
 * 
 * Reduces AI API calls by caching and reusing generated content
 */

class CurriculumCache {
  /**
   * Get cached curriculum content
   * @param {string} topicId - Topic ID
   * @param {number} gradeLevel - Grade level
   * @param {string} task - Task type (lessonPlan, practiceProblems, contentItems)
   * @param {Object} options - Generation options
   * @returns {Promise<Object|null>} Cached content or null
   */
  async getCached(topicId, gradeLevel, task, options = {}) {
    // Build cache key
    const cacheKey = this.buildCacheKey(topicId, gradeLevel, task, options);

    try {
      // Check Redis cache first (fast)
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Check database for existing content (slower but persistent)
      const existing = await this.getFromDatabase(topicId, gradeLevel, task, options);
      if (existing) {
        // Cache in Redis for faster future access
        await redis.setex(cacheKey, 3600, JSON.stringify(existing)); // 1 hour TTL
        return existing;
      }
    } catch (error) {
      console.warn('Cache retrieval error:', error.message);
      // Continue without cache
    }

    return null;
  }

  /**
   * Cache generated curriculum
   * @param {string} topicId - Topic ID
   * @param {number} gradeLevel - Grade level
   * @param {string} task - Task type
   * @param {Object} content - Generated content
   * @param {Object} options - Generation options
   */
  async cache(topicId, gradeLevel, task, content, options = {}) {
    const cacheKey = this.buildCacheKey(topicId, gradeLevel, task, options);

    try {
      // Cache in Redis (1 hour TTL)
      await redis.setex(cacheKey, 3600, JSON.stringify(content));
    } catch (error) {
      console.warn('Cache storage error:', error.message);
      // Continue without caching
    }
  }

  /**
   * Get from database
   */
  async getFromDatabase(topicId, gradeLevel, task, options) {
    try {
      const contentType = this.mapTaskToContentType(task);
      const where = {
        topicId,
        contentType,
        isAiGenerated: true,
        metadata: {
          path: ['gradeLevel'],
          equals: gradeLevel,
        },
      };

      // Add difficulty filter if specified
      if (options.difficulty) {
        where.difficulty = options.difficulty;
      }

      const contentItem = await prisma.contentItem.findFirst({
        where,
        orderBy: { createdAt: 'desc' },
      });

      if (contentItem) {
        return {
          content: contentItem.content,
          metadata: contentItem.metadata,
          qualityScore: contentItem.qualityScore,
        };
      }
    } catch (error) {
      console.warn('Database cache retrieval error:', error.message);
    }

    return null;
  }

  /**
   * Build cache key
   */
  buildCacheKey(topicId, gradeLevel, task, options) {
    const optionsHash = this.hashOptions(options);
    return `curriculum:${topicId}:${gradeLevel}:${task}:${optionsHash}`;
  }

  /**
   * Hash options for cache key
   */
  hashOptions(options) {
    // Create a simple hash from options
    const relevantOptions = {
      difficulty: options.difficulty,
      contentType: options.contentType,
      count: options.count,
    };
    return Buffer.from(JSON.stringify(relevantOptions)).toString('base64').slice(0, 16);
  }

  /**
   * Map task to content type
   */
  mapTaskToContentType(task) {
    const mapping = {
      lessonPlan: 'EXPLANATION',
      practiceProblems: 'PRACTICE',
      contentItems: 'EXPLANATION', // Default, can be overridden
    };
    return mapping[task] || 'EXPLANATION';
  }

  /**
   * Invalidate cache for a topic
   */
  async invalidate(topicId, gradeLevel = null) {
    try {
      if (gradeLevel !== null) {
        // Invalidate specific grade level
        const pattern = `curriculum:${topicId}:${gradeLevel}:*`;
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } else {
        // Invalidate all for topic
        const pattern = `curriculum:${topicId}:*`;
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      }
    } catch (error) {
      console.warn('Cache invalidation error:', error.message);
    }
  }
}

export const curriculumCache = new CurriculumCache();
export default curriculumCache;

