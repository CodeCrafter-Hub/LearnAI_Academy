'use client';

import { Calculator, Languages, BookOpen, Microscope, PenTool, Code } from 'lucide-react';

const iconMap = {
  Calculator,
  Languages,
  BookOpen,
  Microscope,
  PenTool,
  Code,
};

export default function SubjectCard({ subject, progress, onClick }) {
  const Icon = iconMap[subject.icon] || Calculator;
  const topicsCompleted = progress?.topics?.filter(t => t.masteryLevel >= 0.8).length || 0;
  const totalTopics = subject.topics?.length || 0;

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 text-left w-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`${subject.color} rounded-xl p-3`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Progress</div>
          <div className="text-lg font-bold text-gray-800">
            {totalTopics > 0 ? Math.round((topicsCompleted / totalTopics) * 100) : 0}%
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-800 mb-2">{subject.name}</h3>
      <p className="text-sm text-gray-600 mb-4">{subject.description}</p>

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>{totalTopics} topics</span>
        <span>•</span>
        <span>{topicsCompleted} completed</span>
      </div>

      {totalTopics > 0 && (
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${subject.color} h-2 rounded-full transition-all`}
            style={{ width: `${(topicsCompleted / totalTopics) * 100}%` }}
          />
        </div>
      )}
    </button>
  );
}
