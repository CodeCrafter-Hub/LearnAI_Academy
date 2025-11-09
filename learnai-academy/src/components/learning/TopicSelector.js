'use client';

import { useState } from 'react';
import { BookOpen, Sparkles, TrendingUp } from 'lucide-react';

/**
 * Enhanced TopicSelector Component
 * Grade-adaptive design with subject-themed styling
 */
export default function TopicSelector({ subject, onSelect, gradeLevel = 5 }) {
  const [hoveredTopic, setHoveredTopic] = useState(null);

  if (!subject || !subject.topics || subject.topics.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: 'var(--space-2xl)',
      }}>
        <p style={{
          fontSize: 'var(--text-lg)',
          color: 'var(--color-text-tertiary)',
        }}>
          No topics available for this subject.
        </p>
      </div>
    );
  }

  // Subject color mapping
  const subjectColors = {
    math: { primary: '#3B82F6', light: '#EFF6FF' },
    english: { primary: '#8B5CF6', light: '#F5F3FF' },
    science: { primary: '#10B981', light: '#ECFDF5' },
    coding: { primary: '#6366F1', light: '#EEF2FF' },
    history: { primary: '#F59E0B', light: '#FFFBEB' },
  };

  const subjectSlug = subject.slug || subject.name?.toLowerCase();
  const colors = subjectColors[subjectSlug] || subjectColors.math;

  // Grade-adaptive sizing
  const getGradeConfig = (grade) => {
    if (grade <= 2) return { 
      titleSize: 'var(--text-2xl)', 
      descSize: 'var(--text-base)',
      padding: 'var(--space-xl)',
      cardMinHeight: '140px',
      iconSize: 32,
    };
    if (grade <= 5) return { 
      titleSize: 'var(--text-xl)', 
      descSize: 'var(--text-sm)',
      padding: 'var(--space-lg)',
      cardMinHeight: '130px',
      iconSize: 28,
    };
    if (grade <= 8) return { 
      titleSize: 'var(--text-lg)', 
      descSize: 'var(--text-sm)',
      padding: 'var(--space-lg)',
      cardMinHeight: '120px',
      iconSize: 24,
    };
    return { 
      titleSize: 'var(--text-lg)', 
      descSize: 'var(--text-sm)',
      padding: 'var(--space-md)',
      cardMinHeight: '110px',
      iconSize: 20,
    };
  };

  const config = getGradeConfig(gradeLevel);

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-md)',
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--radius-xl)',
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}CC 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}>
          <BookOpen size={24} />
        </div>
        <div>
          <h1 style={{
            fontSize: gradeLevel <= 2 ? 'var(--text-3xl)' : 'var(--text-2xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2xs)',
          }}>
            {subject.name}
          </h1>
          <p style={{
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-secondary)',
            margin: 0,
          }}>
            {gradeLevel <= 2 ? '🎯 Pick a topic!' : 'Choose a topic to study'}
          </p>
        </div>
      </div>

      <div className="grid grid-auto-fit" style={{
        gap: gradeLevel <= 2 ? 'var(--space-lg)' : 'var(--space-md)',
      }}>
        {subject.topics.map((topic, idx) => {
          const isHovered = hoveredTopic === topic.id;
          const hasProgress = topic.progress !== undefined;

          return (
            <button
              key={topic.id}
              onClick={() => onSelect(topic)}
              onMouseEnter={() => setHoveredTopic(topic.id)}
              onMouseLeave={() => setHoveredTopic(null)}
              className="animate-fade-in"
              style={{
                padding: config.padding,
                textAlign: 'left',
                border: `2px solid ${isHovered ? colors.primary : 'var(--color-border-subtle)'}`,
                background: isHovered 
                  ? colors.light
                  : 'var(--color-bg-elevated)',
                borderRadius: 'var(--radius-xl)',
                minHeight: config.cardMinHeight,
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                animationDelay: `${idx * 50}ms`,
                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: isHovered 
                  ? `0 4px 16px ${colors.primary}20`
                  : 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-xs)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative accent */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.primary}80 100%)`,
                opacity: isHovered ? 1 : 0.6,
                transition: 'opacity var(--transition-fast)',
              }} />

              {/* Icon and Title */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                marginTop: 'var(--space-xs)',
              }}>
                <div style={{
                  width: config.iconSize + 8,
                  height: config.iconSize + 8,
                  borderRadius: 'var(--radius-lg)',
                  background: `${colors.primary}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.primary,
                }}>
                  <Sparkles size={config.iconSize} />
                </div>
                <h3 style={{
                  fontSize: config.titleSize,
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--color-text-primary)',
                  margin: 0,
                  flex: 1,
                }}>
                  {topic.name}
                </h3>
              </div>

              {/* Description */}
              <p style={{
                fontSize: config.descSize,
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                margin: 0,
                flex: 1,
              }}>
                {topic.description}
              </p>

              {/* Progress indicator or action */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 'auto',
                paddingTop: 'var(--space-xs)',
              }}>
                {hasProgress && (
                  <div style={{
                    flex: 1,
                    height: '4px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-bg-muted)',
                    overflow: 'hidden',
                    marginRight: 'var(--space-sm)',
                  }}>
                    <div style={{
                      width: `${topic.progress}%`,
                      height: '100%',
                      background: colors.primary,
                      transition: 'width var(--transition-base)',
                    }} />
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-xs)',
                  color: colors.primary,
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-medium)',
                  opacity: isHovered ? 1 : 0.7,
                  transition: 'opacity var(--transition-fast)',
                }}>
                  <span>Start</span>
                  <TrendingUp size={16} style={{
                    transform: isHovered ? 'translateX(2px) translateY(-2px)' : 'translateX(0)',
                    transition: 'transform var(--transition-fast)',
                  }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
