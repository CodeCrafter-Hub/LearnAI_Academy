'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LessonPlayer from '@/components/learning/LessonPlayer';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const lessonPlanId = params.lessonPlanId;

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        setIsLoading(false);
      }
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!lessonPlanId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-600 mb-4">Lesson plan not found</p>
        <button
          onClick={() => router.push('/curriculum')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Curriculum
        </button>
      </div>
    );
  }

  return (
    <LessonPlayer
      lessonPlanId={lessonPlanId}
      onComplete={() => {
        router.push('/curriculum');
      }}
      onExit={() => {
        router.push('/curriculum');
      }}
    />
  );
}

