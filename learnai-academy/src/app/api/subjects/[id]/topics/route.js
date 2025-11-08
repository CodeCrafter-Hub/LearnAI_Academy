import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  gradeLevel: z.coerce.number().int().min(0).max(12).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
});

/**
 * GET /api/subjects/[id]/topics
 * Get topics for a subject with pagination
 * Query params: page, limit, gradeLevel, difficulty
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const query = paginationSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      gradeLevel: searchParams.get('gradeLevel'),
      difficulty: searchParams.get('difficulty'),
    });

    // Verify subject exists
    const subject = await prisma.subject.findUnique({
      where: { id },
    });

    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }

    // Build filter conditions
    const where = {
      subjectId: id,
      isActive: true,
      ...(query.gradeLevel && { gradeLevel: query.gradeLevel }),
      ...(query.difficulty && { difficulty: query.difficulty }),
    };

    // Calculate pagination
    const skip = (query.page - 1) * query.limit;

    // Get topics with pagination
    const [topics, totalCount] = await Promise.all([
      prisma.topic.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: [
          { orderIndex: 'asc' },
          { name: 'asc' },
        ],
        include: {
          _count: {
            select: {
              contentItems: true,
            },
          },
        },
      }),
      prisma.topic.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / query.limit);

    return NextResponse.json({
      success: true,
      data: topics,
      pagination: {
        page: query.page,
        limit: query.limit,
        totalCount,
        totalPages,
        hasMore: query.page < totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching topics:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}
