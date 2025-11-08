/**
 * Teacher Analytics Dashboard System
 *
 * Comprehensive analytics and insights for educators:
 * - Class-wide performance analytics
 * - Individual student progress tracking
 * - At-risk student identification
 * - Skill mastery heatmaps
 * - Engagement metrics and trends
 * - Intervention recommendations
 * - Differentiation suggestions
 * - Assignment effectiveness analysis
 * - Time-on-task analytics
 * - Learning gap identification
 * - Predictive insights
 * - Exportable reports
 *
 * Empowers teachers with data-driven insights to support every student.
 */

// Dashboard views
const DASHBOARD_VIEWS = {
  OVERVIEW: 'overview',
  STUDENT_PROGRESS: 'student_progress',
  SKILL_MASTERY: 'skill_mastery',
  ENGAGEMENT: 'engagement',
  AT_RISK: 'at_risk',
  ASSIGNMENTS: 'assignments',
  INTERVENTIONS: 'interventions',
};

// Time periods for analytics
const TIME_PERIODS = {
  TODAY: 'today',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  SEMESTER: 'semester',
  YEAR: 'year',
  CUSTOM: 'custom',
};

// Performance levels
const PERFORMANCE_LEVELS = {
  EXCEEDING: 'exceeding', // > 90%
  MEETING: 'meeting', // 70-90%
  APPROACHING: 'approaching', // 50-70%
  BELOW: 'below', // < 50%
};

/**
 * Teacher Analytics Engine - Processes and aggregates data for insights
 */
export class TeacherAnalytics {
  constructor(storageKey = 'teacher_analytics') {
    this.storageKey = storageKey;
    this.cache = {};
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get class overview analytics
   */
  getClassOverview(classData, timePeriod = TIME_PERIODS.WEEK) {
    const cacheKey = `overview_${classData.classId}_${timePeriod}`;

    if (this.isCacheValid(cacheKey)) {
      return this.cache[cacheKey].data;
    }

    const { students, assignments, assessments } = classData;

    const overview = {
      classId: classData.classId,
      className: classData.className,
      timePeriod,
      generatedAt: new Date().toISOString(),

      // Class statistics
      totalStudents: students.length,
      activeStudents: students.filter(s => this.isActive(s, timePeriod)).length,

      // Performance distribution
      performanceDistribution: this.calculatePerformanceDistribution(students),

      // Average metrics
      averageScore: this.calculateAverageScore(students),
      averageEngagement: this.calculateAverageEngagement(students, timePeriod),
      averageTimeOnTask: this.calculateAverageTimeOnTask(students, timePeriod),

      // Completion rates
      assignmentCompletionRate: this.calculateCompletionRate(students, assignments),
      assessmentCompletionRate: this.calculateCompletionRate(students, assessments),

      // Progress metrics
      studentsImproving: this.countStudentsImproving(students),
      studentsAtRisk: this.identifyAtRiskStudents(students).length,
      studentsExceeding: students.filter(s => this.getPerformanceLevel(s) === PERFORMANCE_LEVELS.EXCEEDING).length,

      // Top performers and those needing support
      topPerformers: this.getTopPerformers(students, 5),
      needsSupport: this.getStudentsNeedingSupport(students, 5),

      // Skill mastery overview
      skillMasteryOverview: this.getSkillMasteryOverview(students),

      // Recent activity
      recentActivity: this.getRecentActivity(students, timePeriod),
    };

    this.updateCache(cacheKey, overview);
    return overview;
  }

  /**
   * Get individual student detailed analytics
   */
  getStudentAnalytics(studentId, studentData) {
    return {
      studentId,
      name: studentData.name,
      grade: studentData.grade,

      // Performance
      currentGrade: studentData.currentGrade || this.calculateCurrentGrade(studentData),
      performanceLevel: this.getPerformanceLevel(studentData),
      performanceTrend: this.calculateTrend(studentData.recentScores),

      // Skills
      skillsMastered: this.getSkillsMastered(studentData),
      skillsInProgress: this.getSkillsInProgress(studentData),
      skillGaps: this.identifySkillGaps(studentData),

      // Engagement
      engagementScore: this.calculateEngagementScore(studentData),
      participationRate: this.calculateParticipationRate(studentData),
      averageSessionDuration: this.calculateAverageSessionDuration(studentData),

      // Learning patterns
      learningStyle: studentData.learningStyle,
      peakProductivityTime: this.identifyPeakProductivityTime(studentData),
      strengthAreas: this.identifyStrengths(studentData),
      growthAreas: this.identifyGrowthAreas(studentData),

      // Social learning
      collaborationScore: this.calculateCollaborationScore(studentData),
      peerInteractions: studentData.peerInteractions || 0,

      // Predictions
      riskLevel: this.assessRiskLevel(studentData),
      predictedGrade: this.predictFutureGrade(studentData),

      // Recommendations
      recommendations: this.generateRecommendations(studentData),
    };
  }

  /**
   * Calculate performance distribution across class
   */
  calculatePerformanceDistribution(students) {
    const distribution = {
      [PERFORMANCE_LEVELS.EXCEEDING]: 0,
      [PERFORMANCE_LEVELS.MEETING]: 0,
      [PERFORMANCE_LEVELS.APPROACHING]: 0,
      [PERFORMANCE_LEVELS.BELOW]: 0,
    };

    students.forEach(student => {
      const level = this.getPerformanceLevel(student);
      distribution[level]++;
    });

    return distribution;
  }

  /**
   * Get performance level for student
   */
  getPerformanceLevel(student) {
    const score = student.averageScore || this.calculateAverageScore([student]);

    if (score >= 90) return PERFORMANCE_LEVELS.EXCEEDING;
    if (score >= 70) return PERFORMANCE_LEVELS.MEETING;
    if (score >= 50) return PERFORMANCE_LEVELS.APPROACHING;
    return PERFORMANCE_LEVELS.BELOW;
  }

  /**
   * Calculate average score
   */
  calculateAverageScore(students) {
    if (students.length === 0) return 0;

    const totalScore = students.reduce((sum, student) => {
      return sum + (student.averageScore || 0);
    }, 0);

    return Math.round(totalScore / students.length);
  }

  /**
   * Calculate average engagement
   */
  calculateAverageEngagement(students, timePeriod) {
    if (students.length === 0) return 0;

    const totalEngagement = students.reduce((sum, student) => {
      return sum + this.calculateEngagementScore(student, timePeriod);
    }, 0);

    return Math.round(totalEngagement / students.length);
  }

  /**
   * Calculate engagement score for student
   */
  calculateEngagementScore(student, timePeriod = TIME_PERIODS.WEEK) {
    // Engagement based on:
    // - Login frequency
    // - Time spent
    // - Activities completed
    // - Participation

    const weights = {
      loginFrequency: 0.25,
      timeSpent: 0.25,
      activitiesCompleted: 0.3,
      participation: 0.2,
    };

    const metrics = {
      loginFrequency: this.normalizeMetric(student.loginsPerWeek || 0, 7),
      timeSpent: this.normalizeMetric(student.weeklyMinutes || 0, 300), // 300 min/week target
      activitiesCompleted: this.normalizeMetric(student.activitiesPerWeek || 0, 10),
      participation: this.normalizeMetric(student.participationRate || 0, 100),
    };

    const score = Object.keys(weights).reduce((sum, key) => {
      return sum + metrics[key] * weights[key];
    }, 0);

    return Math.round(score * 100);
  }

  /**
   * Normalize metric to 0-1 scale
   */
  normalizeMetric(value, target) {
    return Math.min(1, value / target);
  }

  /**
   * Calculate average time on task
   */
  calculateAverageTimeOnTask(students, timePeriod) {
    if (students.length === 0) return 0;

    const totalTime = students.reduce((sum, student) => {
      return sum + (student.weeklyMinutes || 0);
    }, 0);

    return Math.round(totalTime / students.length);
  }

  /**
   * Calculate completion rate
   */
  calculateCompletionRate(students, assignments) {
    if (students.length === 0 || assignments.length === 0) return 0;

    let totalCompleted = 0;
    let totalAssigned = students.length * assignments.length;

    students.forEach(student => {
      const completed = assignments.filter(a =>
        student.completedAssignments?.includes(a.id)
      ).length;
      totalCompleted += completed;
    });

    return Math.round((totalCompleted / totalAssigned) * 100);
  }

  /**
   * Count students improving
   */
  countStudentsImproving(students) {
    return students.filter(student => {
      const trend = this.calculateTrend(student.recentScores);
      return trend === 'improving';
    }).length;
  }

  /**
   * Calculate trend from recent scores
   */
  calculateTrend(recentScores = []) {
    if (recentScores.length < 3) return 'insufficient_data';

    const recent = recentScores.slice(0, 3);
    const older = recentScores.slice(-3);

    const recentAvg = recent.reduce((sum, s) => sum + s, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s, 0) / older.length;

    if (recentAvg > olderAvg + 5) return 'improving';
    if (recentAvg < olderAvg - 5) return 'declining';
    return 'stable';
  }

  /**
   * Identify at-risk students
   */
  identifyAtRiskStudents(students) {
    return students.filter(student => {
      const riskLevel = this.assessRiskLevel(student);
      return riskLevel === 'high' || riskLevel === 'critical';
    }).map(student => ({
      ...student,
      riskLevel: this.assessRiskLevel(student),
      riskFactors: this.identifyRiskFactors(student),
      interventions: this.suggestInterventions(student),
    }));
  }

  /**
   * Assess risk level
   */
  assessRiskLevel(student) {
    const riskScore = this.calculateRiskScore(student);

    if (riskScore >= 75) return 'critical';
    if (riskScore >= 50) return 'high';
    if (riskScore >= 25) return 'moderate';
    return 'low';
  }

  /**
   * Calculate risk score (0-100)
   */
  calculateRiskScore(student) {
    let score = 0;

    // Low grades
    if ((student.averageScore || 0) < 50) score += 30;
    else if ((student.averageScore || 0) < 70) score += 15;

    // Declining trend
    if (this.calculateTrend(student.recentScores) === 'declining') score += 20;

    // Low engagement
    const engagement = this.calculateEngagementScore(student);
    if (engagement < 30) score += 25;
    else if (engagement < 50) score += 15;

    // Missing assignments
    const completionRate = student.assignmentCompletionRate || 100;
    if (completionRate < 50) score += 20;
    else if (completionRate < 75) score += 10;

    // Skill gaps
    const gaps = student.skillGaps || [];
    if (gaps.length > 5) score += 15;
    else if (gaps.length > 3) score += 10;

    return Math.min(100, score);
  }

  /**
   * Identify risk factors
   */
  identifyRiskFactors(student) {
    const factors = [];

    if ((student.averageScore || 0) < 70) {
      factors.push('Low academic performance');
    }

    if (this.calculateTrend(student.recentScores) === 'declining') {
      factors.push('Declining grades');
    }

    if (this.calculateEngagementScore(student) < 50) {
      factors.push('Low engagement');
    }

    if ((student.assignmentCompletionRate || 100) < 75) {
      factors.push('Missing assignments');
    }

    if ((student.skillGaps || []).length > 3) {
      factors.push('Multiple skill gaps');
    }

    if ((student.absences || 0) > 5) {
      factors.push('Attendance concerns');
    }

    return factors;
  }

  /**
   * Suggest interventions
   */
  suggestInterventions(student) {
    const interventions = [];
    const riskFactors = this.identifyRiskFactors(student);

    if (riskFactors.includes('Low academic performance')) {
      interventions.push({
        type: 'academic',
        action: 'Schedule one-on-one tutoring session',
        priority: 'high',
      });
    }

    if (riskFactors.includes('Low engagement')) {
      interventions.push({
        type: 'engagement',
        action: 'Connect with AI companion for motivation',
        priority: 'high',
      });
      interventions.push({
        type: 'engagement',
        action: 'Assign to collaborative study group',
        priority: 'medium',
      });
    }

    if (riskFactors.includes('Missing assignments')) {
      interventions.push({
        type: 'organizational',
        action: 'Implement assignment checklist system',
        priority: 'medium',
      });
    }

    if (riskFactors.includes('Multiple skill gaps')) {
      interventions.push({
        type: 'remediation',
        action: 'Enroll in targeted skill remediation program',
        priority: 'high',
      });
    }

    return interventions;
  }

  /**
   * Get top performers
   */
  getTopPerformers(students, limit = 5) {
    return students
      .filter(s => s.averageScore !== undefined)
      .sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0))
      .slice(0, limit)
      .map(s => ({
        id: s.id,
        name: s.name,
        score: s.averageScore,
        strengths: this.identifyStrengths(s),
      }));
  }

  /**
   * Get students needing support
   */
  getStudentsNeedingSupport(students, limit = 5) {
    return students
      .filter(s => {
        const riskLevel = this.assessRiskLevel(s);
        return riskLevel === 'high' || riskLevel === 'critical' ||
               (s.averageScore || 100) < 70;
      })
      .sort((a, b) => (a.averageScore || 0) - (b.averageScore || 0))
      .slice(0, limit)
      .map(s => ({
        id: s.id,
        name: s.name,
        score: s.averageScore,
        riskLevel: this.assessRiskLevel(s),
        needs: this.identifyGrowthAreas(s),
      }));
  }

  /**
   * Get skill mastery overview for class
   */
  getSkillMasteryOverview(students) {
    const skillMastery = {};

    students.forEach(student => {
      const mastered = student.skillsMastered || [];
      const inProgress = student.skillsInProgress || [];

      mastered.forEach(skill => {
        if (!skillMastery[skill]) {
          skillMastery[skill] = { mastered: 0, inProgress: 0, notStarted: 0 };
        }
        skillMastery[skill].mastered++;
      });

      inProgress.forEach(skill => {
        if (!skillMastery[skill]) {
          skillMastery[skill] = { mastered: 0, inProgress: 0, notStarted: 0 };
        }
        skillMastery[skill].inProgress++;
      });
    });

    // Calculate percentages
    Object.keys(skillMastery).forEach(skill => {
      const data = skillMastery[skill];
      data.notStarted = students.length - data.mastered - data.inProgress;
      data.masteryPercentage = Math.round((data.mastered / students.length) * 100);
    });

    return skillMastery;
  }

  /**
   * Get recent activity
   */
  getRecentActivity(students, timePeriod) {
    const activities = [];

    students.forEach(student => {
      if (student.recentActivities) {
        activities.push(...student.recentActivities.map(a => ({
          ...a,
          studentId: student.id,
          studentName: student.name,
        })));
      }
    });

    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20);
  }

  /**
   * Check if student is active in time period
   */
  isActive(student, timePeriod) {
    if (!student.lastActive) return false;

    const now = new Date();
    const lastActive = new Date(student.lastActive);
    const daysSince = (now - lastActive) / (1000 * 60 * 60 * 24);

    const thresholds = {
      [TIME_PERIODS.TODAY]: 1,
      [TIME_PERIODS.WEEK]: 7,
      [TIME_PERIODS.MONTH]: 30,
      [TIME_PERIODS.QUARTER]: 90,
    };

    return daysSince <= (thresholds[timePeriod] || 7);
  }

  /**
   * Identify strengths
   */
  identifyStrengths(student) {
    const strengths = [];

    if ((student.averageScore || 0) >= 90) {
      strengths.push('High academic achievement');
    }

    if (this.calculateEngagementScore(student) >= 80) {
      strengths.push('Highly engaged');
    }

    if ((student.assignmentCompletionRate || 0) >= 95) {
      strengths.push('Excellent completion rate');
    }

    if (this.calculateTrend(student.recentScores) === 'improving') {
      strengths.push('Showing improvement');
    }

    return strengths;
  }

  /**
   * Identify growth areas
   */
  identifyGrowthAreas(student) {
    const areas = [];

    if ((student.averageScore || 0) < 70) {
      areas.push('Academic performance');
    }

    if (this.calculateEngagementScore(student) < 50) {
      areas.push('Engagement and motivation');
    }

    if ((student.assignmentCompletionRate || 100) < 80) {
      areas.push('Assignment completion');
    }

    if ((student.skillGaps || []).length > 0) {
      areas.push('Skill gaps: ' + student.skillGaps.slice(0, 3).join(', '));
    }

    return areas;
  }

  /**
   * Calculate current grade
   */
  calculateCurrentGrade(studentData) {
    // Simplified grade calculation
    const score = studentData.averageScore || 0;

    if (score >= 93) return 'A';
    if (score >= 90) return 'A-';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 67) return 'D+';
    if (score >= 63) return 'D';
    if (score >= 60) return 'D-';
    return 'F';
  }

  /**
   * Get skills mastered
   */
  getSkillsMastered(student) {
    return student.skillsMastered || [];
  }

  /**
   * Get skills in progress
   */
  getSkillsInProgress(student) {
    return student.skillsInProgress || [];
  }

  /**
   * Identify skill gaps
   */
  identifySkillGaps(student) {
    return student.skillGaps || [];
  }

  /**
   * Calculate participation rate
   */
  calculateParticipationRate(student) {
    return student.participationRate || 0;
  }

  /**
   * Calculate average session duration
   */
  calculateAverageSessionDuration(student) {
    return student.averageSessionDuration || 0;
  }

  /**
   * Identify peak productivity time
   */
  identifyPeakProductivityTime(student) {
    return student.peakProductivityTime || 'afternoon';
  }

  /**
   * Calculate collaboration score
   */
  calculateCollaborationScore(student) {
    return student.collaborationScore || 0;
  }

  /**
   * Predict future grade
   */
  predictFutureGrade(student) {
    const trend = this.calculateTrend(student.recentScores);
    const current = student.averageScore || 0;

    if (trend === 'improving') {
      return Math.min(100, current + 5);
    } else if (trend === 'declining') {
      return Math.max(0, current - 5);
    }

    return current;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(student) {
    const recommendations = [];
    const riskLevel = this.assessRiskLevel(student);

    if (riskLevel === 'critical' || riskLevel === 'high') {
      recommendations.push({
        type: 'urgent',
        message: 'Schedule immediate intervention meeting',
        action: 'contact_parent',
      });
    }

    const growthAreas = this.identifyGrowthAreas(student);
    growthAreas.forEach(area => {
      recommendations.push({
        type: 'improvement',
        message: `Focus on ${area}`,
        action: 'assign_targeted_practice',
      });
    });

    return recommendations;
  }

  /**
   * Check if cache is valid
   */
  isCacheValid(key) {
    if (!this.cache[key]) return false;

    const age = Date.now() - this.cache[key].timestamp;
    return age < this.cacheExpiry;
  }

  /**
   * Update cache
   */
  updateCache(key, data) {
    this.cache[key] = {
      data,
      timestamp: Date.now(),
    };
  }

  /**
   * Export analytics to CSV
   */
  exportToCSV(analyticsData, type = 'overview') {
    // Simplified CSV export
    let csv = '';

    if (type === 'overview') {
      csv = 'Metric,Value\n';
      Object.entries(analyticsData).forEach(([key, value]) => {
        if (typeof value !== 'object') {
          csv += `${key},${value}\n`;
        }
      });
    }

    return csv;
  }
}

export { DASHBOARD_VIEWS, TIME_PERIODS, PERFORMANCE_LEVELS };
export default TeacherAnalytics;
