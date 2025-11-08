'use client';

import LoadingSpinner from '@/components/common/LoadingSpinner';

/**
 * SubjectSelector Component
 *
 * Glassy subject cards with staggered animations.
 */
export default function SubjectSelector({ subjects = [], onSelect }) {
  if (subjects.length === 0) {
    return <LoadingSpinner message="Loading subjects..." />;
  }

  return (
    <div>
      <h1 style={{
        fontSize: 'var(--text-3xl)',
        fontWeight: 'var(--weight-bold)',
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--space-lg)',
      }}>
        Choose a Subject
      </h1>

      <div className="grid grid-auto-fit">
        {subjects.map((subject, idx) => (
          <button
            key={subject.id}
            onClick={() => onSelect(subject)}
            className="surface-interactive animate-fade-in"
            style={{
              padding: 'var(--space-lg)',
              textAlign: 'left',
              border: '1px solid var(--color-border-subtle)',
              background: 'var(--color-bg-elevated)',
              animationDelay: `${idx * 50}ms`,
            }}
          >
            <h3 style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-xs)',
            }}>
              {subject.name}
            </h3>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--leading-relaxed)',
            }}>
              {subject.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
