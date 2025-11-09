/**
 * Adaptive Difficulty System
 * Adjusts content difficulty based on grade level and student performance
 */

/**
 * Difficulty Levels
 */
export const DIFFICULTY_LEVELS = {
  VERY_EASY: 1,
  EASY: 2,
  MEDIUM: 3,
  CHALLENGING: 4,
  HARD: 5,
  VERY_HARD: 6,
  ADVANCED: 7,
  EXPERT: 8,
  MASTERY: 9,
  GENIUS: 10,
};

/**
 * Grade-Based Difficulty Ranges
 */
export const GRADE_DIFFICULTY_RANGES = {
  // Kindergarten - Grade 2
  EARLY_ELEMENTARY: {
    grades: [0, 1, 2],
    startingDifficulty: 1,
    minDifficulty: 1,
    maxDifficulty: 3,
    progressionRate: 'slow', // How quickly difficulty increases
    supportLevel: 'high', // Amount of guidance provided
    attentionSpan: 15, // minutes
    successThreshold: 0.7, // 70% to advance
  },

  // Grades 3-5
  UPPER_ELEMENTARY: {
    grades: [3, 4, 5],
    startingDifficulty: 3,
    minDifficulty: 2,
    maxDifficulty: 5,
    progressionRate: 'moderate',
    supportLevel: 'medium',
    attentionSpan: 25,
    successThreshold: 0.75,
  },

  // Grades 6-8
  MIDDLE_SCHOOL: {
    grades: [6, 7, 8],
    startingDifficulty: 4,
    minDifficulty: 3,
    maxDifficulty: 7,
    progressionRate: 'moderate',
    supportLevel: 'low',
    attentionSpan: 35,
    successThreshold: 0.8,
  },

  // Grades 9-12
  HIGH_SCHOOL: {
    grades: [9, 10, 11, 12],
    startingDifficulty: 6,
    minDifficulty: 5,
    maxDifficulty: 10,
    progressionRate: 'fast',
    supportLevel: 'minimal',
    attentionSpan: 45,
    successThreshold: 0.85,
  },
};

/**
 * Performance Tracking
 */
export class PerformanceTracker {
  constructor(gradeLevel, subject) {
    this.gradeLevel = gradeLevel;
    this.subject = subject;
    this.history = [];
    this.currentDifficulty = this.getStartingDifficulty();
    this.consecutiveCorrect = 0;
    this.consecutiveIncorrect = 0;
    this.sessionStartTime = Date.now();
  }

  getStartingDifficulty() {
    const range = this.getGradeRange();
    return range.startingDifficulty;
  }

  getGradeRange() {
    if (this.gradeLevel <= 2) return GRADE_DIFFICULTY_RANGES.EARLY_ELEMENTARY;
    if (this.gradeLevel <= 5) return GRADE_DIFFICULTY_RANGES.UPPER_ELEMENTARY;
    if (this.gradeLevel <= 8) return GRADE_DIFFICULTY_RANGES.MIDDLE_SCHOOL;
    return GRADE_DIFFICULTY_RANGES.HIGH_SCHOOL;
  }

  /**
   * Record student response and adjust difficulty
   */
  recordResponse(correct, timeSpent, difficulty) {
    const response = {
      correct,
      timeSpent,
      difficulty,
      timestamp: Date.now(),
    };

    this.history.push(response);

    if (correct) {
      this.consecutiveCorrect++;
      this.consecutiveIncorrect = 0;
    } else {
      this.consecutiveIncorrect++;
      this.consecutiveCorrect = 0;
    }

    this.adjustDifficulty();

    return {
      newDifficulty: this.currentDifficulty,
      feedback: this.generateFeedback(),
      encouragement: this.generateEncouragement(),
    };
  }

  /**
   * Adjust difficulty based on performance
   */
  adjustDifficulty() {
    const range = this.getGradeRange();
    const recentPerformance = this.getRecentPerformance(5);

    // Increase difficulty if doing well
    if (this.consecutiveCorrect >= this.getConsecutiveThreshold('increase')) {
      if (this.currentDifficulty < range.maxDifficulty) {
        this.currentDifficulty++;
        this.consecutiveCorrect = 0;
      }
    }

    // Decrease difficulty if struggling
    else if (this.consecutiveIncorrect >= this.getConsecutiveThreshold('decrease')) {
      if (this.currentDifficulty > range.minDifficulty) {
        this.currentDifficulty--;
        this.consecutiveIncorrect = 0;
      }
    }

    // Also check recent performance trend
    else if (this.history.length >= 10) {
      if (recentPerformance > 0.9 && this.currentDifficulty < range.maxDifficulty) {
        this.currentDifficulty++;
      } else if (recentPerformance < 0.5 && this.currentDifficulty > range.minDifficulty) {
        this.currentDifficulty--;
      }
    }
  }

  /**
   * Get consecutive threshold based on grade and progression rate
   */
  getConsecutiveThreshold(type) {
    const range = this.getGradeRange();

    if (type === 'increase') {
      // More correct answers needed for younger students
      if (range.progressionRate === 'slow') return 5;
      if (range.progressionRate === 'moderate') return 4;
      return 3; // fast progression
    } else {
      // decrease threshold
      if (range.progressionRate === 'slow') return 3;
      if (range.progressionRate === 'moderate') return 3;
      return 2;
    }
  }

  /**
   * Calculate recent performance
   */
  getRecentPerformance(count = 10) {
    const recent = this.history.slice(-count);
    if (recent.length === 0) return 0;

    const correct = recent.filter((r) => r.correct).length;
    return correct / recent.length;
  }

  /**
   * Get overall statistics
   */
  getStatistics() {
    const totalAttempts = this.history.length;
    const correctAttempts = this.history.filter((r) => r.correct).length;
    const accuracy = totalAttempts > 0 ? correctAttempts / totalAttempts : 0;

    const avgTimePerQuestion =
      totalAttempts > 0
        ? this.history.reduce((sum, r) => sum + r.timeSpent, 0) / totalAttempts
        : 0;

    const sessionDuration = (Date.now() - this.sessionStartTime) / 1000 / 60; // minutes

    return {
      totalAttempts,
      correctAttempts,
      accuracy: Math.round(accuracy * 100),
      avgTimePerQuestion: Math.round(avgTimePerQuestion),
      sessionDuration: Math.round(sessionDuration),
      currentDifficulty: this.currentDifficulty,
      currentStreak: this.consecutiveCorrect,
    };
  }

  /**
   * Generate adaptive feedback based on performance
   */
  generateFeedback() {
    const range = this.getGradeRange();
    const recentPerformance = this.getRecentPerformance(5);

    if (recentPerformance >= 0.9) {
      return {
        message: this.getFeedbackMessage('excellent', range),
        action: 'increasing_difficulty',
        emoji: '🌟',
      };
    } else if (recentPerformance >= 0.7) {
      return {
        message: this.getFeedbackMessage('good', range),
        action: 'maintaining',
        emoji: '👍',
      };
    } else if (recentPerformance >= 0.5) {
      return {
        message: this.getFeedbackMessage('needs_practice', range),
        action: 'reviewing',
        emoji: '💪',
      };
    } else {
      return {
        message: this.getFeedbackMessage('struggling', range),
        action: 'decreasing_difficulty',
        emoji: '🎯',
      };
    }
  }

  /**
   * Get age-appropriate feedback message
   */
  getFeedbackMessage(type, range) {
    const messages = {
      excellent: {
        high: [
          "Wow! You're doing AMAZING! Let's try something a bit harder!",
          "Super job! You're ready for a bigger challenge!",
          "You're a superstar! Time to level up!",
        ],
        medium: [
          "Excellent work! You're ready for more challenging problems!",
          "Great job! Let's increase the difficulty a bit!",
          "You're doing fantastic! Time for the next level!",
        ],
        low: [
          "Excellent performance! Advancing to more challenging material.",
          "Great work! Increasing difficulty level.",
          "Well done! Moving to harder problems.",
        ],
        minimal: [
          "Excellent. Advancing difficulty.",
          "Strong performance. Increasing challenge level.",
          "Well done. Proceeding to advanced material.",
        ],
      },
      good: {
        high: [
          "You're doing great! Keep up the good work!",
          "Nice job! You're learning so well!",
          "Awesome! You've got this!",
        ],
        medium: [
          "Good work! You're making great progress!",
          "Well done! Keep practicing like this!",
          "Nice job! You're on the right track!",
        ],
        low: [
          "Good work. Continue at this pace.",
          "Well done. Maintaining current level.",
          "Solid performance. Keep it up.",
        ],
        minimal: [
          "Good. Maintaining level.",
          "Adequate progress.",
          "Continuing current difficulty.",
        ],
      },
      needs_practice: {
        high: [
          "You're trying so hard! Let's practice a bit more!",
          "Keep going! You're getting better!",
          "Don't give up! You can do this!",
        ],
        medium: [
          "Let's review these concepts a bit more.",
          "Good effort! More practice will help.",
          "Keep working at it! You're improving!",
        ],
        low: [
          "Additional practice recommended.",
          "Review these concepts before advancing.",
          "Focus on mastering current material.",
        ],
        minimal: [
          "Review recommended.",
          "Additional practice needed.",
          "Consolidate current concepts.",
        ],
      },
      struggling: {
        high: [
          "Let's make this easier so you can succeed!",
          "No worries! We'll try something simpler!",
          "You're doing your best! Let's go back a step!",
        ],
        medium: [
          "Let's review some easier problems first.",
          "We'll adjust the difficulty to help you learn better.",
          "No problem! Let's try a different approach.",
        ],
        low: [
          "Adjusting to more appropriate difficulty level.",
          "Reviewing foundational concepts.",
          "Decreasing complexity to build confidence.",
        ],
        minimal: [
          "Decreasing difficulty.",
          "Reviewing prerequisites.",
          "Adjusting to lower level.",
        ],
      },
    };

    const supportLevel = range.supportLevel;
    const options = messages[type][supportLevel];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Generate encouragement based on current state
   */
  generateEncouragement() {
    const stats = this.getStatistics();
    const range = this.getGradeRange();

    if (stats.currentStreak >= 5) {
      return this.getStreakEncouragement(stats.currentStreak, range);
    } else if (stats.accuracy >= 80) {
      return this.getAccuracyEncouragement(stats.accuracy, range);
    } else if (stats.totalAttempts >= 10) {
      return this.getPersistenceEncouragement(range);
    }

    return null;
  }

  getStreakEncouragement(streak, range) {
    const messages = {
      high: [
        `🔥 WOW! ${streak} in a row! You're on FIRE! 🔥`,
        `⭐ ${streak} correct! You're a SUPERSTAR! ⭐`,
        `🎉 Amazing! ${streak} perfect answers! 🎉`,
      ],
      medium: [
        `🔥 Great streak! ${streak} correct in a row!`,
        `⭐ Excellent! ${streak} consecutive correct answers!`,
        `🎯 You're on a roll! ${streak} in a row!`,
      ],
      low: [
        `Streak: ${streak} correct`,
        `Strong performance: ${streak} consecutive correct`,
        `Current streak: ${streak}`,
      ],
      minimal: [
        `Streak: ${streak}`,
        `Consecutive correct: ${streak}`,
        `${streak} in a row`,
      ],
    };

    const options = messages[range.supportLevel];
    return options[Math.floor(Math.random() * options.length)];
  }

  getAccuracyEncouragement(accuracy, range) {
    const messages = {
      high: [
        `🌟 You got ${accuracy}% right! That's AMAZING! 🌟`,
        `✨ Wow! ${accuracy}% correct! You're doing so great! ✨`,
        `🎊 ${accuracy}% - You're a learning champion! 🎊`,
      ],
      medium: [
        `Great job! ${accuracy}% accuracy!`,
        `Excellent work! ${accuracy}% correct!`,
        `Well done! ${accuracy}% success rate!`,
      ],
      low: [
        `${accuracy}% accuracy - well done`,
        `Strong performance: ${accuracy}% correct`,
        `Current accuracy: ${accuracy}%`,
      ],
      minimal: [
        `Accuracy: ${accuracy}%`,
        `${accuracy}% correct`,
        `Success rate: ${accuracy}%`,
      ],
    };

    const options = messages[range.supportLevel];
    return options[Math.floor(Math.random() * options.length)];
  }

  getPersistenceEncouragement(range) {
    const messages = {
      high: [
        "💪 You're working so hard! Keep it up! 💪",
        "🌈 I'm so proud of your effort! 🌈",
        "⭐ You never give up! That's awesome! ⭐",
      ],
      medium: [
        "Great persistence! Keep working hard!",
        "Your effort is paying off!",
        "Excellent dedication to learning!",
      ],
      low: [
        "Good persistence",
        "Consistent effort noted",
        "Continuing progress",
      ],
      minimal: [
        "Persistent effort",
        "Ongoing work",
        "Continued practice",
      ],
    };

    const options = messages[range.supportLevel];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Determine if break is recommended
   */
  shouldTakeBreak() {
    const sessionDuration = (Date.now() - this.sessionStartTime) / 1000 / 60;
    const range = this.getGradeRange();

    return sessionDuration >= range.attentionSpan;
  }

  /**
   * Get break recommendation message
   */
  getBreakMessage() {
    const range = this.getGradeRange();

    const messages = {
      high: [
        "🎮 Great job! Time for a fun break! Stretch and get some water! 🥤",
        "⭐ You've worked so hard! Let's take a break and play! 🎨",
        "🌈 Break time! Go run around or have a snack! 🍎",
      ],
      medium: [
        "Good work! Time for a 5-minute break. Stretch and relax! 🧘",
        "Well done! Take a break - get some water and move around! 💧",
        "Nice session! Rest your brain for a few minutes! 🧠",
      ],
      low: [
        "Break recommended. Session duration reached.",
        "Consider taking a 5-10 minute break.",
        "Optimal learning: take a short break now.",
      ],
      minimal: [
        "Break recommended",
        "Session duration reached",
        "Take a short break",
      ],
    };

    const options = messages[range.supportLevel];
    return options[Math.floor(Math.random() * options.length)];
  }
}

/**
 * Question Selector
 * Selects appropriate questions based on current difficulty
 */
export class QuestionSelector {
  constructor(gradeLevel, subject, allQuestions) {
    this.gradeLevel = gradeLevel;
    this.subject = subject;
    this.allQuestions = allQuestions;
    this.askedQuestions = new Set();
  }

  /**
   * Get next question based on difficulty level
   */
  getNextQuestion(targetDifficulty, options = {}) {
    const { avoidRecent = true, topicFilter = null } = options;

    // Filter questions by difficulty
    let availableQuestions = this.allQuestions.filter((q) => {
      const difficultyMatch = q.difficulty === targetDifficulty;
      const topicMatch = !topicFilter || q.topic === topicFilter;
      const notAsked = !avoidRecent || !this.askedQuestions.has(q.id);

      return difficultyMatch && topicMatch && notAsked;
    });

    // If no questions available at exact difficulty, allow nearby difficulties
    if (availableQuestions.length === 0) {
      availableQuestions = this.allQuestions.filter((q) => {
        const difficultyMatch =
          Math.abs(q.difficulty - targetDifficulty) <= 1;
        const topicMatch = !topicFilter || q.topic === topicFilter;
        const notAsked = !avoidRecent || !this.askedQuestions.has(q.id);

        return difficultyMatch && topicMatch && notAsked;
      });
    }

    // If still no questions, reset asked questions and try again
    if (availableQuestions.length === 0 && this.askedQuestions.size > 0) {
      this.askedQuestions.clear();
      return this.getNextQuestion(targetDifficulty, options);
    }

    // Select random question from available
    if (availableQuestions.length > 0) {
      const question =
        availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
      this.askedQuestions.add(question.id);
      return question;
    }

    return null;
  }

  /**
   * Reset asked questions (for new session)
   */
  reset() {
    this.askedQuestions.clear();
  }
}

/**
 * Hint System
 * Provides progressive hints based on difficulty and grade level
 */
export class HintSystem {
  constructor(gradeLevel) {
    this.gradeLevel = gradeLevel;
  }

  /**
   * Get hints for a question
   */
  getHints(question, attemptNumber) {
    const maxHints = this.getMaxHints();
    const hintLevel = Math.min(attemptNumber, maxHints);

    if (!question.hints || question.hints.length === 0) {
      return this.generateGenericHint(question, hintLevel);
    }

    return question.hints[hintLevel - 1] || question.hints[question.hints.length - 1];
  }

  getMaxHints() {
    if (this.gradeLevel <= 2) return 3; // More hints for younger students
    if (this.gradeLevel <= 5) return 2;
    if (this.gradeLevel <= 8) return 1;
    return 1; // Minimal hints for high school
  }

  generateGenericHint(question, level) {
    const hints = {
      1: [
        "Think about what the question is asking.",
        "Look at the key words in the question.",
        "What information are you given?",
      ],
      2: [
        "Try breaking the problem into smaller steps.",
        "What strategy could you use to solve this?",
        "Think about similar problems you've solved.",
      ],
      3: [
        "Look at the answer choices - which ones can you eliminate?",
        "Try working backwards from the answers.",
        "Draw a picture or diagram to help you think.",
      ],
    };

    const levelHints = hints[level] || hints[1];
    return levelHints[Math.floor(Math.random() * levelHints.length)];
  }
}
