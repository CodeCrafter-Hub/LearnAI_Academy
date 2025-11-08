/**
 * Learning Integration Hub
 * Central orchestration layer that integrates all learning systems
 */

import { CurriculumService } from './curriculumService';
import { CurriculumStorage } from './curriculumStorage';
import { AITutor } from './aiTutor';
import { MistakeTracker, RemediationPlanner } from './mistakeAnalysis';
import { SpacedRepetitionSystem, ReviewSessionManager } from './spacedRepetition';
import { StreakTracker, HabitTracker } from './studyStreaks';
import { AccessibilityManager } from './accessibility';
import { AchievementTracker } from './achievementSystem';
import { PerformanceTracker } from './adaptiveDifficulty';

/**
 * LearningHub
 * Orchestrates all learning systems and provides unified API
 */
export class LearningHub {
  constructor(config = {}) {
    this.config = {
      anthropicApiKey: config.anthropicApiKey || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
      storageType: config.storageType || 'localStorage',
      enableAI: config.enableAI !== false,
      enableAnalytics: config.enableAnalytics !== false,
      ...config,
    };

    // Initialize all systems
    this.initializeSystems();

    // Session state
    this.currentSession = null;
    this.sessionStartTime = null;
  }

  /**
   * Initialize all learning systems
   */
  initializeSystems() {
    // Core curriculum
    this.curriculumStorage = new CurriculumStorage(this.config.storageType);
    this.curriculumService = new CurriculumService(this.curriculumStorage);

    // AI systems
    if (this.config.enableAI && this.config.anthropicApiKey) {
      this.aiTutor = new AITutor(this.config.anthropicApiKey);
    }

    // Learning optimization
    this.mistakeTracker = new MistakeTracker(this.config.storageType);
    this.remediationPlanner = new RemediationPlanner(this.mistakeTracker, this.curriculumService);
    this.spacedRepetition = new SpacedRepetitionSystem(this.config.storageType);
    this.reviewSessionManager = new ReviewSessionManager(this.spacedRepetition);
    this.performanceTracker = new PerformanceTracker();

    // Engagement systems
    this.streakTracker = new StreakTracker(this.config.storageType);
    this.habitTracker = new HabitTracker(this.config.storageType);
    this.achievementTracker = new AchievementTracker(this.config.storageType);

    // Accessibility
    this.accessibility = new AccessibilityManager();
  }

  /**
   * Start a comprehensive learning session
   */
  async startLearningSession(student, options = {}) {
    const {
      subject = null,
      topic = null,
      sessionType = 'practice', // practice, review, remediation, assessment
      duration = 30, // minutes
      targetQuestions = 20,
    } = options;

    try {
      // Record session start
      this.sessionStartTime = new Date();

      // Get curriculum and determine what to study
      let sessionContent;

      if (sessionType === 'review') {
        // Spaced repetition review
        sessionContent = await this.prepareReviewSession(student, subject, targetQuestions);
      } else if (sessionType === 'remediation') {
        // Targeted remediation
        sessionContent = await this.prepareRemediationSession(student, subject);
      } else if (topic) {
        // Specific topic practice
        sessionContent = await this.prepareTopicSession(student, subject, topic, targetQuestions);
      } else {
        // Adaptive practice
        sessionContent = await this.prepareAdaptiveSession(student, subject, targetQuestions);
      }

      // Create session object
      this.currentSession = {
        id: this.generateSessionId(),
        studentId: student.id,
        type: sessionType,
        subject: subject || sessionContent.subject,
        topic: sessionContent.topic,
        startTime: this.sessionStartTime,
        targetDuration: duration,
        targetQuestions,
        questions: sessionContent.questions,
        currentQuestionIndex: 0,
        responses: [],
        performance: {
          correct: 0,
          total: 0,
          accuracy: 0,
          averageTime: 0,
          difficultyProgression: [],
        },
        aiTutorInteractions: [],
        hintsUsed: 0,
        helpRequests: 0,
      };

      // Record streak activity
      this.streakTracker.recordActivity(student.id, {
        sessionType,
        subject: this.currentSession.subject,
      });

      // Update habits
      await this.updateHabitsOnSessionStart(student.id);

      return {
        success: true,
        session: this.currentSession,
        message: 'Session started successfully',
      };
    } catch (error) {
      console.error('Error starting learning session:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Prepare review session (spaced repetition)
   */
  async prepareReviewSession(student, subject, targetQuestions) {
    const reviewSession = this.reviewSessionManager.startSession(
      student.id,
      subject,
      { targetCards: targetQuestions }
    );

    // Convert cards to questions format
    const questions = reviewSession.cards.map((card) => ({
      id: card.questionId,
      cardId: card.id,
      topicId: card.topicId,
      text: card.conceptText,
      difficulty: card.difficulty,
      isReview: true,
      nextReviewAt: card.nextReviewAt,
    }));

    return {
      subject: subject || reviewSession.subject,
      topic: { name: 'Mixed Review', id: 'review' },
      questions,
      sessionManager: reviewSession,
    };
  }

  /**
   * Prepare remediation session
   */
  async prepareRemediationSession(student, subject) {
    const remediationPlan = await this.remediationPlanner.createRemediationPlan(
      student.id,
      subject,
      { maxSessions: 1, sessionDuration: 30 }
    );

    if (!remediationPlan.needsRemediation) {
      // Fall back to adaptive practice
      return this.prepareAdaptiveSession(student, subject, 20);
    }

    const session = remediationPlan.sessions[0];

    // Collect questions from all activities
    const questions = [];
    session.activities.forEach((activity) => {
      if (activity.exercises) {
        questions.push(...activity.exercises);
      }
    });

    return {
      subject,
      topic: { name: session.title, id: session.misconceptionId },
      questions,
      remediationPlan,
    };
  }

  /**
   * Prepare topic-specific session
   */
  async prepareTopicSession(student, subject, topicId, targetQuestions) {
    const topic = await this.curriculumService.getTopic(
      student.gradeLevel,
      subject,
      topicId
    );

    const currentDifficulty = this.performanceTracker.getCurrentDifficulty();

    const questions = await this.curriculumService.getQuestionsForTopic(topicId, {
      count: targetQuestions,
      adaptiveDifficulty: currentDifficulty,
    });

    return {
      subject,
      topic,
      questions,
    };
  }

  /**
   * Prepare adaptive session
   */
  async prepareAdaptiveSession(student, subject, targetQuestions) {
    const recommendedTopic = await this.curriculumService.getRecommendedTopic(
      student.gradeLevel,
      subject,
      student.progress || {}
    );

    const currentDifficulty = this.performanceTracker.getCurrentDifficulty();

    const questions = await this.curriculumService.getQuestionsForTopic(
      recommendedTopic.id,
      {
        count: targetQuestions,
        adaptiveDifficulty: currentDifficulty,
      }
    );

    return {
      subject,
      topic: recommendedTopic,
      questions,
    };
  }

  /**
   * Submit answer for current question
   */
  async submitAnswer(answer, metadata = {}) {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    const question = this.currentSession.questions[this.currentSession.currentQuestionIndex];
    const startTime = metadata.startTime || Date.now() - 30000; // Default 30s ago
    const timeSpent = (Date.now() - startTime) / 1000; // seconds

    // Check if answer is correct
    const isCorrect = this.checkAnswer(answer, question.correctAnswer);

    // Record response
    const response = {
      questionId: question.id,
      answer,
      correct: isCorrect,
      timeSpent,
      timestamp: new Date().toISOString(),
      hintsUsed: metadata.hintsUsed || 0,
      confidence: metadata.confidence || (isCorrect ? 0.9 : 0.3),
    };

    this.currentSession.responses.push(response);

    // Update performance tracking
    this.performanceTracker.recordAttempt(isCorrect, question.difficulty);

    this.currentSession.performance.total++;
    if (isCorrect) {
      this.currentSession.performance.correct++;
    }
    this.currentSession.performance.accuracy =
      (this.currentSession.performance.correct / this.currentSession.performance.total) * 100;

    // Record mistake if incorrect
    if (!isCorrect) {
      this.mistakeTracker.recordMistake(this.currentSession.studentId, {
        questionId: question.id,
        topicId: question.topicId || this.currentSession.topic.id,
        subject: this.currentSession.subject,
        gradeLevel: this.currentSession.gradeLevel,
        studentAnswer: answer,
        correctAnswer: question.correctAnswer,
        difficulty: question.difficulty,
      });
    }

    // Update spaced repetition if this is a review question
    if (question.cardId) {
      const quality = this.calculateQuality(isCorrect, metadata.confidence, timeSpent, 30);
      this.reviewSessionManager.reviewCardInSession(
        this.currentSession.reviewSessionId,
        question.cardId,
        { quality, timeSpent, correct: isCorrect }
      );
    }

    // Move to next question
    this.currentSession.currentQuestionIndex++;

    return {
      correct: isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      nextQuestion: this.getNextQuestion(),
      progress: {
        current: this.currentSession.currentQuestionIndex,
        total: this.currentSession.questions.length,
      },
      performance: this.currentSession.performance,
    };
  }

  /**
   * Get help from AI tutor
   */
  async getHelp(context = {}) {
    if (!this.currentSession || !this.aiTutor) {
      throw new Error('AI tutor not available');
    }

    const question = this.currentSession.questions[this.currentSession.currentQuestionIndex];
    const student = { id: this.currentSession.studentId, gradeLevel: this.currentSession.gradeLevel };

    // Count previous attempts on this question
    const attempts = this.currentSession.responses.filter(
      (r) => r.questionId === question.id
    ).length;

    const help = await this.aiTutor.getHelp(student, question, {
      attempts,
      topic: this.currentSession.topic,
      difficulty: question.difficulty,
      ...context,
    });

    // Record interaction
    this.currentSession.aiTutorInteractions.push({
      type: 'help',
      questionId: question.id,
      timestamp: new Date().toISOString(),
    });

    this.currentSession.helpRequests++;

    return help;
  }

  /**
   * Get hint for current question
   */
  async getHint(attemptNumber) {
    if (!this.currentSession || !this.aiTutor) {
      throw new Error('AI tutor not available');
    }

    const question = this.currentSession.questions[this.currentSession.currentQuestionIndex];
    const student = { id: this.currentSession.studentId, gradeLevel: this.currentSession.gradeLevel };

    const hint = await this.aiTutor.getHint(student, question, attemptNumber, {
      topic: this.currentSession.topic,
    });

    this.currentSession.hintsUsed++;

    return hint;
  }

  /**
   * Explain why answer was wrong
   */
  async explainMistake(studentAnswer, correctAnswer) {
    if (!this.currentSession || !this.aiTutor) {
      throw new Error('AI tutor not available');
    }

    const question = this.currentSession.questions[this.currentSession.currentQuestionIndex];
    const student = { id: this.currentSession.studentId, gradeLevel: this.currentSession.gradeLevel };

    return await this.aiTutor.explainMistake(student, question, studentAnswer, correctAnswer, {
      topic: this.currentSession.topic,
    });
  }

  /**
   * Get next question
   */
  getNextQuestion() {
    if (!this.currentSession) {
      return null;
    }

    if (this.currentSession.currentQuestionIndex >= this.currentSession.questions.length) {
      return null; // Session complete
    }

    return this.currentSession.questions[this.currentSession.currentQuestionIndex];
  }

  /**
   * Complete learning session
   */
  async completeSession() {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    const endTime = new Date();
    const duration = (endTime - this.sessionStartTime) / 1000 / 60; // minutes

    const sessionSummary = {
      ...this.currentSession,
      endTime,
      duration,
      completed: true,
    };

    // Calculate final stats
    const accuracy = sessionSummary.performance.accuracy;
    const totalQuestions = sessionSummary.responses.length;

    // Record performance data
    await this.curriculumService.recordPerformance(
      sessionSummary.studentId,
      sessionSummary.gradeLevel,
      sessionSummary.subject,
      sessionSummary.topic.id,
      {
        totalAttempts: totalQuestions,
        correctAttempts: sessionSummary.performance.correct,
        accuracy,
        sessionDuration: duration,
        averageDifficulty: this.calculateAverageDifficulty(),
        timestamp: endTime.toISOString(),
      }
    );

    // Add successful questions to spaced repetition
    const masteredQuestions = sessionSummary.responses
      .filter((r) => r.correct && r.timeSpent < 45) // Correct and quick
      .map((r) => sessionSummary.questions.find((q) => q.id === r.questionId));

    if (masteredQuestions.length > 0) {
      this.spacedRepetition.addCardsFromTopic(
        sessionSummary.studentId,
        sessionSummary.subject,
        sessionSummary.topic.id,
        sessionSummary.gradeLevel,
        masteredQuestions
      );
    }

    // Update habits
    await this.updateHabitsOnSessionComplete(
      sessionSummary.studentId,
      duration,
      accuracy
    );

    // Check achievements
    const newAchievements = this.achievementTracker.checkSessionAchievements({
      studentId: sessionSummary.studentId,
      accuracy,
      questionsCompleted: totalQuestions,
      perfect: accuracy === 100,
      fastCompletion: duration < 15,
      noHintsUsed: sessionSummary.hintsUsed === 0,
    });

    // Get recommendations for next session
    const recommendations = await this.getNextSessionRecommendations(
      sessionSummary.studentId,
      sessionSummary.subject
    );

    const result = {
      summary: sessionSummary,
      achievements: newAchievements,
      recommendations,
      streakInfo: this.streakTracker.getStreakStats(sessionSummary.studentId),
    };

    // Clear current session
    this.currentSession = null;
    this.sessionStartTime = null;

    return result;
  }

  /**
   * Get comprehensive student dashboard data
   */
  async getStudentDashboard(studentId, gradeLevel) {
    const subjects = ['math', 'reading', 'science', 'writing', 'coding'];

    const dashboardData = {
      studentId,
      gradeLevel,
      timestamp: new Date().toISOString(),

      // Streak and habits
      streak: this.streakTracker.getStreakStats(studentId),
      habits: this.habitTracker.getTodaysDashboard(studentId),

      // Achievements
      achievements: this.achievementTracker.getStudentAchievements(studentId),

      // Subject progress
      subjectProgress: await Promise.all(
        subjects.map(async (subject) => {
          try {
            const learningPath = await this.curriculumService.getLearningPath(
              gradeLevel,
              subject,
              { studentId }
            );

            return {
              subject,
              progress: (learningPath.completedTopics / learningPath.totalTopics) * 100,
              currentTopic: learningPath.currentTopic,
              nextTopic: learningPath.nextRecommended,
            };
          } catch (error) {
            return { subject, progress: 0, error: error.message };
          }
        })
      ),

      // Reviews due
      reviewsDue: this.spacedRepetition.getDueCards(studentId, null, 100).length,
      reviewStats: this.spacedRepetition.getReviewStats(studentId),

      // Mistake analysis
      mistakeAnalysis: this.mistakeTracker.analyzeMistakePatterns(studentId),

      // Performance
      overallPerformance: this.performanceTracker.getPerformanceReport(),
    };

    return dashboardData;
  }

  /**
   * Get recommendations for next session
   */
  async getNextSessionRecommendations(studentId, currentSubject = null) {
    const recommendations = [];

    // Check for reviews due
    const dueCards = this.spacedRepetition.getDueCards(studentId, null, 1);
    if (dueCards.length > 0) {
      recommendations.push({
        type: 'review',
        priority: 'high',
        title: 'Spaced Repetition Review',
        description: `${dueCards.length} items ready for review`,
        estimatedTime: Math.min(dueCards.length * 2, 30),
        icon: '♻️',
      });
    }

    // Check for remediation needs
    const mistakeAnalysis = this.mistakeTracker.analyzeMistakePatterns(studentId, currentSubject);
    if (mistakeAnalysis.patterns.length > 0) {
      const topPattern = mistakeAnalysis.patterns[0];
      if (topPattern.severity >= 70) {
        recommendations.push({
          type: 'remediation',
          priority: 'high',
          title: `Address ${topPattern.misconception}`,
          description: topPattern.description,
          estimatedTime: 20,
          icon: '🎯',
        });
      }
    }

    // Check habits
    const habitsDashboard = this.habitTracker.getTodaysDashboard(studentId);
    if (habitsDashboard.summary.remaining > 0) {
      recommendations.push({
        type: 'habit',
        priority: 'medium',
        title: 'Complete Daily Goals',
        description: `${habitsDashboard.summary.remaining} habit(s) remaining`,
        estimatedTime: 15,
        icon: '✅',
      });
    }

    // General practice
    recommendations.push({
      type: 'practice',
      priority: 'medium',
      title: 'Continue Learning',
      description: 'Practice new topics and concepts',
      estimatedTime: 30,
      icon: '📚',
    });

    return recommendations;
  }

  /**
   * Helper: Check answer correctness
   */
  checkAnswer(studentAnswer, correctAnswer) {
    // Normalize answers for comparison
    const normalize = (str) =>
      String(str).toLowerCase().trim().replace(/[^\w\s]/g, '');

    return normalize(studentAnswer) === normalize(correctAnswer);
  }

  /**
   * Helper: Calculate quality for spaced repetition
   */
  calculateQuality(correct, confidence, timeSpent, expectedTime) {
    if (!correct) {
      return confidence > 0.5 ? 2 : confidence > 0.2 ? 1 : 0;
    }

    const timeRatio = timeSpent / expectedTime;

    if (confidence >= 0.9 && timeRatio <= 0.7) {
      return 5;
    } else if (confidence >= 0.8 && timeRatio <= 1.0) {
      return 4;
    } else {
      return 3;
    }
  }

  /**
   * Helper: Calculate average difficulty
   */
  calculateAverageDifficulty() {
    if (!this.currentSession || this.currentSession.questions.length === 0) {
      return 5;
    }

    const sum = this.currentSession.questions.reduce(
      (acc, q) => acc + (q.difficulty || 5),
      0
    );

    return sum / this.currentSession.questions.length;
  }

  /**
   * Helper: Update habits on session start
   */
  async updateHabitsOnSessionStart(studentId) {
    const habits = this.habitTracker.getHabits(studentId, { status: 'active' });

    habits.forEach((habit) => {
      if (habit.unit === 'sessions') {
        this.habitTracker.recordProgress(habit.id, 1);
      }
    });
  }

  /**
   * Helper: Update habits on session complete
   */
  async updateHabitsOnSessionComplete(studentId, duration, accuracy) {
    const habits = this.habitTracker.getHabits(studentId, { status: 'active' });

    habits.forEach((habit) => {
      if (habit.unit === 'minutes') {
        this.habitTracker.recordProgress(habit.id, duration);
      } else if (habit.unit === 'percent' && habit.name.includes('Accuracy')) {
        this.habitTracker.recordProgress(habit.id, accuracy);
      }
    });
  }

  /**
   * Helper: Generate session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current session
   */
  getCurrentSession() {
    return this.currentSession;
  }

  /**
   * Pause session
   */
  pauseSession() {
    if (this.currentSession) {
      this.currentSession.paused = true;
      this.currentSession.pausedAt = new Date();
    }
  }

  /**
   * Resume session
   */
  resumeSession() {
    if (this.currentSession && this.currentSession.paused) {
      this.currentSession.paused = false;
      const pauseDuration = new Date() - new Date(this.currentSession.pausedAt);
      this.sessionStartTime = new Date(this.sessionStartTime.getTime() + pauseDuration);
    }
  }
}

/**
 * Example Usage
 */

/*
// Initialize the hub
const hub = new LearningHub({
  anthropicApiKey: 'your-key',
  storageType: 'localStorage',
});

// Start a learning session
const session = await hub.startLearningSession(
  { id: 'student123', gradeLevel: 5 },
  { subject: 'math', sessionType: 'practice', duration: 30 }
);

console.log('Session started:', session.session.id);
console.log('First question:', session.session.questions[0]);

// Submit an answer
const result = await hub.submitAnswer('42', {
  startTime: Date.now() - 15000, // 15 seconds ago
  confidence: 0.8,
});

console.log('Correct:', result.correct);
console.log('Next question:', result.nextQuestion);

// Get help if needed
if (!result.correct) {
  const help = await hub.getHelp();
  console.log('AI Help:', help.helpText);
}

// Complete session
const summary = await hub.completeSession();
console.log('Session complete!');
console.log('Accuracy:', summary.summary.performance.accuracy);
console.log('New achievements:', summary.achievements);
console.log('Streak:', summary.streakInfo.currentStreak);

// Get dashboard
const dashboard = await hub.getStudentDashboard('student123', 5);
console.log('Dashboard:', dashboard);
*/

export default LearningHub;
