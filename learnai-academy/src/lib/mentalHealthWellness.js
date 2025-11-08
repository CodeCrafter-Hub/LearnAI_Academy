/**
 * Mental Health & Wellness Tracker
 *
 * Comprehensive student wellness monitoring and support:
 * - Stress and burnout detection through behavior analysis
 * - Mindfulness break suggestions and guided exercises
 * - Study-life balance monitoring and recommendations
 * - Anxiety management for test prep and deadlines
 * - Sleep and energy tracking
 * - Mood check-ins and emotional well-being
 * - Burnout prevention alerts
 * - Wellness resources and coping strategies
 * - Crisis detection and resource connections
 * - Positive psychology interventions
 *
 * Prioritizes student mental health alongside academic achievement.
 */

import Anthropic from '@anthropic-ai/sdk';

// Wellness metrics
const WELLNESS_METRICS = {
  STRESS_LEVEL: 'stress_level',
  MOOD: 'mood',
  ENERGY: 'energy',
  SLEEP_QUALITY: 'sleep_quality',
  ANXIETY: 'anxiety',
  MOTIVATION: 'motivation',
  SOCIAL_CONNECTION: 'social_connection',
};

// Stress levels
const STRESS_LEVELS = {
  LOW: 'low',
  MODERATE: 'moderate',
  HIGH: 'high',
  SEVERE: 'severe',
};

// Mood states
const MOOD_STATES = {
  GREAT: 'great',
  GOOD: 'good',
  OKAY: 'okay',
  NOT_GOOD: 'not_good',
  STRUGGLING: 'struggling',
};

// Intervention types
const INTERVENTION_TYPES = {
  MINDFULNESS_BREAK: 'mindfulness_break',
  BREATHING_EXERCISE: 'breathing_exercise',
  PHYSICAL_ACTIVITY: 'physical_activity',
  SOCIAL_CONNECTION: 'social_connection',
  PROFESSIONAL_HELP: 'professional_help',
  REDUCE_WORKLOAD: 'reduce_workload',
  SLEEP_HYGIENE: 'sleep_hygiene',
};

/**
 * Mental Health Tracker - Monitors student wellness
 */
export class MentalHealthTracker {
  constructor(storageKey = 'mental_health_data') {
    this.storageKey = storageKey;
    this.wellnessData = this.loadData();
  }

  /**
   * Load wellness data
   */
  loadData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading wellness data:', error);
      return {};
    }
  }

  /**
   * Save wellness data
   */
  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.wellnessData));
    } catch (error) {
      console.error('Error saving wellness data:', error);
    }
  }

  /**
   * Initialize student wellness profile
   */
  initializeProfile(studentId) {
    if (!this.wellnessData[studentId]) {
      this.wellnessData[studentId] = {
        studentId,
        checkIns: [],
        stressEvents: [],
        interventions: [],
        sleepLog: [],
        currentState: {
          stressLevel: STRESS_LEVELS.LOW,
          mood: MOOD_STATES.GOOD,
          energy: 70,
          lastCheckIn: null,
        },
        createdAt: new Date().toISOString(),
      };
      this.saveData();
    }
    return this.wellnessData[studentId];
  }

  /**
   * Record mood check-in
   */
  recordCheckIn(studentId, checkInData) {
    const profile = this.initializeProfile(studentId);

    const checkIn = {
      id: `checkin_${Date.now()}`,
      timestamp: new Date().toISOString(),
      mood: checkInData.mood,
      stressLevel: checkInData.stressLevel,
      energy: checkInData.energy,
      sleepHours: checkInData.sleepHours,
      notes: checkInData.notes || '',
      triggers: checkInData.triggers || [],
    };

    profile.checkIns.push(checkIn);

    // Update current state
    profile.currentState = {
      stressLevel: checkInData.stressLevel,
      mood: checkInData.mood,
      energy: checkInData.energy,
      lastCheckIn: checkIn.timestamp,
    };

    // Analyze and suggest interventions if needed
    const analysis = this.analyzeWellness(profile);
    if (analysis.needsIntervention) {
      this.suggestIntervention(studentId, analysis);
    }

    this.saveData();

    return {
      checkIn,
      analysis,
    };
  }

  /**
   * Analyze wellness state
   */
  analyzeWellness(profile) {
    const recentCheckIns = profile.checkIns.slice(-7); // Last 7 check-ins

    if (recentCheckIns.length === 0) {
      return {
        needsIntervention: false,
        overallWellness: 'unknown',
      };
    }

    // Calculate averages
    const avgStress = this.calculateAverageStress(recentCheckIns);
    const avgEnergy = recentCheckIns.reduce((sum, c) => sum + (c.energy || 50), 0) / recentCheckIns.length;
    const avgSleep = recentCheckIns.reduce((sum, c) => sum + (c.sleepHours || 7), 0) / recentCheckIns.length;

    // Count concerning moods
    const concerningMoods = recentCheckIns.filter(
      c => c.mood === MOOD_STATES.NOT_GOOD || c.mood === MOOD_STATES.STRUGGLING
    ).length;

    // Detect patterns
    const patterns = this.detectPatterns(recentCheckIns);

    // Determine if intervention needed
    const needsIntervention =
      avgStress >= 2.5 || // High average stress
      concerningMoods >= 3 || // Multiple bad mood days
      avgEnergy < 40 || // Consistently low energy
      avgSleep < 6 || // Sleep deprivation
      patterns.includes('declining_trend');

    // Overall wellness score (0-100)
    const wellnessScore = this.calculateWellnessScore({
      avgStress,
      avgEnergy,
      avgSleep,
      concerningMoods,
    });

    return {
      needsIntervention,
      overallWellness: this.categorizWeellnessScore(wellnessScore),
      wellnessScore,
      patterns,
      metrics: {
        averageStress: avgStress,
        averageEnergy: Math.round(avgEnergy),
        averageSleep: avgSleep.toFixed(1),
        concerningDays: concerningMoods,
      },
      recommendations: this.generateRecommendations({
        avgStress,
        avgEnergy,
        avgSleep,
        concerningMoods,
        patterns,
      }),
    };
  }

  /**
   * Calculate average stress
   */
  calculateAverageStress(checkIns) {
    const stressValues = {
      [STRESS_LEVELS.LOW]: 1,
      [STRESS_LEVELS.MODERATE]: 2,
      [STRESS_LEVELS.HIGH]: 3,
      [STRESS_LEVELS.SEVERE]: 4,
    };

    const total = checkIns.reduce((sum, c) => sum + (stressValues[c.stressLevel] || 2), 0);
    return total / checkIns.length;
  }

  /**
   * Detect wellness patterns
   */
  detectPatterns(checkIns) {
    const patterns = [];

    // Check for declining trend
    if (checkIns.length >= 5) {
      const recent = checkIns.slice(-3);
      const older = checkIns.slice(-6, -3);

      const recentAvgEnergy = recent.reduce((sum, c) => sum + (c.energy || 50), 0) / recent.length;
      const olderAvgEnergy = older.reduce((sum, c) => sum + (c.energy || 50), 0) / older.length;

      if (recentAvgEnergy < olderAvgEnergy - 15) {
        patterns.push('declining_trend');
      }
    }

    // Check for weekend effect
    const weekendStress = checkIns.filter(c => {
      const day = new Date(c.timestamp).getDay();
      return day === 0 || day === 6;
    });

    const weekdayStress = checkIns.filter(c => {
      const day = new Date(c.timestamp).getDay();
      return day > 0 && day < 6;
    });

    if (weekdayStress.length > 0 && weekendStress.length > 0) {
      const weekdayAvg = this.calculateAverageStress(weekdayStress);
      const weekendAvg = this.calculateAverageStress(weekendStress);

      if (weekdayAvg > weekendAvg + 1) {
        patterns.push('weekday_stress');
      }
    }

    // Check for sleep deprivation pattern
    const poorSleepDays = checkIns.filter(c => (c.sleepHours || 7) < 6).length;
    if (poorSleepDays >= 3) {
      patterns.push('sleep_deprivation');
    }

    return patterns;
  }

  /**
   * Calculate wellness score
   */
  calculateWellnessScore(metrics) {
    const { avgStress, avgEnergy, avgSleep, concerningMoods } = metrics;

    // Start with 100
    let score = 100;

    // Deduct for high stress (0-40 points)
    score -= (avgStress - 1) * 13; // Low=0, Moderate=-13, High=-26, Severe=-39

    // Deduct for low energy (0-30 points)
    if (avgEnergy < 50) {
      score -= (50 - avgEnergy) * 0.6;
    }

    // Deduct for poor sleep (0-20 points)
    if (avgSleep < 7) {
      score -= (7 - avgSleep) * 10;
    }

    // Deduct for concerning moods (0-10 points per day)
    score -= concerningMoods * 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Categorize wellness score
   */
  categorizeWellnessScore(score) {
    if (score >= 75) return 'thriving';
    if (score >= 50) return 'managing';
    if (score >= 25) return 'struggling';
    return 'crisis';
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(data) {
    const recommendations = [];

    if (data.avgStress >= 3) {
      recommendations.push({
        priority: 'high',
        type: 'stress_management',
        message: 'Your stress levels are high. Consider stress-reduction techniques.',
        actions: ['Take mindfulness breaks', 'Practice breathing exercises', 'Talk to someone'],
      });
    }

    if (data.avgEnergy < 40) {
      recommendations.push({
        priority: 'high',
        type: 'energy_boost',
        message: 'Your energy levels are low. Focus on rest and self-care.',
        actions: ['Get more sleep', 'Take regular breaks', 'Reduce commitments'],
      });
    }

    if (data.avgSleep < 6) {
      recommendations.push({
        priority: 'high',
        type: 'sleep_hygiene',
        message: 'You\'re not getting enough sleep. Prioritize rest.',
        actions: ['Set a regular bedtime', 'Avoid screens before bed', 'Create bedtime routine'],
      });
    }

    if (data.patterns.includes('weekday_stress')) {
      recommendations.push({
        priority: 'medium',
        type: 'work_life_balance',
        message: 'Weekday stress is high. Work on better balance.',
        actions: ['Schedule relaxation time', 'Set boundaries', 'Plan fun weekend activities'],
      });
    }

    return recommendations;
  }

  /**
   * Suggest intervention
   */
  suggestIntervention(studentId, analysis) {
    const profile = this.wellnessData[studentId];

    let interventionType = INTERVENTION_TYPES.MINDFULNESS_BREAK;

    // Determine intervention based on analysis
    if (analysis.wellnessScore < 25) {
      interventionType = INTERVENTION_TYPES.PROFESSIONAL_HELP;
    } else if (analysis.metrics.averageStress >= 3) {
      interventionType = INTERVENTION_TYPES.BREATHING_EXERCISE;
    } else if (analysis.metrics.averageEnergy < 40) {
      interventionType = INTERVENTION_TYPES.PHYSICAL_ACTIVITY;
    } else if (analysis.metrics.averageSleep < 6) {
      interventionType = INTERVENTION_TYPES.SLEEP_HYGIENE;
    }

    const intervention = {
      id: `intervention_${Date.now()}`,
      type: interventionType,
      suggestedAt: new Date().toISOString(),
      reason: analysis.recommendations[0]?.message || 'Wellness check',
      completed: false,
    };

    profile.interventions.push(intervention);
    this.saveData();

    return intervention;
  }

  /**
   * Detect burnout risk
   */
  detectBurnoutRisk(studentId) {
    const profile = this.wellnessData[studentId];
    if (!profile || profile.checkIns.length < 5) {
      return {
        risk: 'unknown',
        score: 0,
      };
    }

    const recentCheckIns = profile.checkIns.slice(-14); // Last 2 weeks

    // Burnout indicators
    const indicators = {
      chronicStress: this.calculateAverageStress(recentCheckIns) >= 2.5,
      lowEnergy: recentCheckIns.filter(c => (c.energy || 50) < 40).length >= 7,
      poorSleep: recentCheckIns.filter(c => (c.sleepHours || 7) < 6).length >= 5,
      negativeAffect: recentCheckIns.filter(c =>
        c.mood === MOOD_STATES.NOT_GOOD || c.mood === MOOD_STATES.STRUGGLING
      ).length >= 5,
      socialWithdrawal: false, // Would track actual social interactions
    };

    const burnoutScore = Object.values(indicators).filter(Boolean).length;

    let risk = 'low';
    if (burnoutScore >= 4) risk = 'high';
    else if (burnoutScore >= 2) risk = 'moderate';

    return {
      risk,
      score: burnoutScore,
      indicators,
      recommendations: this.getBurnoutRecommendations(risk),
    };
  }

  /**
   * Get burnout recommendations
   */
  getBurnoutRecommendations(risk) {
    if (risk === 'high') {
      return [
        'Immediately reduce workload and commitments',
        'Talk to a counselor or trusted adult',
        'Take a complete break day',
        'Reassess priorities and goals',
        'Seek professional support',
      ];
    } else if (risk === 'moderate') {
      return [
        'Schedule regular breaks and downtime',
        'Set clearer work-life boundaries',
        'Practice stress-reduction techniques',
        'Connect with supportive friends/family',
        'Consider adjusting your schedule',
      ];
    }

    return [
      'Maintain healthy habits',
      'Continue regular self-care',
      'Monitor stress levels',
    ];
  }

  /**
   * Get wellness dashboard
   */
  getWellnessDashboard(studentId) {
    const profile = this.initializeProfile(studentId);
    const analysis = this.analyzeWellness(profile);
    const burnoutRisk = this.detectBurnoutRisk(studentId);

    return {
      currentState: profile.currentState,
      analysis,
      burnoutRisk,
      recentCheckIns: profile.checkIns.slice(-7),
      activeInterventions: profile.interventions.filter(i => !i.completed),
      totalCheckIns: profile.checkIns.length,
    };
  }
}

/**
 * Mindfulness & Relaxation Guide
 */
export class MindfulnessGuide {
  constructor(apiKey) {
    this.client = new Anthropic({ apiKey });
    this.model = 'claude-sonnet-4-5-20250929';
  }

  /**
   * Get guided breathing exercise
   */
  getBreathingExercise(duration = 5) {
    const exercises = {
      5: {
        name: '4-7-8 Breathing',
        steps: [
          'Sit comfortably and close your eyes',
          'Breathe in through your nose for 4 counts',
          'Hold your breath for 7 counts',
          'Exhale completely through your mouth for 8 counts',
          'Repeat 4 times',
        ],
        duration: 5,
        benefits: 'Reduces anxiety and promotes calmness',
      },
      10: {
        name: 'Box Breathing',
        steps: [
          'Sit in a comfortable position',
          'Breathe in for 4 counts',
          'Hold for 4 counts',
          'Breathe out for 4 counts',
          'Hold for 4 counts',
          'Repeat for 10 minutes',
        ],
        duration: 10,
        benefits: 'Improves focus and reduces stress',
      },
    };

    return exercises[duration] || exercises[5];
  }

  /**
   * Get mindfulness activity
   */
  getMindfulnessActivity(type = 'quick') {
    const activities = {
      quick: {
        name: '5-4-3-2-1 Grounding',
        duration: 3,
        instructions: [
          'Notice 5 things you can see',
          'Notice 4 things you can touch',
          'Notice 3 things you can hear',
          'Notice 2 things you can smell',
          'Notice 1 thing you can taste',
        ],
        purpose: 'Brings you to the present moment and reduces anxiety',
      },
      moderate: {
        name: 'Body Scan Meditation',
        duration: 10,
        instructions: [
          'Lie down or sit comfortably',
          'Close your eyes and breathe naturally',
          'Bring attention to your toes',
          'Slowly move attention up through your body',
          'Notice sensations without judgment',
          'Complete scan at the top of your head',
        ],
        purpose: 'Releases physical tension and promotes relaxation',
      },
      extended: {
        name: 'Loving-Kindness Meditation',
        duration: 15,
        instructions: [
          'Sit comfortably and close your eyes',
          'Think of someone you care about',
          'Silently repeat: "May you be happy, may you be healthy, may you be safe"',
          'Extend these wishes to yourself',
          'Extend to neutral people',
          'Extend to all beings',
        ],
        purpose: 'Cultivates compassion and positive emotions',
      },
    };

    return activities[type] || activities.quick;
  }

  /**
   * Get personalized stress relief suggestion
   */
  async getStressReliefSuggestion(student, context) {
    const systemPrompt = `Suggest a quick, practical stress-relief activity for a grade ${student.grade} student.

Current situation: ${context.situation || 'General stress'}
Time available: ${context.timeAvailable || 5} minutes
Setting: ${context.setting || 'at home'}

Provide a specific, actionable suggestion that:
1. Can be done in the time available
2. Is appropriate for their age
3. Requires no special equipment
4. Will genuinely help reduce stress

Be supportive and practical.`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 300,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: 'What should I do to feel better?',
          },
        ],
      });

      return {
        suggestion: response.content[0].text,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting stress relief suggestion:', error);
      return {
        suggestion: 'Take 5 deep breaths, stretch your arms and legs, and get a glass of water. You\'ve got this!',
        error: true,
      };
    }
  }
}

/**
 * Sleep Tracker
 */
export class SleepTracker {
  constructor(storageKey = 'sleep_data') {
    this.storageKey = storageKey;
    this.sleepData = this.loadData();
  }

  /**
   * Load sleep data
   */
  loadData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading sleep data:', error);
      return {};
    }
  }

  /**
   * Save sleep data
   */
  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.sleepData));
    } catch (error) {
      console.error('Error saving sleep data:', error);
    }
  }

  /**
   * Log sleep
   */
  logSleep(studentId, sleepData) {
    if (!this.sleepData[studentId]) {
      this.sleepData[studentId] = [];
    }

    const log = {
      id: `sleep_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      bedtime: sleepData.bedtime,
      wakeTime: sleepData.wakeTime,
      hoursSlept: sleepData.hoursSlept,
      quality: sleepData.quality, // 1-5
      notes: sleepData.notes || '',
      timestamp: new Date().toISOString(),
    };

    this.sleepData[studentId].push(log);
    this.saveData();

    return {
      log,
      analysis: this.analyzeSleep(studentId),
    };
  }

  /**
   * Analyze sleep patterns
   */
  analyzeSleep(studentId) {
    const logs = this.sleepData[studentId] || [];
    if (logs.length === 0) {
      return {
        averageHours: 0,
        averageQuality: 0,
        trend: 'unknown',
      };
    }

    const recentLogs = logs.slice(-7);

    const avgHours = recentLogs.reduce((sum, log) => sum + log.hoursSlept, 0) / recentLogs.length;
    const avgQuality = recentLogs.reduce((sum, log) => sum + (log.quality || 3), 0) / recentLogs.length;

    // Detect trend
    let trend = 'stable';
    if (recentLogs.length >= 5) {
      const recent = recentLogs.slice(-3).reduce((sum, l) => sum + l.hoursSlept, 0) / 3;
      const older = recentLogs.slice(0, 3).reduce((sum, l) => sum + l.hoursSlept, 0) / 3;

      if (recent > older + 0.5) trend = 'improving';
      else if (recent < older - 0.5) trend = 'declining';
    }

    return {
      averageHours: avgHours.toFixed(1),
      averageQuality: avgQuality.toFixed(1),
      trend,
      recommendation: this.getSleepRecommendation(avgHours, avgQuality),
    };
  }

  /**
   * Get sleep recommendation
   */
  getSleepRecommendation(avgHours, avgQuality) {
    if (avgHours < 7) {
      return 'You need more sleep! Aim for 8-10 hours per night.';
    } else if (avgQuality < 3) {
      return 'Focus on sleep quality. Try a consistent bedtime routine.';
    } else if (avgHours >= 8 && avgQuality >= 4) {
      return 'Great sleep habits! Keep it up!';
    }

    return 'Your sleep is okay, but there\'s room for improvement.';
  }
}

export {
  WELLNESS_METRICS,
  STRESS_LEVELS,
  MOOD_STATES,
  INTERVENTION_TYPES,
};

export default MentalHealthTracker;
