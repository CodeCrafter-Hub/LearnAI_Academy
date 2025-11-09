import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { formativeAssessmentService } from '@/services/assessment/formativeAssessmentService.js';

/**
 * GET /api/assessment/formative
 * Get questions for lesson or progress
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
    const lessonId = searchParams.get('lessonId');
    const studentId = searchParams.get('studentId');
    const action = searchParams.get('action') || 'questions'; // questions, progress

    if (!lessonId) {
      return NextResponse.json(
        { error: 'lessonId is required' },
        { status: 400 }
      );
    }

    let data;
    if (action === 'progress' && studentId) {
      data = await formativeAssessmentService.getQuestionProgress(studentId, lessonId);
    } else {
      data = await formativeAssessmentService.getLessonQuestions(lessonId);
    }

    return NextResponse.json({
      success: true,
      ...(Array.isArray(data) ? { questions: data } : data),
    });
  } catch (error) {
    console.error('Error getting formative assessment:', error);
    return NextResponse.json(
      { error: 'Failed to get formative assessment' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/assessment/formative
 * Submit answer or generate question
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
    const { action, questionId, studentId, answer, lessonId, concept, gradeLevel, options } = body;

    if (action === 'generate') {
      // Generate new question
      if (!lessonId || !concept || gradeLevel === undefined) {
        return NextResponse.json(
          { error: 'lessonId, concept, and gradeLevel are required' },
          { status: 400 }
        );
      }

      const question = await formativeAssessmentService.generateEmbeddedQuestion(
        lessonId,
        concept,
        gradeLevel,
        options || {}
      );

      return NextResponse.json({
        success: true,
        question,
      });
    } else {
      // Submit answer
      if (!questionId || !studentId || answer === undefined) {
        return NextResponse.json(
          { error: 'questionId, studentId, and answer are required' },
          { status: 400 }
        );
      }

      const result = await formativeAssessmentService.submitAnswer(
        questionId,
        studentId,
        answer
      );

      return NextResponse.json({
        success: true,
        ...result,
      });
    }
  } catch (error) {
    console.error('Error in formative assessment:', error);
    return NextResponse.json(
      { error: 'Failed to process formative assessment' },
      { status: 500 }
    );
  }
}

