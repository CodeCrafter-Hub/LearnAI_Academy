'use client';

import { createContext, useContext } from 'react';
import { useI18n } from '@/hooks/useI18n';

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const i18n = useI18n();

  return (
    <I18nContext.Provider value={i18n}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18nContext() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18nContext must be used within I18nProvider');
  }
  return context;
}

