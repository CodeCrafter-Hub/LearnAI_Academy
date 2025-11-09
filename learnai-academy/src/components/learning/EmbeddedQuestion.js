'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Lightbulb, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import InteractiveFeedback from '@/components/learning/InteractiveFeedback';

/**
 * EmbeddedQuestion Component
 * Real-time formative assessment embedded in lessons
 */
export default function EmbeddedQuestion({ 
  question, 
  onAnswer, 
  onComplete,
  showHints = true 
}) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [currentHint, setCurrentHint] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const studentId = user?.students?.[0]?.id;

  const handleSubmit = async () => {
    if (selectedAnswer === null) {
      addToast('Please select an answer', 'warning');
      return;
    }

    try {
      const response = await fetch('/api/assessment/formative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          questionId: question.id,
          studentId,
          answer: selectedAnswer,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        setSubmitted(true);
        setAttempts(prev => prev + 1);

        // Show hint if incorrect
        if (!data.isCorrect && data.nextHint) {
          setCurrentHint(data.nextHint);
        }

        // Show explanation after answer
        if (data.explanation) {
          setTimeout(() => setShowExplanation(true), 1000);
        }

        if (onAnswer) {
          onAnswer(data);
        }

        if (data.masteryAchieved && onComplete) {
          setTimeout(() => onComplete(), 2000);
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      addToast('Failed to submit answer', 'error');
    }
  };

  const handleRetry = () => {
    setSelectedAnswer(null);
    setSubmitted(false);
    setResult(null);
    setCurrentHint(null);
    setShowExplanation(false);
  };

  const isMultipleChoice = question.questionType === 'multiple-choice' || 
                           question.questionType === 'true-false';
  const options = question.options || [];

  return (
    <div className="surface-elevated p-6 rounded-xl border-2 border-blue-200 my-6">
      {/* Question */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{question.question}</h3>
        {question.concept && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Concept: {question.concept}
          </span>
        )}
      </div>

      {/* Answer Options */}
      {isMultipleChoice && (
        <div className="space-y-2 mb-4">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => !submitted && setSelectedAnswer(index)}
              disabled={submitted}
              className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                submitted && index === question.correctAnswer
                  ? 'border-green-500 bg-green-50'
                  : submitted && index === selectedAnswer && !result?.isCorrect
                  ? 'border-red-500 bg-red-50'
                  : selectedAnswer === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {/* Short Answer / Fill Blank */}
      {(question.questionType === 'short-answer' || question.questionType === 'fill-blank') && (
        <textarea
          value={selectedAnswer || ''}
          onChange={(e) => !submitted && setSelectedAnswer(e.target.value)}
          disabled={submitted}
          placeholder="Type your answer here..."
          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
          rows={question.questionType === 'short-answer' ? 4 : 2}
        />
      )}

      {/* Hints */}
      {showHints && currentHint && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-yellow-800 mb-1">Hint:</div>
            <div className="text-sm text-yellow-700">{currentHint}</div>
          </div>
        </div>
      )}

      {/* Feedback */}
      {submitted && result && (
        <div className="mb-4">
          <InteractiveFeedback
            type={result.isCorrect ? 'correct' : 'incorrect'}
            message={result.feedback.message}
            show={true}
            duration={3000}
            onClose={() => {}}
          />
        </div>
      )}

      {/* Explanation */}
      {showExplanation && result?.explanation && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="font-semibold text-blue-800 mb-2">Explanation:</div>
          <div className="text-sm text-blue-700">{result.explanation}</div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="btn btn-primary flex-1"
          >
            Submit Answer
          </button>
        ) : (
          <>
            {!result?.masteryAchieved && result?.attemptsRemaining > 0 && (
              <button
                onClick={handleRetry}
                className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again ({result.attemptsRemaining} attempts left)
              </button>
            )}
            {result?.masteryAchieved && (
              <div className="flex-1 flex items-center justify-center gap-2 text-green-600 font-semibold">
                <CheckCircle className="w-5 h-5" />
                Mastered! 🎉
              </div>
            )}
          </>
        )}
      </div>

      {/* Attempts Counter */}
      {attempts > 0 && (
        <div className="mt-3 text-xs text-gray-500 text-center">
          Attempts: {attempts} / 3
        </div>
      )}
    </div>
  );
}

