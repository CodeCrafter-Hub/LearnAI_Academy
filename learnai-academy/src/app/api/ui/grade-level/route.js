import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { gradeLevelUIService } from '@/services/ui/gradeLevelUIService.js';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const uiRequestSchema = z.object({
  action: z.enum(['getConfig', 'evaluate']),
  gradeLevel: z.number().int().min(-1).max(12),
  currentUI: z.object({}).optional(),
});

/**
 * POST /api/ui/grade-level
 * Get grade-level UI configuration or evaluate current UI
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
    const data = uiRequestSchema.parse(body);

    let result;

    switch (data.action) {
      case 'getConfig':
        // Get recommended UI configuration
        result = gradeLevelUIService.getUIConfiguration(data.gradeLevel);
        break;

      case 'evaluate':
        // Evaluate current UI against grade requirements
        result = gradeLevelUIService.evaluateUISetup(data.gradeLevel, data.currentUI || {});
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
    console.error('Error in grade-level UI service:', error);

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
 * GET /api/ui/grade-level
 * Get UI configuration for grade level
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
    const gradeLevel = searchParams.get('gradeLevel');

    if (!gradeLevel) {
      return NextResponse.json(
        { error: 'gradeLevel is required' },
        { status: 400 }
      );
    }

    const grade = parseInt(gradeLevel);
    if (isNaN(grade) || grade < -1 || grade > 12) {
      return NextResponse.json(
        { error: 'Invalid grade level' },
        { status: 400 }
      );
    }

    const config = gradeLevelUIService.getUIConfiguration(grade);

    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error) {
    console.error('Error fetching UI config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch UI configuration' },
      { status: 500 }
    );
  }
}

