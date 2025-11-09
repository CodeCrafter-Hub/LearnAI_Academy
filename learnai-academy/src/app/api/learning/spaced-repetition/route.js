import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { spacedRepetitionService } from '@/services/learning/spacedRepetitionService.js';

/**
 * GET /api/learning/spaced-repetition
 * Get concepts due for review
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
    const studentId = searchParams.get('studentId');
    const subjectId = searchParams.get('subjectId');
    const action = searchParams.get('action') || 'due'; // due, schedule, statistics

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required' },
        { status: 400 }
      );
    }

    let data;
    switch (action) {
      case 'statistics':
        data = await spacedRepetitionService.getReviewStatistics(studentId);
        break;
      case 'schedule':
        const conceptId = searchParams.get('conceptId');
        if (!conceptId) {
          return NextResponse.json(
            { error: 'conceptId is required for schedule action' },
            { status: 400 }
          );
        }
        data = await spacedRepetitionService.getReviewSchedule(studentId, conceptId);
        break;
      default:
        data = await spacedRepetitionService.getConceptsDueForReview(studentId, subjectId);
    }

    return NextResponse.json({
      success: true,
      ...(Array.isArray(data) ? { concepts: data } : data),
    });
  } catch (error) {
    console.error('Error in spaced repetition:', error);
    return NextResponse.json(
      { error: 'Failed to get spaced repetition data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/learning/spaced-repetition
 * Record a review or schedule initial review
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
    const { action, studentId, conceptId, quality, subjectId, sessionId } = body;

    if (!studentId || !conceptId) {
      return NextResponse.json(
        { error: 'studentId and conceptId are required' },
        { status: 400 }
      );
    }

    let result;
    if (action === 'schedule') {
      // Schedule initial review after learning
      result = await spacedRepetitionService.scheduleInitialReview(
        studentId,
        conceptId,
        subjectId,
        quality || 3
      );
    } else {
      // Record a review
      if (quality === undefined) {
        return NextResponse.json(
          { error: 'quality (0-5) is required' },
          { status: 400 }
        );
      }

      result = await spacedRepetitionService.recordReview(
        studentId,
        conceptId,
        quality,
        { subjectId, sessionId }
      );
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error in spaced repetition:', error);
    return NextResponse.json(
      { error: 'Failed to process spaced repetition' },
      { status: 500 }
    );
  }
}

