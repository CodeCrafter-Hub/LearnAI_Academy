'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import SubjectCard from '@/components/learning/SubjectCard';
import ProgressCard from '@/components/progress/ProgressCard';
import StreakDisplay from '@/components/progress/StreakDisplay';
import { Flame, Sparkles, Trophy } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [progress, setProgress] = useState(null);
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));

      if (!token || !userData) {
        router.push('/login');
        return;
      }

      // Get student ID (first student for now)
      const studentId = userData.students?.[0]?.id;
      if (!studentId) {
        // Need to create student profile
        router.push('/onboarding');
        return;
      }

      setStudent(userData.students[0]);

      // Load subjects
      const subjectsRes = await fetch(`/api/subjects?gradeLevel=${userData.students[0].gradeLevel}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const subjectsData = await subjectsRes.json();
      setSubjects(subjectsData);

      // Load progress
      const progressRes = await fetch(`/api/students/${studentId}/progress`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const progressData = await progressRes.json();
      setProgress(progressData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubjectClick = (subject) => {
    router.push(`/learn?subject=${subject.slug}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome Back, {student?.firstName}! 🌟
          </h1>
          <p className="text-gray-600">Ready to learn something awesome today?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Choose Your Subject</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map(subject => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                progress={progress?.progressBySubject?.[subject.slug]}
                onClick={() => handleSubjectClick(subject)}
              />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        {progress?.recentSessions && progress.recentSessions.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Sessions</h2>
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
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => router.push('/progress')}
            className="flex-1 bg-blue-500 text-white rounded-xl py-3 px-6 font-semibold hover:bg-blue-600 transition-colors"
          >
            View Progress
          </button>
          <button
            onClick={() => router.push('/achievements')}
            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl py-3 px-6 font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all"
          >
            Achievements
          </button>
        </div>
      </div>
    </div>
  );
}
