import { supportedLanguages, defaultLanguage } from './config.js';

/**
 * Simple i18n implementation for Next.js
 * Loads translations from JSON files
 */

let translations = {};
let currentLanguage = defaultLanguage;

/**
 * Load translations for a language
 */
export async function loadTranslations(locale) {
  try {
    // Dynamic import based on locale
    const translationModule = await import(`./translations/${locale}.json`);
    translations[locale] = translationModule.default || translationModule;
    return translations[locale];
  } catch (error) {
    console.warn(`Failed to load translations for ${locale}, falling back to ${defaultLanguage}`);
    // Fallback to default language
    if (locale !== defaultLanguage) {
      return loadTranslations(defaultLanguage);
    }
    return {};
  }
}

/**
 * Get translation function
 */
export function t(key, params = {}, locale = currentLanguage) {
  const keys = key.split('.');
  let value = translations[locale] || translations[defaultLanguage] || {};

  // Navigate through nested keys
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      // Fallback to default language
      if (locale !== defaultLanguage) {
        return t(key, params, defaultLanguage);
      }
      return key; // Return key if translation not found
    }
  }

  // Replace parameters
  if (typeof value === 'string' && params) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey] !== undefined ? params[paramKey] : match;
    });
  }

  return value || key;
}

/**
 * Set current language
 */
export function setLanguage(locale) {
  if (supportedLanguages.find(l => l.code === locale)) {
    currentLanguage = locale;
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('preferredLanguage', locale);
      } catch (error) {
        console.warn('Failed to save language preference:', error);
      }
    }
  }
}

/**
 * Get current language
 */
export function getLanguage() {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('preferredLanguage');
    if (stored && supportedLanguages.find(l => l.code === stored)) {
      return stored;
    }
  }
  return currentLanguage;
}

/**
 * Initialize i18n
 */
export async function initI18n(locale) {
  const lang = locale || getLanguage() || defaultLanguage;
  await loadTranslations(lang);
  setLanguage(lang);
  return lang;
}

/**
 * Get all translations for a namespace
 */
export function getTranslations(namespace, locale = currentLanguage) {
  const allTranslations = translations[locale] || translations[defaultLanguage] || {};
  return allTranslations[namespace] || {};
}

/**
 * Check if translation exists
 */
export function hasTranslation(key, locale = currentLanguage) {
  const keys = key.split('.');
  let value = translations[locale] || translations[defaultLanguage] || {};

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      return false;
    }
  }

  return true;
}

// Initialize with default language (only on client side, and don't block)
if (typeof window !== 'undefined') {
  // Don't await - let it initialize in background
  initI18n().catch((error) => {
    console.warn('Failed to initialize i18n on module load:', error);
  });
}

