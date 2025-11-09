import prisma from '../../lib/prisma.js';
import { logInfo, logError } from '../../lib/logger.js';

/**
 * SpacedRepetitionService - SM-2 Algorithm Implementation
 * 
 * Based on SuperMemo 2 algorithm for optimal review intervals
 * Research shows 200-400% improvement in long-term retention
 * 
 * Algorithm:
 * - EF (Ease Factor) starts at 2.5
 * - After each review, EF is adjusted based on quality (0-5)
 * - Interval = previous interval * EF
 * - First review: 1 day
 * - Second review: 6 days
 * - Subsequent reviews: interval * EF
 */
class SpacedRepetitionService {
  /**
   * Calculate next review date using SM-2 algorithm
   * @param {Object} reviewHistory - Previous review history
   * @param {number} quality - Review quality (0-5)
   * @returns {Object} Next review information
   */
  calculateNextReview(reviewHistory, quality) {
    // Quality scale: 0 (complete blackout) to 5 (perfect recall)
    const quality = Math.max(0, Math.min(5, quality));

    let easeFactor = reviewHistory.easeFactor || 2.5;
    let interval = reviewHistory.interval || 1;
    let repetitions = reviewHistory.repetitions || 0;

    // Update ease factor based on quality
    easeFactor = this.updateEaseFactor(easeFactor, quality);

    // Calculate new interval
    if (quality < 3) {
      // If quality is low, restart
      interval = 1;
      repetitions = 0;
    } else {
      // Increase interval
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    }

    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    return {
      interval,
      repetitions,
      easeFactor,
      nextReviewDate: nextReviewDate.toISOString(),
      quality,
    };
  }

  /**
   * Update ease factor based on quality
   * @param {number} currentEF - Current ease factor
   * @param {number} quality - Review quality (0-5)
   * @returns {number} Updated ease factor
   */
  updateEaseFactor(currentEF, quality) {
    // SM-2 formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    const newEF = currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    
    // Minimum ease factor is 1.3
    return Math.max(1.3, newEF);
  }

  /**
   * Get concepts due for review
   * @param {string} studentId - Student ID
   * @param {string} subjectId - Subject ID (optional)
   * @returns {Promise<Array>} Concepts due for review
   */
  async getConceptsDueForReview(studentId, subjectId = null) {
    try {
      const now = new Date();

      // Get all concept reviews for student
      const reviews = await prisma.conceptReview.findMany({
        where: {
          studentId,
          ...(subjectId && { subjectId }),
          nextReviewDate: {
            lte: now,
          },
        },
        include: {
          concept: true,
          subject: true,
        },
        orderBy: {
          nextReviewDate: 'asc',
        },
      });

      return reviews.map(review => ({
        id: review.id,
        conceptId: review.conceptId,
        conceptName: review.concept?.name || 'Unknown',
        subjectId: review.subjectId,
        subjectName: review.subject?.name || 'Unknown',
        lastReviewed: review.lastReviewedAt,
        nextReview: review.nextReviewDate,
        easeFactor: review.easeFactor,
        interval: review.interval,
        repetitions: review.repetitions,
        daysOverdue: Math.floor((now - new Date(review.nextReviewDate)) / (1000 * 60 * 60 * 24)),
      }));
    } catch (error) {
      logError('Error getting concepts due for review', error);
      throw error;
    }
  }

  /**
   * Record a review session
   * @param {string} studentId - Student ID
   * @param {string} conceptId - Concept ID
   * @param {number} quality - Review quality (0-5)
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Review result
   */
  async recordReview(studentId, conceptId, quality, options = {}) {
    try {
      const { subjectId, sessionId } = options;

      // Get or create concept review
      let review = await prisma.conceptReview.findUnique({
        where: {
          studentId_conceptId: {
            studentId,
            conceptId,
          },
        },
      });

      const reviewHistory = review ? {
        easeFactor: review.easeFactor,
        interval: review.interval,
        repetitions: review.repetitions,
      } : {
        easeFactor: 2.5,
        interval: 1,
        repetitions: 0,
      };

      // Calculate next review
      const nextReview = this.calculateNextReview(reviewHistory, quality);

      // Update or create review
      if (review) {
        review = await prisma.conceptReview.update({
          where: { id: review.id },
          data: {
            easeFactor: nextReview.easeFactor,
            interval: nextReview.interval,
            repetitions: nextReview.repetitions,
            nextReviewDate: new Date(nextReview.nextReviewDate),
            lastReviewedAt: new Date(),
            totalReviews: {
              increment: 1,
            },
            averageQuality: {
              // Weighted average
              set: ((review.averageQuality * review.totalReviews) + quality) / (review.totalReviews + 1),
            },
          },
        });
      } else {
        review = await prisma.conceptReview.create({
          data: {
            studentId,
            conceptId,
            subjectId,
            easeFactor: nextReview.easeFactor,
            interval: nextReview.interval,
            repetitions: nextReview.repetitions,
            nextReviewDate: new Date(nextReview.nextReviewDate),
            lastReviewedAt: new Date(),
            totalReviews: 1,
            averageQuality: quality,
          },
        });
      }

      // Log review session
      await prisma.reviewSession.create({
        data: {
          reviewId: review.id,
          sessionId,
          quality,
          reviewedAt: new Date(),
        },
      });

      return {
        success: true,
        review: {
          id: review.id,
          nextReviewDate: review.nextReviewDate,
          interval: review.interval,
          repetitions: review.repetitions,
          easeFactor: review.easeFactor,
        },
        mastery: this.calculateMastery(review),
      };
    } catch (error) {
      logError('Error recording review', error);
      throw error;
    }
  }

  /**
   * Calculate mastery level from review history
   * @param {Object} review - Review record
   * @returns {number} Mastery level (0-100)
   */
  calculateMastery(review) {
    // Mastery based on:
    // - Average quality (0-5 scale)
    // - Number of successful reviews
    // - Current ease factor
    // - Time since last review

    const qualityScore = (review.averageQuality / 5) * 100; // 0-100
    const repetitionScore = Math.min(100, (review.repetitions / 10) * 100); // More reps = higher mastery
    const easeFactorScore = Math.min(100, ((review.easeFactor - 1.3) / (2.5 - 1.3)) * 100); // Higher EF = better mastery

    // Weighted average
    const mastery = (
      qualityScore * 0.5 +
      repetitionScore * 0.3 +
      easeFactorScore * 0.2
    );

    return Math.min(100, Math.max(0, Math.round(mastery)));
  }

  /**
   * Get review schedule for a concept
   * @param {string} studentId - Student ID
   * @param {string} conceptId - Concept ID
   * @returns {Promise<Object>} Review schedule
   */
  async getReviewSchedule(studentId, conceptId) {
    try {
      const review = await prisma.conceptReview.findUnique({
        where: {
          studentId_conceptId: {
            studentId,
            conceptId,
          },
        },
      });

      if (!review) {
        return {
          isNew: true,
          nextReviewDate: new Date(), // Review immediately
          interval: 1,
          repetitions: 0,
          mastery: 0,
        };
      }

      const now = new Date();
      const isDue = new Date(review.nextReviewDate) <= now;
      const daysUntilReview = Math.ceil((new Date(review.nextReviewDate) - now) / (1000 * 60 * 60 * 24));

      return {
        isNew: false,
        nextReviewDate: review.nextReviewDate,
        interval: review.interval,
        repetitions: review.repetitions,
        easeFactor: review.easeFactor,
        mastery: this.calculateMastery(review),
        isDue,
        daysUntilReview: isDue ? 0 : daysUntilReview,
        totalReviews: review.totalReviews,
        averageQuality: review.averageQuality,
      };
    } catch (error) {
      logError('Error getting review schedule', error);
      throw error;
    }
  }

  /**
   * Get review statistics for student
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} Review statistics
   */
  async getReviewStatistics(studentId) {
    try {
      const reviews = await prisma.conceptReview.findMany({
        where: { studentId },
      });

      const dueReviews = reviews.filter(r => new Date(r.nextReviewDate) <= new Date());
      const upcomingReviews = reviews.filter(r => {
        const daysUntil = Math.ceil((new Date(r.nextReviewDate) - new Date()) / (1000 * 60 * 60 * 24));
        return daysUntil > 0 && daysUntil <= 7;
      });

      const totalMastery = reviews.reduce((sum, r) => sum + this.calculateMastery(r), 0);
      const averageMastery = reviews.length > 0 ? totalMastery / reviews.length : 0;

      return {
        totalConcepts: reviews.length,
        dueForReview: dueReviews.length,
        upcomingReviews: upcomingReviews.length,
        averageMastery: Math.round(averageMastery),
        totalReviews: reviews.reduce((sum, r) => sum + r.totalReviews, 0),
        conceptsByMastery: {
          mastered: reviews.filter(r => this.calculateMastery(r) >= 80).length,
          learning: reviews.filter(r => {
            const mastery = this.calculateMastery(r);
            return mastery >= 50 && mastery < 80;
          }).length,
          new: reviews.filter(r => this.calculateMastery(r) < 50).length,
        },
      };
    } catch (error) {
      logError('Error getting review statistics', error);
      throw error;
    }
  }

  /**
   * Schedule review for a concept after learning
   * @param {string} studentId - Student ID
   * @param {string} conceptId - Concept ID
   * @param {string} subjectId - Subject ID
   * @param {number} initialQuality - Initial quality (0-5)
   * @returns {Promise<Object>} Scheduled review
   */
  async scheduleInitialReview(studentId, conceptId, subjectId, initialQuality = 3) {
    try {
      // Check if review already exists
      const existing = await prisma.conceptReview.findUnique({
        where: {
          studentId_conceptId: {
            studentId,
            conceptId,
          },
        },
      });

      if (existing) {
        return existing;
      }

      // Create initial review with first interval
      const nextReview = this.calculateNextReview({
        easeFactor: 2.5,
        interval: 1,
        repetitions: 0,
      }, initialQuality);

      const review = await prisma.conceptReview.create({
        data: {
          studentId,
          conceptId,
          subjectId,
          easeFactor: nextReview.easeFactor,
          interval: nextReview.interval,
          repetitions: nextReview.repetitions,
          nextReviewDate: new Date(nextReview.nextReviewDate),
          lastReviewedAt: new Date(),
          totalReviews: 1,
          averageQuality: initialQuality,
        },
      });

      return review;
    } catch (error) {
      logError('Error scheduling initial review', error);
      throw error;
    }
  }
}

export const spacedRepetitionService = new SpacedRepetitionService();
export default spacedRepetitionService;

