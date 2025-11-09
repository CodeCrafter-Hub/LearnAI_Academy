/**
 * Student Performance Dashboard
 *
 * Personal analytics and progress tracking for students:
 * - Personal progress overview and insights
 * - Subject-wise performance tracking
 * - Goals and milestone management
 * - Study time and habit tracking
 * - Strengths and weaknesses analysis
 * - Achievement showcase and badges
 * - Performance trends and predictions
 * - Upcoming deadlines and priorities
 * - Personalized learning recommendations
 * - Peer comparison (anonymous, opt-in)
 * - Learning style insights
 * - Progress reports for parents
 *
 * Empowers students with data-driven self-awareness.
 */

import Anthropic from '@anthropic-ai/sdk';

// Goal types
const GOAL_TYPES = {
  GRADE: 'grade',
  COMPLETION: 'completion',
  MASTERY: 'mastery',
  STREAK: 'streak',
  TIME: 'time',
  SKILL: 'skill',
};

// Goal status
const GOAL_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  FAILED: 'failed',
  ABANDONED: 'abandoned',
};

// Performance levels
const PERFORMANCE_LEVELS = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  SATISFACTORY: 'satisfactory',
  NEEDS_IMPROVEMENT: 'needs_improvement',
  STRUGGLING: 'struggling',
};

// Study habit types
const STUDY_HABITS = {
  EARLY_BIRD: 'early_bird', // Studies best in morning
  NIGHT_OWL: 'night_owl', // Studies best at night
  CONSISTENT: 'consistent', // Regular schedule
  CRAMMER: 'crammer', // Last-minute studying
  SPRINTER: 'sprinter', // Short bursts
  MARATHONER: 'marathoner', // Long sessions
};

/**
 * Student Dashboard Manager
 */
export class StudentDashboardManager {
  constructor(storageKey = 'student_dashboards') {
    this.storageKey = storageKey;
    this.dashboards = this.loadDashboards();
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      dangerouslyAllowBrowser: true,
    });
    this.model = 'claude-sonnet-4-5-20250929';
  }

  /**
   * Load dashboards
   */
  loadDashboards() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading dashboards:', error);
      return {};
    }
  }

  /**
   * Save dashboards
   */
  saveDashboards() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.dashboards));
    } catch (error) {
      console.error('Error saving dashboards:', error);
    }
  }

  /**
   * Initialize student dashboard
   */
  initializeDashboard(studentId, studentData) {
    if (!this.dashboards[studentId]) {
      this.dashboards[studentId] = {
        studentId,
        name: studentData.name,
        grade: studentData.grade,
        createdAt: new Date().toISOString(),
        overview: {
          overallGPA: 0,
          totalStudyTime: 0,
          assignmentsCompleted: 0,
          currentStreak: 0,
          longestStreak: 0,
          achievementsUnlocked: 0,
        },
        subjects: {},
        goals: [],
        studySessions: [],
        studyHabits: null,
        strengths: [],
        weaknesses: [],
        achievements: [],
        upcomingDeadlines: [],
        recommendations: [],
        lastUpdated: new Date().toISOString(),
      };

      this.saveDashboards();
    }

    return this.dashboards[studentId];
  }

  /**
   * Get dashboard overview
   */
  async getDashboardOverview(studentId) {
    let dashboard = this.dashboards[studentId];
    if (!dashboard) {
      dashboard = this.initializeDashboard(studentId, { name: 'Student', grade: 9 });
    }

    // Update real-time calculations
    await this.updateOverview(studentId);

    return {
      overview: dashboard.overview,
      recentActivity: this.getRecentActivity(studentId),
      upcomingDeadlines: dashboard.upcomingDeadlines.slice(0, 5),
      activeGoals: dashboard.goals.filter(g => g.status === GOAL_STATUS.ACTIVE),
      topSubjects: this.getTopSubjects(studentId, 3),
      needsAttention: this.getSubjectsNeedingAttention(studentId),
      todaysInsight: await this.generateDailyInsight(studentId),
    };
  }

  /**
   * Update overview statistics
   */
  async updateOverview(studentId) {
    const dashboard = this.dashboards[studentId];
    if (!dashboard) return;

    // Calculate overall GPA
    const subjects = Object.values(dashboard.subjects);
    if (subjects.length > 0) {
      const totalGPA = subjects.reduce((sum, subj) => sum + (subj.currentGrade || 0), 0);
      dashboard.overview.overallGPA = totalGPA / subjects.length;
    }

    // Calculate total study time
    dashboard.overview.totalStudyTime = dashboard.studySessions.reduce(
      (sum, session) => sum + (session.duration || 0),
      0
    );

    // Calculate current streak
    dashboard.overview.currentStreak = this.calculateCurrentStreak(studentId);
    dashboard.overview.longestStreak = Math.max(
      dashboard.overview.longestStreak,
      dashboard.overview.currentStreak
    );

    // Count achievements
    dashboard.overview.achievementsUnlocked = dashboard.achievements.length;

    dashboard.lastUpdated = new Date().toISOString();
    this.saveDashboards();
  }

  /**
   * Calculate current learning streak
   */
  calculateCurrentStreak(studentId) {
    const dashboard = this.dashboards[studentId];
    if (!dashboard || dashboard.studySessions.length === 0) {
      return 0;
    }

    const sessions = [...dashboard.studySessions].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const session of sessions) {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  }

  /**
   * Track subject performance
   */
  trackSubjectPerformance(studentId, subjectId, performanceData) {
    const dashboard = this.dashboards[studentId];
    if (!dashboard) return;

    if (!dashboard.subjects[subjectId]) {
      dashboard.subjects[subjectId] = {
        subjectId,
        name: performanceData.name,
        currentGrade: 0,
        assignments: [],
        tests: [],
        participation: 0,
        timeSpent: 0,
        trend: 'stable',
        performanceLevel: PERFORMANCE_LEVELS.SATISFACTORY,
      };
    }

    const subject = dashboard.subjects[subjectId];

    // Update grade if provided
    if (performanceData.grade !== undefined) {
      subject.currentGrade = performanceData.grade;
    }

    // Add assignment
    if (performanceData.assignment) {
      subject.assignments.push({
        id: performanceData.assignment.id,
        title: performanceData.assignment.title,
        score: performanceData.assignment.score,
        maxScore: performanceData.assignment.maxScore,
        submittedAt: new Date().toISOString(),
      });

      dashboard.overview.assignmentsCompleted++;
    }

    // Add test
    if (performanceData.test) {
      subject.tests.push({
        id: performanceData.test.id,
        title: performanceData.test.title,
        score: performanceData.test.score,
        maxScore: performanceData.test.maxScore,
        takenAt: new Date().toISOString(),
      });
    }

    // Calculate performance level
    subject.performanceLevel = this.determinePerformanceLevel(subject.currentGrade);

    // Calculate trend
    subject.trend = this.calculateSubjectTrend(subject);

    this.saveDashboards();
    this.updateOverview(studentId);

    return subject;
  }

  /**
   * Determine performance level from grade
   */
  determinePerformanceLevel(grade) {
    if (grade >= 90) return PERFORMANCE_LEVELS.EXCELLENT;
    if (grade >= 80) return PERFORMANCE_LEVELS.GOOD;
    if (grade >= 70) return PERFORMANCE_LEVELS.SATISFACTORY;
    if (grade >= 60) return PERFORMANCE_LEVELS.NEEDS_IMPROVEMENT;
    return PERFORMANCE_LEVELS.STRUGGLING;
  }

  /**
   * Calculate subject trend
   */
  calculateSubjectTrend(subject) {
    const recentScores = [...subject.assignments, ...subject.tests]
      .slice(-5)
      .map(item => (item.score / item.maxScore) * 100);

    if (recentScores.length < 2) return 'stable';

    const firstHalf = recentScores.slice(0, Math.floor(recentScores.length / 2));
    const secondHalf = recentScores.slice(Math.floor(recentScores.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    if (secondAvg > firstAvg + 5) return 'improving';
    if (secondAvg < firstAvg - 5) return 'declining';
    return 'stable';
  }

  /**
   * Log study session
   */
  logStudySession(studentId, sessionData) {
    const dashboard = this.dashboards[studentId];
    if (!dashboard) return;

    const session = {
      id: `session_${Date.now()}`,
      subjectId: sessionData.subjectId,
      date: sessionData.date || new Date().toISOString(),
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      duration: sessionData.duration, // minutes
      focusScore: sessionData.focusScore || 0, // 0-100
      topicsStudied: sessionData.topics || [],
      productivity: sessionData.productivity || 'medium',
    };

    dashboard.studySessions.push(session);

    // Update subject time
    if (dashboard.subjects[sessionData.subjectId]) {
      dashboard.subjects[sessionData.subjectId].timeSpent += session.duration;
    }

    // Analyze study habits
    dashboard.studyHabits = this.analyzeStudyHabits(studentId);

    this.saveDashboards();
    this.updateOverview(studentId);

    return session;
  }

  /**
   * Analyze study habits
   */
  analyzeStudyHabits(studentId) {
    const dashboard = this.dashboards[studentId];
    if (!dashboard || dashboard.studySessions.length < 5) {
      return null;
    }

    const sessions = dashboard.studySessions;

    // Determine time preference
    const morningCount = sessions.filter(s => {
      const hour = new Date(s.startTime).getHours();
      return hour >= 6 && hour < 12;
    }).length;

    const nightCount = sessions.filter(s => {
      const hour = new Date(s.startTime).getHours();
      return hour >= 18 || hour < 6;
    }).length;

    let timePreference = STUDY_HABITS.CONSISTENT;
    if (morningCount > nightCount * 1.5) {
      timePreference = STUDY_HABITS.EARLY_BIRD;
    } else if (nightCount > morningCount * 1.5) {
      timePreference = STUDY_HABITS.NIGHT_OWL;
    }

    // Determine session style
    const avgDuration = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;
    const sessionStyle = avgDuration > 60 ? STUDY_HABITS.MARATHONER : STUDY_HABITS.SPRINTER;

    // Check consistency
    const dates = sessions.map(s => new Date(s.date).toDateString());
    const uniqueDates = new Set(dates);
    const isConsistent = uniqueDates.size / sessions.length > 0.7;

    return {
      timePreference,
      sessionStyle,
      isConsistent,
      averageSessionDuration: avgDuration,
      preferredStudyTime: this.getPreferredStudyTime(sessions),
      mostProductiveTime: this.getMostProductiveTime(sessions),
      consistency: isConsistent ? 'high' : 'low',
    };
  }

  /**
   * Get preferred study time
   */
  getPreferredStudyTime(sessions) {
    const hourCounts = {};

    sessions.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const maxHour = Object.entries(hourCounts).reduce((max, [hour, count]) =>
      count > (hourCounts[max] || 0) ? hour : max
    , 0);

    return `${maxHour}:00`;
  }

  /**
   * Get most productive time
   */
  getMostProductiveTime(sessions) {
    const hourProductivity = {};

    sessions.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      if (!hourProductivity[hour]) {
        hourProductivity[hour] = { total: 0, count: 0 };
      }
      hourProductivity[hour].total += session.focusScore || 50;
      hourProductivity[hour].count++;
    });

    const avgProductivity = {};
    Object.entries(hourProductivity).forEach(([hour, data]) => {
      avgProductivity[hour] = data.total / data.count;
    });

    const maxHour = Object.entries(avgProductivity).reduce((max, [hour, score]) =>
      score > (avgProductivity[max] || 0) ? hour : max
    , 0);

    return `${maxHour}:00`;
  }

  /**
   * Create student goal
   */
  createGoal(studentId, goalData) {
    const dashboard = this.dashboards[studentId];
    if (!dashboard) return;

    const goalId = `goal_${Date.now()}`;

    const goal = {
      id: goalId,
      type: goalData.type,
      title: goalData.title,
      description: goalData.description,
      target: goalData.target,
      current: 0,
      deadline: goalData.deadline,
      subjectId: goalData.subjectId,
      status: GOAL_STATUS.ACTIVE,
      createdAt: new Date().toISOString(),
      completedAt: null,
      milestones: goalData.milestones || [],
    };

    dashboard.goals.push(goal);
    this.saveDashboards();

    return goal;
  }

  /**
   * Update goal progress
   */
  updateGoalProgress(studentId, goalId, progress) {
    const dashboard = this.dashboards[studentId];
    if (!dashboard) return;

    const goal = dashboard.goals.find(g => g.id === goalId);
    if (!goal) return;

    goal.current = progress;

    // Check if completed
    if (progress >= goal.target) {
      goal.status = GOAL_STATUS.COMPLETED;
      goal.completedAt = new Date().toISOString();

      // Add achievement
      this.addAchievement(studentId, {
        type: 'goal_completed',
        title: `Goal Achieved: ${goal.title}`,
        description: `Completed goal on ${new Date().toLocaleDateString()}`,
        icon: '🎯',
      });
    }

    // Check if deadline passed without completion
    if (goal.deadline && new Date() > new Date(goal.deadline) && goal.status === GOAL_STATUS.ACTIVE) {
      goal.status = GOAL_STATUS.FAILED;
    }

    this.saveDashboards();

    return goal;
  }

  /**
   * Add achievement
   */
  addAchievement(studentId, achievementData) {
    const dashboard = this.dashboards[studentId];
    if (!dashboard) return;

    const achievement = {
      id: `achievement_${Date.now()}`,
      type: achievementData.type,
      title: achievementData.title,
      description: achievementData.description,
      icon: achievementData.icon || '🏆',
      earnedAt: new Date().toISOString(),
    };

    dashboard.achievements.push(achievement);
    this.saveDashboards();

    return achievement;
  }

  /**
   * Get top performing subjects
   */
  getTopSubjects(studentId, limit = 3) {
    const dashboard = this.dashboards[studentId];
    if (!dashboard) return [];

    return Object.values(dashboard.subjects)
      .sort((a, b) => b.currentGrade - a.currentGrade)
      .slice(0, limit)
      .map(subject => ({
        name: subject.name,
        grade: subject.currentGrade,
        trend: subject.trend,
        performanceLevel: subject.performanceLevel,
      }));
  }

  /**
   * Get subjects needing attention
   */
  getSubjectsNeedingAttention(studentId) {
    const dashboard = this.dashboards[studentId];
    if (!dashboard) return [];

    return Object.values(dashboard.subjects)
      .filter(
        subject =>
          subject.currentGrade < 70 ||
          subject.trend === 'declining' ||
          subject.performanceLevel === PERFORMANCE_LEVELS.STRUGGLING
      )
      .map(subject => ({
        name: subject.name,
        grade: subject.currentGrade,
        trend: subject.trend,
        issue: subject.currentGrade < 70 ? 'low_grade' : 'declining_performance',
      }));
  }

  /**
   * Analyze strengths and weaknesses
   */
  async analyzeStrengthsWeaknesses(studentId) {
    const dashboard = this.dashboards[studentId];
    if (!dashboard) return;

    const subjects = Object.values(dashboard.subjects);

    // Strengths: high-performing subjects
    dashboard.strengths = subjects
      .filter(s => s.currentGrade >= 85 && s.trend !== 'declining')
      .map(s => ({
        subject: s.name,
        grade: s.currentGrade,
        reason: 'Consistent high performance',
      }));

    // Weaknesses: struggling subjects
    dashboard.weaknesses = subjects
      .filter(s => s.currentGrade < 75 || s.trend === 'declining')
      .map(s => ({
        subject: s.name,
        grade: s.currentGrade,
        trend: s.trend,
        reason: s.currentGrade < 75 ? 'Below target grade' : 'Declining performance',
      }));

    this.saveDashboards();

    return {
      strengths: dashboard.strengths,
      weaknesses: dashboard.weaknesses,
    };
  }

  /**
   * Generate daily insight using AI
   */
  async generateDailyInsight(studentId) {
    const dashboard = this.dashboards[studentId];
    if (!dashboard) return null;

    try {
      const systemPrompt = `You are a supportive educational mentor providing daily insights to students about their learning journey. Be encouraging, specific, and actionable.`;

      const recentSessions = dashboard.studySessions.slice(-7);
      const activeGoals = dashboard.goals.filter(g => g.status === GOAL_STATUS.ACTIVE);
      const needsAttention = this.getSubjectsNeedingAttention(studentId);

      const userPrompt = `Generate a brief, encouraging daily insight for this student:

Recent Activity (last 7 days):
- Study sessions: ${recentSessions.length}
- Total study time: ${recentSessions.reduce((sum, s) => sum + s.duration, 0)} minutes
- Current streak: ${dashboard.overview.currentStreak} days
- Active goals: ${activeGoals.length}
- Subjects needing attention: ${needsAttention.map(s => s.name).join(', ') || 'None'}

Provide one specific, actionable insight or encouragement (2-3 sentences max).`;

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 200,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      return {
        text: response.content[0].text,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating insight:', error);
      return {
        text: "Keep up the great work! Remember, consistency is key to success.",
        generatedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Get recent activity
   */
  getRecentActivity(studentId, limit = 10) {
    const dashboard = this.dashboards[studentId];
    if (!dashboard) return [];

    const activities = [];

    // Add recent study sessions
    dashboard.studySessions.slice(-5).forEach(session => {
      activities.push({
        type: 'study_session',
        description: `Studied ${dashboard.subjects[session.subjectId]?.name || 'Unknown Subject'}`,
        timestamp: session.date,
        duration: session.duration,
      });
    });

    // Add recent achievements
    dashboard.achievements.slice(-3).forEach(achievement => {
      activities.push({
        type: 'achievement',
        description: achievement.title,
        timestamp: achievement.earnedAt,
        icon: achievement.icon,
      });
    });

    // Add completed goals
    dashboard.goals
      .filter(g => g.status === GOAL_STATUS.COMPLETED)
      .slice(-2)
      .forEach(goal => {
        activities.push({
          type: 'goal_completed',
          description: `Completed goal: ${goal.title}`,
          timestamp: goal.completedAt,
        });
      });

    // Sort by timestamp
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  /**
   * Get performance trends
   */
  getPerformanceTrends(studentId, subjectId, period = 30) {
    const dashboard = this.dashboards[studentId];
    if (!dashboard || !dashboard.subjects[subjectId]) {
      return null;
    }

    const subject = dashboard.subjects[subjectId];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - period);

    const recentAssignments = subject.assignments.filter(
      a => new Date(a.submittedAt) >= cutoffDate
    );

    const recentTests = subject.tests.filter(
      t => new Date(t.takenAt) >= cutoffDate
    );

    const allScores = [...recentAssignments, ...recentTests].map(item => ({
      date: item.submittedAt || item.takenAt,
      percentage: (item.score / item.maxScore) * 100,
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      subjectName: subject.name,
      currentGrade: subject.currentGrade,
      trend: subject.trend,
      scores: allScores,
      averageScore: allScores.length > 0
        ? allScores.reduce((sum, s) => sum + s.percentage, 0) / allScores.length
        : 0,
      improvementRate: this.calculateImprovementRate(allScores),
    };
  }

  /**
   * Calculate improvement rate
   */
  calculateImprovementRate(scores) {
    if (scores.length < 2) return 0;

    const firstScore = scores[0].percentage;
    const lastScore = scores[scores.length - 1].percentage;

    return lastScore - firstScore;
  }

  /**
   * Get dashboard
   */
  getDashboard(studentId) {
    return this.dashboards[studentId];
  }
}

/**
 * Goal Tracker
 */
export class GoalTracker {
  /**
   * Suggest goals based on student data
   */
  static suggestGoals(studentData) {
    const suggestions = [];

    // Grade improvement goals
    if (studentData.subjects) {
      Object.values(studentData.subjects).forEach(subject => {
        if (subject.currentGrade < 85) {
          suggestions.push({
            type: GOAL_TYPES.GRADE,
            title: `Improve ${subject.name} Grade`,
            description: `Raise your grade in ${subject.name} to ${Math.min(subject.currentGrade + 10, 100)}`,
            target: Math.min(subject.currentGrade + 10, 100),
            subjectId: subject.subjectId,
            priority: subject.currentGrade < 70 ? 'high' : 'medium',
          });
        }
      });
    }

    // Streak goals
    if (!studentData.overview || studentData.overview.currentStreak < 7) {
      suggestions.push({
        type: GOAL_TYPES.STREAK,
        title: 'Build a 7-Day Learning Streak',
        description: 'Study for at least 30 minutes every day for a week',
        target: 7,
        priority: 'medium',
      });
    }

    // Study time goals
    suggestions.push({
      type: GOAL_TYPES.TIME,
      title: 'Study 10 Hours This Month',
      description: 'Accumulate 10 hours of focused study time',
      target: 600, // minutes
      priority: 'medium',
    });

    return suggestions;
  }

  /**
   * Calculate goal completion percentage
   */
  static calculateCompletion(goal) {
    if (!goal.target) return 0;
    return Math.min((goal.current / goal.target) * 100, 100);
  }
}

export {
  GOAL_TYPES,
  GOAL_STATUS,
  PERFORMANCE_LEVELS,
  STUDY_HABITS,
};

export default StudentDashboardManager;
