import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import agentOrchestrator from '@/services/ai/agentOrchestrator';
import { z } from 'zod';

// Force dynamic rendering - uses authentication
export const dynamic = 'force-dynamic';

const chatSchema = z.object({
  sessionId: z.string().uuid(),
  message: z.string().min(1).max(4000),
  context: z.object({
    isVoiceInput: z.boolean().optional(),
  }).optional(),
});

/**
 * POST /api/sessions/chat
 * Send a message in a learning session and get AI response
 */
export async function POST(request) {
  try {
    // Verify authentication
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = chatSchema.parse(body);

    // Get session and verify access
    const session = await prisma.learningSession.findUnique({
      where: { id: data.sessionId },
      include: {
        student: true,
        subject: true,
        topic: true,
        messages: {
          orderBy: { sequenceNumber: 'desc' },
          take: 10, // Last 10 messages for context
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this session
    if (session.student.userId !== user.userId && session.student.parentId !== user.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get student progress for this topic
    const progress = await prisma.studentProgress.findUnique({
      where: {
        studentId_topicId: {
          studentId: session.studentId,
          topicId: session.topicId,
        },
      },
    });

    // Save user message
    const nextSequenceNumber = (session.messages[0]?.sequenceNumber || 0) + 1;
    await prisma.sessionMessage.create({
      data: {
        sessionId: session.id,
        role: 'user',
        content: data.message,
        sequenceNumber: nextSequenceNumber,
        metadata: data.context || {},
      },
    });

    // Prepare context for AI agent
    const context = {
      sessionId: session.id,
      studentId: session.studentId,
      subject: session.subject.slug,
      topic: session.topic.name,
      topicSlug: session.topic.slug,
      gradeLevel: session.student.gradeLevel,
      difficulty: session.difficultyLevel,
      mode: session.sessionMode,
      isVoiceMode: session.sessionData?.isVoiceMode || false,
      messageHistory: session.messages.reverse().map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      progress: progress ? {
        masteryLevel: progress.masteryLevel,
        strengths: progress.strengths,
        weaknesses: progress.weaknesses,
      } : null,
    };

    // Get AI response
    const agentRole = session.sessionData?.agentRole || 'tutoring';
    const aiResponse = await agentOrchestrator.routeMessage(
      data.message,
      context,
      agentRole
    );

    // Save AI response
    await prisma.sessionMessage.create({
      data: {
        sessionId: session.id,
        role: 'assistant',
        content: aiResponse.content,
        sequenceNumber: nextSequenceNumber + 1,
        metadata: {
          model: aiResponse.model,
          tokensUsed: aiResponse.usage?.totalTokens,
          responseTime: aiResponse.responseTime,
        },
      },
    });

    // Update session stats
    await prisma.learningSession.update({
      where: { id: session.id },
      data: {
        messagesCount: { increment: 2 }, // User message + AI response
      },
    });

    return NextResponse.json({
      success: true,
      message: aiResponse.content,
      metadata: {
        model: aiResponse.model,
        tokensUsed: aiResponse.usage?.totalTokens,
        responseTime: aiResponse.responseTime,
      },
    });

  } catch (error) {
    console.error('Chat error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process message', details: error.message },
      { status: 500 }
    );
  }
}
