'use client';

import { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';

export default function StreakCounter({ currentStreak, targetStreak = 7, size = 'md' }) {
  const [animatedStreak, setAnimatedStreak] = useState(0);
  const [isCelebrating, setIsCelebrating] = useState(false);

  useEffect(() => {
    // Animate streak count
    if (currentStreak > 0) {
      const duration = 1000;
      const steps = 30;
      const increment = currentStreak / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= currentStreak) {
          setAnimatedStreak(currentStreak);
          clearInterval(timer);
          
          // Celebrate milestones
          if (currentStreak % 7 === 0 && currentStreak > 0) {
            setIsCelebrating(true);
            setTimeout(() => setIsCelebrating(false), 2000);
          }
        } else {
          setAnimatedStreak(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setAnimatedStreak(0);
    }
  }, [currentStreak]);

  const sizeMap = {
    sm: { icon: '16px', text: 'var(--text-lg)', flame: '20px' },
    md: { icon: '20px', text: 'var(--text-2xl)', flame: '28px' },
    lg: { icon: '24px', text: 'var(--text-3xl)', flame: '36px' },
  };

  const dimensions = sizeMap[size];
  const progress = Math.min((currentStreak / targetStreak) * 100, 100);

  return (
    <div
      className={`streak-counter ${isCelebrating ? 'celebrate' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        padding: 'var(--space-md)',
        background: 'linear-gradient(135deg, rgba(252, 211, 77, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid rgba(252, 211, 77, 0.2)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated flame background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(90deg, transparent 0%, rgba(252, 211, 77, 0.1) ${progress}%, transparent 100%)`,
          transition: 'background 0.3s ease',
        }}
      />

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Flame
          style={{
            width: dimensions.flame,
            height: dimensions.flame,
            color: currentStreak > 0 ? '#F59E0B' : 'var(--color-text-tertiary)',
            filter: currentStreak > 0 ? 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))' : 'none',
            animation: currentStreak > 0 ? 'flicker 2s infinite' : 'none',
            transition: 'all 0.3s ease',
          }}
        />
        {isCelebrating && (
          <div
            style={{
              position: 'absolute',
              inset: '-10px',
              background: 'radial-gradient(circle, rgba(252, 211, 77, 0.3) 0%, transparent 70%)',
              animation: 'pulse 1s ease-in-out',
            }}
          />
        )}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            fontSize: dimensions.text,
            fontWeight: 'var(--weight-bold)',
            color: currentStreak > 0 ? '#F59E0B' : 'var(--color-text-tertiary)',
            lineHeight: 1,
            transition: 'color 0.3s ease',
          }}
        >
          {animatedStreak}
        </div>
        <div
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-secondary)',
            fontWeight: 'var(--weight-medium)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginTop: '2px',
          }}
        >
          Day Streak
        </div>
      </div>

      {/* Progress indicator */}
      {targetStreak > 0 && (
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '4px',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '4px',
              background: 'var(--color-bg-muted)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #FCD34D 0%, #F59E0B 100%)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.5s ease',
                boxShadow: progress >= 100 ? '0 0 8px rgba(245, 158, 11, 0.6)' : 'none',
              }}
            />
          </div>
          <div
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-tertiary)',
            }}
          >
            {Math.round(progress)}% to {targetStreak}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes flicker {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }

        .streak-counter.celebrate {
          animation: celebrate 0.5s ease-in-out;
        }

        @keyframes celebrate {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

