import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { breakReminderService } from '@/services/study/breakReminderService.js';

/**
 * GET /api/study/break-reminder
 * Get break reminder information
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
    const sessionDuration = parseInt(searchParams.get('sessionDuration') || '0');
    const gradeLevel = parseInt(searchParams.get('gradeLevel') || '5');

    if (isNaN(sessionDuration) || isNaN(gradeLevel)) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    // Calculate break time
    const breakInfo = breakReminderService.calculateBreakTime(sessionDuration, gradeLevel);
    
    // Get break activities
    const activities = breakReminderService.getBreakActivities(gradeLevel, breakInfo.breakType);

    return NextResponse.json({
      success: true,
      ...breakInfo,
      activities,
    });
  } catch (error) {
    console.error('Error in break reminder:', error);
    return NextResponse.json(
      { error: 'Failed to get break reminder' },
      { status: 500 }
    );
  }
}

