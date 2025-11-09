'use client';

import { useState, useEffect, useCallback } from 'react';
import { initI18n, t as translate, setLanguage, getLanguage, loadTranslations } from '@/lib/i18n/i18n.js';
import { supportedLanguages, isRTL as checkRTL } from '@/lib/i18n/config.js';

/**
 * useI18n Hook
 * Provides translation functionality and language management
 */
export function useI18n() {
  const [locale, setLocale] = useState(() => {
    if (typeof window !== 'undefined') {
      return getLanguage() || 'en';
    }
    return 'en';
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRTL, setIsRTL] = useState(false);

  // Initialize i18n
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      const lang = await initI18n(locale);
      setLocale(lang);
      setIsRTL(isRTL(lang));
      setIsLoading(false);
    };

    initialize();
  }, []);

  // Translation function
  const t = useCallback((key, params = {}) => {
    return translate(key, params, locale);
  }, [locale]);

  // Change language
  const changeLanguage = useCallback(async (newLocale) => {
    setIsLoading(true);
    await loadTranslations(newLocale);
    setLanguage(newLocale);
    setLocale(newLocale);
    const rtl = checkRTL(newLocale);
    setIsRTL(rtl);
    setIsLoading(false);

    // Update document direction for RTL languages
    if (typeof document !== 'undefined') {
      document.documentElement.dir = rtl ? 'rtl' : 'ltr';
      document.documentElement.lang = newLocale;
    }

    // Save to API
    try {
      await fetch('/api/i18n/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ language: newLocale }),
      });
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  }, []);

  return {
    t,
    locale,
    changeLanguage,
    isLoading,
    isRTL,
    supportedLanguages,
  };
}

