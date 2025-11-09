import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { parentNotificationService } from '@/services/notifications/parentNotificationService.js';

/**
 * POST /api/parent/notifications/achievement
 * Send achievement notification
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
    const { studentId, achievement } = body;

    if (!studentId || !achievement) {
      return NextResponse.json(
        { error: 'studentId and achievement are required' },
        { status: 400 }
      );
    }

    const result = await parentNotificationService.sendAchievementNotification(
      studentId,
      achievement
    );

    return NextResponse.json({
      success: result.success,
      message: result.message,
    });
  } catch (error) {
    console.error('Error sending achievement notification:', error);
    return NextResponse.json(
      { error: 'Failed to send achievement notification' },
      { status: 500 }
    );
  }
}

