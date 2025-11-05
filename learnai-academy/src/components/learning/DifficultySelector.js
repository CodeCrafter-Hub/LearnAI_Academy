'use client';

/**
 * DifficultySelector Component
 *
 * Allows students to choose the difficulty level for their learning session.
 * Different difficulties provide different point multipliers:
 * - Easy: 1x points (perfect for learning new concepts)
 * - Medium: 1.2x points (balanced challenge)
 * - Hard: 1.5x points (maximum challenge)
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
      borderColor: 'border-green-200',
      hoverBorderColor: 'hover:border-green-400',
      badgeColor: 'bg-green-100 text-green-700',
    },
    {
      level: 'MEDIUM',
      emoji: '🌟',
      title: 'Medium',
      description: 'Good balance of challenge',
      pointMultiplier: '1.2x',
      borderColor: 'border-yellow-200',
      hoverBorderColor: 'hover:border-yellow-400',
      badgeColor: 'bg-yellow-100 text-yellow-700',
    },
    {
      level: 'HARD',
      emoji: '🔥',
      title: 'Hard',
      description: 'Maximum challenge',
      pointMultiplier: '1.5x',
      borderColor: 'border-red-200',
      hoverBorderColor: 'hover:border-red-400',
      badgeColor: 'bg-red-100 text-red-700',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Choose Difficulty
      </h1>
      <p className="text-gray-600 mb-6">
        {topicName} - {mode === 'PRACTICE' ? 'Practice' : 'Help'} Mode
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {difficulties.map((difficulty) => (
          <button
            key={difficulty.level}
            onClick={() => onSelect(difficulty.level)}
            disabled={isLoading}
            className={`bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all text-center border-4 ${difficulty.borderColor} ${difficulty.hoverBorderColor} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="text-5xl mb-3">{difficulty.emoji}</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {difficulty.title}
            </h3>
            <p className="text-gray-600 mb-4">{difficulty.description}</p>
            <div className={`${difficulty.badgeColor} px-3 py-1 rounded-full text-sm font-medium inline-block`}>
              Points: {difficulty.pointMultiplier}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
