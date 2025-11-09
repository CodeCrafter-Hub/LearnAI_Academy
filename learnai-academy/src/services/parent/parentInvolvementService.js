import prisma from '../../lib/prisma.js';
import { groqClient } from '../ai/groqClient.js';
import { logInfo, logError } from '../../lib/logger.js';

/**
 * ParentInvolvementService - Features for parent involvement in learning
 * 
 * Provides:
 * - Progress reports
 * - Activity suggestions
 * - Learning tips
 * - Home activities
 * - Celebration milestones
 */

class ParentInvolvementService {
  /**
   * Generate parent progress report
   * @param {string} studentId - Student ID
   * @param {Object} options - Report options
   * @returns {Promise<Object>} Progress report
   */
  async generateProgressReport(studentId, options = {}) {
    const {
      timeRange = 'week', // week, month, quarter
      includeRecommendations = true,
    } = options;

    // Get student
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        progress: {
          where: {
            updatedAt: this.getTimeRangeFilter(timeRange),
          },
        },
        lessons: {
          where: {
            completedAt: this.getTimeRangeFilter(timeRange),
          },
          include: {
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
        },
        dailyActivity: {
          where: {
            activityDate: this.getTimeRangeFilter(timeRange),
          },
        },
      },
    });

    if (!student) {
      throw new Error(`Student not found: ${studentId}`);
    }

    // Calculate statistics
    const stats = this.calculateProgressStats(student, timeRange);

    // Generate personalized insights
    const insights = await this.generateInsights(student, stats);

    // Generate recommendations
    const recommendations = includeRecommendations
      ? await this.generateRecommendations(student, stats)
      : [];

    return {
      student: {
        name: `${student.firstName} ${student.lastName || ''}`.trim(),
        gradeLevel: this.getGradeName(student.gradeLevel),
        age: this.calculateAge(student.birthDate),
      },
      timeRange,
      stats,
      insights,
      recommendations,
      lessonsCompleted: student.lessons.length,
      activitiesCompleted: stats.totalActivities,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate home activity suggestions
   * @param {string} studentId - Student ID
   * @param {Object} options - Options
   * @returns {Promise<Array>} Activity suggestions
   */
  async generateHomeActivities(studentId, options = {}) {
    const {
      count = 5,
      subject = null,
    } = options;

    // Get student
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        progress: {
          include: {
            topic: true,
            subject: true,
          },
          orderBy: { lastPracticedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!student) {
      throw new Error(`Student not found: ${studentId}`);
    }

    // Get recent topics
    const recentTopics = student.progress
      .filter(p => !subject || p.subject.slug === subject)
      .slice(0, 3)
      .map(p => p.topic.name);

    const gradeLevel = student.gradeLevel;
    const gradeBand = this.getGradeBand(gradeLevel);

    // Generate home activities
    const activities = [];
    for (let i = 0; i < count; i++) {
      const topic = recentTopics[i % recentTopics.length] || 'general learning';
      
      const activity = await this.generateHomeActivity(topic, gradeLevel, gradeBand);
      activities.push(activity);
    }

    return activities;
  }

  /**
   * Generate single home activity
   * @param {string} topic - Topic
   * @param {number} gradeLevel - Grade level
   * @param {string} gradeBand - Grade band
   * @returns {Promise<Object>} Activity
   */
  async generateHomeActivity(topic, gradeLevel, gradeBand) {
    const prompt = `Create a simple home activity for a ${gradeLevel}th grade (${gradeBand}) student to practice ${topic}.

Requirements:
- Can be done at home with common materials
- Takes 10-20 minutes
- Fun and engaging
- Reinforces learning
- Parent-friendly instructions
- Age-appropriate

Provide:
- name: Activity name
- description: What to do
- materials: Simple materials list
- instructions: Step-by-step (parent-friendly)
- learningGoal: What it teaches
- tips: Tips for success

Format as JSON.`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: 'Generate the home activity as JSON.' },
    ], {
      model: groqClient.models.smart,
      temperature: 0.6,
      maxTokens: 1500,
    });

    return this.parseJSON(response.content);
  }

  /**
   * Generate learning tips for parents
   * @param {string} studentId - Student ID
   * @param {Object} options - Options
   * @returns {Promise<Array>} Learning tips
   */
  async generateLearningTips(studentId, options = {}) {
    const {
      count = 5,
      focus = 'general', // general, struggling, advanced
    } = options;

    // Get student progress
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        progress: {
          orderBy: { masteryLevel: 'asc' },
          take: 5,
        },
      },
    });

    if (!student) {
      throw new Error(`Student not found: ${studentId}`);
    }

    const gradeLevel = student.gradeLevel;
    const gradeBand = this.getGradeBand(gradeLevel);
    const avgMastery = student.progress.length > 0
      ? student.progress.reduce((sum, p) => sum + p.masteryLevel, 0) / student.progress.length
      : 0.5;

    const performanceLevel = avgMastery < 0.4 ? 'struggling' : avgMastery > 0.8 ? 'advanced' : 'general';

    const prompt = `Generate ${count} learning tips for parents of a ${gradeLevel}th grade (${gradeBand}) student.

STUDENT PERFORMANCE: ${performanceLevel}
FOCUS: ${focus}

Create tips that:
- Are practical and actionable
- Support learning at home
- Are age-appropriate
- Help with ${performanceLevel === 'struggling' ? 'challenges' : performanceLevel === 'advanced' ? 'advanced learning' : 'general progress'}
- Encourage positive learning habits

Format as JSON array of tips.`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: `Generate ${count} learning tips as JSON array.` },
    ], {
      model: groqClient.models.smart,
      temperature: 0.7,
      maxTokens: 2000,
    });

    return this.parseTips(response.content);
  }

  /**
   * Generate celebration milestones
   * @param {string} studentId - Student ID
   * @returns {Promise<Array>} Milestones
   */
  async generateCelebrationMilestones(studentId) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        progress: true,
        lessons: {
          where: { status: 'COMPLETED' },
        },
        achievements: true,
        dailyActivity: {
          orderBy: { activityDate: 'desc' },
          take: 30,
        },
      },
    });

    if (!student) {
      throw new Error(`Student not found: ${studentId}`);
    }

    const milestones = [];

    // Lesson completion milestones
    const lessonCount = student.lessons.length;
    if (lessonCount > 0 && lessonCount % 10 === 0) {
      milestones.push({
        type: 'lessons',
        message: `🎉 ${student.firstName} has completed ${lessonCount} lessons!`,
        achievement: `${lessonCount} Lessons Completed`,
        date: new Date().toISOString(),
      });
    }

    // Streak milestones
    const currentStreak = this.calculateStreak(student.dailyActivity);
    if (currentStreak > 0 && currentStreak % 7 === 0) {
      milestones.push({
        type: 'streak',
        message: `🔥 ${student.firstName} has a ${currentStreak}-day learning streak!`,
        achievement: `${currentStreak} Day Streak`,
        date: new Date().toISOString(),
      });
    }

    // Achievement milestones
    const achievementCount = student.achievements.length;
    if (achievementCount > 0 && achievementCount % 5 === 0) {
      milestones.push({
        type: 'achievements',
        message: `🏆 ${student.firstName} has earned ${achievementCount} achievements!`,
        achievement: `${achievementCount} Achievements`,
        date: new Date().toISOString(),
      });
    }

    return milestones;
  }

  /**
   * Calculate progress statistics
   */
  calculateProgressStats(student, timeRange) {
    const lessons = student.lessons || [];
    const activities = student.dailyActivity || [];

    return {
      totalLessons: lessons.length,
      completedLessons: lessons.filter(l => l.status === 'COMPLETED').length,
      totalTimeMinutes: activities.reduce((sum, a) => sum + a.minutesLearned, 0),
      averageSessionTime: activities.length > 0
        ? activities.reduce((sum, a) => sum + a.minutesLearned, 0) / activities.length
        : 0,
      totalActivities: activities.reduce((sum, a) => sum + a.sessionsCount, 0),
      currentStreak: this.calculateStreak(activities),
      subjectsStudied: new Set(lessons.map(l => l.lessonPlan?.unit?.curriculum?.subject?.name)).size,
    };
  }

  /**
   * Calculate learning streak
   */
  calculateStreak(dailyActivities) {
    if (!dailyActivities || dailyActivities.length === 0) return 0;

    const sorted = [...dailyActivities].sort((a, b) => 
      new Date(b.activityDate) - new Date(a.activityDate)
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const activity of sorted) {
      const activityDate = new Date(activity.activityDate);
      activityDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((currentDate - activityDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
        currentDate = activityDate;
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  }

  /**
   * Generate insights
   */
  async generateInsights(student, stats) {
    const gradeLevel = student.gradeLevel;
    const gradeBand = this.getGradeBand(gradeLevel);

    const prompt = `Generate 3-5 personalized learning insights for a ${gradeLevel}th grade (${gradeBand}) student.

STATISTICS:
- Lessons completed: ${stats.completedLessons}
- Time spent: ${stats.totalTimeMinutes} minutes
- Current streak: ${stats.currentStreak} days
- Subjects studied: ${stats.subjectsStudied}

Create insights that:
- Highlight strengths
- Identify growth areas
- Are encouraging and positive
- Are specific and actionable
- Use simple language for parents

Format as JSON array.`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: 'Generate insights as JSON array.' },
    ], {
      model: groqClient.models.smart,
      temperature: 0.7,
      maxTokens: 1500,
    });

    return this.parseJSON(response.content);
  }

  /**
   * Generate recommendations
   */
  async generateRecommendations(student, stats) {
    const gradeLevel = student.gradeLevel;

    const prompt = `Generate 3-5 learning recommendations for a ${gradeLevel}th grade student.

STATISTICS:
- Lessons completed: ${stats.completedLessons}
- Time spent: ${stats.totalTimeMinutes} minutes
- Current streak: ${stats.currentStreak} days

Create recommendations that:
- Build on current progress
- Are age-appropriate
- Encourage continued learning
- Include specific next steps

Format as JSON array.`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: 'Generate recommendations as JSON array.' },
    ], {
      model: groqClient.models.smart,
      temperature: 0.7,
      maxTokens: 1500,
    });

    return this.parseJSON(response.content);
  }

  /**
   * Get time range filter
   */
  getTimeRangeFilter(timeRange) {
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
        startDate = new Date(0); // All time
    }

    return {
      gte: startDate,
    };
  }

  /**
   * Calculate age from birth date
   */
  calculateAge(birthDate) {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Get grade name
   */
  getGradeName(grade) {
    if (grade === -1) return 'Preschool';
    if (grade === 0) return 'Pre-K';
    if (grade === 1) return '1st Grade';
    if (grade === 2) return '2nd Grade';
    if (grade === 3) return '3rd Grade';
    return `${grade}th Grade`;
  }

  /**
   * Get grade band
   */
  getGradeBand(grade) {
    if (grade <= -1) return 'Preschool';
    if (grade === 0) return 'Pre-K';
    if (grade <= 2) return 'K-2';
    if (grade <= 5) return '3-5';
    if (grade <= 8) return '6-8';
    return '9-12';
  }

  /**
   * Parse JSON
   */
  parseJSON(content) {
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/) || content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { raw: content };
    } catch (error) {
      return { raw: content };
    }
  }

  /**
   * Parse tips
   */
  parseTips(content) {
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      // Fallback: create array from text
      const lines = content.split('\n').filter(l => l.trim().match(/^[-*•]\s+/));
      return lines.map(line => ({
        tip: line.replace(/^[-*•]\s+/, '').trim(),
      }));
    } catch (error) {
      return [{ tip: content }];
    }
  }
}

export const parentInvolvementService = new ParentInvolvementService();
export default parentInvolvementService;

