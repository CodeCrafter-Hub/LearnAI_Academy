import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { preschoolCurriculumService } from '@/services/curriculum/preschoolCurriculumService.js';
import { preschoolActivityGenerator } from '@/services/curriculum/preschoolActivityGenerator.js';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const preschoolRequestSchema = z.object({
  action: z.enum(['curriculum', 'lessonPlan', 'activity', 'activities']),
  // Curriculum
  subjectId: z.string().uuid(),
  academicYear: z.string().optional(),
  gradeLevel: z.number().int().min(-1).max(0), // -1 = Preschool, 0 = Pre-K
  unitCount: z.number().int().min(1).max(10).optional(),
  // Lesson plan
  unitId: z.string().uuid().optional(),
  durationMinutes: z.number().int().min(10).max(30).optional(),
  includeParentGuide: z.boolean().optional(),
  // Activity
  topic: z.string().optional(),
  activityType: z.enum(['play', 'sensory', 'movement', 'art', 'music']).optional(),
});

/**
 * POST /api/curriculum/preschool
 * Generate preschool/Pre-K curriculum and content
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
    const data = preschoolRequestSchema.parse(body);

    let result;

    switch (data.action) {
      case 'curriculum':
        // Generate preschool or Pre-K curriculum
        if (data.gradeLevel === -1) {
          result = await preschoolCurriculumService.generatePreschoolCurriculum(
            data.subjectId,
            data.academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
            {
              unitCount: data.unitCount || 6,
            }
          );
        } else {
          result = await preschoolCurriculumService.generatePreKCurriculum(
            data.subjectId,
            data.academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
            {
              unitCount: data.unitCount || 8,
            }
          );
        }
        break;

      case 'lessonPlan':
        // Generate preschool lesson plan
        if (!data.unitId) {
          return NextResponse.json(
            { error: 'unitId is required for lesson plan generation' },
            { status: 400 }
          );
        }

        result = await preschoolCurriculumService.generatePreschoolLessonPlan(
          data.unitId,
          {
            durationMinutes: data.durationMinutes || 15,
            includeParentGuide: data.includeParentGuide !== false,
          }
        );
        break;

      case 'activity':
        // Generate single activity
        if (!data.topic) {
          return NextResponse.json(
            { error: 'topic is required for activity generation' },
            { status: 400 }
          );
        }

        if (!data.activityType) {
          return NextResponse.json(
            { error: 'activityType is required' },
            { status: 400 }
          );
        }

        const activityMethod = `generate${data.activityType.charAt(0).toUpperCase() + data.activityType.slice(1)}Activity`;
        result = await preschoolActivityGenerator[activityMethod](
          data.topic,
          data.gradeLevel || -1
        );
        break;

      case 'activities':
        // Generate multiple activities
        if (!data.topic) {
          return NextResponse.json(
            { error: 'topic is required for activities generation' },
            { status: 400 }
          );
        }

        result = await preschoolActivityGenerator.getRecommendedActivities(
          data.topic,
          data.gradeLevel || -1
        );
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
    console.error('Error generating preschool content:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate preschool content', message: error.message },
      { status: 500 }
    );
  }
}

