import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (studentId) {
      // Get achievements for specific student
      const [allAchievements, unlockedAchievements] = await Promise.all([
        prisma.achievement.findMany({
          where: { isActive: true },
          orderBy: { orderIndex: 'asc' },
        }),
        prisma.studentAchievement.findMany({
          where: { studentId },
          include: {
            achievement: true,
          },
        }),
      ]);

      const unlockedIds = new Set(unlockedAchievements.map(a => a.achievementId));

      return NextResponse.json({
        achievements: allAchievements.map(a => ({
          id: a.id,
          code: a.code,
          name: a.name,
          description: a.description,
          icon: a.icon,
          category: a.category,
          pointsReward: a.pointsReward,
          rarity: a.rarity,
          unlocked: unlockedIds.has(a.id),
          unlockedAt: unlockedAchievements.find(ua => ua.achievementId === a.id)?.unlockedAt,
        })),
      });
    } else {
      // Get all achievements
      const achievements = await prisma.achievement.findMany({
        where: { isActive: true },
        orderBy: { orderIndex: 'asc' },
      });

      return NextResponse.json({ achievements });
    }
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}
