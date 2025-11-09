import { achievementChecker } from '../achievementChecker.js';
import prisma from '../../../lib/prisma.js';
import { progressTracker } from '../progressTracker.js';

jest.mock('../../../lib/prisma.js');
jest.mock('../progressTracker.js');

describe('AchievementChecker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkAchievements', () => {
    const mockStudent = {
      id: 'student-1',
      gradeLevel: 5,
    };

    const mockAchievements = [
      {
        id: 'ach-1',
        code: 'first_session',
        name: 'First Steps',
        condition: { type: 'first_session' },
      },
      {
        id: 'ach-2',
        code: 'session_count',
        name: 'Dedicated Learner',
        condition: { type: 'session_count', count: 10 },
      },
      {
        id: 'ach-3',
        code: 'streak',
        name: 'On Fire',
        condition: { type: 'streak', days: 7 },
      },
    ];

    it('should award first session achievement', async () => {
      prisma.achievement.findMany.mockResolvedValue([mockAchievements[0]]);
      prisma.studentAchievement.findMany.mockResolvedValue([]);
      prisma.student.findUnique.mockResolvedValue(mockStudent);
      prisma.learningSession.count.mockResolvedValue(1); // First session
      prisma.studentAchievement.create.mockResolvedValue({
        id: 'sa-1',
        achievementId: 'ach-1',
        studentId: 'student-1',
        achievement: mockAchievements[0],
      });

      const result = await achievementChecker.checkAchievements('student-1', {});

      expect(result).toHaveLength(1);
      expect(result[0].achievement.code).toBe('first_session');
      expect(prisma.studentAchievement.create).toHaveBeenCalled();
    });

    it('should not award already unlocked achievements', async () => {
      prisma.achievement.findMany.mockResolvedValue(mockAchievements);
      prisma.studentAchievement.findMany.mockResolvedValue([
        { achievementId: 'ach-1' }, // Already unlocked
      ]);
      prisma.student.findUnique.mockResolvedValue(mockStudent);

      const result = await achievementChecker.checkAchievements('student-1', {});

      expect(result).toHaveLength(0);
      expect(prisma.studentAchievement.create).not.toHaveBeenCalled();
    });

    it('should check session count achievement', async () => {
      prisma.achievement.findMany.mockResolvedValue([mockAchievements[1]]);
      prisma.studentAchievement.findMany.mockResolvedValue([]);
      prisma.student.findUnique.mockResolvedValue(mockStudent);
      prisma.learningSession.count.mockResolvedValue(15); // More than 10
      prisma.studentAchievement.create.mockResolvedValue({
        id: 'sa-2',
        achievementId: 'ach-2',
        studentId: 'student-1',
        achievement: mockAchievements[1],
      });

      const result = await achievementChecker.checkAchievements('student-1', {});

      expect(prisma.learningSession.count).toHaveBeenCalledWith({
        where: { studentId: 'student-1' },
      });
      expect(result.length).toBeGreaterThan(0);
    });

    it('should check streak achievement', async () => {
      prisma.achievement.findMany.mockResolvedValue([mockAchievements[2]]);
      prisma.studentAchievement.findMany.mockResolvedValue([]);
      prisma.student.findUnique.mockResolvedValue(mockStudent);
      progressTracker.calculateStreak.mockResolvedValue(10); // 10 day streak
      prisma.studentAchievement.create.mockResolvedValue({
        id: 'sa-3',
        achievementId: 'ach-3',
        studentId: 'student-1',
        achievement: mockAchievements[2],
      });

      const result = await achievementChecker.checkAchievements('student-1', {});

      expect(progressTracker.calculateStreak).toHaveBeenCalledWith('student-1');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should check perfect session achievement', async () => {
      const perfectSessionAchievement = {
        id: 'ach-4',
        code: 'perfect_session',
        name: 'Perfect Score',
        condition: { type: 'perfect_session' },
      };

      prisma.achievement.findMany.mockResolvedValue([perfectSessionAchievement]);
      prisma.studentAchievement.findMany.mockResolvedValue([]);
      prisma.student.findUnique.mockResolvedValue(mockStudent);
      prisma.studentAchievement.create.mockResolvedValue({
        id: 'sa-4',
        achievementId: 'ach-4',
        studentId: 'student-1',
        achievement: perfectSessionAchievement,
      });

      const context = {
        sessionData: {
          problemsAttempted: 10,
          problemsCorrect: 10, // Perfect!
        },
      };

      const result = await achievementChecker.checkAchievements('student-1', context);

      expect(result.length).toBeGreaterThan(0);
    });

    it('should throw error if student not found', async () => {
      prisma.achievement.findMany.mockResolvedValue(mockAchievements);
      prisma.studentAchievement.findMany.mockResolvedValue([]);
      prisma.student.findUnique.mockResolvedValue(null);

      await expect(
        achievementChecker.checkAchievements('invalid-student', {})
      ).rejects.toThrow('Student not found');
    });
  });

  describe('getAchievementProgress', () => {
    it('should return progress for session count achievement', async () => {
      const achievement = {
        id: 'ach-1',
        condition: { type: 'session_count', count: 10 },
      };

      prisma.achievement.findUnique.mockResolvedValue(achievement);
      prisma.studentAchievement.findUnique.mockResolvedValue(null);
      prisma.learningSession.count.mockResolvedValue(7); // 7 out of 10

      const progress = await achievementChecker.getAchievementProgress(
        'student-1',
        'ach-1'
      );

      expect(progress.unlocked).toBe(false);
      expect(progress.progress).toBe(70); // 7/10 = 70%
      expect(progress.current).toBe(7);
      expect(progress.target).toBe(10);
    });

    it('should return 100% for unlocked achievement', async () => {
      const achievement = {
        id: 'ach-1',
        condition: { type: 'session_count', count: 10 },
      };

      prisma.achievement.findUnique.mockResolvedValue(achievement);
      prisma.studentAchievement.findUnique.mockResolvedValue({
        unlockedAt: new Date(),
      });

      const progress = await achievementChecker.getAchievementProgress(
        'student-1',
        'ach-1'
      );

      expect(progress.unlocked).toBe(true);
      expect(progress.progress).toBe(100);
    });

    it('should return progress for streak achievement', async () => {
      const achievement = {
        id: 'ach-1',
        condition: { type: 'streak', days: 7 },
      };

      prisma.achievement.findUnique.mockResolvedValue(achievement);
      prisma.studentAchievement.findUnique.mockResolvedValue(null);
      progressTracker.calculateStreak.mockResolvedValue(5); // 5 out of 7 days

      const progress = await achievementChecker.getAchievementProgress(
        'student-1',
        'ach-1'
      );

      expect(progress.unlocked).toBe(false);
      expect(progress.progress).toBeCloseTo(71, 0); // 5/7 = 71% (rounded)
    });
  });

  describe('checkProblemsSolved', () => {
    it('should check if student solved enough problems', async () => {
      prisma.learningSession.findMany.mockResolvedValue([
        { problemsCorrect: 5 },
        { problemsCorrect: 3 },
        { problemsCorrect: 2 },
      ]);

      const result = await achievementChecker.checkProblemsSolved('student-1', 10);

      expect(result).toBe(true); // 5 + 3 + 2 = 10
    });

    it('should return false if not enough problems solved', async () => {
      prisma.learningSession.findMany.mockResolvedValue([
        { problemsCorrect: 3 },
        { problemsCorrect: 2 },
      ]);

      const result = await achievementChecker.checkProblemsSolved('student-1', 10);

      expect(result).toBe(false); // 3 + 2 = 5 < 10
    });
  });
});

