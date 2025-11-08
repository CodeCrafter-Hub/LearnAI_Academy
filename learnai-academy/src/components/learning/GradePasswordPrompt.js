'use client';

import { useState } from 'react';
import { Lock, X } from 'lucide-react';

// Password configuration for each grade (K-12)
const GRADE_PASSWORDS = {
  0: 'kindergarten2024',  // Kindergarten
  1: 'grade1learn',
  2: 'grade2learn',
  3: 'grade3learn',
  4: 'grade4learn',
  5: 'grade5learn',
  6: 'grade6learn',
  7: 'grade7learn',
  8: 'grade8learn',
  9: 'grade9learn',
  10: 'grade10learn',
  11: 'grade11learn',
  12: 'grade12learn',
};

export default function GradePasswordPrompt({ gradeLevel, onSuccess, onCancel }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const gradeName = gradeLevel === 0 ? 'Kindergarten' : `Grade ${gradeLevel}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');

    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (password === GRADE_PASSWORDS[gradeLevel]) {
      // Store the unlocked grade in sessionStorage
      const unlockedGrades = JSON.parse(sessionStorage.getItem('unlockedGrades') || '[]');
      if (!unlockedGrades.includes(gradeLevel)) {
        unlockedGrades.push(gradeLevel);
        sessionStorage.setItem('unlockedGrades', JSON.stringify(unlockedGrades));
      }
      onSuccess();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }

    setIsVerifying(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 'var(--z-modal)',
      padding: 'var(--space-lg)',
    }}>
      <div className="surface-elevated animate-scale-in" style={{
        maxWidth: '480px',
        width: '100%',
        padding: 'var(--space-2xl)',
        borderRadius: 'var(--radius-2xl)',
        position: 'relative',
      }}>
        {/* Close Button */}
        <button
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: 'var(--space-lg)',
            right: 'var(--space-lg)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 'var(--space-xs)',
            borderRadius: 'var(--radius-lg)',
            transition: 'all var(--transition-fast)',
            color: 'var(--color-text-secondary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-bg-muted)';
            e.currentTarget.style.color = 'var(--color-text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
          }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-accent-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginInline: 'auto',
          marginBottom: 'var(--space-lg)',
        }}>
          <Lock style={{ width: '32px', height: '32px', color: 'var(--color-accent)' }} />
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--weight-bold)',
          color: 'var(--color-text-primary)',
          textAlign: 'center',
          marginBottom: 'var(--space-xs)',
        }}>
          {gradeName} Access
        </h2>

        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
          textAlign: 'center',
          marginBottom: 'var(--space-xl)',
        }}>
          Enter the password to access {gradeName} content for testing
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <label
              htmlFor="gradePassword"
              style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-xs)',
              }}
            >
              Password
            </label>
            <input
              id="gradePassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter grade password"
              autoFocus
              required
              disabled={isVerifying}
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                fontSize: 'var(--text-base)',
                color: 'var(--color-text-primary)',
                background: 'var(--color-bg-base)',
                border: error ? '1px solid var(--color-error)' : '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-lg)',
                transition: 'all var(--transition-fast)',
              }}
              onFocus={(e) => {
                if (!error) {
                  e.currentTarget.style.borderColor = 'var(--color-accent)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-accent-subtle)';
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = error ? 'var(--color-error)' : 'var(--color-border-subtle)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />

            {/* Error Message */}
            {error && (
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-error)',
                marginTop: 'var(--space-xs)',
              }}>
                {error}
              </p>
            )}
          </div>

          {/* Password Hint */}
          <div style={{
            background: 'var(--color-bg-muted)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-md)',
            marginBottom: 'var(--space-lg)',
          }}>
            <p style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
              margin: 0,
            }}>
              <strong>Development Password:</strong> For testing purposes, use the pattern shown in the component code.
            </p>
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            gap: 'var(--space-md)',
          }}>
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={isVerifying}
              style={{
                flex: 1,
                justifyContent: 'center',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isVerifying || !password}
              style={{
                flex: 1,
                justifyContent: 'center',
              }}
            >
              {isVerifying ? 'Verifying...' : 'Unlock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
