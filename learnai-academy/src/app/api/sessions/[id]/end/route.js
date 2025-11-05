import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { agentOrchestrator } from '@/services/ai/agentOrchestrator';
import { progressTracker } from '@/services/analytics/progressTracker';
import { achievementChecker } from '@/services/analytics/achievementChecker';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    // Verify authentication
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const sessionId = params.id;

    // Get session details
    const session = await prisma.learningSession.findUnique({
      where: { id: sessionId },
      include: {
        student: true,
        topic: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Calculate session metrics
    const endedAt = new Date();
    const durationMinutes = Math.round(
      (endedAt.getTime() - session.startedAt.getTime()) / 60000
    );

    // Calculate points earned
    const basePoints = Math.max(10, Math.min(durationMinutes * 2, 50));
    const difficultyMultiplier = 
      session.difficultyLevel === 'HARD' ? 1.5 :
      session.difficultyLevel === 'MEDIUM' ? 1.2 : 1;
    const modeBonus = session.sessionMode === 'PRACTICE' ? 10 : 0;
    const pointsEarned = Math.round(basePoints * difficultyMultiplier) + modeBonus;

    // Update session
    const updatedSession = await prisma.learningSession.update({
      where: { id: sessionId },
      data: {
        endedAt,
        durationMinutes,
        pointsEarned,
      },
    });

    // Track progress using progressTracker service
    const sessionData = {
      problemsAttempted: session.problemsAttempted || 0,
      problemsCorrect: session.problemsCorrect || 0,
      durationMinutes,
      pointsEarned,
      concepts: session.sessionData?.concepts || [],
    };

    await progressTracker.trackSessionProgress(sessionId, sessionData);

    // Check for new achievements
    const newAchievements = await achievementChecker.checkAchievements(
      session.studentId,
      {
        sessionId,
        sessionData,
      }
    );

    // Clear session cache
    await agentOrchestrator.clearSessionCache(sessionId);

    return NextResponse.json({
      success: true,
      session: {
        id: updatedSession.id,
        durationMinutes,
        pointsEarned,
        messagesCount: updatedSession.messagesCount,
      },
      newAchievements: newAchievements.map(a => ({
        id: a.achievement.id,
        code: a.achievement.code,
        name: a.achievement.name,
        description: a.achievement.description,
        icon: a.achievement.icon,
        category: a.achievement.category,
        pointsReward: a.achievement.pointsReward,
        rarity: a.achievement.rarity,
        unlockedAt: a.unlockedAt,
      })),
    });
  } catch (error) {
    console.error('Error ending session:', error);
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    );
  }
}
