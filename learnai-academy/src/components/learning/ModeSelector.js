'use client';

/**
 * ModeSelector Component
 *
 * Glassy cards for choosing Practice vs Help mode.
 * Uses subtle gradients and elevation for visual hierarchy.
 */
export default function ModeSelector({ onSelect, topicName = '' }) {
  const modes = [
    {
      type: 'PRACTICE',
      emoji: '🎯',
      title: 'Practice Mode',
      description: 'Solve problems and get instant feedback',
      gradient: 'linear-gradient(135deg, hsl(30, 90%, 60%) 0%, hsl(15, 85%, 55%) 100%)',
      features: ['Structured practice', 'Bonus points'],
    },
    {
      type: 'HELP',
      emoji: '💡',
      title: 'Help Mode',
      description: 'Ask questions and get explanations',
      gradient: 'linear-gradient(135deg, hsl(220, 80%, 60%) 0%, hsl(260, 70%, 60%) 100%)',
      features: ['Open Q&A', 'Deep learning'],
    },
  ];

  return (
    <div>
      <h1 style={{
        fontSize: 'var(--text-3xl)',
        fontWeight: 'var(--weight-bold)',
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--space-xs)',
      }}>
        {topicName}
      </h1>
      <p style={{
        fontSize: 'var(--text-base)',
        color: 'var(--color-text-secondary)',
        marginBottom: 'var(--space-lg)',
      }}>
        Choose your learning mode
      </p>

      <div className="grid" style={{
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        gap: 'var(--space-lg)',
      }}>
        {modes.map((mode, idx) => (
          <button
            key={mode.type}
            onClick={() => onSelect(mode.type)}
            className="animate-scale-in"
            style={{
              padding: 'var(--space-xl)',
              textAlign: 'left',
              background: mode.gradient,
              borderRadius: 'var(--radius-2xl)',
              border: 'none',
              boxShadow: 'var(--shadow-lg)',
              color: 'white',
              transition: 'all var(--transition-base)',
              cursor: 'pointer',
              animationDelay: `${idx * 50}ms`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
              e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
          >
            <div style={{
              fontSize: 'var(--text-5xl)',
              marginBottom: 'var(--space-md)',
            }}>
              {mode.emoji}
            </div>
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--weight-bold)',
              marginBottom: 'var(--space-sm)',
            }}>
              {mode.title}
            </h2>
            <p style={{
              fontSize: 'var(--text-base)',
              opacity: 0.9,
              marginBottom: 'var(--space-md)',
              lineHeight: 'var(--leading-relaxed)',
            }}>
              {mode.description}
            </p>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-xs)',
              fontSize: 'var(--text-sm)',
            }}>
              {mode.features.map((feature, index) => (
                <span
                  key={index}
                  style={{
                    padding: 'var(--space-2xs) var(--space-sm)',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  ✓ {feature}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
