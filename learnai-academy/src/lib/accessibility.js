/**
 * Accessibility and Inclusion Features
 * Ensures the platform is usable by all learners
 */

/**
 * Accessibility Profiles
 * Pre-configured settings for common accessibility needs
 */
export const ACCESSIBILITY_PROFILES = {
  visualImpairment: {
    name: 'Visual Impairment',
    icon: '👁️',
    settings: {
      fontSize: 'extra-large',
      highContrast: true,
      screenReader: true,
      textToSpeech: true,
      reduceAnimations: true,
      boldText: true,
    },
  },
  dyslexia: {
    name: 'Dyslexia Support',
    icon: '📖',
    settings: {
      dyslexiaFont: true,
      fontSize: 'large',
      letterSpacing: 'wide',
      lineSpacing: 'wide',
      highlightWords: true,
      textToSpeech: true,
    },
  },
  motorImpairment: {
    name: 'Motor Impairment',
    icon: '⌨️',
    settings: {
      keyboardNavigation: true,
      largerClickTargets: true,
      reduceDragAndDrop: true,
      slowAnimations: true,
      voiceCommands: true,
    },
  },
  hearingImpairment: {
    name: 'Hearing Impairment',
    icon: '👂',
    settings: {
      captions: true,
      visualAlerts: true,
      transcripts: true,
      signLanguage: true,
    },
  },
  adhd: {
    name: 'ADHD Support',
    icon: '🎯',
    settings: {
      reduceAnimations: true,
      focusMode: true,
      breakReminders: true,
      timerDisplay: true,
      minimizeDistractions: true,
    },
  },
  autism: {
    name: 'Autism Support',
    icon: '🧩',
    settings: {
      predictableLayout: true,
      reduceAnimations: true,
      clearInstructions: true,
      visualSchedules: true,
      sensoryFriendly: true,
    },
  },
};

/**
 * Dyslexia-friendly fonts
 */
export const DYSLEXIA_FONTS = [
  'OpenDyslexic',
  'Comic Sans MS',
  'Arial',
  'Verdana',
  'Tahoma',
];

/**
 * Color blind modes
 */
export const COLOR_BLIND_MODES = {
  protanopia: {
    name: 'Protanopia (Red-Blind)',
    description: 'Difficulty distinguishing red and green',
    filter: 'url(#protanopia-filter)',
  },
  deuteranopia: {
    name: 'Deuteranopia (Green-Blind)',
    description: 'Difficulty distinguishing red and green',
    filter: 'url(#deuteranopia-filter)',
  },
  tritanopia: {
    name: 'Tritanopia (Blue-Blind)',
    description: 'Difficulty distinguishing blue and yellow',
    filter: 'url(#tritanopia-filter)',
  },
  achromatopsia: {
    name: 'Achromatopsia (Total Color Blindness)',
    description: 'Complete absence of color vision',
    filter: 'grayscale(100%)',
  },
};

/**
 * AccessibilityManager
 * Manages accessibility settings and features
 */
export class AccessibilityManager {
  constructor() {
    this.settings = this.loadSettings();
    this.activeProfile = null;
    this.speechSynthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.speechRecognition = this.initializeSpeechRecognition();
  }

  /**
   * Load saved settings
   */
  loadSettings() {
    const defaults = {
      // Visual
      fontSize: 'medium', // small, medium, large, extra-large
      fontFamily: 'default',
      dyslexiaFont: false,
      letterSpacing: 'normal', // normal, wide, extra-wide
      lineSpacing: 'normal', // normal, wide, extra-wide
      highContrast: false,
      colorBlindMode: 'none',
      boldText: false,
      darkMode: false,

      // Audio
      textToSpeech: false,
      speechRate: 1.0, // 0.5 - 2.0
      speechPitch: 1.0, // 0.5 - 2.0
      speechVolume: 1.0, // 0.0 - 1.0
      speechToText: false,
      soundEffects: true,
      backgroundMusic: false,

      // Interaction
      keyboardNavigation: true,
      voiceCommands: false,
      largerClickTargets: false,
      reduceDragAndDrop: false,
      mouseFollowFocus: false,

      // Motion
      reduceAnimations: false,
      slowAnimations: false,
      noAutoPlay: false,

      // Content
      captions: false,
      transcripts: true,
      signLanguage: false,
      visualAlerts: true,
      highlightWords: false,

      // Focus
      focusMode: false,
      minimizeDistractions: false,
      breakReminders: true,
      timerDisplay: false,

      // Language
      language: 'en',
      translationEnabled: false,

      // Other
      predictableLayout: true,
      clearInstructions: true,
      visualSchedules: false,
      sensoryFriendly: false,
    };

    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('learnai_accessibility');
        if (saved) {
          return { ...defaults, ...JSON.parse(saved) };
        }
      }
    } catch (error) {
      console.error('Error loading accessibility settings:', error);
    }

    return defaults;
  }

  /**
   * Save settings
   */
  saveSettings() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('learnai_accessibility', JSON.stringify(this.settings));
      }
    } catch (error) {
      console.error('Error saving accessibility settings:', error);
    }
  }

  /**
   * Update a setting
   */
  updateSetting(key, value) {
    this.settings[key] = value;
    this.saveSettings();
    this.applySettings();
  }

  /**
   * Update multiple settings
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    this.applySettings();
  }

  /**
   * Apply profile
   */
  applyProfile(profileKey) {
    const profile = ACCESSIBILITY_PROFILES[profileKey];
    if (!profile) {
      throw new Error(`Profile ${profileKey} not found`);
    }

    this.activeProfile = profileKey;
    this.updateSettings(profile.settings);
  }

  /**
   * Reset to defaults
   */
  resetSettings() {
    this.settings = this.loadSettings();
    this.activeProfile = null;
    this.saveSettings();
    this.applySettings();
  }

  /**
   * Apply settings to document
   */
  applySettings() {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Font size
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      'extra-large': '22px',
    };
    root.style.fontSize = fontSizes[this.settings.fontSize] || fontSizes.medium;

    // Font family
    if (this.settings.dyslexiaFont) {
      root.style.fontFamily = 'OpenDyslexic, Comic Sans MS, sans-serif';
    } else if (this.settings.fontFamily !== 'default') {
      root.style.fontFamily = this.settings.fontFamily;
    }

    // Letter spacing
    const letterSpacings = {
      normal: '0',
      wide: '0.05em',
      'extra-wide': '0.1em',
    };
    root.style.letterSpacing = letterSpacings[this.settings.letterSpacing] || '0';

    // Line spacing
    const lineSpacings = {
      normal: '1.5',
      wide: '2',
      'extra-wide': '2.5',
    };
    root.style.lineHeight = lineSpacings[this.settings.lineSpacing] || '1.5';

    // High contrast
    if (this.settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Dark mode
    if (this.settings.darkMode) {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }

    // Bold text
    if (this.settings.boldText) {
      root.style.fontWeight = '600';
    } else {
      root.style.fontWeight = 'normal';
    }

    // Color blind mode
    if (this.settings.colorBlindMode !== 'none') {
      const mode = COLOR_BLIND_MODES[this.settings.colorBlindMode];
      if (mode) {
        root.style.filter = mode.filter;
      }
    } else {
      root.style.filter = 'none';
    }

    // Reduce animations
    if (this.settings.reduceAnimations) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Focus mode
    if (this.settings.focusMode) {
      root.classList.add('focus-mode');
    } else {
      root.classList.remove('focus-mode');
    }

    // Larger click targets
    if (this.settings.largerClickTargets) {
      root.classList.add('large-targets');
    } else {
      root.classList.remove('large-targets');
    }
  }

  /**
   * Text-to-Speech
   */
  speak(text, options = {}) {
    if (!this.settings.textToSpeech || !this.speechSynthesis) {
      return;
    }

    // Cancel any ongoing speech
    this.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || this.settings.speechRate;
    utterance.pitch = options.pitch || this.settings.speechPitch;
    utterance.volume = options.volume || this.settings.speechVolume;
    utterance.lang = options.lang || this.settings.language;

    this.speechSynthesis.speak(utterance);
  }

  /**
   * Stop speaking
   */
  stopSpeaking() {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
  }

  /**
   * Initialize speech recognition
   */
  initializeSpeechRecognition() {
    if (typeof window === 'undefined') return null;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = this.settings.language;

    return recognition;
  }

  /**
   * Start listening (Speech-to-Text)
   */
  startListening(callback) {
    if (!this.settings.speechToText || !this.speechRecognition) {
      return;
    }

    this.speechRecognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      callback(transcript);
    };

    this.speechRecognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    this.speechRecognition.start();
  }

  /**
   * Stop listening
   */
  stopListening() {
    if (this.speechRecognition) {
      this.speechRecognition.stop();
    }
  }

  /**
   * Get keyboard shortcuts
   */
  getKeyboardShortcuts() {
    return {
      'Alt+H': 'Go to home',
      'Alt+N': 'Start new session',
      'Alt+P': 'View progress',
      'Alt+S': 'Open settings',
      'Alt+?': 'Show help',
      'Alt+T': 'Toggle text-to-speech',
      'Alt+F': 'Toggle focus mode',
      'Space': 'Play/pause audio',
      'Enter': 'Submit answer',
      'Escape': 'Cancel/close',
      'Tab': 'Navigate forward',
      'Shift+Tab': 'Navigate backward',
      'Arrow Keys': 'Navigate options',
    };
  }

  /**
   * Get ARIA labels for screen readers
   */
  getAriaLabel(element, context = {}) {
    const labels = {
      button: `${element.text || 'Button'}${element.disabled ? ' (disabled)' : ''}`,
      link: `Link to ${element.text || 'page'}`,
      input: `${element.label || 'Input'} field${element.required ? ' (required)' : ''}`,
      checkbox: `${element.label || 'Checkbox'}${element.checked ? ' (checked)' : ' (unchecked)'}`,
      radio: `${element.label || 'Radio button'}${element.checked ? ' (selected)' : ''}`,
      progress: `Progress: ${context.current || 0} of ${context.total || 0}`,
      alert: `Alert: ${element.text}`,
      dialog: `Dialog: ${element.title}`,
    };

    return labels[element.type] || element.text || '';
  }
}

/**
 * ReadingAssistant
 * Helps with reading comprehension and accessibility
 */
export class ReadingAssistant {
  constructor(accessibilityManager) {
    this.accessibility = accessibilityManager;
  }

  /**
   * Highlight text word-by-word during reading
   */
  highlightReading(text, element, options = {}) {
    if (!this.accessibility.settings.highlightWords) {
      return;
    }

    const words = text.split(' ');
    const delay = options.delay || 200; // ms per word

    let currentIndex = 0;

    const highlight = () => {
      if (currentIndex >= words.length) {
        return;
      }

      // In production, update DOM to highlight current word
      console.log('Highlighting:', words[currentIndex]);

      if (this.accessibility.settings.textToSpeech) {
        this.accessibility.speak(words[currentIndex]);
      }

      currentIndex++;
      setTimeout(highlight, delay);
    };

    highlight();
  }

  /**
   * Simplify text for easier reading
   */
  simplifyText(text, level = 'basic') {
    // In production, use NLP to simplify
    // For now, basic simplification

    let simplified = text;

    if (level === 'basic' || level === 'elementary') {
      // Replace complex words
      const replacements = {
        utilize: 'use',
        demonstrate: 'show',
        consequently: 'so',
        additionally: 'also',
        however: 'but',
        therefore: 'so',
      };

      Object.entries(replacements).forEach(([complex, simple]) => {
        const regex = new RegExp(`\\b${complex}\\b`, 'gi');
        simplified = simplified.replace(regex, simple);
      });

      // Break long sentences
      simplified = simplified.replace(/([.!?])\s+/g, '$1\n\n');
    }

    return simplified;
  }

  /**
   * Add visual ruler/guide for reading
   */
  addReadingRuler(element) {
    // Creates a visual guide that follows the line being read
    // Implementation would involve CSS and DOM manipulation
    console.log('Reading ruler enabled for', element);
  }

  /**
   * Generate summary of text
   */
  generateSummary(text, length = 'short') {
    // In production, use AI to generate summary
    // For now, return first few sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const count = length === 'short' ? 2 : length === 'medium' ? 4 : 6;
    return sentences.slice(0, count).join(' ');
  }
}

/**
 * KeyboardNavigationManager
 * Handles comprehensive keyboard navigation
 */
export class KeyboardNavigationManager {
  constructor() {
    this.focusableElements = [];
    this.currentIndex = -1;
    this.shortcuts = new Map();
    this.init();
  }

  /**
   * Initialize keyboard navigation
   */
  init() {
    if (typeof document === 'undefined') return;

    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.updateFocusableElements();
  }

  /**
   * Update list of focusable elements
   */
  updateFocusableElements() {
    if (typeof document === 'undefined') return;

    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    this.focusableElements = Array.from(document.querySelectorAll(selector));
  }

  /**
   * Handle keyboard events
   */
  handleKeyDown(event) {
    const { key, altKey, ctrlKey, shiftKey } = event;

    // Check for registered shortcuts
    const shortcutKey = `${altKey ? 'Alt+' : ''}${ctrlKey ? 'Ctrl+' : ''}${shiftKey ? 'Shift+' : ''}${key}`;

    if (this.shortcuts.has(shortcutKey)) {
      event.preventDefault();
      this.shortcuts.get(shortcutKey)();
      return;
    }

    // Tab navigation
    if (key === 'Tab') {
      this.handleTabNavigation(event);
    }

    // Arrow key navigation for groups
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      this.handleArrowNavigation(event);
    }

    // Escape to close modals
    if (key === 'Escape') {
      this.handleEscape();
    }
  }

  /**
   * Handle tab navigation
   */
  handleTabNavigation(event) {
    if (this.focusableElements.length === 0) return;

    const currentElement = document.activeElement;
    const currentIndex = this.focusableElements.indexOf(currentElement);

    let nextIndex;
    if (event.shiftKey) {
      // Previous element
      nextIndex = currentIndex <= 0 ? this.focusableElements.length - 1 : currentIndex - 1;
    } else {
      // Next element
      nextIndex = currentIndex >= this.focusableElements.length - 1 ? 0 : currentIndex + 1;
    }

    event.preventDefault();
    this.focusableElements[nextIndex]?.focus();
  }

  /**
   * Handle arrow key navigation
   */
  handleArrowNavigation(event) {
    // Implementation for arrow navigation within groups
    const activeElement = document.activeElement;
    const role = activeElement.getAttribute('role');

    if (['radiogroup', 'listbox', 'menu'].includes(role)) {
      event.preventDefault();
      // Navigate within group
    }
  }

  /**
   * Handle escape key
   */
  handleEscape() {
    // Close modals, cancel operations, etc.
    const event = new CustomEvent('accessibility:escape');
    document.dispatchEvent(event);
  }

  /**
   * Register keyboard shortcut
   */
  registerShortcut(key, callback) {
    this.shortcuts.set(key, callback);
  }

  /**
   * Unregister keyboard shortcut
   */
  unregisterShortcut(key) {
    this.shortcuts.delete(key);
  }
}

/**
 * Export CSS for accessibility features
 */
export const ACCESSIBILITY_CSS = `
/* High Contrast Mode */
.high-contrast {
  filter: contrast(150%);
}

.high-contrast * {
  border-color: #000 !important;
  color: #000 !important;
  background-color: #fff !important;
}

.high-contrast button,
.high-contrast a {
  border: 2px solid #000 !important;
}

/* Reduce Motion */
.reduce-motion * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}

/* Focus Mode */
.focus-mode {
  --background-opacity: 0.5;
}

.focus-mode *:not(:focus):not(:focus-within) {
  opacity: var(--background-opacity);
}

/* Large Click Targets */
.large-targets button,
.large-targets a,
.large-targets input {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 20px;
}

/* Dark Mode */
.dark-mode {
  background-color: #1a1a1a;
  color: #ffffff;
}

.dark-mode * {
  color: #ffffff;
}

/* Focus Indicator */
*:focus {
  outline: 3px solid #4a90e2;
  outline-offset: 2px;
}

/* Skip to Content Link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
`;

/**
 * Example Usage
 */

/*
// Initialize accessibility
const accessibility = new AccessibilityManager();
const readingAssistant = new ReadingAssistant(accessibility);
const keyboardNav = new KeyboardNavigationManager();

// Apply a profile
accessibility.applyProfile('dyslexia');

// Update individual setting
accessibility.updateSetting('fontSize', 'large');

// Use text-to-speech
accessibility.speak('Hello, welcome to LearnAI Academy!');

// Start speech recognition
accessibility.startListening((transcript) => {
  console.log('User said:', transcript);
});

// Register keyboard shortcut
keyboardNav.registerShortcut('Alt+T', () => {
  const enabled = !accessibility.settings.textToSpeech;
  accessibility.updateSetting('textToSpeech', enabled);
  console.log('Text-to-speech', enabled ? 'enabled' : 'disabled');
});

// Highlight reading
readingAssistant.highlightReading('This is a sample text for reading', document.body);

// Get keyboard shortcuts
const shortcuts = accessibility.getKeyboardShortcuts();
console.log('Available shortcuts:', shortcuts);
*/

export { AccessibilityManager, ReadingAssistant, KeyboardNavigationManager };
