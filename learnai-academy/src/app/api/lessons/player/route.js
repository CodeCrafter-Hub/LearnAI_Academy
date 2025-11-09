import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { lessonPlayerService } from '@/services/lesson/lessonPlayerService.js';
import { activityCompletionService } from '@/services/lesson/activityCompletionService.js';
import { lessonProgressService } from '@/services/lesson/lessonProgressService.js';
import { noteTakingService } from '@/services/lesson/noteTakingService.js';
import { interactiveElementsService } from '@/services/lesson/interactiveElementsService.js';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const lessonActionSchema = z.object({
  action: z.enum(['initialize', 'getContent', 'getProgress', 'pause', 'complete', 'updateProgress']),
  lessonPlanId: z.string().uuid().optional(),
  lessonId: z.string().uuid().optional(),
  section: z.string().optional(),
  resume: z.boolean().optional(),
  progressData: z.object({}).optional(),
});

const activityActionSchema = z.object({
  action: z.enum(['start', 'submit', 'getProgress', 'reset']),
  activityId: z.string().uuid(),
  submission: z.object({}).optional(),
});

const noteActionSchema = z.object({
  action: z.enum(['create', 'update', 'delete', 'get', 'search']),
  lessonId: z.string().uuid(),
  noteId: z.string().uuid().optional(),
  noteData: z.object({}).optional(),
  search: z.string().optional(),
});

/**
 * POST /api/lessons/player
 * Lesson player actions
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
    const { type, ...data } = body;

    let result;

    switch (type) {
      case 'lesson':
        {
          const validated = lessonActionSchema.parse(data);
          result = await handleLessonAction(validated, user);
        }
        break;

      case 'activity':
        {
          const validated = activityActionSchema.parse(data);
          result = await handleActivityAction(validated, user);
        }
        break;

      case 'note':
        {
          const validated = noteActionSchema.parse(data);
          result = await handleNoteAction(validated, user);
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Error in lesson player:', error);

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
 * Handle lesson actions
 */
async function handleLessonAction(data, user) {
  const { action, lessonPlanId, lessonId, section, resume, progressData } = data;

  switch (action) {
    case 'initialize':
      if (!lessonPlanId) {
        throw new Error('lessonPlanId is required for initialize');
      }

      // Get student ID (first student for now)
      const student = await getStudentForUser(user.id);
      if (!student) {
        throw new Error('Student not found');
      }

      return await lessonPlayerService.initializeLesson(lessonPlanId, student.id, { resume });

    case 'getContent':
      if (!lessonId) {
        throw new Error('lessonId is required for getContent');
      }
      return await lessonPlayerService.getLessonContent(lessonId, section);

    case 'getProgress':
      if (!lessonId) {
        throw new Error('lessonId is required for getProgress');
      }
      return await lessonProgressService.getProgress(lessonId);

    case 'pause':
      if (!lessonId) {
        throw new Error('lessonId is required for pause');
      }
      return await lessonPlayerService.pauseLesson(lessonId);

    case 'complete':
      if (!lessonId) {
        throw new Error('lessonId is required for complete');
      }
      return await lessonPlayerService.completeLesson(lessonId);

    case 'updateProgress':
      if (!lessonId) {
        throw new Error('lessonId is required for updateProgress');
      }
      return await lessonProgressService.updateProgress(lessonId, progressData || {});

    default:
      throw new Error(`Invalid lesson action: ${action}`);
  }
}

/**
 * Handle activity actions
 */
async function handleActivityAction(data, user) {
  const { action, activityId, submission } = data;

  switch (action) {
    case 'start':
      return await activityCompletionService.startActivity(activityId);

    case 'submit':
      if (!submission) {
        throw new Error('submission is required for submit');
      }
      return await activityCompletionService.submitActivity(activityId, submission);

    case 'getProgress':
      // Get lesson from activity
      const activity = await prisma.lessonActivity.findUnique({
        where: { id: activityId },
      });
      if (!activity) {
        throw new Error('Activity not found');
      }
      return await activityCompletionService.getActivityProgress(activity.lessonId);

    case 'reset':
      return await activityCompletionService.resetActivity(activityId);

    default:
      throw new Error(`Invalid activity action: ${action}`);
  }
}

/**
 * Handle note actions
 */
async function handleNoteAction(data, user) {
  const { action, lessonId, noteId, noteData, search } = data;

  switch (action) {
    case 'create':
      if (!noteData) {
        throw new Error('noteData is required for create');
      }
      return await noteTakingService.createNote(lessonId, noteData);

    case 'update':
      if (!noteId) {
        throw new Error('noteId is required for update');
      }
      if (!noteData) {
        throw new Error('noteData is required for update');
      }
      return await noteTakingService.updateNote(noteId, noteData);

    case 'delete':
      if (!noteId) {
        throw new Error('noteId is required for delete');
      }
      return await noteTakingService.deleteNote(noteId);

    case 'get':
      return await noteTakingService.getNotes(lessonId);

    case 'search':
      if (!search) {
        throw new Error('search query is required');
      }
      return await noteTakingService.searchNotes(lessonId, search);

    default:
      throw new Error(`Invalid note action: ${action}`);
  }
}

/**
 * Get student for user
 */
async function getStudentForUser(userId) {
  return await prisma.student.findFirst({
    where: {
      parentId: userId,
    },
  });
}

