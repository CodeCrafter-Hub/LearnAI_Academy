'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, TrendingUp, Target, Lightbulb, Award, AlertTriangle } from 'lucide-react';

/**
 * Component to display comprehensive classroom evaluation results
 */
export default function ClassroomEvaluationResults({ evaluation, onApplyRecommendations }) {
  const [expandedSection, setExpandedSection] = useState(null);

  if (!evaluation) {
    return (
      <div className="surface-subtle p-8 rounded-xl text-center">
        <p className="text-gray-600">No evaluation data available. Run an evaluation to see results.</p>
      </div>
    );
  }

  const { overallScore, evaluations, expertRecommendations, priorityActions, complianceStatus } = evaluation;

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score) => {
    if (score >= 0.8) return { icon: CheckCircle, color: 'bg-green-100 text-green-700', text: 'Excellent' };
    if (score >= 0.7) return { icon: AlertCircle, color: 'bg-yellow-100 text-yellow-700', text: 'Good' };
    return { icon: XCircle, color: 'bg-red-100 text-red-700', text: 'Needs Improvement' };
  };

  const overallBadge = getScoreBadge(overallScore);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overall Score */}
      <div className="surface-elevated p-6 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-gray-800">Overall Evaluation Score</h2>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${overallBadge.color}`}>
            <overallBadge.icon className="w-5 h-5" />
            <span className="font-semibold">{overallBadge.text}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Score</span>
              <span className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                {Math.round(overallScore * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all ${
                  overallScore >= 0.8 ? 'bg-green-500' : overallScore >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${overallScore * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Priority Actions */}
      {priorityActions && priorityActions.length > 0 && (
        <div className="surface-elevated p-6 rounded-xl shadow-md border-l-4 border-red-500">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-6 h-6 text-red-600" />
            <h3 className="text-xl font-bold text-gray-800">Priority Actions</h3>
          </div>
          <ul className="space-y-3">
            {priorityActions.map((action, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{action.action}</p>
                  <p className="text-sm text-gray-600">Current score: {Math.round(action.score * 100)}%</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Expert Recommendations */}
      {expertRecommendations && (
        <div className="surface-elevated p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-6 h-6 text-yellow-600" />
            <h3 className="text-xl font-bold text-gray-800">Expert Recommendations</h3>
          </div>
          
          {expertRecommendations.priorities && expertRecommendations.priorities.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Top Priorities:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {expertRecommendations.priorities.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {expertRecommendations.quickWins && expertRecommendations.quickWins.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Quick Wins:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {expertRecommendations.quickWins.map((win, index) => (
                  <li key={index}>{win}</li>
                ))}
              </ul>
            </div>
          )}

          {onApplyRecommendations && (
            <button
              onClick={() => onApplyRecommendations(expertRecommendations)}
              className="btn btn-primary mt-4"
            >
              Apply Recommendations
            </button>
          )}
        </div>
      )}

      {/* Compliance Status */}
      {complianceStatus && (
        <div className="surface-elevated p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-800">Compliance Status</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-blue-50">
              <p className="text-sm text-gray-600 mb-1">WCAG 2.1</p>
              <p className="font-bold text-blue-700">{complianceStatus.wcag}</p>
            </div>
            <div className="p-4 rounded-lg bg-purple-50">
              <p className="text-sm text-gray-600 mb-1">UDL</p>
              <p className="font-bold text-purple-700">{complianceStatus.udl}</p>
            </div>
            <div className="p-4 rounded-lg bg-green-50">
              <p className="text-sm text-gray-600 mb-1">IDEA</p>
              <p className="font-bold text-green-700">{complianceStatus.idea}</p>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Evaluations */}
      <div className="surface-elevated p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Detailed Evaluations</h3>
        <div className="space-y-3">
          {Object.entries(evaluations).map(([key, eval]) => {
            const badge = getScoreBadge(eval.score || 0);
            const isExpanded = expandedSection === key;

            return (
              <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : key)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${badge.color}`}>
                      <badge.icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-800 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      {eval.framework && (
                        <p className="text-xs text-gray-500">{eval.framework}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-lg font-bold ${getScoreColor(eval.score || 0)}`}>
                      {Math.round((eval.score || 0) * 100)}%
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <div className="space-y-4">
                      {eval.recommendations && eval.recommendations.length > 0 && (
                        <div>
                          <h5 className="font-semibold text-gray-700 mb-2">Recommendations:</h5>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            {eval.recommendations.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {eval.issues && eval.issues.length > 0 && (
                        <div>
                          <h5 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Issues:
                          </h5>
                          <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                            {eval.issues.map((issue, index) => (
                              <li key={index}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {eval.passed !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">Status:</span>
                          {eval.passed ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                              Passed
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm font-medium">
                              Needs Improvement
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

