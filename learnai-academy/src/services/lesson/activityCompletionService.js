import prisma from '../../lib/prisma.js';
import { logInfo, logError } from '../../lib/logger.js';

/**
 * ActivityCompletionService - Tracks activity completion and progress
 * 
 * Features:
 * - Start activities
 * - Complete activities
 * - Track attempts
 * - Score activities
 * - Provide feedback
 */

class ActivityCompletionService {
  /**
   * Start activity
   * @param {string} activityId - Activity ID
   * @param {Object} options - Options
   * @returns {Promise<Object>} Activity session
   */
  async startActivity(activityId, options = {}) {
    const activity = await prisma.lessonActivity.findUnique({
      where: { id: activityId },
      include: {
        lesson: {
          include: {
            student: true,
          },
        },
      },
    });

    if (!activity) {
      throw new Error(`Activity not found: ${activityId}`);
    }

    if (activity.status === 'COMPLETED') {
      throw new Error('Activity already completed');
    }

    // Update activity status
    const updatedActivity = await prisma.lessonActivity.update({
      where: { id: activityId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: activity.startedAt || new Date(),
        lastAccessedAt: new Date(),
      },
    });

    logInfo('Activity started', { activityId, lessonId: activity.lessonId });

    return updatedActivity;
  }

  /**
   * Submit activity completion
   * @param {string} activityId - Activity ID
   * @param {Object} submission - Submission data
   * @returns {Promise<Object>} Completion result
   */
  async submitActivity(activityId, submission) {
    const {
      answers = [],
      score = null,
      timeSpentSeconds = null,
      feedback = null,
    } = submission;

    const activity = await prisma.lessonActivity.findUnique({
      where: { id: activityId },
      include: {
        lesson: {
          include: {
            student: true,
          },
        },
      },
    });

    if (!activity) {
      throw new Error(`Activity not found: ${activityId}`);
    }

    // Calculate score if not provided
    const calculatedScore = score !== null
      ? score
      : this.calculateScore(activity.activityData, answers);

    // Determine if passed (threshold: 70%)
    const passed = calculatedScore >= 0.7;

    // Increment attempts
    const attempts = (activity.attempts || 0) + 1;

    // Update activity
    const updatedActivity = await prisma.lessonActivity.update({
      where: { id: activityId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        attempts,
        score: calculatedScore,
        timeSpentSeconds: timeSpentSeconds || activity.timeSpentSeconds,
        submissionData: {
          answers,
          score: calculatedScore,
          passed,
          feedback: feedback || this.generateFeedback(calculatedScore, passed),
          submittedAt: new Date().toISOString(),
        },
        lastAccessedAt: new Date(),
      },
    });

    logInfo('Activity completed', {
      activityId,
      score: calculatedScore,
      passed,
      attempts,
    });

    return {
      activity: updatedActivity,
      score: calculatedScore,
      passed,
      feedback: updatedActivity.submissionData.feedback,
    };
  }

  /**
   * Calculate activity score
   * @param {Object} activityData - Activity data
   * @param {Array} answers - Student answers
   * @returns {number} Score (0-1)
   */
  calculateScore(activityData, answers) {
    if (!activityData || !answers || answers.length === 0) {
      return 0;
    }

    // Get correct answers from activity data
    const correctAnswers = activityData.correctAnswers || activityData.answers || [];
    
    if (correctAnswers.length === 0) {
      // No correct answers defined - assume participation score
      return 0.5;
    }

    // Compare answers
    let correctCount = 0;
    const minLength = Math.min(correctAnswers.length, answers.length);

    for (let i = 0; i < minLength; i++) {
      const correct = correctAnswers[i];
      const student = answers[i];

      if (this.compareAnswers(correct, student)) {
        correctCount++;
      }
    }

    return correctCount / correctAnswers.length;
  }

  /**
   * Compare answers (flexible matching)
   */
  compareAnswers(correct, student) {
    if (correct === student) {
      return true;
    }

    // Case-insensitive string comparison
    if (typeof correct === 'string' && typeof student === 'string') {
      return correct.toLowerCase().trim() === student.toLowerCase().trim();
    }

    // Number comparison (with tolerance)
    if (typeof correct === 'number' && typeof student === 'number') {
      return Math.abs(correct - student) < 0.01;
    }

    // Array comparison
    if (Array.isArray(correct) && Array.isArray(student)) {
      if (correct.length !== student.length) {
        return false;
      }
      return correct.every((c, i) => this.compareAnswers(c, student[i]));
    }

    return false;
  }

  /**
   * Generate feedback based on score
   */
  generateFeedback(score, passed) {
    if (score >= 0.9) {
      return {
        message: 'Excellent work! You mastered this activity!',
        type: 'success',
        suggestions: [],
      };
    } else if (score >= 0.7) {
      return {
        message: 'Great job! You completed this activity successfully.',
        type: 'success',
        suggestions: ['Try the next activity to continue learning!'],
      };
    } else if (score >= 0.5) {
      return {
        message: 'Good effort! Review the material and try again.',
        type: 'info',
        suggestions: ['Review the lesson content', 'Try the activity again'],
      };
    } else {
      return {
        message: 'Keep practicing! Review the lesson and try again.',
        type: 'warning',
        suggestions: ['Review the lesson content', 'Ask for help if needed', 'Try again'],
      };
    }
  }

  /**
   * Get activity progress
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object>} Progress data
   */
  async getActivityProgress(lessonId) {
    const activities = await prisma.lessonActivity.findMany({
      where: {
        lessonId,
        isActive: true,
      },
      orderBy: { orderIndex: 'asc' },
    });

    const total = activities.length;
    const completed = activities.filter(a => a.status === 'COMPLETED').length;
    const inProgress = activities.filter(a => a.status === 'IN_PROGRESS').length;
    const notStarted = activities.filter(a => a.status === 'NOT_STARTED').length;

    // Calculate average score
    const completedActivities = activities.filter(a => a.status === 'COMPLETED' && a.score !== null);
    const averageScore = completedActivities.length > 0
      ? completedActivities.reduce((sum, a) => sum + (a.score || 0), 0) / completedActivities.length
      : 0;

    // Calculate total time spent
    const totalTimeSeconds = activities.reduce((sum, a) => sum + (a.timeSpentSeconds || 0), 0);

    return {
      total,
      completed,
      inProgress,
      notStarted,
      completionRate: total > 0 ? completed / total : 0,
      averageScore,
      totalTimeSeconds,
      activities: activities.map(a => ({
        id: a.id,
        orderIndex: a.orderIndex,
        section: a.section,
        status: a.status,
        score: a.score,
        attempts: a.attempts,
      })),
    };
  }

  /**
   * Reset activity (allow retry)
   * @param {string} activityId - Activity ID
   * @returns {Promise<Object>} Reset activity
   */
  async resetActivity(activityId) {
    const activity = await prisma.lessonActivity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw new Error(`Activity not found: ${activityId}`);
    }

    return await prisma.lessonActivity.update({
      where: { id: activityId },
      data: {
        status: 'NOT_STARTED',
        startedAt: null,
        completedAt: null,
        score: null,
        submissionData: null,
        lastAccessedAt: new Date(),
      },
    });
  }
}

export const activityCompletionService = new ActivityCompletionService();
export default activityCompletionService;

