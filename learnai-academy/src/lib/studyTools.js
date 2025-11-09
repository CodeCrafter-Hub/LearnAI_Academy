/**
 * Study Timer and Focus Tools
 * Pomodoro timer, focus mode, break management, productivity tracking
 */

/**
 * Timer presets
 */
const TIMER_PRESETS = {
  pomodoro: {
    name: 'Pomodoro',
    icon: '🍅',
    workDuration: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsBeforeLongBreak: 4,
  },
  shortSession: {
    name: 'Quick Study',
    icon: '⚡',
    workDuration: 15,
    shortBreak: 3,
    longBreak: 10,
    sessionsBeforeLongBreak: 3,
  },
  longSession: {
    name: 'Deep Focus',
    icon: '🎯',
    workDuration: 50,
    shortBreak: 10,
    longBreak: 30,
    sessionsBeforeLongBreak: 2,
  },
  custom: {
    name: 'Custom',
    icon: '⚙️',
    workDuration: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsBeforeLongBreak: 4,
  },
};

/**
 * Focus modes
 */
const FOCUS_MODES = {
  minimal: {
    name: 'Minimal',
    hideNotifications: true,
    hideDistractions: false,
    dimBackground: false,
    playAmbient: false,
  },
  focused: {
    name: 'Focused',
    hideNotifications: true,
    hideDistractions: true,
    dimBackground: true,
    playAmbient: false,
  },
  immersive: {
    name: 'Immersive',
    hideNotifications: true,
    hideDistractions: true,
    dimBackground: true,
    playAmbient: true,
  },
};

/**
 * Ambient sounds
 */
const AMBIENT_SOUNDS = {
  rain: { name: 'Rain', icon: '🌧️', file: '/sounds/rain.mp3' },
  ocean: { name: 'Ocean Waves', icon: '🌊', file: '/sounds/ocean.mp3' },
  forest: { name: 'Forest', icon: '🌲', file: '/sounds/forest.mp3' },
  cafe: { name: 'Coffee Shop', icon: '☕', file: '/sounds/cafe.mp3' },
  whiteNoise: { name: 'White Noise', icon: '📻', file: '/sounds/whitenoise.mp3' },
  lofi: { name: 'Lo-Fi Beats', icon: '🎵', file: '/sounds/lofi.mp3' },
};

/**
 * StudyTimer
 * Flexible timer with Pomodoro support
 */
export class StudyTimer {
  constructor() {
    this.sessions = new Map();
    this.activeTimer = null;
    this.timerInterval = null;
  }

  /**
   * Start timer session
   */
  startSession(studentId, preset = 'pomodoro', customSettings = {}) {
    // Stop any existing timer
    if (this.activeTimer) {
      this.pauseTimer();
    }

    const presetConfig = TIMER_PRESETS[preset] || TIMER_PRESETS.pomodoro;
    const settings = { ...presetConfig, ...customSettings };

    const session = {
      id: this.generateSessionId(),
      studentId,
      preset,
      settings,
      startTime: new Date().toISOString(),
      endTime: null,

      // State
      currentPhase: 'work', // work, shortBreak, longBreak
      sessionCount: 0,
      completedPomodoros: 0,

      // Timer
      timeRemaining: settings.workDuration * 60, // Convert to seconds
      isPaused: false,
      isComplete: false,

      // Stats
      totalWorkTime: 0,
      totalBreakTime: 0,
      interruptions: 0,

      // History
      phaseHistory: [],
    };

    this.sessions.set(session.id, session);
    this.activeTimer = session.id;

    this.startTimer(session.id);

    return session;
  }

  /**
   * Start countdown timer
   */
  startTimer(sessionId) {
    const session = this.sessions.get(sessionId);

    if (!session) return;

    session.isPaused = false;

    // Clear existing interval
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    // Start countdown
    this.timerInterval = setInterval(() => {
      this.tick(sessionId);
    }, 1000);
  }

  /**
   * Timer tick
   */
  tick(sessionId) {
    const session = this.sessions.get(sessionId);

    if (!session || session.isPaused) return;

    session.timeRemaining--;

    // Track time
    if (session.currentPhase === 'work') {
      session.totalWorkTime++;
    } else {
      session.totalBreakTime++;
    }

    // Check if phase complete
    if (session.timeRemaining <= 0) {
      this.completePhase(sessionId);
    }
  }

  /**
   * Complete current phase
   */
  completePhase(sessionId) {
    const session = this.sessions.get(sessionId);

    if (!session) return;

    // Record phase completion
    session.phaseHistory.push({
      phase: session.currentPhase,
      completedAt: new Date().toISOString(),
      duration: session.currentPhase === 'work'
        ? session.settings.workDuration
        : session.currentPhase === 'shortBreak'
        ? session.settings.shortBreak
        : session.settings.longBreak,
    });

    // Determine next phase
    if (session.currentPhase === 'work') {
      session.completedPomodoros++;
      session.sessionCount++;

      // Check if time for long break
      if (session.sessionCount % session.settings.sessionsBeforeLongBreak === 0) {
        this.startPhase(sessionId, 'longBreak');
      } else {
        this.startPhase(sessionId, 'shortBreak');
      }
    } else {
      // Break complete, back to work
      this.startPhase(sessionId, 'work');
    }

    // Trigger notification/sound
    this.onPhaseComplete(session);
  }

  /**
   * Start new phase
   */
  startPhase(sessionId, phase) {
    const session = this.sessions.get(sessionId);

    if (!session) return;

    session.currentPhase = phase;

    // Set time for new phase
    if (phase === 'work') {
      session.timeRemaining = session.settings.workDuration * 60;
    } else if (phase === 'shortBreak') {
      session.timeRemaining = session.settings.shortBreak * 60;
    } else if (phase === 'longBreak') {
      session.timeRemaining = session.settings.longBreak * 60;
    }

    // Auto-pause on break start (optional)
    if (phase !== 'work' && session.settings.autoPauseBreaks) {
      this.pauseTimer();
    }
  }

  /**
   * Pause timer
   */
  pauseTimer() {
    if (!this.activeTimer) return;

    const session = this.sessions.get(this.activeTimer);
    if (session) {
      session.isPaused = true;
    }

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * Resume timer
   */
  resumeTimer() {
    if (!this.activeTimer) return;

    this.startTimer(this.activeTimer);
  }

  /**
   * Skip current phase
   */
  skipPhase() {
    if (!this.activeTimer) return;

    this.completePhase(this.activeTimer);
  }

  /**
   * Record interruption
   */
  recordInterruption(sessionId) {
    const session = this.sessions.get(sessionId);

    if (session) {
      session.interruptions++;
    }
  }

  /**
   * End session
   */
  endSession(sessionId) {
    const session = this.sessions.get(sessionId);

    if (!session) return null;

    session.endTime = new Date().toISOString();
    session.isComplete = true;

    if (this.activeTimer === sessionId) {
      this.pauseTimer();
      this.activeTimer = null;
    }

    return this.getSessionSummary(sessionId);
  }

  /**
   * Get session summary
   */
  getSessionSummary(sessionId) {
    const session = this.sessions.get(sessionId);

    if (!session) return null;

    const duration = session.totalWorkTime + session.totalBreakTime;

    return {
      sessionId: session.id,
      completedPomodoros: session.completedPomodoros,
      totalWorkTime: session.totalWorkTime,
      totalBreakTime: session.totalBreakTime,
      totalTime: duration,
      interruptions: session.interruptions,
      efficiency: session.interruptions > 0
        ? Math.max(0, 100 - (session.interruptions * 10))
        : 100,
      startTime: session.startTime,
      endTime: session.endTime,
    };
  }

  /**
   * Get active session
   */
  getActiveSession() {
    if (!this.activeTimer) return null;

    return this.sessions.get(this.activeTimer);
  }

  /**
   * Format time
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Phase complete callback (override for notifications)
   */
  onPhaseComplete(session) {
    // Override this method to add custom behavior
    console.log(`Phase ${session.currentPhase} complete!`);
  }

  /**
   * Generate session ID
   */
  generateSessionId() {
    return `timer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * FocusModeManager
 * Manages focus mode and distractions
 */
export class FocusModeManager {
  constructor() {
    this.currentMode = null;
    this.ambientSound = null;
    this.blockedSites = new Set();
    this.customSettings = null;
  }

  /**
   * Enable focus mode
   */
  enableFocusMode(mode = 'focused', customSettings = {}) {
    const modeConfig = FOCUS_MODES[mode] || FOCUS_MODES.focused;
    this.currentMode = mode;
    this.customSettings = { ...modeConfig, ...customSettings };

    this.applyFocusMode();

    return {
      mode,
      settings: this.customSettings,
      startedAt: new Date().toISOString(),
    };
  }

  /**
   * Apply focus mode settings
   */
  applyFocusMode() {
    if (!this.customSettings) return;

    // Hide notifications
    if (this.customSettings.hideNotifications) {
      this.hideNotifications();
    }

    // Hide distractions
    if (this.customSettings.hideDistractions) {
      this.hideDistractions();
    }

    // Dim background
    if (this.customSettings.dimBackground) {
      this.dimBackground();
    }

    // Play ambient sound
    if (this.customSettings.playAmbient && this.ambientSound) {
      this.playAmbientSound(this.ambientSound);
    }
  }

  /**
   * Disable focus mode
   */
  disableFocusMode() {
    this.currentMode = null;
    this.customSettings = null;

    // Restore normal mode
    this.restoreNormalMode();

    return {
      disabled: true,
      endedAt: new Date().toISOString(),
    };
  }

  /**
   * Set ambient sound
   */
  setAmbientSound(soundKey) {
    this.ambientSound = soundKey;

    if (this.currentMode && this.customSettings?.playAmbient) {
      this.playAmbientSound(soundKey);
    }
  }

  /**
   * Block website
   */
  blockSite(url) {
    this.blockedSites.add(url);
  }

  /**
   * Unblock website
   */
  unblockSite(url) {
    this.blockedSites.delete(url);
  }

  /**
   * Check if site is blocked
   */
  isSiteBlocked(url) {
    return this.blockedSites.has(url);
  }

  /**
   * Implementation methods (browser-specific)
   */
  hideNotifications() {
    if (typeof document !== 'undefined') {
      document.body.classList.add('focus-mode-notifications-hidden');
    }
  }

  hideDistractions() {
    if (typeof document !== 'undefined') {
      document.body.classList.add('focus-mode-distractions-hidden');
    }
  }

  dimBackground() {
    if (typeof document !== 'undefined') {
      document.body.classList.add('focus-mode-dim-background');
    }
  }

  playAmbientSound(soundKey) {
    const sound = AMBIENT_SOUNDS[soundKey];
    if (sound && typeof Audio !== 'undefined') {
      // In production, create and play audio
      console.log(`Playing ambient sound: ${sound.name}`);
    }
  }

  restoreNormalMode() {
    if (typeof document !== 'undefined') {
      document.body.classList.remove(
        'focus-mode-notifications-hidden',
        'focus-mode-distractions-hidden',
        'focus-mode-dim-background'
      );
    }
  }
}

/**
 * ProductivityTracker
 * Tracks study productivity and provides insights
 */
export class ProductivityTracker {
  constructor(storage = 'localStorage') {
    this.storage = storage;
    this.sessions = [];
    this.loadData();
  }

  /**
   * Record study session
   */
  recordSession(sessionData) {
    const {
      studentId,
      subject,
      duration, // minutes
      pomodoros = 0,
      interruptions = 0,
      focusScore = 0,
      tasksCompleted = 0,
      date = new Date().toISOString(),
    } = sessionData;

    const session = {
      id: this.generateId(),
      studentId,
      subject,
      duration,
      pomodoros,
      interruptions,
      focusScore,
      tasksCompleted,
      date,
      dayOfWeek: new Date(date).getDay(),
      timeOfDay: this.getTimeOfDay(date),
    };

    this.sessions.push(session);
    this.saveData();

    return session;
  }

  /**
   * Get productivity stats
   */
  getProductivityStats(studentId, days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentSessions = this.sessions.filter(
      (s) =>
        s.studentId === studentId &&
        new Date(s.date) >= cutoffDate
    );

    if (recentSessions.length === 0) {
      return this.getEmptyStats();
    }

    // Calculate stats
    const totalSessions = recentSessions.length;
    const totalMinutes = recentSessions.reduce((sum, s) => sum + s.duration, 0);
    const totalPomodoros = recentSessions.reduce((sum, s) => sum + s.pomodoros, 0);
    const totalInterruptions = recentSessions.reduce((sum, s) => sum + s.interruptions, 0);
    const avgFocusScore = recentSessions.reduce((sum, s) => sum + s.focusScore, 0) / totalSessions;

    // Most productive time
    const timeOfDayStats = this.analyzeTimeOfDay(recentSessions);
    const bestTime = Object.entries(timeOfDayStats).sort((a, b) => b[1].avgFocus - a[1].avgFocus)[0];

    // Most productive day
    const dayStats = this.analyzeDayOfWeek(recentSessions);
    const bestDay = Object.entries(dayStats).sort((a, b) => b[1].avgFocus - a[1].avgFocus)[0];

    // Streak calculation
    const streak = this.calculateStreak(recentSessions);

    return {
      totalSessions,
      totalMinutes,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      avgSessionDuration: Math.round(totalMinutes / totalSessions),
      totalPomodoros,
      avgFocusScore: Math.round(avgFocusScore),
      totalInterruptions,
      avgInterruptionsPerSession: Math.round(totalInterruptions / totalSessions * 10) / 10,
      mostProductiveTime: bestTime ? bestTime[0] : 'morning',
      mostProductiveDay: bestDay ? this.getDayName(parseInt(bestDay[0])) : 'Monday',
      currentStreak: streak,
      sessionsPerDay: Math.round(totalSessions / days * 10) / 10,
    };
  }

  /**
   * Analyze time of day productivity
   */
  analyzeTimeOfDay(sessions) {
    const stats = {
      morning: { count: 0, totalFocus: 0, avgFocus: 0 },
      afternoon: { count: 0, totalFocus: 0, avgFocus: 0 },
      evening: { count: 0, totalFocus: 0, avgFocus: 0 },
      night: { count: 0, totalFocus: 0, avgFocus: 0 },
    };

    sessions.forEach((s) => {
      const timeOfDay = s.timeOfDay;
      stats[timeOfDay].count++;
      stats[timeOfDay].totalFocus += s.focusScore;
    });

    Object.keys(stats).forEach((time) => {
      if (stats[time].count > 0) {
        stats[time].avgFocus = stats[time].totalFocus / stats[time].count;
      }
    });

    return stats;
  }

  /**
   * Analyze day of week productivity
   */
  analyzeDayOfWeek(sessions) {
    const stats = {};

    for (let i = 0; i < 7; i++) {
      stats[i] = { count: 0, totalFocus: 0, avgFocus: 0 };
    }

    sessions.forEach((s) => {
      stats[s.dayOfWeek].count++;
      stats[s.dayOfWeek].totalFocus += s.focusScore;
    });

    Object.keys(stats).forEach((day) => {
      if (stats[day].count > 0) {
        stats[day].avgFocus = stats[day].totalFocus / stats[day].count;
      }
    });

    return stats;
  }

  /**
   * Calculate study streak
   */
  calculateStreak(sessions) {
    if (sessions.length === 0) return 0;

    // Sort by date
    const sorted = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date));

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const session of sorted) {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }

      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  }

  /**
   * Get time of day from date
   */
  getTimeOfDay(date) {
    const hour = new Date(date).getHours();

    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  /**
   * Get day name
   */
  getDayName(day) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  }

  /**
   * Get empty stats
   */
  getEmptyStats() {
    return {
      totalSessions: 0,
      totalMinutes: 0,
      totalHours: 0,
      avgSessionDuration: 0,
      totalPomodoros: 0,
      avgFocusScore: 0,
      totalInterruptions: 0,
      avgInterruptionsPerSession: 0,
      mostProductiveTime: 'Not enough data',
      mostProductiveDay: 'Not enough data',
      currentStreak: 0,
      sessionsPerDay: 0,
    };
  }

  /**
   * Generate ID
   */
  generateId() {
    return `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  loadData() {
    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const data = localStorage.getItem('learnai_productivity');
        if (data) {
          const parsed = JSON.parse(data);
          this.sessions = parsed.sessions || [];
        }
      }
    } catch (error) {
      console.error('Error loading productivity data:', error);
    }
  }

  saveData() {
    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const data = {
          sessions: this.sessions,
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem('learnai_productivity', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error saving productivity data:', error);
    }
  }

  clearData() {
    this.sessions = [];
    if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('learnai_productivity');
    }
  }
}

/**
 * Example Usage
 */

/*
// Study Timer
const timer = new StudyTimer();
const session = timer.startSession('student123', 'pomodoro');

console.log('Timer started:', session.id);
console.log('Time remaining:', timer.formatTime(session.timeRemaining));

// Pause/Resume
timer.pauseTimer();
timer.resumeTimer();

// Skip phase
timer.skipPhase();

// End session
const summary = timer.endSession(session.id);
console.log('Completed pomodoros:', summary.completedPomodoros);
console.log('Total work time:', summary.totalWorkTime, 'seconds');

// Focus Mode
const focusManager = new FocusModeManager();
focusManager.enableFocusMode('immersive');
focusManager.setAmbientSound('rain');
focusManager.blockSite('facebook.com');

// Later...
focusManager.disableFocusMode();

// Productivity Tracking
const tracker = new ProductivityTracker();
tracker.recordSession({
  studentId: 'student123',
  subject: 'math',
  duration: 25,
  pomodoros: 1,
  interruptions: 0,
  focusScore: 95,
  tasksCompleted: 3,
});

const stats = tracker.getProductivityStats('student123', 30);
console.log('Productivity stats:', stats);
console.log('Most productive time:', stats.mostProductiveTime);
console.log('Study streak:', stats.currentStreak, 'days');
*/

export {
  StudyTimer,
  FocusModeManager,
  ProductivityTracker,
  TIMER_PRESETS,
  FOCUS_MODES,
  AMBIENT_SOUNDS,
};
