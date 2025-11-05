'use client';

/**
 * TopicSelector Component
 *
 * Displays a grid of topics for a selected subject.
 * Each topic card shows the topic name and description.
 * Students can click on a topic to proceed to mode selection.
 */
export default function TopicSelector({ subject, onSelect }) {
  if (!subject || !subject.topics || subject.topics.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No topics available for this subject.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        {subject.name}
      </h1>
      <p className="text-gray-600 mb-6">Choose a topic to study</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subject.topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => onSelect(topic)}
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all text-left transform hover:-translate-y-1"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {topic.name}
            </h3>
            <p className="text-sm text-gray-600">{topic.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
