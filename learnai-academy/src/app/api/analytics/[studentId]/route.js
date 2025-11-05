import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Force dynamic rendering - this route should never be statically generated
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    const studentId = params.studentId;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d

    // Verify access
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student || (student.userId !== user.userId && student.parentId !== user.userId)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Calculate date range
    const startDate = getStartDate(period);

    // Fetch analytics data
    const [sessions, progress, activities] = await Promise.all([
      prisma.learningSession.findMany({
        where: {
          studentId,
          startedAt: { gte: startDate },
        },
        include: {
          subject: true,
          topic: true,
        },
      }),
      prisma.studentProgress.findMany({
        where: { studentId },
        include: {
          subject: true,
          topic: true,
        },
      }),
      prisma.dailyActivity.findMany({
        where: {
          studentId,
          activityDate: { gte: startDate },
        },
        orderBy: { activityDate: 'asc' },
      }),
    ]);

    // Calculate metrics
    const analytics = {
      period,
      summary: {
        totalSessions: sessions.length,
        totalMinutes: sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0),
        averageSessionLength: sessions.length > 0
          ? sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) / sessions.length
          : 0,
        totalPoints: sessions.reduce((sum, s) => sum + (s.pointsEarned || 0), 0),
      },
      subjectBreakdown: getSubjectBreakdown(sessions),
      topicMastery: getTopicMastery(progress),
      learningTrends: getLearningTrends(activities),
      recommendations: getRecommendations(progress, sessions),
      strengths: identifyStrengths(progress),
      areasForImprovement: identifyWeaknesses(progress),
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

function getStartDate(period) {
  const date = new Date();
  const match = period.match(/(\d+)([dhwmy])/);
  
  if (!match) {
    date.setDate(date.getDate() - 30);
    return date;
  }
  
  const [, amount, unit] = match;
  const value = parseInt(amount);
  
  switch (unit) {
    case 'd': date.setDate(date.getDate() - value); break;
    case 'w': date.setDate(date.getDate() - (value * 7)); break;
    case 'm': date.setMonth(date.getMonth() - value); break;
    case 'y': date.setFullYear(date.getFullYear() - value); break;
  }
  
  return date;
}

function getSubjectBreakdown(sessions) {
  const breakdown = {};
  
  for (const session of sessions) {
    if (!session.subject) continue;
    
    const subjectName = session.subject.name;
    if (!breakdown[subjectName]) {
      breakdown[subjectName] = {
        sessions: 0,
        totalMinutes: 0,
        totalPoints: 0,
        practiceCount: 0,
        helpCount: 0,
      };
    }
    
    breakdown[subjectName].sessions++;
    breakdown[subjectName].totalMinutes += session.durationMinutes || 0;
    breakdown[subjectName].totalPoints += session.pointsEarned || 0;
    
    if (session.sessionMode === 'PRACTICE') {
      breakdown[subjectName].practiceCount++;
    } else if (session.sessionMode === 'HELP') {
      breakdown[subjectName].helpCount++;
    }
  }
  
  return breakdown;
}

function getTopicMastery(progress) {
  return progress
    .map(p => ({
      subject: p.subject.name,
      topic: p.topic.name,
      masteryLevel: p.masteryLevel,
      sessionsCount: p.sessionsCount,
      totalTimeMinutes: p.totalTimeMinutes,
      lastPracticedAt: p.lastPracticedAt,
    }))
    .sort((a, b) => b.masteryLevel - a.masteryLevel);
}

function getLearningTrends(activities) {
  return activities.map(a => ({
    date: a.activityDate,
    minutes: a.minutesLearned,
    sessions: a.sessionsCount,
    points: a.pointsEarned,
    streak: a.streakDay,
  }));
}

function identifyStrengths(progress) {
  return progress
    .filter(p => p.masteryLevel >= 0.7)
    .sort((a, b) => b.masteryLevel - a.masteryLevel)
    .slice(0, 5)
    .map(p => ({
      subject: p.subject.name,
      topic: p.topic.name,
      masteryLevel: p.masteryLevel,
    }));
}

function identifyWeaknesses(progress) {
  return progress
    .filter(p => p.masteryLevel < 0.5 && p.sessionsCount > 2)
    .sort((a, b) => a.masteryLevel - b.masteryLevel)
    .slice(0, 5)
    .map(p => ({
      subject: p.subject.name,
      topic: p.topic.name,
      masteryLevel: p.masteryLevel,
      reason: 'Needs more practice',
    }));
}

function getRecommendations(progress, sessions) {
  const recommendations = [];
  
  // Find topics that need improvement
  const weakTopics = progress
    .filter(p => p.masteryLevel < 0.5)
    .sort((a, b) => a.masteryLevel - b.masteryLevel)
    .slice(0, 3);
  
  for (const topic of weakTopics) {
    recommendations.push({
      type: 'improvement',
      priority: 'high',
      subject: topic.subject.name,
      topic: topic.topic.name,
      message: `Focus on ${topic.topic.name} to improve understanding`,
    });
  }
  
  // Find topics ready for advancement
  const masteredTopics = progress.filter(p => p.masteryLevel >= 0.8);
  if (masteredTopics.length > 0) {
    recommendations.push({
      type: 'advancement',
      priority: 'medium',
      message: `Great job mastering ${masteredTopics.length} topics! Ready for new challenges?`,
    });
  }
  
  // Check practice balance
  const practiceSessions = sessions.filter(s => s.sessionMode === 'PRACTICE').length;
  const helpSessions = sessions.filter(s => s.sessionMode === 'HELP').length;
  
  if (practiceSessions < helpSessions / 2) {
    recommendations.push({
      type: 'balance',
      priority: 'low',
      message: 'Try more practice mode to reinforce your learning',
    });
  }
  
  return recommendations;
}
