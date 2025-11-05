'use client';

/**
 * ModeSelector Component
 *
 * Allows students to choose between two learning modes:
 * - PRACTICE: Structured problem-solving with instant feedback and bonus points
 * - HELP: Open Q&A with explanations using Socratic method for deep learning
 */
export default function ModeSelector({ onSelect, topicName = '' }) {
  const modes = [
    {
      type: 'PRACTICE',
      emoji: '🎯',
      title: 'Practice Mode',
      description: 'Solve problems and get instant feedback',
      gradient: 'from-orange-400 to-red-500',
      features: ['✓ Structured practice', '✓ Bonus points'],
    },
    {
      type: 'HELP',
      emoji: '💡',
      title: 'Help Mode',
      description: 'Ask questions and get explanations',
      gradient: 'from-blue-400 to-purple-500',
      features: ['✓ Open Q&A', '✓ Deep learning'],
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        {topicName}
      </h1>
      <p className="text-gray-600 mb-6">Choose your learning mode</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modes.map((mode) => (
          <button
            key={mode.type}
            onClick={() => onSelect(mode.type)}
            className={`bg-gradient-to-br ${mode.gradient} rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transition-all text-left transform hover:scale-105`}
          >
            <div className="text-5xl mb-4">{mode.emoji}</div>
            <h2 className="text-2xl font-bold mb-3">{mode.title}</h2>
            <p className="text-white/90 mb-4">{mode.description}</p>
            <div className="flex flex-wrap gap-2 text-sm">
              {mode.features.map((feature, index) => (
                <span
                  key={index}
                  className="bg-white/20 px-3 py-1 rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
