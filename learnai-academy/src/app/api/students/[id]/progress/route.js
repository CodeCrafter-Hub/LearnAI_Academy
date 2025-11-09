import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    // Verify authentication
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const studentId = params.id;

    // Verify access
    let student;
    try {
      student = await prisma.student.findUnique({
        where: { id: studentId },
      });
    } catch (dbError) {
      // Student model might not exist - return empty progress
      console.warn('Student model not found, returning empty progress:', dbError);
      return NextResponse.json({
        studentId,
        summary: {
          totalSessions: 0,
          totalMinutes: 0,
          totalPoints: 0,
          currentStreak: 0,
          achievementsUnlocked: 0,
        },
        progressBySubject: {},
        recentSessions: [],
        achievements: [],
        activityChart: [],
      });
    }

    if (!student || (student.userId !== user.userId && student.parentId !== user.userId)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get comprehensive progress data - handle missing models gracefully
    let progress = [];
    let sessions = [];
    let achievements = [];
    let dailyActivity = [];

    try {
      [progress, sessions, achievements, dailyActivity] = await Promise.all([
        prisma.studentProgress?.findMany({
          where: { studentId },
          include: {
            subject: true,
            topic: true,
          },
        }).catch(() => []),
        prisma.learningSession?.findMany({
          where: { studentId },
          orderBy: { startedAt: 'desc' },
          take: 50,
          include: {
            subject: true,
            topic: true,
          },
        }).catch(() => []),
        prisma.studentAchievement?.findMany({
          where: { studentId },
          include: {
            achievement: true,
          },
        }).catch(() => []),
        prisma.dailyActivity?.findMany({
          where: { studentId },
          orderBy: { activityDate: 'desc' },
          take: 30,
        }).catch(() => []),
      ]);
    } catch (dbError) {
      // Some models might not exist - use empty arrays
      console.warn('Some progress models not found, using empty data:', dbError);
      progress = [];
      sessions = [];
      achievements = [];
      dailyActivity = [];
    }

    // Calculate metrics
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const totalPoints = sessions.reduce((sum, s) => sum + (s.pointsEarned || 0), 0);
    const currentStreak = dailyActivity[0]?.streakDay || 0;

    // Group progress by subject
    const progressBySubject = {};
    for (const p of progress) {
      if (!progressBySubject[p.subject.slug]) {
        progressBySubject[p.subject.slug] = {
          subject: p.subject.name,
          subjectId: p.subject.id,
          topics: [],
          totalSessions: 0,
          totalPoints: 0,
          averageMastery: 0,
        };
      }

      progressBySubject[p.subject.slug].topics.push({
        topicId: p.topic.id,
        topicName: p.topic.name,
        masteryLevel: p.masteryLevel,
        sessionsCount: p.sessionsCount,
        totalTimeMinutes: p.totalTimeMinutes,
        lastPracticedAt: p.lastPracticedAt,
      });

      progressBySubject[p.subject.slug].totalSessions += p.sessionsCount;
    }

    // Calculate average mastery per subject
    Object.keys(progressBySubject).forEach(subjectSlug => {
      const subject = progressBySubject[subjectSlug];
      subject.averageMastery =
        subject.topics.reduce((sum, t) => sum + t.masteryLevel, 0) /
        subject.topics.length;
    });

    const result = {
      studentId,
      summary: {
        totalSessions,
        totalMinutes,
        totalPoints,
        currentStreak,
        achievementsUnlocked: achievements.length,
      },
      progressBySubject,
      recentSessions: sessions.slice(0, 10).map(s => ({
        id: s.id,
        subject: s.subject?.name,
        topic: s.topic?.name,
        mode: s.sessionMode,
        difficulty: s.difficultyLevel,
        durationMinutes: s.durationMinutes,
        pointsEarned: s.pointsEarned,
        startedAt: s.startedAt,
      })),
      achievements: achievements.map(a => ({
        id: a.achievement.id,
        code: a.achievement.code,
        name: a.achievement.name,
        description: a.achievement.description,
        icon: a.achievement.icon,
        unlockedAt: a.unlockedAt,
      })),
      activityChart: dailyActivity.map(d => ({
        date: d.activityDate,
        minutes: d.minutesLearned,
        sessions: d.sessionsCount,
        points: d.pointsEarned,
      })),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
