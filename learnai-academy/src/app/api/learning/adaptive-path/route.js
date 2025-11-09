import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { adaptiveLearningPathService } from '@/services/learning/adaptiveLearningPathService.js';

/**
 * GET /api/learning/adaptive-path
 * Get adaptive learning path
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
    const action = searchParams.get('action') || 'path'; // path, visualization, adjust

    if (!studentId || !subjectId) {
      return NextResponse.json(
        { error: 'studentId and subjectId are required' },
        { status: 400 }
      );
    }

    let data;
    switch (action) {
      case 'visualization':
        data = await adaptiveLearningPathService.getPathVisualization(studentId, subjectId);
        break;
      default:
        const currentTopicId = searchParams.get('currentTopicId');
        data = await adaptiveLearningPathService.getLearningPath(studentId, subjectId, {
          currentTopicId,
          includePrerequisites: true,
          includeEnrichment: true,
        });
    }

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('Error getting adaptive path:', error);
    return NextResponse.json(
      { error: 'Failed to get adaptive learning path' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/learning/adaptive-path
 * Adjust path based on performance
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
    const { studentId, topicId, performanceData } = body;

    if (!studentId || !topicId || !performanceData) {
      return NextResponse.json(
        { error: 'studentId, topicId, and performanceData are required' },
        { status: 400 }
      );
    }

    const adjustedPath = await adaptiveLearningPathService.adjustPath(
      studentId,
      topicId,
      performanceData
    );

    return NextResponse.json({
      success: true,
      ...adjustedPath,
    });
  } catch (error) {
    console.error('Error adjusting path:', error);
    return NextResponse.json(
      { error: 'Failed to adjust learning path' },
      { status: 500 }
    );
  }
}

