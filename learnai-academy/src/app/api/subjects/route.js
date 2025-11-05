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

    // Try cache first (gracefully handle Redis failures)
    let cached = null;
    try {
      cached = await cacheService.getCachedSubjects();
      if (cached) {
        return NextResponse.json(cached);
      }
    } catch (cacheError) {
      // Continue without cache if Redis fails
      console.warn('Cache unavailable, fetching from database:', cacheError.message);
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

    // Cache for 24 hours (gracefully handle Redis failures)
    try {
      await cacheService.setCachedSubjects(subjects, 86400);
    } catch (cacheError) {
      // Continue even if caching fails
      console.warn('Failed to cache subjects:', cacheError.message);
    }

    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    
    // Provide more details in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Failed to fetch subjects';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      },
      { status: 500 }
    );
  }
}
