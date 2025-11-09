import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { streakService } from '@/services/study/streakService.js';

/**
 * GET /api/study/streak
 * Get streak information
 */
export async function GET(request) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const type = searchParams.get('type') || 'current'; // current, weekly, monthly, recovery

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required' },
        { status: 400 }
      );
    }

    let data;
    switch (type) {
      case 'weekly':
        data = await streakService.getWeeklyEngagement(studentId);
        break;
      case 'monthly':
        data = await streakService.getMonthlyEngagement(studentId);
        break;
      case 'recovery':
        data = await streakService.getStreakRecovery(studentId);
        break;
      default:
        data = await streakService.getStreakInfo(studentId);
    }

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('Error getting streak info:', error);
    return NextResponse.json(
      { error: 'Failed to get streak information' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/study/streak
 * Update streak
 */
export async function POST(request) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { studentId, minutesStudied } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required' },
        { status: 400 }
      );
    }

    const result = await streakService.updateDailyStreak(
      studentId,
      minutesStudied || 0
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error updating streak:', error);
    return NextResponse.json(
      { error: 'Failed to update streak' },
      { status: 500 }
    );
  }
}

