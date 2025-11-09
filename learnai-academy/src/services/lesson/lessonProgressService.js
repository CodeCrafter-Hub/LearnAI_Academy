import prisma from '../../lib/prisma.js';
import { logInfo, logError } from '../../lib/logger.js';

/**
 * LessonProgressService - Tracks overall lesson progress
 * 
 * Features:
 * - Progress calculation
 * - Time tracking
 * - Section completion
 * - Mastery tracking
 * - Progress persistence
 */

class LessonProgressService {
  /**
   * Update lesson progress
   * @param {string} lessonId - Lesson ID
   * @param {Object} progressData - Progress data
   * @returns {Promise<Object>} Updated progress
   */
  async updateProgress(lessonId, progressData) {
    const {
      currentSection = null,
      sectionProgress = {},
      timeSpentSeconds = null,
    } = progressData;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        activities: {
          where: { isActive: true },
        },
      },
    });

    if (!lesson) {
      throw new Error(`Lesson not found: ${lessonId}`);
    }

    // Calculate overall progress
    const activities = lesson.activities || [];
    const totalActivities = activities.length;
    const completedActivities = activities.filter(a => a.status === 'COMPLETED').length;
    const activityProgress = totalActivities > 0 ? completedActivities / totalActivities : 0;

    // Calculate section progress
    const sectionProgressData = this.calculateSectionProgress(activities, sectionProgress);

    // Calculate total time
    const startedAt = lesson.startedAt;
    const currentTime = new Date();
    const totalTimeSeconds = timeSpentSeconds || Math.round((currentTime - startedAt) / 1000);

    // Update lesson progress
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        currentSection,
        progressData: {
          activityProgress,
          sectionProgress: sectionProgressData,
          totalTimeSeconds,
          lastUpdated: new Date().toISOString(),
        },
        lastAccessedAt: new Date(),
      },
    });

    return {
      lesson: updatedLesson,
      progress: {
        activityProgress,
        sectionProgress: sectionProgressData,
        totalTimeSeconds,
      },
    };
  }

  /**
   * Calculate section progress
   */
  calculateSectionProgress(activities, sectionProgress = {}) {
    const sections = ['warmUp', 'instruction', 'practice', 'assessment', 'closure'];
    const progress = {};

    for (const section of sections) {
      const sectionActivities = activities.filter(a => a.section === section);
      const total = sectionActivities.length;
      const completed = sectionActivities.filter(a => a.status === 'COMPLETED').length;

      progress[section] = {
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        ...(sectionProgress[section] || {}),
      };
    }

    return progress;
  }

  /**
   * Get lesson progress
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object>} Progress data
   */
  async getProgress(lessonId) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        activities: {
          where: { isActive: true },
          orderBy: { orderIndex: 'asc' },
        },
        lessonPlan: {
          include: {
            unit: {
              include: {
                curriculum: {
                  include: {
                    subject: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new Error(`Lesson not found: ${lessonId}`);
    }

    const activities = lesson.activities || [];
    const totalActivities = activities.length;
    const completedActivities = activities.filter(a => a.status === 'COMPLETED').length;
    const activityProgress = totalActivities > 0 ? completedActivities / totalActivities : 0;

    const sectionProgress = this.calculateSectionProgress(activities, lesson.progressData?.sectionProgress);

    // Calculate time spent
    const startedAt = lesson.startedAt;
    const lastAccessedAt = lesson.lastAccessedAt || startedAt;
    const timeSpentSeconds = Math.round((lastAccessedAt - startedAt) / 1000);

    // Calculate mastery (average score of completed activities)
    const completedWithScores = activities.filter(a => a.status === 'COMPLETED' && a.score !== null);
    const mastery = completedWithScores.length > 0
      ? completedWithScores.reduce((sum, a) => sum + (a.score || 0), 0) / completedWithScores.length
      : 0;

    return {
      lessonId: lesson.id,
      status: lesson.status,
      activityProgress: {
        completed: completedActivities,
        total: totalActivities,
        percentage: Math.round(activityProgress * 100),
      },
      sectionProgress,
      timeSpent: {
        seconds: timeSpentSeconds,
        minutes: Math.round(timeSpentSeconds / 60),
        formatted: this.formatTime(timeSpentSeconds),
      },
      mastery: {
        score: mastery,
        percentage: Math.round(mastery * 100),
        level: this.getMasteryLevel(mastery),
      },
      startedAt: lesson.startedAt,
      lastAccessedAt: lesson.lastAccessedAt,
      currentSection: lesson.currentSection,
    };
  }

  /**
   * Mark section as complete
   * @param {string} lessonId - Lesson ID
   * @param {string} section - Section name
   * @returns {Promise<Object>} Updated progress
   */
  async completeSection(lessonId, section) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        activities: {
          where: { isActive: true },
        },
      },
    });

    if (!lesson) {
      throw new Error(`Lesson not found: ${lessonId}`);
    }

    // Update section progress
    const progressData = lesson.progressData || {};
    const sectionProgress = progressData.sectionProgress || {};

    const sectionActivities = lesson.activities.filter(a => a.section === section);
    const total = sectionActivities.length;
    const completed = sectionActivities.filter(a => a.status === 'COMPLETED').length;

    sectionProgress[section] = {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 100,
      completedAt: new Date().toISOString(),
    };

    // Update lesson
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        progressData: {
          ...progressData,
          sectionProgress,
        },
        lastAccessedAt: new Date(),
      },
    });

    return this.getProgress(lessonId);
  }

  /**
   * Format time
   */
  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  /**
   * Get mastery level
   */
  getMasteryLevel(score) {
    if (score >= 0.9) return 'MASTERED';
    if (score >= 0.7) return 'PROFICIENT';
    if (score >= 0.5) return 'DEVELOPING';
    return 'BEGINNING';
  }

  /**
   * Get progress summary for student
   * @param {string} studentId - Student ID
   * @param {Object} options - Options
   * @returns {Promise<Object>} Progress summary
   */
  async getStudentProgressSummary(studentId, options = {}) {
    const {
      timeRange = 'all', // week, month, quarter, all
    } = options;

    const dateFilter = this.getDateFilter(timeRange);

    const lessons = await prisma.lesson.findMany({
      where: {
        studentId,
        ...(dateFilter ? { startedAt: dateFilter } : {}),
      },
      include: {
        activities: {
          where: { isActive: true },
        },
        lessonPlan: {
          include: {
            unit: {
              include: {
                curriculum: {
                  include: {
                    subject: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const totalLessons = lessons.length;
    const completedLessons = lessons.filter(l => l.status === 'COMPLETED').length;
    const inProgressLessons = lessons.filter(l => l.status === 'IN_PROGRESS').length;

    // Calculate total time
    const totalTimeSeconds = lessons.reduce((sum, l) => {
      const duration = l.durationMinutes || 0;
      return sum + (duration * 60);
    }, 0);

    // Calculate average mastery
    const lessonsWithScores = lessons.filter(l => {
      const activities = l.activities || [];
      return activities.some(a => a.score !== null);
    });

    const averageMastery = lessonsWithScores.length > 0
      ? lessonsWithScores.reduce((sum, l) => {
          const activities = l.activities || [];
          const completedWithScores = activities.filter(a => a.status === 'COMPLETED' && a.score !== null);
          const lessonMastery = completedWithScores.length > 0
            ? completedWithScores.reduce((s, a) => s + (a.score || 0), 0) / completedWithScores.length
            : 0;
          return sum + lessonMastery;
        }, 0) / lessonsWithScores.length
      : 0;

    return {
      timeRange,
      totalLessons,
      completedLessons,
      inProgressLessons,
      completionRate: totalLessons > 0 ? completedLessons / totalLessons : 0,
      totalTime: {
        seconds: totalTimeSeconds,
        minutes: Math.round(totalTimeSeconds / 60),
        hours: Math.round(totalTimeSeconds / 3600),
        formatted: this.formatTime(totalTimeSeconds),
      },
      averageMastery: {
        score: averageMastery,
        percentage: Math.round(averageMastery * 100),
        level: this.getMasteryLevel(averageMastery),
      },
    };
  }

  /**
   * Get date filter
   */
  getDateFilter(timeRange) {
    if (timeRange === 'all') {
      return null;
    }

    const now = new Date();
    let startDate;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        return null;
    }

    return {
      gte: startDate,
    };
  }
}

export const lessonProgressService = new LessonProgressService();
export default lessonProgressService;

