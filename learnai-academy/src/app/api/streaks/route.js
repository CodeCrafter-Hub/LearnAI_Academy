import { NextResponse } from 'next/server';
import { withAuthAndErrorHandler } from '@/middleware/errorHandler';
import { StreakTracker } from '@/lib/studyStreaks';
import { streakService } from '@/services/study/streakService';

// Use the service instead of direct instantiation (avoids localStorage on server)

/**
 * GET /api/streaks
 * Get student's streak data
 */
export const GET = withAuthAndErrorHandler(async (request, { user }) => {
  const studentId = user.userId;

  // Get streak data using the service (uses database, not localStorage)
  const streakData = await streakService.getCurrentStreak(studentId);
  const history = await streakService.getStreakHistory(studentId, 30);
  const milestones = await streakService.getStreakMilestones(studentId);

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

  // Record activity using the service
  const result = await streakService.recordActivity(studentId, {
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
