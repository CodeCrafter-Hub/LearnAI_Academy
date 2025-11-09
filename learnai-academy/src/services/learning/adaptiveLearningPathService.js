import prisma from '../../lib/prisma.js';
import { logInfo, logError } from '../../lib/logger.js';
import { progressTracker } from '../analytics/progressTracker.js';
import { recommendationEngine } from '../analytics/recommendationEngine.js';

/**
 * AdaptiveLearningPathService - Real-time learning path adjustment
 * 
 * Features:
 * - Real-time path adjustment based on performance
 * - Prerequisite checking
 * - Difficulty adaptation
 * - Learning style optimization
 * - Branching paths
 * - Remediation paths
 * - Enrichment opportunities
 */
class AdaptiveLearningPathService {
  /**
   * Get adaptive learning path for student
   * @param {string} studentId - Student ID
   * @param {string} subjectId - Subject ID
   * @param {Object} options - Path options
   * @returns {Promise<Object>} Adaptive learning path
   */
  async getLearningPath(studentId, subjectId, options = {}) {
    try {
      const {
        currentTopicId = null,
        includePrerequisites = true,
        includeEnrichment = true,
        maxDepth = 10,
      } = options;

      // Get student progress
      const studentProgress = await this.getStudentProgress(studentId, subjectId);

      // Get all topics in subject
      const topics = await prisma.topic.findMany({
        where: {
          subjectId,
          isActive: true,
        },
        include: {
          progress: {
            where: { studentId },
          },
        },
        orderBy: { orderIndex: 'asc' },
      });

      // Build adaptive path
      const path = await this.buildAdaptivePath(
        studentId,
        subjectId,
        topics,
        studentProgress,
        {
          currentTopicId,
          includePrerequisites,
          includeEnrichment,
          maxDepth,
        }
      );

      return path;
    } catch (error) {
      logError('Error getting learning path', error);
      throw error;
    }
  }

  /**
   * Build adaptive learning path
   */
  async buildAdaptivePath(studentId, subjectId, topics, studentProgress, options) {
    const {
      currentTopicId,
      includePrerequisites,
      includeEnrichment,
      maxDepth,
    } = options;

    // Categorize topics
    const categorized = this.categorizeTopics(topics, studentProgress);

    // Build path segments
    const path = {
      current: currentTopicId ? topics.find(t => t.id === currentTopicId) : null,
      next: [],
      remediation: [],
      enrichment: [],
      prerequisites: [],
      completed: categorized.completed,
      inProgress: categorized.inProgress,
      notStarted: categorized.notStarted,
      recommendations: [],
    };

    // Find next recommended topics
    if (currentTopicId) {
      const currentTopic = topics.find(t => t.id === currentTopicId);
      path.next = await this.getNextTopics(
        studentId,
        currentTopic,
        topics,
        studentProgress,
        includePrerequisites
      );
    } else {
      // Start from beginning or best entry point
      path.next = await this.getEntryPoints(studentId, topics, studentProgress);
    }

    // Find remediation topics (topics with low mastery)
    path.remediation = categorized.weak.map(topic => ({
      topic,
      reason: 'Low mastery - needs review',
      mastery: this.getMasteryLevel(topic, studentProgress),
      priority: 'high',
    }));

    // Find enrichment topics (advanced topics for strong students)
    if (includeEnrichment) {
      path.enrichment = await this.getEnrichmentTopics(
        studentId,
        topics,
        studentProgress
      );
    }

    // Get prerequisites for next topics
    if (includePrerequisites && path.next.length > 0) {
      path.prerequisites = await this.getPrerequisites(
        path.next[0],
        topics,
        studentProgress
      );
    }

    // Generate recommendations
    path.recommendations = await this.generateRecommendations(
      studentId,
      subjectId,
      path,
      studentProgress
    );

    return path;
  }

  /**
   * Get next recommended topics
   */
  async getNextTopics(studentId, currentTopic, allTopics, studentProgress, includePrerequisites) {
    const nextTopics = [];

    // Check if current topic is mastered
    const currentMastery = this.getMasteryLevel(currentTopic, studentProgress);
    const masteryThreshold = 0.7; // 70% mastery required

    if (currentMastery < masteryThreshold) {
      // Not mastered - recommend more practice
      return [{
        topic: currentTopic,
        reason: 'Continue practicing to master this topic',
        priority: 'high',
        action: 'practice',
      }];
    }

    // Find next topics in sequence
    const nextInSequence = allTopics.filter(t => {
      return t.orderIndex > currentTopic.orderIndex &&
             t.gradeLevel <= currentTopic.gradeLevel + 1; // Allow one grade ahead
    });

    // Filter by prerequisites
    const availableNext = nextInSequence.filter(topic => {
      if (!includePrerequisites) return true;
      return this.hasPrerequisites(topic, studentProgress, allTopics);
    });

    // Sort by priority
    const prioritized = availableNext
      .map(topic => ({
        topic,
        priority: this.calculatePriority(topic, studentProgress),
        reason: this.getRecommendationReason(topic, studentProgress),
      }))
      .sort((a, b) => b.priority - a.priority);

    return prioritized.slice(0, 5); // Top 5 recommendations
  }

  /**
   * Get entry points (where to start)
   */
  async getEntryPoints(studentId, topics, studentProgress) {
    // Find topics with no prerequisites or completed prerequisites
    const entryPoints = topics.filter(topic => {
      const prerequisites = topic.prerequisites || [];
      if (prerequisites.length === 0) return true;

      // Check if all prerequisites are completed
      return prerequisites.every(prereqId => {
        const prereqTopic = topics.find(t => t.id === prereqId);
        if (!prereqTopic) return true;
        return this.getMasteryLevel(prereqTopic, studentProgress) >= 0.7;
      });
    });

    // Sort by order index
    return entryPoints
      .slice(0, 3)
      .map(topic => ({
        topic,
        reason: 'Good starting point',
        priority: 'medium',
      }));
  }

  /**
   * Get enrichment topics (advanced topics)
   */
  async getEnrichmentTopics(studentId, topics, studentProgress) {
    // Find topics where student has high mastery in prerequisites
    const strongTopics = topics.filter(topic => {
      const mastery = this.getMasteryLevel(topic, studentProgress);
      return mastery >= 0.8; // 80%+ mastery
    });

    // Find advanced topics related to strong topics
    const enrichment = topics
      .filter(topic => {
        // Higher difficulty or grade level
        return topic.difficulty === 'HARD' ||
               (strongTopics.length > 0 && 
                topic.gradeLevel > strongTopics[0].gradeLevel);
      })
      .slice(0, 3)
      .map(topic => ({
        topic,
        reason: 'You\'re ready for advanced content!',
        priority: 'low',
      }));

    return enrichment;
  }

  /**
   * Get prerequisites for a topic
   */
  async getPrerequisites(topic, allTopics, studentProgress) {
    const prerequisites = topic.prerequisites || [];
    
    return prerequisites
      .map(prereqId => {
        const prereqTopic = allTopics.find(t => t.id === prereqId);
        if (!prereqTopic) return null;

        const mastery = this.getMasteryLevel(prereqTopic, studentProgress);
        return {
          topic: prereqTopic,
          mastery,
          isCompleted: mastery >= 0.7,
          isRequired: true,
        };
      })
      .filter(Boolean);
  }

  /**
   * Check if topic prerequisites are met
   */
  hasPrerequisites(topic, studentProgress, allTopics) {
    const prerequisites = topic.prerequisites || [];
    if (prerequisites.length === 0) return true;

    return prerequisites.every(prereqId => {
      const prereqTopic = allTopics.find(t => t.id === prereqId);
      if (!prereqTopic) return true;
      return this.getMasteryLevel(prereqTopic, studentProgress) >= 0.7;
    });
  }

  /**
   * Categorize topics by progress
   */
  categorizeTopics(topics, studentProgress) {
    return {
      completed: topics.filter(t => {
        const mastery = this.getMasteryLevel(t, studentProgress);
        return mastery >= 0.8;
      }),
      inProgress: topics.filter(t => {
        const mastery = this.getMasteryLevel(t, studentProgress);
        return mastery > 0 && mastery < 0.8;
      }),
      notStarted: topics.filter(t => {
        const mastery = this.getMasteryLevel(t, studentProgress);
        return mastery === 0;
      }),
      weak: topics.filter(t => {
        const mastery = this.getMasteryLevel(t, studentProgress);
        return mastery > 0 && mastery < 0.5; // Below 50%
      }),
    };
  }

  /**
   * Get mastery level for topic
   */
  getMasteryLevel(topic, studentProgress) {
    if (Array.isArray(studentProgress)) {
      const progress = studentProgress.find(p => p.topicId === topic.id);
      return (progress?.masteryLevel || 0) / 100; // Convert to 0-1 scale
    }
    // Handle categorized topics
    if (studentProgress.completed?.some(t => t.id === topic.id)) {
      return 0.9;
    }
    if (studentProgress.inProgress?.some(t => t.id === topic.id)) {
      return 0.5;
    }
    return 0;
  }

  /**
   * Calculate priority for topic recommendation
   */
  calculatePriority(topic, studentProgress) {
    let priority = 0;

    // Base priority from order index (earlier topics = higher priority)
    priority += (100 - topic.orderIndex) * 0.1;

    // Boost if prerequisites are completed
    const mastery = this.getMasteryLevel(topic, studentProgress);
    if (mastery === 0) {
      priority += 50; // New topic
    } else if (mastery < 0.5) {
      priority += 30; // Needs work
    }

    // Boost if it's the natural next topic
    priority += 20;

    return priority;
  }

  /**
   * Get recommendation reason
   */
  getRecommendationReason(topic, studentProgress) {
    const mastery = this.getMasteryLevel(topic, studentProgress);
    
    if (mastery === 0) {
      return 'Next topic in sequence';
    } else if (mastery < 0.5) {
      return 'Needs more practice';
    } else if (mastery < 0.8) {
      return 'Continue building mastery';
    }
    return 'Ready for next challenge';
  }

  /**
   * Get student progress for subject
   */
  async getStudentProgress(studentId, subjectId) {
    const progress = await prisma.studentProgress.findMany({
      where: {
        studentId,
        subjectId,
      },
    });

    return progress;
  }

  /**
   * Generate path recommendations
   */
  async generateRecommendations(studentId, subjectId, path, studentProgress) {
    const recommendations = [];

    // Next topic recommendation
    if (path.next.length > 0) {
      recommendations.push({
        type: 'next',
        topic: path.next[0].topic,
        reason: path.next[0].reason,
        priority: 'high',
        action: 'start',
      });
    }

    // Remediation recommendation
    if (path.remediation.length > 0) {
      recommendations.push({
        type: 'remediation',
        topic: path.remediation[0].topic,
        reason: 'Strengthen weak areas',
        priority: 'high',
        action: 'review',
      });
    }

    // Enrichment recommendation
    if (path.enrichment.length > 0) {
      recommendations.push({
        type: 'enrichment',
        topic: path.enrichment[0].topic,
        reason: 'Challenge yourself with advanced content',
        priority: 'low',
        action: 'explore',
      });
    }

    return recommendations;
  }

  /**
   * Adjust path based on real-time performance
   * @param {string} studentId - Student ID
   * @param {string} topicId - Current topic ID
   * @param {Object} performanceData - Recent performance data
   * @returns {Promise<Object>} Adjusted path
   */
  async adjustPath(studentId, topicId, performanceData) {
    try {
      const { accuracy, timeSpent, attempts } = performanceData;

      // Get current topic
      const topic = await prisma.topic.findUnique({
        where: { id: topicId },
        include: { subject: true },
      });

      if (!topic) {
        throw new Error('Topic not found');
      }

      // Analyze performance
      const performanceAnalysis = this.analyzePerformance(accuracy, timeSpent, attempts);

      // Get adjusted path
      const adjustedPath = await this.getLearningPath(
        studentId,
        topic.subjectId,
        {
          currentTopicId: topicId,
          includePrerequisites: true,
          includeEnrichment: performanceAnalysis.isStrong,
        }
      );

      // Add performance-based recommendations
      if (performanceAnalysis.isStruggling) {
        adjustedPath.recommendations.unshift({
          type: 'remediation',
          topic,
          reason: 'Consider reviewing fundamentals before continuing',
          priority: 'high',
          action: 'review',
        });
      } else if (performanceAnalysis.isStrong) {
        adjustedPath.recommendations.unshift({
          type: 'advance',
          topic: adjustedPath.next[0]?.topic,
          reason: 'You\'re doing great! Ready for the next challenge?',
          priority: 'medium',
          action: 'advance',
        });
      }

      return {
        ...adjustedPath,
        performanceAnalysis,
        adjustedAt: new Date().toISOString(),
      };
    } catch (error) {
      logError('Error adjusting path', error);
      throw error;
    }
  }

  /**
   * Analyze performance
   */
  analyzePerformance(accuracy, timeSpent, attempts) {
    const isStruggling = accuracy < 0.6 || attempts > 5;
    const isStrong = accuracy >= 0.8 && attempts <= 2;
    const isAverage = !isStruggling && !isStrong;

    return {
      isStruggling,
      isStrong,
      isAverage,
      recommendation: isStruggling ? 'remediation' : isStrong ? 'advance' : 'continue',
    };
  }

  /**
   * Get learning path visualization
   * @param {string} studentId - Student ID
   * @param {string} subjectId - Subject ID
   * @returns {Promise<Object>} Path visualization data
   */
  async getPathVisualization(studentId, subjectId) {
    try {
      const path = await this.getLearningPath(studentId, subjectId);
      const topics = await prisma.topic.findMany({
        where: { subjectId, isActive: true },
        orderBy: { orderIndex: 'asc' },
      });

      // Build node graph
      const nodes = topics.map(topic => {
        const mastery = this.getMasteryLevel(topic, path.completed, path.inProgress);
        return {
          id: topic.id,
          name: topic.name,
          mastery,
          status: mastery >= 0.8 ? 'completed' : mastery > 0 ? 'inProgress' : 'notStarted',
          difficulty: topic.difficulty,
          orderIndex: topic.orderIndex,
        };
      });

      // Build edges (connections)
      const edges = topics
        .filter(t => t.prerequisites && t.prerequisites.length > 0)
        .flatMap(topic => {
          return topic.prerequisites.map(prereqId => ({
            from: prereqId,
            to: topic.id,
            type: 'prerequisite',
          }));
        });

      return {
        nodes,
        edges,
        current: path.current?.id,
        next: path.next.map(n => n.topic.id),
        recommendations: path.recommendations,
      };
    } catch (error) {
      logError('Error getting path visualization', error);
      throw error;
    }
  }
}

export const adaptiveLearningPathService = new AdaptiveLearningPathService();
export default adaptiveLearningPathService;

