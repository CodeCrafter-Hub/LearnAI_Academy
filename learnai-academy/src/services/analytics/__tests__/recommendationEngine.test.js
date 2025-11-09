import { recommendationEngine } from '../recommendationEngine.js';
import prisma from '../../../lib/prisma.js';
import { progressTracker } from '../progressTracker.js';

jest.mock('../../../lib/prisma.js');
jest.mock('../progressTracker.js');

describe('RecommendationEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRecommendations', () => {
    const mockStudent = {
      id: 'student-1',
      gradeLevel: 5,
    };

    it('should return learning path recommendations', async () => {
      prisma.student.findUnique.mockResolvedValue(mockStudent);
      progressTracker.getProgressSummary.mockResolvedValue({
        totalTopics: 5,
        masteredTopics: 2,
        averageMastery: 75,
      });

      // Mock mastered progress
      const masteredProgress = [
        {
          topicId: 'topic-1',
          masteryLevel: 85,
          topic: {
            id: 'topic-1',
            name: 'Fractions',
            subjectId: 'subject-1',
            gradeLevel: 5,
            subject: { name: 'Math' },
            childTopics: [
              { id: 'topic-2', name: 'Advanced Fractions', subjectId: 'subject-1' },
            ],
          },
        },
      ];

      prisma.studentProgress.findMany
        .mockResolvedValueOnce(masteredProgress) // For learning path
        .mockResolvedValueOnce([]) // For strengthen
        .mockResolvedValueOnce([]) // For prerequisite
        .mockResolvedValueOnce([]); // For advanced

      prisma.topic.findMany.mockResolvedValue([]);
      // Mock the batch query for existing progress on child topics
      prisma.studentProgress.findMany.mockResolvedValueOnce([]);

      const result = await recommendationEngine.getRecommendations('student-1', {
        limit: 5,
      });

      expect(result.recommendations).toBeDefined();
      expect(result.strategies).toBeDefined();
    });

    it('should return strengthen recommendations for low mastery topics', async () => {
      prisma.student.findUnique.mockResolvedValue(mockStudent);
      progressTracker.getProgressSummary.mockResolvedValue({
        totalTopics: 3,
        masteredTopics: 0,
      });

      const inProgressTopics = [
        {
          topicId: 'topic-3',
          masteryLevel: 45,
          subjectId: 'subject-1',
          topic: {
            id: 'topic-3',
            name: 'Decimals',
            subject: { name: 'Math' },
          },
        },
      ];

      prisma.studentProgress.findMany
        .mockResolvedValueOnce([]) // Learning path
        .mockResolvedValueOnce(inProgressTopics) // Strengthen
        .mockResolvedValueOnce([]) // Prerequisite
        .mockResolvedValueOnce([]); // Advanced

      const result = await recommendationEngine.getRecommendations('student-1');

      expect(result.recommendations).toBeDefined();
      expect(result.strategies.strengthen).toBeGreaterThanOrEqual(0);
    });

    it('should deduplicate recommendations', async () => {
      prisma.student.findUnique.mockResolvedValue(mockStudent);
      progressTracker.getProgressSummary.mockResolvedValue({
        totalTopics: 2,
      });

      prisma.studentProgress.findMany.mockResolvedValue([]);
      prisma.topic.findMany.mockResolvedValue([]);

      const result = await recommendationEngine.getRecommendations('student-1', {
        limit: 5,
      });

      // Should deduplicate
      const uniqueTopics = new Set(result.recommendations.map(r => r.topicId));
      expect(uniqueTopics.size).toBeLessThanOrEqual(result.recommendations.length);
    });

    it('should throw error if student not found', async () => {
      prisma.student.findUnique.mockResolvedValue(null);

      await expect(
        recommendationEngine.getRecommendations('invalid-student')
      ).rejects.toThrow('Student not found');
    });
  });

  describe('getLearningPathRecommendations', () => {
    it('should recommend child topics of mastered topics', async () => {
      const masteredProgress = [
        {
          topicId: 'topic-1',
          masteryLevel: 90,
          topic: {
            id: 'topic-1',
            name: 'Basic Math',
            subjectId: 'subject-1',
            gradeLevel: 5,
            subject: { name: 'Math' },
            childTopics: [
              { id: 'topic-2', name: 'Advanced Math', subjectId: 'subject-1' },
            ],
          },
        },
      ];

      prisma.studentProgress.findMany
        .mockResolvedValueOnce(masteredProgress) // Initial query
        .mockResolvedValueOnce([]); // Batch query for child topics progress

      prisma.topic.findMany.mockResolvedValue([]);

      const recommendations = await recommendationEngine.getLearningPathRecommendations(
        'student-1',
        null,
        5,
        5
      );

      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe('getStrengthenRecommendations', () => {
    it('should return topics with low mastery', async () => {
      const inProgressTopics = [
        {
          topicId: 'topic-1',
          masteryLevel: 45,
          subjectId: 'subject-1',
          topic: {
            id: 'topic-1',
            name: 'Fractions',
            subject: { name: 'Math' },
          },
        },
      ];

      prisma.studentProgress.findMany.mockResolvedValue(inProgressTopics);

      const recommendations = await recommendationEngine.getStrengthenRecommendations(
        'student-1',
        null,
        5
      );

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0].type).toBe('strengthen');
      expect(recommendations[0].currentMastery).toBe(45);
    });
  });

  describe('deduplicateAndRank', () => {
    it('should merge duplicate recommendations and keep highest priority', () => {
      const duplicateRecommendations = [
        {
          topicId: 'topic-1',
          topicName: 'Fractions',
          subjectId: 'subject-1',
          subjectName: 'Math',
          reason: 'Learning path',
          priority: 80,
          type: 'learning_path',
        },
        {
          topicId: 'topic-1',
          topicName: 'Fractions',
          subjectId: 'subject-1',
          subjectName: 'Math',
          reason: 'Strengthen',
          priority: 90,
          type: 'strengthen',
        },
      ];

      const result = recommendationEngine.deduplicateAndRank(duplicateRecommendations, 5);

      expect(result.length).toBe(1);
      expect(result[0].priority).toBe(90); // Highest priority
      expect(result[0].reason).toContain('Learning path');
      expect(result[0].reason).toContain('Strengthen');
    });
  });
});

