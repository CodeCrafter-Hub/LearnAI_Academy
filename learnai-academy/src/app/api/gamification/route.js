import { NextResponse } from 'next/server';
import { withAuthAndErrorHandler } from '@/middleware/errorHandler';
import GamificationManager from '@/lib/gamification';

// Initialize gamification manager
const gamificationManager = new GamificationManager();

/**
 * GET /api/gamification
 * Get player's gamification profile
 */
export const GET = withAuthAndErrorHandler(async (request, { user }) => {
  const studentId = user.userId;

  // Initialize player if doesn't exist
  const player = gamificationManager.initializePlayer(studentId, {
    name: user.name || 'Student',
  });

  // Get comprehensive profile
  const profile = gamificationManager.getPlayerProfile(studentId);

  // Get badge showcase
  const topBadges = gamificationManager.getBadgeShowcase(studentId, 5);

  // Get daily challenges
  const dailyChallenges = gamificationManager.createDailyChallenge(studentId);

  return NextResponse.json({
    profile,
    topBadges,
    dailyChallenges,
    currentStreak: player.dailyStreak,
    totalPoints: player.totalPoints,
    level: player.level,
    rank: player.rank,
  });
});

/**
 * POST /api/gamification/award-xp
 * Award XP to a player
 */
export const POST = withAuthAndErrorHandler(async (request, { user }) => {
  const body = await request.json();
  const { amount, reason } = body;
  const studentId = user.userId;

  if (!amount || amount <= 0) {
    return NextResponse.json(
      { error: 'Invalid XP amount' },
      { status: 400 }
    );
  }

  // Award XP
  const result = gamificationManager.awardXP(studentId, amount, reason);

  // Check for new achievements
  const newAchievements = gamificationManager.checkAchievements(studentId);

  return NextResponse.json({
    ...result,
    newAchievements,
  });
});
