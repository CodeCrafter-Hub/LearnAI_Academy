/**
 * Study Streaks and Habit System
 * Encourages consistent learning through gamification and habit formation
 */

/**
 * Habit templates for different goals
 */
const HABIT_TEMPLATES = {
  dailyPractice: {
    name: 'Daily Practice',
    description: 'Complete at least one learning session every day',
    type: 'daily',
    target: 1,
    unit: 'sessions',
    icon: '📚',
  },
  timeGoal: {
    name: 'Study Time Goal',
    description: 'Study for a specific amount of time',
    type: 'daily',
    target: 20,
    unit: 'minutes',
    icon: '⏰',
  },
  accuracyGoal: {
    name: 'Accuracy Goal',
    description: 'Maintain high accuracy in practice',
    type: 'daily',
    target: 80,
    unit: 'percent',
    icon: '🎯',
  },
  topicMastery: {
    name: 'Topic Mastery',
    description: 'Master a certain number of topics per week',
    type: 'weekly',
    target: 3,
    unit: 'topics',
    icon: '⭐',
  },
  reviewCompletion: {
    name: 'Review Completion',
    description: 'Complete all spaced repetition reviews',
    type: 'daily',
    target: 100,
    unit: 'percent',
    icon: '♻️',
  },
};

/**
 * Streak milestones and rewards
 */
const STREAK_MILESTONES = [
  { days: 3, name: '3-Day Start', icon: '🌱', reward: 'bronze-badge' },
  { days: 7, name: '1-Week Warrior', icon: '🔥', reward: 'silver-badge' },
  { days: 14, name: '2-Week Champion', icon: '💪', reward: 'gold-badge' },
  { days: 30, name: '1-Month Master', icon: '🏆', reward: 'platinum-badge' },
  { days: 50, name: '50-Day Legend', icon: '⭐', reward: 'diamond-badge' },
  { days: 100, name: '100-Day Hero', icon: '👑', reward: 'legendary-badge' },
  { days: 365, name: '1-Year Champion', icon: '🎖️', reward: 'ultimate-badge' },
];

/**
 * StreakTracker
 * Manages study streaks and consistency
 */
export class StreakTracker {
  constructor(storage = 'localStorage') {
    this.storage = storage;
    this.streaks = new Map();
    this.loadData();
  }

  /**
   * Initialize streak for student
   */
  initializeStreak(studentId) {
    if (this.streaks.has(studentId)) {
      return this.streaks.get(studentId);
    }

    const streak = {
      studentId,
      currentStreak: 0,
      longestStreak: 0,
      totalDaysActive: 0,
      lastActivityDate: null,
      streakStartDate: null,
      freezesAvailable: 2, // Allow 2 streak freezes
      freezesUsed: 0,
      milestones: [],
      history: [],
    };

    this.streaks.set(studentId, streak);
    this.saveData();
    return streak;
  }

  /**
   * Record activity for today
   */
  recordActivity(studentId, metadata = {}) {
    const streak = this.streaks.get(studentId) || this.initializeStreak(studentId);
    const today = this.getDateString(new Date());
    const lastActivity = this.getDateString(new Date(streak.lastActivityDate || 0));

    // Check if already recorded today
    if (lastActivity === today) {
      return {
        streakUpdated: false,
        currentStreak: streak.currentStreak,
        message: 'Activity already recorded today',
      };
    }

    const daysDifference = this.getDaysDifference(lastActivity, today);

    if (daysDifference === 1) {
      // Consecutive day - increment streak
      streak.currentStreak++;
      streak.streakStartDate = streak.streakStartDate || today;
    } else if (daysDifference === 0) {
      // Same day (shouldn't happen due to check above)
      return {
        streakUpdated: false,
        currentStreak: streak.currentStreak,
        message: 'Activity already recorded today',
      };
    } else {
      // Streak broken
      if (streak.freezesAvailable > 0 && daysDifference === 2) {
        // Can use a freeze for 1 missed day
        streak.freezesAvailable--;
        streak.freezesUsed++;
        streak.currentStreak++;

        // Record freeze usage
        streak.history.push({
          date: today,
          type: 'freeze-used',
          streakBefore: streak.currentStreak - 1,
          streakAfter: streak.currentStreak,
        });

        return {
          streakUpdated: true,
          currentStreak: streak.currentStreak,
          freezeUsed: true,
          freezesRemaining: streak.freezesAvailable,
          message: 'Streak saved with freeze!',
        };
      } else {
        // Streak broken
        streak.currentStreak = 1;
        streak.streakStartDate = today;

        streak.history.push({
          date: today,
          type: 'streak-broken',
          streakLost: streak.longestStreak,
          reason: daysDifference > 2 ? 'multiple-days-missed' : 'no-freeze-available',
        });
      }
    }

    // Update records
    streak.lastActivityDate = today;
    streak.totalDaysActive++;

    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }

    // Check for milestones
    const newMilestones = this.checkMilestones(streak);

    // Record activity in history
    streak.history.push({
      date: today,
      type: 'activity',
      streak: streak.currentStreak,
      metadata,
    });

    // Keep only last 365 days of history
    if (streak.history.length > 365) {
      streak.history = streak.history.slice(-365);
    }

    this.saveData();

    return {
      streakUpdated: true,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      newMilestones,
      freezesRemaining: streak.freezesAvailable,
    };
  }

  /**
   * Check for achieved milestones
   */
  checkMilestones(streak) {
    const newMilestones = [];

    STREAK_MILESTONES.forEach((milestone) => {
      const alreadyAchieved = streak.milestones.some((m) => m.days === milestone.days);

      if (!alreadyAchieved && streak.currentStreak >= milestone.days) {
        const achieved = {
          ...milestone,
          achievedDate: new Date().toISOString(),
        };
        streak.milestones.push(achieved);
        newMilestones.push(achieved);
      }
    });

    return newMilestones;
  }

  /**
   * Use a streak freeze
   */
  useStreakFreeze(studentId) {
    const streak = this.streaks.get(studentId);
    if (!streak) {
      throw new Error('Streak not found');
    }

    if (streak.freezesAvailable <= 0) {
      return {
        success: false,
        message: 'No freezes available',
      };
    }

    streak.freezesAvailable--;
    streak.freezesUsed++;

    // Extend streak
    streak.lastActivityDate = this.getDateString(new Date());

    this.saveData();

    return {
      success: true,
      freezesRemaining: streak.freezesAvailable,
      message: 'Streak freeze applied!',
    };
  }

  /**
   * Earn additional freeze
   */
  earnStreakFreeze(studentId, reason = 'achievement') {
    const streak = this.streaks.get(studentId);
    if (!streak) {
      throw new Error('Streak not found');
    }

    streak.freezesAvailable++;

    this.saveData();

    return {
      success: true,
      freezesAvailable: streak.freezesAvailable,
      reason,
    };
  }

  /**
   * Get streak statistics
   */
  getStreakStats(studentId) {
    const streak = this.streaks.get(studentId);
    if (!streak) {
      return null;
    }

    const today = this.getDateString(new Date());
    const lastActivity = this.getDateString(new Date(streak.lastActivityDate || 0));
    const daysSinceActivity = this.getDaysDifference(lastActivity, today);

    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      totalDaysActive: streak.totalDaysActive,
      streakStartDate: streak.streakStartDate,
      lastActivityDate: streak.lastActivityDate,
      isActiveToday: daysSinceActivity === 0,
      daysSinceActivity,
      atRisk: daysSinceActivity >= 1,
      freezesAvailable: streak.freezesAvailable,
      freezesUsed: streak.freezesUsed,
      milestones: streak.milestones,
      nextMilestone: this.getNextMilestone(streak.currentStreak),
      daysToNextMilestone: this.getDaysToNextMilestone(streak.currentStreak),
    };
  }

  /**
   * Get next milestone
   */
  getNextMilestone(currentStreak) {
    return STREAK_MILESTONES.find((m) => m.days > currentStreak) || null;
  }

  /**
   * Get days to next milestone
   */
  getDaysToNextMilestone(currentStreak) {
    const next = this.getNextMilestone(currentStreak);
    return next ? next.days - currentStreak : 0;
  }

  /**
   * Get activity calendar (for visualization)
   */
  getActivityCalendar(studentId, days = 90) {
    const streak = this.streaks.get(studentId);
    if (!streak) {
      return [];
    }

    const calendar = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = this.getDateString(date);

      const activity = streak.history.find((h) => h.date === dateString);

      calendar.push({
        date: dateString,
        active: !!activity,
        type: activity?.type,
        streak: activity?.streak,
      });
    }

    return calendar;
  }

  /**
   * Helper: Get date string (YYYY-MM-DD)
   */
  getDateString(date) {
    return date.toISOString().split('T')[0];
  }

  /**
   * Helper: Get days difference
   */
  getDaysDifference(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Load data from storage
   */
  loadData() {
    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const data = localStorage.getItem('learnai_streaks');
        if (data) {
          const parsed = JSON.parse(data);
          this.streaks = new Map(Object.entries(parsed.streaks || {}));
        }
      }
    } catch (error) {
      console.error('Error loading streak data:', error);
    }
  }

  /**
   * Save data to storage
   */
  saveData() {
    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const data = {
          streaks: Object.fromEntries(this.streaks),
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem('learnai_streaks', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error saving streak data:', error);
    }
  }

  /**
   * Clear all data
   */
  clearData() {
    this.streaks.clear();
    if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('learnai_streaks');
    }
  }
}

/**
 * HabitTracker
 * Manages custom learning habits and goals
 */
export class HabitTracker {
  constructor(storage = 'localStorage') {
    this.storage = storage;
    this.habits = new Map();
    this.loadData();
  }

  /**
   * Create a new habit
   */
  createHabit(studentId, habitData) {
    const {
      name,
      description,
      type = 'daily', // daily, weekly, custom
      target,
      unit,
      icon = '✅',
      reminderTime = null,
      startDate = new Date().toISOString(),
    } = habitData;

    const habit = {
      id: this.generateHabitId(),
      studentId,
      name,
      description,
      type,
      target,
      unit,
      icon,
      reminderTime,
      startDate,
      status: 'active', // active, paused, completed, archived
      currentStreak: 0,
      longestStreak: 0,
      completions: [],
      progress: [],
    };

    if (!this.habits.has(studentId)) {
      this.habits.set(studentId, []);
    }

    this.habits.get(studentId).push(habit);
    this.saveData();

    return habit;
  }

  /**
   * Create habit from template
   */
  createHabitFromTemplate(studentId, templateKey, customizations = {}) {
    const template = HABIT_TEMPLATES[templateKey];
    if (!template) {
      throw new Error(`Template ${templateKey} not found`);
    }

    return this.createHabit(studentId, {
      ...template,
      ...customizations,
    });
  }

  /**
   * Record habit completion/progress
   */
  recordProgress(habitId, progress) {
    const habit = this.findHabit(habitId);
    if (!habit) {
      throw new Error('Habit not found');
    }

    const today = new Date().toISOString().split('T')[0];

    const progressRecord = {
      date: today,
      value: progress,
      timestamp: new Date().toISOString(),
    };

    // Check if already recorded today
    const todayProgress = habit.progress.find((p) => p.date === today);

    if (todayProgress) {
      // Update today's progress
      todayProgress.value = Math.max(todayProgress.value, progress);
    } else {
      habit.progress.push(progressRecord);
    }

    // Check if target met
    const targetMet = progress >= habit.target;

    if (targetMet && !todayProgress) {
      // First completion today
      habit.completions.push({
        date: today,
        value: progress,
        timestamp: new Date().toISOString(),
      });

      // Update streak
      this.updateHabitStreak(habit);
    }

    this.saveData();

    return {
      habitId: habit.id,
      progress,
      targetMet,
      currentStreak: habit.currentStreak,
      progressPercentage: Math.min((progress / habit.target) * 100, 100),
    };
  }

  /**
   * Update habit streak
   */
  updateHabitStreak(habit) {
    const today = new Date().toISOString().split('T')[0];
    const completions = habit.completions;

    if (completions.length === 0) {
      habit.currentStreak = 0;
      return;
    }

    // Sort completions by date
    completions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate current streak
    let streak = 0;
    let currentDate = new Date(today);

    for (let i = completions.length - 1; i >= 0; i--) {
      const completionDate = new Date(completions[i].date);
      const dateString = completionDate.toISOString().split('T')[0];
      const expectedDate = currentDate.toISOString().split('T')[0];

      if (dateString === expectedDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    habit.currentStreak = streak;
    habit.longestStreak = Math.max(habit.longestStreak, streak);
  }

  /**
   * Get habit by ID
   */
  findHabit(habitId) {
    for (const [studentId, habits] of this.habits.entries()) {
      const habit = habits.find((h) => h.id === habitId);
      if (habit) return habit;
    }
    return null;
  }

  /**
   * Get all habits for student
   */
  getHabits(studentId, filters = {}) {
    let habits = this.habits.get(studentId) || [];

    if (filters.status) {
      habits = habits.filter((h) => h.status === filters.status);
    }

    if (filters.type) {
      habits = habits.filter((h) => h.type === filters.type);
    }

    return habits;
  }

  /**
   * Get habit statistics
   */
  getHabitStats(habitId) {
    const habit = this.findHabit(habitId);
    if (!habit) return null;

    const today = new Date().toISOString().split('T')[0];
    const todayProgress = habit.progress.find((p) => p.date === today);

    const totalCompletions = habit.completions.length;
    const daysSinceStart = Math.floor(
      (new Date() - new Date(habit.startDate)) / (1000 * 60 * 60 * 24)
    );
    const completionRate = daysSinceStart > 0 ? (totalCompletions / daysSinceStart) * 100 : 0;

    return {
      habitId: habit.id,
      name: habit.name,
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
      totalCompletions,
      completionRate: Math.round(completionRate),
      todayProgress: todayProgress?.value || 0,
      todayCompleted: todayProgress ? todayProgress.value >= habit.target : false,
      target: habit.target,
      unit: habit.unit,
    };
  }

  /**
   * Get today's habits dashboard
   */
  getTodaysDashboard(studentId) {
    const habits = this.getHabits(studentId, { status: 'active' });
    const today = new Date().toISOString().split('T')[0];

    const dashboard = habits.map((habit) => {
      const todayProgress = habit.progress.find((p) => p.date === today);
      const progress = todayProgress?.value || 0;
      const completed = progress >= habit.target;

      return {
        habitId: habit.id,
        name: habit.name,
        icon: habit.icon,
        progress,
        target: habit.target,
        unit: habit.unit,
        completed,
        progressPercentage: Math.min((progress / habit.target) * 100, 100),
        currentStreak: habit.currentStreak,
      };
    });

    const totalHabits = dashboard.length;
    const completedHabits = dashboard.filter((h) => h.completed).length;

    return {
      date: today,
      habits: dashboard,
      summary: {
        total: totalHabits,
        completed: completedHabits,
        remaining: totalHabits - completedHabits,
        completionRate: totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0,
      },
    };
  }

  /**
   * Update habit status
   */
  updateHabitStatus(habitId, status) {
    const habit = this.findHabit(habitId);
    if (!habit) {
      throw new Error('Habit not found');
    }

    habit.status = status;
    this.saveData();

    return habit;
  }

  /**
   * Delete habit
   */
  deleteHabit(habitId) {
    for (const [studentId, habits] of this.habits.entries()) {
      const index = habits.findIndex((h) => h.id === habitId);
      if (index !== -1) {
        habits.splice(index, 1);
        this.saveData();
        return true;
      }
    }
    return false;
  }

  /**
   * Generate habit ID
   */
  generateHabitId() {
    return `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Load data from storage
   */
  loadData() {
    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const data = localStorage.getItem('learnai_habits');
        if (data) {
          const parsed = JSON.parse(data);
          this.habits = new Map(Object.entries(parsed.habits || {}));
        }
      }
    } catch (error) {
      console.error('Error loading habit data:', error);
    }
  }

  /**
   * Save data to storage
   */
  saveData() {
    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const data = {
          habits: Object.fromEntries(this.habits),
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem('learnai_habits', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error saving habit data:', error);
    }
  }

  /**
   * Clear all data
   */
  clearData() {
    this.habits.clear();
    if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('learnai_habits');
    }
  }
}

/**
 * Example Usage
 */

/*
// Initialize systems
const streakTracker = new StreakTracker();
const habitTracker = new HabitTracker();

// Record activity to maintain streak
const result = streakTracker.recordActivity('student123', {
  sessionType: 'practice',
  duration: 25,
});

console.log('Current streak:', result.currentStreak);
console.log('New milestones:', result.newMilestones);

// Get streak stats
const stats = streakTracker.getStreakStats('student123');
console.log('Days active:', stats.totalDaysActive);
console.log('Longest streak:', stats.longestStreak);
console.log('Freezes available:', stats.freezesAvailable);

// Create a habit
const habit = habitTracker.createHabitFromTemplate('student123', 'dailyPractice');

// Record progress
habitTracker.recordProgress(habit.id, 1); // Completed 1 session

// Get today's habits dashboard
const dashboard = habitTracker.getTodaysDashboard('student123');
console.log('Today:', dashboard.summary.completed, '/', dashboard.summary.total);

// Get activity calendar
const calendar = streakTracker.getActivityCalendar('student123', 30);
console.log('Last 30 days activity:', calendar);
*/

export { HABIT_TEMPLATES, STREAK_MILESTONES };
