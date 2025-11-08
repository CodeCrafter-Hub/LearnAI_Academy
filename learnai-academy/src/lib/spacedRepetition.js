/**
 * Spaced Repetition System
 * Implements evidence-based algorithms for long-term retention
 * Based on SM-2 algorithm with modifications for K-12 learners
 */

/**
 * Repetition intervals in days
 * Based on cognitive science research
 */
const DEFAULT_INTERVALS = [1, 3, 7, 14, 30, 60, 120, 240];

/**
 * Grade-specific interval adjustments
 * Younger students need more frequent reviews
 */
const GRADE_INTERVALS = {
  K: [1, 2, 4, 7, 14, 21, 35, 60],      // Shorter intervals for kindergarten
  1: [1, 2, 4, 7, 14, 21, 35, 60],
  2: [1, 2, 5, 8, 16, 25, 40, 70],
  3: [1, 3, 6, 10, 18, 30, 50, 90],
  4: [1, 3, 6, 12, 21, 35, 60, 100],
  5: [1, 3, 7, 14, 25, 40, 70, 120],
  6: [1, 3, 7, 14, 30, 50, 90, 150],    // Standard intervals start here
  7: [1, 3, 7, 14, 30, 60, 120, 180],
  8: [1, 3, 7, 14, 30, 60, 120, 240],
  9: [1, 3, 7, 14, 30, 60, 120, 240],
  10: [1, 3, 7, 14, 30, 60, 120, 240],
  11: [1, 3, 7, 14, 30, 60, 120, 240],
  12: [1, 3, 7, 14, 30, 60, 120, 240],
};

/**
 * Card represents a single learning item for spaced repetition
 */
class RepetitionCard {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.studentId = data.studentId;
    this.topicId = data.topicId;
    this.subject = data.subject;
    this.gradeLevel = data.gradeLevel;

    // Card content
    this.questionId = data.questionId;
    this.conceptText = data.conceptText; // For concept-based review
    this.difficulty = data.difficulty || 5;

    // SM-2 algorithm parameters
    this.easinessFactor = data.easinessFactor || 2.5; // 1.3 - 2.5
    this.interval = data.interval || 0; // Days until next review
    this.repetitions = data.repetitions || 0; // Number of successful reviews

    // Timing
    this.createdAt = data.createdAt || new Date().toISOString();
    this.lastReviewedAt = data.lastReviewedAt || null;
    this.nextReviewAt = data.nextReviewAt || new Date().toISOString();

    // Status
    this.status = data.status || 'new'; // new, learning, review, mastered
    this.retiredAt = data.retiredAt || null;

    // Performance tracking
    this.reviewHistory = data.reviewHistory || [];
    this.totalReviews = data.totalReviews || 0;
    this.successfulReviews = data.successfulReviews || 0;
  }

  generateId() {
    return `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate next review date based on performance
   * Using modified SM-2 algorithm
   */
  calculateNextReview(quality, gradeLevel) {
    // quality: 0-5 scale
    // 0-1: Total blackout, complete failure
    // 2: Incorrect but remembered something
    // 3: Correct with serious difficulty
    // 4: Correct with hesitation
    // 5: Perfect recall

    // Update easiness factor
    const oldEF = this.easinessFactor;
    this.easinessFactor = Math.max(
      1.3,
      oldEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    // Get grade-appropriate intervals
    const intervals = GRADE_INTERVALS[gradeLevel] || DEFAULT_INTERVALS;

    // Calculate interval based on quality
    if (quality < 3) {
      // Failed recall - start over
      this.repetitions = 0;
      this.interval = 0;
      this.status = 'learning';
      this.nextReviewAt = this.addDays(new Date(), 0.5); // Review later today
    } else {
      // Successful recall
      this.repetitions++;

      if (this.repetitions === 1) {
        this.interval = intervals[0];
        this.status = 'learning';
      } else if (this.repetitions === 2) {
        this.interval = intervals[1];
        this.status = 'learning';
      } else {
        // Use exponential growth with easiness factor
        const baseInterval = intervals[Math.min(this.repetitions - 1, intervals.length - 1)];
        this.interval = Math.round(baseInterval * this.easinessFactor);
        this.status = 'review';

        // Mark as mastered after 6+ successful reviews
        if (this.repetitions >= 6 && this.easinessFactor >= 2.3) {
          this.status = 'mastered';
        }
      }

      this.nextReviewAt = this.addDays(new Date(), this.interval);
    }

    this.lastReviewedAt = new Date().toISOString();
  }

  /**
   * Add days to date
   */
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString();
  }

  /**
   * Record a review
   */
  recordReview(quality, timeSpent, correct) {
    this.totalReviews++;
    if (correct) {
      this.successfulReviews++;
    }

    this.reviewHistory.push({
      timestamp: new Date().toISOString(),
      quality,
      timeSpent,
      correct,
      interval: this.interval,
      easinessFactor: this.easinessFactor,
    });

    // Keep only last 50 reviews
    if (this.reviewHistory.length > 50) {
      this.reviewHistory = this.reviewHistory.slice(-50);
    }
  }

  /**
   * Check if card is due for review
   */
  isDue() {
    return new Date() >= new Date(this.nextReviewAt);
  }

  /**
   * Get days until next review
   */
  getDaysUntilReview() {
    const now = new Date();
    const next = new Date(this.nextReviewAt);
    const diffTime = next - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Retire card (mark as permanently mastered)
   */
  retire() {
    this.status = 'retired';
    this.retiredAt = new Date().toISOString();
  }
}

/**
 * SpacedRepetitionSystem
 * Manages cards and scheduling for a student
 */
export class SpacedRepetitionSystem {
  constructor(storage = 'localStorage') {
    this.storage = storage;
    this.cards = new Map();
    this.loadData();
  }

  /**
   * Add new card to the system
   */
  addCard(cardData) {
    const card = new RepetitionCard(cardData);
    this.cards.set(card.id, card);
    this.saveData();
    return card;
  }

  /**
   * Get card by ID
   */
  getCard(cardId) {
    return this.cards.get(cardId);
  }

  /**
   * Get all cards for a student
   */
  getStudentCards(studentId, filters = {}) {
    let cards = Array.from(this.cards.values()).filter(
      (card) => card.studentId === studentId
    );

    if (filters.subject) {
      cards = cards.filter((card) => card.subject === filters.subject);
    }

    if (filters.topicId) {
      cards = cards.filter((card) => card.topicId === filters.topicId);
    }

    if (filters.status) {
      cards = cards.filter((card) => card.status === filters.status);
    }

    return cards;
  }

  /**
   * Get cards due for review
   */
  getDueCards(studentId, subject = null, limit = 20) {
    let cards = this.getStudentCards(studentId, subject ? { subject } : {});

    // Filter due cards
    cards = cards.filter((card) => card.isDue() && card.status !== 'retired');

    // Sort by priority
    cards.sort((a, b) => {
      // Overdue cards first
      const aOverdue = new Date(a.nextReviewAt) - new Date();
      const bOverdue = new Date(b.nextReviewAt) - new Date();

      if (aOverdue < bOverdue) return -1;
      if (aOverdue > bOverdue) return 1;

      // Then by status (new > learning > review)
      const statusOrder = { new: 0, learning: 1, review: 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

    return cards.slice(0, limit);
  }

  /**
   * Review a card
   */
  reviewCard(cardId, performance) {
    const card = this.getCard(cardId);

    if (!card) {
      throw new Error(`Card ${cardId} not found`);
    }

    const { quality, timeSpent, correct } = performance;

    // Record review
    card.recordReview(quality, timeSpent, correct);

    // Calculate next review
    card.calculateNextReview(quality, card.gradeLevel);

    this.saveData();

    return {
      cardId: card.id,
      nextReviewAt: card.nextReviewAt,
      interval: card.interval,
      status: card.status,
      easinessFactor: card.easinessFactor,
    };
  }

  /**
   * Get review statistics
   */
  getReviewStats(studentId, subject = null) {
    const cards = this.getStudentCards(studentId, subject ? { subject } : {});

    const stats = {
      total: cards.length,
      new: 0,
      learning: 0,
      review: 0,
      mastered: 0,
      retired: 0,
      dueToday: 0,
      dueThisWeek: 0,
      averageEasinessFactor: 0,
      totalReviews: 0,
      successRate: 0,
    };

    let efSum = 0;
    let totalSuccessful = 0;
    let totalAttempts = 0;
    const today = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(today.getDate() + 7);

    cards.forEach((card) => {
      stats[card.status]++;
      efSum += card.easinessFactor;
      totalSuccessful += card.successfulReviews;
      totalAttempts += card.totalReviews;
      stats.totalReviews += card.totalReviews;

      const nextReview = new Date(card.nextReviewAt);
      if (nextReview <= today) {
        stats.dueToday++;
      } else if (nextReview <= weekFromNow) {
        stats.dueThisWeek++;
      }
    });

    stats.averageEasinessFactor = cards.length > 0 ? efSum / cards.length : 0;
    stats.successRate = totalAttempts > 0 ? (totalSuccessful / totalAttempts) * 100 : 0;

    return stats;
  }

  /**
   * Get upcoming review schedule
   */
  getUpcomingReviews(studentId, days = 30) {
    const cards = this.getStudentCards(studentId);
    const schedule = new Map();

    const startDate = new Date();
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      schedule.set(dateKey, []);
    }

    cards.forEach((card) => {
      if (card.status === 'retired') return;

      const nextReview = new Date(card.nextReviewAt);
      const dateKey = nextReview.toISOString().split('T')[0];

      if (schedule.has(dateKey)) {
        schedule.get(dateKey).push({
          cardId: card.id,
          topicId: card.topicId,
          subject: card.subject,
          status: card.status,
        });
      }
    });

    return Array.from(schedule.entries()).map(([date, cards]) => ({
      date,
      count: cards.length,
      cards,
    }));
  }

  /**
   * Bulk add cards from topic mastery
   */
  addCardsFromTopic(studentId, subject, topicId, gradeLevel, questions) {
    const cards = questions.map((question) =>
      this.addCard({
        studentId,
        subject,
        topicId,
        gradeLevel,
        questionId: question.id,
        conceptText: question.text,
        difficulty: question.difficulty,
      })
    );

    return cards;
  }

  /**
   * Archive old mastered cards
   */
  archiveMasteredCards(studentId, daysOld = 180) {
    const cards = this.getStudentCards(studentId, { status: 'mastered' });
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    let archivedCount = 0;
    cards.forEach((card) => {
      const lastReview = new Date(card.lastReviewedAt);
      if (lastReview < cutoffDate && card.repetitions >= 8) {
        card.retire();
        archivedCount++;
      }
    });

    this.saveData();
    return archivedCount;
  }

  /**
   * Reset card (for re-learning)
   */
  resetCard(cardId) {
    const card = this.getCard(cardId);
    if (!card) return null;

    card.easinessFactor = 2.5;
    card.interval = 0;
    card.repetitions = 0;
    card.status = 'new';
    card.nextReviewAt = new Date().toISOString();

    this.saveData();
    return card;
  }

  /**
   * Load data from storage
   */
  loadData() {
    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const data = localStorage.getItem('learnai_spaced_repetition');
        if (data) {
          const parsed = JSON.parse(data);
          this.cards = new Map(
            Object.entries(parsed.cards || {}).map(([id, cardData]) => [
              id,
              new RepetitionCard(cardData),
            ])
          );
        }
      }
    } catch (error) {
      console.error('Error loading spaced repetition data:', error);
    }
  }

  /**
   * Save data to storage
   */
  saveData() {
    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const data = {
          cards: Object.fromEntries(this.cards),
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem('learnai_spaced_repetition', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error saving spaced repetition data:', error);
    }
  }

  /**
   * Clear all data
   */
  clearData() {
    this.cards.clear();
    if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('learnai_spaced_repetition');
    }
  }
}

/**
 * ReviewSessionManager
 * Manages review sessions with spaced repetition
 */
export class ReviewSessionManager {
  constructor(spacedRepetitionSystem) {
    this.srs = spacedRepetitionSystem;
    this.activeSessions = new Map();
  }

  /**
   * Start a review session
   */
  startSession(studentId, subject = null, options = {}) {
    const {
      targetCards = 20,
      maxNewCards = 5,
      includeSubjects = null,
    } = options;

    // Get due cards
    let dueCards = this.srs.getDueCards(studentId, subject, targetCards * 2);

    // Filter by status to ensure a good mix
    const newCards = dueCards.filter((c) => c.status === 'new').slice(0, maxNewCards);
    const learningCards = dueCards.filter((c) => c.status === 'learning');
    const reviewCards = dueCards.filter((c) => c.status === 'review');

    // Combine with priority: learning > review > new
    const sessionCards = [
      ...learningCards.slice(0, Math.floor(targetCards * 0.5)),
      ...reviewCards.slice(0, Math.floor(targetCards * 0.3)),
      ...newCards,
    ].slice(0, targetCards);

    const sessionId = this.generateSessionId();
    const session = {
      sessionId,
      studentId,
      subject,
      cards: sessionCards,
      startedAt: new Date().toISOString(),
      completedCards: 0,
      totalCards: sessionCards.length,
      results: [],
    };

    this.activeSessions.set(sessionId, session);
    return session;
  }

  /**
   * Review card in session
   */
  reviewCardInSession(sessionId, cardId, performance) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Review card in SRS
    const result = this.srs.reviewCard(cardId, performance);

    // Record in session
    session.results.push({
      cardId,
      ...performance,
      ...result,
      reviewedAt: new Date().toISOString(),
    });

    session.completedCards++;

    return {
      session,
      result,
      isComplete: session.completedCards >= session.totalCards,
    };
  }

  /**
   * Complete session
   */
  completeSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.completedAt = new Date().toISOString();
    session.duration = (new Date(session.completedAt) - new Date(session.startedAt)) / 1000 / 60; // Minutes

    // Calculate session statistics
    const stats = {
      totalCards: session.totalCards,
      completedCards: session.completedCards,
      correct: session.results.filter((r) => r.correct).length,
      accuracy: (session.results.filter((r) => r.correct).length / session.results.length) * 100,
      averageQuality: session.results.reduce((sum, r) => sum + r.quality, 0) / session.results.length,
      duration: session.duration,
      cardsPerMinute: session.completedCards / session.duration,
    };

    session.stats = stats;

    // Remove from active sessions
    this.activeSessions.delete(sessionId);

    return {
      session,
      stats,
      nextSession: this.getNextSessionInfo(session.studentId, session.subject),
    };
  }

  /**
   * Get next session info
   */
  getNextSessionInfo(studentId, subject = null) {
    const dueCards = this.srs.getDueCards(studentId, subject, 1);
    const stats = this.srs.getReviewStats(studentId, subject);

    return {
      hasDueCards: dueCards.length > 0,
      dueCount: stats.dueToday,
      upcomingWeek: stats.dueThisWeek,
      nextReviewAt: dueCards.length > 0 ? dueCards[0].nextReviewAt : null,
    };
  }

  /**
   * Generate session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Review quality helper
 * Converts performance metrics to quality score (0-5)
 */
export function calculateQuality(correct, confidence, timeSpent, expectedTime) {
  if (!correct) {
    // Failed - return 0-2 based on how close they were
    return confidence > 0.5 ? 2 : confidence > 0.2 ? 1 : 0;
  }

  // Correct - return 3-5 based on speed and confidence
  const timeRatio = timeSpent / expectedTime;

  if (confidence >= 0.9 && timeRatio <= 0.7) {
    return 5; // Perfect recall, quick
  } else if (confidence >= 0.8 && timeRatio <= 1.0) {
    return 4; // Good recall
  } else {
    return 3; // Correct but with difficulty
  }
}

/**
 * Example Usage
 */

/*
// Initialize system
const srs = new SpacedRepetitionSystem();
const sessionManager = new ReviewSessionManager(srs);

// Add cards when student masters a topic
const cards = srs.addCardsFromTopic(
  'student123',
  'math',
  'fractions',
  5, // Grade level
  [
    { id: 'q1', text: 'What is 1/2 + 1/4?', difficulty: 3 },
    { id: 'q2', text: 'Simplify 4/8', difficulty: 2 },
  ]
);

// Start a review session
const session = sessionManager.startSession('student123', 'math', {
  targetCards: 10,
  maxNewCards: 3,
});

console.log(`Review ${session.totalCards} cards`);

// Review each card
session.cards.forEach((card, index) => {
  // Student answers question...
  const performance = {
    quality: 4, // 0-5 scale
    timeSpent: 15, // seconds
    correct: true,
  };

  const result = sessionManager.reviewCardInSession(
    session.sessionId,
    card.id,
    performance
  );

  console.log(`Card ${index + 1}: Next review in ${result.result.interval} days`);
});

// Complete session
const completion = sessionManager.completeSession(session.sessionId);
console.log('Session complete:', completion.stats);
console.log('Next review:', completion.nextSession);

// Get student stats
const stats = srs.getReviewStats('student123', 'math');
console.log('Cards:', stats.total);
console.log('Due today:', stats.dueToday);
console.log('Success rate:', stats.successRate + '%');

// Get upcoming schedule
const schedule = srs.getUpcomingReviews('student123', 7);
schedule.forEach((day) => {
  console.log(`${day.date}: ${day.count} reviews`);
});
*/

export { RepetitionCard, DEFAULT_INTERVALS, GRADE_INTERVALS };
