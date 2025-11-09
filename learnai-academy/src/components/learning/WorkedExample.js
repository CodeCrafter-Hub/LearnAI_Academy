'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, CheckCircle, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cognitiveLoadService } from '@/services/curriculum/cognitiveLoadService';

/**
 * WorkedExample - Step-by-step problem demonstration
 * 
 * Features:
 * - Progressive disclosure (show steps one at a time)
 * - Step-by-step explanations
 * - Key takeaways
 * - Practice problems
 */
export default function WorkedExample({ 
  problem, 
  subjectSlug, 
  gradeLevel,
  onComplete 
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [understood, setUnderstood] = useState(false);

  const workedExample = cognitiveLoadService.generateWorkedExample(problem, subjectSlug, gradeLevel);
  const steps = workedExample.steps || [];

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowSolution(true);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete({ understood, stepsCompleted: currentStep + 1 });
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Worked Example</h3>
      </div>

      {/* Problem Statement */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-900 mb-2">Problem:</h4>
        <p className="text-gray-800">{workedExample.problem}</p>
      </div>

      {/* Steps */}
      <div className="space-y-4 mb-6">
        {steps.map((step, idx) => {
          const isActive = idx === currentStep;
          const isCompleted = idx < currentStep;
          const isUpcoming = idx > currentStep;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isActive || isCompleted ? 1 : 0.5 }}
              className={`border-2 rounded-lg p-4 transition-all ${
                isActive
                  ? 'border-blue-500 bg-blue-50'
                  : isCompleted
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : idx + 1}
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 mb-1">{step.action}</h5>
                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-gray-700"
                    >
                      {step.explanation}
                    </motion.p>
                  )}
                  {isCompleted && (
                    <p className="text-gray-600 text-sm line-through">{step.explanation}</p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Solution (shown after all steps) */}
      {showSolution && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
        >
          <h4 className="font-semibold text-green-900 mb-2">Solution:</h4>
          <p className="text-gray-800">{workedExample.solution}</p>
        </motion.div>
      )}

      {/* Key Takeaways */}
      {showSolution && workedExample.keyTakeaways && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-yellow-900 mb-2">Key Takeaways:</h4>
          <ul className="list-disc list-inside space-y-1">
            {workedExample.keyTakeaways.map((takeaway, idx) => (
              <li key={idx} className="text-gray-700">{takeaway}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Understanding Check */}
      {showSolution && (
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-900 mb-3">Do you understand this example?</p>
          <div className="flex gap-3">
            <button
              onClick={() => setUnderstood(true)}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                understood
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Yes, I understand
            </button>
            <button
              onClick={() => setUnderstood(false)}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                !understood && understood !== null
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              I need more help
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePreviousStep}
          disabled={currentStep === 0}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous Step
        </button>

        {!showSolution ? (
          <button
            onClick={handleNextStep}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {currentStep < steps.length - 1 ? 'Next Step' : 'Show Solution'}
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleComplete}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Complete Example
            <CheckCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

