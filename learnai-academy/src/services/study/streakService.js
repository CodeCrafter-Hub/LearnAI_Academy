import prisma from '../../lib/prisma.js';
import { logInfo, logError } from '../../lib/logger.js';

/**
 * StreakService - Enhanced daily engagement tracking
 * 
 * Features:
 * - Daily streak calculation
 * - Engagement tracking
 * - Streak milestones
 * - Streak recovery
 * - Weekly/monthly streaks
 */
class StreakService {
  /**
   * Update daily streak for student
   * @param {string} studentId - Student ID
   * @param {number} minutesStudied - Minutes studied today
   * @returns {Promise<Object>} Updated streak information
   */
  async updateDailyStreak(studentId, minutesStudied = 0) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get or create daily activity
      let dailyActivity = await prisma.dailyActivity.findUnique({
        where: {
          studentId_date: {
            studentId,
            date: today,
          },
        },
      });

      if (!dailyActivity) {
        // Check yesterday's activity
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const yesterdayActivity = await prisma.dailyActivity.findUnique({
          where: {
            studentId_date: {
              studentId,
              date: yesterday,
            },
          },
        });

        // Calculate new streak
        const previousStreak = yesterdayActivity?.currentStreak || 0;
        const newStreak = minutesStudied > 0 ? previousStreak + 1 : 0;

        // Create today's activity
        dailyActivity = await prisma.dailyActivity.create({
          data: {
            studentId,
            date: today,
            minutesStudied: minutesStudied,
            currentStreak: newStreak,
            longestStreak: await this.updateLongestStreak(studentId, newStreak),
            sessionsCompleted: 0,
            pointsEarned: 0,
          },
        });

        // Check for streak milestones
        await this.checkStreakMilestones(studentId, newStreak);

        return {
          currentStreak: newStreak,
          previousStreak,
          isNewStreak: newStreak > previousStreak,
          milestone: this.getStreakMilestone(newStreak),
        };
      } else {
        // Update existing activity
        const updated = await prisma.dailyActivity.update({
          where: { id: dailyActivity.id },
          data: {
            minutesStudied: {
              increment: minutesStudied,
            },
          },
        });

        return {
          currentStreak: updated.currentStreak,
          previousStreak: updated.currentStreak,
          isNewStreak: false,
        };
      }
    } catch (error) {
      logError('Error updating daily streak', error);
      throw error;
    }
  }

  /**
   * Get current streak information
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} Streak information
   */
  async getStreakInfo(studentId) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dailyActivity = await prisma.dailyActivity.findUnique({
        where: {
          studentId_date: {
            studentId,
            date: today,
          },
        },
      });

      if (!dailyActivity) {
        // Check if there's a streak to maintain
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const yesterdayActivity = await prisma.dailyActivity.findUnique({
          where: {
            studentId_date: {
              studentId,
              date: yesterday,
            },
          },
        });

        return {
          currentStreak: 0,
          longestStreak: await this.getLongestStreak(studentId),
          daysUntilStreakLoss: 1,
          streakAtRisk: yesterdayActivity?.currentStreak > 0,
          milestone: null,
        };
      }

      return {
        currentStreak: dailyActivity.currentStreak,
        longestStreak: dailyActivity.longestStreak,
        daysUntilStreakLoss: 0, // Already studied today
        streakAtRisk: false,
        milestone: this.getStreakMilestone(dailyActivity.currentStreak),
        todayMinutes: dailyActivity.minutesStudied,
      };
    } catch (error) {
      logError('Error getting streak info', error);
      throw error;
    }
  }

  /**
   * Get streak milestones
   * @param {number} streak - Current streak
   * @returns {Object|null} Milestone information
   */
  getStreakMilestone(streak) {
    const milestones = [
      { days: 1, name: 'First Day', emoji: '🎉' },
      { days: 3, name: '3-Day Streak', emoji: '🔥' },
      { days: 7, name: 'Week Warrior', emoji: '⭐' },
      { days: 14, name: 'Two Week Champion', emoji: '🏆' },
      { days: 30, name: 'Monthly Master', emoji: '👑' },
      { days: 60, name: 'Two Month Legend', emoji: '💎' },
      { days: 100, name: 'Century Club', emoji: '🌟' },
      { days: 365, name: 'Year Champion', emoji: '🎊' },
    ];

    // Check if streak matches a milestone
    const milestone = milestones.find(m => m.days === streak);
    if (milestone) {
      return milestone;
    }

    // Check if streak is approaching a milestone
    const nextMilestone = milestones.find(m => m.days > streak);
    if (nextMilestone) {
      return {
        ...nextMilestone,
        daysRemaining: nextMilestone.days - streak,
        isApproaching: true,
      };
    }

    return null;
  }

  /**
   * Check for streak milestones and trigger notifications
   * @param {string} studentId - Student ID
   * @param {number} streak - Current streak
   */
  async checkStreakMilestones(studentId, streak) {
    const milestone = this.getStreakMilestone(streak);
    
    if (milestone && !milestone.isApproaching) {
      // Trigger achievement check
      try {
        const { achievementChecker } = await import('../analytics/achievementChecker.js');
        await achievementChecker.checkAchievements(studentId, {
          type: 'streak',
          streak: milestone.days,
        });
      } catch (error) {
        logError('Error checking streak achievement', error);
      }

      // Send parent notification (async, don't wait)
      try {
        const { parentNotificationService } = await import('../notifications/parentNotificationService.js');
        parentNotificationService.sendStreakMilestoneNotification(studentId, milestone).catch(err => {
          logError('Error sending streak milestone notification', err);
        });
      } catch (error) {
        logError('Error importing notification service', error);
      }
    }
  }

  /**
   * Update longest streak
   * @param {string} studentId - Student ID
   * @param {number} currentStreak - Current streak
   * @returns {Promise<number>} Longest streak
   */
  async updateLongestStreak(studentId, currentStreak) {
    try {
      // Get student progress to find longest streak
      const activities = await prisma.dailyActivity.findMany({
        where: { studentId },
        orderBy: { currentStreak: 'desc' },
        take: 1,
      });

      const previousLongest = activities[0]?.longestStreak || 0;
      return Math.max(previousLongest, currentStreak);
    } catch (error) {
      logError('Error updating longest streak', error);
      return currentStreak;
    }
  }

  /**
   * Get longest streak
   * @param {string} studentId - Student ID
   * @returns {Promise<number>} Longest streak
   */
  async getLongestStreak(studentId) {
    try {
      const activities = await prisma.dailyActivity.findMany({
        where: { studentId },
        orderBy: { longestStreak: 'desc' },
        take: 1,
      });

      return activities[0]?.longestStreak || 0;
    } catch (error) {
      logError('Error getting longest streak', error);
      return 0;
    }
  }

  /**
   * Get weekly engagement summary
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} Weekly summary
   */
  async getWeeklyEngagement(studentId) {
    try {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0);

      const activities = await prisma.dailyActivity.findMany({
        where: {
          studentId,
          date: {
            gte: weekStart,
          },
        },
        orderBy: { date: 'asc' },
      });

      const totalMinutes = activities.reduce((sum, a) => sum + a.minutesStudied, 0);
      const daysActive = activities.filter(a => a.minutesStudied > 0).length;
      const averageMinutes = daysActive > 0 ? totalMinutes / daysActive : 0;

      return {
        weekStart: weekStart.toISOString(),
        totalMinutes,
        daysActive,
        averageMinutes: Math.round(averageMinutes),
        activities: activities.map(a => ({
          date: a.date,
          minutes: a.minutesStudied,
          streak: a.currentStreak,
        })),
      };
    } catch (error) {
      logError('Error getting weekly engagement', error);
      throw error;
    }
  }

  /**
   * Get monthly engagement summary
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} Monthly summary
   */
  async getMonthlyEngagement(studentId) {
    try {
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      monthStart.setHours(0, 0, 0, 0);

      const activities = await prisma.dailyActivity.findMany({
        where: {
          studentId,
          date: {
            gte: monthStart,
          },
        },
        orderBy: { date: 'asc' },
      });

      const totalMinutes = activities.reduce((sum, a) => sum + a.minutesStudied, 0);
      const daysActive = activities.filter(a => a.minutesStudied > 0).length;
      const averageMinutes = daysActive > 0 ? totalMinutes / daysActive : 0;

      return {
        monthStart: monthStart.toISOString(),
        totalMinutes,
        daysActive,
        averageMinutes: Math.round(averageMinutes),
        currentStreak: activities[activities.length - 1]?.currentStreak || 0,
      };
    } catch (error) {
      logError('Error getting monthly engagement', error);
      throw error;
    }
  }

  /**
   * Get streak recovery options
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} Recovery options
   */
  async getStreakRecovery(studentId) {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const yesterdayActivity = await prisma.dailyActivity.findUnique({
        where: {
          studentId_date: {
            studentId,
            date: yesterday,
          },
        },
      });

      if (yesterdayActivity && yesterdayActivity.currentStreak > 0) {
        // Streak is at risk
        return {
          canRecover: true,
          previousStreak: yesterdayActivity.currentStreak,
          recoveryWindow: 1, // Can recover within 1 day
          message: `Your ${yesterdayActivity.currentStreak}-day streak is at risk! Study today to keep it going!`,
        };
      }

      return {
        canRecover: false,
        message: 'No active streak to recover.',
      };
    } catch (error) {
      logError('Error getting streak recovery', error);
      return { canRecover: false };
    }
  }
}

export const streakService = new StreakService();
export default streakService;

