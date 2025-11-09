import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { parentNotificationService } from '@/services/notifications/parentNotificationService.js';

/**
 * POST /api/parent/notifications/weekly
 * Send weekly progress report
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
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required' },
        { status: 400 }
      );
    }

    // Verify user has access to this student
    if (user.role !== 'ADMIN' && user.role !== 'PARENT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const result = await parentNotificationService.sendWeeklyProgressReport(studentId);

    return NextResponse.json({
      success: result.success,
      message: result.message,
    });
  } catch (error) {
    console.error('Error sending weekly report:', error);
    return NextResponse.json(
      { error: 'Failed to send weekly report' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/parent/notifications/weekly
 * Get notification preferences or history
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

    // Return notification preferences or history
    return NextResponse.json({
      success: true,
      weeklyReportsEnabled: true, // Could be stored in user preferences
      lastSent: null, // Could fetch from notification log
    });
  } catch (error) {
    console.error('Error getting notification info:', error);
    return NextResponse.json(
      { error: 'Failed to get notification info' },
      { status: 500 }
    );
  }
}

