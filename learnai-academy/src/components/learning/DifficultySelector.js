'use client';

import { useState } from 'react';
import { Sparkles, TrendingUp, Award } from 'lucide-react';

/**
 * Enhanced DifficultySelector Component
 * Grade-adaptive design with improved visuals and interactions
 */
export default function DifficultySelector({
  onSelect,
  isLoading = false,
  topicName = '',
  mode = 'PRACTICE',
  gradeLevel = 5,
}) {
  const [hoveredDifficulty, setHoveredDifficulty] = useState(null);

  const difficulties = [
    {
      level: 'EASY',
      emoji: '🌱',
      title: 'Easy',
      description: 'Perfect for learning new concepts',
      pointMultiplier: '1x',
      accentColor: 'hsl(145, 55%, 45%)',
      lightColor: 'hsl(145, 50%, 96%)',
      gradient: 'linear-gradient(135deg, hsl(145, 55%, 45%) 0%, hsl(145, 50%, 55%) 100%)',
      icon: Sparkles,
    },
    {
      level: 'MEDIUM',
      emoji: '🌟',
      title: 'Medium',
      description: 'Good balance of challenge',
      pointMultiplier: '1.2x',
      accentColor: 'hsl(40, 85%, 50%)',
      lightColor: 'hsl(40, 90%, 96%)',
      gradient: 'linear-gradient(135deg, hsl(40, 85%, 50%) 0%, hsl(40, 80%, 60%) 100%)',
      icon: TrendingUp,
    },
    {
      level: 'HARD',
      emoji: '🔥',
      title: 'Hard',
      description: 'Maximum challenge',
      pointMultiplier: '1.5x',
      accentColor: 'hsl(355, 70%, 55%)',
      lightColor: 'hsl(355, 70%, 96%)',
      gradient: 'linear-gradient(135deg, hsl(355, 70%, 55%) 0%, hsl(355, 65%, 65%) 100%)',
      icon: Award,
    },
  ];

  // Grade-adaptive sizing
  const getGradeConfig = (grade) => {
    if (grade <= 2) return { 
      emojiSize: 'var(--text-5xl)', 
      titleSize: 'var(--text-2xl)', 
      descSize: 'var(--text-base)',
      padding: 'var(--space-xl)',
      iconSize: 32,
      cardMinHeight: '200px',
    };
    if (grade <= 5) return { 
      emojiSize: 'var(--text-4xl)', 
      titleSize: 'var(--text-xl)', 
      descSize: 'var(--text-sm)',
      padding: 'var(--space-lg)',
      iconSize: 28,
      cardMinHeight: '180px',
    };
    if (grade <= 8) return { 
      emojiSize: 'var(--text-4xl)', 
      titleSize: 'var(--text-lg)', 
      descSize: 'var(--text-sm)',
      padding: 'var(--space-lg)',
      iconSize: 24,
      cardMinHeight: '160px',
    };
    return { 
      emojiSize: 'var(--text-3xl)', 
      titleSize: 'var(--text-lg)', 
      descSize: 'var(--text-sm)',
      padding: 'var(--space-md)',
      iconSize: 20,
      cardMinHeight: '150px',
    };
  };

  const config = getGradeConfig(gradeLevel);

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        marginBottom: 'var(--space-md)',
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}>
          <Award size={24} />
        </div>
        <div>
          <h1 style={{
            fontSize: gradeLevel <= 2 ? 'var(--text-3xl)' : 'var(--text-2xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2xs)',
          }}>
            {gradeLevel <= 2 ? '🎚️ Choose Difficulty' : 'Choose Difficulty'}
          </h1>
          <p style={{
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-secondary)',
            margin: 0,
          }}>
            {topicName} • {mode === 'PRACTICE' ? 'Practice' : 'Help'} Mode
          </p>
        </div>
      </div>

      <div className="grid" style={{
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
        gap: gradeLevel <= 2 ? 'var(--space-lg)' : 'var(--space-md)',
      }}>
        {difficulties.map((difficulty, idx) => {
          const Icon = difficulty.icon;
          const isHovered = hoveredDifficulty === difficulty.level;

          return (
            <button
              key={difficulty.level}
              onClick={() => !isLoading && onSelect(difficulty.level)}
              onMouseEnter={() => setHoveredDifficulty(difficulty.level)}
              onMouseLeave={() => setHoveredDifficulty(null)}
              disabled={isLoading}
              className="animate-scale-in"
              style={{
                padding: config.padding,
                textAlign: 'center',
                border: `3px solid ${isHovered ? difficulty.accentColor : 'var(--color-border-subtle)'}`,
                background: isHovered 
                  ? difficulty.lightColor
                  : 'var(--color-bg-elevated)',
                borderRadius: 'var(--radius-2xl)',
                minHeight: config.cardMinHeight,
                opacity: isLoading ? 0.5 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                animationDelay: `${idx * 80}ms`,
                transform: isHovered && !isLoading ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
                boxShadow: isHovered && !isLoading
                  ? `0 8px 24px ${difficulty.accentColor}30`
                  : 'var(--shadow-sm)',
                transition: 'all var(--transition-base)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Accent bar */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: difficulty.gradient,
                opacity: isHovered ? 1 : 0.8,
                transition: 'opacity var(--transition-fast)',
              }} />

              {/* Emoji */}
              <div style={{
                fontSize: config.emojiSize,
                marginTop: 'var(--space-xs)',
                transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0)',
                transition: 'transform var(--transition-base)',
              }}>
                {difficulty.emoji}
              </div>

              {/* Icon */}
              <div style={{
                width: config.iconSize + 12,
                height: config.iconSize + 12,
                borderRadius: 'var(--radius-lg)',
                background: difficulty.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: `0 4px 12px ${difficulty.accentColor}40`,
                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform var(--transition-base)',
              }}>
                <Icon size={config.iconSize} />
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: config.titleSize,
                fontWeight: 'var(--weight-bold)',
                color: difficulty.accentColor,
                margin: 0,
              }}>
                {difficulty.title}
              </h3>

              {/* Description */}
              <p style={{
                fontSize: config.descSize,
                color: 'var(--color-text-secondary)',
                margin: 0,
                textAlign: 'center',
              }}>
                {difficulty.description}
              </p>

              {/* Points badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-xs)',
                padding: 'var(--space-xs) var(--space-md)',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-semibold)',
                background: difficulty.lightColor,
                color: difficulty.accentColor,
                border: `2px solid ${difficulty.accentColor}30`,
                marginTop: 'auto',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform var(--transition-fast)',
              }}>
                <Award size={16} />
                <span>Points: {difficulty.pointMultiplier}</span>
              </div>

              {/* Loading overlay */}
              {isLoading && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius-2xl)',
                }}>
                  <div className="animate-spin" style={{
                    width: 24,
                    height: 24,
                    border: '3px solid var(--color-border-subtle)',
                    borderTopColor: difficulty.accentColor,
                    borderRadius: '50%',
                  }} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
