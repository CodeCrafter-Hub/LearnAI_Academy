/**
 * Achievement and Rewards System
 * Motivational system with badges, streaks, and unlockables
 */

/**
 * Achievement Definitions
 */
export const ACHIEVEMENTS = {
  // Streak Achievements
  FIRST_ANSWER: {
    id: 'first_answer',
    name: 'First Steps',
    description: 'Answer your first question',
    emoji: '👶',
    tier: 'bronze',
    requirement: { type: 'total_answers', value: 1 },
    points: 10,
  },
  STREAK_3: {
    id: 'streak_3',
    name: 'Getting Warmed Up',
    description: 'Get 3 correct in a row',
    emoji: '🔥',
    tier: 'bronze',
    requirement: { type: 'streak', value: 3 },
    points: 25,
  },
  STREAK_5: {
    id: 'streak_5',
    name: 'Hot Streak',
    description: 'Get 5 correct in a row',
    emoji: '🔥🔥',
    tier: 'silver',
    requirement: { type: 'streak', value: 5 },
    points: 50,
  },
  STREAK_10: {
    id: 'streak_10',
    name: 'On Fire!',
    description: 'Get 10 correct in a row',
    emoji: '🔥🔥🔥',
    tier: 'gold',
    requirement: { type: 'streak', value: 10 },
    points: 100,
  },
  STREAK_15: {
    id: 'streak_15',
    name: 'Unstoppable',
    description: 'Get 15 correct in a row',
    emoji: '⚡',
    tier: 'platinum',
    requirement: { type: 'streak', value: 15 },
    points: 200,
  },

  // Accuracy Achievements
  PERFECT_10: {
    id: 'perfect_10',
    name: 'Perfect 10',
    description: 'Get 10 questions with 100% accuracy',
    emoji: '💯',
    tier: 'gold',
    requirement: { type: 'perfect_run', value: 10 },
    points: 150,
  },
  ACCURACY_90: {
    id: 'accuracy_90',
    name: 'Star Student',
    description: 'Maintain 90%+ accuracy over 20 questions',
    emoji: '⭐',
    tier: 'gold',
    requirement: { type: 'accuracy_over_time', value: { accuracy: 90, count: 20 } },
    points: 100,
  },
  ACCURACY_95: {
    id: 'accuracy_95',
    name: 'Excellence',
    description: 'Maintain 95%+ accuracy over 20 questions',
    emoji: '🌟',
    tier: 'platinum',
    requirement: { type: 'accuracy_over_time', value: { accuracy: 95, count: 20 } },
    points: 200,
  },

  // Volume Achievements
  QUESTIONS_10: {
    id: 'questions_10',
    name: 'Getting Started',
    description: 'Answer 10 questions',
    emoji: '📝',
    tier: 'bronze',
    requirement: { type: 'total_answers', value: 10 },
    points: 20,
  },
  QUESTIONS_50: {
    id: 'questions_50',
    name: 'Hard Worker',
    description: 'Answer 50 questions',
    emoji: '💪',
    tier: 'silver',
    requirement: { type: 'total_answers', value: 50 },
    points: 75,
  },
  QUESTIONS_100: {
    id: 'questions_100',
    name: 'Dedicated Learner',
    description: 'Answer 100 questions',
    emoji: '📚',
    tier: 'gold',
    requirement: { type: 'total_answers', value: 100 },
    points: 150,
  },
  QUESTIONS_500: {
    id: 'questions_500',
    name: 'Knowledge Seeker',
    description: 'Answer 500 questions',
    emoji: '🎓',
    tier: 'platinum',
    requirement: { type: 'total_answers', value: 500 },
    points: 500,
  },

  // Speed Achievements
  SPEED_DEMON: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Answer 10 questions in under 5 minutes',
    emoji: '⚡',
    tier: 'silver',
    requirement: { type: 'speed', value: { count: 10, time: 300 } },
    points: 75,
  },
  LIGHTNING_FAST: {
    id: 'lightning_fast',
    name: 'Lightning Fast',
    description: 'Answer 20 questions in under 10 minutes',
    emoji: '⚡⚡',
    tier: 'gold',
    requirement: { type: 'speed', value: { count: 20, time: 600 } },
    points: 150,
  },

  // Persistence Achievements
  COMEBACK_KID: {
    id: 'comeback_kid',
    name: 'Comeback Kid',
    description: 'Get 5 correct after 3 wrong answers',
    emoji: '💪',
    tier: 'silver',
    requirement: { type: 'comeback', value: { wrong: 3, correct: 5 } },
    points: 100,
  },
  NEVER_GIVE_UP: {
    id: 'never_give_up',
    name: 'Never Give Up',
    description: 'Complete a session despite 50% or lower accuracy',
    emoji: '🦸',
    tier: 'silver',
    requirement: { type: 'persistence', value: 50 },
    points: 50,
  },

  // Daily Achievements
  DAILY_LEARNER: {
    id: 'daily_learner',
    name: 'Daily Learner',
    description: 'Complete a session today',
    emoji: '📅',
    tier: 'bronze',
    requirement: { type: 'daily_session', value: 1 },
    points: 25,
  },
  WEEK_WARRIOR: {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Complete sessions 7 days in a row',
    emoji: '🗓️',
    tier: 'gold',
    requirement: { type: 'daily_streak', value: 7 },
    points: 200,
  },

  // Subject Mastery
  TOPIC_MASTER: {
    id: 'topic_master',
    name: 'Topic Master',
    description: 'Get 90%+ on a topic',
    emoji: '🎯',
    tier: 'gold',
    requirement: { type: 'topic_accuracy', value: 90 },
    points: 100,
  },
  SUBJECT_EXPERT: {
    id: 'subject_expert',
    name: 'Subject Expert',
    description: 'Master 10 topics in a subject',
    emoji: '🏆',
    tier: 'platinum',
    requirement: { type: 'topics_mastered', value: 10 },
    points: 500,
  },

  // Special Achievements
  EARLY_BIRD: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a session before 9 AM',
    emoji: '🌅',
    tier: 'silver',
    requirement: { type: 'time_of_day', value: 9 },
    points: 50,
  },
  NIGHT_OWL: {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete a session after 8 PM',
    emoji: '🦉',
    tier: 'silver',
    requirement: { type: 'time_of_day_after', value: 20 },
    points: 50,
  },
  WEEKEND_WARRIOR: {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Complete sessions on both Saturday and Sunday',
    emoji: '🎮',
    tier: 'silver',
    requirement: { type: 'weekend_sessions', value: 2 },
    points: 75,
  },
};

/**
 * Achievement Tiers
 */
export const ACHIEVEMENT_TIERS = {
  bronze: { color: 'from-amber-600 to-amber-800', glow: 'shadow-amber-400' },
  silver: { color: 'from-gray-400 to-gray-600', glow: 'shadow-gray-400' },
  gold: { color: 'from-yellow-400 to-yellow-600', glow: 'shadow-yellow-400' },
  platinum: { color: 'from-purple-400 to-purple-600', glow: 'shadow-purple-400' },
};

/**
 * Level System
 */
export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 1500, 2500, 4000, 6000, 8500, // 0-9
  11500, 15000, 20000, 26000, 33000, 41000, 50000, 60000, 75000, 95000, // 10-19
  120000, // 20 - max
];

/**
 * Rewards/Unlockables
 */
export const REWARDS = {
  // Avatar Items (unlocked by level)
  AVATARS: [
    { id: 'default', name: 'Default Avatar', emoji: '👤', level: 0 },
    { id: 'star', name: 'Star Student', emoji: '⭐', level: 5 },
    { id: 'rocket', name: 'Rocket Learner', emoji: '🚀', level: 10 },
    { id: 'wizard', name: 'Math Wizard', emoji: '🧙', level: 15 },
    { id: 'scientist', name: 'Mad Scientist', emoji: '🔬', level: 20 },
  ],

  // Classroom Themes (unlocked by achievements)
  THEMES: [
    { id: 'default', name: 'Classic Classroom', achievement: null },
    { id: 'space', name: 'Space Explorer', achievement: 'QUESTIONS_100' },
    { id: 'underwater', name: 'Underwater Adventure', achievement: 'WEEK_WARRIOR' },
    { id: 'forest', name: 'Enchanted Forest', achievement: 'SUBJECT_EXPERT' },
  ],

  // Sound Effects (unlocked by level)
  SOUNDS: [
    { id: 'none', name: 'No Sounds', level: 0 },
    { id: 'simple', name: 'Simple Sounds', level: 3 },
    { id: 'fun', name: 'Fun Sounds', level: 7 },
    { id: 'epic', name: 'Epic Sounds', level: 15 },
  ],
};

/**
 * Achievement Tracker Class
 */
export class AchievementTracker {
  constructor(studentId) {
    this.studentId = studentId;
    this.unlockedAchievements = new Set();
    this.stats = {
      totalAnswers: 0,
      correctAnswers: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalPoints: 0,
      level: 0,
      topicsMastered: new Set(),
      dailyStreak: 0,
      lastSessionDate: null,
      sessionHistory: [],
    };
  }

  /**
   * Load student progress from storage
   */
  async loadProgress() {
    // In production, load from database
    const saved = localStorage.getItem(`achievements_${this.studentId}`);
    if (saved) {
      const data = JSON.parse(saved);
      this.unlockedAchievements = new Set(data.achievements);
      this.stats = data.stats;
    }
  }

  /**
   * Save progress to storage
   */
  async saveProgress() {
    const data = {
      achievements: Array.from(this.unlockedAchievements),
      stats: this.stats,
    };
    localStorage.setItem(`achievements_${this.studentId}`, JSON.stringify(data));
  }

  /**
   * Update stats based on session performance
   */
  updateStats(sessionData) {
    const newAchievements = [];

    // Update basic stats
    this.stats.totalAnswers += sessionData.totalAttempts;
    this.stats.correctAnswers += sessionData.correctAttempts;
    this.stats.currentStreak = sessionData.currentStreak;
    this.stats.bestStreak = Math.max(
      this.stats.bestStreak,
      sessionData.currentStreak
    );

    // Update daily streak
    const today = new Date().toDateString();
    if (this.stats.lastSessionDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (this.stats.lastSessionDate === yesterday.toDateString()) {
        this.stats.dailyStreak++;
      } else {
        this.stats.dailyStreak = 1;
      }
      this.stats.lastSessionDate = today;
    }

    // Add session to history
    this.stats.sessionHistory.push({
      date: new Date().toISOString(),
      ...sessionData,
    });

    // Check all achievements
    Object.values(ACHIEVEMENTS).forEach((achievement) => {
      if (!this.unlockedAchievements.has(achievement.id)) {
        if (this.checkAchievement(achievement, sessionData)) {
          this.unlockAchievement(achievement);
          newAchievements.push(achievement);
        }
      }
    });

    // Update points and level
    this.updateLevel();

    // Save progress
    this.saveProgress();

    return newAchievements;
  }

  /**
   * Check if achievement requirement is met
   */
  checkAchievement(achievement, sessionData) {
    const { type, value } = achievement.requirement;

    switch (type) {
      case 'total_answers':
        return this.stats.totalAnswers >= value;

      case 'streak':
        return this.stats.currentStreak >= value;

      case 'perfect_run':
        return (
          sessionData.totalAttempts >= value &&
          sessionData.correctAttempts === sessionData.totalAttempts
        );

      case 'accuracy_over_time':
        const recentAnswers = this.stats.sessionHistory.slice(-value.count);
        if (recentAnswers.length < value.count) return false;
        const totalRecent = recentAnswers.reduce(
          (sum, s) => sum + s.totalAttempts,
          0
        );
        const correctRecent = recentAnswers.reduce(
          (sum, s) => sum + s.correctAttempts,
          0
        );
        return (correctRecent / totalRecent) * 100 >= value.accuracy;

      case 'speed':
        return (
          sessionData.totalAttempts >= value.count &&
          sessionData.sessionDuration * 60 <= value.time
        );

      case 'daily_streak':
        return this.stats.dailyStreak >= value;

      case 'topic_accuracy':
        // Would check specific topic performance in production
        return sessionData.accuracy >= value;

      case 'topics_mastered':
        return this.stats.topicsMastered.size >= value;

      case 'time_of_day':
        return new Date().getHours() < value;

      case 'time_of_day_after':
        return new Date().getHours() >= value;

      default:
        return false;
    }
  }

  /**
   * Unlock achievement
   */
  unlockAchievement(achievement) {
    this.unlockedAchievements.add(achievement.id);
    this.stats.totalPoints += achievement.points;
  }

  /**
   * Update level based on points
   */
  updateLevel() {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (this.stats.totalPoints >= LEVEL_THRESHOLDS[i]) {
        this.stats.level = i;
        break;
      }
    }
  }

  /**
   * Get progress to next level
   */
  getLevelProgress() {
    const currentLevelPoints = LEVEL_THRESHOLDS[this.stats.level];
    const nextLevelPoints = LEVEL_THRESHOLDS[this.stats.level + 1] || currentLevelPoints;
    const pointsInLevel = this.stats.totalPoints - currentLevelPoints;
    const pointsNeeded = nextLevelPoints - currentLevelPoints;

    return {
      currentLevel: this.stats.level,
      currentPoints: this.stats.totalPoints,
      pointsInLevel,
      pointsNeeded,
      progress: pointsNeeded > 0 ? (pointsInLevel / pointsNeeded) * 100 : 100,
    };
  }

  /**
   * Get unlockable rewards
   */
  getUnlockedRewards() {
    return {
      avatars: REWARDS.AVATARS.filter((a) => a.level <= this.stats.level),
      themes: REWARDS.THEMES.filter(
        (t) => !t.achievement || this.unlockedAchievements.has(t.achievement)
      ),
      sounds: REWARDS.SOUNDS.filter((s) => s.level <= this.stats.level),
    };
  }

  /**
   * Get achievement categories progress
   */
  getCategoryProgress() {
    const categories = {
      streaks: [],
      accuracy: [],
      volume: [],
      special: [],
    };

    Object.values(ACHIEVEMENTS).forEach((achievement) => {
      const unlocked = this.unlockedAchievements.has(achievement.id);
      const achievementData = { ...achievement, unlocked };

      if (achievement.id.includes('STREAK')) {
        categories.streaks.push(achievementData);
      } else if (achievement.id.includes('ACCURACY') || achievement.id.includes('PERFECT')) {
        categories.accuracy.push(achievementData);
      } else if (achievement.id.includes('QUESTIONS')) {
        categories.volume.push(achievementData);
      } else {
        categories.special.push(achievementData);
      }
    });

    return categories;
  }

  /**
   * Get recent achievements
   */
  getRecentAchievements(count = 5) {
    return Array.from(this.unlockedAchievements)
      .slice(-count)
      .map((id) => Object.values(ACHIEVEMENTS).find((a) => a.id === id));
  }
}

/**
 * Get grade-appropriate achievement notifications
 */
export function getAchievementNotification(achievement, gradeLevel) {
  const messages = {
    K2: [
      `🎉 WOW! You got ${achievement.emoji} ${achievement.name}!`,
      `⭐ AMAZING! You unlocked ${achievement.emoji}!`,
      `🌟 SO COOL! ${achievement.emoji} ${achievement.name} is yours!`,
    ],
    '3-5': [
      `🎊 Achievement Unlocked: ${achievement.emoji} ${achievement.name}!`,
      `⭐ Awesome! You earned ${achievement.emoji} ${achievement.name}!`,
      `🏆 Great job! ${achievement.emoji} ${achievement.name} unlocked!`,
    ],
    '6-8': [
      `Achievement Unlocked: ${achievement.name} ${achievement.emoji}`,
      `New Badge: ${achievement.name}`,
      `Unlocked: ${achievement.emoji} ${achievement.name}`,
    ],
    '9-12': [
      `Achievement: ${achievement.name}`,
      `Unlocked: ${achievement.name}`,
      `New: ${achievement.name}`,
    ],
  };

  const band = gradeLevel <= 2 ? 'K2' : gradeLevel <= 5 ? '3-5' : gradeLevel <= 8 ? '6-8' : '9-12';
  const options = messages[band];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Get motivational message based on points/level
 */
export function getMotivationalMessage(level, gradeLevel) {
  const milestones = {
    5: {
      K2: "You're doing SO GREAT! Keep learning! 🌟",
      '3-5': "Awesome progress! You're a Level 5 learner! 🚀",
      '6-8': 'Great progress! Level 5 achieved!',
      '9-12': 'Level 5 reached',
    },
    10: {
      K2: "WOW! You're getting so smart! 🎉",
      '3-5': 'Amazing! You reached Level 10! 🏆',
      '6-8': 'Excellent! Level 10 unlocked!',
      '9-12': 'Level 10 achieved',
    },
    15: {
      K2: "You're a SUPERSTAR learner! ⭐⭐⭐",
      '3-5': 'Incredible! Level 15! You\'re unstoppable! 💪',
      '6-8': 'Outstanding! Level 15!',
      '9-12': 'Level 15 - Advanced learner',
    },
    20: {
      K2: "YOU'RE THE BEST! Maximum level! 🏆🎉⭐",
      '3-5': 'LEGENDARY! Maximum Level achieved! 🎊',
      '6-8': 'Maximum Level! Exceptional work!',
      '9-12': 'Maximum Level - Expert status',
    },
  };

  const band = gradeLevel <= 2 ? 'K2' : gradeLevel <= 5 ? '3-5' : gradeLevel <= 8 ? '6-8' : '9-12';

  if (milestones[level]) {
    return milestones[level][band];
  }

  return null;
}
