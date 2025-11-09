'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Sparkles } from 'lucide-react';

export default function InteractiveFeedback({ 
  type, 
  message, 
  show = false, 
  duration = 3000,
  onClose 
}) {
  const [isVisible, setIsVisible] = useState(show);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimating(true);
      
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsAnimating(false);
          setTimeout(() => {
            setIsVisible(false);
            if (onClose) onClose();
          }, 300);
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
      setIsAnimating(false);
    }
  }, [show, duration, onClose]);

  if (!isVisible) return null;

  const config = {
    correct: {
      icon: CheckCircle,
      color: 'var(--color-success)',
      bg: 'var(--color-success-subtle)',
      border: 'var(--color-success)',
      animation: 'bounceIn',
    },
    incorrect: {
      icon: XCircle,
      color: 'var(--color-error)',
      bg: 'var(--color-error-subtle)',
      border: 'var(--color-error)',
      animation: 'shake',
    },
    hint: {
      icon: AlertCircle,
      color: 'var(--color-warning)',
      bg: 'var(--color-warning-subtle)',
      border: 'var(--color-warning)',
      animation: 'slideUp',
    },
    celebration: {
      icon: Sparkles,
      color: 'var(--color-accent)',
      bg: 'var(--color-accent-subtle)',
      border: 'var(--color-accent)',
      animation: 'celebrate',
    },
  };

  const feedback = config[type] || config.correct;
  const Icon = feedback.icon;

  return (
    <div
      className={`interactive-feedback ${feedback.animation} ${isAnimating ? 'visible' : 'hidden'}`}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10000,
        background: feedback.bg,
        border: `2px solid ${feedback.border}`,
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-xl)',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-md)',
        minWidth: '300px',
        maxWidth: '400px',
        textAlign: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon
          style={{
            width: '64px',
            height: '64px',
            color: feedback.color,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
          }}
        />
        {type === 'celebration' && (
          <div
            className="sparkle-effect"
            style={{
              position: 'absolute',
              inset: '-20px',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
              animation: 'pulse 1s ease-in-out infinite',
            }}
          />
        )}
      </div>

      <div
        style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--weight-semibold)',
          color: 'var(--color-text-primary)',
        }}
      >
        {message}
      </div>

      <style jsx>{`
        @keyframes bounceIn {
          0% {
            transform: translate(-50%, -50%) scale(0.3);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.05);
          }
          70% {
            transform: translate(-50%, -50%) scale(0.9);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translate(-50%, -50%) translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translate(-50%, -50%) translateX(-10px);
          }
          20%, 40%, 60%, 80% {
            transform: translate(-50%, -50%) translateX(10px);
          }
        }

        @keyframes slideUp {
          from {
            transform: translate(-50%, -30%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, -50%);
            opacity: 1;
          }
        }

        @keyframes celebrate {
          0% {
            transform: translate(-50%, -50%) scale(0.5) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1) rotate(360deg);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.2);
          }
        }

        .interactive-feedback {
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .interactive-feedback.hidden {
          opacity: 0;
          pointer-events: none;
        }

        .interactive-feedback.visible {
          opacity: 1;
          pointer-events: auto;
        }
      `}</style>
    </div>
  );
}

