import prisma from '../../lib/prisma.js';

/**
 * ProgressTracker Service
 * 
 * Tracks student learning progress, calculates mastery levels,
 * identifies strengths/weaknesses, and updates progress records.
 */
class ProgressTracker {
  /**
   * Track progress after a learning session
   * @param {string} sessionId - Learning session ID
   * @param {Object} sessionData - Session data including problems attempted, correct, etc.
   */
  async trackSessionProgress(sessionId, sessionData = {}) {
    try {
      // Get session with student and topic info
      const session = await prisma.learningSession.findUnique({
        where: { id: sessionId },
        include: {
          student: true,
          subject: true,
          topic: true,
        },
      });

      if (!session) {
        throw new Error('Session not found');
      }

      const { studentId, subjectId, topicId } = session;
      const { problemsAttempted = 0, problemsCorrect = 0, durationMinutes = 0 } = sessionData;

      // Calculate accuracy rate
      const accuracyRate = problemsAttempted > 0 
        ? (problemsCorrect / problemsAttempted) * 100 
        : 0;

      // Get or create progress record
      let progress = await prisma.studentProgress.findUnique({
        where: {
          studentId_topicId: {
            studentId,
            topicId,
          },
        },
      });

      // Calculate new mastery level
      const masteryLevel = this.calculateMasteryLevel(
        progress,
        accuracyRate,
        problemsAttempted,
        problemsCorrect
      );

      // Update strengths and weaknesses
      const { strengths, weaknesses } = this.updateStrengthsWeaknesses(
        progress,
        accuracyRate,
        sessionData
      );

      // Update or create progress record
      const progressData = {
        studentId,
        subjectId,
        topicId,
        masteryLevel,
        totalTimeMinutes: {
          increment: durationMinutes || 0,
        },
        sessionsCount: {
          increment: 1,
        },
        lastPracticedAt: new Date(),
        strengths,
        weaknesses,
      };

      if (progress) {
        progress = await prisma.studentProgress.update({
          where: {
            studentId_topicId: {
              studentId,
              topicId,
            },
          },
          data: progressData,
        });
      } else {
        progress = await prisma.studentProgress.create({
          data: {
            ...progressData,
            totalTimeMinutes: durationMinutes || 0,
            sessionsCount: 1,
          },
        });
      }

      // Update daily activity
      await this.updateDailyActivity(studentId, durationMinutes || 0, sessionData);

      // Schedule spaced repetition reviews for concepts learned
      if (sessionData.concepts && sessionData.concepts.length > 0) {
        try {
          const { spacedRepetitionService } = await import('../learning/spacedRepetitionService.js');
          const initialQuality = sessionData.problemsAttempted > 0
            ? Math.min(5, Math.round((sessionData.problemsCorrect / sessionData.problemsAttempted) * 5))
            : 3;

          for (const conceptId of sessionData.concepts) {
            await spacedRepetitionService.scheduleInitialReview(
              studentId,
              conceptId,
              session.subjectId,
              initialQuality
            ).catch(err => {
              console.error('Error scheduling spaced repetition:', err);
            });
          }
        } catch (error) {
          console.error('Error importing spaced repetition service:', error);
        }
      }

      return progress;
    } catch (error) {
      console.error('Error tracking progress:', error);
      throw error;
    }
  }

  /**
   * Calculate mastery level based on performance
   * @param {Object} progress - Existing progress record
   * @param {number} accuracyRate - Current session accuracy (0-100)
   * @param {number} problemsAttempted - Number of problems attempted
   * @param {number} problemsCorrect - Number of problems correct
   */
  calculateMasteryLevel(progress, accuracyRate, problemsAttempted, problemsCorrect) {
    const currentMastery = progress?.masteryLevel || 0;
    
    // Base mastery on current session performance
    const sessionScore = accuracyRate;
    
    // Weighted average: 70% current mastery, 30% new session
    // This ensures progress is gradual and stable
    const weightCurrent = 0.7;
    const weightNew = 0.3;
    
    // Minimum problems required for meaningful update
    const minProblems = 3;
    
    if (problemsAttempted >= minProblems) {
      const newMastery = (currentMastery * weightCurrent) + (sessionScore * weightNew);
      
      // Cap at 100
      return Math.min(100, Math.max(0, newMastery));
    }
    
    // If not enough problems, slight increase based on accuracy
    if (problemsAttempted > 0) {
      const incremental = (accuracyRate * 0.1); // 10% of accuracy as incremental
      return Math.min(100, currentMastery + incremental);
    }
    
    return currentMastery;
  }

  /**
   * Update strengths and weaknesses based on performance
   */
  updateStrengthsWeaknesses(progress, accuracyRate, sessionData) {
    const existingStrengths = progress?.strengths || [];
    const existingWeaknesses = progress?.weaknesses || [];
    
    const newStrengths = [...existingStrengths];
    const newWeaknesses = [...existingWeaknesses];

    // Identify strengths (high accuracy areas)
    if (accuracyRate >= 80 && sessionData.concepts) {
      sessionData.concepts.forEach(concept => {
        if (!newStrengths.includes(concept)) {
          newStrengths.push(concept);
        }
        // Remove from weaknesses if it becomes a strength
        const weaknessIndex = newWeaknesses.indexOf(concept);
        if (weaknessIndex > -1) {
          newWeaknesses.splice(weaknessIndex, 1);
        }
      });
    }

    // Identify weaknesses (low accuracy areas)
    if (accuracyRate < 60 && sessionData.concepts) {
      sessionData.concepts.forEach(concept => {
        if (!newWeaknesses.includes(concept) && !newStrengths.includes(concept)) {
          newWeaknesses.push(concept);
        }
      });
    }

    // Limit to top 5 strengths and weaknesses
    return {
      strengths: newStrengths.slice(0, 5),
      weaknesses: newWeaknesses.slice(0, 5),
    };
  }

  /**
   * Update daily activity record
   */
  async updateDailyActivity(studentId, minutes, sessionData) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const activity = await prisma.dailyActivity.findUnique({
        where: {
          studentId_activityDate: {
            studentId,
            activityDate: today,
          },
        },
      });

      const activityData = {
        minutesLearned: { increment: minutes },
        sessionsCount: { increment: 1 },
        pointsEarned: { increment: sessionData.pointsEarned || 0 },
      };

      if (activity) {
        await prisma.dailyActivity.update({
          where: {
            studentId_activityDate: {
              studentId,
              activityDate: today,
            },
          },
          data: activityData,
        });
      } else {
        // Calculate streak
        const streak = await this.calculateStreak(studentId);
        
        await prisma.dailyActivity.create({
          data: {
            studentId,
            activityDate: today,
            minutesLearned: minutes,
            sessionsCount: 1,
            pointsEarned: sessionData.pointsEarned || 0,
            streakDay: streak + 1,
          },
        });
      }
    } catch (error) {
      console.error('Error updating daily activity:', error);
    }
  }

  /**
   * Calculate current streak
   */
  async calculateStreak(studentId) {
    try {
      const activities = await prisma.dailyActivity.findMany({
        where: { studentId },
        orderBy: { activityDate: 'desc' },
        take: 30,
      });

      if (activities.length === 0) return 0;

      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if today has activity
      const todayActivity = activities.find(a => 
        a.activityDate.getTime() === today.getTime()
      );

      if (!todayActivity) {
        // Check yesterday
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayActivity = activities.find(a =>
          a.activityDate.getTime() === yesterday.getTime()
        );
        if (!yesterdayActivity) return 0;
        streak = yesterdayActivity.streakDay || 0;
      } else {
        streak = todayActivity.streakDay || 0;
      }

      return streak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  }

  /**
   * Get progress summary for a student
   */
  async getProgressSummary(studentId, subjectId = null) {
    try {
      const where = { studentId };
      if (subjectId) {
        where.subjectId = subjectId;
      }

      const progressRecords = await prisma.studentProgress.findMany({
        where,
        include: {
          subject: true,
          topic: true,
        },
        orderBy: { lastPracticedAt: 'desc' },
      });

      // Calculate overall statistics
      const totalTopics = progressRecords.length;
      const masteredTopics = progressRecords.filter(p => p.masteryLevel >= 80).length;
      const inProgressTopics = progressRecords.filter(p => p.masteryLevel > 0 && p.masteryLevel < 80).length;
      const averageMastery = totalTopics > 0
        ? progressRecords.reduce((sum, p) => sum + p.masteryLevel, 0) / totalTopics
        : 0;
      const totalTimeMinutes = progressRecords.reduce((sum, p) => sum + p.totalTimeMinutes, 0);
      const totalSessions = progressRecords.reduce((sum, p) => sum + p.sessionsCount, 0);

      return {
        totalTopics,
        masteredTopics,
        inProgressTopics,
        averageMastery: Math.round(averageMastery * 10) / 10,
        totalTimeMinutes,
        totalSessions,
        progressRecords: progressRecords.map(p => ({
          id: p.id,
          subject: p.subject.name,
          topic: p.topic.name,
          masteryLevel: p.masteryLevel,
          totalTimeMinutes: p.totalTimeMinutes,
          sessionsCount: p.sessionsCount,
          lastPracticedAt: p.lastPracticedAt,
          strengths: p.strengths,
          weaknesses: p.weaknesses,
        })),
      };
    } catch (error) {
      console.error('Error getting progress summary:', error);
      throw error;
    }
  }

  /**
   * Get progress for a specific topic
   */
  async getTopicProgress(studentId, topicId) {
    try {
      const progress = await prisma.studentProgress.findUnique({
        where: {
          studentId_topicId: {
            studentId,
            topicId,
          },
        },
        include: {
          subject: true,
          topic: true,
        },
      });

      return progress;
    } catch (error) {
      console.error('Error getting topic progress:', error);
      throw error;
    }
  }

  /**
   * Update progress manually (for assessments, etc.)
   */
  async updateProgress(studentId, topicId, updates) {
    try {
      const { masteryLevel, strengths, weaknesses, ...otherUpdates } = updates;

      const progress = await prisma.studentProgress.upsert({
        where: {
          studentId_topicId: {
            studentId,
            topicId,
          },
        },
        update: {
          ...otherUpdates,
          ...(masteryLevel !== undefined && { masteryLevel }),
          ...(strengths !== undefined && { strengths }),
          ...(weaknesses !== undefined && { weaknesses }),
          lastPracticedAt: new Date(),
        },
        create: {
          studentId,
          topicId,
          subjectId: updates.subjectId,
          masteryLevel: masteryLevel || 0,
          strengths: strengths || [],
          weaknesses: weaknesses || [],
          totalTimeMinutes: 0,
          sessionsCount: 0,
          ...otherUpdates,
        },
      });

      return progress;
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }
}

export const progressTracker = new ProgressTracker();
export default progressTracker;
