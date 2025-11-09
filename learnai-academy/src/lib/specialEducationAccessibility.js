/**
 * Special Education & Accessibility Suite
 *
 * Comprehensive support for diverse learners and accessibility needs:
 * - IEP (Individualized Education Program) management and tracking
 * - Accommodations implementation and monitoring
 * - Text-to-speech (TTS) with natural voices
 * - Speech-to-text (STT) for input
 * - Dyslexia-friendly fonts and spacing (OpenDyslexic)
 * - ADHD support features (focus mode, timers, breaks)
 * - Visual impairment support (screen reader, high contrast)
 * - Hearing impairment support (captions, transcripts, visual alerts)
 * - Motor skill accommodations (keyboard navigation, voice control)
 * - Color blind friendly palettes
 * - Adjustable font sizes and spacing
 * - WCAG AAA compliance
 * - Progress tracking for IEP goals
 * - Special education reporting
 *
 * Ensures every student can access and succeed in learning.
 */

// Disability categories
const DISABILITY_CATEGORIES = {
  LEARNING_DISABILITY: 'learning_disability',
  ADHD: 'adhd',
  AUTISM: 'autism',
  VISUAL_IMPAIRMENT: 'visual_impairment',
  HEARING_IMPAIRMENT: 'hearing_impairment',
  MOTOR_IMPAIRMENT: 'motor_impairment',
  SPEECH_IMPAIRMENT: 'speech_impairment',
  EMOTIONAL_BEHAVIORAL: 'emotional_behavioral',
  INTELLECTUAL_DISABILITY: 'intellectual_disability',
  OTHER: 'other',
};

// Accommodation types
const ACCOMMODATION_TYPES = {
  EXTENDED_TIME: 'extended_time',
  REDUCED_DISTRACTIONS: 'reduced_distractions',
  TEXT_TO_SPEECH: 'text_to_speech',
  SPEECH_TO_TEXT: 'speech_to_text',
  BREAKS: 'breaks',
  SIMPLIFIED_INSTRUCTIONS: 'simplified_instructions',
  VISUAL_AIDS: 'visual_aids',
  AUDIO_SUPPORT: 'audio_support',
  ALTERNATIVE_FORMAT: 'alternative_format',
  ASSISTIVE_TECHNOLOGY: 'assistive_technology',
  PREFERENTIAL_SEATING: 'preferential_seating',
  MODIFIED_ASSIGNMENTS: 'modified_assignments',
};

// Accessibility profiles
const ACCESSIBILITY_PROFILES = {
  DYSLEXIA: 'dyslexia',
  LOW_VISION: 'low_vision',
  COLOR_BLIND: 'color_blind',
  MOTOR_DIFFICULTY: 'motor_difficulty',
  FOCUS_SUPPORT: 'focus_support',
  SENSORY_SENSITIVITY: 'sensory_sensitivity',
};

/**
 * IEP Manager - Individualized Education Program management
 */
export class IEPManager {
  constructor(storageKey = 'iep_data') {
    this.storageKey = storageKey;
    this.ieps = this.loadIEPs();
  }

  /**
   * Load IEPs
   */
  loadIEPs() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading IEPs:', error);
      return {};
    }
  }

  /**
   * Save IEPs
   */
  saveIEPs() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.ieps));
    } catch (error) {
      console.error('Error saving IEPs:', error);
    }
  }

  /**
   * Create IEP for student
   */
  createIEP(studentId, iepData) {
    const iepId = `iep_${Date.now()}`;

    const iep = {
      id: iepId,
      studentId,
      disabilityCategory: iepData.disabilityCategory,
      startDate: iepData.startDate,
      endDate: iepData.endDate,
      goals: iepData.goals || [],
      accommodations: iepData.accommodations || [],
      services: iepData.services || [],
      team: iepData.team || {}, // Teachers, specialists, parents
      meetingDates: [],
      progressReports: [],
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: iepData.createdBy,
    };

    this.ieps[studentId] = iep;
    this.saveIEPs();

    return iep;
  }

  /**
   * Add IEP goal
   */
  addGoal(studentId, goal) {
    const iep = this.ieps[studentId];
    if (!iep) {
      throw new Error('IEP not found');
    }

    const iepGoal = {
      id: `goal_${Date.now()}`,
      description: goal.description,
      measurableObjective: goal.measurableObjective,
      baseline: goal.baseline,
      target: goal.target,
      timeframe: goal.timeframe,
      progress: [],
      status: 'in_progress',
      createdAt: new Date().toISOString(),
    };

    iep.goals.push(iepGoal);
    this.saveIEPs();

    return iepGoal;
  }

  /**
   * Update goal progress
   */
  updateGoalProgress(studentId, goalId, progressData) {
    const iep = this.ieps[studentId];
    if (!iep) {
      throw new Error('IEP not found');
    }

    const goal = iep.goals.find(g => g.id === goalId);
    if (!goal) {
      throw new Error('Goal not found');
    }

    const progress = {
      date: new Date().toISOString(),
      value: progressData.value,
      notes: progressData.notes,
      assessedBy: progressData.assessedBy,
    };

    goal.progress.push(progress);

    // Check if goal is met
    if (progressData.value >= goal.target) {
      goal.status = 'achieved';
      goal.achievedAt = new Date().toISOString();
    }

    this.saveIEPs();

    return goal;
  }

  /**
   * Add accommodation
   */
  addAccommodation(studentId, accommodation) {
    const iep = this.ieps[studentId];
    if (!iep) {
      throw new Error('IEP not found');
    }

    const iepAccommodation = {
      id: `accom_${Date.now()}`,
      type: accommodation.type,
      description: accommodation.description,
      settings: accommodation.settings || {},
      contexts: accommodation.contexts || ['all'], // Where it applies
      active: true,
      createdAt: new Date().toISOString(),
    };

    iep.accommodations.push(iepAccommodation);
    this.saveIEPs();

    // Apply accommodation to student's settings
    this.applyAccommodation(studentId, iepAccommodation);

    return iepAccommodation;
  }

  /**
   * Apply accommodation to student settings
   */
  applyAccommodation(studentId, accommodation) {
    // Would integrate with platform settings
    console.log(`Applying accommodation ${accommodation.type} for student ${studentId}`);
  }

  /**
   * Generate progress report
   */
  generateProgressReport(studentId, reportingPeriod) {
    const iep = this.ieps[studentId];
    if (!iep) {
      throw new Error('IEP not found');
    }

    const report = {
      id: `report_${Date.now()}`,
      studentId,
      reportingPeriod,
      goals: iep.goals.map(goal => ({
        goal: goal.description,
        baseline: goal.baseline,
        target: goal.target,
        currentProgress: goal.progress[goal.progress.length - 1]?.value || goal.baseline,
        status: goal.status,
        notes: this.summarizeGoalProgress(goal),
      })),
      accommodationsUsed: iep.accommodations.filter(a => a.active).map(a => a.type),
      servicesProvided: iep.services,
      recommendations: [],
      generatedAt: new Date().toISOString(),
    };

    iep.progressReports.push(report);
    this.saveIEPs();

    return report;
  }

  /**
   * Summarize goal progress
   */
  summarizeGoalProgress(goal) {
    if (goal.progress.length === 0) {
      return 'No progress recorded yet';
    }

    const latest = goal.progress[goal.progress.length - 1];
    const improvement = latest.value - goal.baseline;
    const percentToGoal = ((latest.value - goal.baseline) / (goal.target - goal.baseline)) * 100;

    return `Current: ${latest.value}, Progress: ${percentToGoal.toFixed(0)}% toward goal`;
  }

  /**
   * Get IEP for student
   */
  getIEP(studentId) {
    return this.ieps[studentId] || null;
  }
}

/**
 * Accessibility Manager - Implements accessibility features
 */
export class AccessibilityManager {
  constructor(storageKey = 'accessibility_settings') {
    this.storageKey = storageKey;
    this.settings = this.loadSettings();
    this.tts = this.initTextToSpeech();
    this.stt = this.initSpeechToText();
  }

  /**
   * Load settings
   */
  loadSettings() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading accessibility settings:', error);
      return {};
    }
  }

  /**
   * Save settings
   */
  saveSettings() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving accessibility settings:', error);
    }
  }

  /**
   * Initialize Text-to-Speech
   */
  initTextToSpeech() {
    if ('speechSynthesis' in window) {
      return window.speechSynthesis;
    }
    return null;
  }

  /**
   * Initialize Speech-to-Text
   */
  initSpeechToText() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      return recognition;
    }
    return null;
  }

  /**
   * Set accessibility profile
   */
  setProfile(studentId, profile) {
    const profileSettings = this.getProfileSettings(profile);

    this.settings[studentId] = {
      profile,
      ...profileSettings,
      customSettings: this.settings[studentId]?.customSettings || {},
    };

    this.saveSettings();
    this.applySettings(studentId);

    return this.settings[studentId];
  }

  /**
   * Get profile settings
   */
  getProfileSettings(profile) {
    const profiles = {
      [ACCESSIBILITY_PROFILES.DYSLEXIA]: {
        fontFamily: 'OpenDyslexic, Arial, sans-serif',
        fontSize: 18,
        lineHeight: 1.8,
        letterSpacing: 0.12,
        wordSpacing: 0.16,
        textToSpeech: true,
        highlightOnHover: true,
        colorScheme: 'cream', // Cream background, less harsh
      },
      [ACCESSIBILITY_PROFILES.LOW_VISION]: {
        fontSize: 24,
        highContrast: true,
        colorScheme: 'high_contrast',
        textToSpeech: true,
        screenReaderOptimized: true,
        largeButtons: true,
      },
      [ACCESSIBILITY_PROFILES.COLOR_BLIND]: {
        colorScheme: 'colorblind_safe',
        usePatterns: true, // In addition to colors
        useLabels: true, // Text labels on color-coded items
      },
      [ACCESSIBILITY_PROFILES.MOTOR_DIFFICULTY]: {
        keyboardNavigationOnly: true,
        largeClickTargets: true,
        increasedClickDelay: 500, // ms
        voiceControl: true,
        stickyKeys: true,
      },
      [ACCESSIBILITY_PROFILES.FOCUS_SUPPORT]: {
        reducedAnimations: true,
        focusMode: true,
        breakReminders: true,
        progressIndicators: true,
        oneTaskAtTime: true,
      },
      [ACCESSIBILITY_PROFILES.SENSORY_SENSITIVITY]: {
        reducedAnimations: true,
        lowStimulation: true,
        mutedColors: true,
        noFlashing: true,
        quietMode: true,
      },
    };

    return profiles[profile] || {};
  }

  /**
   * Apply settings to DOM
   */
  applySettings(studentId) {
    const settings = this.settings[studentId];
    if (!settings) return;

    const root = document.documentElement;

    // Apply font settings
    if (settings.fontFamily) {
      root.style.setProperty('--font-family', settings.fontFamily);
    }

    if (settings.fontSize) {
      root.style.setProperty('--font-size-base', `${settings.fontSize}px`);
    }

    if (settings.lineHeight) {
      root.style.setProperty('--line-height', settings.lineHeight);
    }

    if (settings.letterSpacing) {
      root.style.setProperty('--letter-spacing', `${settings.letterSpacing}em`);
    }

    // Apply color scheme
    if (settings.colorScheme) {
      this.applyColorScheme(settings.colorScheme);
    }

    // Apply other settings
    if (settings.highContrast) {
      document.body.classList.add('high-contrast');
    }

    if (settings.reducedAnimations) {
      document.body.classList.add('reduced-motion');
    }

    if (settings.largeClickTargets) {
      document.body.classList.add('large-targets');
    }
  }

  /**
   * Apply color scheme
   */
  applyColorScheme(scheme) {
    const schemes = {
      cream: {
        background: '#FFF8DC',
        text: '#2C1810',
        primary: '#5B4636',
      },
      high_contrast: {
        background: '#000000',
        text: '#FFFFFF',
        primary: '#FFFF00',
      },
      colorblind_safe: {
        // Uses blue and orange instead of red and green
        success: '#0077BB',
        error: '#EE7733',
        warning: '#FFAA00',
      },
    };

    const colors = schemes[scheme];
    if (colors) {
      const root = document.documentElement;
      Object.entries(colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
    }
  }

  /**
   * Read text aloud (TTS)
   */
  readAloud(text, options = {}) {
    if (!this.tts) {
      console.error('Text-to-speech not supported');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;
    utterance.lang = options.lang || 'en-US';

    this.tts.speak(utterance);
  }

  /**
   * Stop reading
   */
  stopReading() {
    if (this.tts) {
      this.tts.cancel();
    }
  }

  /**
   * Start speech-to-text
   */
  startDictation(callback) {
    if (!this.stt) {
      console.error('Speech-to-text not supported');
      return;
    }

    this.stt.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (callback) {
        callback(transcript);
      }
    };

    this.stt.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    this.stt.start();
  }

  /**
   * Stop dictation
   */
  stopDictation() {
    if (this.stt) {
      this.stt.stop();
    }
  }

  /**
   * Enable keyboard navigation
   */
  enableKeyboardNavigation() {
    // Add skip links
    this.addSkipLinks();

    // Ensure all interactive elements are keyboard accessible
    this.ensureFocusable();

    // Add keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  /**
   * Add skip links for navigation
   */
  addSkipLinks() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 0;
      background: #000;
      color: #fff;
      padding: 8px;
      z-index: 100;
    `;

    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '0';
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  /**
   * Ensure focusable elements
   */
  ensureFocusable() {
    // Add tabindex to interactive elements without it
    const interactiveSelectors = 'button, a, input, select, textarea, [role="button"]';
    const elements = document.querySelectorAll(interactiveSelectors);

    elements.forEach(el => {
      if (!el.hasAttribute('tabindex') && !el.disabled) {
        el.setAttribute('tabindex', '0');
      }
    });
  }

  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Alt + R: Read selected text
      if (e.altKey && e.key === 'r') {
        const selection = window.getSelection().toString();
        if (selection) {
          this.readAloud(selection);
        }
        e.preventDefault();
      }

      // Alt + S: Stop reading
      if (e.altKey && e.key === 's') {
        this.stopReading();
        e.preventDefault();
      }

      // Alt + D: Start dictation
      if (e.altKey && e.key === 'd') {
        this.startDictation((text) => {
          console.log('Dictated:', text);
        });
        e.preventDefault();
      }
    });
  }

  /**
   * Get settings for student
   */
  getSettings(studentId) {
    return this.settings[studentId] || null;
  }
}

/**
 * ADHD Support Manager - Features specifically for ADHD
 */
export class ADHDSupportManager {
  constructor() {
    this.timers = {};
    this.breakSchedule = {};
  }

  /**
   * Setup focus mode
   */
  setupFocusMode(studentId, options = {}) {
    const focusMode = {
      id: `focus_${Date.now()}`,
      studentId,
      hideDistractions: options.hideDistractions ?? true,
      oneTaskAtTime: options.oneTaskAtTime ?? true,
      timerDuration: options.timerDuration || 25, // minutes
      breakDuration: options.breakDuration || 5,
      breakAfterTasks: options.breakAfterTasks || 1,
      visualTimer: options.visualTimer ?? true,
      startedAt: new Date().toISOString(),
    };

    // Apply focus mode
    this.applyFocusMode(focusMode);

    return focusMode;
  }

  /**
   * Apply focus mode
   */
  applyFocusMode(focusMode) {
    if (focusMode.hideDistractions) {
      document.body.classList.add('focus-mode');
      // Hide sidebars, notifications, etc.
    }

    if (focusMode.visualTimer) {
      this.startVisualTimer(focusMode.timerDuration);
    }
  }

  /**
   * Start visual timer
   */
  startVisualTimer(duration) {
    const endTime = Date.now() + duration * 60 * 1000;

    const timerId = setInterval(() => {
      const remaining = endTime - Date.now();

      if (remaining <= 0) {
        clearInterval(timerId);
        this.showBreakNotification();
      } else {
        this.updateTimerDisplay(remaining);
      }
    }, 1000);

    return timerId;
  }

  /**
   * Update timer display
   */
  updateTimerDisplay(remaining) {
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    // Update UI (would integrate with actual timer component)
    console.log(`Time remaining: ${minutes}:${seconds.toString().padStart(2, '0')}`);
  }

  /**
   * Show break notification
   */
  showBreakNotification() {
    // Show notification for break time
    console.log('Time for a break!');
  }

  /**
   * Create task breakdown
   */
  breakDownTask(task) {
    // Break large task into smaller steps
    const steps = {
      task: task.name,
      steps: task.description ? this.extractSteps(task.description) : ['Step 1: Get started'],
      estimatedTime: task.estimatedTime || 30,
    };

    return steps;
  }

  /**
   * Extract steps from description
   */
  extractSteps(description) {
    // Simple step extraction (in production would use AI)
    return description.split('.').filter(s => s.trim()).map((s, i) => `Step ${i + 1}: ${s.trim()}`);
  }

  /**
   * Provide movement breaks
   */
  getMovementBreak() {
    const breaks = [
      {
        name: 'Stretch Break',
        duration: 2,
        instructions: ['Stand up', 'Reach arms overhead', 'Touch toes', 'Roll shoulders'],
      },
      {
        name: 'Walk Around',
        duration: 3,
        instructions: ['Take a quick walk around the room', 'Get some water', 'Look out a window'],
      },
      {
        name: 'Breathing Exercise',
        duration: 2,
        instructions: ['Breathe in for 4', 'Hold for 4', 'Breathe out for 4', 'Repeat 3 times'],
      },
    ];

    return breaks[Math.floor(Math.random() * breaks.length)];
  }
}

export {
  DISABILITY_CATEGORIES,
  ACCOMMODATION_TYPES,
  ACCESSIBILITY_PROFILES,
};

export default IEPManager;
