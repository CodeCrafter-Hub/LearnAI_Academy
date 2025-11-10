import { NextResponse } from 'next/server';
import { videoLessonService } from '@/services/video/videoLessonService.js';

/**
 * POST /api/videos/[id]/view - Record video view/progress
 */
export async function POST(request, { params }) {
  try {
    const { id } = params;
    // TODO: Get studentId from session/auth
    const studentId = 'temp-student-id'; // await getStudentIdFromSession(request);
    const body = await request.json();

    const view = await videoLessonService.recordView(id, studentId, body);

    return NextResponse.json(view);
  } catch (error) {
    console.error('Error recording video view:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to record view' },
      { status: 500 }
    );
  }
}

