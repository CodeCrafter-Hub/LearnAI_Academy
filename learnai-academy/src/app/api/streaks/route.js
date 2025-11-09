import { NextResponse } from 'next/server';
import { withAuthAndErrorHandler } from '@/middleware/errorHandler';
import { StreakManager } from '@/lib/studyStreaks';

// Initialize streak manager
const streakManager = new StreakManager();

/**
 * GET /api/streaks
 * Get student's streak data
 */
export const GET = withAuthAndErrorHandler(async (request, { user }) => {
  const studentId = user.userId;

  // Get streak data
  const streakData = streakManager.getStreak(studentId);

  // Get streak history
  const history = streakManager.getStreakHistory(studentId, 30); // Last 30 days

  // Get milestones
  const milestones = streakManager.getStreakMilestones(studentId);

  return NextResponse.json({
    current: streakData,
    history,
    milestones,
  });
});

/**
 * POST /api/streaks/log
 * Log study activity for streak tracking
 */
export const POST = withAuthAndErrorHandler(async (request, { user }) => {
  const body = await request.json();
  const { activityType, duration, subject } = body;
  const studentId = user.userId;

  // Record activity
  const result = streakManager.recordActivity(studentId, {
    type: activityType || 'study',
    duration: duration || 0,
    subject: subject || 'general',
    timestamp: new Date().toISOString(),
  });

  // Check for streak achievements
  const achievements = [];
  if (result.milestoneReached) {
    achievements.push({
      type: 'streak_milestone',
      milestone: result.milestone,
      days: result.currentStreak,
    });
  }

  return NextResponse.json({
    streakUpdated: result.streakContinued,
    currentStreak: result.currentStreak,
    longestStreak: result.longestStreak,
    achievements,
  });
});
