import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { comprehensiveClassroomEvaluationService } from '@/services/ui/comprehensiveClassroomEvaluationService.js';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const evaluationRequestSchema = z.object({
  gradeLevel: z.number().int().min(-1).max(12),
  classroomConfig: z.object({}).optional(),
});

/**
 * POST /api/ui/comprehensive-evaluation
 * Comprehensive classroom experience evaluation
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
    const data = evaluationRequestSchema.parse(body);

    // Run comprehensive evaluation
    const evaluation = await comprehensiveClassroomEvaluationService.evaluateClassroomExperience(
      data.gradeLevel,
      data.classroomConfig || {}
    );

    return NextResponse.json({
      success: true,
      evaluation,
    });
  } catch (error) {
    console.error('Error in comprehensive evaluation:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process evaluation', message: error.message },
      { status: 500 }
    );
  }
}

