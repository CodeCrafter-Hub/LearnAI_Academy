/**
 * i18n Configuration
 * 
 * Supports multiple languages with fallback to English
 * Uses next-intl pattern for Next.js App Router
 */

export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
];

export const defaultLanguage = 'en';

export const languageNames = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  zh: 'Chinese',
  ar: 'Arabic',
  hi: 'Hindi',
  pt: 'Portuguese',
  ja: 'Japanese',
  ko: 'Korean',
};

export const rtlLanguages = ['ar', 'he', 'ur']; // Right-to-left languages

export function isRTL(locale) {
  return rtlLanguages.includes(locale);
}

export function getLanguageFromCode(code) {
  return supportedLanguages.find(lang => lang.code === code) || supportedLanguages[0];
}

export function detectLanguage(request) {
  // Check Accept-Language header
  const acceptLanguage = request?.headers?.get('accept-language');
  if (acceptLanguage) {
    const languages = acceptLanguage.split(',').map(lang => {
      const [code, q = '1'] = lang.trim().split(';q=');
      return { code: code.split('-')[0], quality: parseFloat(q) };
    });

    // Sort by quality
    languages.sort((a, b) => b.quality - a.quality);

    // Find first supported language
    for (const lang of languages) {
      if (supportedLanguages.find(l => l.code === lang.code)) {
        return lang.code;
      }
    }
  }

  return defaultLanguage;
}

