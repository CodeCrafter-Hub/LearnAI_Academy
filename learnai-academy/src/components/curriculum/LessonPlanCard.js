'use client';

import { BookOpen, Clock, Target, Users, Award } from 'lucide-react';
import Card from '@/components/ui/Card';

export default function LessonPlanCard({ lessonPlan, subject, onView }) {
  if (!lessonPlan) return null;

  const {
    learningObjectives = [],
    prerequisites = [],
    keyConcepts = [],
    lessonStructure = [],
    examples = [],
    assessmentQuestions = [],
    practiceProblems = [],
    extensionActivities = [],
  } = lessonPlan;

  return (
    <Card className="mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 rounded-lg p-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Lesson Plan</h3>
            <p className="text-sm text-gray-600">{subject?.name || 'Subject'}</p>
          </div>
        </div>
        {onView && (
          <button
            onClick={onView}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Full Plan
          </button>
        )}
      </div>

      {/* Learning Objectives */}
      {learningObjectives && learningObjectives.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-800">Learning Objectives</h4>
          </div>
          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-7">
            {learningObjectives.slice(0, 3).map((obj, idx) => (
              <li key={idx} className="text-sm">{obj}</li>
            ))}
            {learningObjectives.length > 3 && (
              <li className="text-sm text-gray-500">+{learningObjectives.length - 3} more</li>
            )}
          </ul>
        </div>
      )}

      {/* Key Concepts */}
      {keyConcepts && keyConcepts.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">Key Concepts</h4>
          <div className="flex flex-wrap gap-2">
            {keyConcepts.slice(0, 5).map((concept, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
              >
                {concept}
              </span>
            ))}
            {keyConcepts.length > 5 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                +{keyConcepts.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        {examples && examples.length > 0 && (
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{examples.length}</div>
            <div className="text-xs text-gray-600">Examples</div>
          </div>
        )}
        {practiceProblems && practiceProblems.length > 0 && (
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{practiceProblems.length}</div>
            <div className="text-xs text-gray-600">Practice Problems</div>
          </div>
        )}
        {assessmentQuestions && assessmentQuestions.length > 0 && (
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{assessmentQuestions.length}</div>
            <div className="text-xs text-gray-600">Assessments</div>
          </div>
        )}
      </div>
    </Card>
  );
}

