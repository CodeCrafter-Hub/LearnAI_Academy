'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        background: 'var(--color-bg-muted)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-full)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        padding: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--color-bg-elevated)';
        e.currentTarget.style.borderColor = 'var(--color-border-muted)';
        e.currentTarget.style.transform = 'rotate(180deg)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--color-bg-muted)';
        e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
        e.currentTarget.style.transform = 'rotate(0deg)';
      }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon
          style={{
            width: '18px',
            height: '18px',
            color: 'var(--color-text-secondary)',
          }}
        />
      ) : (
        <Sun
          style={{
            width: '18px',
            height: '18px',
            color: 'var(--color-warning)',
          }}
        />
      )}
    </button>
  );
}
