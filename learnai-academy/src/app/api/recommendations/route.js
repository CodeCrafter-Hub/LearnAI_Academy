import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { recommendationEngine } from '@/services/analytics/recommendationEngine';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Force dynamic rendering - recommendations require runtime data
export const dynamic = 'force-dynamic';

const recommendationsSchema = z.object({
  studentId: z.string().uuid(),
  subjectId: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(20).optional(),
  includePrerequisites: z.boolean().optional(),
});

/**
 * GET /api/recommendations
 * Get personalized learning recommendations for a student
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
    const limit = parseInt(searchParams.get('limit') || '5');
    const includePrerequisites = searchParams.get('includePrerequisites') === 'true';

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required' },
        { status: 400 }
      );
    }

    // Verify student belongs to user
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student || (student.userId !== user.userId && student.parentId !== user.userId)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get recommendations
    const recommendations = await recommendationEngine.getRecommendations(studentId, {
      subjectId: subjectId || null,
      limit,
      includePrerequisites,
    });

    return NextResponse.json({
      success: true,
      ...recommendations,
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recommendations
 * Get personalized learning path
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
    const data = recommendationsSchema.parse(body);

    // Verify student belongs to user
    const student = await prisma.student.findUnique({
      where: { id: data.studentId },
    });

    if (!student || (student.userId !== user.userId && student.parentId !== user.userId)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get learning path
    const learningPath = await recommendationEngine.getLearningPath(
      data.studentId,
      data.subjectId || null
    );

    return NextResponse.json({
      success: true,
      ...learningPath,
    });
  } catch (error) {
    console.error('Error getting learning path:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to get learning path', message: error.message },
      { status: 500 }
    );
  }
}

