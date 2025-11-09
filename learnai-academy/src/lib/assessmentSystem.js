/**
 * Adaptive Assessment and Testing System
 * Comprehensive testing with adaptive difficulty, diagnostics, and detailed analytics
 */

/**
 * Assessment types
 */
const ASSESSMENT_TYPES = {
  diagnostic: {
    name: 'Diagnostic Assessment',
    description: 'Identifies knowledge gaps and current skill level',
    adaptiveDifficulty: true,
    timeLimit: null,
    showFeedback: false,
    allowReview: false,
  },
  formative: {
    name: 'Formative Assessment',
    description: 'Ongoing assessment during learning',
    adaptiveDifficulty: false,
    timeLimit: null,
    showFeedback: true,
    allowReview: true,
  },
  summative: {
    name: 'Summative Assessment',
    description: 'Final test of mastery',
    adaptiveDifficulty: false,
    timeLimit: 60,
    showFeedback: false,
    allowReview: true,
  },
  practice: {
    name: 'Practice Quiz',
    description: 'Low-stakes practice',
    adaptiveDifficulty: true,
    timeLimit: null,
    showFeedback: true,
    allowReview: true,
  },
  placement: {
    name: 'Placement Test',
    description: 'Determines appropriate starting level',
    adaptiveDifficulty: true,
    timeLimit: 45,
    showFeedback: false,
    allowReview: false,
  },
};

/**
 * Question types supported
 */
const QUESTION_TYPES = {
  multipleChoice: 'Multiple Choice',
  trueFalse: 'True/False',
  shortAnswer: 'Short Answer',
  essay: 'Essay',
  fillBlank: 'Fill in the Blank',
  matching: 'Matching',
  ordering: 'Ordering',
  multiSelect: 'Multiple Select',
  numeric: 'Numeric Answer',
  dragDrop: 'Drag and Drop',
};

/**
 * AssessmentBuilder
 * Creates and manages assessments
 */
export class AssessmentBuilder {
  constructor(storage = 'localStorage') {
    this.storage = storage;
    this.assessments = new Map();
    this.loadData();
  }

  /**
   * Create new assessment
   */
  createAssessment(assessmentData) {
    const {
      title,
      description = '',
      type = 'practice',
      subject,
      topics = [],
      gradeLevel,
      createdBy,
      questionPool = [],
      totalQuestions = 20,
      passingScore = 70,
      allowMultipleAttempts = true,
      shuffleQuestions = true,
      shuffleOptions = true,
      showProgressBar = true,
      customSettings = {},
    } = assessmentData;

    const typeConfig = ASSESSMENT_TYPES[type] || ASSESSMENT_TYPES.practice;

    const assessment = {
      id: this.generateAssessmentId(),
      title,
      description,
      type,
      subject,
      topics,
      gradeLevel,
      createdBy,
      createdAt: new Date().toISOString(),

      // Settings from type
      ...typeConfig,

      // Override with custom settings
      ...customSettings,

      // Questions
      questionPool,
      totalQuestions,

      // Scoring
      passingScore,
      totalPoints: this.calculateTotalPoints(questionPool),

      // Behavior
      allowMultipleAttempts,
      shuffleQuestions,
      shuffleOptions,
      showProgressBar,

      // Status
      status: 'draft', // draft, active, archived
      published: false,

      // Analytics
      totalAttempts: 0,
      averageScore: 0,
      completionRate: 0,
    };

    this.assessments.set(assessment.id, assessment);
    this.saveData();

    return assessment;
  }

  /**
   * Add question to assessment
   */
  addQuestion(assessmentId, question) {
    const assessment = this.assessments.get(assessmentId);

    if (!assessment) {
      throw new Error('Assessment not found');
    }

    const questionWithId = {
      id: this.generateQuestionId(),
      ...question,
      addedAt: new Date().toISOString(),
    };

    assessment.questionPool.push(questionWithId);
    assessment.totalPoints = this.calculateTotalPoints(assessment.questionPool);

    this.saveData();

    return questionWithId;
  }

  /**
   * Create question
   */
  createQuestion(questionData) {
    const {
      type,
      text,
      subject,
      topic,
      difficulty = 5,
      points = 1,
      options = [],
      correctAnswer = null,
      correctAnswers = [],
      explanation = '',
      hints = [],
      media = null,
      tags = [],
    } = questionData;

    return {
      type,
      text,
      subject,
      topic,
      difficulty,
      points,
      options,
      correctAnswer,
      correctAnswers,
      explanation,
      hints,
      media,
      tags,
      statistics: {
        timesAnswered: 0,
        timesCorrect: 0,
        averageTime: 0,
      },
    };
  }

  /**
   * Publish assessment
   */
  publishAssessment(assessmentId) {
    const assessment = this.assessments.get(assessmentId);

    if (!assessment) {
      throw new Error('Assessment not found');
    }

    if (assessment.questionPool.length === 0) {
      throw new Error('Assessment must have at least one question');
    }

    assessment.status = 'active';
    assessment.published = true;
    assessment.publishedAt = new Date().toISOString();

    this.saveData();

    return assessment;
  }

  /**
   * Get assessment by ID
   */
  getAssessment(assessmentId) {
    return this.assessments.get(assessmentId);
  }

  /**
   * Get assessments by filters
   */
  getAssessments(filters = {}) {
    let assessments = Array.from(this.assessments.values());

    if (filters.type) {
      assessments = assessments.filter((a) => a.type === filters.type);
    }

    if (filters.subject) {
      assessments = assessments.filter((a) => a.subject === filters.subject);
    }

    if (filters.gradeLevel) {
      assessments = assessments.filter((a) => a.gradeLevel === filters.gradeLevel);
    }

    if (filters.status) {
      assessments = assessments.filter((a) => a.status === filters.status);
    }

    return assessments;
  }

  /**
   * Calculate total points
   */
  calculateTotalPoints(questions) {
    return questions.reduce((sum, q) => sum + (q.points || 1), 0);
  }

  /**
   * Generate IDs
   */
  generateAssessmentId() {
    return `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateQuestionId() {
    return `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  loadData() {
    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const data = localStorage.getItem('learnai_assessments');
        if (data) {
          const parsed = JSON.parse(data);
          this.assessments = new Map(Object.entries(parsed.assessments || {}));
        }
      }
    } catch (error) {
      console.error('Error loading assessment data:', error);
    }
  }

  saveData() {
    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const data = {
          assessments: Object.fromEntries(this.assessments),
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem('learnai_assessments', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error saving assessment data:', error);
    }
  }

  clearData() {
    this.assessments.clear();
    if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('learnai_assessments');
    }
  }
}

/**
 * AssessmentSession
 * Manages student taking an assessment
 */
export class AssessmentSession {
  constructor(assessment, student, storage = 'localStorage') {
    this.assessment = assessment;
    this.student = student;
    this.storage = storage;
    this.sessions = new Map();
    this.loadData();
  }

  /**
   * Start assessment session
   */
  startSession() {
    // Check if already has active session
    const existingSession = this.getActiveSession(this.student.id, this.assessment.id);
    if (existingSession) {
      return existingSession;
    }

    // Select questions
    let questions = [...this.assessment.questionPool];

    // Shuffle if enabled
    if (this.assessment.shuffleQuestions) {
      questions = this.shuffleArray(questions);
    }

    // Limit to totalQuestions
    questions = questions.slice(0, this.assessment.totalQuestions);

    // Shuffle options if enabled
    if (this.assessment.shuffleOptions) {
      questions = questions.map((q) => ({
        ...q,
        options: q.options ? this.shuffleArray([...q.options]) : q.options,
      }));
    }

    const session = {
      id: this.generateSessionId(),
      assessmentId: this.assessment.id,
      studentId: this.student.id,
      startTime: new Date().toISOString(),
      endTime: null,
      status: 'in-progress', // in-progress, completed, abandoned

      // Questions
      questions,
      currentQuestionIndex: 0,

      // Answers
      answers: {},

      // Timing
      timeSpent: 0,
      questionTimes: {},

      // Scoring
      score: 0,
      correctAnswers: 0,
      totalQuestions: questions.length,

      // Adaptive
      currentDifficulty: 5,
      difficultyAdjustments: [],

      // Flags
      flaggedQuestions: [],

      // Completion
      completed: false,
    };

    this.sessions.set(session.id, session);
    this.saveData();

    return session;
  }

  /**
   * Submit answer
   */
  submitAnswer(sessionId, questionId, answer, timeSpent = 0) {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status !== 'in-progress') {
      throw new Error('Session is not active');
    }

    const question = session.questions.find((q) => q.id === questionId);

    if (!question) {
      throw new Error('Question not found');
    }

    // Record answer
    session.answers[questionId] = {
      answer,
      submittedAt: new Date().toISOString(),
      timeSpent,
    };

    session.questionTimes[questionId] = timeSpent;
    session.timeSpent += timeSpent;

    // Check if correct
    const isCorrect = this.checkAnswer(question, answer);

    session.answers[questionId].correct = isCorrect;

    if (isCorrect) {
      session.correctAnswers++;
      session.score += question.points || 1;
    }

    // Adaptive difficulty adjustment
    if (this.assessment.adaptiveDifficulty) {
      this.adjustDifficulty(session, isCorrect, question.difficulty);
    }

    this.saveData();

    return {
      correct: isCorrect,
      explanation: this.assessment.showFeedback ? question.explanation : null,
      currentScore: session.score,
      questionsRemaining: session.totalQuestions - Object.keys(session.answers).length,
    };
  }

  /**
   * Check answer correctness
   */
  checkAnswer(question, studentAnswer) {
    switch (question.type) {
      case 'multipleChoice':
      case 'trueFalse':
      case 'shortAnswer':
        return this.normalizeAnswer(studentAnswer) === this.normalizeAnswer(question.correctAnswer);

      case 'multiSelect':
        const studentAnswers = Array.isArray(studentAnswer) ? studentAnswer : [studentAnswer];
        const correctAnswers = question.correctAnswers || [];

        if (studentAnswers.length !== correctAnswers.length) return false;

        return studentAnswers.every((a) => correctAnswers.includes(a));

      case 'numeric':
        const studentNum = parseFloat(studentAnswer);
        const correctNum = parseFloat(question.correctAnswer);
        const tolerance = question.tolerance || 0.01;

        return Math.abs(studentNum - correctNum) <= tolerance;

      case 'matching':
      case 'ordering':
        return JSON.stringify(studentAnswer) === JSON.stringify(question.correctAnswer);

      default:
        return false;
    }
  }

  /**
   * Adjust difficulty adaptively
   */
  adjustDifficulty(session, isCorrect, questionDifficulty) {
    const adjustment = isCorrect ? 0.5 : -0.5;
    session.currentDifficulty = Math.max(1, Math.min(10, session.currentDifficulty + adjustment));

    session.difficultyAdjustments.push({
      questionDifficulty,
      wasCorrect: isCorrect,
      newDifficulty: session.currentDifficulty,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Flag question for review
   */
  flagQuestion(sessionId, questionId) {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    if (!session.flaggedQuestions.includes(questionId)) {
      session.flaggedQuestions.push(questionId);
      this.saveData();
    }
  }

  /**
   * Complete session
   */
  completeSession(sessionId) {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    session.status = 'completed';
    session.completed = true;
    session.endTime = new Date().toISOString();

    // Calculate final metrics
    const totalPossiblePoints = session.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const percentage = (session.score / totalPossiblePoints) * 100;
    const passed = percentage >= this.assessment.passingScore;

    session.percentage = percentage;
    session.passed = passed;

    // Calculate grade
    session.grade = this.calculateGrade(percentage);

    // Time analysis
    const totalTime = session.timeSpent;
    const avgTimePerQuestion = totalTime / session.totalQuestions;

    session.metrics = {
      totalTime,
      avgTimePerQuestion,
      fastestQuestion: Math.min(...Object.values(session.questionTimes)),
      slowestQuestion: Math.max(...Object.values(session.questionTimes)),
    };

    // Topic analysis
    session.topicPerformance = this.analyzeTopicPerformance(session);

    this.saveData();

    return session;
  }

  /**
   * Calculate letter grade
   */
  calculateGrade(percentage) {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  /**
   * Analyze performance by topic
   */
  analyzeTopicPerformance(session) {
    const topicStats = {};

    session.questions.forEach((question) => {
      const topic = question.topic || 'General';

      if (!topicStats[topic]) {
        topicStats[topic] = {
          total: 0,
          correct: 0,
          points: 0,
          maxPoints: 0,
        };
      }

      topicStats[topic].total++;
      topicStats[topic].maxPoints += question.points || 1;

      const answer = session.answers[question.id];
      if (answer && answer.correct) {
        topicStats[topic].correct++;
        topicStats[topic].points += question.points || 1;
      }
    });

    // Calculate percentages
    Object.keys(topicStats).forEach((topic) => {
      const stats = topicStats[topic];
      stats.accuracy = (stats.correct / stats.total) * 100;
      stats.scorePercentage = (stats.points / stats.maxPoints) * 100;
    });

    return topicStats;
  }

  /**
   * Get active session
   */
  getActiveSession(studentId, assessmentId) {
    return Array.from(this.sessions.values()).find(
      (s) =>
        s.studentId === studentId &&
        s.assessmentId === assessmentId &&
        s.status === 'in-progress'
    );
  }

  /**
   * Get session results
   */
  getResults(sessionId) {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    return {
      session,
      summary: {
        score: session.score,
        percentage: session.percentage,
        grade: session.grade,
        passed: session.passed,
        correctAnswers: session.correctAnswers,
        totalQuestions: session.totalQuestions,
      },
      metrics: session.metrics,
      topicPerformance: session.topicPerformance,
      recommendations: this.generateRecommendations(session),
    };
  }

  /**
   * Generate study recommendations
   */
  generateRecommendations(session) {
    const recommendations = [];
    const topicPerf = session.topicPerformance || {};

    // Find weak topics
    Object.entries(topicPerf).forEach(([topic, stats]) => {
      if (stats.accuracy < 70) {
        recommendations.push({
          type: 'review',
          topic,
          priority: stats.accuracy < 50 ? 'high' : 'medium',
          message: `Review ${topic} - ${Math.round(stats.accuracy)}% accuracy`,
        });
      }
    });

    // Overall performance
    if (session.percentage < this.assessment.passingScore) {
      recommendations.push({
        type: 'retake',
        priority: 'high',
        message: 'Consider reviewing the material and retaking the assessment',
      });
    }

    return recommendations;
  }

  /**
   * Helper: Normalize answer
   */
  normalizeAnswer(answer) {
    return String(answer).toLowerCase().trim();
  }

  /**
   * Helper: Shuffle array
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Generate session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  loadData() {
    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const data = localStorage.getItem('learnai_assessment_sessions');
        if (data) {
          const parsed = JSON.parse(data);
          this.sessions = new Map(Object.entries(parsed.sessions || {}));
        }
      }
    } catch (error) {
      console.error('Error loading session data:', error);
    }
  }

  saveData() {
    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const data = {
          sessions: Object.fromEntries(this.sessions),
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem('learnai_assessment_sessions', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error saving session data:', error);
    }
  }

  clearData() {
    this.sessions.clear();
    if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('learnai_assessment_sessions');
    }
  }
}

/**
 * Example Usage
 */

/*
// Create assessment builder
const builder = new AssessmentBuilder();

// Create an assessment
const assessment = builder.createAssessment({
  title: 'Multiplication Mastery Test',
  type: 'summative',
  subject: 'math',
  topics: ['multiplication', 'division'],
  gradeLevel: 4,
  createdBy: 'teacher123',
  totalQuestions: 20,
  passingScore: 80,
});

// Add questions
builder.addQuestion(assessment.id, builder.createQuestion({
  type: 'multipleChoice',
  text: 'What is 7 × 8?',
  subject: 'math',
  topic: 'multiplication',
  difficulty: 4,
  points: 1,
  options: ['54', '56', '58', '60'],
  correctAnswer: '56',
  explanation: '7 × 8 = 56',
}));

// Publish assessment
builder.publishAssessment(assessment.id);

// Student takes assessment
const sessionManager = new AssessmentSession(assessment, { id: 'student123' });
const session = sessionManager.startSession();

console.log('Assessment started:', session.id);
console.log('First question:', session.questions[0].text);

// Submit answer
const result = sessionManager.submitAnswer(
  session.id,
  session.questions[0].id,
  '56',
  15 // 15 seconds
);

console.log('Correct:', result.correct);

// Complete assessment
const completed = sessionManager.completeSession(session.id);
console.log('Score:', completed.percentage + '%');
console.log('Grade:', completed.grade);
console.log('Passed:', completed.passed);

// Get detailed results
const results = sessionManager.getResults(session.id);
console.log('Recommendations:', results.recommendations);
*/

export { AssessmentBuilder, AssessmentSession, ASSESSMENT_TYPES, QUESTION_TYPES };
