/**
 * Mistake Analysis and Remediation System
 * Tracks student mistakes, identifies patterns, and creates targeted remediation plans
 */

/**
 * Common Misconception Database
 * Maps typical student errors to underlying misconceptions
 */
const MISCONCEPTION_PATTERNS = {
  math: {
    'negative-number-operations': {
      name: 'Negative Number Operations',
      description: 'Confusion about rules for adding/subtracting/multiplying negative numbers',
      commonErrors: [
        'Thinking two negatives always make a positive',
        'Confusion about negative times negative',
        'Adding negatives incorrectly',
      ],
      affectedTopics: ['integers', 'algebra', 'equations'],
      remediationStrategies: [
        'Number line visualization',
        'Real-world context (debts, temperatures)',
        'Pattern recognition exercises',
      ],
    },
    'fraction-operations': {
      name: 'Fraction Operations',
      description: 'Applying whole number rules to fractions',
      commonErrors: [
        'Adding numerators and denominators separately',
        'Multiplying denominators instead of cross-multiplying',
        'Not finding common denominators',
      ],
      affectedTopics: ['fractions', 'decimals', 'ratios'],
      remediationStrategies: [
        'Visual fraction models',
        'Pizza/pie analogies',
        'Step-by-step procedures',
      ],
    },
    'order-of-operations': {
      name: 'Order of Operations',
      description: 'Not following PEMDAS/BODMAS correctly',
      commonErrors: [
        'Working left to right without regard to operations',
        'Not handling parentheses first',
        'Confusion about multiplication/division order',
      ],
      affectedTopics: ['arithmetic', 'algebra', 'expressions'],
      remediationStrategies: [
        'PEMDAS mnemonics',
        'Color-coded operation highlighting',
        'Step-by-step breakdown',
      ],
    },
    'variable-misconception': {
      name: 'Variable Understanding',
      description: 'Treating variables as labels rather than unknowns',
      commonErrors: [
        'Thinking x always equals a specific number',
        'Not understanding variables can represent any value',
        'Confusion about solving for variables',
      ],
      affectedTopics: ['algebra', 'equations', 'functions'],
      remediationStrategies: [
        'Mystery box analogies',
        'Substitution exercises',
        'Real-world variable examples',
      ],
    },
  },
  reading: {
    'main-idea-vs-detail': {
      name: 'Main Idea vs Details',
      description: 'Confusing supporting details with main ideas',
      commonErrors: [
        'Selecting a detail as the main idea',
        'Not identifying the overarching theme',
        'Focusing on interesting but minor points',
      ],
      affectedTopics: ['comprehension', 'summarizing', 'analysis'],
      remediationStrategies: [
        'Umbrella analogy (main idea covers details)',
        'Topic sentence identification',
        'Paragraph outlining',
      ],
    },
    'inference-confusion': {
      name: 'Inference Confusion',
      description: 'Difficulty distinguishing explicit vs implicit information',
      commonErrors: [
        'Looking for directly stated answers',
        'Not using context clues',
        'Making unsupported inferences',
      ],
      affectedTopics: ['comprehension', 'critical-thinking', 'analysis'],
      remediationStrategies: [
        'Detective work analogies',
        'Evidence-based reasoning',
        'Think-aloud protocols',
      ],
    },
  },
  science: {
    'hypothesis-vs-theory': {
      name: 'Hypothesis vs Theory Confusion',
      description: 'Misunderstanding scientific terminology',
      commonErrors: [
        'Using "theory" to mean "guess"',
        'Not understanding hypothesis testing',
        'Confusing law with theory',
      ],
      affectedTopics: ['scientific-method', 'inquiry', 'experimentation'],
      remediationStrategies: [
        'Scientific method review',
        'Real-world scientific examples',
        'Terminology clarification',
      ],
    },
  },
  writing: {
    'run-on-sentences': {
      name: 'Run-on Sentences',
      description: 'Joining independent clauses incorrectly',
      commonErrors: [
        'Using comma splices',
        'Not using conjunctions properly',
        'Missing punctuation between clauses',
      ],
      affectedTopics: ['grammar', 'punctuation', 'sentence-structure'],
      remediationStrategies: [
        'FANBOYS conjunctions',
        'Semicolon usage',
        'Breaking into shorter sentences',
      ],
    },
    'subject-verb-agreement': {
      name: 'Subject-Verb Agreement',
      description: 'Mismatching subject and verb number',
      commonErrors: [
        'Using plural verb with singular subject',
        'Confusion with compound subjects',
        'Intervening phrases causing errors',
      ],
      affectedTopics: ['grammar', 'writing', 'editing'],
      remediationStrategies: [
        'Subject identification',
        'Crossing out prepositional phrases',
        'Verb conjugation practice',
      ],
    },
  },
};

/**
 * MistakeTracker
 * Tracks and analyzes student mistakes over time
 */
export class MistakeTracker {
  constructor(storage = 'localStorage') {
    this.storage = storage;
    this.mistakes = new Map();
    this.patterns = new Map();
    this.loadData();
  }

  /**
   * Record a mistake
   */
  recordMistake(studentId, mistake) {
    const {
      questionId,
      topicId,
      subject,
      gradeLevel,
      studentAnswer,
      correctAnswer,
      difficulty,
      timestamp = new Date().toISOString(),
    } = mistake;

    const mistakeRecord = {
      id: this.generateMistakeId(),
      studentId,
      questionId,
      topicId,
      subject,
      gradeLevel,
      studentAnswer,
      correctAnswer,
      difficulty,
      timestamp,
      analyzed: false,
      misconceptionId: null,
      remediationProvided: false,
    };

    // Store mistake
    if (!this.mistakes.has(studentId)) {
      this.mistakes.set(studentId, []);
    }
    this.mistakes.get(studentId).push(mistakeRecord);

    this.saveData();
    return mistakeRecord;
  }

  /**
   * Get all mistakes for a student
   */
  getMistakes(studentId, filters = {}) {
    const studentMistakes = this.mistakes.get(studentId) || [];

    let filtered = studentMistakes;

    if (filters.topicId) {
      filtered = filtered.filter((m) => m.topicId === filters.topicId);
    }

    if (filters.subject) {
      filtered = filtered.filter((m) => m.subject === filters.subject);
    }

    if (filters.startDate) {
      filtered = filtered.filter((m) => new Date(m.timestamp) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      filtered = filtered.filter((m) => new Date(m.timestamp) <= new Date(filters.endDate));
    }

    return filtered;
  }

  /**
   * Analyze mistake patterns for a student
   */
  analyzeMistakePatterns(studentId, subject = null) {
    const mistakes = this.getMistakes(studentId, subject ? { subject } : {});

    if (mistakes.length === 0) {
      return {
        totalMistakes: 0,
        patterns: [],
        recommendations: [],
      };
    }

    // Group by topic
    const byTopic = new Map();
    mistakes.forEach((mistake) => {
      if (!byTopic.has(mistake.topicId)) {
        byTopic.set(mistake.topicId, []);
      }
      byTopic.get(mistake.topicId).push(mistake);
    });

    // Identify patterns
    const patterns = [];
    const subjectKey = subject || mistakes[0].subject;

    // Check against known misconceptions
    const misconceptions = MISCONCEPTION_PATTERNS[subjectKey] || {};

    Object.entries(misconceptions).forEach(([key, misconception]) => {
      const relevantTopics = misconception.affectedTopics;
      const relevantMistakes = mistakes.filter((m) =>
        relevantTopics.some((topic) => m.topicId.includes(topic))
      );

      if (relevantMistakes.length >= 2) {
        // Pattern detected
        patterns.push({
          misconceptionId: key,
          misconception: misconception.name,
          description: misconception.description,
          occurrences: relevantMistakes.length,
          affectedTopics: relevantTopics,
          recentMistakes: relevantMistakes.slice(-3),
          severity: this.calculatePatternSeverity(relevantMistakes),
        });
      }
    });

    // Sort by severity
    patterns.sort((a, b) => b.severity - a.severity);

    // Generate recommendations
    const recommendations = this.generateRecommendations(patterns, subjectKey);

    return {
      totalMistakes: mistakes.length,
      patterns,
      recommendations,
      summary: this.generateSummary(patterns, mistakes),
    };
  }

  /**
   * Calculate pattern severity (0-100)
   */
  calculatePatternSeverity(mistakes) {
    const recency = this.calculateRecencyScore(mistakes);
    const frequency = Math.min(mistakes.length / 10, 1) * 40; // Max 40 points
    const difficulty = mistakes.reduce((sum, m) => sum + m.difficulty, 0) / mistakes.length / 10 * 30; // Max 30 points

    return Math.round(recency + frequency + difficulty);
  }

  /**
   * Calculate recency score (0-30)
   */
  calculateRecencyScore(mistakes) {
    const now = new Date();
    const recentMistakes = mistakes.filter((m) => {
      const daysSince = (now - new Date(m.timestamp)) / (1000 * 60 * 60 * 24);
      return daysSince <= 7;
    });

    return Math.min(recentMistakes.length / mistakes.length * 30, 30);
  }

  /**
   * Generate recommendations based on patterns
   */
  generateRecommendations(patterns, subject) {
    const recommendations = [];

    patterns.forEach((pattern) => {
      const misconception = MISCONCEPTION_PATTERNS[subject]?.[pattern.misconceptionId];

      if (misconception) {
        recommendations.push({
          priority: pattern.severity >= 70 ? 'high' : pattern.severity >= 40 ? 'medium' : 'low',
          title: `Address ${misconception.name}`,
          description: misconception.description,
          strategies: misconception.remediationStrategies,
          affectedTopics: misconception.affectedTopics,
          estimatedTime: this.estimateRemediationTime(pattern),
          practiceExercises: this.suggestPracticeExercises(pattern, subject),
        });
      }
    });

    return recommendations;
  }

  /**
   * Estimate remediation time in minutes
   */
  estimateRemediationTime(pattern) {
    const baseTime = 15; // Base 15 minutes
    const severityMultiplier = pattern.severity / 100;
    const occurrenceMultiplier = Math.log10(pattern.occurrences + 1);

    return Math.round(baseTime * (1 + severityMultiplier) * (1 + occurrenceMultiplier));
  }

  /**
   * Suggest practice exercises
   */
  suggestPracticeExercises(pattern, subject) {
    return {
      count: Math.min(pattern.occurrences * 2, 10),
      difficulty: 'review', // Start with review difficulty
      topics: pattern.affectedTopics,
      focusAreas: pattern.misconception,
    };
  }

  /**
   * Generate summary text
   */
  generateSummary(patterns, mistakes) {
    if (patterns.length === 0) {
      return 'No significant patterns detected. Keep practicing!';
    }

    const highPriority = patterns.filter((p) => p.severity >= 70).length;
    const topPattern = patterns[0];

    if (highPriority > 0) {
      return `${highPriority} area(s) need attention. Focus on ${topPattern.misconception} first.`;
    }

    return `${patterns.length} pattern(s) detected. Targeted practice recommended.`;
  }

  /**
   * Generate mistake ID
   */
  generateMistakeId() {
    return `mistake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Load data from storage
   */
  loadData() {
    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const data = localStorage.getItem('learnai_mistakes');
        if (data) {
          const parsed = JSON.parse(data);
          this.mistakes = new Map(Object.entries(parsed.mistakes || {}));
          this.patterns = new Map(Object.entries(parsed.patterns || {}));
        }
      }
    } catch (error) {
      console.error('Error loading mistake data:', error);
    }
  }

  /**
   * Save data to storage
   */
  saveData() {
    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const data = {
          mistakes: Object.fromEntries(this.mistakes),
          patterns: Object.fromEntries(this.patterns),
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem('learnai_mistakes', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error saving mistake data:', error);
    }
  }

  /**
   * Clear all data
   */
  clearData() {
    this.mistakes.clear();
    this.patterns.clear();
    if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('learnai_mistakes');
    }
  }
}

/**
 * RemediationPlanner
 * Creates personalized remediation plans based on mistake analysis
 */
export class RemediationPlanner {
  constructor(mistakeTracker, curriculumService) {
    this.mistakeTracker = mistakeTracker;
    this.curriculumService = curriculumService;
  }

  /**
   * Create remediation plan for student
   */
  async createRemediationPlan(studentId, subject, options = {}) {
    const {
      maxSessions = 5,
      sessionDuration = 20,
      difficulty = 'review',
    } = options;

    // Analyze mistakes
    const analysis = this.mistakeTracker.analyzeMistakePatterns(studentId, subject);

    if (analysis.patterns.length === 0) {
      return {
        planId: this.generatePlanId(),
        studentId,
        subject,
        needsRemediation: false,
        message: 'No remediation needed - great work!',
      };
    }

    // Create sessions for each pattern
    const sessions = [];
    let totalTime = 0;

    for (const pattern of analysis.patterns.slice(0, maxSessions)) {
      const session = await this.createRemediationSession(
        studentId,
        subject,
        pattern,
        sessionDuration
      );
      sessions.push(session);
      totalTime += session.estimatedDuration;
    }

    const plan = {
      planId: this.generatePlanId(),
      studentId,
      subject,
      needsRemediation: true,
      createdAt: new Date().toISOString(),
      totalSessions: sessions.length,
      estimatedTotalTime: totalTime,
      priority: analysis.patterns[0].severity >= 70 ? 'high' : 'medium',
      sessions,
      progressTracking: {
        completedSessions: 0,
        totalCorrect: 0,
        totalAttempts: 0,
        improvementRate: 0,
      },
    };

    return plan;
  }

  /**
   * Create individual remediation session
   */
  async createRemediationSession(studentId, subject, pattern, duration) {
    const session = {
      sessionId: this.generateSessionId(),
      title: `Practice: ${pattern.misconception}`,
      misconceptionId: pattern.misconceptionId,
      description: pattern.description,
      objectives: this.generateSessionObjectives(pattern),
      estimatedDuration: duration,
      activities: [],
      completed: false,
    };

    // Add explanation activity
    session.activities.push({
      type: 'explanation',
      title: 'Understanding the Concept',
      content: this.generateExplanationContent(pattern, subject),
      duration: Math.round(duration * 0.3),
    });

    // Add guided practice
    session.activities.push({
      type: 'guided-practice',
      title: 'Guided Practice',
      exercises: await this.generateGuidedExercises(pattern, subject, 3),
      duration: Math.round(duration * 0.4),
    });

    // Add independent practice
    session.activities.push({
      type: 'independent-practice',
      title: 'Try On Your Own',
      exercises: await this.generateIndependentExercises(pattern, subject, 5),
      duration: Math.round(duration * 0.3),
    });

    return session;
  }

  /**
   * Generate session objectives
   */
  generateSessionObjectives(pattern) {
    const misconception = Object.values(MISCONCEPTION_PATTERNS)
      .flatMap((subject) => Object.values(subject))
      .find((m) => m.name === pattern.misconception);

    if (!misconception) {
      return ['Review and practice this topic'];
    }

    return [
      `Understand common errors in ${misconception.name}`,
      'Learn correct strategies and approaches',
      'Practice with targeted exercises',
      'Build confidence in this area',
    ];
  }

  /**
   * Generate explanation content
   */
  generateExplanationContent(pattern, subject) {
    const misconception = MISCONCEPTION_PATTERNS[subject]?.[pattern.misconceptionId];

    if (!misconception) {
      return {
        overview: 'Let\'s review this concept carefully.',
        commonErrors: ['Let\'s identify what went wrong'],
        correctApproach: 'We\'ll practice the right way together',
      };
    }

    return {
      overview: misconception.description,
      commonErrors: misconception.commonErrors,
      strategies: misconception.remediationStrategies,
      examples: this.generateExamples(pattern, subject),
    };
  }

  /**
   * Generate examples
   */
  generateExamples(pattern, subject) {
    // This would ideally fetch from a database
    // For now, return placeholder structure
    return [
      {
        problem: 'Example problem 1',
        incorrectApproach: 'Common mistake',
        correctApproach: 'Right way to solve',
        explanation: 'Why the correct approach works',
      },
    ];
  }

  /**
   * Generate guided exercises (with scaffolding)
   */
  async generateGuidedExercises(pattern, subject, count) {
    // In production, this would query the curriculum service
    // For now, return structure
    return Array(count).fill(null).map((_, i) => ({
      id: `guided_${i}`,
      problem: `Guided problem ${i + 1}`,
      hints: [
        'First, identify the key elements',
        'Remember the strategy we discussed',
        'Check your work step by step',
      ],
      scaffolding: 'Step-by-step breakdown provided',
      difficulty: 'easy',
    }));
  }

  /**
   * Generate independent exercises
   */
  async generateIndependentExercises(pattern, subject, count) {
    // In production, this would query the curriculum service
    return Array(count).fill(null).map((_, i) => ({
      id: `independent_${i}`,
      problem: `Practice problem ${i + 1}`,
      difficulty: 'medium',
      topicId: pattern.affectedTopics[0],
    }));
  }

  /**
   * Track remediation progress
   */
  trackProgress(planId, sessionId, results) {
    const { correct, total, completed } = results;

    return {
      planId,
      sessionId,
      accuracy: (correct / total) * 100,
      completed,
      timestamp: new Date().toISOString(),
      needsMorePractice: correct / total < 0.8,
    };
  }

  /**
   * Generate plan ID
   */
  generatePlanId() {
    return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * MistakeVisualizer
 * Helps visualize mistake patterns for students and teachers
 */
export class MistakeVisualizer {
  constructor(mistakeTracker) {
    this.mistakeTracker = mistakeTracker;
  }

  /**
   * Generate mistake timeline data
   */
  generateTimeline(studentId, days = 30) {
    const mistakes = this.mistakeTracker.getMistakes(studentId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentMistakes = mistakes.filter(
      (m) => new Date(m.timestamp) >= cutoffDate
    );

    // Group by day
    const byDay = new Map();
    recentMistakes.forEach((mistake) => {
      const day = new Date(mistake.timestamp).toISOString().split('T')[0];
      if (!byDay.has(day)) {
        byDay.set(day, []);
      }
      byDay.get(day).push(mistake);
    });

    return Array.from(byDay.entries()).map(([date, mistakes]) => ({
      date,
      count: mistakes.length,
      byTopic: this.groupByTopic(mistakes),
      byDifficulty: this.groupByDifficulty(mistakes),
    }));
  }

  /**
   * Generate subject breakdown
   */
  generateSubjectBreakdown(studentId) {
    const mistakes = this.mistakeTracker.getMistakes(studentId);

    const bySubject = new Map();
    mistakes.forEach((mistake) => {
      if (!bySubject.has(mistake.subject)) {
        bySubject.set(mistake.subject, {
          total: 0,
          byTopic: new Map(),
        });
      }
      const subject = bySubject.get(mistake.subject);
      subject.total++;

      if (!subject.byTopic.has(mistake.topicId)) {
        subject.byTopic.set(mistake.topicId, 0);
      }
      subject.byTopic.set(mistake.topicId, subject.byTopic.get(mistake.topicId) + 1);
    });

    return Array.from(bySubject.entries()).map(([subject, data]) => ({
      subject,
      total: data.total,
      topics: Array.from(data.byTopic.entries())
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count),
    }));
  }

  /**
   * Generate improvement metrics
   */
  generateImprovementMetrics(studentId, topicId = null) {
    const mistakes = topicId
      ? this.mistakeTracker.getMistakes(studentId, { topicId })
      : this.mistakeTracker.getMistakes(studentId);

    if (mistakes.length < 10) {
      return {
        insufficient_data: true,
        message: 'Need more data to calculate improvement',
      };
    }

    // Split into first half and second half
    const midpoint = Math.floor(mistakes.length / 2);
    const firstHalf = mistakes.slice(0, midpoint);
    const secondHalf = mistakes.slice(midpoint);

    const firstHalfRate = firstHalf.length / midpoint;
    const secondHalfRate = secondHalf.length / (mistakes.length - midpoint);

    const improvementRate = ((firstHalfRate - secondHalfRate) / firstHalfRate) * 100;

    return {
      totalMistakes: mistakes.length,
      firstPeriodRate: firstHalfRate,
      secondPeriodRate: secondHalfRate,
      improvementRate: Math.round(improvementRate),
      trend: improvementRate > 10 ? 'improving' : improvementRate < -10 ? 'declining' : 'stable',
    };
  }

  /**
   * Group mistakes by topic
   */
  groupByTopic(mistakes) {
    const byTopic = new Map();
    mistakes.forEach((m) => {
      byTopic.set(m.topicId, (byTopic.get(m.topicId) || 0) + 1);
    });
    return Object.fromEntries(byTopic);
  }

  /**
   * Group mistakes by difficulty
   */
  groupByDifficulty(mistakes) {
    const byDifficulty = { easy: 0, medium: 0, hard: 0 };
    mistakes.forEach((m) => {
      if (m.difficulty <= 3) byDifficulty.easy++;
      else if (m.difficulty <= 7) byDifficulty.medium++;
      else byDifficulty.hard++;
    });
    return byDifficulty;
  }
}

/**
 * Example Usage
 */

/*
// Initialize system
const tracker = new MistakeTracker();
const planner = new RemediationPlanner(tracker, curriculumService);
const visualizer = new MistakeVisualizer(tracker);

// Record a mistake
tracker.recordMistake('student123', {
  questionId: 'q_456',
  topicId: 'integers',
  subject: 'math',
  gradeLevel: 6,
  studentAnswer: '-5',
  correctAnswer: '5',
  difficulty: 4,
});

// Analyze patterns
const analysis = tracker.analyzeMistakePatterns('student123', 'math');
console.log('Patterns found:', analysis.patterns.length);
console.log('Recommendations:', analysis.recommendations);

// Create remediation plan
const plan = await planner.createRemediationPlan('student123', 'math', {
  maxSessions: 3,
  sessionDuration: 20,
});

console.log('Sessions:', plan.totalSessions);
console.log('Estimated time:', plan.estimatedTotalTime, 'minutes');

// Visualize progress
const timeline = visualizer.generateTimeline('student123', 30);
const improvement = visualizer.generateImprovementMetrics('student123');
console.log('Improvement rate:', improvement.improvementRate + '%');
*/

export { MISCONCEPTION_PATTERNS };
