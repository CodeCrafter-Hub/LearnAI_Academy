'use client';

import { useState, useEffect } from 'react';
import { X, Focus, Volume2, VolumeX, Settings, BookOpen, Clock, TrendingUp } from 'lucide-react';

/**
 * Enhanced Session Header
 * Grade-adaptive header for active learning sessions
 */
export default function EnhancedSessionHeader({
  topicName,
  mode,
  subjectName,
  gradeLevel = 5,
  onEndSession,
  onToggleFocus,
  focusModeEnabled = false,
  sessionStartTime,
}) {
  const [elapsedTime, setElapsedTime] = useState('0:00');
  const [isMuted, setIsMuted] = useState(false);

  // Calculate elapsed time
  useEffect(() => {
    if (!sessionStartTime) return;

    const interval = setInterval(() => {
      const start = new Date(sessionStartTime);
      const now = new Date();
      const diff = Math.floor((now - start) / 1000);
      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setElapsedTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Grade-adaptive sizing
  const getGradeConfig = (grade) => {
    if (grade <= 2) return { 
      titleSize: 'var(--text-2xl)', 
      subtitleSize: 'var(--text-base)',
      iconSize: 24,
      buttonPadding: 'var(--space-sm) var(--space-md)',
    };
    if (grade <= 5) return { 
      titleSize: 'var(--text-xl)', 
      subtitleSize: 'var(--text-sm)',
      iconSize: 20,
      buttonPadding: 'var(--space-xs) var(--space-md)',
    };
    return { 
      titleSize: 'var(--text-lg)', 
      subtitleSize: 'var(--text-sm)',
      iconSize: 18,
      buttonPadding: 'var(--space-xs) var(--space-sm)',
    };
  };

  const config = getGradeConfig(gradeLevel);

  // Subject color mapping
  const subjectColors = {
    math: '#3B82F6',
    english: '#8B5CF6',
    science: '#10B981',
    coding: '#6366F1',
    history: '#F59E0B',
  };

  const subjectColor = subjectColors[subjectName?.toLowerCase()] || subjectColors.math;

  return (
    <header
      className="glass"
      style={{
        padding: gradeLevel <= 2 ? 'var(--space-lg)' : 'var(--space-md)',
        borderBottom: `2px solid ${subjectColor}20`,
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sticky)',
        background: 'var(--color-bg-elevated)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-md)',
        flexWrap: 'wrap',
      }}>
        {/* Left: Topic Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            marginBottom: 'var(--space-2xs)',
          }}>
            <div style={{
              width: config.iconSize + 8,
              height: config.iconSize + 8,
              borderRadius: 'var(--radius-lg)',
              background: `linear-gradient(135deg, ${subjectColor} 0%, ${subjectColor}CC 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              flexShrink: 0,
            }}>
              <BookOpen size={config.iconSize} />
            </div>
            <h2 style={{
              fontSize: config.titleSize,
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--color-text-primary)',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {topicName}
            </h2>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
            flexWrap: 'wrap',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
              fontSize: config.subtitleSize,
              color: 'var(--color-text-secondary)',
            }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: mode === 'PRACTICE' ? '#F59E0B' : '#6366F1',
              }} />
              <span>{mode === 'PRACTICE' ? 'Practice Mode' : 'Help Mode'}</span>
            </div>
            {sessionStartTime && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-xs)',
                fontSize: config.subtitleSize,
                color: 'var(--color-text-secondary)',
              }}>
                <Clock size={14} />
                <span>{elapsedTime}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-xs)',
          flexShrink: 0,
        }}>
          {/* Focus Mode Toggle */}
          <button
            onClick={onToggleFocus}
            className="btn btn-ghost"
            style={{
              padding: config.buttonPadding,
              minHeight: gradeLevel <= 2 ? '48px' : '40px',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
              border: focusModeEnabled ? `2px solid ${subjectColor}` : '2px solid transparent',
              background: focusModeEnabled ? `${subjectColor}15` : 'transparent',
            }}
            title={focusModeEnabled ? 'Disable Focus Mode' : 'Enable Focus Mode'}
          >
            <Focus size={config.iconSize} style={{
              color: focusModeEnabled ? subjectColor : 'var(--color-text-secondary)',
            }} />
            {gradeLevel <= 5 && (
              <span style={{ fontSize: 'var(--text-sm)' }}>
                {focusModeEnabled ? 'Focus On' : 'Focus'}
              </span>
            )}
          </button>

          {/* Mute Toggle (for future voice features) */}
          {gradeLevel >= 6 && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="btn btn-ghost"
              style={{
                padding: config.buttonPadding,
                minHeight: '40px',
              }}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX size={config.iconSize} />
              ) : (
                <Volume2 size={config.iconSize} />
              )}
            </button>
          )}

          {/* End Session */}
          <button
            onClick={onEndSession}
            className="btn btn-secondary"
            style={{
              padding: config.buttonPadding,
              minHeight: gradeLevel <= 2 ? '48px' : '40px',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
              background: 'hsl(0, 70%, 55%)',
              color: 'white',
              border: 'none',
              fontSize: gradeLevel <= 2 ? 'var(--text-base)' : 'var(--text-sm)',
            }}
          >
            <X size={config.iconSize} />
            <span>{gradeLevel <= 2 ? 'Done' : 'End Session'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar (optional - can show session progress) */}
      {gradeLevel >= 6 && (
        <div style={{
          marginTop: 'var(--space-sm)',
          height: '2px',
          background: 'var(--color-bg-muted)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: '0%', // Can be calculated based on session progress
            background: `linear-gradient(90deg, ${subjectColor} 0%, ${subjectColor}CC 100%)`,
            transition: 'width 0.3s ease',
          }} />
        </div>
      )}
    </header>
  );
}

