'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VideoPlayer from '@/components/video/VideoPlayer';

/**
 * Video Lesson Detail Page
 */
export default function VideoLessonPage() {
  const params = useParams();
  const router = useRouter();
  const [videoLesson, setVideoLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideoLesson();
  }, [params.id]);

  const loadVideoLesson = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/videos/${params.id}`);
      if (!response.ok) throw new Error('Video not found');
      
      const data = await response.json();
      setVideoLesson(data);
    } catch (error) {
      console.error('Error loading video:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProgress = async (progressData) => {
    try {
      await fetch(`/api/videos/${params.id}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progressData),
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleComplete = async () => {
    await handleProgress({ completed: true });
    // Optionally redirect or show completion message
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading video...</p>
        </div>
      </div>
    );
  }

  if (!videoLesson) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Video not found</p>
          <button
            onClick={() => router.push('/learn/videos')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <VideoPlayer
        videoLesson={videoLesson}
        onProgress={handleProgress}
        onComplete={handleComplete}
      />
    </div>
  );
}

