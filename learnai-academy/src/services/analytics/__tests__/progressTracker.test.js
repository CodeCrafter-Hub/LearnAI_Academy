import { progressTracker } from '../progressTracker.js';
import prisma from '../../../lib/prisma.js';

// Mock Prisma
jest.mock('../../../lib/prisma.js', () => ({
  __esModule: true,
  default: {
    learningSession: {
      findUnique: jest.fn(),
    },
    studentProgress: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    dailyActivity: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe('ProgressTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('trackSessionProgress', () => {
    const mockSession = {
      id: 'session-1',
      studentId: 'student-1',
      subjectId: 'subject-1',
      topicId: 'topic-1',
      student: { id: 'student-1', gradeLevel: 5 },
      subject: { id: 'subject-1', name: 'Math' },
      topic: { id: 'topic-1', name: 'Fractions' },
    };

    const mockSessionData = {
      problemsAttempted: 10,
      problemsCorrect: 8,
      durationMinutes: 30,
      concepts: ['addition', 'subtraction'],
      pointsEarned: 80,
    };

    it('should create new progress record for first session', async () => {
      prisma.learningSession.findUnique.mockResolvedValue(mockSession);
      prisma.studentProgress.findUnique.mockResolvedValue(null);
      prisma.studentProgress.create.mockResolvedValue({
        id: 'progress-1',
        studentId: 'student-1',
        topicId: 'topic-1',
        masteryLevel: 24, // 80% accuracy * 0.3 weight
        totalTimeMinutes: 30,
        sessionsCount: 1,
      });
      prisma.dailyActivity.findUnique.mockResolvedValue(null);
      prisma.dailyActivity.findMany.mockResolvedValue([]); // For streak calculation
      prisma.dailyActivity.create.mockResolvedValue({});

      const result = await progressTracker.trackSessionProgress(
        'session-1',
        mockSessionData
      );

      expect(prisma.studentProgress.create).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.masteryLevel).toBeGreaterThan(0);
    });

    it('should update existing progress record', async () => {
      const existingProgress = {
        id: 'progress-1',
        studentId: 'student-1',
        topicId: 'topic-1',
        masteryLevel: 50,
        totalTimeMinutes: 60,
        sessionsCount: 2,
        strengths: [],
        weaknesses: [],
      };

      prisma.learningSession.findUnique.mockResolvedValue(mockSession);
      prisma.studentProgress.findUnique.mockResolvedValue(existingProgress);
      prisma.studentProgress.update.mockResolvedValue({
        ...existingProgress,
        masteryLevel: 62, // Weighted average
        totalTimeMinutes: 90,
        sessionsCount: 3,
      });
      prisma.dailyActivity.findUnique.mockResolvedValue({
        id: 'activity-1',
        minutesLearned: 60,
      });
      prisma.dailyActivity.update.mockResolvedValue({});

      const result = await progressTracker.trackSessionProgress(
        'session-1',
        mockSessionData
      );

      expect(prisma.studentProgress.update).toHaveBeenCalled();
      expect(result.masteryLevel).toBeGreaterThan(existingProgress.masteryLevel);
    });

    it('should throw error if session not found', async () => {
      prisma.learningSession.findUnique.mockResolvedValue(null);

      await expect(
        progressTracker.trackSessionProgress('invalid-session', mockSessionData)
      ).rejects.toThrow('Session not found');
    });

    it('should calculate mastery level correctly with weighted average', () => {
      const existingProgress = {
        masteryLevel: 70,
        strengths: [],
        weaknesses: [],
      };

      // 80% accuracy, 70% current mastery
      // New mastery = (70 * 0.7) + (80 * 0.3) = 49 + 24 = 73
      const mastery = progressTracker.calculateMasteryLevel(
        existingProgress,
        80, // accuracyRate
        10, // problemsAttempted
        8   // problemsCorrect
      );

      expect(mastery).toBeCloseTo(73, 1);
    });

    it('should identify strengths when accuracy >= 80%', () => {
      const existingProgress = {
        masteryLevel: 50,
        strengths: [],
        weaknesses: ['division'],
      };

      const { strengths, weaknesses } = progressTracker.updateStrengthsWeaknesses(
        existingProgress,
        85, // High accuracy
        { concepts: ['addition', 'subtraction'] }
      );

      expect(strengths).toContain('addition');
      expect(strengths).toContain('subtraction');
      expect(weaknesses).not.toContain('addition');
    });

    it('should identify weaknesses when accuracy < 60%', () => {
      const existingProgress = {
        masteryLevel: 50,
        strengths: ['addition'],
        weaknesses: [],
      };

      const { strengths, weaknesses } = progressTracker.updateStrengthsWeaknesses(
        existingProgress,
        45, // Low accuracy
        { concepts: ['division', 'multiplication'] }
      );

      expect(weaknesses).toContain('division');
      expect(weaknesses).toContain('multiplication');
      expect(strengths).toContain('addition'); // Should not remove existing strength
    });
  });

  describe('calculateStreak', () => {
    it('should calculate streak correctly', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      prisma.dailyActivity.findMany.mockResolvedValue([
        {
          id: 'activity-1',
          activityDate: today,
          streakDay: 5,
        },
        {
          id: 'activity-2',
          activityDate: yesterday,
          streakDay: 4,
        },
      ]);

      const streak = await progressTracker.calculateStreak('student-1');
      expect(streak).toBe(5);
    });

    it('should return 0 if no activities', async () => {
      prisma.dailyActivity.findMany.mockResolvedValue([]);
      const streak = await progressTracker.calculateStreak('student-1');
      expect(streak).toBe(0);
    });
  });

  describe('getProgressSummary', () => {
    it('should return comprehensive progress summary', async () => {
      const mockProgress = [
        {
          id: 'progress-1',
          masteryLevel: 85,
          totalTimeMinutes: 120,
          sessionsCount: 5,
          lastPracticedAt: new Date(),
          strengths: ['addition'],
          weaknesses: [],
          subject: { name: 'Math' },
          topic: { name: 'Fractions' },
        },
        {
          id: 'progress-2',
          masteryLevel: 60,
          totalTimeMinutes: 90,
          sessionsCount: 3,
          lastPracticedAt: new Date(),
          strengths: [],
          weaknesses: ['division'],
          subject: { name: 'Math' },
          topic: { name: 'Decimals' },
        },
      ];

      prisma.studentProgress.findMany.mockResolvedValue(mockProgress);

      const summary = await progressTracker.getProgressSummary('student-1');

      expect(summary.totalTopics).toBe(2);
      expect(summary.masteredTopics).toBe(1); // masteryLevel >= 80
      expect(summary.inProgressTopics).toBe(1); // masteryLevel > 0 and < 80
      expect(summary.averageMastery).toBeCloseTo(72.5, 1);
      expect(summary.totalTimeMinutes).toBe(210);
      expect(summary.totalSessions).toBe(8);
    });
  });

  describe('updateProgress', () => {
    it('should upsert progress record', async () => {
      const updates = {
        masteryLevel: 75,
        strengths: ['addition'],
        weaknesses: ['subtraction'],
        subjectId: 'subject-1',
      };

      prisma.studentProgress.upsert.mockResolvedValue({
        id: 'progress-1',
        studentId: 'student-1',
        topicId: 'topic-1',
        ...updates,
      });

      const result = await progressTracker.updateProgress('student-1', 'topic-1', updates);

      expect(prisma.studentProgress.upsert).toHaveBeenCalled();
      expect(result.masteryLevel).toBe(75);
    });
  });
});

