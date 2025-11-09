import prisma from '../../lib/prisma.js';
import { logInfo, logError } from '../../lib/logger.js';
import { parentInvolvementService } from '../parent/parentInvolvementService.js';
import { streakService } from '../study/streakService.js';
import { progressTracker } from '../analytics/progressTracker.js';

/**
 * ParentNotificationService - Weekly progress emails and notifications
 * 
 * Features:
 * - Weekly progress reports
 * - Achievement notifications
 * - Streak milestones
 * - Learning tips
 * - Home activity suggestions
 */
class ParentNotificationService {
  /**
   * Generate and send weekly progress report
   * @param {string} studentId - Student ID
   * @param {Object} options - Notification options
   * @returns {Promise<Object>} Notification result
   */
  async sendWeeklyProgressReport(studentId, options = {}) {
    try {
      // Get student with parent info
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: {
            include: {
              students: true,
            },
          },
        },
      });

      if (!student || !student.user) {
        throw new Error('Student or parent not found');
      }

      const parent = student.user;

      // Get weekly progress data
      const progressReport = await parentInvolvementService.generateProgressReport(
        studentId,
        { timeRange: 'week' }
      );

      // Get streak information
      const streakInfo = await streakService.getWeeklyEngagement(studentId);

      // Get recent achievements
      const recentAchievements = await this.getRecentAchievements(studentId, 7);

      // Generate email content
      const emailContent = this.generateWeeklyEmailContent({
        student,
        progressReport,
        streakInfo,
        recentAchievements,
      });

      // Send email (or queue for sending)
      const emailResult = await this.sendEmail({
        to: parent.email,
        subject: `Weekly Learning Report: ${student.firstName}'s Progress`,
        html: emailContent.html,
        text: emailContent.text,
      });

      // Log notification
      await this.logNotification({
        studentId,
        parentId: parent.id,
        type: 'weekly_progress',
        status: emailResult.success ? 'sent' : 'failed',
        metadata: {
          weekStart: streakInfo.weekStart,
          totalMinutes: streakInfo.totalMinutes,
          daysActive: streakInfo.daysActive,
        },
      });

      return {
        success: emailResult.success,
        message: 'Weekly progress report sent',
        emailId: emailResult.emailId,
      };
    } catch (error) {
      logError('Error sending weekly progress report', error);
      throw error;
    }
  }

  /**
   * Send achievement notification
   * @param {string} studentId - Student ID
   * @param {Object} achievement - Achievement data
   * @returns {Promise<Object>} Notification result
   */
  async sendAchievementNotification(studentId, achievement) {
    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: true,
        },
      });

      if (!student || !student.user) {
        throw new Error('Student or parent not found');
      }

      const emailContent = this.generateAchievementEmailContent({
        student,
        achievement,
      });

      const emailResult = await this.sendEmail({
        to: student.user.email,
        subject: `🎉 Achievement Unlocked: ${achievement.name}`,
        html: emailContent.html,
        text: emailContent.text,
      });

      await this.logNotification({
        studentId,
        parentId: student.user.id,
        type: 'achievement',
        status: emailResult.success ? 'sent' : 'failed',
        metadata: { achievementId: achievement.id },
      });

      return {
        success: emailResult.success,
        message: 'Achievement notification sent',
      };
    } catch (error) {
      logError('Error sending achievement notification', error);
      throw error;
    }
  }

  /**
   * Send streak milestone notification
   * @param {string} studentId - Student ID
   * @param {Object} milestone - Milestone data
   * @returns {Promise<Object>} Notification result
   */
  async sendStreakMilestoneNotification(studentId, milestone) {
    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: true,
        },
      });

      if (!student || !student.user) {
        throw new Error('Student or parent not found');
      }

      const emailContent = this.generateStreakEmailContent({
        student,
        milestone,
      });

      const emailResult = await this.sendEmail({
        to: student.user.email,
        subject: `🔥 ${milestone.name}: ${student.firstName}'s Learning Streak!`,
        html: emailContent.html,
        text: emailContent.text,
      });

      await this.logNotification({
        studentId,
        parentId: student.user.id,
        type: 'streak_milestone',
        status: emailResult.success ? 'sent' : 'failed',
        metadata: { milestoneDays: milestone.days },
      });

      return {
        success: emailResult.success,
        message: 'Streak milestone notification sent',
      };
    } catch (error) {
      logError('Error sending streak milestone notification', error);
      throw error;
    }
  }

  /**
   * Generate weekly email content
   */
  generateWeeklyEmailContent({ student, progressReport, streakInfo, recentAchievements }) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .stat-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .stat-label { color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
          .stat-value { color: #333; font-size: 32px; font-weight: bold; margin: 10px 0; }
          .achievement { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 10px 0; border-radius: 4px; }
          .tip-box { background: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin: 10px 0; border-radius: 4px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📚 Weekly Learning Report</h1>
            <p>${student.firstName}'s Progress This Week</p>
          </div>
          <div class="content">
            <h2>Hello ${student.user.firstName || 'Parent'}!</h2>
            <p>Here's how ${student.firstName} did this week:</p>

            <div class="stat-box">
              <div class="stat-label">Time Spent Learning</div>
              <div class="stat-value">${Math.round(streakInfo.totalMinutes / 60)} hours</div>
              <p>${streakInfo.totalMinutes} minutes across ${streakInfo.daysActive} days</p>
            </div>

            <div class="stat-box">
              <div class="stat-label">Current Streak</div>
              <div class="stat-value">${progressReport.streak || 0} days 🔥</div>
              <p>Keep the momentum going!</p>
            </div>

            ${recentAchievements.length > 0 ? `
              <h3>Recent Achievements 🏆</h3>
              ${recentAchievements.map(ach => `
                <div class="achievement">
                  <strong>${ach.name}</strong><br>
                  ${ach.description}
                </div>
              `).join('')}
            ` : ''}

            <div class="tip-box">
              <h3>💡 Learning Tip</h3>
              <p>${this.getWeeklyLearningTip(student.gradeLevel)}</p>
            </div>

            <div class="tip-box">
              <h3>🏠 Home Activity Suggestion</h3>
              <p>${this.getHomeActivitySuggestion(student.gradeLevel, progressReport)}</p>
            </div>

            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://learnai.academy'}/parent" class="button">
              View Full Progress Dashboard
            </a>

            <p style="margin-top: 30px; color: #666; font-size: 12px;">
              You're receiving this because you're ${student.firstName}'s parent on LearnAI Academy.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Weekly Learning Report - ${student.firstName}'s Progress

Time Spent: ${Math.round(streakInfo.totalMinutes / 60)} hours (${streakInfo.totalMinutes} minutes)
Days Active: ${streakInfo.daysActive}
Current Streak: ${progressReport.streak || 0} days

${recentAchievements.length > 0 ? `Recent Achievements:\n${recentAchievements.map(a => `- ${a.name}`).join('\n')}\n` : ''}

Learning Tip: ${this.getWeeklyLearningTip(student.gradeLevel)}

Home Activity: ${this.getHomeActivitySuggestion(student.gradeLevel, progressReport)}

View full progress: ${process.env.NEXT_PUBLIC_APP_URL || 'https://learnai.academy'}/parent
    `;

    return { html, text };
  }

  /**
   * Generate achievement email content
   */
  generateAchievementEmailContent({ student, achievement }) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; text-align: center; }
          .achievement-icon { font-size: 64px; margin: 20px 0; }
          .button { display: inline-block; background: #f5576c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Achievement Unlocked!</h1>
          </div>
          <div class="content">
            <div class="achievement-icon">${achievement.icon || '🏆'}</div>
            <h2>${achievement.name}</h2>
            <p>${achievement.description}</p>
            <p><strong>${student.firstName}</strong> just earned this achievement!</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://learnai.academy'}/achievements" class="button">
              View All Achievements
            </a>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Achievement Unlocked!

${achievement.name}
${achievement.description}

${student.firstName} just earned this achievement!

View all achievements: ${process.env.NEXT_PUBLIC_APP_URL || 'https://learnai.academy'}/achievements
    `;

    return { html, text };
  }

  /**
   * Generate streak email content
   */
  generateStreakEmailContent({ student, milestone }) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; text-align: center; }
          .streak-icon { font-size: 64px; margin: 20px 0; }
          .button { display: inline-block; background: #fa709a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔥 Streak Milestone!</h1>
          </div>
          <div class="content">
            <div class="streak-icon">${milestone.emoji}</div>
            <h2>${milestone.name}</h2>
            <p><strong>${student.firstName}</strong> has maintained a ${milestone.days}-day learning streak!</p>
            <p>This is an amazing achievement. Keep up the great work!</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://learnai.academy'}/dashboard" class="button">
              View Dashboard
            </a>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Streak Milestone!

${milestone.name} ${milestone.emoji}

${student.firstName} has maintained a ${milestone.days}-day learning streak!

This is an amazing achievement. Keep up the great work!

View dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://learnai.academy'}/dashboard
    `;

    return { html, text };
  }

  /**
   * Get weekly learning tip
   */
  getWeeklyLearningTip(gradeLevel) {
    const tips = {
      preschool: 'Encourage play-based learning. Let your child explore and ask questions naturally.',
      'k-2': 'Read together daily. Ask questions about the story to build comprehension skills.',
      '3-5': 'Create a consistent study routine. Even 15 minutes daily makes a big difference.',
      '6-8': 'Help your child set learning goals. Break big goals into smaller, achievable steps.',
      '9-12': 'Encourage independent learning while staying available for support when needed.',
    };

    const gradeBand = this.getGradeBand(gradeLevel);
    return tips[gradeBand] || tips['3-5'];
  }

  /**
   * Get home activity suggestion
   */
  getHomeActivitySuggestion(gradeLevel, progressReport) {
    const activities = {
      preschool: 'Try a counting game during snack time. Count pieces of fruit or crackers together.',
      'k-2': 'Practice reading signs and labels around the house. Make it a fun game!',
      '3-5': 'Create a "learning corner" with books and educational games. Make learning visible and accessible.',
      '6-8': 'Discuss what they learned today. Ask open-ended questions to encourage reflection.',
      '9-12': 'Help them connect school learning to real-world applications. Show how math and science are used in daily life.',
    };

    const gradeBand = this.getGradeBand(gradeLevel);
    return activities[gradeBand] || activities['3-5'];
  }

  /**
   * Get recent achievements
   */
  async getRecentAchievements(studentId, days = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const achievements = await prisma.studentAchievement.findMany({
        where: {
          studentId,
          unlockedAt: {
            gte: cutoffDate,
          },
        },
        include: {
          achievement: true,
        },
        orderBy: {
          unlockedAt: 'desc',
        },
        take: 5,
      });

      return achievements.map(sa => ({
        id: sa.achievement.id,
        name: sa.achievement.name,
        description: sa.achievement.description,
        icon: sa.achievement.icon,
        unlockedAt: sa.unlockedAt,
      }));
    } catch (error) {
      logError('Error getting recent achievements', error);
      return [];
    }
  }

  /**
   * Send email - integrates with existing email service
   */
  async sendEmail({ to, subject, html, text }) {
    try {
      // Use existing email service
      const { sendEmail: sendEmailService } = await import('./emailService.js');
      
      await sendEmailService({
        to,
        subject,
        html,
      });

      logInfo('Email sent successfully', {
        to,
        subject,
      });

      return {
        success: true,
        emailId: `email_${Date.now()}`,
        message: 'Email sent successfully',
      };
    } catch (error) {
      logError('Error sending email', error);
      // Don't fail notification if email fails
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Log notification
   */
  async logNotification({ studentId, parentId, type, status, metadata }) {
    try {
      // Store notification log (could be in database or logging service)
      logInfo('Parent notification', {
        studentId,
        parentId,
        type,
        status,
        metadata,
        timestamp: new Date().toISOString(),
      });

      // Could also store in database:
      // await prisma.parentNotification.create({ data: { ... } });
    } catch (error) {
      logError('Error logging notification', error);
    }
  }

  /**
   * Get grade band
   */
  getGradeBand(grade) {
    if (grade <= -1) return 'preschool';
    if (grade <= 2) return 'k-2';
    if (grade <= 5) return '3-5';
    if (grade <= 8) return '6-8';
    return '9-12';
  }

  /**
   * Schedule weekly reports for all students
   * This would typically run as a cron job
   */
  async scheduleWeeklyReports() {
    try {
      // Get all active students
      const students = await prisma.student.findMany({
        where: {
          user: {
            subscriptionTier: {
              not: 'FREE', // Only for paid subscriptions
            },
          },
        },
        include: {
          user: true,
        },
      });

      const results = [];
      for (const student of students) {
        try {
          const result = await this.sendWeeklyProgressReport(student.id);
          results.push({ studentId: student.id, success: result.success });
        } catch (error) {
          logError(`Error sending report for student ${student.id}`, error);
          results.push({ studentId: student.id, success: false, error: error.message });
        }
      }

      return {
        total: students.length,
        sent: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
      };
    } catch (error) {
      logError('Error scheduling weekly reports', error);
      throw error;
    }
  }
}

export const parentNotificationService = new ParentNotificationService();
export default parentNotificationService;

