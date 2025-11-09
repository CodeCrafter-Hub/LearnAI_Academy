import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

// Force dynamic rendering - uses authentication
export const dynamic = 'force-dynamic';

const createSessionSchema = z.object({
  studentId: z.string().uuid(),
  subjectId: z.string().uuid(),
  topicId: z.string().uuid(),
  mode: z.enum(['PRACTICE', 'HELP', 'ASSESSMENT']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  isVoiceMode: z.boolean().optional(),
  agentRole: z.enum(['tutoring', 'curriculum', 'assessment']).optional(),
});

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
    const data = createSessionSchema.parse(body);

    // Verify student belongs to user
    const student = await prisma.student.findUnique({
      where: { id: data.studentId },
    });

    if (!student || (student.userId !== user.userId && student.parentId !== user.userId)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Create learning session
    const session = await prisma.learningSession.create({
      data: {
        studentId: data.studentId,
        subjectId: data.subjectId,
        topicId: data.topicId,
        sessionMode: data.mode,
        difficultyLevel: data.difficulty,
        startedAt: new Date(),
        sessionData: {
          isVoiceMode: data.isVoiceMode || false,
          agentRole: data.agentRole || 'tutoring',
        },
      },
      include: {
        student: true,
        subject: true,
        topic: true,
      },
    });

    // Create first welcome message
    const subject = session.subject;
    const topic = session.topic;
    const welcomeMessage = data.mode === 'PRACTICE'
      ? `Great! Let's practice ${topic.name}! I'll give you problems to solve at ${data.difficulty.toLowerCase()} level. Ready for your first challenge?`
      : `Hi ${student.firstName}! I'm excited to help you learn about ${topic.name}! What would you like to know?`;

    await prisma.sessionMessage.create({
      data: {
        sessionId: session.id,
        role: 'assistant',
        content: welcomeMessage,
        sequenceNumber: 1,
      },
    });

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        studentId: session.studentId,
        subject: session.subject.name,
        subjectSlug: session.subject.slug,
        topic: session.topic.name,
        mode: session.sessionMode,
        difficulty: session.difficultyLevel,
        startedAt: session.startedAt,
        welcomeMessage,
      },
    });
  } catch (error) {
    console.error('Error creating session:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
