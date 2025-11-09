'use client';

import { useState } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Calculator, BookOpen, FlaskConical, Code, Landmark, Music, Palette } from 'lucide-react';

/**
 * Enhanced SubjectSelector Component
 * Grade-adaptive design with subject-specific icons and colors
 */
export default function SubjectSelector({ subjects = [], onSelect, gradeLevel = 5 }) {
  const [hoveredSubject, setHoveredSubject] = useState(null);

  if (subjects.length === 0) {
    return <LoadingSpinner message="Loading subjects..." />;
  }

  // Subject icons and colors
  const subjectConfig = {
    math: { icon: Calculator, color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)' },
    english: { icon: BookOpen, color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)' },
    science: { icon: FlaskConical, color: '#10B981', gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)' },
    coding: { icon: Code, color: '#6366F1', gradient: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)' },
    history: { icon: Landmark, color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)' },
    music: { icon: Music, color: '#EC4899', gradient: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)' },
    art: { icon: Palette, color: '#F97316', gradient: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)' },
  };

  // Grade-adaptive sizing
  const getGradeConfig = (grade) => {
    if (grade <= 2) return { 
      iconSize: 48, 
      titleSize: 'var(--text-2xl)', 
      descSize: 'var(--text-base)',
      padding: 'var(--space-xl)',
      cardMinHeight: '180px',
    };
    if (grade <= 5) return { 
      iconSize: 40, 
      titleSize: 'var(--text-xl)', 
      descSize: 'var(--text-sm)',
      padding: 'var(--space-lg)',
      cardMinHeight: '160px',
    };
    if (grade <= 8) return { 
      iconSize: 36, 
      titleSize: 'var(--text-lg)', 
      descSize: 'var(--text-sm)',
      padding: 'var(--space-lg)',
      cardMinHeight: '150px',
    };
    return { 
      iconSize: 32, 
      titleSize: 'var(--text-lg)', 
      descSize: 'var(--text-sm)',
      padding: 'var(--space-md)',
      cardMinHeight: '140px',
    };
  };

  const config = getGradeConfig(gradeLevel);

  return (
    <div>
      <h1 style={{
        fontSize: gradeLevel <= 2 ? 'var(--text-4xl)' : 'var(--text-3xl)',
        fontWeight: 'var(--weight-bold)',
        color: 'var(--color-text-primary)',
        marginBottom: gradeLevel <= 2 ? 'var(--space-xl)' : 'var(--space-lg)',
        textAlign: 'center',
      }}>
        {gradeLevel <= 2 ? '🎓 Choose a Subject' : 'Choose a Subject'}
      </h1>

      <div className="grid grid-auto-fit" style={{
        gap: gradeLevel <= 2 ? 'var(--space-lg)' : 'var(--space-md)',
      }}>
        {subjects.map((subject, idx) => {
          const subjectSlug = subject.slug || subject.name?.toLowerCase();
          const subjectStyle = subjectConfig[subjectSlug] || subjectConfig.math;
          const Icon = subjectStyle.icon;
          const isHovered = hoveredSubject === subject.id;

          return (
            <button
              key={subject.id}
              onClick={() => onSelect(subject)}
              onMouseEnter={() => setHoveredSubject(subject.id)}
              onMouseLeave={() => setHoveredSubject(null)}
              className="animate-fade-in"
              style={{
                padding: config.padding,
                textAlign: 'left',
                border: `2px solid ${isHovered ? subjectStyle.color : 'var(--color-border-subtle)'}`,
                background: isHovered 
                  ? `linear-gradient(135deg, ${subjectStyle.color}15 0%, ${subjectStyle.color}08 100%)`
                  : 'var(--color-bg-elevated)',
                borderRadius: 'var(--radius-2xl)',
                minHeight: config.cardMinHeight,
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                animationDelay: `${idx * 50}ms`,
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: isHovered 
                  ? `0 8px 24px ${subjectStyle.color}20`
                  : 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-sm)',
              }}
            >
              {/* Icon */}
              <div style={{
                width: config.iconSize + 16,
                height: config.iconSize + 16,
                borderRadius: 'var(--radius-xl)',
                background: subjectStyle.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                marginBottom: 'var(--space-xs)',
                boxShadow: `0 4px 12px ${subjectStyle.color}40`,
              }}>
                <Icon size={config.iconSize} />
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: config.titleSize,
                fontWeight: 'var(--weight-bold)',
                color: 'var(--color-text-primary)',
                margin: 0,
              }}>
                {subject.name}
              </h3>

              {/* Description */}
              <p style={{
                fontSize: config.descSize,
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                margin: 0,
                flex: 1,
              }}>
                {subject.description}
              </p>

              {/* Arrow indicator */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-xs)',
                color: subjectStyle.color,
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-medium)',
                marginTop: 'auto',
                opacity: isHovered ? 1 : 0.6,
                transition: 'opacity var(--transition-fast)',
              }}>
                <span>Start Learning</span>
                <span style={{ transform: isHovered ? 'translateX(4px)' : 'translateX(0)', transition: 'transform var(--transition-fast)' }}>
                  →
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
