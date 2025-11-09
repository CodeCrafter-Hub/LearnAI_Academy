'use client';

import { useState } from 'react';
import { useClassroomEvaluation } from '@/hooks/useClassroomEvaluation';
import { CheckCircle, XCircle, AlertCircle, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Compact widget for displaying classroom evaluation on grade pages
 */
export default function ClassroomEvaluationWidget({ gradeLevel, compact = false }) {
  const { evaluation, isLoading, runEvaluation } = useClassroomEvaluation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const handleRunEvaluation = async () => {
    try {
      await runEvaluation(gradeLevel, {
        visualContent: true,
        audioNarration: true,
        captions: true,
        keyboardAccess: true,
      });
      setHasRun(true);
    } catch (error) {
      console.error('Evaluation error:', error);
    }
  };

  if (compact) {
    return (
      <div className="surface-elevated p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800 text-sm">Classroom Evaluation</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {!hasRun && !evaluation && (
          <button
            onClick={handleRunEvaluation}
            disabled={isLoading}
            className="btn btn-primary btn-sm w-full"
          >
            {isLoading ? 'Evaluating...' : 'Run Evaluation'}
          </button>
        )}

        {evaluation && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Overall Score</span>
              <span className={`text-lg font-bold ${
                evaluation.overallScore >= 0.8 ? 'text-green-600' :
                evaluation.overallScore >= 0.7 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {Math.round(evaluation.overallScore * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  evaluation.overallScore >= 0.8 ? 'bg-green-500' :
                  evaluation.overallScore >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${evaluation.overallScore * 100}%` }}
              />
            </div>

            {isExpanded && evaluation.priorityActions && evaluation.priorityActions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">Priority Actions:</p>
                <ul className="space-y-1">
                  {evaluation.priorityActions.slice(0, 3).map((action, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                      <span className="text-red-600">•</span>
                      <span>{action.action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => window.location.href = `/classroom-evaluation?grade=${gradeLevel}`}
              className="btn btn-ghost btn-sm w-full mt-2 text-xs"
            >
              View Full Report →
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="surface-elevated p-6 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">Classroom Evaluation</h3>
        {!hasRun && !evaluation && (
          <button
            onClick={handleRunEvaluation}
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? 'Evaluating...' : 'Run Evaluation'}
          </button>
        )}
      </div>

      {evaluation && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Overall Score</span>
                <span className={`text-3xl font-bold ${
                  evaluation.overallScore >= 0.8 ? 'text-green-600' :
                  evaluation.overallScore >= 0.7 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {Math.round(evaluation.overallScore * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    evaluation.overallScore >= 0.8 ? 'bg-green-500' :
                    evaluation.overallScore >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${evaluation.overallScore * 100}%` }}
                />
              </div>
            </div>
          </div>

          {evaluation.priorityActions && evaluation.priorityActions.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Priority Actions</h4>
              <ul className="space-y-2">
                {evaluation.priorityActions.slice(0, 3).map((action, index) => (
                  <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                    <span className="text-yellow-600 font-bold">{index + 1}.</span>
                    <span>{action.action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => window.location.href = `/classroom-evaluation?grade=${gradeLevel}`}
            className="btn btn-secondary w-full"
          >
            View Full Evaluation Report →
          </button>
        </div>
      )}
    </div>
  );
}

