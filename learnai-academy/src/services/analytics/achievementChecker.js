import prisma from '../../lib/prisma.js';
import { progressTracker } from './progressTracker.js';

/**
 * AchievementChecker Service
 * 
 * Checks and awards achievements based on student progress and milestones.
 */
class AchievementChecker {
  /**
   * Check and award achievements for a student
   * @param {string} studentId - Student ID
   * @param {Object} context - Context data (sessionId, sessionData, etc.)
   */
  async checkAchievements(studentId, context = {}) {
    try {
      // Get all active achievements
      const achievements = await prisma.achievement.findMany({
        where: { isActive: true },
        orderBy: { orderIndex: 'asc' },
      });

      // Get student's existing achievements
      const existingAchievements = await prisma.studentAchievement.findMany({
        where: { studentId },
        select: { achievementId: true },
      });

      const existingAchievementIds = new Set(
        existingAchievements.map(a => a.achievementId)
      );

      // Get student data
      const student = await prisma.student.findUnique({
        where: { id: studentId },
      });

      if (!student) {
        throw new Error('Student not found');
      }

      // Check each achievement
      const newlyUnlocked = [];

      for (const achievement of achievements) {
        // Skip if already unlocked
        if (existingAchievementIds.has(achievement.id)) {
          continue;
        }

        // Check if condition is met
        const isUnlocked = await this.checkCondition(achievement, studentId, context);

        if (isUnlocked) {
          // Award achievement
          const studentAchievement = await prisma.studentAchievement.create({
            data: {
              studentId,
              achievementId: achievement.id,
              progressData: {
                unlockedAt: new Date().toISOString(),
                context,
              },
            },
            include: {
              achievement: true,
            },
          });

          newlyUnlocked.push(studentAchievement);

          // Log achievement unlock
          console.log(`Achievement unlocked: ${achievement.name} for student ${studentId}`);
        }
      }

      return newlyUnlocked;
    } catch (error) {
      console.error('Error checking achievements:', error);
      throw error;
    }
  }

  /**
   * Check if achievement condition is met
   */
  async checkCondition(achievement, studentId, context) {
    const condition = achievement.condition;
    const conditionType = condition.type;

    try {
      switch (conditionType) {
        case 'first_session':
          return await this.checkFirstSession(studentId);

        case 'session_count':
          return await this.checkSessionCount(studentId, condition.count);

        case 'problems_solved':
          return await this.checkProblemsSolved(studentId, condition.count);

        case 'perfect_session':
          return await this.checkPerfectSession(context);

        case 'streak':
          return await this.checkStreak(studentId, condition.days);

        case 'mastery_level':
          return await this.checkMasteryLevel(studentId, condition.subjectId, condition.level);

        case 'time_spent':
          return await this.checkTimeSpent(studentId, condition.minutes);

        case 'topics_mastered':
          return await this.checkTopicsMastered(studentId, condition.count);

        case 'points_earned':
          return await this.checkPointsEarned(studentId, condition.points);

        case 'subject_completed':
          return await this.checkSubjectCompleted(studentId, condition.subjectId);

        default:
          console.warn(`Unknown achievement condition type: ${conditionType}`);
          return false;
      }
    } catch (error) {
      console.error(`Error checking condition ${conditionType}:`, error);
      return false;
    }
  }

  /**
   * Check if this is student's first session
   */
  async checkFirstSession(studentId) {
    const sessionCount = await prisma.learningSession.count({
      where: { studentId },
    });
    return sessionCount === 1;
  }

  /**
   * Check if student has completed N sessions
   */
  async checkSessionCount(studentId, count) {
    const sessionCount = await prisma.learningSession.count({
      where: { studentId },
    });
    return sessionCount >= count;
  }

  /**
   * Check if student has solved N problems correctly
   */
  async checkProblemsSolved(studentId, count) {
    const sessions = await prisma.learningSession.findMany({
      where: { studentId },
      select: { problemsCorrect: true },
    });

    const totalProblemsSolved = sessions.reduce(
      (sum, session) => sum + (session.problemsCorrect || 0),
      0
    );

    return totalProblemsSolved >= count;
  }

  /**
   * Check if current session was perfect (100% accuracy)
   */
  async checkPerfectSession(context) {
    const { sessionData } = context;
    if (!sessionData) return false;

    const { problemsAttempted = 0, problemsCorrect = 0 } = sessionData;
    if (problemsAttempted === 0) return false;

    return problemsCorrect === problemsAttempted;
  }

  /**
   * Check if student has a streak of N days
   */
  async checkStreak(studentId, days) {
    const streak = await progressTracker.calculateStreak(studentId);
    return streak >= days;
  }

  /**
   * Check if student has reached mastery level in a subject
   */
  async checkMasteryLevel(studentId, subjectId, level) {
    if (!subjectId) {
      // Check if any subject has reached mastery
      const progress = await prisma.studentProgress.findFirst({
        where: {
          studentId,
          masteryLevel: { gte: level },
        },
      });
      return !!progress;
    }

    // Check specific subject
    const progress = await prisma.studentProgress.findFirst({
      where: {
        studentId,
        subjectId,
        masteryLevel: { gte: level },
      },
    });

    return !!progress;
  }

  /**
   * Check if student has spent N minutes learning
   */
  async checkTimeSpent(studentId, minutes) {
    const progressRecords = await prisma.studentProgress.findMany({
      where: { studentId },
      select: { totalTimeMinutes: true },
    });

    const totalMinutes = progressRecords.reduce(
      (sum, p) => sum + p.totalTimeMinutes,
      0
    );

    return totalMinutes >= minutes;
  }

  /**
   * Check if student has mastered N topics
   */
  async checkTopicsMastered(studentId, count) {
    const masteredTopics = await prisma.studentProgress.count({
      where: {
        studentId,
        masteryLevel: { gte: 80 },
      },
    });

    return masteredTopics >= count;
  }

  /**
   * Check if student has earned N points
   */
  async checkPointsEarned(studentId, points) {
    const activities = await prisma.dailyActivity.findMany({
      where: { studentId },
      select: { pointsEarned: true },
    });

    const totalPoints = activities.reduce(
      (sum, a) => sum + (a.pointsEarned || 0),
      0
    );

    return totalPoints >= points;
  }

  /**
   * Check if student has completed a subject (all topics mastered)
   */
  async checkSubjectCompleted(studentId, subjectId) {
    // Get all topics for this subject
    const topics = await prisma.topic.findMany({
      where: {
        subjectId,
        isActive: true,
      },
      select: { id: true },
    });

    if (topics.length === 0) return false;

    // Check if all topics are mastered
    const masteredTopics = await prisma.studentProgress.count({
      where: {
        studentId,
        subjectId,
        masteryLevel: { gte: 80 },
        topicId: { in: topics.map(t => t.id) },
      },
    });

    return masteredTopics === topics.length;
  }

  /**
   * Get student's achievements
   */
  async getStudentAchievements(studentId) {
    try {
      const studentAchievements = await prisma.studentAchievement.findMany({
        where: { studentId },
        include: {
          achievement: true,
        },
        orderBy: { unlockedAt: 'desc' },
      });

      return studentAchievements.map(sa => ({
        id: sa.id,
        code: sa.achievement.code,
        name: sa.achievement.name,
        description: sa.achievement.description,
        icon: sa.achievement.icon,
        category: sa.achievement.category,
        pointsReward: sa.achievement.pointsReward,
        rarity: sa.achievement.rarity,
        unlockedAt: sa.unlockedAt,
        progressData: sa.progressData,
      }));
    } catch (error) {
      console.error('Error getting student achievements:', error);
      throw error;
    }
  }

  /**
   * Get achievement progress for a student (for achievements not yet unlocked)
   */
  async getAchievementProgress(studentId, achievementId) {
    try {
      const achievement = await prisma.achievement.findUnique({
        where: { id: achievementId },
      });

      if (!achievement) {
        throw new Error('Achievement not found');
      }

      // Check if already unlocked
      const existing = await prisma.studentAchievement.findUnique({
        where: {
          studentId_achievementId: {
            studentId,
            achievementId,
          },
        },
      });

      if (existing) {
        return {
          unlocked: true,
          progress: 100,
          unlockedAt: existing.unlockedAt,
        };
      }

      // Calculate progress
      const condition = achievement.condition;
      const conditionType = condition.type;
      let current = 0;
      let target = 1;

      switch (conditionType) {
        case 'session_count':
          current = await prisma.learningSession.count({ where: { studentId } });
          target = condition.count;
          break;

        case 'problems_solved':
          const sessions = await prisma.learningSession.findMany({
            where: { studentId },
            select: { problemsCorrect: true },
          });
          current = sessions.reduce((sum, s) => sum + (s.problemsCorrect || 0), 0);
          target = condition.count;
          break;

        case 'streak':
          current = await progressTracker.calculateStreak(studentId);
          target = condition.days;
          break;

        case 'time_spent':
          const progressRecords = await prisma.studentProgress.findMany({
            where: { studentId },
            select: { totalTimeMinutes: true },
          });
          current = progressRecords.reduce((sum, p) => sum + p.totalTimeMinutes, 0);
          target = condition.minutes;
          break;

        case 'topics_mastered':
          current = await prisma.studentProgress.count({
            where: { studentId, masteryLevel: { gte: 80 } },
          });
          target = condition.count;
          break;

        default:
          return { unlocked: false, progress: 0 };
      }

      const progress = Math.min(100, Math.round((current / target) * 100));

      return {
        unlocked: false,
        progress,
        current,
        target,
      };
    } catch (error) {
      console.error('Error getting achievement progress:', error);
      throw error;
    }
  }
}

export const achievementChecker = new AchievementChecker();
export default achievementChecker;
