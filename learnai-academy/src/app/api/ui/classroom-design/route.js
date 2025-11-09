import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { classroomDesignService } from '@/services/ui/classroomDesignService.js';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/ui/classroom-design
 * Get classroom design for grade and subject
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
    const subjectSlug = searchParams.get('subjectSlug');

    if (!gradeLevel || !subjectSlug) {
      return NextResponse.json(
        { error: 'gradeLevel and subjectSlug are required' },
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

    // Get classroom design
    const design = classroomDesignService.getClassroomDesign(grade, subjectSlug);
    const recommendations = classroomDesignService.generateDesignRecommendations(grade, subjectSlug);

    return NextResponse.json({
      success: true,
      design,
      recommendations,
    });
  } catch (error) {
    console.error('Error fetching classroom design:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classroom design' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ui/classroom-design
 * Evaluate or customize classroom design
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
    const { action, gradeLevel, subjectSlug, customizations } = body;

    if (action === 'getRecommendations') {
      if (!gradeLevel || !subjectSlug) {
        return NextResponse.json(
          { error: 'gradeLevel and subjectSlug are required' },
          { status: 400 }
        );
      }

      const recommendations = classroomDesignService.generateDesignRecommendations(
        gradeLevel,
        subjectSlug
      );

      return NextResponse.json({
        success: true,
        recommendations,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in classroom design:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

