'use client';

/**
 * SubjectSelector Component
 *
 * Displays a grid of subjects filtered by the student's grade level.
 * Each subject card shows the subject name and description.
 * Students can click on a subject to proceed to topic selection.
 */
export default function SubjectSelector({ subjects = [], onSelect }) {
  if (subjects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Loading subjects...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Choose a Subject
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => onSelect(subject)}
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all text-left transform hover:-translate-y-1"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {subject.name}
            </h3>
            <p className="text-sm text-gray-600">{subject.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
