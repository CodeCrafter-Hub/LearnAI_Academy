'use client';

import { Flame } from 'lucide-react';

export default function StreakDisplay({ streak, className = '' }) {
  const getStreakColor = (days) => {
    if (days >= 30) return 'text-red-500';
    if (days >= 7) return 'text-orange-500';
    if (days >= 3) return 'text-yellow-500';
    return 'text-gray-400';
  };

  const getStreakMessage = (days) => {
    if (days === 0) return "Start learning today!";
    if (days === 1) return "Great start!";
    if (days < 7) return "Keep it up!";
    if (days < 30) return "Amazing streak!";
    return "Legendary streak! 🔥";
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Flame className={`w-8 h-8 ${getStreakColor(streak)}`} />
      <div>
        <div className="text-2xl font-bold text-gray-800">{streak} days</div>
        <div className="text-sm text-gray-600">{getStreakMessage(streak)}</div>
      </div>
    </div>
  );
}
