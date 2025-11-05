import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { agentOrchestrator } from '@/services/ai/agentOrchestrator';
import { contentFilter } from '@/services/ai/contentFilter';
import { z } from 'zod';

const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(2000),
});

export async function POST(request, { params }) {
  try {
    // Verify authentication
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const sessionId = params.id;
    const body = await request.json();
    const { content } = messageSchema.parse(body);

    // Sanitize input to prevent prompt injection
    const sanitizedContent = contentFilter.sanitizeInput(content);

    // Check for homework cheating attempts
    if (contentFilter.isHomeworkCheating(sanitizedContent)) {
      return NextResponse.json({
        success: true,
        message: {
          role: 'assistant',
          content: "I'm here to help you learn, not to give you answers! Let's work through this together. What part are you stuck on?",
        },
      });
    }

    // Route message to appropriate AI agent
    const response = await agentOrchestrator.routeMessage(
      sessionId,
      sanitizedContent
    );

    return NextResponse.json({
      success: true,
      message: {
        role: 'assistant',
        content: response.content,
        filtered: response.filtered || false,
      },
      usage: response.usage,
    });
  } catch (error) {
    console.error('Error processing message:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    // Verify authentication
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const sessionId = params.id;

    // Get all messages for this session
    const messages = await prisma.sessionMessage.findMany({
      where: { sessionId },
      orderBy: { sequenceNumber: 'asc' },
    });

    return NextResponse.json({
      success: true,
      messages: messages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
