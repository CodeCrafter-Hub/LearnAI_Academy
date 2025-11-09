'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, Clock, TrendingUp } from 'lucide-react';

/**
 * SessionStats Component
 * Shows real-time learning session statistics
 */
export default function SessionStats({
  messageCount = 0,
  questionsAnswered = 0,
  sessionStartTime,
  gradeLevel = 5,
}) {
  const [elapsedTime, setElapsedTime] = useState('0:00');

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

  // Grade-adaptive: Hide stats for very young students (K-2)
  if (gradeLevel <= 2) {
    return null;
  }

  const stats = [
    {
      icon: MessageSquare,
      label: 'Messages',
      value: messageCount,
      color: 'var(--color-primary)',
    },
    {
      icon: CheckCircle,
      label: 'Answered',
      value: questionsAnswered,
      color: 'var(--color-success)',
    },
    {
      icon: Clock,
      label: 'Time',
      value: elapsedTime,
      color: 'var(--color-warning)',
    },
  ];

  return (
    <div style={{
      display: 'flex',
      gap: 'var(--space-sm)',
      padding: 'var(--space-sm)',
      background: 'var(--color-bg-muted)',
      borderRadius: 'var(--radius-lg)',
      marginBottom: 'var(--space-md)',
    }}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
              padding: 'var(--space-xs) var(--space-sm)',
              background: 'var(--color-bg-elevated)',
              borderRadius: 'var(--radius-md)',
              flex: 1,
            }}
          >
            <Icon size={16} style={{ color: stat.color }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-tertiary)',
                marginBottom: '2px',
              }}>
                {stat.label}
              </div>
              <div style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--color-text-primary)',
              }}>
                {stat.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

