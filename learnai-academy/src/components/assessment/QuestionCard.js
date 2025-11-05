'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';

export default function QuestionCard({ question, index, totalQuestions, answer, onChange, showResult = false, isCorrect = null }) {
  const isMultipleChoice = question.type === 'multipleChoice' && question.options;
  const isShortAnswer = question.type === 'shortAnswer';
  const isProblemSolving = question.type === 'problemSolving';

  const getAnswerColor = () => {
    if (!showResult) return '';
    if (isCorrect) return 'border-green-500 bg-green-50';
    return 'border-red-500 bg-red-50';
  };

  return (
    <Card className={`mb-6 ${getAnswerColor()}`}>
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
          {index + 1}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">
              Question {index + 1} of {totalQuestions}
            </span>
            {showResult && (
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {isCorrect ? 'Correct' : 'Incorrect'}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            {question.question || question.text}
          </h3>
          {question.points && (
            <span className="text-sm text-gray-500">({question.points} points)</span>
          )}
        </div>
      </div>

      {/* Multiple Choice Options */}
      {isMultipleChoice && (
        <div className="space-y-2 ml-12">
          {question.options.map((option, optIdx) => {
            const isSelected = answer === option || answer === optIdx;
            const isCorrectAnswer = showResult && (option === question.correctAnswer || optIdx === question.correctAnswerIndex);
            
            return (
              <label
                key={optIdx}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${
                  showResult && isCorrectAnswer
                    ? 'border-green-500 bg-green-50'
                    : ''
                }`}
              >
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={option}
                  checked={isSelected}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={showResult}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="flex-1">{option}</span>
                {showResult && isCorrectAnswer && (
                  <span className="text-green-600 font-medium">✓ Correct</span>
                )}
              </label>
            );
          })}
        </div>
      )}

      {/* Short Answer */}
      {isShortAnswer && (
        <div className="ml-12">
          <textarea
            value={answer || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={showResult}
            placeholder="Type your answer here..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
          />
          {showResult && question.correctAnswer && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-1">Correct Answer:</p>
              <p className="text-sm text-gray-600">{question.correctAnswer}</p>
            </div>
          )}
        </div>
      )}

      {/* Problem Solving */}
      {isProblemSolving && (
        <div className="ml-12 space-y-4">
          <textarea
            value={answer || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={showResult}
            placeholder="Show your work and provide your answer..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono"
            rows={6}
          />
          {showResult && question.solution && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Solution:</p>
              <div className="text-sm text-gray-600 whitespace-pre-wrap">
                {Array.isArray(question.solution) 
                  ? question.solution.map((step, idx) => (
                      <div key={idx} className="mb-2">
                        <span className="font-medium">Step {idx + 1}:</span> {step}
                      </div>
                    ))
                  : question.solution}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Explanation (shown after result) */}
      {showResult && question.explanation && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg ml-12">
          <p className="text-sm font-medium text-blue-700 mb-1">Explanation:</p>
          <p className="text-sm text-blue-600">{question.explanation}</p>
        </div>
      )}
    </Card>
  );
}

