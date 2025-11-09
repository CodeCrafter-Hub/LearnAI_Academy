import { NextResponse } from 'next/server';
import { withAuthAndErrorHandler } from '@/middleware/errorHandler';
import GamificationManager from '@/lib/gamification';
import prisma from '@/lib/prisma';

// Lazy initialization to avoid localStorage on server
function getGamificationManager() {
  if (typeof window === 'undefined') {
    return {
      getLeaderboard: () => [],
    };
  }
  return new GamificationManager();
}

/**
 * GET /api/gamification/leaderboard
 * Get leaderboard data
 */
export const GET = withAuthAndErrorHandler(async (request, { user }) => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'xp'; // xp or points
  const scope = searchParams.get('scope') || 'class'; // class, school, global
  const limit = parseInt(searchParams.get('limit') || '10');

  // Get students for the scope
  let students = [];

  if (scope === 'global') {
    // Get all students
    students = await prisma.student.findMany({
      select: {
        id: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });
  } else if (scope === 'school') {
    // Get students from same school (if we have school data)
    students = await prisma.student.findMany({
      take: 100, // Limit for performance
      select: {
        id: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });
  } else {
    // Default to a sample of students for class
    students = await prisma.student.findMany({
      take: 50,
      select: {
        id: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  // Map to format expected by gamification manager
  const playersData = students.map(student => ({
    studentId: student.id,
    name: student.user?.name || 'Student',
  }));

  // Update leaderboard
  const leaderboard = gamificationManager.updateLeaderboard(type, scope, playersData);

  // Get player's position
  const playerPosition = gamificationManager.getPlayerPosition(user.userId, type, scope);

  return NextResponse.json({
    leaderboard: {
      ...leaderboard,
      rankings: leaderboard.rankings.slice(0, limit),
    },
    playerPosition,
  });
});
