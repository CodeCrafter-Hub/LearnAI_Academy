import prisma from '../../lib/prisma.js';
import { progressTracker } from './progressTracker.js';

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
      console.error('Error getting recommendations:', error);
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

      // For each topic student has worked on, find next topics
      for (const progress of studentProgress) {
        // If mastered (80%+), recommend child topics or next topics
        if (progress.masteryLevel >= 80) {
          const topic = progress.topic;

          // Get child topics
          if (topic.childTopics && topic.childTopics.length > 0) {
            for (const childTopic of topic.childTopics) {
              // Check if student hasn't started this topic
              const childProgress = await prisma.studentProgress.findUnique({
                where: {
                  studentId_topicId: {
                    studentId,
                    topicId: childTopic.id,
                  },
                },
              });

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

          // Get next topics in same subject at same grade level
          const nextTopics = await prisma.topic.findMany({
            where: {
              subjectId: topic.subjectId,
              gradeLevel: topic.gradeLevel,
              isActive: true,
              id: { not: topic.id },
            },
            take: 3,
          });

          for (const nextTopic of nextTopics) {
            const nextProgress = await prisma.studentProgress.findUnique({
              where: {
                studentId_topicId: {
                  studentId,
                  topicId: nextTopic.id,
                },
              },
            });

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
      }

      return recommendations;
    } catch (error) {
      console.error('Error getting learning path recommendations:', error);
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
      console.error('Error getting strengthen recommendations:', error);
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

      for (const progress of strugglingTopics) {
        const prerequisites = progress.topic.prerequisites || [];

        if (Array.isArray(prerequisites) && prerequisites.length > 0) {
          for (const prereqTopicId of prerequisites) {
            const prereqProgress = await prisma.studentProgress.findUnique({
              where: {
                studentId_topicId: {
                  studentId,
                  topicId: prereqTopicId,
                },
              },
            });

            // If prerequisite not mastered, recommend it
            if (!prereqProgress || prereqProgress.masteryLevel < 80) {
              const prereqTopic = await prisma.topic.findUnique({
                where: { id: prereqTopicId },
                include: { subject: true },
              });

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
      console.error('Error getting prerequisite recommendations:', error);
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

      // Recommend next grade level topics in same subjects
      for (const progress of excellentProgress) {
        const nextGradeTopics = await prisma.topic.findMany({
          where: {
            subjectId: progress.subjectId,
            gradeLevel: { gt: gradeLevel },
            isActive: true,
          },
          take: 2,
        });

        for (const topic of nextGradeTopics) {
          const topicProgress = await prisma.studentProgress.findUnique({
            where: {
              studentId_topicId: {
                studentId,
                topicId: topic.id,
              },
            },
          });

          if (!topicProgress || topicProgress.masteryLevel < 50) {
            recommendations.push({
              topicId: topic.id,
              topicName: topic.name,
              subjectId: topic.subjectId,
              subjectName: progress.topic.subject.name,
              reason: `Advanced topic for ${progress.topic.subject.name}`,
              priority: 60,
              type: 'advanced',
            });
          }
        }
      }

      return recommendations;
    } catch (error) {
      console.error('Error getting advanced recommendations:', error);
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
      console.error('Error getting learning path:', error);
      throw error;
    }
  }
}

export const recommendationEngine = new RecommendationEngine();
export default recommendationEngine;
