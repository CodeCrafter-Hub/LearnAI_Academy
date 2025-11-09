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
      // Default to grade 5 if no user or no students
      const gradeLevel = user?.students?.[0]?.gradeLevel ?? 5;
      
      try {
        const response = await fetch(`/api/ui/grade-level?gradeLevel=${gradeLevel}`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUIConfig(data.config);
        } else {
          // If API fails, use default config
          console.warn('Failed to load UI config, using defaults');
          setUIConfig(null);
        }
      } catch (error) {
        console.error('Failed to load UI config:', error);
        // Use default config on error
        setUIConfig(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Always load config, even if no user (for public pages)
    loadUIConfig();
  }, [user]);

  // Apply CSS variables based on UI config
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    
    try {
      if (uiConfig) {
        const root = document.documentElement;
        const { colors, typography, spacing } = uiConfig;

        // Apply color variables
        if (colors && typeof colors === 'object') {
          Object.entries(colors).forEach(([key, value]) => {
            if (value) {
              root.style.setProperty(`--color-${key}`, value);
            }
          });
        }

        // Apply typography variables
        if (typography && typeof typography === 'object') {
          if (typography.fontFamily) {
            root.style.setProperty('--font-family', typography.fontFamily);
          }
          if (typography.baseSize) {
            root.style.setProperty('--font-size-base', typography.baseSize);
          }
          if (typography.lineHeight) {
            root.style.setProperty('--line-height', typography.lineHeight);
          }
        }

        // Apply spacing variables
        if (spacing && typeof spacing === 'object') {
          Object.entries(spacing).forEach(([key, value]) => {
            if (value) {
              root.style.setProperty(`--space-${key}`, value);
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to apply UI config:', error);
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

