import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { contentValidationService } from '@/services/quality/contentValidationService.js';
import { qualityAssuranceService } from '@/services/quality/qualityAssuranceService.js';
import { consistencyCheckService } from '@/services/quality/consistencyCheckService.js';
import { standardsAlignmentService } from '@/services/quality/standardsAlignmentService.js';
import { reviewWorkflowService } from '@/services/quality/reviewWorkflowService.js';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const validateRequestSchema = z.object({
  action: z.enum(['validate', 'quality', 'consistency', 'standards', 'review', 'approve', 'revision']),
  lessonPlanId: z.string().uuid().optional(),
  curriculumId: z.string().uuid().optional(),
  reviewerId: z.string().uuid().optional(),
  feedback: z.string().optional(),
});

/**
 * POST /api/quality/validate
 * Quality and validation endpoints
 */
export async function POST(request) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = validateRequestSchema.parse(body);

    let result;

    switch (data.action) {
      case 'validate':
        if (!data.lessonPlanId) {
          return NextResponse.json(
            { error: 'lessonPlanId is required' },
            { status: 400 }
          );
        }
        result = await contentValidationService.validateLessonPlan(data.lessonPlanId);
        break;

      case 'quality':
        if (!data.lessonPlanId) {
          return NextResponse.json(
            { error: 'lessonPlanId is required' },
            { status: 400 }
          );
        }
        result = await qualityAssuranceService.runQualityCheck(data.lessonPlanId);
        break;

      case 'consistency':
        if (!data.curriculumId) {
          return NextResponse.json(
            { error: 'curriculumId is required' },
            { status: 400 }
          );
        }
        result = await consistencyCheckService.checkCurriculumConsistency(data.curriculumId);
        break;

      case 'standards':
        if (!data.lessonPlanId) {
          return NextResponse.json(
            { error: 'lessonPlanId is required' },
            { status: 400 }
          );
        }
        result = await standardsAlignmentService.checkAlignment(data.lessonPlanId);
        break;

      case 'review':
        if (!data.lessonPlanId) {
          return NextResponse.json(
            { error: 'lessonPlanId is required' },
            { status: 400 }
          );
        }
        result = await reviewWorkflowService.submitForReview(data.lessonPlanId, data.reviewerId);
        break;

      case 'approve':
        if (!data.lessonPlanId || !data.reviewerId) {
          return NextResponse.json(
            { error: 'lessonPlanId and reviewerId are required' },
            { status: 400 }
          );
        }
        result = await reviewWorkflowService.approveLessonPlan(data.lessonPlanId, data.reviewerId);
        break;

      case 'revision':
        if (!data.lessonPlanId || !data.reviewerId || !data.feedback) {
          return NextResponse.json(
            { error: 'lessonPlanId, reviewerId, and feedback are required' },
            { status: 400 }
          );
        }
        result = await reviewWorkflowService.requestRevision(data.lessonPlanId, data.reviewerId, data.feedback);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action: data.action,
      result,
    });
  } catch (error) {
    console.error('Error in quality validation:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process request', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/quality/validate
 * Get validation/quality status
 */
export async function GET(request) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const lessonPlanId = searchParams.get('lessonPlanId');
    const curriculumId = searchParams.get('curriculumId');
    const reviewerId = searchParams.get('reviewerId');

    if (lessonPlanId) {
      // Get review status
      const status = await reviewWorkflowService.getReviewStatus(lessonPlanId);
      return NextResponse.json({ success: true, status });
    }

    if (curriculumId) {
      // Get curriculum standards
      const standards = await standardsAlignmentService.getCurriculumStandards(curriculumId);
      return NextResponse.json({ success: true, standards });
    }

    if (reviewerId) {
      // Get pending reviews
      const reviews = await reviewWorkflowService.getPendingReviews(reviewerId);
      return NextResponse.json({ success: true, reviews });
    }

    return NextResponse.json(
      { error: 'Missing required parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching quality status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}

