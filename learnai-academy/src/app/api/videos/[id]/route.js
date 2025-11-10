import { NextResponse } from 'next/server';
import { videoLessonService } from '@/services/video/videoLessonService.js';

/**
 * GET /api/videos/[id] - Get video lesson
 * PUT /api/videos/[id] - Update video lesson
 * DELETE /api/videos/[id] - Delete video lesson
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    // TODO: Get studentId from session/auth
    const studentId = null; // await getStudentIdFromSession(request);

    const videoLesson = await videoLessonService.getVideoLesson(id, studentId);

    return NextResponse.json(videoLesson);
  } catch (error) {
    console.error('Error fetching video lesson:', error);
    return NextResponse.json(
      { error: error.message || 'Video lesson not found' },
      { status: 404 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    // TODO: Add authorization check
    // TODO: Implement update logic in service
    return NextResponse.json({ message: 'Update not yet implemented' }, { status: 501 });
  } catch (error) {
    console.error('Error updating video lesson:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update video lesson' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // TODO: Add authorization check
    // TODO: Implement delete logic in service
    return NextResponse.json({ message: 'Delete not yet implemented' }, { status: 501 });
  } catch (error) {
    console.error('Error deleting video lesson:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete video lesson' },
      { status: 500 }
    );
  }
}

