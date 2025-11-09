'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, RefreshCw, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import ProgressCelebration from '@/components/celebration/ProgressCelebration';

/**
 * SpacedRepetitionReview Component
 * Shows concepts due for review and allows reviewing
 */
export default function SpacedRepetitionReview({ studentId, subjectId }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [conceptsDue, setConceptsDue] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingConcept, setReviewingConcept] = useState(null);
  const [reviewQuality, setReviewQuality] = useState(3);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    loadReviewData();
  }, [studentId, subjectId]);

  const loadReviewData = async () => {
    try {
      setIsLoading(true);

      // Load concepts due for review
      const dueRes = await fetch(
        `/api/learning/spaced-repetition?studentId=${studentId}&subjectId=${subjectId || ''}`,
        { credentials: 'include' }
      );

      if (dueRes.ok) {
        const dueData = await dueRes.json();
        setConceptsDue(dueData.concepts || []);
      }

      // Load statistics
      const statsRes = await fetch(
        `/api/learning/spaced-repetition?studentId=${studentId}&action=statistics`,
        { credentials: 'include' }
      );

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStatistics(statsData);
      }
    } catch (error) {
      console.error('Error loading review data:', error);
      addToast('Failed to load review data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (concept, quality) => {
    try {
      const response = await fetch('/api/learning/spaced-repetition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          studentId,
          conceptId: concept.conceptId,
          quality,
          subjectId: concept.subjectId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (quality >= 4) {
          setShowCelebration(true);
        }

        addToast(
          quality >= 4 
            ? 'Great job! Concept mastered!' 
            : 'Review recorded. Keep practicing!',
          quality >= 4 ? 'success' : 'info'
        );

        // Reload data
        loadReviewData();
        setReviewingConcept(null);
      }
    } catch (error) {
      console.error('Error recording review:', error);
      addToast('Failed to record review', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="surface-elevated p-6 rounded-xl">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {statistics && (
        <div className="surface-elevated p-6 rounded-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Review Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Total Concepts</div>
              <div className="text-2xl font-bold text-blue-600">{statistics.totalConcepts}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Due for Review</div>
              <div className="text-2xl font-bold text-orange-600">{statistics.dueForReview}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Average Mastery</div>
              <div className="text-2xl font-bold text-green-600">{statistics.averageMastery}%</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Reviews</div>
              <div className="text-2xl font-bold text-purple-600">{statistics.totalReviews}</div>
            </div>
          </div>
        </div>
      )}

      {/* Concepts Due for Review */}
      <div className="surface-elevated p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Concepts Due for Review</h3>
          {conceptsDue.length > 0 && (
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              {conceptsDue.length} due
            </span>
          )}
        </div>

        {conceptsDue.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
            <p>No concepts due for review. Great job staying on top of your learning!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conceptsDue.map((concept) => (
              <div
                key={concept.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{concept.conceptName}</h4>
                    <p className="text-sm text-gray-600">{concept.subjectName}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Last reviewed: {new Date(concept.lastReviewed).toLocaleDateString()}</span>
                      {concept.daysOverdue > 0 && (
                        <span className="text-orange-600 font-medium">
                          {concept.daysOverdue} day{concept.daysOverdue !== 1 ? 's' : ''} overdue
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setReviewingConcept(concept)}
                    className="btn btn-primary"
                  >
                    Review Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewingConcept && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Review: {reviewingConcept.conceptName}</h3>
            <p className="text-gray-600 mb-6">How well do you remember this concept?</p>

            <div className="space-y-3 mb-6">
              {[
                { value: 5, label: 'Perfect - I remember everything', emoji: '⭐' },
                { value: 4, label: 'Good - I remember most of it', emoji: '👍' },
                { value: 3, label: 'Okay - I remember some of it', emoji: '😐' },
                { value: 2, label: 'Hard - I remember very little', emoji: '😕' },
                { value: 1, label: 'Very Hard - I forgot most of it', emoji: '😞' },
                { value: 0, label: 'Complete Blackout - I forgot everything', emoji: '❌' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setReviewQuality(option.value)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    reviewQuality === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl mr-2">{option.emoji}</span>
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setReviewingConcept(null)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReview(reviewingConcept, reviewQuality)}
                className="btn btn-primary flex-1"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Celebration */}
      <ProgressCelebration
        type="mastery"
        message="Concept Mastered!"
        show={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />
    </div>
  );
}

