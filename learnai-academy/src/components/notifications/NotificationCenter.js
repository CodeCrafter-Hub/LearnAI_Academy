'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, Award, TrendingUp } from 'lucide-react';

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  achievement: Award,
  progress: TrendingUp,
};

const colorMap = {
  success: { bg: 'var(--color-success-subtle)', icon: 'var(--color-success)', border: 'var(--color-success)' },
  error: { bg: 'var(--color-error-subtle)', icon: 'var(--color-error)', border: 'var(--color-error)' },
  info: { bg: 'var(--color-primary-subtle)', icon: 'var(--color-primary)', border: 'var(--color-primary)' },
  achievement: { bg: 'var(--color-accent-subtle)', icon: 'var(--color-accent)', border: 'var(--color-accent)' },
  progress: { bg: 'var(--color-warning-subtle)', icon: 'var(--color-warning)', border: 'var(--color-warning)' },
};

export default function NotificationCenter({ notifications = [], onDismiss }) {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    setVisibleNotifications(notifications);
  }, [notifications]);

  const handleDismiss = (id) => {
    setVisibleNotifications(prev => prev.filter(n => n.id !== id));
    if (onDismiss) {
      onDismiss(id);
    }
  };

  if (visibleNotifications.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 'var(--space-lg)',
        right: 'var(--space-lg)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-sm)',
        maxWidth: '400px',
        pointerEvents: 'none',
      }}
    >
      {visibleNotifications.map((notification, index) => {
        const Icon = iconMap[notification.type] || iconMap.info;
        const colors = colorMap[notification.type] || colorMap.info;

        return (
          <div
            key={notification.id}
            className="notification-slide-in"
            style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-md)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-sm)',
              boxShadow: 'var(--shadow-lg)',
              pointerEvents: 'auto',
              animationDelay: `${index * 100}ms`,
              animation: 'slideInRight 0.3s ease-out',
            }}
          >
            <Icon
              style={{
                width: '20px',
                height: '20px',
                color: colors.icon,
                flexShrink: 0,
                marginTop: '2px',
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              {notification.title && (
                <div
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-2xs)',
                  }}
                >
                  {notification.title}
                </div>
              )}
              <div
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 'var(--leading-relaxed)',
                }}
              >
                {notification.message}
              </div>
              {notification.action && (
                <button
                  onClick={() => {
                    notification.action.onClick();
                    handleDismiss(notification.id);
                  }}
                  style={{
                    marginTop: 'var(--space-sm)',
                    padding: 'var(--space-2xs) var(--space-sm)',
                    background: colors.icon,
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--weight-semibold)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {notification.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => handleDismiss(notification.id)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 'var(--space-2xs)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-tertiary)',
                transition: 'color var(--transition-fast)',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-text-tertiary)';
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>

            <style jsx>{`
              @keyframes slideInRight {
                from {
                  transform: translateX(100%);
                  opacity: 0;
                }
                to {
                  transform: translateX(0);
                  opacity: 1;
                }
              }

              .notification-slide-in {
                animation: slideInRight 0.3s ease-out;
              }
            `}</style>
          </div>
        );
      })}
    </div>
  );
}

