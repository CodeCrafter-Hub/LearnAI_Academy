import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { agentOrchestrator } from '@/services/ai/agentOrchestrator';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Force dynamic rendering - assessment generation requires runtime execution
export const dynamic = 'force-dynamic';

const generateAssessmentSchema = z.object({
  subjectId: z.string().uuid().optional(),
  topicId: z.string().uuid().optional(),
  topicName: z.string().optional(),
  gradeLevel: z.number().int().min(0).max(12),
  assessmentType: z.enum(['diagnostic', 'formative', 'summative']).default('diagnostic'),
  questionCount: z.number().int().min(5).max(50).default(15),
  options: z.object({
    includeMultipleChoice: z.boolean().default(true),
    includeShortAnswer: z.boolean().default(true),
    includeProblemSolving: z.boolean().default(true),
    timeLimitMinutes: z.number().int().optional(),
  }).optional(),
});

/**
 * POST /api/assessments/generate
 * Generate an assessment (diagnostic, formative, or summative)
 */
export async function POST(request) {
  try {
    // Verify authentication
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = generateAssessmentSchema.parse(body);

    // Get topic information
    let topicName = data.topicName;
    let subjectSlug = 'math'; // default

    if (data.topicId) {
      const topic = await prisma.topic.findUnique({
        where: { id: data.topicId },
        include: { subject: true },
      });

      if (!topic) {
        return NextResponse.json(
          { error: 'Topic not found' },
          { status: 404 }
        );
      }

      topicName = topic.name;
      subjectSlug = topic.subject.slug;
    } else if (data.subjectId) {
      const subject = await prisma.subject.findUnique({
        where: { id: data.subjectId },
      });

      if (!subject) {
        return NextResponse.json(
          { error: 'Subject not found' },
          { status: 404 }
        );
      }

      subjectSlug = subject.slug;
    }

    if (!topicName) {
      return NextResponse.json(
        { error: 'Topic name or topicId is required' },
        { status: 400 }
      );
    }

    // Generate assessment
    const assessment = await agentOrchestrator.generateAssessment(
      subjectSlug,
      topicName,
      data.gradeLevel,
      {
        questionCount: data.questionCount,
        includeMultipleChoice: data.options?.includeMultipleChoice !== false,
        includeShortAnswer: data.options?.includeShortAnswer !== false,
        includeProblemSolving: data.options?.includeProblemSolving !== false,
      }
    );

    if (!assessment || assessment.error) {
      return NextResponse.json(
        { error: 'Failed to generate assessment', details: assessment?.error },
        { status: 500 }
      );
    }

    // Parse questions from assessment result
    const questions = Array.isArray(assessment) ? assessment : 
                     assessment.questions ? assessment.questions :
                     assessment.raw ? JSON.parse(assessment.raw)?.questions || [] : [];

    // Save assessment to database
    const savedAssessment = await prisma.assessment.create({
      data: {
        name: `${data.assessmentType.charAt(0).toUpperCase() + data.assessmentType.slice(1)} Assessment: ${topicName}`,
        assessmentType: data.assessmentType,
        subjectId: data.subjectId || null,
        topics: data.topicId ? [data.topicId] : null,
        gradeLevel: data.gradeLevel,
        totalQuestions: questions.length || data.questionCount,
        timeLimitMinutes: data.options?.timeLimitMinutes || null,
        metadata: {
          questions: questions,
          generatedAt: new Date().toISOString(),
          topicName,
          subjectSlug,
        },
      },
    });

    return NextResponse.json({
      success: true,
      assessment: {
        id: savedAssessment.id,
        name: savedAssessment.name,
        assessmentType: savedAssessment.assessmentType,
        gradeLevel: savedAssessment.gradeLevel,
        totalQuestions: savedAssessment.totalQuestions,
        timeLimitMinutes: savedAssessment.timeLimitMinutes,
        questions: questions,
        createdAt: savedAssessment.createdAt,
      },
    });
  } catch (error) {
    console.error('Error generating assessment:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate assessment', message: error.message },
      { status: 500 }
    );
  }
}

