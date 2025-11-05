'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import ProgressCard from '@/components/progress/ProgressCard';
import ProgressChart from '@/components/progress/ProgressChart';
import { Home, TrendingUp, Clock, Star, BookMarked } from 'lucide-react';

export default function ProgressPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));
      const studentId = userData.students?.[0]?.id;

      if (!studentId) return;

      const response = await fetch(`/api/students/${studentId}/progress`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      setProgress(data);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  const totalPoints = progress?.summary?.totalPoints || 0;
  const totalSessions = progress?.summary?.totalSessions || 0;
  const totalMinutes = progress?.summary?.totalMinutes || 0;
  const currentStreak = progress?.summary?.currentStreak || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Your Progress</h1>
            <p className="text-gray-600">Track your learning journey</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 font-medium"
          >
            <Home className="w-5 h-5" />
            Dashboard
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <ProgressCard
            title="Total Points"
            value={totalPoints}
            icon={Star}
            color="bg-gradient-to-br from-yellow-400 to-orange-500"
          />
          <ProgressCard
            title="Sessions"
            value={totalSessions}
            icon={BookMarked}
            color="bg-gradient-to-br from-blue-500 to-purple-600"
          />
          <ProgressCard
            title="Learning Time"
            value={`${Math.round(totalMinutes / 60)}h`}
            subtitle={`${totalMinutes} minutes`}
            icon={Clock}
            color="bg-gradient-to-br from-green-500 to-teal-500"
          />
          <ProgressCard
            title="Current Streak"
            value={`${currentStreak} days`}
            icon={TrendingUp}
            color="bg-gradient-to-br from-pink-500 to-rose-500"
          />
        </div>

        {/* Activity Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Learning Activity</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPeriod('7d')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === '7d'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setSelectedPeriod('30d')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === '30d'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                30 Days
              </button>
            </div>
          </div>
          <ProgressChart data={progress?.activityChart || []} type="line" />
        </div>

        {/* Subject Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Subject Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(progress?.progressBySubject || {}).map(([slug, data]) => (
              <div key={slug} className="border-2 border-gray-100 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{data.subject}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Average Mastery:</span>
                    <span className="font-bold text-gray-800">
                      {Math.round(data.averageMastery * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all"
                      style={{ width: `${data.averageMastery * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{data.totalSessions} sessions</span>
                    <span>{data.topics.length} topics</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Mastery */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Topic Mastery</h2>
          <div className="space-y-3">
            {Object.entries(progress?.progressBySubject || {}).map(([slug, subjectData]) =>
              subjectData.topics.map((topic, idx) => (
                <div key={`${slug}-${idx}`} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-gray-800">{topic.topicName}</span>
                      <span className="text-sm text-gray-500 ml-2">({subjectData.subject})</span>
                    </div>
                    <span className="font-bold text-gray-800">
                      {Math.round(topic.masteryLevel * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        topic.masteryLevel >= 0.8
                          ? 'bg-green-500'
                          : topic.masteryLevel >= 0.5
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${topic.masteryLevel * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>{topic.sessionsCount} sessions</span>
                    <span>{topic.totalTimeMinutes} min</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Sessions</h2>
          {progress?.recentSessions && progress.recentSessions.length > 0 ? (
            <div className="space-y-3">
              {progress.recentSessions.map((session, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {session.subject} - {session.topic}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(session.startedAt).toLocaleString()} •{' '}
                      {session.mode === 'PRACTICE' ? '🎯 Practice' : '💡 Help'} •{' '}
                      {session.difficulty}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800">+{session.pointsEarned}</div>
                    <div className="text-xs text-gray-500">{session.durationMinutes} min</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No sessions yet. Start learning to see your history!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
