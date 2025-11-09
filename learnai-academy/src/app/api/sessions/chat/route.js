import { NextResponse } from 'next/server';
import { withAuthAndErrorHandler, validateRequest, NotFoundError } from '@/middleware/errorHandler';
import { z } from 'zod';
import AgentOrchestrator from '@/services/ai/agentOrchestrator';
import prisma from '@/lib/prisma';

// Initialize the agent orchestrator
const orchestrator = new AgentOrchestrator();

// Validation schema for chat messages
const chatMessageSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  message: z.string().min(1, 'Message cannot be empty'),
  metadata: z.object({
    role: z.enum(['tutoring', 'curriculum', 'assessment']).optional(),
    subject: z.string().optional(),
    gradeLevel: z.number().optional(),
  }).optional(),
});

/**
 * GET /api/sessions/chat
 * Get chat history for a session
 */
export const GET = withAuthAndErrorHandler(async (request, { user }) => {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
  }

  // Verify session belongs to user
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          role: true,
          content: true,
          createdAt: true,
        },
      },
    },
  });

  if (!session) {
    throw new NotFoundError('Session not found');
  }

  if (session.studentId !== user.userId && user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized access to session' },
      { status: 403 }
    );
  }

  return NextResponse.json({
    sessionId: session.id,
    subject: session.subject,
    messages: session.messages,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  });
});

/**
 * POST /api/sessions/chat
 * Send a message to the AI tutor and get a response
 */
export const POST = withAuthAndErrorHandler(async (request, { user }) => {
  // Validate request body
  const body = await validateRequest(request, chatMessageSchema);
  const { sessionId, message, metadata = {} } = body;

  // Verify session exists and belongs to user
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          gradeLevel: true,
        },
      },
    },
  });

  if (!session) {
    throw new NotFoundError('Session not found');
  }

  if (session.studentId !== user.userId && user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized access to session' },
      { status: 403 }
    );
  }

  // Add student grade level to metadata if not provided
  if (!metadata.gradeLevel && session.student) {
    metadata.gradeLevel = session.student.gradeLevel;
  }

  // Add subject to metadata if not provided
  if (!metadata.subject) {
    metadata.subject = session.subject;
  }

  // Route message through agent orchestrator
  const response = await orchestrator.routeMessage(sessionId, message, metadata);

  // Save user message to database
  await prisma.message.create({
    data: {
      sessionId,
      role: 'user',
      content: message,
    },
  });

  // Save assistant response to database
  const assistantMessage = await prisma.message.create({
    data: {
      sessionId,
      role: 'assistant',
      content: response.message,
    },
  });

  // Update session timestamp
  await prisma.session.update({
    where: { id: sessionId },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({
    success: true,
    sessionId,
    message: {
      id: assistantMessage.id,
      role: 'assistant',
      content: response.message,
      createdAt: assistantMessage.createdAt,
    },
    metadata: {
      subject: metadata.subject,
      agentRole: metadata.role || 'tutoring',
      confidence: response.confidence,
      suggestedActions: response.suggestedActions,
    },
  });
});
