'use client';

import { ArrowRight, BookOpen, TrendingUp, Target } from 'lucide-react';
import Card from '@/components/ui/Card';

export default function RecommendationCard({ recommendation, onSelect }) {
  const getReasonColor = (reason) => {
    if (reason?.includes('learning path') || reason?.includes('next')) {
      return 'bg-blue-100 text-blue-700';
    }
    if (reason?.includes('strengthen') || reason?.includes('weakness')) {
      return 'bg-yellow-100 text-yellow-700';
    }
    if (reason?.includes('prerequisite')) {
      return 'bg-orange-100 text-orange-700';
    }
    if (reason?.includes('advanced')) {
      return 'bg-purple-100 text-purple-700';
    }
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onSelect}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 rounded-lg p-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{recommendation.topic?.name || recommendation.topicName || 'Topic'}</h3>
            {recommendation.subject && (
              <p className="text-sm text-gray-600">{recommendation.subject.name}</p>
            )}
          </div>
        </div>
        {recommendation.masteryLevel !== undefined && (
          <div className="text-right">
            <div className="text-sm font-medium text-gray-600">Mastery</div>
            <div className="text-lg font-bold text-gray-800">
              {Math.round(recommendation.masteryLevel * 100)}%
            </div>
          </div>
        )}
      </div>

      {recommendation.reason && (
        <div className="mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReasonColor(recommendation.reason)}`}>
            {recommendation.reason}
          </span>
        </div>
      )}

      {recommendation.description && (
        <p className="text-sm text-gray-600 mb-3">{recommendation.description}</p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {recommendation.difficulty && (
            <span className="capitalize">{recommendation.difficulty.toLowerCase()}</span>
          )}
          {recommendation.estimatedHours && (
            <>
              <span>•</span>
              <span>{recommendation.estimatedHours}h</span>
            </>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect && onSelect(recommendation);
          }}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          Start Learning
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
}

