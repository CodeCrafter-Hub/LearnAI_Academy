'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import QuestionCard from '@/components/assessment/QuestionCard';
import Loading from '@/components/ui/Loading';
import { Clock, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function TakeAssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id;

  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAssessment();
  }, [assessmentId]);

  useEffect(() => {
    if (assessment?.timeLimitMinutes && timeRemaining !== null) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [assessment, timeRemaining]);

  const loadAssessment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/assessments/${assessmentId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to load assessment');
      }

      const data = await response.json();
      setAssessment(data.assessment);
      
      if (data.assessment.timeLimitMinutes) {
        setTimeRemaining(data.assessment.timeLimitMinutes * 60);
      }
    } catch (error) {
      console.error('Error loading assessment:', error);
      alert('Failed to load assessment');
      router.push('/assessments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers({
      ...answers,
      [questionIndex]: answer,
    });
  };

  const handleNext = () => {
    if (currentQuestion < assessment.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!confirm('Are you sure you want to submit your assessment? You cannot change your answers after submitting.')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));
      const studentId = userData?.students?.[0]?.id;

      if (!studentId) {
        throw new Error('Student ID not found');
      }

      // Convert answers to format expected by API
      const answersArray = Object.entries(answers).map(([questionIndex, answer]) => ({
        questionId: parseInt(questionIndex),
        answer: answer,
      }));

      const response = await fetch(`/api/assessments/${assessmentId}/grade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: studentId,
          answers: answersArray,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit assessment');
      }

      const data = await response.json();
      router.push(`/assessments/${assessmentId}/results?score=${data.result.score}&total=${data.result.totalQuestions}`);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert(`Failed to submit assessment: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return <Loading message="Loading assessment..." />;
  }

  if (!assessment) {
    return null;
  }

  const questions = assessment.questions || [];
  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with timer */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{assessment.name}</h1>
              <p className="text-gray-600">{assessment.subject?.name || 'Assessment'}</p>
            </div>
            {timeRemaining !== null && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg">
                <Clock className="w-5 h-5 text-red-600" />
                <span className="text-lg font-bold text-red-600">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{answeredCount} answered</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question */}
        {currentQ && (
          <QuestionCard
            question={currentQ}
            index={currentQuestion}
            totalQuestions={questions.length}
            answer={answers[currentQuestion]}
            onChange={(answer) => handleAnswerChange(currentQuestion, answer)}
          />
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>

          <div className="flex gap-2">
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

