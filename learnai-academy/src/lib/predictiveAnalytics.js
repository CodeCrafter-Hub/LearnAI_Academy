/**
 * Predictive Analytics and Early Intervention System
 * Uses advanced analytics to predict student outcomes and provide proactive support
 * GROUNDBREAKING: Identifies at-risk students before they fall behind
 */

/**
 * Risk factors and indicators
 */
const RISK_INDICATORS = {
  engagement: {
    weight: 0.25,
    factors: {
      streakLength: { threshold: 3, critical: 0 },
      sessionFrequency: { threshold: 0.5, critical: 0.2 }, // sessions per day
      sessionCompletion: { threshold: 0.7, critical: 0.4 },
      lastActivityDays: { threshold: 3, critical: 7 },
    },
  },
  performance: {
    weight: 0.30,
    factors: {
      averageAccuracy: { threshold: 70, critical: 50 },
      recentAccuracyTrend: { threshold: -5, critical: -15 }, // % change
      failureRate: { threshold: 0.3, critical: 0.5 },
      difficultyProgression: { threshold: 0, critical: -2 },
    },
  },
  learning: {
    weight: 0.20,
    factors: {
      topicCompletionRate: { threshold: 0.6, critical: 0.3 },
      reviewCompletion: { threshold: 0.8, critical: 0.5 },
      helpRequestFrequency: { threshold: 0.3, critical: 0.6 },
      timePerQuestion: { threshold: 2, critical: 4 }, // multiplier of expected
    },
  },
  behavioral: {
    weight: 0.15,
    factors: {
      interruptionRate: { threshold: 0.2, critical: 0.5 },
      habitCompletionRate: { threshold: 0.7, critical: 0.4 },
      focusScore: { threshold: 70, critical: 50 },
      frustrationIndicators: { threshold: 2, critical: 5 }, // per session
    },
  },
  social: {
    weight: 0.10,
    factors: {
      peerInteraction: { threshold: 0.5, critical: 0.1 },
      collaborationScore: { threshold: 60, critical: 30 },
      helpGiven: { threshold: 0.3, critical: 0 },
    },
  },
};

/**
 * Intervention strategies
 */
const INTERVENTION_STRATEGIES = {
  'engagement-critical': {
    priority: 'urgent',
    title: 'Critical Engagement Issue',
    actions: [
      { type: 'immediate', action: 'Contact parent/guardian immediately' },
      { type: 'immediate', action: 'Schedule one-on-one check-in' },
      { type: 'schedule', action: 'Create personalized motivation plan' },
      { type: 'monitor', action: 'Daily engagement tracking' },
    ],
  },
  'engagement-warning': {
    priority: 'high',
    title: 'Engagement Dropping',
    actions: [
      { type: 'immediate', action: 'Send encouraging notification' },
      { type: 'schedule', action: 'Introduce gamification elements' },
      { type: 'adjust', action: 'Reduce session length, increase frequency' },
    ],
  },
  'performance-critical': {
    priority: 'urgent',
    title: 'Performance Crisis',
    actions: [
      { type: 'immediate', action: 'Pause advancement, focus on review' },
      { type: 'immediate', action: 'Activate AI tutor for all questions' },
      { type: 'schedule', action: 'Create remediation plan' },
      { type: 'contact', action: 'Recommend external tutoring support' },
    ],
  },
  'performance-warning': {
    priority: 'high',
    title: 'Performance Decline Detected',
    actions: [
      { type: 'adjust', action: 'Reduce difficulty temporarily' },
      { type: 'schedule', action: 'Extra practice in weak areas' },
      { type: 'enable', action: 'Unlock all hints and help features' },
    ],
  },
  'learning-pace': {
    priority: 'medium',
    title: 'Learning Pace Issues',
    actions: [
      { type: 'adjust', action: 'Modify content difficulty' },
      { type: 'schedule', action: 'Break topics into smaller chunks' },
      { type: 'recommend', action: 'Adjust study schedule' },
    ],
  },
  'behavioral-concern': {
    priority: 'high',
    title: 'Behavioral Patterns of Concern',
    actions: [
      { type: 'immediate', action: 'Check for frustration/burnout' },
      { type: 'adjust', action: 'Implement more breaks' },
      { type: 'enable', action: 'Activate focus mode suggestions' },
      { type: 'recommend', action: 'Mental health resources if needed' },
    ],
  },
  'social-isolation': {
    priority: 'medium',
    title: 'Limited Peer Interaction',
    actions: [
      { type: 'recommend', action: 'Suggest joining study groups' },
      { type: 'schedule', action: 'Introduce peer challenges' },
      { type: 'enable', action: 'Unlock collaborative features' },
    ],
  },
};

/**
 * PredictiveAnalytics
 * Predicts student outcomes and identifies risks
 */
export class PredictiveAnalytics {
  constructor(learningHub) {
    this.learningHub = learningHub;
    this.predictions = new Map();
    this.riskProfiles = new Map();
  }

  /**
   * Analyze student and predict outcomes
   */
  async analyzeStudent(studentId, gradeLevel, timeWindow = 30) {
    // Gather comprehensive data
    const data = await this.gatherStudentData(studentId, gradeLevel, timeWindow);

    // Calculate risk scores
    const riskAnalysis = this.calculateRiskScore(data);

    // Predict outcomes
    const predictions = this.predictOutcomes(data, riskAnalysis);

    // Generate interventions
    const interventions = this.generateInterventions(riskAnalysis, data);

    // Calculate confidence
    const confidence = this.calculateConfidence(data);

    const analysis = {
      studentId,
      analyzedAt: new Date().toISOString(),
      timeWindow,
      riskScore: riskAnalysis.overallScore,
      riskLevel: riskAnalysis.level,
      predictions,
      riskFactors: riskAnalysis.factors,
      interventions,
      confidence,
      trends: this.analyzeTrends(data),
      earlyWarnings: this.identifyEarlyWarnings(data, riskAnalysis),
    };

    this.predictions.set(studentId, analysis);
    return analysis;
  }

  /**
   * Gather comprehensive student data
   */
  async gatherStudentData(studentId, gradeLevel, days) {
    const data = {
      studentId,
      gradeLevel,
      timeWindow: days,

      // Engagement metrics
      sessions: [],
      totalSessions: 0,
      averageSessionLength: 0,
      lastActivityDate: null,
      currentStreak: 0,
      longestStreak: 0,
      sessionCompletionRate: 0,

      // Performance metrics
      totalAttempts: 0,
      correctAttempts: 0,
      averageAccuracy: 0,
      accuracyBySubject: {},
      recentAccuracyTrend: 0,
      difficultyLevel: 5,

      // Learning metrics
      topicsStarted: 0,
      topicsCompleted: 0,
      topicCompletionRate: 0,
      reviewsCompleted: 0,
      reviewsDue: 0,
      reviewCompletionRate: 0,
      helpRequests: 0,
      hintsUsed: 0,

      // Behavioral metrics
      interruptions: 0,
      habitsCompleted: 0,
      habitsTotal: 0,
      focusScores: [],
      averageFocusScore: 0,
      frustrationEvents: 0,

      // Social metrics
      groupParticipation: 0,
      peerHelpGiven: 0,
      peerHelpReceived: 0,
      challengesParticipated: 0,

      // Time analysis
      studyTimeMinutes: 0,
      optimalStudyTime: null,
      studyPattern: null,
    };

    // In production, fetch from learning hub
    if (this.learningHub) {
      try {
        const dashboard = await this.learningHub.getStudentDashboard(studentId, gradeLevel);

        // Populate from dashboard
        data.currentStreak = dashboard.streak?.currentStreak || 0;
        data.longestStreak = dashboard.streak?.longestStreak || 0;
        data.topicsCompleted = dashboard.subjectProgress?.reduce((sum, s) => sum + (s.completedTopics || 0), 0) || 0;
        data.averageAccuracy = dashboard.overallPerformance?.overallAccuracy || 0;
        data.reviewsDue = dashboard.reviewsDue || 0;
        data.reviewsCompleted = dashboard.reviewStats?.total || 0;
      } catch (error) {
        console.error('Error gathering student data:', error);
      }
    }

    return data;
  }

  /**
   * Calculate overall risk score
   */
  calculateRiskScore(data) {
    const categoryScores = {};
    let overallScore = 0;

    // Calculate score for each category
    Object.entries(RISK_INDICATORS).forEach(([category, config]) => {
      const categoryScore = this.calculateCategoryScore(data, config.factors);
      categoryScores[category] = {
        score: categoryScore,
        weight: config.weight,
        weightedScore: categoryScore * config.weight,
      };

      overallScore += categoryScore * config.weight;
    });

    // Determine risk level
    const level = this.determineRiskLevel(overallScore);

    // Identify specific risk factors
    const factors = this.identifyRiskFactors(data, categoryScores);

    return {
      overallScore,
      level,
      categoryScores,
      factors,
    };
  }

  /**
   * Calculate category score
   */
  calculateCategoryScore(data, factors) {
    let score = 0;
    let factorCount = 0;

    Object.entries(factors).forEach(([factor, thresholds]) => {
      const value = this.getFactorValue(data, factor);
      const factorScore = this.evaluateFactor(value, thresholds);

      score += factorScore;
      factorCount++;
    });

    return factorCount > 0 ? score / factorCount : 0;
  }

  /**
   * Get factor value from data
   */
  getFactorValue(data, factor) {
    const mapping = {
      streakLength: data.currentStreak,
      sessionFrequency: data.totalSessions / data.timeWindow,
      sessionCompletion: data.sessionCompletionRate,
      lastActivityDays: data.lastActivityDate ? (new Date() - new Date(data.lastActivityDate)) / (1000 * 60 * 60 * 24) : 999,
      averageAccuracy: data.averageAccuracy,
      recentAccuracyTrend: data.recentAccuracyTrend,
      failureRate: 1 - (data.correctAttempts / Math.max(data.totalAttempts, 1)),
      difficultyProgression: data.difficultyLevel - 5,
      topicCompletionRate: data.topicCompletionRate,
      reviewCompletion: data.reviewCompletionRate,
      helpRequestFrequency: data.helpRequests / Math.max(data.totalSessions, 1),
      timePerQuestion: 1, // Would need actual data
      interruptionRate: data.interruptions / Math.max(data.totalSessions, 1),
      habitCompletionRate: data.habitsCompleted / Math.max(data.habitsTotal, 1),
      focusScore: data.averageFocusScore,
      frustrationIndicators: data.frustrationEvents / Math.max(data.totalSessions, 1),
      peerInteraction: (data.groupParticipation + data.peerHelpGiven + data.peerHelpReceived) / 10,
      collaborationScore: Math.min(100, data.groupParticipation * 20),
      helpGiven: data.peerHelpGiven / Math.max(data.totalSessions, 1),
    };

    return mapping[factor] !== undefined ? mapping[factor] : 0;
  }

  /**
   * Evaluate individual factor
   */
  evaluateFactor(value, thresholds) {
    // Returns 0-100 score (0 = critical risk, 100 = no risk)

    if (value <= thresholds.critical) {
      return 0; // Critical
    } else if (value <= thresholds.threshold) {
      // Linear interpolation between critical and threshold
      const range = thresholds.threshold - thresholds.critical;
      const position = value - thresholds.critical;
      return (position / range) * 50; // 0-50 range
    } else {
      // Above threshold - good
      return 50 + Math.min(50, (value - thresholds.threshold) / thresholds.threshold * 50);
    }
  }

  /**
   * Determine risk level
   */
  determineRiskLevel(score) {
    if (score >= 80) return 'low';
    if (score >= 60) return 'moderate';
    if (score >= 40) return 'high';
    return 'critical';
  }

  /**
   * Identify specific risk factors
   */
  identifyRiskFactors(data, categoryScores) {
    const factors = [];

    Object.entries(categoryScores).forEach(([category, scores]) => {
      if (scores.score < 50) {
        factors.push({
          category,
          severity: scores.score < 25 ? 'critical' : 'warning',
          score: scores.score,
          description: this.getFactorDescription(category, scores.score),
        });
      }
    });

    return factors.sort((a, b) => a.score - b.score);
  }

  /**
   * Get factor description
   */
  getFactorDescription(category, score) {
    const descriptions = {
      engagement: score < 25
        ? 'Student shows critically low engagement with the platform'
        : 'Student engagement is below optimal levels',
      performance: score < 25
        ? 'Academic performance is critically low and declining'
        : 'Performance indicators show concerning trends',
      learning: score < 25
        ? 'Learning pace and comprehension are significantly behind'
        : 'Learning metrics indicate difficulty keeping up',
      behavioral: score < 25
        ? 'Behavioral patterns suggest severe frustration or burnout'
        : 'Behavioral indicators show signs of struggle',
      social: score < 25
        ? 'Student is isolated with no peer interaction'
        : 'Limited social engagement may impact motivation',
    };

    return descriptions[category] || 'Concern detected';
  }

  /**
   * Predict future outcomes
   */
  predictOutcomes(data, riskAnalysis) {
    const predictions = [];

    // Predict grade outcomes (30 days)
    const gradeProjection = this.predictGradeOutcome(data, 30);
    predictions.push({
      type: 'grade',
      timeframe: '30 days',
      prediction: gradeProjection.grade,
      confidence: gradeProjection.confidence,
      basis: 'Current accuracy and performance trends',
    });

    // Predict engagement (7 days)
    const engagementProjection = this.predictEngagement(data, 7);
    predictions.push({
      type: 'engagement',
      timeframe: '7 days',
      prediction: engagementProjection.level,
      confidence: engagementProjection.confidence,
      basis: 'Recent activity patterns and streaks',
    });

    // Predict mastery timeline
    const masteryProjection = this.predictMasteryTimeline(data);
    predictions.push({
      type: 'mastery',
      timeframe: `${masteryProjection.days} days`,
      prediction: masteryProjection.topics,
      confidence: masteryProjection.confidence,
      basis: 'Current learning pace and topic completion rate',
    });

    // Predict risk of dropout
    const dropoutRisk = this.predictDropoutRisk(data, riskAnalysis);
    predictions.push({
      type: 'dropout-risk',
      timeframe: '90 days',
      prediction: dropoutRisk.risk,
      confidence: dropoutRisk.confidence,
      basis: 'Engagement trends and behavioral indicators',
    });

    return predictions;
  }

  /**
   * Predict grade outcome
   */
  predictGradeOutcome(data, days) {
    const currentAccuracy = data.averageAccuracy || 0;
    const trend = data.recentAccuracyTrend || 0;

    // Simple linear projection
    const projected = currentAccuracy + (trend * (days / 7));

    let grade;
    if (projected >= 90) grade = 'A';
    else if (projected >= 80) grade = 'B';
    else if (projected >= 70) grade = 'C';
    else if (projected >= 60) grade = 'D';
    else grade = 'F';

    const confidence = data.totalAttempts > 50 ? 0.85 : 0.6;

    return { grade, projected, confidence };
  }

  /**
   * Predict engagement
   */
  predictEngagement(data, days) {
    const currentStreak = data.currentStreak || 0;
    const sessionFrequency = data.totalSessions / data.timeWindow;

    let level;
    if (currentStreak >= 7 && sessionFrequency >= 0.8) {
      level = 'highly-engaged';
    } else if (currentStreak >= 3 && sessionFrequency >= 0.5) {
      level = 'engaged';
    } else if (currentStreak >= 1 && sessionFrequency >= 0.3) {
      level = 'moderately-engaged';
    } else {
      level = 'at-risk';
    }

    const confidence = data.totalSessions > 20 ? 0.8 : 0.5;

    return { level, confidence };
  }

  /**
   * Predict mastery timeline
   */
  predictMasteryTimeline(data) {
    const completionRate = data.topicCompletionRate || 0;
    const remaining = data.topicsStarted - data.topicsCompleted;

    if (completionRate === 0 || remaining === 0) {
      return { days: 0, topics: 0, confidence: 0.3 };
    }

    const averageDaysPerTopic = data.timeWindow / Math.max(data.topicsCompleted, 1);
    const projectedDays = Math.ceil(remaining * averageDaysPerTopic);

    return {
      days: projectedDays,
      topics: remaining,
      confidence: data.topicsCompleted > 5 ? 0.75 : 0.5,
    };
  }

  /**
   * Predict dropout risk
   */
  predictDropoutRisk(data, riskAnalysis) {
    const riskScore = riskAnalysis.overallScore;

    let risk;
    if (riskScore < 30) risk = 'high';
    else if (riskScore < 50) risk = 'moderate';
    else if (riskScore < 70) risk = 'low';
    else risk = 'very-low';

    const confidence = data.totalSessions > 30 ? 0.8 : 0.6;

    return { risk, confidence };
  }

  /**
   * Generate interventions
   */
  generateInterventions(riskAnalysis, data) {
    const interventions = [];

    riskAnalysis.factors.forEach((factor) => {
      const strategyKey = `${factor.category}-${factor.severity}`;
      const strategy = INTERVENTION_STRATEGIES[strategyKey];

      if (strategy) {
        interventions.push({
          ...strategy,
          triggeredBy: factor.category,
          score: factor.score,
          implementBy: this.calculateImplementationDate(strategy.priority),
        });
      }
    });

    // Sort by priority
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    interventions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return interventions;
  }

  /**
   * Calculate implementation date
   */
  calculateImplementationDate(priority) {
    const now = new Date();
    const days = {
      urgent: 0, // immediately
      high: 1,
      medium: 3,
      low: 7,
    };

    now.setDate(now.getDate() + (days[priority] || 7));
    return now.toISOString();
  }

  /**
   * Calculate prediction confidence
   */
  calculateConfidence(data) {
    // More data = higher confidence
    let confidence = 0.5; // baseline

    if (data.totalSessions > 50) confidence += 0.2;
    else if (data.totalSessions > 20) confidence += 0.1;

    if (data.totalAttempts > 200) confidence += 0.15;
    else if (data.totalAttempts > 100) confidence += 0.1;

    if (data.timeWindow >= 30) confidence += 0.1;

    return Math.min(0.95, confidence);
  }

  /**
   * Analyze trends
   */
  analyzeTrends(data) {
    return {
      engagement: data.currentStreak > data.longestStreak / 2 ? 'improving' : 'declining',
      performance: data.recentAccuracyTrend > 0 ? 'improving' : 'declining',
      learning: data.topicCompletionRate > 0.6 ? 'on-track' : 'behind',
    };
  }

  /**
   * Identify early warnings
   */
  identifyEarlyWarnings(data, riskAnalysis) {
    const warnings = [];

    // Engagement warnings
    if (data.currentStreak === 0) {
      warnings.push({
        type: 'engagement',
        severity: 'high',
        message: 'Streak broken - student may disengage',
        recommendation: 'Send encouragement notification today',
      });
    }

    // Performance warnings
    if (data.recentAccuracyTrend < -10) {
      warnings.push({
        type: 'performance',
        severity: 'high',
        message: 'Sharp decline in accuracy detected',
        recommendation: 'Reduce difficulty and increase support',
      });
    }

    // Learning pace warnings
    if (data.reviewCompletionRate < 0.5 && data.reviewsDue > 10) {
      warnings.push({
        type: 'retention',
        severity: 'medium',
        message: 'Reviews piling up - retention at risk',
        recommendation: 'Schedule review catch-up sessions',
      });
    }

    return warnings;
  }

  /**
   * Get student risk profile
   */
  getRiskProfile(studentId) {
    return this.predictions.get(studentId);
  }

  /**
   * Monitor cohort
   */
  async monitorCohort(studentIds, gradeLevel) {
    const analyses = await Promise.all(
      studentIds.map(id => this.analyzeStudent(id, gradeLevel))
    );

    return {
      totalStudents: studentIds.length,
      atRisk: analyses.filter(a => a.riskLevel === 'high' || a.riskLevel === 'critical').length,
      criticalCases: analyses.filter(a => a.riskLevel === 'critical'),
      needsAttention: analyses.filter(a => a.riskLevel === 'high'),
      averageRiskScore: analyses.reduce((sum, a) => sum + a.riskScore, 0) / analyses.length,
      analyses,
    };
  }
}

/**
 * Example Usage
 */

/*
// Initialize predictive analytics
const analytics = new PredictiveAnalytics(learningHub);

// Analyze a student
const analysis = await analytics.analyzeStudent('student123', 5, 30);

console.log('Risk Level:', analysis.riskLevel);
console.log('Risk Score:', analysis.riskScore);
console.log('Risk Factors:', analysis.riskFactors);
console.log('Predictions:', analysis.predictions);
console.log('Interventions:', analysis.interventions);

// Check specific predictions
const gradeProjection = analysis.predictions.find(p => p.type === 'grade');
console.log('30-day grade prediction:', gradeProjection.prediction);

const engagementProjection = analysis.predictions.find(p => p.type === 'engagement');
console.log('7-day engagement prediction:', engagementProjection.prediction);

// Get early warnings
if (analysis.earlyWarnings.length > 0) {
  console.log('Early Warnings:');
  analysis.earlyWarnings.forEach(w => {
    console.log(`- ${w.message}`);
    console.log(`  Recommendation: ${w.recommendation}`);
  });
}

// Apply interventions
if (analysis.interventions.length > 0) {
  console.log('Recommended Interventions:');
  analysis.interventions.forEach(i => {
    console.log(`- [${i.priority.toUpperCase()}] ${i.title}`);
    i.actions.forEach(a => {
      console.log(`  ${a.type}: ${a.action}`);
    });
  });
}

// Monitor entire class
const cohortAnalysis = await analytics.monitorCohort(
  ['student1', 'student2', 'student3', ...],
  5
);

console.log('Class Overview:');
console.log('Total Students:', cohortAnalysis.totalStudents);
console.log('At Risk:', cohortAnalysis.atRisk);
console.log('Critical Cases:', cohortAnalysis.criticalCases.length);
console.log('Average Risk Score:', cohortAnalysis.averageRiskScore);

// Identify students needing immediate attention
cohortAnalysis.criticalCases.forEach(student => {
  console.log(`URGENT: ${student.studentId} - Risk Score: ${student.riskScore}`);
  console.log('Immediate actions needed:', student.interventions[0].actions);
});
*/

export { PredictiveAnalytics, RISK_INDICATORS, INTERVENTION_STRATEGIES };
