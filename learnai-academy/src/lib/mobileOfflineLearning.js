/**
 * Mobile-First & Offline Learning System
 *
 * Enables learning anywhere, anytime:
 * - Offline content download and automatic syncing
 * - Mobile-optimized study sessions and UI
 * - Push notifications for reminders and updates
 * - Quick practice sessions (5-10 min micro-learning)
 * - Voice-activated learning and hands-free mode
 * - Progressive Web App (PWA) support
 * - Bandwidth optimization for slow connections
 * - Background sync when online
 * - Offline assessment with queue upload
 * - Mobile-first responsive design
 *
 * Makes learning accessible on any device, with or without internet.
 */

// Sync statuses
const SYNC_STATUS = {
  SYNCED: 'synced',
  PENDING: 'pending',
  SYNCING: 'syncing',
  ERROR: 'error',
  OFFLINE: 'offline',
};

// Download priorities
const DOWNLOAD_PRIORITY = {
  HIGH: 'high', // Current lessons, due soon assignments
  MEDIUM: 'medium', // Upcoming content
  LOW: 'low', // Optional content
  BACKGROUND: 'background', // Nice to have
};

// Content types that can be downloaded
const DOWNLOADABLE_CONTENT = {
  LESSON: 'lesson',
  PRACTICE: 'practice',
  VIDEO: 'video',
  READING: 'reading',
  ASSESSMENT: 'assessment',
  NOTES: 'notes',
};

// Notification types
const NOTIFICATION_TYPES = {
  REMINDER: 'reminder',
  ASSIGNMENT_DUE: 'assignment_due',
  NEW_MESSAGE: 'new_message',
  ACHIEVEMENT: 'achievement',
  STUDY_TIME: 'study_time',
  SYNC_COMPLETE: 'sync_complete',
};

/**
 * Offline Content Manager - Handles offline content storage and sync
 */
export class OfflineContentManager {
  constructor(storageKey = 'offline_content') {
    this.storageKey = storageKey;
    this.downloadQueue = [];
    this.syncQueue = [];
    this.isOnline = navigator.onLine;
    this.storage = this.initStorage();

    // Listen for online/offline events
    this.setupNetworkListeners();
  }

  /**
   * Initialize storage
   */
  initStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {
        downloads: {},
        pending: [],
        lastSync: null,
      };
    } catch (error) {
      console.error('Error initializing storage:', error);
      return { downloads: {}, pending: [], lastSync: null };
    }
  }

  /**
   * Save storage
   */
  saveStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.storage));
    } catch (error) {
      console.error('Error saving storage:', error);
    }
  }

  /**
   * Setup network listeners
   */
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.onNetworkStatusChange('online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.onNetworkStatusChange('offline');
    });
  }

  /**
   * Handle network status change
   */
  async onNetworkStatusChange(status) {
    console.log(`Network status: ${status}`);

    if (status === 'online') {
      // Auto-sync when coming back online
      await this.syncPendingActions();
      await this.processDownloadQueue();
    }
  }

  /**
   * Download content for offline use
   */
  async downloadContent(contentId, contentType, priority = DOWNLOAD_PRIORITY.MEDIUM) {
    const download = {
      id: `download_${Date.now()}`,
      contentId,
      contentType,
      priority,
      status: SYNC_STATUS.PENDING,
      requestedAt: new Date().toISOString(),
    };

    this.downloadQueue.push(download);

    // Sort queue by priority
    this.downloadQueue.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2, background: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    if (this.isOnline) {
      return this.processDownloadQueue();
    }

    return {
      queued: true,
      message: 'Download queued. Will process when online.',
    };
  }

  /**
   * Process download queue
   */
  async processDownloadQueue() {
    if (!this.isOnline || this.downloadQueue.length === 0) {
      return;
    }

    const download = this.downloadQueue.shift();
    download.status = SYNC_STATUS.SYNCING;

    try {
      const content = await this.fetchContent(download.contentId, download.contentType);

      this.storage.downloads[download.contentId] = {
        id: download.contentId,
        type: download.contentType,
        content,
        downloadedAt: new Date().toISOString(),
        size: this.estimateSize(content),
        status: SYNC_STATUS.SYNCED,
      };

      this.saveStorage();

      // Continue with next download
      if (this.downloadQueue.length > 0) {
        setTimeout(() => this.processDownloadQueue(), 100);
      }

      return { success: true, download };
    } catch (error) {
      console.error('Error downloading content:', error);
      download.status = SYNC_STATUS.ERROR;
      download.error = error.message;

      // Retry later for high priority
      if (download.priority === DOWNLOAD_PRIORITY.HIGH) {
        download.retryCount = (download.retryCount || 0) + 1;
        if (download.retryCount < 3) {
          this.downloadQueue.push(download);
        }
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch content from server
   */
  async fetchContent(contentId, contentType) {
    // In production, would fetch from API
    // Simulating network request
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: contentId,
          type: contentType,
          data: `Content for ${contentId}`,
          metadata: {},
        });
      }, 500);
    });
  }

  /**
   * Estimate content size
   */
  estimateSize(content) {
    return JSON.stringify(content).length;
  }

  /**
   * Get offline content
   */
  getOfflineContent(contentId) {
    return this.storage.downloads[contentId] || null;
  }

  /**
   * Check if content available offline
   */
  isAvailableOffline(contentId) {
    return !!this.storage.downloads[contentId];
  }

  /**
   * Queue action for sync when online
   */
  queueAction(action) {
    const queuedAction = {
      id: `action_${Date.now()}`,
      ...action,
      queuedAt: new Date().toISOString(),
      status: SYNC_STATUS.PENDING,
    };

    this.storage.pending.push(queuedAction);
    this.saveStorage();

    if (this.isOnline) {
      this.syncPendingActions();
    }

    return queuedAction;
  }

  /**
   * Sync pending actions
   */
  async syncPendingActions() {
    if (!this.isOnline || this.storage.pending.length === 0) {
      return { synced: 0 };
    }

    const pending = [...this.storage.pending];
    let syncedCount = 0;

    for (const action of pending) {
      try {
        action.status = SYNC_STATUS.SYNCING;

        // Execute the action
        await this.executeAction(action);

        // Remove from pending
        this.storage.pending = this.storage.pending.filter(a => a.id !== action.id);
        syncedCount++;
      } catch (error) {
        console.error('Error syncing action:', error);
        action.status = SYNC_STATUS.ERROR;
        action.error = error.message;
      }
    }

    this.storage.lastSync = new Date().toISOString();
    this.saveStorage();

    return { synced: syncedCount, failed: pending.length - syncedCount };
  }

  /**
   * Execute a queued action
   */
  async executeAction(action) {
    // In production, would send to API
    console.log('Executing action:', action.type);

    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(resolve, 200);
    });
  }

  /**
   * Get storage stats
   */
  getStorageStats() {
    const totalDownloads = Object.keys(this.storage.downloads).length;
    const totalSize = Object.values(this.storage.downloads)
      .reduce((sum, d) => sum + (d.size || 0), 0);

    const pendingActions = this.storage.pending.length;

    return {
      totalDownloads,
      totalSize,
      totalSizeReadable: this.formatBytes(totalSize),
      pendingActions,
      lastSync: this.storage.lastSync,
      isOnline: this.isOnline,
    };
  }

  /**
   * Format bytes to readable string
   */
  formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  /**
   * Clear offline storage
   */
  clearOfflineStorage() {
    this.storage.downloads = {};
    this.saveStorage();

    return { cleared: true };
  }
}

/**
 * Mobile Notification Manager - Push notifications
 */
export class MobileNotificationManager {
  constructor(storageKey = 'notifications') {
    this.storageKey = storageKey;
    this.notifications = this.loadNotifications();
    this.permission = 'default';
    this.checkPermission();
  }

  /**
   * Load notifications
   */
  loadNotifications() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }

  /**
   * Save notifications
   */
  saveNotifications() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  /**
   * Check notification permission
   */
  async checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission;
    }
    return 'denied';
  }

  /**
   * Schedule notification
   */
  scheduleNotification(notificationData) {
    const notification = {
      id: `notif_${Date.now()}`,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      scheduledFor: notificationData.scheduledFor,
      data: notificationData.data || {},
      sent: false,
      createdAt: new Date().toISOString(),
    };

    this.notifications.push(notification);
    this.saveNotifications();

    // Schedule the notification
    this.scheduleDelivery(notification);

    return notification;
  }

  /**
   * Schedule delivery
   */
  scheduleDelivery(notification) {
    const scheduledTime = new Date(notification.scheduledFor);
    const now = new Date();
    const delay = scheduledTime - now;

    if (delay > 0) {
      setTimeout(() => {
        this.sendNotification(notification);
      }, delay);
    } else {
      // Send immediately if time has passed
      this.sendNotification(notification);
    }
  }

  /**
   * Send notification
   */
  async sendNotification(notification) {
    if (this.permission !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    try {
      const n = new Notification(notification.title, {
        body: notification.message,
        icon: '/icon.png',
        badge: '/badge.png',
        tag: notification.id,
        data: notification.data,
      });

      notification.sent = true;
      notification.sentAt = new Date().toISOString();
      this.saveNotifications();

      // Handle notification click
      n.onclick = () => {
        this.handleNotificationClick(notification);
      };
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * Handle notification click
   */
  handleNotificationClick(notification) {
    // Navigate to relevant page based on notification type
    console.log('Notification clicked:', notification.type);

    // In production, would use router to navigate
    switch (notification.type) {
      case NOTIFICATION_TYPES.ASSIGNMENT_DUE:
        // Navigate to assignment
        break;
      case NOTIFICATION_TYPES.NEW_MESSAGE:
        // Navigate to messages
        break;
      // More handlers...
    }
  }

  /**
   * Create study reminder
   */
  createStudyReminder(time, subject) {
    return this.scheduleNotification({
      type: NOTIFICATION_TYPES.STUDY_TIME,
      title: 'Study Time!',
      message: `Time to study ${subject}`,
      scheduledFor: time,
      data: { subject },
    });
  }

  /**
   * Create assignment reminder
   */
  createAssignmentReminder(assignment, minutesBefore = 60) {
    const dueDate = new Date(assignment.dueDate);
    const reminderTime = new Date(dueDate.getTime() - minutesBefore * 60 * 1000);

    return this.scheduleNotification({
      type: NOTIFICATION_TYPES.ASSIGNMENT_DUE,
      title: 'Assignment Due Soon',
      message: `${assignment.title} is due in ${minutesBefore} minutes`,
      scheduledFor: reminderTime.toISOString(),
      data: { assignmentId: assignment.id },
    });
  }
}

/**
 * Quick Practice Session Manager - Micro-learning sessions
 */
export class QuickPracticeManager {
  constructor() {
    this.sessionDurations = {
      micro: 5, // 5 minutes
      short: 10, // 10 minutes
      standard: 15, // 15 minutes
    };
  }

  /**
   * Generate quick practice session
   */
  async generateQuickSession(student, duration = 'micro', subject = null) {
    const minutes = this.sessionDurations[duration];

    // Determine number of questions (roughly 1-2 min per question)
    const questionCount = Math.floor(minutes / 1.5);

    const session = {
      id: `quick_${Date.now()}`,
      studentId: student.id,
      duration: minutes,
      questionCount,
      subject: subject || this.selectSubject(student),
      questions: [],
      startedAt: null,
      completedAt: null,
    };

    // Generate appropriate questions
    session.questions = await this.generateQuestions(
      session.subject,
      questionCount,
      student.grade
    );

    return session;
  }

  /**
   * Select subject based on student needs
   */
  selectSubject(student) {
    // Prioritize subjects that need practice
    const needsPractice = student.skillGaps || [];

    if (needsPractice.length > 0) {
      // Return subject with most gaps
      return needsPractice[0];
    }

    // Default to a recent subject
    return student.recentSubjects?.[0] || 'math';
  }

  /**
   * Generate questions for quick session
   */
  async generateQuestions(subject, count, grade) {
    // Would integrate with AI Content Generator
    const questions = [];

    for (let i = 0; i < count; i++) {
      questions.push({
        id: `q${i + 1}`,
        subject,
        question: `Quick ${subject} question ${i + 1} for grade ${grade}`,
        type: 'multiple_choice',
        options: ['A', 'B', 'C', 'D'],
        answer: 'A',
        estimatedTime: 90, // seconds
      });
    }

    return questions;
  }

  /**
   * Complete quick session
   */
  completeQuickSession(sessionId, responses) {
    // Grade responses and return immediate feedback
    const score = this.gradeSession(responses);

    return {
      sessionId,
      score,
      feedback: this.generateQuickFeedback(score),
      completedAt: new Date().toISOString(),
    };
  }

  /**
   * Grade session
   */
  gradeSession(responses) {
    // Simplified grading
    const correct = responses.filter(r => r.correct).length;
    const total = responses.length;

    return {
      correct,
      total,
      percentage: (correct / total) * 100,
    };
  }

  /**
   * Generate quick feedback
   */
  generateQuickFeedback(score) {
    if (score.percentage >= 80) {
      return {
        message: 'Great job! Keep it up!',
        emoji: '🌟',
      };
    } else if (score.percentage >= 60) {
      return {
        message: 'Good effort! Review the missed questions.',
        emoji: '👍',
      };
    } else {
      return {
        message: 'Keep practicing! You\'re learning!',
        emoji: '💪',
      };
    }
  }
}

/**
 * Voice Learning Controller - Voice-activated learning
 */
export class VoiceLearningController {
  constructor() {
    this.isListening = false;
    this.recognition = this.initSpeechRecognition();
    this.synthesis = window.speechSynthesis;
  }

  /**
   * Initialize speech recognition
   */
  initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      return recognition;
    }

    return null;
  }

  /**
   * Start voice command listening
   */
  startListening(onCommand) {
    if (!this.recognition) {
      console.error('Speech recognition not supported');
      return;
    }

    this.recognition.onresult = (event) => {
      const command = event.results[0][0].transcript;
      this.processVoiceCommand(command, onCommand);
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    this.recognition.start();
    this.isListening = true;
  }

  /**
   * Stop listening
   */
  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Process voice command
   */
  processVoiceCommand(command, callback) {
    const lowerCommand = command.toLowerCase();

    let action = null;

    if (lowerCommand.includes('next question')) {
      action = { type: 'next_question' };
    } else if (lowerCommand.includes('repeat') || lowerCommand.includes('say again')) {
      action = { type: 'repeat' };
    } else if (lowerCommand.includes('hint')) {
      action = { type: 'hint' };
    } else if (lowerCommand.includes('answer is')) {
      const answer = lowerCommand.replace('answer is', '').trim();
      action = { type: 'answer', value: answer };
    } else if (lowerCommand.includes('help')) {
      action = { type: 'help' };
    }

    if (action && callback) {
      callback(action);
    }
  }

  /**
   * Speak text
   */
  speak(text, options = {}) {
    if (!this.synthesis) {
      console.error('Speech synthesis not supported');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;
    utterance.lang = options.lang || 'en-US';

    this.synthesis.speak(utterance);
  }

  /**
   * Read question aloud
   */
  readQuestion(question) {
    this.speak(question.question);

    if (question.options) {
      setTimeout(() => {
        const optionsText = question.options
          .map((opt, i) => `Option ${String.fromCharCode(65 + i)}: ${opt}`)
          .join('. ');
        this.speak(optionsText);
      }, 2000);
    }
  }
}

export {
  SYNC_STATUS,
  DOWNLOAD_PRIORITY,
  DOWNLOADABLE_CONTENT,
  NOTIFICATION_TYPES,
};

export default OfflineContentManager;
