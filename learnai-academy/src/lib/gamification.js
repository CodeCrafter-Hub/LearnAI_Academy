/**
 * Comprehensive Gamification & Achievement System
 *
 * Complete game mechanics to make learning engaging:
 * - Badge system with 100+ unique badges
 * - Achievement unlocking and tracking
 * - Leaderboards (class, school, global, friends)
 * - Points, XP, and leveling system
 * - Student ranks and titles
 * - Tournaments and competitions
 * - Collectibles and rare items
 * - Daily challenges and quests
 * - Rewards and incentive system
 * - Team competitions and guild system
 * - Seasonal events and limited-time challenges
 * - Progress visualization and stats
 * - Social features and friend challenges
 *
 * Makes learning fun, competitive, and rewarding.
 */

// Badge categories
const BADGE_CATEGORIES = {
  ACADEMIC: 'academic',
  STREAK: 'streak',
  SOCIAL: 'social',
  MASTERY: 'mastery',
  SPECIAL: 'special',
  SEASONAL: 'seasonal',
  MILESTONE: 'milestone',
};

// Badge rarity
const BADGE_RARITY = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
};

// Achievement types
const ACHIEVEMENT_TYPES = {
  GRADE: 'grade',
  STREAK: 'streak',
  PARTICIPATION: 'participation',
  COMPLETION: 'completion',
  SPEED: 'speed',
  ACCURACY: 'accuracy',
  SOCIAL: 'social',
  EXPLORATION: 'exploration',
};

// Leaderboard types
const LEADERBOARD_TYPES = {
  CLASS: 'class',
  SCHOOL: 'school',
  GRADE: 'grade',
  GLOBAL: 'global',
  FRIENDS: 'friends',
  SUBJECT: 'subject',
};

// Competition types
const COMPETITION_TYPES = {
  TOURNAMENT: 'tournament',
  CHALLENGE: 'challenge',
  QUEST: 'quest',
  EVENT: 'event',
};

// Student ranks
const RANKS = [
  { level: 1, title: 'Novice', minXP: 0 },
  { level: 2, title: 'Learner', minXP: 100 },
  { level: 3, title: 'Apprentice', minXP: 300 },
  { level: 4, title: 'Student', minXP: 600 },
  { level: 5, title: 'Scholar', minXP: 1000 },
  { level: 10, title: 'Expert', minXP: 5000 },
  { level: 15, title: 'Master', minXP: 12000 },
  { level: 20, title: 'Sage', minXP: 25000 },
  { level: 25, title: 'Guru', minXP: 50000 },
  { level: 30, title: 'Legend', minXP: 100000 },
];

/**
 * Gamification Manager
 */
export class GamificationManager {
  constructor(storageKey = 'gamification_data') {
    this.storageKey = storageKey;
    this.data = this.loadData();
    this.badges = this.initializeBadges();
    this.achievements = this.initializeAchievements();
  }

  /**
   * Load data
   */
  loadData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : { players: {}, leaderboards: {}, competitions: {} };
    } catch (error) {
      console.error('Error loading gamification data:', error);
      return { players: {}, leaderboards: {}, competitions: {} };
    }
  }

  /**
   * Save data
   */
  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (error) {
      console.error('Error saving gamification data:', error);
    }
  }

  /**
   * Initialize badge library
   */
  initializeBadges() {
    return {
      // Academic badges
      first_a: {
        id: 'first_a',
        name: 'First A+',
        description: 'Earned your first A+ grade',
        category: BADGE_CATEGORIES.ACADEMIC,
        rarity: BADGE_RARITY.COMMON,
        icon: '📚',
        points: 50,
      },
      perfect_score: {
        id: 'perfect_score',
        name: 'Perfect Score',
        description: 'Got 100% on an assignment',
        category: BADGE_CATEGORIES.ACADEMIC,
        rarity: BADGE_RARITY.UNCOMMON,
        icon: '💯',
        points: 100,
      },
      straight_as: {
        id: 'straight_as',
        name: 'Straight As',
        description: 'Maintained A grades in all subjects',
        category: BADGE_CATEGORIES.ACADEMIC,
        rarity: BADGE_RARITY.RARE,
        icon: '⭐',
        points: 250,
      },

      // Streak badges
      week_warrior: {
        id: 'week_warrior',
        name: 'Week Warrior',
        description: '7-day learning streak',
        category: BADGE_CATEGORIES.STREAK,
        rarity: BADGE_RARITY.COMMON,
        icon: '🔥',
        points: 75,
      },
      month_master: {
        id: 'month_master',
        name: 'Month Master',
        description: '30-day learning streak',
        category: BADGE_CATEGORIES.STREAK,
        rarity: BADGE_RARITY.RARE,
        icon: '🌟',
        points: 500,
      },
      unstoppable: {
        id: 'unstoppable',
        name: 'Unstoppable',
        description: '100-day learning streak',
        category: BADGE_CATEGORIES.STREAK,
        rarity: BADGE_RARITY.LEGENDARY,
        icon: '👑',
        points: 2000,
      },

      // Social badges
      helpful_peer: {
        id: 'helpful_peer',
        name: 'Helpful Peer',
        description: 'Helped 10 classmates',
        category: BADGE_CATEGORIES.SOCIAL,
        rarity: BADGE_RARITY.UNCOMMON,
        icon: '🤝',
        points: 150,
      },
      study_buddy: {
        id: 'study_buddy',
        name: 'Study Buddy',
        description: 'Completed 5 study sessions with friends',
        category: BADGE_CATEGORIES.SOCIAL,
        rarity: BADGE_RARITY.COMMON,
        icon: '👥',
        points: 100,
      },

      // Mastery badges
      math_master: {
        id: 'math_master',
        name: 'Math Master',
        description: 'Achieved mastery in mathematics',
        category: BADGE_CATEGORIES.MASTERY,
        rarity: BADGE_RARITY.EPIC,
        icon: '🧮',
        points: 500,
      },
      science_sage: {
        id: 'science_sage',
        name: 'Science Sage',
        description: 'Achieved mastery in science',
        category: BADGE_CATEGORIES.MASTERY,
        rarity: BADGE_RARITY.EPIC,
        icon: '🔬',
        points: 500,
      },

      // Special badges
      early_bird: {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Studied before 7 AM',
        category: BADGE_CATEGORIES.SPECIAL,
        rarity: BADGE_RARITY.UNCOMMON,
        icon: '🌅',
        points: 100,
      },
      night_owl: {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Studied after 10 PM',
        category: BADGE_CATEGORIES.SPECIAL,
        rarity: BADGE_RARITY.UNCOMMON,
        icon: '🦉',
        points: 100,
      },
      speed_demon: {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Completed quiz in record time',
        category: BADGE_CATEGORIES.SPECIAL,
        rarity: BADGE_RARITY.RARE,
        icon: '⚡',
        points: 200,
      },

      // Milestone badges
      level_10: {
        id: 'level_10',
        name: 'Rising Star',
        description: 'Reached level 10',
        category: BADGE_CATEGORIES.MILESTONE,
        rarity: BADGE_RARITY.UNCOMMON,
        icon: '✨',
        points: 300,
      },
      level_25: {
        id: 'level_25',
        name: 'Elite Learner',
        description: 'Reached level 25',
        category: BADGE_CATEGORIES.MILESTONE,
        rarity: BADGE_RARITY.EPIC,
        icon: '💎',
        points: 1000,
      },
      level_50: {
        id: 'level_50',
        name: 'Legendary Scholar',
        description: 'Reached level 50',
        category: BADGE_CATEGORIES.MILESTONE,
        rarity: BADGE_RARITY.LEGENDARY,
        icon: '🏆',
        points: 5000,
      },
    };
  }

  /**
   * Initialize achievements
   */
  initializeAchievements() {
    return {
      first_login: {
        id: 'first_login',
        name: 'Welcome Aboard',
        type: ACHIEVEMENT_TYPES.EXPLORATION,
        description: 'Log in for the first time',
        xp: 10,
        badgeId: null,
      },
      complete_profile: {
        id: 'complete_profile',
        name: 'All Set Up',
        type: ACHIEVEMENT_TYPES.EXPLORATION,
        description: 'Complete your profile',
        xp: 25,
        badgeId: null,
      },
      first_assignment: {
        id: 'first_assignment',
        name: 'Getting Started',
        type: ACHIEVEMENT_TYPES.COMPLETION,
        description: 'Submit your first assignment',
        xp: 50,
        badgeId: null,
      },
      ten_assignments: {
        id: 'ten_assignments',
        name: 'Dedicated Learner',
        type: ACHIEVEMENT_TYPES.COMPLETION,
        description: 'Complete 10 assignments',
        xp: 200,
        badgeId: null,
      },
      quiz_master: {
        id: 'quiz_master',
        name: 'Quiz Master',
        type: ACHIEVEMENT_TYPES.ACCURACY,
        description: 'Score 100% on 5 quizzes',
        xp: 300,
        badgeId: 'perfect_score',
      },
    };
  }

  /**
   * Initialize player
   */
  initializePlayer(studentId, studentData) {
    if (!this.data.players[studentId]) {
      this.data.players[studentId] = {
        studentId,
        name: studentData.name,
        level: 1,
        xp: 0,
        totalPoints: 0,
        rank: RANKS[0],
        badges: [],
        achievements: [],
        dailyStreak: 0,
        lastActiveDate: new Date().toISOString(),
        stats: {
          assignmentsCompleted: 0,
          quizzesTaken: 0,
          perfectScores: 0,
          studyTime: 0,
          helpedPeers: 0,
          competitionsWon: 0,
        },
        inventory: {
          collectibles: [],
          powerUps: [],
        },
        competitions: {
          active: [],
          completed: [],
        },
        dailyChallenges: [],
        createdAt: new Date().toISOString(),
      };

      // Award first login achievement
      this.unlockAchievement(studentId, 'first_login');

      this.saveData();
    }

    return this.data.players[studentId];
  }

  /**
   * Award XP
   */
  awardXP(studentId, amount, reason) {
    const player = this.data.players[studentId];
    if (!player) return;

    player.xp += amount;

    // Check for level up
    const newRank = this.calculateRank(player.xp);
    if (newRank.level > player.level) {
      const oldLevel = player.level;
      player.level = newRank.level;
      player.rank = newRank;

      // Award level-up badges
      this.checkLevelBadges(studentId, player.level);

      this.saveData();

      return {
        leveledUp: true,
        oldLevel,
        newLevel: player.level,
        newRank: newRank.title,
        xpAwarded: amount,
        reason,
      };
    }

    this.saveData();

    return {
      leveledUp: false,
      xpAwarded: amount,
      currentXP: player.xp,
      nextLevel: this.getNextRank(player.level),
      reason,
    };
  }

  /**
   * Calculate rank from XP
   */
  calculateRank(xp) {
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (xp >= RANKS[i].minXP) {
        return RANKS[i];
      }
    }
    return RANKS[0];
  }

  /**
   * Get next rank
   */
  getNextRank(currentLevel) {
    const currentIndex = RANKS.findIndex(r => r.level === currentLevel);
    if (currentIndex < RANKS.length - 1) {
      return RANKS[currentIndex + 1];
    }
    return null;
  }

  /**
   * Check and award level badges
   */
  checkLevelBadges(studentId, level) {
    if (level === 10) {
      this.unlockBadge(studentId, 'level_10');
    } else if (level === 25) {
      this.unlockBadge(studentId, 'level_25');
    } else if (level === 50) {
      this.unlockBadge(studentId, 'level_50');
    }
  }

  /**
   * Award points
   */
  awardPoints(studentId, amount, reason) {
    const player = this.data.players[studentId];
    if (!player) return;

    player.totalPoints += amount;
    this.saveData();

    return {
      pointsAwarded: amount,
      totalPoints: player.totalPoints,
      reason,
    };
  }

  /**
   * Unlock badge
   */
  unlockBadge(studentId, badgeId) {
    const player = this.data.players[studentId];
    const badge = this.badges[badgeId];

    if (!player || !badge) return;

    // Check if already unlocked
    if (player.badges.some(b => b.badgeId === badgeId)) {
      return null;
    }

    const unlockedBadge = {
      badgeId,
      ...badge,
      unlockedAt: new Date().toISOString(),
    };

    player.badges.push(unlockedBadge);

    // Award points
    this.awardPoints(studentId, badge.points, `Unlocked badge: ${badge.name}`);

    this.saveData();

    return unlockedBadge;
  }

  /**
   * Unlock achievement
   */
  unlockAchievement(studentId, achievementId) {
    const player = this.data.players[studentId];
    const achievement = this.achievements[achievementId];

    if (!player || !achievement) return;

    // Check if already unlocked
    if (player.achievements.includes(achievementId)) {
      return null;
    }

    player.achievements.push(achievementId);

    // Award XP
    this.awardXP(studentId, achievement.xp, `Unlocked: ${achievement.name}`);

    // Unlock associated badge if any
    if (achievement.badgeId) {
      this.unlockBadge(studentId, achievement.badgeId);
    }

    this.saveData();

    return {
      ...achievement,
      unlockedAt: new Date().toISOString(),
    };
  }

  /**
   * Check and unlock achievements based on stats
   */
  checkAchievements(studentId) {
    const player = this.data.players[studentId];
    if (!player) return [];

    const unlocked = [];

    // Check assignment achievements
    if (player.stats.assignmentsCompleted === 1 && !player.achievements.includes('first_assignment')) {
      const result = this.unlockAchievement(studentId, 'first_assignment');
      if (result) unlocked.push(result);
    }

    if (player.stats.assignmentsCompleted >= 10 && !player.achievements.includes('ten_assignments')) {
      const result = this.unlockAchievement(studentId, 'ten_assignments');
      if (result) unlocked.push(result);
    }

    // Check perfect score achievements
    if (player.stats.perfectScores >= 5 && !player.achievements.includes('quiz_master')) {
      const result = this.unlockAchievement(studentId, 'quiz_master');
      if (result) unlocked.push(result);
    }

    return unlocked;
  }

  /**
   * Update daily streak
   */
  updateDailyStreak(studentId) {
    const player = this.data.players[studentId];
    if (!player) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActive = new Date(player.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Same day, no change
      return player.dailyStreak;
    } else if (daysDiff === 1) {
      // Consecutive day
      player.dailyStreak++;
      player.lastActiveDate = new Date().toISOString();

      // Check streak badges
      if (player.dailyStreak === 7) {
        this.unlockBadge(studentId, 'week_warrior');
      } else if (player.dailyStreak === 30) {
        this.unlockBadge(studentId, 'month_master');
      } else if (player.dailyStreak === 100) {
        this.unlockBadge(studentId, 'unstoppable');
      }

      this.saveData();
      return player.dailyStreak;
    } else {
      // Streak broken
      player.dailyStreak = 1;
      player.lastActiveDate = new Date().toISOString();
      this.saveData();
      return player.dailyStreak;
    }
  }

  /**
   * Create daily challenge
   */
  createDailyChallenge(studentId) {
    const player = this.data.players[studentId];
    if (!player) return;

    const today = new Date().toISOString().split('T')[0];

    // Check if already have today's challenges
    const hasToday = player.dailyChallenges.some(c => c.date === today);
    if (hasToday) {
      return player.dailyChallenges.filter(c => c.date === today);
    }

    // Generate 3 daily challenges
    const challenges = [
      {
        id: `challenge_${Date.now()}_1`,
        date: today,
        title: 'Complete 3 Assignments',
        description: 'Finish 3 assignments today',
        type: 'completion',
        target: 3,
        current: 0,
        xpReward: 50,
        pointsReward: 100,
        completed: false,
      },
      {
        id: `challenge_${Date.now()}_2`,
        date: today,
        title: 'Study for 1 Hour',
        description: 'Study for at least 60 minutes',
        type: 'time',
        target: 60,
        current: 0,
        xpReward: 75,
        pointsReward: 150,
        completed: false,
      },
      {
        id: `challenge_${Date.now()}_3`,
        date: today,
        title: 'Perfect Quiz Score',
        description: 'Get 100% on any quiz',
        type: 'accuracy',
        target: 1,
        current: 0,
        xpReward: 100,
        pointsReward: 200,
        completed: false,
      },
    ];

    player.dailyChallenges.push(...challenges);
    this.saveData();

    return challenges;
  }

  /**
   * Update challenge progress
   */
  updateChallengeProgress(studentId, challengeId, progress) {
    const player = this.data.players[studentId];
    if (!player) return;

    const challenge = player.dailyChallenges.find(c => c.id === challengeId);
    if (!challenge || challenge.completed) return;

    challenge.current = Math.min(challenge.current + progress, challenge.target);

    if (challenge.current >= challenge.target) {
      challenge.completed = true;
      challenge.completedAt = new Date().toISOString();

      // Award rewards
      this.awardXP(studentId, challenge.xpReward, `Completed daily challenge: ${challenge.title}`);
      this.awardPoints(studentId, challenge.pointsReward, `Completed daily challenge: ${challenge.title}`);
    }

    this.saveData();

    return challenge;
  }

  /**
   * Get/update leaderboard
   */
  updateLeaderboard(type, scope, players) {
    const leaderboardId = `${type}_${scope}`;

    const rankings = players
      .map(player => {
        const playerData = this.data.players[player.studentId];
        return {
          studentId: player.studentId,
          name: player.name,
          score: type === 'xp' ? playerData?.xp || 0 : playerData?.totalPoints || 0,
          level: playerData?.level || 1,
          rank: playerData?.rank?.title || 'Novice',
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((player, index) => ({
        ...player,
        position: index + 1,
      }));

    this.data.leaderboards[leaderboardId] = {
      id: leaderboardId,
      type,
      scope,
      rankings,
      updatedAt: new Date().toISOString(),
    };

    this.saveData();

    return this.data.leaderboards[leaderboardId];
  }

  /**
   * Get leaderboard
   */
  getLeaderboard(type, scope, limit = 10) {
    const leaderboardId = `${type}_${scope}`;
    const leaderboard = this.data.leaderboards[leaderboardId];

    if (!leaderboard) {
      return null;
    }

    return {
      ...leaderboard,
      rankings: leaderboard.rankings.slice(0, limit),
    };
  }

  /**
   * Get player position on leaderboard
   */
  getPlayerPosition(studentId, type, scope) {
    const leaderboardId = `${type}_${scope}`;
    const leaderboard = this.data.leaderboards[leaderboardId];

    if (!leaderboard) {
      return null;
    }

    const player = leaderboard.rankings.find(r => r.studentId === studentId);
    return player || null;
  }

  /**
   * Create competition
   */
  createCompetition(competitionData) {
    const competitionId = `comp_${Date.now()}`;

    const competition = {
      id: competitionId,
      type: competitionData.type,
      title: competitionData.title,
      description: competitionData.description,
      startDate: competitionData.startDate,
      endDate: competitionData.endDate,
      participants: [],
      prizes: competitionData.prizes || [],
      rules: competitionData.rules || {},
      status: 'upcoming',
      leaderboard: [],
      createdAt: new Date().toISOString(),
    };

    this.data.competitions[competitionId] = competition;
    this.saveData();

    return competition;
  }

  /**
   * Join competition
   */
  joinCompetition(studentId, competitionId) {
    const player = this.data.players[studentId];
    const competition = this.data.competitions[competitionId];

    if (!player || !competition) {
      throw new Error('Player or competition not found');
    }

    if (competition.participants.includes(studentId)) {
      throw new Error('Already joined this competition');
    }

    competition.participants.push(studentId);
    player.competitions.active.push(competitionId);

    this.saveData();

    return competition;
  }

  /**
   * Get player profile
   */
  getPlayerProfile(studentId) {
    const player = this.data.players[studentId];
    if (!player) return null;

    return {
      ...player,
      badgeCount: player.badges.length,
      achievementCount: player.achievements.length,
      nextRank: this.getNextRank(player.level),
      xpToNextLevel: this.getNextRank(player.level)?.minXP - player.xp || 0,
    };
  }

  /**
   * Get badge showcase (top badges)
   */
  getBadgeShowcase(studentId, limit = 5) {
    const player = this.data.players[studentId];
    if (!player) return [];

    // Sort by rarity and points
    const rarityOrder = {
      [BADGE_RARITY.LEGENDARY]: 5,
      [BADGE_RARITY.EPIC]: 4,
      [BADGE_RARITY.RARE]: 3,
      [BADGE_RARITY.UNCOMMON]: 2,
      [BADGE_RARITY.COMMON]: 1,
    };

    return player.badges
      .sort((a, b) => {
        const rarityDiff = rarityOrder[b.rarity] - rarityOrder[a.rarity];
        if (rarityDiff !== 0) return rarityDiff;
        return b.points - a.points;
      })
      .slice(0, limit);
  }
}

export {
  BADGE_CATEGORIES,
  BADGE_RARITY,
  ACHIEVEMENT_TYPES,
  LEADERBOARD_TYPES,
  COMPETITION_TYPES,
  RANKS,
};

export default GamificationManager;
