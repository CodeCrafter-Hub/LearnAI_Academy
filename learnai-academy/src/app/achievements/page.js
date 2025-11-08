'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import AchievementBadge from '@/components/progress/AchievementBadge';
import { useAuth } from '@/hooks/useAuth';
import { Home, Trophy } from 'lucide-react';

export default function AchievementsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        loadAchievements();
      }
    }
  }, [authLoading, isAuthenticated]);

  const loadAchievements = async () => {
    try {
      const studentId = user?.students?.[0]?.id;

      if (!studentId) return;

      const response = await fetch(`/api/achievements?studentId=${studentId}`, {
        credentials: 'include',
      });

      const data = await response.json();
      setAchievements(data.achievements || []);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading achievements...</p>
        </div>
      </div>
    );
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Achievements</h1>
            <p className="text-gray-600">Collect badges as you learn</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 font-medium"
          >
            <Home className="w-5 h-5" />
            Dashboard
          </button>
        </div>

        {/* Progress Banner */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 text-center text-white mb-8 shadow-lg">
          <Trophy className="w-16 h-16 mx-auto mb-4" />
          <div className="text-6xl font-bold mb-2">
            {unlockedCount} / {totalCount}
          </div>
          <div className="text-2xl opacity-90">Achievements Unlocked</div>
          <div className="w-full max-w-md mx-auto mt-6 bg-white/20 rounded-full h-4">
            <div
              className="bg-white h-4 rounded-full transition-all"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Achievement Categories */}
        <div className="space-y-8">
          {/* Unlocked */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Unlocked ({unlockedCount})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements
                .filter(a => a.unlocked)
                .map(achievement => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    unlocked={true}
                  />
                ))}
            </div>
            {unlockedCount === 0 && (
              <p className="text-center text-gray-500 py-8">
                Start learning to unlock your first achievement!
              </p>
            )}
          </div>

          {/* Locked */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Locked ({totalCount - unlockedCount})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements
                .filter(a => !a.unlocked)
                .map(achievement => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    unlocked={false}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
