import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { parentInvolvementService } from '@/services/parent/parentInvolvementService.js';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const parentRequestSchema = z.object({
  action: z.enum(['report', 'activities', 'tips', 'milestones']),
  studentId: z.string().uuid(),
  // Report options
  timeRange: z.enum(['week', 'month', 'quarter']).optional(),
  includeRecommendations: z.boolean().optional(),
  // Activities options
  activityCount: z.number().int().min(1).max(10).optional(),
  subject: z.string().optional(),
  // Tips options
  tipCount: z.number().int().min(1).max(10).optional(),
  focus: z.enum(['general', 'struggling', 'advanced']).optional(),
});

/**
 * POST /api/parent/progress
 * Get parent involvement features (reports, activities, tips)
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

    // Verify user is parent of student
    const body = await request.json();
    const data = parentRequestSchema.parse(body);

    const student = await prisma.student.findUnique({
      where: { id: data.studentId },
      include: {
        parent: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Check if user is parent
    if (student.parentId !== user.id && user.role !== 'ADMIN' && user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Unauthorized - Not parent of this student' },
        { status: 403 }
      );
    }

    let result;

    switch (data.action) {
      case 'report':
        // Generate progress report
        result = await parentInvolvementService.generateProgressReport(
          data.studentId,
          {
            timeRange: data.timeRange || 'week',
            includeRecommendations: data.includeRecommendations !== false,
          }
        );
        break;

      case 'activities':
        // Generate home activities
        result = await parentInvolvementService.generateHomeActivities(
          data.studentId,
          {
            count: data.activityCount || 5,
            subject: data.subject,
          }
        );
        break;

      case 'tips':
        // Generate learning tips
        result = await parentInvolvementService.generateLearningTips(
          data.studentId,
          {
            count: data.tipCount || 5,
            focus: data.focus || 'general',
          }
        );
        break;

      case 'milestones':
        // Get celebration milestones
        result = await parentInvolvementService.generateCelebrationMilestones(
          data.studentId
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
    console.error('Error generating parent content:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate parent content', message: error.message },
      { status: 500 }
    );
  }
}

