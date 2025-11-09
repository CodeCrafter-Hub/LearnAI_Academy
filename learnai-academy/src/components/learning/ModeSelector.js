'use client';

import { useState } from 'react';
import { Target, Lightbulb, Zap, BookOpen } from 'lucide-react';

/**
 * Enhanced ModeSelector Component
 * Grade-adaptive design with improved visuals
 */
export default function ModeSelector({ onSelect, topicName = '', gradeLevel = 5 }) {
  const [hoveredMode, setHoveredMode] = useState(null);

  const modes = [
    {
      type: 'PRACTICE',
      emoji: '🎯',
      icon: Target,
      title: 'Practice Mode',
      description: 'Solve problems and get instant feedback',
      gradient: 'linear-gradient(135deg, hsl(30, 90%, 60%) 0%, hsl(15, 85%, 55%) 100%)',
      features: ['Structured practice', 'Bonus points', 'Progress tracking'],
      color: '#F59E0B',
    },
    {
      type: 'HELP',
      emoji: '💡',
      icon: Lightbulb,
      title: 'Help Mode',
      description: 'Ask questions and get explanations',
      gradient: 'linear-gradient(135deg, hsl(220, 80%, 60%) 0%, hsl(260, 70%, 60%) 100%)',
      features: ['Open Q&A', 'Deep learning', 'Step-by-step help'],
      color: '#6366F1',
    },
  ];

  // Grade-adaptive sizing
  const getGradeConfig = (grade) => {
    if (grade <= 2) return { 
      emojiSize: 'var(--text-6xl)', 
      titleSize: 'var(--text-2xl)', 
      descSize: 'var(--text-base)',
      padding: 'var(--space-2xl)',
      iconSize: 40,
    };
    if (grade <= 5) return { 
      emojiSize: 'var(--text-5xl)', 
      titleSize: 'var(--text-xl)', 
      descSize: 'var(--text-sm)',
      padding: 'var(--space-xl)',
      iconSize: 36,
    };
    if (grade <= 8) return { 
      emojiSize: 'var(--text-4xl)', 
      titleSize: 'var(--text-lg)', 
      descSize: 'var(--text-sm)',
      padding: 'var(--space-lg)',
      iconSize: 32,
    };
    return { 
      emojiSize: 'var(--text-4xl)', 
      titleSize: 'var(--text-lg)', 
      descSize: 'var(--text-sm)',
      padding: 'var(--space-md)',
      iconSize: 28,
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
        <BookOpen size={24} style={{ color: 'var(--color-text-secondary)' }} />
        <div>
          <h1 style={{
            fontSize: gradeLevel <= 2 ? 'var(--text-3xl)' : 'var(--text-2xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2xs)',
          }}>
            {topicName}
          </h1>
          <p style={{
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-secondary)',
            margin: 0,
          }}>
            {gradeLevel <= 2 ? '🎮 How do you want to learn?' : 'Choose your learning mode'}
          </p>
        </div>
      </div>

      <div className="grid" style={{
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
        gap: gradeLevel <= 2 ? 'var(--space-xl)' : 'var(--space-lg)',
      }}>
        {modes.map((mode, idx) => {
          const Icon = mode.icon;
          const isHovered = hoveredMode === mode.type;

          return (
            <button
              key={mode.type}
              onClick={() => onSelect(mode.type)}
              onMouseEnter={() => setHoveredMode(mode.type)}
              onMouseLeave={() => setHoveredMode(null)}
              className="animate-scale-in"
              style={{
                padding: config.padding,
                textAlign: 'left',
                background: mode.gradient,
                borderRadius: 'var(--radius-2xl)',
                border: `3px solid ${isHovered ? 'rgba(255, 255, 255, 0.5)' : 'transparent'}`,
                boxShadow: isHovered 
                  ? '0 12px 32px rgba(0, 0, 0, 0.2)'
                  : 'var(--shadow-lg)',
                color: 'white',
                transition: 'all var(--transition-base)',
                cursor: 'pointer',
                animationDelay: `${idx * 100}ms`,
                transform: isHovered ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative background pattern */}
              <div style={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                filter: 'blur(40px)',
                transition: 'transform var(--transition-base)',
                transform: isHovered ? 'scale(1.2)' : 'scale(1)',
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Emoji and Icon */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  marginBottom: 'var(--space-md)',
                }}>
                  <div style={{ fontSize: config.emojiSize }}>
                    {mode.emoji}
                  </div>
                  <div style={{
                    width: config.iconSize + 8,
                    height: config.iconSize + 8,
                    borderRadius: 'var(--radius-lg)',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(4px)',
                  }}>
                    <Icon size={config.iconSize} />
                  </div>
                </div>

                {/* Title */}
                <h2 style={{
                  fontSize: config.titleSize,
                  fontWeight: 'var(--weight-bold)',
                  marginBottom: 'var(--space-sm)',
                }}>
                  {mode.title}
                </h2>

                {/* Description */}
                <p style={{
                  fontSize: config.descSize,
                  opacity: 0.95,
                  marginBottom: 'var(--space-md)',
                  lineHeight: 'var(--leading-relaxed)',
                }}>
                  {mode.description}
                </p>

                {/* Features */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-xs)',
                  fontSize: 'var(--text-sm)',
                }}>
                  {mode.features.map((feature, index) => (
                    <span
                      key={index}
                      style={{
                        padding: 'var(--space-2xs) var(--space-sm)',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(255, 255, 255, 0.25)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        transition: 'all var(--transition-fast)',
                        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                      }}
                    >
                      ✓ {feature}
                    </span>
                  ))}
                </div>

                {/* Action indicator */}
                <div style={{
                  marginTop: 'var(--space-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-xs)',
                  fontSize: 'var(--text-sm)',
                  opacity: isHovered ? 1 : 0.8,
                  transition: 'opacity var(--transition-fast)',
                }}>
                  <Zap size={16} style={{
                    transform: isHovered ? 'rotate(15deg)' : 'rotate(0)',
                    transition: 'transform var(--transition-fast)',
                  }} />
                  <span>Click to start</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
