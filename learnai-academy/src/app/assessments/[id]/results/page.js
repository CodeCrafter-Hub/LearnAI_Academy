'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import QuestionCard from '@/components/assessment/QuestionCard';
import Loading from '@/components/ui/Loading';
import { Trophy, CheckCircle, XCircle, ArrowLeft, Home } from 'lucide-react';

function AssessmentResultsContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const assessmentId = params.id;

  const [assessment, setAssessment] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadResults();
  }, [assessmentId]);

  const loadResults = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Load assessment
      const assessmentRes = await fetch(`/api/assessments/${assessmentId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const assessmentData = await assessmentRes.json();
      setAssessment(assessmentData.assessment);

      // Get score from URL params (from redirect)
      const score = searchParams.get('score');
      const total = searchParams.get('total');
      
      if (score && total) {
        setResult({
          score: parseFloat(score),
          totalQuestions: parseInt(total),
          correctAnswers: parseInt(score),
        });
      } else {
        // TODO: Load result from API if available
        // For now, calculate from assessment metadata
        setResult({
          score: 0,
          totalQuestions: assessmentData.assessment.totalQuestions || 0,
          correctAnswers: 0,
        });
      }
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading message="Loading results..." />;
  }

  if (!assessment || !result) {
    return null;
  }

  const percentage = (result.correctAnswers / result.totalQuestions) * 100;
  const isPassing = percentage >= 70; // 70% passing threshold
  const questions = assessment.questions || [];
  const questionResults = result.questionResults || {};

  const getScoreColor = () => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = () => {
    if (percentage >= 90) return 'bg-green-100';
    if (percentage >= 70) return 'bg-blue-100';
    if (percentage >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Results Summary */}
        <div className={`${getScoreBgColor()} rounded-2xl p-8 mb-6 text-center`}>
          <div className="flex justify-center mb-4">
            {isPassing ? (
              <Trophy className="w-16 h-16 text-yellow-500" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isPassing ? 'Great Job!' : 'Keep Practicing!'}
          </h1>
          <div className={`text-6xl font-bold mb-2 ${getScoreColor()}`}>
            {percentage.toFixed(0)}%
          </div>
          <p className="text-lg text-gray-700">
            You got {result.correctAnswers} out of {result.totalQuestions} questions correct
          </p>
          {isPassing && (
            <div className="mt-4 flex items-center justify-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Passing Score!</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showDetails ? 'Hide' : 'Show'} Detailed Results
          </button>
          <button
            onClick={() => router.push('/assessments')}
            className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 inline mr-2" />
            Back to Assessments
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Home className="w-5 h-5 inline mr-2" />
            Dashboard
          </button>
        </div>

        {/* Detailed Results */}
        {showDetails && questions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Question Review</h2>
            <div className="space-y-6">
              {questions.map((question, idx) => {
                const questionResult = questionResults[idx];
                const isCorrect = questionResult?.isCorrect || false;
                const studentAnswer = questionResult?.studentAnswer || '';

                return (
                  <QuestionCard
                    key={idx}
                    question={question}
                    index={idx}
                    totalQuestions={questions.length}
                    answer={studentAnswer}
                    showResult={true}
                    isCorrect={isCorrect}
                    onChange={() => {}} // No changes allowed in review
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {result.recommendedTopics && result.recommendedTopics.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recommended Next Topics</h2>
            <ul className="space-y-2">
              {result.recommendedTopics.map((topic, idx) => (
                <li key={idx} className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AssessmentResultsPage() {
  return (
    <Suspense fallback={<Loading message="Loading results..." />}>
      <AssessmentResultsContent />
    </Suspense>
  );
}

