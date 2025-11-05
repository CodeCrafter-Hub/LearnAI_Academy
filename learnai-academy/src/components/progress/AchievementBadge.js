'use client';

import { Star, Trophy, Flame, BookMarked, Brain, Sparkles, Target } from 'lucide-react';

const iconMap = {
  Star,
  Trophy,
  Flame,
  BookMarked,
  Brain,
  Sparkles,
  Target,
};

export default function AchievementBadge({ achievement, unlocked, onClick }) {
  const Icon = iconMap[achievement.icon] || Star;

  return (
    <button
      onClick={onClick}
      className={`rounded-xl p-6 shadow-md transition-all ${
        unlocked
          ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-300 hover:shadow-lg'
          : 'bg-gray-100 opacity-60 hover:opacity-80'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`rounded-xl p-3 ${
            unlocked ? 'bg-yellow-400' : 'bg-gray-300'
          }`}
        >
          <Icon
            className={`w-8 h-8 ${unlocked ? 'text-white' : 'text-gray-500'}`}
          />
        </div>
        <div className="flex-1 text-left">
          <h3
            className={`text-lg font-bold mb-1 ${
              unlocked ? 'text-gray-800' : 'text-gray-500'
            }`}
          >
            {achievement.name}
          </h3>
          <p
            className={`text-sm ${
              unlocked ? 'text-gray-600' : 'text-gray-400'
            }`}
          >
            {achievement.description}
          </p>
          {unlocked && achievement.unlockedAt && (
            <div className="mt-2 inline-flex items-center gap-1 bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
              <Trophy className="w-3 h-3" />
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
