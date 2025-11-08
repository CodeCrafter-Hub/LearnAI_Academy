import prisma from '../../lib/prisma.js';
import { progressTracker } from './progressTracker.js';
import { logError, logPerformance } from '../../lib/logger.js';

/**
 * RecommendationEngine Service
 * 
 * Analyzes student performance and recommends next topics,
 * learning paths, and personalized content.
 */
class RecommendationEngine {
  /**
   * Get recommendations for a student
   * @param {string} studentId - Student ID
   * @param {Object} options - Recommendation options
   */
  async getRecommendations(studentId, options = {}) {
    try {
      const {
        subjectId = null,
        limit = 5,
        includePrerequisites = true,
      } = options;

      // Get student info
      const student = await prisma.student.findUnique({
        where: { id: studentId },
      });

      if (!student) {
        throw new Error('Student not found');
      }

      // Get student's progress
      const progressSummary = await progressTracker.getProgressSummary(studentId, subjectId);

      // Get recommendations based on different strategies
      const recommendations = [];

      // 1. Next topics in current learning path
      const learningPathRecommendations = await this.getLearningPathRecommendations(
        studentId,
        subjectId,
        student.gradeLevel,
        limit
      );

      // 2. Topics to strengthen (based on weaknesses)
      const strengthenRecommendations = await this.getStrengthenRecommendations(
        studentId,
        subjectId,
        limit
      );

      // 3. Prerequisite topics (if student is struggling)
      const prerequisiteRecommendations = includePrerequisites
        ? await this.getPrerequisiteRecommendations(studentId, subjectId, limit)
        : [];

      // 4. Advanced topics (if student is excelling)
      const advancedRecommendations = await this.getAdvancedRecommendations(
        studentId,
        subjectId,
        student.gradeLevel,
        limit
      );

      // Combine and rank recommendations
      const allRecommendations = [
        ...learningPathRecommendations,
        ...strengthenRecommendations,
        ...prerequisiteRecommendations,
        ...advancedRecommendations,
      ];

      // Remove duplicates and rank by priority
      const uniqueRecommendations = this.deduplicateAndRank(
        allRecommendations,
        limit
      );

      return {
        recommendations: uniqueRecommendations.slice(0, limit),
        total: uniqueRecommendations.length,
        strategies: {
          learningPath: learningPathRecommendations.length,
          strengthen: strengthenRecommendations.length,
          prerequisite: prerequisiteRecommendations.length,
          advanced: advancedRecommendations.length,
        },
      };
    } catch (error) {
      logError('Error getting recommendations', error, { studentId, options });
      throw error;
    }
  }

  /**
   * Get next topics in learning path
   */
  async getLearningPathRecommendations(studentId, subjectId, gradeLevel, limit) {
    try {
      // Get topics student has started or mastered
      const studentProgress = await prisma.studentProgress.findMany({
        where: {
          studentId,
          ...(subjectId && { subjectId }),
        },
        include: {
          topic: {
            include: {
              subject: true,
              childTopics: true,
            },
          },
        },
        orderBy: { lastPracticedAt: 'desc' },
      });

      const recommendations = [];

      // Collect all topic IDs we need to check progress for (batch query optimization)
      const allTopicIdsToCheck = new Set();

      // Collect child topics and next topics for each mastered progress
      const masteredProgress = studentProgress.filter(p => p.masteryLevel >= 80);

      for (const progress of masteredProgress) {
        const topic = progress.topic;

        // Collect child topic IDs
        if (topic.childTopics && topic.childTopics.length > 0) {
          topic.childTopics.forEach(child => allTopicIdsToCheck.add(child.id));
        }
      }

      // Also get next topics for all mastered subjects (batch)
      const masteredSubjects = [...new Set(masteredProgress.map(p => p.topic.subjectId))];
      const masteredGradeLevels = [...new Set(masteredProgress.map(p => p.topic.gradeLevel))];

      const allNextTopics = await prisma.topic.findMany({
        where: {
          subjectId: { in: masteredSubjects },
          gradeLevel: { in: masteredGradeLevels },
          isActive: true,
        },
      });

      // Add next topic IDs to check
      allNextTopics.forEach(topic => allTopicIdsToCheck.add(topic.id));

      // Batch query: Get all progress records for topics we need to check
      const existingProgress = await prisma.studentProgress.findMany({
        where: {
          studentId,
          topicId: { in: Array.from(allTopicIdsToCheck) },
        },
      });

      // Create a map for quick lookup
      const progressMap = new Map(
        existingProgress.map(p => [p.topicId, p])
      );

      // Now process recommendations without N+1 queries
      for (const progress of masteredProgress) {
        const topic = progress.topic;

        // Process child topics
        if (topic.childTopics && topic.childTopics.length > 0) {
          for (const childTopic of topic.childTopics) {
            const childProgress = progressMap.get(childTopic.id);

            if (!childProgress || childProgress.masteryLevel < 80) {
              recommendations.push({
                topicId: childTopic.id,
                topicName: childTopic.name,
                subjectId: childTopic.subjectId,
                subjectName: topic.subject.name,
                reason: `Next step after mastering ${topic.name}`,
                priority: progress.masteryLevel,
                type: 'learning_path',
              });
            }
          }
        }

        // Process next topics in same subject/grade
        const nextTopics = allNextTopics.filter(
          t => t.subjectId === topic.subjectId &&
               t.gradeLevel === topic.gradeLevel &&
               t.id !== topic.id
        ).slice(0, 3);

        for (const nextTopic of nextTopics) {
          const nextProgress = progressMap.get(nextTopic.id);

          if (!nextProgress || nextProgress.masteryLevel < 50) {
            recommendations.push({
              topicId: nextTopic.id,
              topicName: nextTopic.name,
              subjectId: nextTopic.subjectId,
              subjectName: topic.subject.name,
              reason: `Continue learning ${topic.subject.name}`,
              priority: 70,
              type: 'learning_path',
            });
          }
        }
      }

      return recommendations;
    } catch (error) {
      logError('Error getting learning path recommendations', error, { studentId, subjectId });
      return [];
    }
  }

  /**
   * Get topics to strengthen (based on weaknesses)
   */
  async getStrengthenRecommendations(studentId, subjectId, limit) {
    try {
      const progressRecords = await prisma.studentProgress.findMany({
        where: {
          studentId,
          ...(subjectId && { subjectId }),
          masteryLevel: { lt: 80, gt: 0 }, // In progress but not mastered
        },
        include: {
          topic: {
            include: { subject: true },
          },
        },
        orderBy: { masteryLevel: 'asc' }, // Lowest mastery first
        take: limit * 2,
      });

      return progressRecords.map(progress => ({
        topicId: progress.topicId,
        topicName: progress.topic.name,
        subjectId: progress.subjectId,
        subjectName: progress.topic.subject.name,
        reason: `Strengthen ${progress.topic.name} (${Math.round(progress.masteryLevel)}% mastery)`,
        priority: 100 - progress.masteryLevel, // Higher priority for lower mastery
        type: 'strengthen',
        currentMastery: progress.masteryLevel,
      }));
    } catch (error) {
      logError('Error getting strengthen recommendations', error, { studentId, subjectId });
      return [];
    }
  }

  /**
   * Get prerequisite topics (if student is struggling)
   */
  async getPrerequisiteRecommendations(studentId, subjectId, limit) {
    try {
      // Find topics where student is struggling (< 50% mastery after multiple sessions)
      const strugglingTopics = await prisma.studentProgress.findMany({
        where: {
          studentId,
          ...(subjectId && { subjectId }),
          masteryLevel: { lt: 50 },
          sessionsCount: { gte: 2 }, // Multiple sessions but still struggling
        },
        include: {
          topic: true,
        },
      });

      const recommendations = [];

      // Collect all prerequisite topic IDs (batch query optimization)
      const allPrereqTopicIds = new Set();
      strugglingTopics.forEach(progress => {
        const prerequisites = progress.topic.prerequisites || [];
        if (Array.isArray(prerequisites)) {
          prerequisites.forEach(id => allPrereqTopicIds.add(id));
        }
      });

      if (allPrereqTopicIds.size === 0) {
        return recommendations;
      }

      // Batch query: Get all prerequisite topics
      const prereqTopics = await prisma.topic.findMany({
        where: {
          id: { in: Array.from(allPrereqTopicIds) },
        },
        include: { subject: true },
      });

      const prereqTopicMap = new Map(
        prereqTopics.map(t => [t.id, t])
      );

      // Batch query: Get progress for all prerequisite topics
      const prereqProgressRecords = await prisma.studentProgress.findMany({
        where: {
          studentId,
          topicId: { in: Array.from(allPrereqTopicIds) },
        },
      });

      const prereqProgressMap = new Map(
        prereqProgressRecords.map(p => [p.topicId, p])
      );

      // Process recommendations without N+1 queries
      for (const progress of strugglingTopics) {
        const prerequisites = progress.topic.prerequisites || [];

        if (Array.isArray(prerequisites) && prerequisites.length > 0) {
          for (const prereqTopicId of prerequisites) {
            const prereqProgress = prereqProgressMap.get(prereqTopicId);

            // If prerequisite not mastered, recommend it
            if (!prereqProgress || prereqProgress.masteryLevel < 80) {
              const prereqTopic = prereqTopicMap.get(prereqTopicId);

              if (prereqTopic) {
                recommendations.push({
                  topicId: prereqTopic.id,
                  topicName: prereqTopic.name,
                  subjectId: prereqTopic.subjectId,
                  subjectName: prereqTopic.subject.name,
                  reason: `Prerequisite for ${progress.topic.name}`,
                  priority: 90,
                  type: 'prerequisite',
                });
              }
            }
          }
        }
      }

      return recommendations;
    } catch (error) {
      logError('Error getting prerequisite recommendations', error, { studentId, subjectId });
      return [];
    }
  }

  /**
   * Get advanced topics (if student is excelling)
   */
  async getAdvancedRecommendations(studentId, subjectId, gradeLevel, limit) {
    try {
      // Find subjects where student is excelling
      const excellentProgress = await prisma.studentProgress.findMany({
        where: {
          studentId,
          ...(subjectId && { subjectId }),
          masteryLevel: { gte: 90 },
        },
        include: {
          topic: {
            include: { subject: true },
          },
        },
      });

      if (excellentProgress.length === 0) {
        return [];
      }

      const recommendations = [];

      // Get unique subject IDs where student excels (batch query optimization)
      const excellentSubjectIds = [...new Set(excellentProgress.map(p => p.subjectId))];

      // Batch query: Get all next grade level topics for excellent subjects
      const nextGradeTopics = await prisma.topic.findMany({
        where: {
          subjectId: { in: excellentSubjectIds },
          gradeLevel: { gt: gradeLevel },
          isActive: true,
        },
      });

      // Collect all next grade topic IDs
      const nextGradeTopicIds = nextGradeTopics.map(t => t.id);

      // Batch query: Get progress for all next grade topics
      const nextGradeProgress = await prisma.studentProgress.findMany({
        where: {
          studentId,
          topicId: { in: nextGradeTopicIds },
        },
      });

      const progressMap = new Map(
        nextGradeProgress.map(p => [p.topicId, p])
      );

      // Create subject name lookup map
      const subjectNameMap = new Map(
        excellentProgress.map(p => [p.subjectId, p.topic.subject.name])
      );

      // Process recommendations without N+1 queries
      for (const progress of excellentProgress) {
        const subjectNextGradeTopics = nextGradeTopics
          .filter(t => t.subjectId === progress.subjectId)
          .slice(0, 2);

        for (const topic of subjectNextGradeTopics) {
          const topicProgress = progressMap.get(topic.id);

          if (!topicProgress || topicProgress.masteryLevel < 50) {
            recommendations.push({
              topicId: topic.id,
              topicName: topic.name,
              subjectId: topic.subjectId,
              subjectName: subjectNameMap.get(topic.subjectId) || 'Unknown',
              reason: `Advanced topic for ${subjectNameMap.get(topic.subjectId)}`,
              priority: 60,
              type: 'advanced',
            });
          }
        }
      }

      return recommendations;
    } catch (error) {
      logError('Error getting advanced recommendations', error, { studentId, subjectId, gradeLevel });
      return [];
    }
  }

  /**
   * Deduplicate and rank recommendations
   */
  deduplicateAndRank(recommendations, limit) {
    // Group by topicId
    const topicMap = new Map();

    for (const rec of recommendations) {
      const existing = topicMap.get(rec.topicId);

      if (!existing) {
        topicMap.set(rec.topicId, rec);
      } else {
        // Merge reasons and take highest priority
        existing.reason += `; ${rec.reason}`;
        existing.priority = Math.max(existing.priority, rec.priority);
        // Combine types
        if (!existing.types) existing.types = [existing.type];
        existing.types.push(rec.type);
        existing.type = existing.types.join(', ');
      }
    }

    // Convert to array and sort by priority
    const ranked = Array.from(topicMap.values()).sort(
      (a, b) => b.priority - a.priority
    );

    return ranked;
  }

  /**
   * Get personalized learning path
   */
  async getLearningPath(studentId, subjectId) {
    try {
      const recommendations = await this.getRecommendations(studentId, {
        subjectId,
        limit: 10,
        includePrerequisites: true,
      });

      // Group by subject
      const bySubject = {};

      for (const rec of recommendations.recommendations) {
        if (!bySubject[rec.subjectId]) {
          bySubject[rec.subjectId] = [];
        }
        bySubject[rec.subjectId].push(rec);
      }

      return {
        learningPath: recommendations.recommendations,
        bySubject,
        strategies: recommendations.strategies,
      };
    } catch (error) {
      logError('Error getting learning path', error, { studentId, subjectId });
      throw error;
    }
  }
}

export const recommendationEngine = new RecommendationEngine();
export default recommendationEngine;
