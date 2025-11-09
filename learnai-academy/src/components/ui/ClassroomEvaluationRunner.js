'use client';

import { useState } from 'react';
import { useClassroomEvaluation } from '@/hooks/useClassroomEvaluation';
import { useAuth } from '@/hooks/useAuth';
import ClassroomEvaluationResults from './ClassroomEvaluationResults';
import { Play, Loader2, Settings, CheckCircle } from 'lucide-react';

/**
 * Component to run classroom evaluation
 */
export default function ClassroomEvaluationRunner({ onEvaluationComplete }) {
  const { user } = useAuth();
  const { evaluation, isLoading, error, runEvaluation } = useClassroomEvaluation();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [classroomConfig, setClassroomConfig] = useState({
    visualContent: true,
    audioNarration: true,
    captions: true,
    keyboardAccess: true,
    handsOnActivities: false,
    textContent: true,
    interactiveElements: true,
    collaboration: false,
    gamification: true,
    breaks: true,
    mobileCompatible: true,
    lowBandwidth: true,
  });

  const gradeLevel = user?.students?.[0]?.gradeLevel || 5;

  const handleRunEvaluation = async () => {
    try {
      const result = await runEvaluation(gradeLevel, classroomConfig);
      if (onEvaluationComplete) {
        onEvaluationComplete(result);
      }
    } catch (err) {
      console.error('Evaluation error:', err);
    }
  };

  const handleConfigChange = (key, value) => {
    setClassroomConfig(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <div className="surface-elevated p-6 rounded-xl shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Classroom Configuration</h2>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="btn btn-ghost flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Basic Configuration */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Content Types</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={classroomConfig.visualContent}
                onChange={(e) => handleConfigChange('visualContent', e.target.checked)}
                className="w-4 h-4"
              />
              <span>Visual Content (images, videos)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={classroomConfig.audioNarration}
                onChange={(e) => handleConfigChange('audioNarration', e.target.checked)}
                className="w-4 h-4"
              />
              <span>Audio Narration</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={classroomConfig.textContent}
                onChange={(e) => handleConfigChange('textContent', e.target.checked)}
                className="w-4 h-4"
              />
              <span>Text Content</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={classroomConfig.handsOnActivities}
                onChange={(e) => handleConfigChange('handsOnActivities', e.target.checked)}
                className="w-4 h-4"
              />
              <span>Hands-on Activities</span>
            </label>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Accessibility</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={classroomConfig.captions}
                onChange={(e) => handleConfigChange('captions', e.target.checked)}
                className="w-4 h-4"
              />
              <span>Video Captions</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={classroomConfig.keyboardAccess}
                onChange={(e) => handleConfigChange('keyboardAccess', e.target.checked)}
                className="w-4 h-4"
              />
              <span>Keyboard Accessible</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={classroomConfig.interactiveElements}
                onChange={(e) => handleConfigChange('interactiveElements', e.target.checked)}
                className="w-4 h-4"
              />
              <span>Interactive Elements</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={classroomConfig.breaks}
                onChange={(e) => handleConfigChange('breaks', e.target.checked)}
                className="w-4 h-4"
              />
              <span>Regular Breaks</span>
            </label>
          </div>
        </div>

        {/* Advanced Configuration */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pt-4 border-t border-gray-200">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">Engagement</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={classroomConfig.gamification}
                  onChange={(e) => handleConfigChange('gamification', e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Gamification</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={classroomConfig.collaboration}
                  onChange={(e) => handleConfigChange('collaboration', e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Collaboration Tools</span>
              </label>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">Technology</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={classroomConfig.mobileCompatible}
                  onChange={(e) => handleConfigChange('mobileCompatible', e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Mobile Compatible</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={classroomConfig.lowBandwidth}
                  onChange={(e) => handleConfigChange('lowBandwidth', e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Low Bandwidth Optimized</span>
              </label>
            </div>
          </div>
        )}

        {/* Run Button */}
        <button
          onClick={handleRunEvaluation}
          disabled={isLoading}
          className="btn btn-primary btn-lg w-full flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Running Evaluation...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Run Comprehensive Evaluation
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Results */}
      {evaluation && (
        <ClassroomEvaluationResults
          evaluation={evaluation}
          onApplyRecommendations={(recommendations) => {
            console.log('Apply recommendations:', recommendations);
            // TODO: Implement recommendation application
          }}
        />
      )}
    </div>
  );
}

