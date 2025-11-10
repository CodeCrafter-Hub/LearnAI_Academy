import { NextResponse } from 'next/server';
import { videoLessonService } from '@/services/video/videoLessonService.js';

/**
 * GET /api/videos - Search/list video lessons
 * POST /api/videos - Create video lesson
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const subjectId = searchParams.get('subjectId');
    const gradeLevel = searchParams.get('gradeLevel') ? parseInt(searchParams.get('gradeLevel')) : null;
    const difficulty = searchParams.get('difficulty');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await videoLessonService.searchVideoLessons(query, {
      subjectId,
      gradeLevel,
      difficulty,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching video lessons:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch video lessons' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const videoLesson = await videoLessonService.createVideoLesson(body);

    return NextResponse.json(videoLesson, { status: 201 });
  } catch (error) {
    console.error('Error creating video lesson:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create video lesson' },
      { status: 500 }
    );
  }
}

