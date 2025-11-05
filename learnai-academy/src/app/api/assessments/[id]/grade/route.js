import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { agentOrchestrator } from '@/services/ai/agentOrchestrator';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const gradeAssessmentSchema = z.object({
  studentId: z.string().uuid(),
  answers: z.array(z.object({
    questionId: z.union([z.string(), z.number()]),
    answer: z.string(),
  })),
});

/**
 * POST /api/assessments/[id]/grade
 * Grade a student's assessment submission
 */
export async function POST(request, { params }) {
  try {
    // Verify authentication
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const assessmentId = params.id;
    const body = await request.json();
    const data = gradeAssessmentSchema.parse(body);

    // Verify assessment exists
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

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

    // Get subject slug from assessment
    let subjectSlug = 'math'; // default
    if (assessment.subjectId) {
      const subject = await prisma.subject.findUnique({
        where: { id: assessment.subjectId },
      });
      if (subject) {
        subjectSlug = subject.slug;
      }
    }

    // Build context for grading
    const context = {
      studentId: data.studentId,
      gradeLevel: assessment.gradeLevel || student.gradeLevel,
      subject: subjectSlug,
      subjectName: assessment.subjectId ? (await prisma.subject.findUnique({
        where: { id: assessment.subjectId },
      }))?.name : 'Unknown',
    };

    // Grade the assessment
    const results = await agentOrchestrator.gradeAssessment(
      assessmentId,
      data.answers,
      context
    );

    // Save assessment result
    const assessmentResult = await prisma.assessmentResult.create({
      data: {
        assessmentId,
        studentId: data.studentId,
        score: results.score,
        totalCorrect: results.totalCorrect,
        totalQuestions: results.totalQuestions,
        questionResults: results.questionResults,
        recommendedTopics: results.recommendations?.nextSteps || results.learningGaps || null,
        takenAt: new Date(),
      },
    });

    // Update student progress if this is a diagnostic assessment
    if (assessment.assessmentType === 'diagnostic' && results.learningGaps) {
      // Update progress tracking with identified gaps
      // This would integrate with the progress tracker service
      // For now, we'll just log the gaps
      console.log('Learning gaps identified:', results.learningGaps);
    }

    return NextResponse.json({
      success: true,
      result: {
        id: assessmentResult.id,
        score: results.score,
        totalCorrect: results.totalCorrect,
        totalQuestions: results.totalQuestions,
        questionResults: results.questionResults,
        learningGaps: results.learningGaps,
        recommendations: results.recommendations,
        takenAt: assessmentResult.takenAt,
      },
    });
  } catch (error) {
    console.error('Error grading assessment:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to grade assessment', message: error.message },
      { status: 500 }
    );
  }
}

