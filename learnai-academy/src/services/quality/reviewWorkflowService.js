import prisma from '../../lib/prisma.js';
import { qualityAssuranceService } from './qualityAssuranceService.js';
import { logInfo, logError } from '../../lib/logger.js';

/**
 * ReviewWorkflowService - Manages content review workflows
 * 
 * Features:
 * - Review assignment
 * - Review tracking
 * - Approval workflow
 * - Revision tracking
 * - Review history
 */

class ReviewWorkflowService {
  /**
   * Submit for review
   * @param {string} lessonPlanId - Lesson plan ID
   * @param {string} reviewerId - Reviewer ID (optional)
   * @returns {Promise<Object>} Review submission
   */
  async submitForReview(lessonPlanId, reviewerId = null) {
    // Run quality check first
    const qaResult = await qualityAssuranceService.runQualityCheck(lessonPlanId);

    // Create review record
    const review = await prisma.lessonPlan.update({
      where: { id: lessonPlanId },
      data: {
        reviewStatus: 'PENDING_REVIEW',
        metadata: {
          ...(await prisma.lessonPlan.findUnique({ where: { id: lessonPlanId } })).metadata || {},
          review: {
            submittedAt: new Date().toISOString(),
            reviewerId,
            qaResult,
            status: 'PENDING',
          },
        },
      },
    });

    logInfo('Lesson plan submitted for review', { lessonPlanId, reviewerId });

    return {
      lessonPlanId,
      reviewStatus: 'PENDING_REVIEW',
      qaScore: qaResult.overallScore,
      review,
    };
  }

  /**
   * Assign reviewer
   * @param {string} lessonPlanId - Lesson plan ID
   * @param {string} reviewerId - Reviewer ID
   * @returns {Promise<Object>} Assignment result
   */
  async assignReviewer(lessonPlanId, reviewerId) {
    const lessonPlan = await prisma.lessonPlan.findUnique({
      where: { id: lessonPlanId },
    });

    if (!lessonPlan) {
      throw new Error(`Lesson plan not found: ${lessonPlanId}`);
    }

    // Verify reviewer exists and has permission
    const reviewer = await prisma.user.findUnique({
      where: { id: reviewerId },
    });

    if (!reviewer || (reviewer.role !== 'TEACHER' && reviewer.role !== 'ADMIN')) {
      throw new Error('Invalid reviewer');
    }

    // Update review assignment
    const updated = await prisma.lessonPlan.update({
      where: { id: lessonPlanId },
      data: {
        metadata: {
          ...(lessonPlan.metadata || {}),
          review: {
            ...(lessonPlan.metadata?.review || {}),
            reviewerId,
            assignedAt: new Date().toISOString(),
            status: 'ASSIGNED',
          },
        },
      },
    });

    logInfo('Reviewer assigned', { lessonPlanId, reviewerId });

    return {
      lessonPlanId,
      reviewerId,
      assignedAt: new Date().toISOString(),
    };
  }

  /**
   * Submit review
   * @param {string} lessonPlanId - Lesson plan ID
   * @param {string} reviewerId - Reviewer ID
   * @param {Object} reviewData - Review data
   * @returns {Promise<Object>} Review result
   */
  async submitReview(lessonPlanId, reviewerId, reviewData) {
    const {
      status, // APPROVED, NEEDS_REVISION, REJECTED
      comments = [],
      feedback = '',
      score = null,
    } = reviewData;

    const lessonPlan = await prisma.lessonPlan.findUnique({
      where: { id: lessonPlanId },
    });

    if (!lessonPlan) {
      throw new Error(`Lesson plan not found: ${lessonPlanId}`);
    }

    // Verify reviewer
    if (lessonPlan.metadata?.review?.reviewerId !== reviewerId) {
      throw new Error('Unauthorized reviewer');
    }

    // Update review
    const reviewHistory = lessonPlan.metadata?.reviewHistory || [];
    reviewHistory.push({
      reviewerId,
      status,
      comments,
      feedback,
      score,
      reviewedAt: new Date().toISOString(),
    });

    const updated = await prisma.lessonPlan.update({
      where: { id: lessonPlanId },
      data: {
        reviewStatus: status === 'APPROVED' ? 'APPROVED' : status === 'NEEDS_REVISION' ? 'NEEDS_REVISION' : 'REJECTED',
        metadata: {
          ...(lessonPlan.metadata || {}),
          review: {
            ...(lessonPlan.metadata?.review || {}),
            status: 'COMPLETED',
            completedAt: new Date().toISOString(),
          },
          reviewHistory,
        },
      },
    });

    logInfo('Review submitted', { lessonPlanId, reviewerId, status });

    return {
      lessonPlanId,
      status,
      reviewHistory,
    };
  }

  /**
   * Get review status
   * @param {string} lessonPlanId - Lesson plan ID
   * @returns {Promise<Object>} Review status
   */
  async getReviewStatus(lessonPlanId) {
    const lessonPlan = await prisma.lessonPlan.findUnique({
      where: { id: lessonPlanId },
    });

    if (!lessonPlan) {
      throw new Error(`Lesson plan not found: ${lessonPlanId}`);
    }

    const review = lessonPlan.metadata?.review || {};
    const reviewHistory = lessonPlan.metadata?.reviewHistory || [];

    return {
      lessonPlanId,
      reviewStatus: lessonPlan.reviewStatus,
      currentReview: review,
      reviewHistory,
      isApproved: lessonPlan.reviewStatus === 'APPROVED',
      needsRevision: lessonPlan.reviewStatus === 'NEEDS_REVISION',
    };
  }

  /**
   * Get pending reviews
   * @param {string} reviewerId - Reviewer ID (optional)
   * @returns {Promise<Array>} Pending reviews
   */
  async getPendingReviews(reviewerId = null) {
    const where = {
      reviewStatus: 'PENDING_REVIEW',
      isActive: true,
    };

    if (reviewerId) {
      where.metadata = {
        path: ['review', 'reviewerId'],
        equals: reviewerId,
      };
    }

    const lessonPlans = await prisma.lessonPlan.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    });

    return lessonPlans.map(lp => ({
      id: lp.id,
      name: lp.name,
      subject: lp.unit?.curriculum?.subject?.name,
      gradeLevel: lp.unit?.curriculum?.gradeLevel,
      reviewStatus: lp.reviewStatus,
      review: lp.metadata?.review || {},
    }));
  }

  /**
   * Approve lesson plan
   * @param {string} lessonPlanId - Lesson plan ID
   * @param {string} reviewerId - Reviewer ID
   * @returns {Promise<Object>} Approval result
   */
  async approveLessonPlan(lessonPlanId, reviewerId) {
    return await this.submitReview(lessonPlanId, reviewerId, {
      status: 'APPROVED',
      comments: [],
      feedback: 'Approved',
    });
  }

  /**
   * Request revision
   * @param {string} lessonPlanId - Lesson plan ID
   * @param {string} reviewerId - Reviewer ID
   * @param {string} feedback - Revision feedback
   * @returns {Promise<Object>} Revision request
   */
  async requestRevision(lessonPlanId, reviewerId, feedback) {
    return await this.submitReview(lessonPlanId, reviewerId, {
      status: 'NEEDS_REVISION',
      comments: [],
      feedback,
    });
  }
}

export const reviewWorkflowService = new ReviewWorkflowService();
export default reviewWorkflowService;

