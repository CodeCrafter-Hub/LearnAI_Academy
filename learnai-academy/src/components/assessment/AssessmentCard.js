'use client';

import { FileText, Clock, Target, CheckCircle, Play } from 'lucide-react';
import Card from '@/components/ui/Card';

export default function AssessmentCard({ assessment, onStart, onView }) {
  const getTypeColor = (type) => {
    switch (type) {
      case 'diagnostic':
        return 'bg-blue-100 text-blue-700';
      case 'formative':
        return 'bg-green-100 text-green-700';
      case 'summative':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'diagnostic':
        return 'Diagnostic';
      case 'formative':
        return 'Formative';
      case 'summative':
        return 'Summative';
      default:
        return type;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 rounded-lg p-2">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{assessment.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(assessment.assessmentType)}`}>
                {getTypeLabel(assessment.assessmentType)}
              </span>
              {assessment.gradeLevel !== null && (
                <span className="text-sm text-gray-600">
                  Grade {assessment.gradeLevel === 0 ? 'K' : assessment.gradeLevel}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Target className="w-4 h-4" />
          <span>{assessment.totalQuestions} questions</span>
        </div>
        {assessment.timeLimitMinutes && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{assessment.timeLimitMinutes} minutes</span>
          </div>
        )}
        {assessment.subject && (
          <div className="text-sm text-gray-600">
            Subject: <span className="font-medium">{assessment.subject.name}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-200">
        {onStart && (
          <button
            onClick={() => onStart(assessment)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            Start Assessment
          </button>
        )}
        {onView && (
          <button
            onClick={() => onView(assessment)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            View Details
          </button>
        )}
      </div>
    </Card>
  );
}

