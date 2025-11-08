/**
 * Smart Notification System
 * Intelligent notifications that encourage learning without being disruptive
 */

/**
 * Notification types and templates
 */
const NOTIFICATION_TEMPLATES = {
  // Streak notifications
  streakReminder: {
    type: 'streak',
    priority: 'high',
    title: '🔥 Keep Your Streak Alive!',
    getMessage: (data) => `You're on a ${data.streak}-day streak! Don't break it today.`,
    action: { text: 'Study Now', route: '/learn' },
  },
  streakAtRisk: {
    type: 'streak',
    priority: 'urgent',
    title: '⚠️ Streak at Risk!',
    getMessage: () => 'Your streak will end in a few hours. Quick session?',
    action: { text: 'Save Streak', route: '/learn' },
  },
  streakMilestone: {
    type: 'achievement',
    priority: 'high',
    title: '🎉 Streak Milestone!',
    getMessage: (data) => `Amazing! You've reached a ${data.milestone}-day streak!`,
    action: { text: 'Celebrate', route: '/achievements' },
  },

  // Review notifications
  reviewsDue: {
    type: 'review',
    priority: 'medium',
    title: '♻️ Time to Review!',
    getMessage: (data) => `${data.count} items are ready for review.`,
    action: { text: 'Start Review', route: '/review' },
  },
  reviewOverdue: {
    type: 'review',
    priority: 'high',
    title: '📚 Reviews Waiting',
    getMessage: (data) => `${data.count} reviews are overdue. Quick refresh?`,
    action: { text: 'Review Now', route: '/review' },
  },

  // Achievement notifications
  achievementUnlocked: {
    type: 'achievement',
    priority: 'high',
    title: '🏆 Achievement Unlocked!',
    getMessage: (data) => `You earned: ${data.achievement}`,
    action: { text: 'View Achievement', route: '/achievements' },
  },
  pointsMilestone: {
    type: 'achievement',
    priority: 'medium',
    title: '⭐ Points Milestone!',
    getMessage: (data) => `You've earned ${data.points} points!`,
    action: { text: 'View Progress', route: '/progress' },
  },

  // Learning notifications
  topicCompleted: {
    type: 'progress',
    priority: 'medium',
    title: '✅ Topic Mastered!',
    getMessage: (data) => `Great job completing ${data.topic}!`,
    action: { text: 'Next Topic', route: '/learn' },
  },
  newTopicAvailable: {
    type: 'progress',
    priority: 'low',
    title: '🚀 New Topic Ready!',
    getMessage: (data) => `${data.topic} is now unlocked and ready to learn.`,
    action: { text: 'Start Learning', route: '/learn' },
  },

  // Habit notifications
  habitReminder: {
    type: 'habit',
    priority: 'medium',
    title: '✅ Daily Goal Reminder',
    getMessage: (data) => `Remember to complete: ${data.habit}`,
    action: { text: 'Complete Now', route: '/learn' },
  },
  habitCompleted: {
    type: 'habit',
    priority: 'low',
    title: '🎯 Goal Complete!',
    getMessage: (data) => `You completed your ${data.habit} goal!`,
    action: null,
  },

  // Social notifications
  groupInvite: {
    type: 'social',
    priority: 'medium',
    title: '👥 Study Group Invite',
    getMessage: (data) => `${data.from} invited you to join ${data.groupName}`,
    action: { text: 'View Invite', route: '/groups' },
  },
  challengeInvite: {
    type: 'social',
    priority: 'medium',
    title: '⚔️ Challenge Invitation',
    getMessage: (data) => `${data.from} challenged you to ${data.challengeName}`,
    action: { text: 'View Challenge', route: '/challenges' },
  },
  newMessage: {
    type: 'social',
    priority: 'low',
    title: '💬 New Message',
    getMessage: (data) => `${data.from}: ${data.preview}`,
    action: { text: 'View', route: '/messages' },
  },

  // Help notifications
  tutorAvailable: {
    type: 'help',
    priority: 'medium',
    title: '🤝 Tutor Available!',
    getMessage: (data) => `${data.tutor} can help with ${data.topic}`,
    action: { text: 'Connect', route: '/tutoring' },
  },
  helpReceived: {
    type: 'help',
    priority: 'high',
    title: '💡 Help Arrived!',
    getMessage: (data) => `${data.tutor} responded to your question`,
    action: { text: 'View Response', route: '/tutoring' },
  },

  // Motivational notifications
  encouragement: {
    type: 'motivational',
    priority: 'low',
    title: '💪 You Can Do It!',
    getMessage: () => getEncouragementMessage(),
    action: { text: 'Let\'s Go!', route: '/learn' },
  },
  celebrateProgress: {
    type: 'motivational',
    priority: 'low',
    title: '🌟 Look How Far You've Come!',
    getMessage: (data) => `You've mastered ${data.topics} topics this month!`,
    action: { text: 'View Progress', route: '/progress' },
  },
};

/**
 * Encouragement messages
 */
const ENCOURAGEMENT_MESSAGES = [
  'Every expert was once a beginner. Keep going!',
  'You're making amazing progress!',
  'Learning is a journey. Enjoy every step!',
  'Your hard work is paying off!',
  'Small steps lead to big achievements!',
  'You're doing great! Keep it up!',
  'Believe in yourself!',
  'Practice makes progress!',
  'You're building great habits!',
  'Your future self will thank you!',
];

function getEncouragementMessage() {
  return ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)];
}

/**
 * NotificationSystem
 * Manages all notifications with intelligent scheduling
 */
export class NotificationSystem {
  constructor(storage = 'localStorage') {
    this.storage = storage;
    this.notifications = new Map();
    this.preferences = this.loadPreferences();
    this.scheduledNotifications = new Map();
    this.loadData();
  }

  /**
   * Create a notification
   */
  createNotification(templateKey, data = {}) {
    const template = NOTIFICATION_TEMPLATES[templateKey];

    if (!template) {
      throw new Error(`Template ${templateKey} not found`);
    }

    // Check if notifications are enabled for this type
    if (!this.isNotificationEnabled(template.type)) {
      return null;
    }

    // Check quiet hours
    if (this.isQuietHours()) {
      return null;
    }

    const notification = {
      id: this.generateNotificationId(),
      type: template.type,
      priority: template.priority,
      title: template.title,
      message: template.getMessage(data),
      action: template.action,
      data,
      createdAt: new Date().toISOString(),
      read: false,
      dismissed: false,
      expiresAt: this.calculateExpiry(template.priority),
    };

    this.notifications.set(notification.id, notification);
    this.saveData();

    // Trigger browser notification if enabled
    if (this.preferences.browserNotifications) {
      this.showBrowserNotification(notification);
    }

    return notification;
  }

  /**
   * Schedule a notification
   */
  scheduleNotification(templateKey, data, scheduledTime) {
    const scheduleId = this.generateScheduleId();

    const scheduled = {
      id: scheduleId,
      templateKey,
      data,
      scheduledTime,
      status: 'pending', // pending, sent, cancelled
    };

    this.scheduledNotifications.set(scheduleId, scheduled);
    this.saveData();

    // Set timeout if time is soon
    const timeUntil = new Date(scheduledTime) - new Date();
    if (timeUntil > 0 && timeUntil < 24 * 60 * 60 * 1000) {
      // Within 24 hours
      setTimeout(() => {
        this.sendScheduledNotification(scheduleId);
      }, timeUntil);
    }

    return scheduled;
  }

  /**
   * Send scheduled notification
   */
  sendScheduledNotification(scheduleId) {
    const scheduled = this.scheduledNotifications.get(scheduleId);

    if (!scheduled || scheduled.status !== 'pending') {
      return;
    }

    this.createNotification(scheduled.templateKey, scheduled.data);
    scheduled.status = 'sent';
    this.saveData();
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId) {
    const notification = this.notifications.get(notificationId);

    if (notification) {
      notification.read = true;
      this.saveData();
    }
  }

  /**
   * Dismiss notification
   */
  dismiss(notificationId) {
    const notification = this.notifications.get(notificationId);

    if (notification) {
      notification.dismissed = true;
      this.saveData();
    }
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications() {
    return Array.from(this.notifications.values())
      .filter((n) => !n.read && !n.dismissed && !this.isExpired(n))
      .sort((a, b) => this.priorityValue(b.priority) - this.priorityValue(a.priority));
  }

  /**
   * Get all notifications
   */
  getAllNotifications(limit = 50) {
    return Array.from(this.notifications.values())
      .filter((n) => !this.isExpired(n))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  /**
   * Get notifications by type
   */
  getNotificationsByType(type) {
    return Array.from(this.notifications.values())
      .filter((n) => n.type === type && !this.isExpired(n))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Update notification preferences
   */
  updatePreferences(newPreferences) {
    this.preferences = { ...this.preferences, ...newPreferences };
    this.savePreferences();
  }

  /**
   * Check if notification type is enabled
   */
  isNotificationEnabled(type) {
    const typePreference = this.preferences.types[type];
    return typePreference !== false && this.preferences.enabled;
  }

  /**
   * Check if currently in quiet hours
   */
  isQuietHours() {
    if (!this.preferences.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentHour = now.getHours();

    const { start, end } = this.preferences.quietHours;

    if (start < end) {
      return currentHour >= start && currentHour < end;
    } else {
      // Quiet hours span midnight
      return currentHour >= start || currentHour < end;
    }
  }

  /**
   * Show browser notification
   */
  async showBrowserNotification(notification) {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    // Request permission if needed
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
      });
    }
  }

  /**
   * Calculate expiry time based on priority
   */
  calculateExpiry(priority) {
    const now = new Date();
    const expiryHours = {
      urgent: 4,
      high: 12,
      medium: 24,
      low: 48,
    };

    now.setHours(now.getHours() + (expiryHours[priority] || 24));
    return now.toISOString();
  }

  /**
   * Check if notification is expired
   */
  isExpired(notification) {
    return new Date(notification.expiresAt) < new Date();
  }

  /**
   * Get priority numerical value
   */
  priorityValue(priority) {
    const values = {
      urgent: 4,
      high: 3,
      medium: 2,
      low: 1,
    };
    return values[priority] || 0;
  }

  /**
   * Clear old notifications
   */
  clearOldNotifications() {
    const now = new Date();
    const cutoffDate = new Date(now - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    for (const [id, notification] of this.notifications.entries()) {
      if (new Date(notification.createdAt) < cutoffDate || this.isExpired(notification)) {
        this.notifications.delete(id);
      }
    }

    this.saveData();
  }

  /**
   * Generate notification ID
   */
  generateNotificationId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate schedule ID
   */
  generateScheduleId() {
    return `sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Load preferences
   */
  loadPreferences() {
    const defaults = {
      enabled: true,
      browserNotifications: false,
      sound: true,
      types: {
        streak: true,
        review: true,
        achievement: true,
        progress: true,
        habit: true,
        social: true,
        help: true,
        motivational: true,
      },
      quietHours: {
        enabled: false,
        start: 22, // 10 PM
        end: 8, // 8 AM
      },
      frequency: {
        encouragement: 'daily', // never, daily, weekly
        progress: 'weekly',
      },
    };

    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('learnai_notification_preferences');
        if (saved) {
          return { ...defaults, ...JSON.parse(saved) };
        }
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }

    return defaults;
  }

  /**
   * Save preferences
   */
  savePreferences() {
    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        localStorage.setItem(
          'learnai_notification_preferences',
          JSON.stringify(this.preferences)
        );
      }
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  }

  /**
   * Load data
   */
  loadData() {
    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const data = localStorage.getItem('learnai_notifications');
        if (data) {
          const parsed = JSON.parse(data);
          this.notifications = new Map(Object.entries(parsed.notifications || {}));
          this.scheduledNotifications = new Map(Object.entries(parsed.scheduled || {}));
        }
      }
    } catch (error) {
      console.error('Error loading notification data:', error);
    }
  }

  /**
   * Save data
   */
  saveData() {
    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const data = {
          notifications: Object.fromEntries(this.notifications),
          scheduled: Object.fromEntries(this.scheduledNotifications),
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem('learnai_notifications', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error saving notification data:', error);
    }
  }

  /**
   * Clear all data
   */
  clearData() {
    this.notifications.clear();
    this.scheduledNotifications.clear();
    if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('learnai_notifications');
    }
  }
}

/**
 * NotificationScheduler
 * Automatically schedules smart notifications based on user activity
 */
export class NotificationScheduler {
  constructor(notificationSystem, learningHub) {
    this.notificationSystem = notificationSystem;
    this.learningHub = learningHub;
  }

  /**
   * Schedule daily notifications for a student
   */
  scheduleDailyNotifications(studentId, studentData) {
    const now = new Date();

    // Streak reminder (if not studied today)
    if (studentData.lastActivityDate !== now.toISOString().split('T')[0]) {
      const reminderTime = new Date(now);
      reminderTime.setHours(17, 0, 0); // 5 PM

      if (reminderTime > now) {
        this.notificationSystem.scheduleNotification(
          'streakReminder',
          { streak: studentData.currentStreak },
          reminderTime.toISOString()
        );
      }
    }

    // Review reminder (if reviews due)
    if (studentData.reviewsDue > 0) {
      const reviewTime = new Date(now);
      reviewTime.setHours(16, 0, 0); // 4 PM

      if (reviewTime > now) {
        this.notificationSystem.scheduleNotification(
          'reviewsDue',
          { count: studentData.reviewsDue },
          reviewTime.toISOString()
        );
      }
    }

    // Habit reminders
    if (studentData.habits) {
      studentData.habits.forEach((habit) => {
        if (!habit.completed && habit.reminderTime) {
          const habitTime = new Date(now);
          const [hours, minutes] = habit.reminderTime.split(':');
          habitTime.setHours(parseInt(hours), parseInt(minutes), 0);

          if (habitTime > now) {
            this.notificationSystem.scheduleNotification(
              'habitReminder',
              { habit: habit.name },
              habitTime.toISOString()
            );
          }
        }
      });
    }

    // Motivational message (once per day)
    const motivationTime = new Date(now);
    motivationTime.setHours(9, 0, 0); // 9 AM

    if (motivationTime > now) {
      this.notificationSystem.scheduleNotification(
        'encouragement',
        {},
        motivationTime.toISOString()
      );
    }
  }

  /**
   * Check and trigger immediate notifications
   */
  checkImmediateNotifications(studentId, studentData) {
    // Streak at risk (last few hours)
    const lastActivity = new Date(studentData.lastActivityDate);
    const hoursSinceActivity = (new Date() - lastActivity) / 1000 / 60 / 60;

    if (hoursSinceActivity > 20 && hoursSinceActivity < 24) {
      this.notificationSystem.createNotification('streakAtRisk', {});
    }

    // Overdue reviews
    if (studentData.reviewsOverdue > 5) {
      this.notificationSystem.createNotification('reviewOverdue', {
        count: studentData.reviewsOverdue,
      });
    }
  }
}

/**
 * Example Usage
 */

/*
// Initialize system
const notifications = new NotificationSystem();
const scheduler = new NotificationScheduler(notifications, learningHub);

// Create a notification
notifications.createNotification('achievementUnlocked', {
  achievement: 'Math Champion',
});

// Schedule future notification
notifications.scheduleNotification(
  'streakReminder',
  { streak: 7 },
  new Date(Date.now() + 3600000).toISOString() // 1 hour from now
);

// Get unread notifications
const unread = notifications.getUnreadNotifications();
console.log('Unread:', unread.length);

// Mark as read
notifications.markAsRead(unread[0].id);

// Update preferences
notifications.updatePreferences({
  quietHours: {
    enabled: true,
    start: 22,
    end: 8,
  },
});

// Schedule daily notifications
scheduler.scheduleDailyNotifications('student123', {
  currentStreak: 7,
  lastActivityDate: '2024-01-15',
  reviewsDue: 5,
});

// Check immediate notifications
scheduler.checkImmediateNotifications('student123', {
  lastActivityDate: '2024-01-14T10:00:00',
  reviewsOverdue: 10,
});
*/

export { NotificationSystem, NotificationScheduler, NOTIFICATION_TEMPLATES };
