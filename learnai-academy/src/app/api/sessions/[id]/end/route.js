import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { agentOrchestrator } from '@/services/ai/agentOrchestrator';
import { cacheService } from '@/services/cache/cacheService';

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

    // Update student progress
    await updateStudentProgress(session, pointsEarned, durationMinutes);

    // Update daily activity
    await updateDailyActivity(session.studentId, durationMinutes, pointsEarned);

    // Check for new achievements
    const newAchievements = await checkAchievements(session.studentId);

    // Clear session cache
    await agentOrchestrator.clearSessionCache(sessionId);
    await cacheService.invalidateStudentCache(session.studentId);

    return NextResponse.json({
      success: true,
      session: {
        id: updatedSession.id,
        durationMinutes,
        pointsEarned,
        messagesCount: updatedSession.messagesCount,
      },
      newAchievements,
    });
  } catch (error) {
    console.error('Error ending session:', error);
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    );
  }
}

async function updateStudentProgress(session, pointsEarned, durationMinutes) {
  try {
    // Get or create progress record
    const existing = await prisma.studentProgress.findUnique({
      where: {
        studentId_topicId: {
          studentId: session.studentId,
          topicId: session.topicId,
        },
      },
    });

    if (existing) {
      // Update existing progress
      await prisma.studentProgress.update({
        where: {
          studentId_topicId: {
            studentId: session.studentId,
            topicId: session.topicId,
          },
        },
        data: {
          totalTimeMinutes: { increment: durationMinutes },
          sessionsCount: { increment: 1 },
          lastPracticedAt: new Date(),
          // Gradually increase mastery based on practice
          masteryLevel: Math.min(
            1.0,
            existing.masteryLevel + 0.05
          ),
        },
      });
    } else {
      // Create new progress record
      await prisma.studentProgress.create({
        data: {
          studentId: session.studentId,
          subjectId: session.subjectId,
          topicId: session.topicId,
          totalTimeMinutes: durationMinutes,
          sessionsCount: 1,
          lastPracticedAt: new Date(),
          masteryLevel: 0.1,
        },
      });
    }

    // Also update subject-level progress if needed
    const subjectProgress = await prisma.studentProgress.findMany({
      where: {
        studentId: session.studentId,
        subjectId: session.subjectId,
      },
    });

    // Calculate average mastery for subject
    const avgMastery =
      subjectProgress.reduce((sum, p) => sum + p.masteryLevel, 0) /
      subjectProgress.length;

    console.log(`Subject mastery for student: ${avgMastery.toFixed(2)}`);
  } catch (error) {
    console.error('Error updating progress:', error);
  }
}

async function updateDailyActivity(studentId, minutesLearned, pointsEarned) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get or create daily activity
    const existing = await prisma.dailyActivity.findUnique({
      where: {
        studentId_activityDate: {
          studentId,
          activityDate: today,
        },
      },
    });

    if (existing) {
      await prisma.dailyActivity.update({
        where: {
          studentId_activityDate: {
            studentId,
            activityDate: today,
          },
        },
        data: {
          minutesLearned: { increment: minutesLearned },
          sessionsCount: { increment: 1 },
          pointsEarned: { increment: pointsEarned },
        },
      });
    } else {
      // Calculate streak
      const streak = await calculateStreak(studentId);

      await prisma.dailyActivity.create({
        data: {
          studentId,
          activityDate: today,
          minutesLearned,
          sessionsCount: 1,
          pointsEarned,
          streakDay: streak,
        },
      });
    }
  } catch (error) {
    console.error('Error updating daily activity:', error);
  }
}

async function calculateStreak(studentId) {
  const activities = await prisma.dailyActivity.findMany({
    where: { studentId },
    orderBy: { activityDate: 'desc' },
    take: 365,
  });

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const activity of activities) {
    const activityDate = new Date(activity.activityDate);
    activityDate.setHours(0, 0, 0, 0);

    if (activityDate.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

async function checkAchievements(studentId) {
  try {
    // Get student data
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        sessions: true,
        achievements: true,
        dailyActivity: {
          orderBy: { activityDate: 'desc' },
          take: 1,
        },
      },
    });

    const unlockedAchievementIds = student.achievements.map(a => a.achievementId);
    const newAchievements = [];

    // Get all achievements
    const allAchievements = await prisma.achievement.findMany({
      where: { isActive: true },
    });

    for (const achievement of allAchievements) {
      // Skip if already unlocked
      if (unlockedAchievementIds.includes(achievement.id)) {
        continue;
      }

      // Check conditions
      const condition = achievement.condition;
      let unlocked = false;

      switch (condition.type) {
        case 'session_count':
          unlocked = student.sessions.length >= condition.value;
          break;

        case 'streak':
          const currentStreak = student.dailyActivity[0]?.streakDay || 0;
          unlocked = currentStreak >= condition.value;
          break;

        case 'points':
          const totalPoints = student.sessions.reduce(
            (sum, s) => sum + (s.pointsEarned || 0),
            0
          );
          unlocked = totalPoints >= condition.value;
          break;

        case 'subject_exploration':
          const subjectsCount = new Set(
            student.sessions.map(s => s.subjectId)
          ).size;
          unlocked = subjectsCount >= condition.value;
          break;
      }

      if (unlocked) {
        // Unlock achievement
        await prisma.studentAchievement.create({
          data: {
            studentId,
            achievementId: achievement.id,
          },
        });

        newAchievements.push({
          id: achievement.id,
          code: achievement.code,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          pointsReward: achievement.pointsReward,
        });
      }
    }

    return newAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
}
