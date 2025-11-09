import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { curriculumGeneratorService } from '@/services/curriculum/curriculumGeneratorService.js';
import { presentationGeneratorService } from '@/services/curriculum/presentationGeneratorService.js';
import { teachingAidGeneratorService } from '@/services/curriculum/teachingAidGeneratorService.js';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const generateCurriculumSchema = z.object({
  action: z.enum(['curriculum', 'units', 'lessonPlan', 'lessonPlans', 'presentation', 'teachingAid']),
  subjectId: z.string().uuid(),
  gradeLevel: z.number().int().min(-1).max(12), // -1 = Preschool, 0 = Pre-K, 1-12 = Grades
  academicYear: z.string().optional(),
  // Curriculum-specific
  unitCount: z.number().int().min(1).max(20).optional(),
  // Unit-specific
  unitId: z.string().uuid().optional(),
  // Lesson plan-specific
  lessonPlanId: z.string().uuid().optional(),
  lessonPlanCount: z.number().int().min(1).max(10).optional(),
  // Presentation-specific
  presentationType: z.enum(['SLIDES', 'VIDEO', 'INTERACTIVE', 'AUDIO_ONLY', 'HYBRID']).optional(),
  // Teaching aid-specific
  teachingAidType: z.enum(['VISUAL', 'MANIPULATIVE', 'WORKSHEET', 'GAME', 'SIMULATION', 'ANIMATION', 'POSTER', 'FLASHCARD']).optional(),
  // Options
  options: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
    durationMinutes: z.number().int().min(15).max(60).optional(),
    includeAllComponents: z.boolean().optional(),
  }).optional(),
});

/**
 * POST /api/curriculum/generate
 * Generate formal curriculum components
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
    const data = generateCurriculumSchema.parse(body);

    let result;

    switch (data.action) {
      case 'curriculum':
        // Generate full-year curriculum
        result = await curriculumGeneratorService.generateCurriculum(
          data.subjectId,
          data.gradeLevel,
          data.academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
          {
            name: data.options?.name,
            description: data.options?.description,
            unitCount: data.unitCount || 5,
            includeScopeSequence: true,
          }
        );
        break;

      case 'units':
        // Generate units for existing curriculum
        if (!data.unitId && !data.academicYear) {
          return NextResponse.json(
            { error: 'Either unitId or academicYear with subjectId and gradeLevel required' },
            { status: 400 }
          );
        }

        // Find curriculum
        const curriculum = await prisma.curriculum.findUnique({
          where: {
            subjectId_gradeLevel_academicYear: {
              subjectId: data.subjectId,
              gradeLevel: data.gradeLevel,
              academicYear: data.academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
            },
          },
        });

        if (!curriculum) {
          return NextResponse.json(
            { error: 'Curriculum not found. Generate curriculum first.' },
            { status: 404 }
          );
        }

        const subject = await prisma.subject.findUnique({
          where: { id: data.subjectId },
        });

        result = await curriculumGeneratorService.generateUnitsForCurriculum(
          curriculum.id,
          subject.slug,
          data.gradeLevel,
          data.unitCount || 5
        );
        break;

      case 'lessonPlan':
        // Generate single lesson plan
        if (!data.unitId) {
          return NextResponse.json(
            { error: 'unitId is required for lesson plan generation' },
            { status: 400 }
          );
        }

        result = await curriculumGeneratorService.generateLessonPlanForUnit(
          data.unitId,
          {
            name: data.options?.name,
            description: data.options?.description,
            durationMinutes: data.options?.durationMinutes || 30,
            difficulty: data.options?.difficulty || 'MEDIUM',
            includeAllComponents: data.options?.includeAllComponents !== false,
          }
        );
        break;

      case 'lessonPlans':
        // Generate multiple lesson plans
        if (!data.unitId) {
          return NextResponse.json(
            { error: 'unitId is required for lesson plans generation' },
            { status: 400 }
          );
        }

        result = await curriculumGeneratorService.generateLessonPlansForUnit(
          data.unitId,
          data.lessonPlanCount || 5,
          {
            name: data.options?.name,
            durationMinutes: data.options?.durationMinutes || 30,
            difficulty: data.options?.difficulty || 'MEDIUM',
            includeAllComponents: data.options?.includeAllComponents !== false,
          }
        );
        break;

      case 'presentation':
        // Generate presentation
        if (!data.lessonPlanId) {
          return NextResponse.json(
            { error: 'lessonPlanId is required for presentation generation' },
            { status: 400 }
          );
        }

        result = await presentationGeneratorService.generatePresentation(
          data.lessonPlanId,
          data.presentationType || 'SLIDES',
          {
            name: data.options?.name,
          }
        );
        break;

      case 'teachingAid':
        // Generate teaching aid
        if (!data.lessonPlanId) {
          return NextResponse.json(
            { error: 'lessonPlanId is required for teaching aid generation' },
            { status: 400 }
          );
        }

        if (!data.teachingAidType) {
          return NextResponse.json(
            { error: 'teachingAidType is required' },
            { status: 400 }
          );
        }

        result = await teachingAidGeneratorService.generateTeachingAid(
          data.lessonPlanId,
          data.teachingAidType,
          {
            name: data.options?.name,
            description: data.options?.description,
          }
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
    console.error('Error generating curriculum:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate curriculum', message: error.message },
      { status: 500 }
    );
  }
}

