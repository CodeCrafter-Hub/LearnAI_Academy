'use client';

/**
 * DifficultySelector Component
 *
 * Glassy, minimal design for choosing difficulty level.
 * Uses design system tokens for fluid, responsive styling.
 */
export default function DifficultySelector({
  onSelect,
  isLoading = false,
  topicName = '',
  mode = 'PRACTICE'
}) {
  const difficulties = [
    {
      level: 'EASY',
      emoji: '🌱',
      title: 'Easy',
      description: 'Perfect for learning new concepts',
      pointMultiplier: '1x',
      accentColor: 'hsl(145, 55%, 45%)', // green
      subtleColor: 'hsl(145, 50%, 96%)',
    },
    {
      level: 'MEDIUM',
      emoji: '🌟',
      title: 'Medium',
      description: 'Good balance of challenge',
      pointMultiplier: '1.2x',
      accentColor: 'hsl(40, 85%, 50%)', // yellow/orange
      subtleColor: 'hsl(40, 90%, 96%)',
    },
    {
      level: 'HARD',
      emoji: '🔥',
      title: 'Hard',
      description: 'Maximum challenge',
      pointMultiplier: '1.5x',
      accentColor: 'hsl(355, 70%, 55%)', // red
      subtleColor: 'hsl(355, 70%, 96%)',
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
        Choose Difficulty
      </h1>
      <p style={{
        fontSize: 'var(--text-base)',
        color: 'var(--color-text-secondary)',
        marginBottom: 'var(--space-lg)',
      }}>
        {topicName} • {mode === 'PRACTICE' ? 'Practice' : 'Help'} Mode
      </p>

      <div className="grid" style={{
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
        gap: 'var(--space-md)',
      }}>
        {difficulties.map((difficulty, idx) => (
          <button
            key={difficulty.level}
            onClick={() => onSelect(difficulty.level)}
            disabled={isLoading}
            className="surface-interactive animate-scale-in"
            style={{
              padding: 'var(--space-lg)',
              textAlign: 'center',
              border: '2px solid var(--color-border-subtle)',
              background: 'var(--color-bg-elevated)',
              opacity: isLoading ? 0.5 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              animationDelay: `${idx * 50}ms`,
            }}
          >
            <div style={{
              fontSize: 'var(--text-5xl)',
              marginBottom: 'var(--space-sm)',
            }}>
              {difficulty.emoji}
            </div>
            <h3 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-xs)',
            }}>
              {difficulty.title}
            </h3>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--space-md)',
            }}>
              {difficulty.description}
            </p>
            <div style={{
              display: 'inline-block',
              padding: 'var(--space-2xs) var(--space-sm)',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-medium)',
              background: difficulty.subtleColor,
              color: difficulty.accentColor,
            }}>
              Points: {difficulty.pointMultiplier}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
