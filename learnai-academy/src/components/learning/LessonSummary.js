'use client';

import { useState } from 'react';
import { CheckCircle, BookOpen, Target, Lightbulb, Award, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ProgressCelebration from '@/components/celebration/ProgressCelebration';

/**
 * LessonSummary - Displays lesson summary and key takeaways
 * 
 * Features:
 * - Key concepts review
 * - Learning objectives check
 * - Takeaways
 * - Next steps
 * - Celebration on completion
 */
export default function LessonSummary({ 
  lesson, 
  onComplete,
  onContinue 
}) {
  const [showCelebration, setShowCelebration] = useState(true);
  const [completedObjectives, setCompletedObjectives] = useState([]);

  if (!lesson) return null;

  const objectives = lesson.lessonPlan?.objectives || [];
  const keyConcepts = lesson.content?.structure?.instruction?.keyPoints || [];
  const takeaways = lesson.content?.structure?.closure?.summary || [];

  const handleObjectiveToggle = (index) => {
    setCompletedObjectives(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleContinue = () => {
    if (onComplete) {
      onComplete({
        objectivesCompleted: completedObjectives.length,
        totalObjectives: objectives.length,
      });
    }
    if (onContinue) {
      onContinue();
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-8 shadow-lg">
      {/* Celebration */}
      {showCelebration && (
        <ProgressCelebration
          type="achievement"
          message="Great job completing this lesson!"
          show={showCelebration}
          onComplete={() => setShowCelebration(false)}
          duration={3000}
        />
      )}

      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-8 h-8 text-blue-600" />
        <h2 className="text-3xl font-bold text-gray-900">Lesson Summary</h2>
      </div>

      {/* Learning Objectives Check */}
      {objectives.length > 0 && (
        <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-900">Learning Objectives</h3>
          </div>
          <div className="space-y-3">
            {objectives.map((objective, idx) => {
              const isCompleted = completedObjectives.includes(idx);
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                    isCompleted
                      ? 'bg-green-50 border-green-300'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => handleObjectiveToggle(idx)}
                    className={`mt-1 flex-shrink-0 ${
                      isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    <CheckCircle className={`w-6 h-6 ${isCompleted ? 'fill-current' : ''}`} />
                  </button>
                  <div className="flex-1">
                    <p className={`font-medium ${isCompleted ? 'text-green-900 line-through' : 'text-gray-900'}`}>
                      {objective}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Completed: {completedObjectives.length} of {objectives.length}
          </div>
        </div>
      )}

      {/* Key Concepts */}
      {keyConcepts.length > 0 && (
        <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-6 h-6 text-yellow-600" />
            <h3 className="text-xl font-semibold text-gray-900">Key Concepts</h3>
          </div>
          <ul className="space-y-2">
            {keyConcepts.map((concept, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-2"
              >
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{concept}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Takeaways */}
      {takeaways && (
        <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-semibold text-gray-900">Key Takeaways</h3>
          </div>
          <div className="prose max-w-none">
            {typeof takeaways === 'string' ? (
              <p className="text-gray-700">{takeaways}</p>
            ) : (
              <ul className="space-y-2">
                {takeaways.map((takeaway, idx) => (
                  <li key={idx} className="text-gray-700">{takeaway}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">What's Next?</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <ArrowRight className="w-5 h-5 text-blue-600" />
            <p className="text-gray-700">Review the concepts you learned today</p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <ArrowRight className="w-5 h-5 text-green-600" />
            <p className="text-gray-700">Practice with similar problems</p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <ArrowRight className="w-5 h-5 text-purple-600" />
            <p className="text-gray-700">Continue to the next lesson when ready</p>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-semibold text-lg"
      >
        Continue Learning
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

