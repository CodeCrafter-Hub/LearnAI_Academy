import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { agentOrchestrator } from '@/services/ai/agentOrchestrator';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const curriculumRequestSchema = z.object({
  task: z.enum(['lessonPlan', 'practiceProblems', 'contentItems']),
  subjectId: z.string().uuid(),
  topicId: z.string().uuid(),
  gradeLevel: z.number().int().min(0).max(12),
  options: z.object({
    count: z.number().int().min(1).max(50).optional(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
    contentType: z.enum(['EXPLANATION', 'EXAMPLE', 'PRACTICE', 'QUIZ', 'PROJECT']).optional(),
    includeStandards: z.boolean().optional(),
    includeAssessments: z.boolean().optional(),
    includePracticeProblems: z.boolean().optional(),
  }).optional(),
});

/**
 * POST /api/curriculum
 * Generate curriculum content (lesson plans, practice problems, content items)
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
    const data = curriculumRequestSchema.parse(body);

    // Verify subject and topic exist
    const subject = await prisma.subject.findUnique({
      where: { id: data.subjectId },
    });

    const topic = await prisma.topic.findUnique({
      where: { id: data.topicId },
      include: { subject: true },
    });

    if (!subject || !topic) {
      return NextResponse.json(
        { error: 'Subject or topic not found' },
        { status: 404 }
      );
    }

    if (topic.subjectId !== data.subjectId) {
      return NextResponse.json(
        { error: 'Topic does not belong to subject' },
        { status: 400 }
      );
    }

    // Get subject slug for agent routing
    const subjectSlug = subject.slug;

    // Generate curriculum content
    let result;
    const options = data.options || {};

    switch (data.task) {
      case 'lessonPlan':
        result = await agentOrchestrator.generateCurriculum(
          'lessonPlan',
          subjectSlug,
          topic.name,
          data.gradeLevel,
          options
        );
        break;

      case 'practiceProblems':
        result = await agentOrchestrator.generateCurriculum(
          'practiceProblems',
          subjectSlug,
          topic.name,
          data.gradeLevel,
          {
            count: options.count || 10,
            difficulty: options.difficulty || 'MEDIUM',
          }
        );
        break;

      case 'contentItems':
        result = await agentOrchestrator.generateCurriculum(
          'contentItems',
          subjectSlug,
          topic.name,
          data.gradeLevel,
          {
            contentType: options.contentType || 'EXPLANATION',
            count: options.count || 5,
          }
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid task type' },
          { status: 400 }
        );
    }

    // Save to database if content was generated successfully
    let savedItems = [];
    if (result && !result.error) {
      try {
        if (data.task === 'practiceProblems' && Array.isArray(result)) {
          // Save each practice problem as a content item
          for (const problem of result) {
            const saved = await prisma.contentItem.create({
              data: {
                topicId: data.topicId,
                contentType: 'PRACTICE',
                title: `Practice Problem: ${topic.name}`,
                content: problem,
                difficulty: options.difficulty || 'MEDIUM',
                isAiGenerated: true,
                metadata: {
                  gradeLevel: data.gradeLevel,
                  generatedAt: new Date().toISOString(),
                },
              },
            });
            savedItems.push(saved);
          }
        } else if (data.task === 'lessonPlan') {
          // Save lesson plan as a content item
          const saved = await prisma.contentItem.create({
            data: {
              topicId: data.topicId,
              contentType: 'EXPLANATION',
              title: `Lesson Plan: ${topic.name}`,
              content: result,
              difficulty: options.difficulty || 'MEDIUM',
              isAiGenerated: true,
              metadata: {
                gradeLevel: data.gradeLevel,
                generatedAt: new Date().toISOString(),
              },
            },
          });
          savedItems.push(saved);
        } else if (data.task === 'contentItems' && Array.isArray(result)) {
          // Save content items
          for (const item of result) {
            const saved = await prisma.contentItem.create({
              data: {
                topicId: data.topicId,
                contentType: options.contentType || 'EXPLANATION',
                title: item.title || `Content: ${topic.name}`,
                content: item,
                difficulty: options.difficulty || 'MEDIUM',
                isAiGenerated: true,
                metadata: {
                  gradeLevel: data.gradeLevel,
                  generatedAt: new Date().toISOString(),
                },
              },
            });
            savedItems.push(saved);
          }
        }
      } catch (dbError) {
        console.error('Error saving curriculum to database:', dbError);
        // Continue even if database save fails
      }
    }

    return NextResponse.json({
      success: true,
      task: data.task,
      subject: subject.name,
      topic: topic.name,
      gradeLevel: data.gradeLevel,
      result,
      savedItems: savedItems.length > 0 ? savedItems.map(item => ({
        id: item.id,
        title: item.title,
        contentType: item.contentType,
      })) : null,
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

/**
 * GET /api/curriculum
 * Get generated curriculum content for a topic
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
    const topicId = searchParams.get('topicId');
    const gradeLevel = searchParams.get('gradeLevel');

    if (!topicId) {
      return NextResponse.json(
        { error: 'topicId is required' },
        { status: 400 }
      );
    }

    // Get content items for this topic
    const where = {
      topicId,
      isAiGenerated: true,
    };

    if (gradeLevel) {
      where.metadata = {
        path: ['gradeLevel'],
        equals: parseInt(gradeLevel),
      };
    }

    const contentItems = await prisma.contentItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      contentItems: contentItems.map(item => ({
        id: item.id,
        title: item.title,
        contentType: item.contentType,
        difficulty: item.difficulty,
        createdAt: item.createdAt,
        metadata: item.metadata,
      })),
    });
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    return NextResponse.json(
      { error: 'Failed to fetch curriculum' },
      { status: 500 }
    );
  }
}

