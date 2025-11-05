import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cacheService } from '@/services/cache/cacheService';

// Force dynamic rendering - this route requires runtime data
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Early return if executed during build (no real request)
    if (!request || !request.url || process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json(
        { error: 'Route not available during build' },
        { status: 503 }
      );
    }

    // Try cache first
    const cached = await cacheService.getCachedSubjects();
    if (cached) {
      return NextResponse.json(cached);
    }

    // Get grade level from query params
    const { searchParams } = new URL(request.url);
    const gradeLevel = searchParams.get('gradeLevel');

    // Build query
    const where = {
      isActive: true,
    };

    if (gradeLevel) {
      const grade = parseInt(gradeLevel);
      where.minGrade = { lte: grade };
      where.maxGrade = { gte: grade };
    }

    // Fetch subjects with topics
    const subjects = await prisma.subject.findMany({
      where,
      include: {
        topics: {
          where: { isActive: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });

    // Cache for 24 hours
    await cacheService.setCachedSubjects(subjects, 86400);

    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
}
