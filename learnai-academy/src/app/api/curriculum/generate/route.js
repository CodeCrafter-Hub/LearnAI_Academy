import { NextResponse } from 'next/server';
import { CurriculumAgent } from '@/services/ai/agents/CurriculumAgent';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';
import { logError, logInfo } from '@/lib/logger';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const generateSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  gradeLevel: z.number().int().min(1).max(12),
  subjectId: z.string().optional(),
  includeStandards: z.boolean().optional().default(true),
  includeAssessments: z.boolean().optional().default(true),
  includePracticeProblems: z.boolean().optional().default(true),
  difficultyLevel: z.enum(['EASY', 'MEDIUM', 'HARD']).optional().default('MEDIUM'),
});

/**
 * POST /api/curriculum/generate
 * Generate a lesson plan for a topic
 */
export async function POST(request) {
  try {
    // Verify authentication
    const tokenData = await verifyToken(request);
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validated = generateSchema.parse(body);

    logInfo('Curriculum generation requested', {
      userId: tokenData.userId,
      topic: validated.topic,
      gradeLevel: validated.gradeLevel,
    });

    // Create curriculum agent
    const subjectId = validated.subjectId || 'math'; // Default to math
    const agent = new CurriculumAgent('Curriculum Agent', subjectId);

    // Generate lesson plan
    const lessonPlan = await agent.generateLessonPlan(
      validated.topic,
      validated.gradeLevel,
      {
        includeStandards: validated.includeStandards,
        includeAssessments: validated.includeAssessments,
        includePracticeProblems: validated.includePracticeProblems,
        difficultyLevel: validated.difficultyLevel,
        useCache: true, // Use cache for production
        maxRetries: 3,
      }
    );

    logInfo('Curriculum generated successfully', {
      userId: tokenData.userId,
      topic: validated.topic,
      objectivesCount: lessonPlan.objectives?.length || 0,
    });

    return NextResponse.json({
      success: true,
      lessonPlan,
      metadata: {
        topic: validated.topic,
        gradeLevel: validated.gradeLevel,
        subjectId,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logError('Curriculum generation error', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to generate curriculum',
        message: error.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/curriculum/generate
 * Get curriculum generation status or test endpoint
 */
export async function GET(request) {
  try {
    // Verify authentication
    const tokenData = await verifyToken(request);
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Return available subjects and test info
    return NextResponse.json({
      success: true,
      message: 'Curriculum generation API is available',
      endpoints: {
        generate: 'POST /api/curriculum/generate',
      },
      example: {
        topic: 'Fractions',
        gradeLevel: 5,
        subjectId: 'math',
        includeStandards: true,
        includeAssessments: true,
        includePracticeProblems: true,
        difficultyLevel: 'MEDIUM',
      },
    });
  } catch (error) {
    logError('Curriculum API error', error);
    return NextResponse.json(
      { error: 'API error', message: error.message },
      { status: 500 }
    );
  }
}
