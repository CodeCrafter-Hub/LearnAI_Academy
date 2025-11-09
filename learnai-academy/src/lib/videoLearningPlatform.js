/**
 * Video Learning Platform
 *
 * Comprehensive video-based learning system:
 * - Video lesson library with categorization and search
 * - Interactive video player with advanced controls
 * - Video bookmarks and timestamped notes
 * - Speed controls, quality selection, captions
 * - Interactive quizzes embedded in videos
 * - Video transcripts with search and highlighting
 * - Watch history and progress tracking
 * - Recommended videos based on learning path
 * - Video playlists and learning sequences
 * - Creator tools for teachers to upload lessons
 * - Video analytics (watch time, completion rate, engagement)
 * - Offline video download for mobile
 *
 * Makes video learning interactive, trackable, and effective.
 */

import Anthropic from '@anthropic-ai/sdk';

// Video types
const VIDEO_TYPES = {
  LECTURE: 'lecture',
  TUTORIAL: 'tutorial',
  DEMONSTRATION: 'demonstration',
  ANIMATION: 'animation',
  DOCUMENTARY: 'documentary',
  REVIEW: 'review',
};

// Video quality levels
const VIDEO_QUALITY = {
  AUTO: 'auto',
  HD_1080: '1080p',
  HD_720: '720p',
  SD_480: '480p',
  SD_360: '360p',
};

// Playback speeds
const PLAYBACK_SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

// Interaction types
const INTERACTION_TYPES = {
  QUIZ: 'quiz',
  POLL: 'poll',
  REFLECTION: 'reflection',
  NOTE_PROMPT: 'note_prompt',
  CHECKPOINT: 'checkpoint',
};

/**
 * Video Learning Manager - Core video platform
 */
export class VideoLearningManager {
  constructor(apiKey, storageKey = 'video_platform') {
    this.client = new Anthropic({ apiKey });
    this.model = 'claude-sonnet-4-5-20250929';
    this.storageKey = storageKey;
    this.videos = this.loadVideos();
    this.watchHistory = this.loadWatchHistory();
  }

  /**
   * Load videos
   */
  loadVideos() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading videos:', error);
      return {};
    }
  }

  /**
   * Save videos
   */
  saveVideos() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.videos));
    } catch (error) {
      console.error('Error saving videos:', error);
    }
  }

  /**
   * Load watch history
   */
  loadWatchHistory() {
    try {
      const stored = localStorage.getItem(`${this.storageKey}_history`);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading watch history:', error);
      return {};
    }
  }

  /**
   * Save watch history
   */
  saveWatchHistory() {
    try {
      localStorage.setItem(`${this.storageKey}_history`, JSON.stringify(this.watchHistory));
    } catch (error) {
      console.error('Error saving watch history:', error);
    }
  }

  /**
   * Upload/Create video lesson
   */
  async createVideo(creatorId, videoData) {
    const videoId = `video_${Date.now()}`;

    const video = {
      id: videoId,
      title: videoData.title,
      description: videoData.description,
      type: videoData.type || VIDEO_TYPES.LECTURE,
      subject: videoData.subject,
      topic: videoData.topic,
      gradeLevel: videoData.gradeLevel,
      duration: videoData.duration, // seconds
      url: videoData.url,
      thumbnailUrl: videoData.thumbnailUrl,
      creatorId,
      transcript: videoData.transcript || null,
      captions: videoData.captions || [],
      interactions: videoData.interactions || [], // Quizzes, polls at specific timestamps
      tags: videoData.tags || [],
      difficulty: videoData.difficulty || 'medium',
      createdAt: new Date().toISOString(),
      views: 0,
      completions: 0,
      averageRating: 0,
      ratings: [],
    };

    // Generate AI enhancements if transcript provided
    if (video.transcript) {
      const enhancements = await this.enhanceVideo(video);
      video.keyTopics = enhancements.keyTopics;
      video.suggestedQuestions = enhancements.suggestedQuestions;
      video.chapters = enhancements.chapters;
    }

    this.videos[videoId] = video;
    this.saveVideos();

    return video;
  }

  /**
   * Enhance video with AI
   */
  async enhanceVideo(video) {
    const systemPrompt = `Analyze this educational video transcript and provide:
1. Key topics covered (5-7 items)
2. Suggested quiz questions (3-5 questions)
3. Chapter markers with timestamps (if possible to infer from content)

Video: ${video.title}
Subject: ${video.subject}
Grade Level: ${video.gradeLevel}

Transcript:
${video.transcript}

Return as JSON:
{
  "keyTopics": ["topic1", "topic2", ...],
  "suggestedQuestions": [
    {"question": "...", "answer": "...", "timestamp": seconds}
  ],
  "chapters": [
    {"title": "...", "timestamp": seconds}
  ]
}`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1000,
        temperature: 0.4,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: 'Analyze and enhance this video.',
          },
        ],
      });

      return JSON.parse(response.content[0].text);
    } catch (error) {
      console.error('Error enhancing video:', error);
      return {
        keyTopics: [],
        suggestedQuestions: [],
        chapters: [],
      };
    }
  }

  /**
   * Start watching video
   */
  startWatching(studentId, videoId) {
    if (!this.videos[videoId]) {
      throw new Error('Video not found');
    }

    if (!this.watchHistory[studentId]) {
      this.watchHistory[studentId] = {};
    }

    const watchId = `watch_${Date.now()}`;

    this.watchHistory[studentId][videoId] = {
      watchId,
      videoId,
      startedAt: new Date().toISOString(),
      lastPosition: 0,
      completed: false,
      watchTime: 0,
      interactions: [],
      bookmarks: [],
      notes: [],
    };

    // Increment view count
    this.videos[videoId].views++;
    this.saveVideos();
    this.saveWatchHistory();

    return this.watchHistory[studentId][videoId];
  }

  /**
   * Update watch progress
   */
  updateProgress(studentId, videoId, position, watchTime) {
    if (!this.watchHistory[studentId] || !this.watchHistory[studentId][videoId]) {
      this.startWatching(studentId, videoId);
    }

    const watch = this.watchHistory[studentId][videoId];
    watch.lastPosition = position;
    watch.watchTime = watchTime;
    watch.lastWatchedAt = new Date().toISOString();

    // Check if completed (watched 90% or more)
    const video = this.videos[videoId];
    if (video && position >= video.duration * 0.9 && !watch.completed) {
      watch.completed = true;
      watch.completedAt = new Date().toISOString();
      this.videos[videoId].completions++;
      this.saveVideos();
    }

    this.saveWatchHistory();

    return watch;
  }

  /**
   * Add bookmark to video
   */
  addBookmark(studentId, videoId, timestamp, note = '') {
    if (!this.watchHistory[studentId] || !this.watchHistory[studentId][videoId]) {
      this.startWatching(studentId, videoId);
    }

    const watch = this.watchHistory[studentId][videoId];
    const bookmark = {
      id: `bookmark_${Date.now()}`,
      timestamp,
      note,
      createdAt: new Date().toISOString(),
    };

    watch.bookmarks.push(bookmark);
    this.saveWatchHistory();

    return bookmark;
  }

  /**
   * Add timestamped note
   */
  addVideoNote(studentId, videoId, timestamp, note) {
    if (!this.watchHistory[studentId] || !this.watchHistory[studentId][videoId]) {
      this.startWatching(studentId, videoId);
    }

    const watch = this.watchHistory[studentId][videoId];
    const videoNote = {
      id: `note_${Date.now()}`,
      timestamp,
      content: note,
      createdAt: new Date().toISOString(),
    };

    watch.notes.push(videoNote);
    this.saveWatchHistory();

    return videoNote;
  }

  /**
   * Record interaction (quiz answer, poll response)
   */
  recordInteraction(studentId, videoId, interactionId, response) {
    if (!this.watchHistory[studentId] || !this.watchHistory[studentId][videoId]) {
      this.startWatching(studentId, videoId);
    }

    const watch = this.watchHistory[studentId][videoId];
    const interaction = {
      id: interactionId,
      response,
      timestamp: new Date().toISOString(),
    };

    watch.interactions.push(interaction);
    this.saveWatchHistory();

    return interaction;
  }

  /**
   * Search videos
   */
  searchVideos(query, filters = {}) {
    let results = Object.values(this.videos);

    // Filter by query
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(video => {
        const searchText = `${video.title} ${video.description} ${video.tags.join(' ')} ${video.keyTopics?.join(' ') || ''}`.toLowerCase();
        return searchText.includes(lowerQuery);
      });
    }

    // Apply filters
    if (filters.subject) {
      results = results.filter(v => v.subject === filters.subject);
    }

    if (filters.gradeLevel) {
      results = results.filter(v => v.gradeLevel === filters.gradeLevel);
    }

    if (filters.type) {
      results = results.filter(v => v.type === filters.type);
    }

    if (filters.difficulty) {
      results = results.filter(v => v.difficulty === filters.difficulty);
    }

    // Sort
    const sortBy = filters.sortBy || 'relevance';
    if (sortBy === 'views') {
      results.sort((a, b) => b.views - a.views);
    } else if (sortBy === 'rating') {
      results.sort((a, b) => b.averageRating - a.averageRating);
    } else if (sortBy === 'recent') {
      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return results;
  }

  /**
   * Get recommended videos for student
   */
  getRecommendations(studentId, limit = 10) {
    const watchHistory = this.watchHistory[studentId] || {};
    const watchedVideos = Object.keys(watchHistory);

    // Get subjects/topics student has watched
    const interests = {};
    watchedVideos.forEach(videoId => {
      const video = this.videos[videoId];
      if (video) {
        interests[video.subject] = (interests[video.subject] || 0) + 1;
      }
    });

    // Get top interests
    const topSubjects = Object.entries(interests)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([subject]) => subject);

    // Recommend unwatched videos in those subjects
    const recommendations = Object.values(this.videos)
      .filter(video => {
        return !watchedVideos.includes(video.id) &&
               topSubjects.includes(video.subject);
      })
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, limit);

    return recommendations;
  }

  /**
   * Rate video
   */
  rateVideo(studentId, videoId, rating, review = '') {
    const video = this.videos[videoId];
    if (!video) {
      throw new Error('Video not found');
    }

    // Add or update rating
    const existingIndex = video.ratings.findIndex(r => r.studentId === studentId);

    const ratingData = {
      studentId,
      rating, // 1-5
      review,
      timestamp: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      video.ratings[existingIndex] = ratingData;
    } else {
      video.ratings.push(ratingData);
    }

    // Recalculate average
    const totalRating = video.ratings.reduce((sum, r) => sum + r.rating, 0);
    video.averageRating = totalRating / video.ratings.length;

    this.saveVideos();

    return video;
  }

  /**
   * Get video analytics
   */
  getVideoAnalytics(videoId) {
    const video = this.videos[videoId];
    if (!video) {
      throw new Error('Video not found');
    }

    // Calculate completion rate
    const completionRate = video.views > 0 ? (video.completions / video.views) * 100 : 0;

    // Calculate average watch time
    let totalWatchTime = 0;
    let watchCount = 0;

    Object.values(this.watchHistory).forEach(studentHistory => {
      if (studentHistory[videoId]) {
        totalWatchTime += studentHistory[videoId].watchTime;
        watchCount++;
      }
    });

    const avgWatchTime = watchCount > 0 ? totalWatchTime / watchCount : 0;
    const avgWatchPercentage = video.duration > 0 ? (avgWatchTime / video.duration) * 100 : 0;

    return {
      videoId,
      title: video.title,
      views: video.views,
      completions: video.completions,
      completionRate: completionRate.toFixed(1) + '%',
      averageWatchTime: Math.round(avgWatchTime),
      averageWatchPercentage: avgWatchPercentage.toFixed(1) + '%',
      averageRating: video.averageRating.toFixed(1),
      totalRatings: video.ratings.length,
      engagement: this.calculateEngagementScore(video),
    };
  }

  /**
   * Calculate engagement score
   */
  calculateEngagementScore(video) {
    // Based on completion rate, ratings, and watch time
    const completionRate = video.views > 0 ? (video.completions / video.views) : 0;
    const ratingScore = video.averageRating / 5;

    const engagementScore = (completionRate * 0.6 + ratingScore * 0.4) * 100;

    return Math.round(engagementScore);
  }

  /**
   * Create video playlist
   */
  createPlaylist(creatorId, playlistData) {
    const playlistId = `playlist_${Date.now()}`;

    const playlist = {
      id: playlistId,
      title: playlistData.title,
      description: playlistData.description,
      creatorId,
      videoIds: playlistData.videoIds || [],
      subject: playlistData.subject,
      gradeLevel: playlistData.gradeLevel,
      isPublic: playlistData.isPublic ?? true,
      createdAt: new Date().toISOString(),
    };

    // Store playlists separately
    const playlists = this.loadPlaylists();
    playlists[playlistId] = playlist;
    this.savePlaylists(playlists);

    return playlist;
  }

  /**
   * Load playlists
   */
  loadPlaylists() {
    try {
      const stored = localStorage.getItem(`${this.storageKey}_playlists`);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      return {};
    }
  }

  /**
   * Save playlists
   */
  savePlaylists(playlists) {
    try {
      localStorage.setItem(`${this.storageKey}_playlists`, JSON.stringify(playlists));
    } catch (error) {
      console.error('Error saving playlists:', error);
    }
  }

  /**
   * Get student watch statistics
   */
  getStudentStats(studentId) {
    const history = this.watchHistory[studentId] || {};
    const watches = Object.values(history);

    const totalVideos = watches.length;
    const completedVideos = watches.filter(w => w.completed).length;
    const totalWatchTime = watches.reduce((sum, w) => sum + (w.watchTime || 0), 0);
    const totalBookmarks = watches.reduce((sum, w) => sum + (w.bookmarks?.length || 0), 0);
    const totalNotes = watches.reduce((sum, w) => sum + (w.notes?.length || 0), 0);

    return {
      totalVideosWatched: totalVideos,
      videosCompleted: completedVideos,
      completionRate: totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0,
      totalWatchTime: Math.round(totalWatchTime / 60), // minutes
      averageWatchTime: totalVideos > 0 ? Math.round(totalWatchTime / totalVideos / 60) : 0,
      bookmarksCreated: totalBookmarks,
      notestaken: totalNotes,
    };
  }
}

/**
 * Interactive Video Player Controller
 */
export class InteractiveVideoPlayer {
  constructor(videoId, options = {}) {
    this.videoId = videoId;
    this.currentTime = 0;
    this.duration = 0;
    this.playing = false;
    this.playbackRate = 1.0;
    this.quality = VIDEO_QUALITY.AUTO;
    this.volume = 1.0;
    this.muted = false;
    this.captionsEnabled = options.captionsEnabled ?? false;
    this.interactions = options.interactions || [];
    this.onInteraction = options.onInteraction || null;
  }

  /**
   * Play video
   */
  play() {
    this.playing = true;
    this.checkForInteractions();
  }

  /**
   * Pause video
   */
  pause() {
    this.playing = false;
  }

  /**
   * Seek to position
   */
  seek(time) {
    this.currentTime = Math.max(0, Math.min(time, this.duration));
    this.checkForInteractions();
  }

  /**
   * Set playback speed
   */
  setPlaybackRate(rate) {
    if (PLAYBACK_SPEEDS.includes(rate)) {
      this.playbackRate = rate;
    }
  }

  /**
   * Set quality
   */
  setQuality(quality) {
    this.quality = quality;
  }

  /**
   * Toggle captions
   */
  toggleCaptions() {
    this.captionsEnabled = !this.captionsEnabled;
  }

  /**
   * Check for interactions at current time
   */
  checkForInteractions() {
    const currentInteractions = this.interactions.filter(interaction => {
      return Math.abs(interaction.timestamp - this.currentTime) < 1; // Within 1 second
    });

    if (currentInteractions.length > 0 && this.onInteraction) {
      currentInteractions.forEach(interaction => {
        this.onInteraction(interaction);
      });
    }
  }

  /**
   * Update time
   */
  updateTime(time) {
    this.currentTime = time;
    this.checkForInteractions();
  }

  /**
   * Get player state
   */
  getState() {
    return {
      videoId: this.videoId,
      currentTime: this.currentTime,
      duration: this.duration,
      playing: this.playing,
      playbackRate: this.playbackRate,
      quality: this.quality,
      volume: this.volume,
      muted: this.muted,
      captionsEnabled: this.captionsEnabled,
      progress: this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0,
    };
  }
}

export {
  VIDEO_TYPES,
  VIDEO_QUALITY,
  PLAYBACK_SPEEDS,
  INTERACTION_TYPES,
};

export default VideoLearningManager;
