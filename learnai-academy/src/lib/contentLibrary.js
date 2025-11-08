/**
 * Content Library and Resource Manager
 * Manages educational content, videos, articles, interactive materials
 */

/**
 * Content types
 */
const CONTENT_TYPES = {
  video: {
    name: 'Video',
    icon: '🎥',
    supportedFormats: ['mp4', 'webm', 'youtube', 'vimeo'],
  },
  article: {
    name: 'Article',
    icon: '📄',
    supportedFormats: ['html', 'markdown', 'pdf'],
  },
  interactive: {
    name: 'Interactive',
    icon: '🎮',
    supportedFormats: ['html5', 'iframe', 'embed'],
  },
  audio: {
    name: 'Audio',
    icon: '🎵',
    supportedFormats: ['mp3', 'wav', 'ogg'],
  },
  presentation: {
    name: 'Presentation',
    icon: '📊',
    supportedFormats: ['pdf', 'pptx', 'slides'],
  },
  document: {
    name: 'Document',
    icon: '📝',
    supportedFormats: ['pdf', 'doc', 'docx'],
  },
  worksheet: {
    name: 'Worksheet',
    icon: '📋',
    supportedFormats: ['pdf', 'interactive'],
  },
  simulation: {
    name: 'Simulation',
    icon: '🔬',
    supportedFormats: ['html5', 'iframe'],
  },
};

/**
 * ContentLibrary
 * Manages all educational content
 */
export class ContentLibrary {
  constructor(storage = 'localStorage') {
    this.storage = storage;
    this.content = new Map();
    this.collections = new Map();
    this.loadData();
  }

  /**
   * Add content to library
   */
  addContent(contentData) {
    const {
      title,
      description = '',
      type,
      subject,
      topics = [],
      gradeLevel,
      difficulty = 5,
      duration = 0, // minutes
      url = null,
      content = null,
      thumbnail = null,
      author = 'System',
      credits = null,
      license = 'All Rights Reserved',
      tags = [],
      language = 'en',
      interactive = false,
      premium = false,
      metadata = {},
    } = contentData;

    const contentItem = {
      id: this.generateContentId(),
      title,
      description,
      type,
      subject,
      topics,
      gradeLevel,
      difficulty,
      duration,
      url,
      content,
      thumbnail,
      author,
      credits,
      license,
      tags,
      language,
      interactive,
      premium,
      metadata,

      // Status
      status: 'active', // active, draft, archived
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      // Analytics
      views: 0,
      completions: 0,
      averageRating: 0,
      totalRatings: 0,
      ratings: [],
      comments: [],

      // Accessibility
      hasTranscript: false,
      hasCaptions: false,
      hasAudioDescription: false,
    };

    this.content.set(contentItem.id, contentItem);
    this.saveData();

    return contentItem;
  }

  /**
   * Get content by ID
   */
  getContent(contentId) {
    return this.content.get(contentId);
  }

  /**
   * Search content
   */
  searchContent(filters = {}) {
    let results = Array.from(this.content.values());

    // Filter by status
    results = results.filter((c) => c.status === 'active');

    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (filters.type) {
      results = results.filter((c) => c.type === filters.type);
    }

    if (filters.subject) {
      results = results.filter((c) => c.subject === filters.subject);
    }

    if (filters.topic) {
      results = results.filter((c) => c.topics.includes(filters.topic));
    }

    if (filters.gradeLevel) {
      results = results.filter((c) => c.gradeLevel === filters.gradeLevel);
    }

    if (filters.difficulty) {
      const min = filters.difficulty.min || 0;
      const max = filters.difficulty.max || 10;
      results = results.filter((c) => c.difficulty >= min && c.difficulty <= max);
    }

    if (filters.tags) {
      const searchTags = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
      results = results.filter((c) => searchTags.some((tag) => c.tags.includes(tag)));
    }

    // Sort
    if (filters.sortBy) {
      results = this.sortContent(results, filters.sortBy, filters.sortOrder || 'desc');
    }

    // Limit
    if (filters.limit) {
      results = results.slice(0, filters.limit);
    }

    return results;
  }

  /**
   * Sort content
   */
  sortContent(content, sortBy, order = 'desc') {
    const sorted = [...content];

    sorted.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'popular':
          aVal = a.views;
          bVal = b.views;
          break;
        case 'rating':
          aVal = a.averageRating;
          bVal = b.averageRating;
          break;
        case 'recent':
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
          break;
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        default:
          aVal = a.createdAt;
          bVal = b.createdAt;
      }

      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return sorted;
  }

  /**
   * Record content view
   */
  recordView(contentId, studentId) {
    const content = this.content.get(contentId);

    if (!content) {
      throw new Error('Content not found');
    }

    content.views++;

    // Track student progress
    if (!content.viewHistory) {
      content.viewHistory = [];
    }

    content.viewHistory.push({
      studentId,
      timestamp: new Date().toISOString(),
    });

    this.saveData();

    return content;
  }

  /**
   * Record completion
   */
  recordCompletion(contentId, studentId, progress = 100) {
    const content = this.content.get(contentId);

    if (!content) {
      throw new Error('Content not found');
    }

    if (progress >= 100) {
      content.completions++;
    }

    if (!content.completionHistory) {
      content.completionHistory = [];
    }

    content.completionHistory.push({
      studentId,
      progress,
      timestamp: new Date().toISOString(),
    });

    this.saveData();

    return content;
  }

  /**
   * Rate content
   */
  rateContent(contentId, studentId, rating, review = '') {
    const content = this.content.get(contentId);

    if (!content) {
      throw new Error('Content not found');
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Remove previous rating from this student
    content.ratings = content.ratings.filter((r) => r.studentId !== studentId);

    // Add new rating
    content.ratings.push({
      studentId,
      rating,
      review,
      timestamp: new Date().toISOString(),
    });

    // Recalculate average
    const totalRating = content.ratings.reduce((sum, r) => sum + r.rating, 0);
    content.averageRating = totalRating / content.ratings.length;
    content.totalRatings = content.ratings.length;

    this.saveData();

    return content;
  }

  /**
   * Add comment
   */
  addComment(contentId, studentId, comment) {
    const content = this.content.get(contentId);

    if (!content) {
      throw new Error('Content not found');
    }

    content.comments.push({
      id: this.generateCommentId(),
      studentId,
      comment,
      timestamp: new Date().toISOString(),
      replies: [],
    });

    this.saveData();

    return content;
  }

  /**
   * Create collection
   */
  createCollection(collectionData) {
    const {
      name,
      description = '',
      subject,
      gradeLevel,
      contentIds = [],
      createdBy,
      isPublic = true,
    } = collectionData;

    const collection = {
      id: this.generateCollectionId(),
      name,
      description,
      subject,
      gradeLevel,
      contentIds,
      createdBy,
      isPublic,
      createdAt: new Date().toISOString(),
      followers: 0,
    };

    this.collections.set(collection.id, collection);
    this.saveData();

    return collection;
  }

  /**
   * Add to collection
   */
  addToCollection(collectionId, contentId) {
    const collection = this.collections.get(collectionId);

    if (!collection) {
      throw new Error('Collection not found');
    }

    if (!collection.contentIds.includes(contentId)) {
      collection.contentIds.push(contentId);
      this.saveData();
    }

    return collection;
  }

  /**
   * Get collection with content
   */
  getCollectionWithContent(collectionId) {
    const collection = this.collections.get(collectionId);

    if (!collection) {
      throw new Error('Collection not found');
    }

    const content = collection.contentIds
      .map((id) => this.content.get(id))
      .filter((c) => c && c.status === 'active');

    return {
      ...collection,
      content,
    };
  }

  /**
   * Get recommended content
   */
  getRecommendedContent(studentId, subject, gradeLevel, limit = 10) {
    // Get content matching student's profile
    let recommendations = this.searchContent({
      subject,
      gradeLevel,
      sortBy: 'rating',
    });

    // Filter out already viewed content
    // In production, this would use actual view history
    recommendations = recommendations.slice(0, limit);

    return recommendations;
  }

  /**
   * Get popular content
   */
  getPopularContent(filters = {}, limit = 20) {
    return this.searchContent({
      ...filters,
      sortBy: 'popular',
      limit,
    });
  }

  /**
   * Get trending content
   */
  getTrendingContent(filters = {}, days = 7, limit = 20) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    let trending = this.searchContent(filters);

    // Filter by recent views
    trending = trending.filter((c) => {
      if (!c.viewHistory) return false;

      const recentViews = c.viewHistory.filter(
        (v) => new Date(v.timestamp) >= cutoffDate
      ).length;

      return recentViews > 0;
    });

    // Sort by recent views
    trending.sort((a, b) => {
      const aViews = (a.viewHistory || []).filter(
        (v) => new Date(v.timestamp) >= cutoffDate
      ).length;

      const bViews = (b.viewHistory || []).filter(
        (v) => new Date(v.timestamp) >= cutoffDate
      ).length;

      return bViews - aViews;
    });

    return trending.slice(0, limit);
  }

  /**
   * Generate IDs
   */
  generateContentId() {
    return `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateCollectionId() {
    return `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateCommentId() {
    return `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  loadData() {
    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const data = localStorage.getItem('learnai_content_library');
        if (data) {
          const parsed = JSON.parse(data);
          this.content = new Map(Object.entries(parsed.content || {}));
          this.collections = new Map(Object.entries(parsed.collections || {}));
        }
      }
    } catch (error) {
      console.error('Error loading content library data:', error);
    }
  }

  saveData() {
    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const data = {
          content: Object.fromEntries(this.content),
          collections: Object.fromEntries(this.collections),
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem('learnai_content_library', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error saving content library data:', error);
    }
  }

  clearData() {
    this.content.clear();
    this.collections.clear();
    if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('learnai_content_library');
    }
  }
}

/**
 * LearningPathBuilder
 * Creates structured learning paths from content
 */
export class LearningPathBuilder {
  constructor(contentLibrary) {
    this.library = contentLibrary;
  }

  /**
   * Create learning path
   */
  createPath(pathData) {
    const {
      title,
      description,
      subject,
      gradeLevel,
      difficulty,
      estimatedDuration,
      modules = [],
    } = pathData;

    return {
      id: this.generatePathId(),
      title,
      description,
      subject,
      gradeLevel,
      difficulty,
      estimatedDuration,
      modules,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Add module to path
   */
  addModule(path, moduleData) {
    const {
      title,
      description,
      contentIds = [],
      order,
      required = true,
    } = moduleData;

    const module = {
      id: this.generateModuleId(),
      title,
      description,
      contentIds,
      order: order || path.modules.length + 1,
      required,
    };

    path.modules.push(module);

    return path;
  }

  /**
   * Auto-generate path from topic
   */
  autoGeneratePath(subject, topic, gradeLevel) {
    // Search for relevant content
    const allContent = this.library.searchContent({
      subject,
      topic,
      gradeLevel,
    });

    if (allContent.length === 0) {
      return null;
    }

    // Organize by type
    const videos = allContent.filter((c) => c.type === 'video');
    const articles = allContent.filter((c) => c.type === 'article');
    const interactive = allContent.filter((c) => c.type === 'interactive');
    const worksheets = allContent.filter((c) => c.type === 'worksheet');

    // Create path
    const path = this.createPath({
      title: `${topic} Learning Path`,
      description: `Complete learning path for ${topic}`,
      subject,
      gradeLevel,
      difficulty: 5,
      estimatedDuration: allContent.reduce((sum, c) => sum + c.duration, 0),
    });

    // Add modules in pedagogical order
    if (videos.length > 0) {
      this.addModule(path, {
        title: 'Watch & Learn',
        description: 'Video lessons introducing the concepts',
        contentIds: videos.map((v) => v.id),
        order: 1,
      });
    }

    if (articles.length > 0) {
      this.addModule(path, {
        title: 'Read & Understand',
        description: 'Articles and explanations',
        contentIds: articles.map((a) => a.id),
        order: 2,
      });
    }

    if (interactive.length > 0) {
      this.addModule(path, {
        title: 'Practice & Explore',
        description: 'Interactive activities',
        contentIds: interactive.map((i) => i.id),
        order: 3,
      });
    }

    if (worksheets.length > 0) {
      this.addModule(path, {
        title: 'Apply & Master',
        description: 'Worksheets and exercises',
        contentIds: worksheets.map((w) => w.id),
        order: 4,
      });
    }

    return path;
  }

  /**
   * Generate path ID
   */
  generatePathId() {
    return `path_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate module ID
   */
  generateModuleId() {
    return `module_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Example Usage
 */

/*
// Initialize library
const library = new ContentLibrary();

// Add video content
const video = library.addContent({
  title: 'Introduction to Multiplication',
  description: 'Learn the basics of multiplication',
  type: 'video',
  subject: 'math',
  topics: ['multiplication', 'basic-operations'],
  gradeLevel: 3,
  difficulty: 3,
  duration: 10,
  url: 'https://youtube.com/watch?v=example',
  thumbnail: '/thumbnails/mult-intro.jpg',
  author: 'Mrs. Johnson',
  tags: ['beginner', 'visual'],
});

console.log('Added video:', video.title);

// Search content
const mathContent = library.searchContent({
  subject: 'math',
  gradeLevel: 3,
  sortBy: 'rating',
  limit: 10,
});

console.log('Found', mathContent.length, 'math resources');

// Record view
library.recordView(video.id, 'student123');

// Rate content
library.rateContent(video.id, 'student123', 5, 'Great explanation!');

// Create collection
const collection = library.createCollection({
  name: 'Multiplication Mastery',
  description: 'Complete multiplication resources',
  subject: 'math',
  gradeLevel: 3,
  createdBy: 'teacher456',
});

library.addToCollection(collection.id, video.id);

// Auto-generate learning path
const pathBuilder = new LearningPathBuilder(library);
const path = pathBuilder.autoGeneratePath('math', 'multiplication', 3);

console.log('Generated path:', path.title);
console.log('Modules:', path.modules.length);

// Get recommendations
const recommended = library.getRecommendedContent('student123', 'math', 3, 5);
console.log('Recommended:', recommended.map((c) => c.title));

// Get trending content
const trending = library.getTrendingContent({ subject: 'math' }, 7, 10);
console.log('Trending:', trending.length);
*/

export { ContentLibrary, LearningPathBuilder, CONTENT_TYPES };
