import { NextResponse } from 'next/server';
import { videoLessonService } from '@/services/video/videoLessonService.js';

/**
 * GET /api/videos/recommended - Get recommended videos for student
 */
export async function GET(request) {
  try {
    // TODO: Get studentId from session/auth
    const studentId = 'temp-student-id'; // await getStudentIdFromSession(request);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const recommendations = await videoLessonService.getRecommendedVideos(studentId, limit);

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Error fetching recommended videos:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

