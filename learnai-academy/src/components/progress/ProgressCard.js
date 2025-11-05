'use client';

import { TrendingUp, Clock, Star, Award } from 'lucide-react';

export default function ProgressCard({ title, value, subtitle, icon: Icon, color, trend }) {
  return (
    <div className={`${color} rounded-2xl p-6 text-white shadow-lg`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium opacity-90">{title}</span>
        {Icon && <Icon className="w-6 h-6" />}
      </div>
      <div className="text-4xl font-bold mb-1">{value}</div>
      {subtitle && (
        <div className="text-sm opacity-90 flex items-center gap-1">
          {trend && trend > 0 && (
            <TrendingUp className="w-4 h-4" />
          )}
          {subtitle}
        </div>
      )}
    </div>
  );
}
