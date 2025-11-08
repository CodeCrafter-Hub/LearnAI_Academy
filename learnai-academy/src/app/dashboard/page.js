'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import SubjectCard from '@/components/learning/SubjectCard';
import { SubjectClassroomCard } from '@/components/learning/Classroom';
import { getGradeTheme } from '@/lib/classroomThemes';
import ProgressCard from '@/components/progress/ProgressCard';
import StreakDisplay from '@/components/progress/StreakDisplay';
import RecommendationCard from '@/components/recommendations/RecommendationCard';
import { ProgressCardSkeleton, SubjectCardSkeleton, ListSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptySubjects, EmptyRecommendations } from '@/components/ui/EmptyState';
import { Flame, Sparkles, Trophy, Lightbulb } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [progress, setProgress] = useState(null);
  const [student, setStudent] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        loadData();
      }
    }
  }, [authLoading, isAuthenticated]);

  const loadData = async () => {
    try {
      // Get student ID (first student for now)
      const studentId = user?.students?.[0]?.id;
      if (!studentId) {
        // Need to create student profile
        router.push('/onboarding');
        return;
      }

      setStudent(user.students[0]);

      // Load subjects - using httpOnly cookies (credentials: 'include')
      const subjectsRes = await fetch(`/api/subjects?gradeLevel=${user.students[0].gradeLevel}`, {
        credentials: 'include',
      });
      const subjectsData = await subjectsRes.json();
      setSubjects(subjectsData);

      // Load progress
      const progressRes = await fetch(`/api/students/${studentId}/progress`, {
        credentials: 'include',
      });
      const progressData = await progressRes.json();
      setProgress(progressData);

      // Load recommendations
      try {
        const recommendationsRes = await fetch(`/api/recommendations?studentId=${studentId}&limit=5`, {
          credentials: 'include',
        });
        if (recommendationsRes.ok) {
          const recommendationsData = await recommendationsRes.json();
          setRecommendations(recommendationsData.recommendations || []);
        }
      } catch (recError) {
        // Continue even if recommendations fail
      }
    } catch (error) {
      // Error loading data
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubjectClick = (subject) => {
    router.push(`/learn?subject=${subject.slug}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="h-10 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <ProgressCardSkeleton />
            <ProgressCardSkeleton />
            <ProgressCardSkeleton />
          </div>
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SubjectCardSkeleton />
              <SubjectCardSkeleton />
              <SubjectCardSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get grade level and theme
  const gradeLevel = student?.gradeLevel || 5;
  const gradeTheme = getGradeTheme(gradeLevel);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8" role="main">
        {/* Welcome Section */}
        <section className="mb-8 animate-fadeIn" aria-labelledby="welcome-heading">
          <h1
            id="welcome-heading"
            className={`${gradeTheme.style.fontSize === 'large' ? 'text-5xl' : 'text-4xl'} font-bold text-gray-800 mb-2`}
          >
            Welcome Back, {student?.firstName}! {gradeTheme.emojis ? '🌟' : ''}
          </h1>
          <p className={`${gradeTheme.style.fontSize === 'large' ? 'text-xl' : 'text-base'} text-gray-600`}>
            {gradeTheme.emojis ? 'Ready to learn something awesome today? 🚀' : 'Ready to continue your learning journey?'}
          </p>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fadeIn" aria-label="Learning statistics">
          <ProgressCard
            title="Current Streak"
            value={`${progress?.summary?.currentStreak || 0} days`}
            subtitle="Keep it going!"
            icon={Flame}
            color="bg-gradient-to-br from-yellow-400 to-orange-500"
          />
          <ProgressCard
            title="Total Points"
            value={progress?.summary?.totalPoints || 0}
            subtitle="Amazing work!"
            icon={Sparkles}
            color="bg-gradient-to-br from-purple-500 to-pink-500"
          />
          <ProgressCard
            title="Achievements"
            value={`${progress?.achievements?.length || 0}/${10}`}
            subtitle="Badges earned"
            icon={Trophy}
            color="bg-gradient-to-br from-blue-500 to-cyan-500"
          />
        </div>

        {/* Subjects Grid */}
        <section className="mb-8 animate-fadeIn" aria-labelledby="subjects-heading">
          <h2
            id="subjects-heading"
            className={`${gradeTheme.style.fontSize === 'large' ? 'text-3xl' : 'text-2xl'} font-bold text-gray-800 mb-6`}
          >
            {gradeTheme.emojis ? '📚 Choose Your Classroom' : 'Choose Your Subject'}
          </h2>
          {subjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
              {subjects.map(subject => (
                <div key={subject.id} role="listitem">
                  <SubjectClassroomCard
                    gradeLevel={gradeLevel}
                    subject={subject}
                    onClick={() => handleSubjectClick(subject)}
                    progress={progress?.progressBySubject?.[subject.slug]}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 shadow-md">
              <EmptySubjects />
            </div>
          )}
        </section>

        {/* Recommendations */}
        <section className="mb-8 animate-fadeIn" aria-labelledby="recommendations-heading">
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="w-6 h-6 text-yellow-500" aria-hidden="true" />
            <h2
              id="recommendations-heading"
              className={`${gradeTheme.style.fontSize === 'large' ? 'text-3xl' : 'text-2xl'} font-bold text-gray-800`}
            >
              {gradeTheme.emojis ? '💡 Recommended for You' : 'Recommended for You'}
            </h2>
          </div>
          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.slice(0, 6).map((rec, idx) => (
                <RecommendationCard
                  key={idx}
                  recommendation={rec}
                  onSelect={() => {
                    if (rec.topic?.slug) {
                      router.push(`/learn?subject=${rec.subject?.slug || 'math'}&topic=${rec.topic.slug}`);
                    } else {
                      router.push(`/learn?subject=${rec.subject?.slug || 'math'}`);
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 shadow-md">
              <EmptyRecommendations />
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {progress?.recentSessions && progress.recentSessions.length > 0 && (
          <section
            className={`bg-white ${
              gradeTheme.style.corners === 'very-rounded' ? 'rounded-3xl' : 'rounded-2xl'
            } p-6 shadow-md animate-fadeIn`}
            aria-labelledby="recent-sessions-heading"
          >
            <h2
              id="recent-sessions-heading"
              className={`${gradeTheme.style.fontSize === 'large' ? 'text-3xl' : 'text-2xl'} font-bold text-gray-800 mb-4`}
            >
              {gradeTheme.emojis ? '📊 Recent Sessions' : 'Recent Sessions'}
            </h2>
            <div className="space-y-3">
              {progress.recentSessions.slice(0, 5).map((session, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">
                      {session.subject} - {session.topic}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(session.startedAt).toLocaleDateString()} • {session.durationMinutes} min
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800">+{session.pointsEarned}</div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <nav className="mt-8 flex gap-4 animate-fadeIn" aria-label="Quick actions">
          <button
            onClick={() => router.push('/progress')}
            className={`flex-1 bg-blue-500 text-white ${
              gradeTheme.style.corners === 'very-rounded' ? 'rounded-2xl' : 'rounded-xl'
            } py-3 px-6 ${
              gradeTheme.style.fontSize === 'large' ? 'text-xl' : 'text-base'
            } font-semibold hover:bg-blue-600 transition-all transform hover:scale-105`}
            aria-label="View your learning progress"
          >
            {gradeTheme.emojis ? '📈 ' : ''}View Progress
          </button>
          <button
            onClick={() => router.push('/achievements')}
            className={`flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white ${
              gradeTheme.style.corners === 'very-rounded' ? 'rounded-2xl' : 'rounded-xl'
            } py-3 px-6 ${
              gradeTheme.style.fontSize === 'large' ? 'text-xl' : 'text-base'
            } font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105`}
            aria-label="View your achievements and badges"
          >
            {gradeTheme.emojis ? '🏆 ' : ''}Achievements
          </button>
        </nav>
      </main>
    </div>
  );
}
