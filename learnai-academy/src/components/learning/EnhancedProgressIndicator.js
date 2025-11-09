'use client';

import { CheckCircle, Circle } from 'lucide-react';

/**
 * Enhanced Progress Indicator - Grade-adaptive progress bar
 * Shows steps: Subject → Topic → Mode → Difficulty
 */
export default function EnhancedProgressIndicator({ 
  currentStep, 
  gradeLevel = 5 
}) {
  const steps = [
    { id: 'subject', label: 'Subject', icon: CheckCircle },
    { id: 'topic', label: 'Topic', icon: CheckCircle },
    { id: 'mode', label: 'Mode', icon: CheckCircle },
    { id: 'difficulty', label: 'Difficulty', icon: CheckCircle },
  ];

  // Grade-adaptive sizing
  const getGradeConfig = (grade) => {
    if (grade <= 2) return { iconSize: 20, fontSize: 'var(--text-sm)', showLabels: false };
    if (grade <= 5) return { iconSize: 18, fontSize: 'var(--text-sm)', showLabels: true };
    if (grade <= 8) return { iconSize: 16, fontSize: 'var(--text-base)', showLabels: true };
    return { iconSize: 16, fontSize: 'var(--text-base)', showLabels: true };
  };

  const config = getGradeConfig(gradeLevel);
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: gradeLevel <= 2 ? 'var(--space-xs)' : 'var(--space-sm)',
      marginBottom: 'var(--space-2xl)',
      justifyContent: 'center',
      maxWidth: '600px',
      marginInline: 'auto',
      padding: '0 var(--space-md)',
    }}>
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const Icon = step.icon;

        return (
          <div
            key={step.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-xs)',
              flex: 1,
              position: 'relative',
            }}
          >
            {/* Step Circle */}
            <div
              style={{
                width: config.iconSize + 8,
                height: config.iconSize + 8,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isCompleted || isCurrent
                  ? 'var(--color-accent)'
                  : 'var(--color-bg-muted)',
                color: isCompleted || isCurrent ? 'white' : 'var(--color-text-tertiary)',
                border: isCurrent
                  ? `3px solid var(--color-accent)`
                  : `2px solid ${isCompleted ? 'var(--color-accent)' : 'var(--color-border-subtle)'}`,
                transition: 'all var(--transition-base)',
                transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
                boxShadow: isCurrent ? '0 0 0 4px rgba(var(--color-accent-rgb), 0.2)' : 'none',
              }}
            >
              {isCompleted ? (
                <CheckCircle size={config.iconSize} fill="currentColor" />
              ) : (
                <Circle size={config.iconSize} />
              )}
            </div>

            {/* Step Label */}
            {config.showLabels && (
              <span
                style={{
                  fontSize: config.fontSize,
                  fontWeight: isCurrent ? 'var(--weight-semibold)' : 'var(--weight-normal)',
                  color: isCompleted || isCurrent
                    ? 'var(--color-accent)'
                    : 'var(--color-text-tertiary)',
                  textAlign: 'center',
                  transition: 'all var(--transition-base)',
                }}
              >
                {step.label}
              </span>
            )}

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                style={{
                  position: 'absolute',
                  top: (config.iconSize + 8) / 2,
                  left: '50%',
                  width: '100%',
                  height: '2px',
                  background: index < currentIndex
                    ? 'var(--color-accent)'
                    : 'var(--color-bg-muted)',
                  zIndex: -1,
                  transition: 'all var(--transition-base)',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

