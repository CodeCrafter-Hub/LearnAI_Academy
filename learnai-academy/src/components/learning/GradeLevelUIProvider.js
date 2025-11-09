'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

const GradeLevelUIContext = createContext(null);

/**
 * Provider that applies grade-level appropriate UI configuration
 */
export function GradeLevelUIProvider({ children }) {
  const { user } = useAuth();
  const [uiConfig, setUIConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUIConfig = async () => {
      const gradeLevel = user?.students?.[0]?.gradeLevel || 5;
      
      try {
        const response = await fetch(`/api/ui/grade-level?gradeLevel=${gradeLevel}`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUIConfig(data.config);
        }
      } catch (error) {
        console.error('Failed to load UI config:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadUIConfig();
    }
  }, [user]);

  // Apply CSS variables based on UI config
  useEffect(() => {
    if (uiConfig && typeof document !== 'undefined') {
      const root = document.documentElement;
      const { colors, typography, spacing } = uiConfig;

      // Apply color variables
      if (colors) {
        Object.entries(colors).forEach(([key, value]) => {
          root.style.setProperty(`--color-${key}`, value);
        });
      }

      // Apply typography variables
      if (typography) {
        root.style.setProperty('--font-family', typography.fontFamily);
        root.style.setProperty('--font-size-base', typography.baseSize);
        root.style.setProperty('--line-height', typography.lineHeight);
      }

      // Apply spacing variables
      if (spacing) {
        Object.entries(spacing).forEach(([key, value]) => {
          root.style.setProperty(`--space-${key}`, value);
        });
      }
    }
  }, [uiConfig]);

  return (
    <GradeLevelUIContext.Provider value={{ uiConfig, isLoading }}>
      {children}
    </GradeLevelUIContext.Provider>
  );
}

export function useGradeLevelUI() {
  const context = useContext(GradeLevelUIContext);
  if (!context) {
    // Return default config if provider not available
    return {
      uiConfig: null,
      isLoading: false,
    };
  }
  return context;
}

