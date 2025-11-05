import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/assessments/[id]
 * Get assessment details
 */
export async function GET(request, { params }) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const assessmentId = params.id;

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        subject: true,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Extract questions from metadata
    const questions = assessment.metadata?.questions || [];

    return NextResponse.json({
      success: true,
      assessment: {
        id: assessment.id,
        name: assessment.name,
        assessmentType: assessment.assessmentType,
        gradeLevel: assessment.gradeLevel,
        totalQuestions: assessment.totalQuestions,
        timeLimitMinutes: assessment.timeLimitMinutes,
        subject: assessment.subject ? {
          id: assessment.subject.id,
          name: assessment.subject.name,
        } : null,
        questions: questions,
        createdAt: assessment.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}

