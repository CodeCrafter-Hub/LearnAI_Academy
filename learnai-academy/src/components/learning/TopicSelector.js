'use client';

/**
 * TopicSelector Component
 *
 * Glassy cards for topic selection with staggered animations.
 */
export default function TopicSelector({ subject, onSelect }) {
  if (!subject || !subject.topics || subject.topics.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: 'var(--space-2xl)',
      }}>
        <p style={{
          fontSize: 'var(--text-lg)',
          color: 'var(--color-text-tertiary)',
        }}>
          No topics available for this subject.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{
        fontSize: 'var(--text-3xl)',
        fontWeight: 'var(--weight-bold)',
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--space-xs)',
      }}>
        {subject.name}
      </h1>
      <p style={{
        fontSize: 'var(--text-base)',
        color: 'var(--color-text-secondary)',
        marginBottom: 'var(--space-lg)',
      }}>
        Choose a topic to study
      </p>

      <div className="grid grid-auto-fit">
        {subject.topics.map((topic, idx) => (
          <button
            key={topic.id}
            onClick={() => onSelect(topic)}
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
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-xs)',
            }}>
              {topic.name}
            </h3>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--leading-relaxed)',
            }}>
              {topic.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
