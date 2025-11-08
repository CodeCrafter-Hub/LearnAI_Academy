/**
 * Curriculum Service
 * API layer for teaching agents to access and interact with curriculum
 */

import { CurriculumStorage } from './curriculumStorage';
import { getDifficultyRange } from './curriculumData';

/**
 * Curriculum Service - Main API for teaching agents
 */
export class CurriculumService {
  constructor(storage) {
    this.storage = storage || new CurriculumStorage();
    this.cache = new Map();
  }

  /**
   * Get complete curriculum for a grade/subject
   */
  async getCurriculum(gradeLevel, subject) {
    const cacheKey = `${gradeLevel}_${subject}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const curriculum = await this.storage.getCurriculum(gradeLevel, subject);

    if (!curriculum) {
      throw new Error(`No curriculum found for Grade ${gradeLevel}, ${subject}`);
    }

    this.cache.set(cacheKey, curriculum);
    return curriculum;
  }

  /**
   * Get specific topic from curriculum
   */
  async getTopic(gradeLevel, subject, topicId) {
    const curriculum = await this.getCurriculum(gradeLevel, subject);

    const topic = curriculum.curriculum.topics.find((t) => t.id === topicId);

    if (!topic) {
      throw new Error(`Topic ${topicId} not found in curriculum`);
    }

    return topic;
  }

  /**
   * Get next topic in learning sequence
   */
  async getNextTopic(gradeLevel, subject, currentTopicId, studentProgress = {}) {
    const curriculum = await this.getCurriculum(gradeLevel, subject);
    const topics = curriculum.curriculum.topics;

    // If no current topic, start at the beginning
    if (!currentTopicId) {
      return topics[0];
    }

    const currentIndex = topics.findIndex((t) => t.id === currentTopicId);

    if (currentIndex === -1) {
      return topics[0];
    }

    // Check if prerequisites for next topics are met
    for (let i = currentIndex + 1; i < topics.length; i++) {
      const topic = topics[i];

      if (this.prerequisitesMet(topic, studentProgress)) {
        return topic;
      }
    }

    // If all topics completed or prerequisites not met, return null
    return null;
  }

  /**
   * Get recommended topic based on student performance
   */
  async getRecommendedTopic(gradeLevel, subject, studentPerformance) {
    const curriculum = await this.getCurriculum(gradeLevel, subject);
    const topics = curriculum.curriculum.topics;

    // Analyze student performance
    const analysis = this.analyzeStudentPerformance(studentPerformance);

    // Find topic that matches student's current level
    const recommendedTopic = topics.find((topic) => {
      // Prerequisites met
      if (!this.prerequisitesMet(topic, studentPerformance)) {
        return false;
      }

      // Not already mastered
      if (studentPerformance.masteredTopics?.includes(topic.id)) {
        return false;
      }

      // Difficulty appropriate
      const difficultyMatch =
        topic.difficulty >= analysis.minRecommendedDifficulty &&
        topic.difficulty <= analysis.maxRecommendedDifficulty;

      return difficultyMatch;
    });

    return recommendedTopic || topics[0];
  }

  /**
   * Get questions for a topic
   */
  async getQuestionsForTopic(topicId, options = {}) {
    const {
      difficulty = null,
      count = 10,
      type = null,
      excludeIds = [],
      adaptiveDifficulty = null,
    } = options;

    let questions = await this.storage.getQuestions(topicId);

    // Filter out already used questions
    if (excludeIds.length > 0) {
      questions = questions.filter((q) => !excludeIds.includes(q.id));
    }

    // Filter by type if specified
    if (type) {
      questions = questions.filter((q) => q.type === type);
    }

    // Filter by difficulty if specified
    if (difficulty) {
      questions = questions.filter((q) => q.difficulty === difficulty);
    }

    // Adaptive difficulty selection
    if (adaptiveDifficulty) {
      questions = this.selectAdaptiveQuestions(
        questions,
        adaptiveDifficulty,
        count
      );
    } else {
      // Random selection
      questions = this.shuffleArray(questions).slice(0, count);
    }

    return questions;
  }

  /**
   * Get learning path for student
   */
  async getLearningPath(gradeLevel, subject, studentProgress = {}) {
    const curriculum = await this.getCurriculum(gradeLevel, subject);
    const topics = curriculum.curriculum.topics;

    const path = topics.map((topic) => {
      const status = this.getTopicStatus(topic, studentProgress);
      const readiness = this.assessTopicReadiness(topic, studentProgress);

      return {
        topic,
        status, // 'not-started', 'in-progress', 'mastered', 'locked'
        readiness, // 0-100 percentage ready to start
        estimatedDuration: topic.estimatedDuration,
        prerequisitesMet: this.prerequisitesMet(topic, studentProgress),
      };
    });

    return {
      curriculum: curriculum.id,
      gradeLevel,
      subject,
      totalTopics: topics.length,
      completedTopics: path.filter((p) => p.status === 'mastered').length,
      currentTopic: path.find((p) => p.status === 'in-progress'),
      nextRecommended: path.find(
        (p) => p.status === 'not-started' && p.readiness >= 80
      ),
      path,
    };
  }

  /**
   * Record student performance for curriculum optimization
   */
  async recordPerformance(studentId, gradeLevel, subject, topicId, performanceData) {
    const curriculumId = this.storage.generateCurriculumId(gradeLevel, subject);

    const record = {
      studentId,
      curriculumId,
      topicId,
      gradeLevel,
      subject,
      ...performanceData,
    };

    await this.storage.savePerformanceData(record);

    // Invalidate cache for this curriculum (performance data changed)
    this.cache.delete(`${gradeLevel}_${subject}`);

    return record;
  }

  /**
   * Submit feedback on curriculum/topic
   */
  async submitFeedback(gradeLevel, subject, feedback) {
    const curriculumId = this.storage.generateCurriculumId(gradeLevel, subject);

    const feedbackRecord = {
      curriculumId,
      gradeLevel,
      subject,
      ...feedback,
    };

    await this.storage.saveFeedback(feedbackRecord);

    return feedbackRecord;
  }

  /**
   * Get curriculum statistics
   */
  async getCurriculumStats(gradeLevel, subject) {
    const curriculum = await this.getCurriculum(gradeLevel, subject);
    const performanceData = await this.storage.getPerformanceData(gradeLevel, subject);

    return {
      curriculum: {
        id: curriculum.id,
        version: curriculum.metadata.version,
        totalTopics: curriculum.curriculum.topics.length,
        difficultyRange: {
          min: Math.min(...curriculum.curriculum.topics.map((t) => t.difficulty)),
          max: Math.max(...curriculum.curriculum.topics.map((t) => t.difficulty)),
        },
        generatedAt: curriculum.generatedAt,
        lastUpdated: curriculum.lastUpdated,
      },
      performance: {
        sampleSize: performanceData.sampleSize,
        overallAccuracy: performanceData.overallStats.accuracy,
        averageSessionDuration: performanceData.overallStats.averageSessionDuration,
        topicPerformance: performanceData.topicPerformance,
      },
    };
  }

  /**
   * Helper: Check if prerequisites are met
   */
  prerequisitesMet(topic, studentProgress) {
    if (!topic.prerequisites || topic.prerequisites.length === 0) {
      return true;
    }

    const masteredTopics = studentProgress.masteredTopics || [];

    return topic.prerequisites.every((prereqId) =>
      masteredTopics.includes(prereqId)
    );
  }

  /**
   * Helper: Analyze student performance
   */
  analyzeStudentPerformance(performance) {
    const accuracy = performance.overallAccuracy || 70;
    const avgDifficulty = performance.averageDifficulty || 3;

    let minRecommendedDifficulty, maxRecommendedDifficulty;

    if (accuracy >= 90) {
      // Student is doing very well, increase difficulty
      minRecommendedDifficulty = Math.min(avgDifficulty + 1, 10);
      maxRecommendedDifficulty = Math.min(avgDifficulty + 2, 10);
    } else if (accuracy >= 75) {
      // Student is doing well, maintain or slightly increase
      minRecommendedDifficulty = avgDifficulty;
      maxRecommendedDifficulty = Math.min(avgDifficulty + 1, 10);
    } else if (accuracy >= 60) {
      // Student is struggling, maintain current level
      minRecommendedDifficulty = Math.max(avgDifficulty - 1, 1);
      maxRecommendedDifficulty = avgDifficulty;
    } else {
      // Student needs support, decrease difficulty
      minRecommendedDifficulty = Math.max(avgDifficulty - 2, 1);
      maxRecommendedDifficulty = Math.max(avgDifficulty - 1, 1);
    }

    return {
      minRecommendedDifficulty,
      maxRecommendedDifficulty,
      performanceLevel: accuracy >= 90 ? 'excellent' : accuracy >= 75 ? 'good' : accuracy >= 60 ? 'fair' : 'needs-support',
    };
  }

  /**
   * Helper: Get topic status for student
   */
  getTopicStatus(topic, studentProgress) {
    if (studentProgress.masteredTopics?.includes(topic.id)) {
      return 'mastered';
    }

    if (studentProgress.currentTopic === topic.id) {
      return 'in-progress';
    }

    if (!this.prerequisitesMet(topic, studentProgress)) {
      return 'locked';
    }

    return 'not-started';
  }

  /**
   * Helper: Assess topic readiness (0-100%)
   */
  assessTopicReadiness(topic, studentProgress) {
    if (!this.prerequisitesMet(topic, studentProgress)) {
      return 0;
    }

    const masteredPrereqs = topic.prerequisites?.filter((prereqId) =>
      studentProgress.masteredTopics?.includes(prereqId)
    ).length || 0;

    const totalPrereqs = topic.prerequisites?.length || 0;

    if (totalPrereqs === 0) {
      return 100; // No prerequisites means ready
    }

    return (masteredPrereqs / totalPrereqs) * 100;
  }

  /**
   * Helper: Select questions with adaptive difficulty
   */
  selectAdaptiveQuestions(questions, targetDifficulty, count) {
    // Sort by how close they are to target difficulty
    const sorted = questions.sort((a, b) => {
      const aDiff = Math.abs(a.difficulty - targetDifficulty);
      const bDiff = Math.abs(b.difficulty - targetDifficulty);
      return aDiff - bDiff;
    });

    // Take questions close to target difficulty with some variety
    const selected = [];
    const difficultySpread = 2;

    for (const question of sorted) {
      if (selected.length >= count) break;

      if (
        question.difficulty >= targetDifficulty - difficultySpread &&
        question.difficulty <= targetDifficulty + difficultySpread
      ) {
        selected.push(question);
      }
    }

    // If not enough questions, add more regardless of difficulty
    if (selected.length < count) {
      const remaining = sorted.filter((q) => !selected.includes(q));
      selected.push(...remaining.slice(0, count - selected.length));
    }

    return this.shuffleArray(selected);
  }

  /**
   * Helper: Shuffle array
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

/**
 * Teaching Agent Integration Helper
 */
export class TeachingAgentHelper {
  constructor(curriculumService) {
    this.service = curriculumService;
  }

  /**
   * Start a new learning session
   */
  async startSession(student, subject) {
    // Get curriculum
    const curriculum = await this.service.getCurriculum(student.gradeLevel, subject);

    // Get learning path
    const learningPath = await this.service.getLearningPath(
      student.gradeLevel,
      subject,
      student.progress
    );

    // Get recommended topic
    const recommendedTopic =
      learningPath.nextRecommended?.topic ||
      learningPath.currentTopic?.topic ||
      curriculum.curriculum.topics[0];

    // Get questions for topic
    const questions = await this.service.getQuestionsForTopic(
      recommendedTopic.id,
      {
        count: 20,
        adaptiveDifficulty: student.currentDifficulty || recommendedTopic.difficulty,
      }
    );

    return {
      curriculum,
      topic: recommendedTopic,
      questions,
      learningPath,
      sessionContext: {
        gradeLevel: student.gradeLevel,
        subject,
        topicId: recommendedTopic.id,
        estimatedDuration: recommendedTopic.estimatedDuration,
      },
    };
  }

  /**
   * Complete a learning session
   */
  async completeSession(student, subject, topicId, performanceData) {
    // Record performance
    await this.service.recordPerformance(
      student.id,
      student.gradeLevel,
      subject,
      topicId,
      performanceData
    );

    // Determine if topic is mastered
    const mastered = performanceData.accuracy >= 80 && performanceData.totalAttempts >= 10;

    // Update student progress (this would be in your student service)
    const updates = {
      lastCompletedTopic: topicId,
      ...(mastered && {
        masteredTopics: [...(student.progress.masteredTopics || []), topicId],
      }),
    };

    return {
      mastered,
      updates,
      nextRecommendation: await this.getNextRecommendation(student, subject),
    };
  }

  /**
   * Get next recommendation for student
   */
  async getNextRecommendation(student, subject) {
    const learningPath = await this.service.getLearningPath(
      student.gradeLevel,
      subject,
      student.progress
    );

    return {
      nextTopic: learningPath.nextRecommended?.topic,
      readiness: learningPath.nextRecommended?.readiness,
      progressPercentage:
        (learningPath.completedTopics / learningPath.totalTopics) * 100,
    };
  }
}

/**
 * Example Usage for Teaching Agent
 */

/*
// Initialize services
const storage = new CurriculumStorage();
const curriculumService = new CurriculumService(storage);
const teachingHelper = new TeachingAgentHelper(curriculumService);

// Start learning session
const session = await teachingHelper.startSession(student, 'math');

console.log('Topic:', session.topic.name);
console.log('Questions:', session.questions.length);
console.log('Difficulty:', session.topic.difficulty);

// During session...
// Student answers questions, system tracks performance

// Complete session
const completion = await teachingHelper.completeSession(
  student,
  'math',
  session.topic.id,
  {
    totalAttempts: 20,
    correctAttempts: 17,
    accuracy: 85,
    sessionDuration: 23,
    averageDifficulty: 4,
  }
);

console.log('Topic mastered:', completion.mastered);
console.log('Next topic:', completion.nextRecommendation.nextTopic?.name);
*/
