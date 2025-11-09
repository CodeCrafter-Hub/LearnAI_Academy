'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

/**
 * Hook for comprehensive classroom evaluation
 */
export function useClassroomEvaluation() {
  const { user } = useAuth();
  const [evaluation, setEvaluation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Run comprehensive evaluation
   */
  const runEvaluation = useCallback(async (gradeLevel, classroomConfig = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ui/comprehensive-evaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          gradeLevel,
          classroomConfig,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to run evaluation');
      }

      const data = await response.json();
      setEvaluation(data.evaluation);
      return data.evaluation;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get UI configuration for grade level
   */
  const getUIConfig = useCallback(async (gradeLevel) => {
    try {
      const response = await fetch(`/api/ui/grade-level?gradeLevel=${gradeLevel}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to get UI config');
      }

      const data = await response.json();
      return data.config;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Evaluate current UI setup
   */
  const evaluateUI = useCallback(async (gradeLevel, currentUI) => {
    try {
      const response = await fetch('/api/ui/grade-level', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'evaluate',
          gradeLevel,
          currentUI,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate UI');
      }

      const data = await response.json();
      return data.result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    evaluation,
    isLoading,
    error,
    runEvaluation,
    getUIConfig,
    evaluateUI,
  };
}

