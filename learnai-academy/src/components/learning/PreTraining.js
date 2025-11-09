'use client';

import { useState } from 'react';
import { BookOpen, CheckCircle, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cognitiveLoadService } from '@/services/curriculum/cognitiveLoadService';

/**
 * PreTraining - Reviews prerequisite concepts before main lesson
 * 
 * Features:
 * - Prerequisite concept review
 * - Quick check questions
 * - Progress tracking
 * - Skip option
 */
export default function PreTraining({ 
  prerequisites, 
  subjectSlug, 
  gradeLevel,
  onComplete,
  onSkip 
}) {
  const [currentConcept, setCurrentConcept] = useState(0);
  const [conceptStatus, setConceptStatus] = useState({});
  const [showCheck, setShowCheck] = useState(false);

  if (!prerequisites || prerequisites.length === 0) {
    return null;
  }

  const preTraining = cognitiveLoadService.generatePreTraining(prerequisites, subjectSlug, gradeLevel);
  if (!preTraining) return null;

  const handleConceptCheck = (conceptId, understood) => {
    setConceptStatus(prev => ({
      ...prev,
      [conceptId]: understood,
    }));
    setShowCheck(false);
  };

  const handleNext = () => {
    if (currentConcept < preTraining.concepts.length - 1) {
      setCurrentConcept(currentConcept + 1);
      setShowCheck(false);
    } else {
      onComplete({ conceptStatus });
    }
  };

  const handleSkip = () => {
    if (onSkip) onSkip();
  };

  const currentConceptData = preTraining.concepts[currentConcept];
  const isUnderstood = conceptStatus[currentConceptData.id] === true;
  const isNotUnderstood = conceptStatus[currentConceptData.id] === false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-yellow-600" />
          <div>
            <h3 className="text-xl font-bold text-gray-900">{preTraining.title}</h3>
            <p className="text-sm text-gray-600">{preTraining.description}</p>
          </div>
        </div>
        <button
          onClick={handleSkip}
          className="text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Skip
        </button>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            Concept {currentConcept + 1} of {preTraining.concepts.length}
          </span>
          <span className="text-sm font-semibold text-yellow-700">
            {Math.round(((currentConcept + 1) / preTraining.concepts.length) * 100)}%
          </span>
        </div>
        <div className="w-full h-2 bg-yellow-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-yellow-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentConcept + 1) / preTraining.concepts.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Current Concept */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentConcept}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-lg p-6 mb-4"
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            {currentConceptData.concept}
          </h4>
          <p className="text-gray-700 mb-4">{currentConceptData.review}</p>

          {/* Check Understanding */}
          {!showCheck && !isUnderstood && !isNotUnderstood && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-3">{currentConceptData.check}</p>
              <button
                onClick={() => setShowCheck(true)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Check My Understanding
              </button>
            </div>
          )}

          {showCheck && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-900 mb-3">
                Do you understand this concept?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleConceptCheck(currentConceptData.id, true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  Yes, I understand
                </button>
                <button
                  onClick={() => handleConceptCheck(currentConceptData.id, false)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                  I need review
                </button>
              </div>
            </div>
          )}

          {/* Status Display */}
          {isUnderstood && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800">Great! You understand this concept.</p>
            </div>
          )}

          {isNotUnderstood && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 mb-2">
                Don't worry! We'll review this concept during the lesson.
              </p>
              <p className="text-sm text-yellow-700">
                The lesson will include extra support for this concept.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentConcept(Math.max(0, currentConcept - 1))}
          disabled={currentConcept === 0}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        <span className="text-sm text-gray-600">
          Estimated time: {preTraining.estimatedTime} minutes
        </span>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          {currentConcept < preTraining.concepts.length - 1 ? 'Next' : 'Start Lesson'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

