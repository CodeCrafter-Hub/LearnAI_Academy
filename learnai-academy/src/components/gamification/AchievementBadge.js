'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Zap, Target, BookOpen, Flame, Award } from 'lucide-react';

const iconMap = {
  first_steps: BookOpen,
  week_warrior: Flame,
  perfect_score: Target,
  speed_demon: Zap,
  scholar: Star,
  master: Trophy,
  default: Award,
};

const colorMap = {
  first_steps: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
  week_warrior: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
  perfect_score: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
  speed_demon: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
  scholar: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)',
  master: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
  default: 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)',
};

export default function AchievementBadge({ achievement, size = 'md', showAnimation = true, onClick }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const Icon = iconMap[achievement?.type] || iconMap.default;
  const gradient = colorMap[achievement?.type] || colorMap.default;
  const isUnlocked = achievement?.unlockedAt !== null;

  useEffect(() => {
    if (showAnimation && isUnlocked && achievement?.recentlyUnlocked) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [achievement, showAnimation, isUnlocked]);

  const sizeMap = {
    sm: { container: '48px', icon: '20px', text: 'var(--text-xs)' },
    md: { container: '64px', icon: '28px', text: 'var(--text-sm)' },
    lg: { container: '96px', icon: '40px', text: 'var(--text-lg)' },
    xl: { container: '128px', icon: '56px', text: 'var(--text-xl)' },
  };

  const dimensions = sizeMap[size];

  return (
    <div
      onClick={onClick}
      className={`achievement-badge ${isAnimating ? 'animate-achievement-unlock' : ''} ${!isUnlocked ? 'achievement-locked' : ''}`}
      style={{
        position: 'relative',
        width: dimensions.container,
        height: dimensions.container,
        borderRadius: 'var(--radius-full)',
        background: isUnlocked ? gradient : 'var(--color-bg-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all var(--transition-base)',
        boxShadow: isUnlocked ? 'var(--shadow-md)' : 'none',
        opacity: isUnlocked ? 1 : 0.5,
        transform: isAnimating ? 'scale(1.1)' : 'scale(1)',
      }}
      onMouseEnter={(e) => {
        if (isUnlocked) {
          e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = isAnimating ? 'scale(1.1)' : 'scale(1)';
        e.currentTarget.style.boxShadow = isUnlocked ? 'var(--shadow-md)' : 'none';
      }}
    >
      <Icon
        style={{
          width: dimensions.icon,
          height: dimensions.icon,
          color: isUnlocked ? 'white' : 'var(--color-text-tertiary)',
          filter: isUnlocked ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none',
        }}
      />
      
      {isAnimating && (
        <div
          className="achievement-sparkle"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'var(--radius-full)',
            background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)',
            animation: 'pulse 1s ease-in-out',
          }}
        />
      )}

      {achievement?.progress && achievement.progress < 100 && (
        <div
          style={{
            position: 'absolute',
            bottom: '-4px',
            right: '-4px',
            width: '20px',
            height: '20px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-bg-base)',
            border: '2px solid var(--color-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-accent)',
          }}
        >
          {Math.round(achievement.progress)}%
        </div>
      )}
    </div>
  );
}

