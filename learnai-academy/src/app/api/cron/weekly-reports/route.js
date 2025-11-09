import { NextResponse } from 'next/server';
import { parentNotificationService } from '@/services/notifications/parentNotificationService.js';

/**
 * POST /api/cron/weekly-reports
 * Cron job endpoint to send weekly progress reports
 * 
 * This should be called by a cron service (Vercel Cron, GitHub Actions, etc.)
 * Example: Run every Monday at 9 AM
 */
export async function POST(request) {
  try {
    // Verify cron secret (for security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Send weekly reports for all students
    const result = await parentNotificationService.scheduleWeeklyReports();

    return NextResponse.json({
      success: true,
      message: 'Weekly reports scheduled',
      ...result,
    });
  } catch (error) {
    console.error('Error in weekly reports cron:', error);
    return NextResponse.json(
      { error: 'Failed to schedule weekly reports' },
      { status: 500 }
    );
  }
}

