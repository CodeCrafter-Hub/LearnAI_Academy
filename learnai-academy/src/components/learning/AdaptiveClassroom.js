'use client';

import { useState, useEffect } from 'react';
import { useGradeLevelUI } from './GradeLevelUIProvider';
import { useAuth } from '@/hooks/useAuth';
import ChatInterface from './ChatInterface';
import { BookOpen, Calculator, FlaskConical, Code, Landmark, Sparkles } from 'lucide-react';

/**
 * Adaptive Classroom Component
 * Adapts the classroom interface based on grade level and subject
 */
export default function AdaptiveClassroom({ 
  sessionId, 
  subjectSlug, 
  gradeLevel, 
  onSessionEnd 
}) {
  const { uiConfig } = useGradeLevelUI();
  const { user } = useAuth();
  const [classroomDesign, setClassroomDesign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const effectiveGrade = gradeLevel !== undefined ? gradeLevel : (user?.students?.[0]?.gradeLevel || 5);
  const effectiveSubject = subjectSlug || 'math';

  useEffect(() => {
    const loadClassroomDesign = async () => {
      try {
        const response = await fetch(
          `/api/ui/classroom-design?gradeLevel=${effectiveGrade}&subjectSlug=${effectiveSubject}`,
          { credentials: 'include' }
        );

        if (response.ok) {
          const data = await response.json();
          setClassroomDesign(data.design);
        }
      } catch (error) {
        console.error('Failed to load classroom design:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClassroomDesign();
  }, [effectiveGrade, effectiveSubject]);

  // Apply classroom design styles
  useEffect(() => {
    if (classroomDesign && typeof document !== 'undefined') {
      const root = document.documentElement;
      const { colors, visualTheme } = classroomDesign;

      // Apply subject-specific colors
      if (colors) {
        Object.entries(colors).forEach(([key, value]) => {
          root.style.setProperty(`--classroom-${key}`, value);
        });
      }

      // Apply background
      if (visualTheme?.background) {
        const body = document.body;
        if (visualTheme.background.type === 'gradient') {
          body.style.background = visualTheme.background.gradient;
        } else {
          body.style.backgroundColor = visualTheme.background.color;
        }
      }
    }
  }, [classroomDesign]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        background: classroomDesign?.visualTheme?.background?.color || 'var(--color-bg-base)'
      }}>
        <div className="animate-bounce">
          <Sparkles className="w-8 h-8 text-blue-500" />
        </div>
      </div>
    );
  }

  // Get subject icon
  const getSubjectIcon = (slug) => {
    const icons = {
      math: Calculator,
      english: BookOpen,
      science: FlaskConical,
      coding: Code,
      history: Landmark,
    };
    return icons[slug] || BookOpen;
  };

  const SubjectIcon = getSubjectIcon(effectiveSubject);

  return (
    <div 
      className="adaptive-classroom"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: classroomDesign?.visualTheme?.background?.gradient || 
                   classroomDesign?.visualTheme?.background?.color || 
                   'var(--color-bg-base)',
        maxWidth: classroomDesign?.classroomLayout?.maxWidth || '100%',
        margin: '0 auto',
      }}
    >
      {/* Subject Header */}
      {classroomDesign && (
        <div 
          className="glass"
          style={{
            padding: uiConfig?.spacing?.medium || 'var(--space-md)',
            borderBottom: '1px solid var(--color-border-subtle)',
            background: `linear-gradient(135deg, ${classroomDesign.colors?.primary}15 0%, ${classroomDesign.colors?.secondary}15 100%)`,
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-lg)',
              background: `linear-gradient(135deg, ${classroomDesign.colors?.primary} 0%, ${classroomDesign.colors?.secondary} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}>
              <SubjectIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 style={{
                fontSize: uiConfig?.typography?.headingSizes?.h2 || 'var(--text-xl)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-3xs)',
                textTransform: 'capitalize',
              }}>
                {effectiveSubject} Classroom
              </h2>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
              }}>
                {classroomDesign.gradeBand} • Age-appropriate design
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Interface with adaptive styling */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <ChatInterface 
          sessionId={sessionId} 
          onSessionEnd={onSessionEnd}
          className="adaptive-chat"
        />
      </div>

      {/* Subject-specific tools (if applicable) */}
      {classroomDesign?.classroomLayout?.tools && (
        <div style={{
          padding: 'var(--space-sm)',
          borderTop: '1px solid var(--color-border-subtle)',
          background: 'var(--color-bg-elevated)',
          display: 'flex',
          gap: 'var(--space-xs)',
          justifyContent: 'center',
        }}>
          {classroomDesign.classroomLayout.tools.split(', ').map((tool, index) => (
            <button
              key={index}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 'var(--text-xs)' }}
            >
              {tool}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

