import { NextResponse } from 'next/server';
import { videoLessonService } from '@/services/video/videoLessonService.js';

/**
 * POST /api/videos/[id]/rate - Rate video lesson
 */
export async function POST(request, { params }) {
  try {
    const { id } = params;
    // TODO: Get studentId from session/auth
    const studentId = 'temp-student-id'; // await getStudentIdFromSession(request);
    const { rating, review } = await request.json();

    const result = await videoLessonService.rateVideo(id, studentId, rating, review);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error rating video:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to rate video' },
      { status: 500 }
    );
  }
}

