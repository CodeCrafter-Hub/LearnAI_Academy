import { NextResponse } from 'next/server';
import { withAuthAndErrorHandler } from '@/middleware/errorHandler';
import GamificationManager from '@/lib/gamification';

const gamificationManager = new GamificationManager();

/**
 * GET /api/gamification/challenges
 * Get daily challenges for the player
 */
export const GET = withAuthAndErrorHandler(async (request, { user }) => {
  const studentId = user.userId;

  // Initialize player if needed
  gamificationManager.initializePlayer(studentId, {
    name: user.name || 'Student',
  });

  // Get or create daily challenges
  const challenges = gamificationManager.createDailyChallenge(studentId);

  return NextResponse.json({
    challenges,
  });
});

/**
 * POST /api/gamification/challenges/:id/progress
 * Update progress on a challenge
 */
export const POST = withAuthAndErrorHandler(async (request, { user }) => {
  const body = await request.json();
  const { challengeId, progress } = body;
  const studentId = user.userId;

  if (!challengeId || typeof progress !== 'number') {
    return NextResponse.json(
      { error: 'Invalid challenge ID or progress' },
      { status: 400 }
    );
  }

  // Update challenge progress
  const challenge = gamificationManager.updateChallengeProgress(
    studentId,
    challengeId,
    progress
  );

  if (!challenge) {
    return NextResponse.json(
      { error: 'Challenge not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    challenge,
    completed: challenge.completed,
    ...(challenge.completed && {
      rewards: {
        xp: challenge.xpReward,
        points: challenge.pointsReward,
      },
    }),
  });
});
