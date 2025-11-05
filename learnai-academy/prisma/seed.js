const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create subjects
  const subjects = await Promise.all([
    prisma.subject.create({
      data: {
        name: 'Math',
        slug: 'math',
        description: 'Mathematics from basic arithmetic to advanced calculus',
        icon: 'Calculator',
        color: 'bg-blue-500',
        minGrade: 0,
        maxGrade: 12,
        orderIndex: 1,
      },
    }),
    prisma.subject.create({
      data: {
        name: 'English',
        slug: 'english',
        description: 'Grammar, vocabulary, and language arts',
        icon: 'Languages',
        color: 'bg-red-500',
        minGrade: 0,
        maxGrade: 12,
        orderIndex: 2,
      },
    }),
    prisma.subject.create({
      data: {
        name: 'Reading',
        slug: 'reading',
        description: 'Reading comprehension and literacy',
        icon: 'BookOpen',
        color: 'bg-green-500',
        minGrade: 0,
        maxGrade: 12,
        orderIndex: 3,
      },
    }),
    prisma.subject.create({
      data: {
        name: 'Science',
        slug: 'science',
        description: 'Biology, Chemistry, Physics, and Earth Science',
        icon: 'Microscope',
        color: 'bg-purple-500',
        minGrade: 0,
        maxGrade: 12,
        orderIndex: 4,
      },
    }),
    prisma.subject.create({
      data: {
        name: 'Writing',
        slug: 'writing',
        description: 'Creative writing, essays, and composition',
        icon: 'PenTool',
        color: 'bg-orange-500',
        minGrade: 0,
        maxGrade: 12,
        orderIndex: 5,
      },
    }),
    prisma.subject.create({
      data: {
        name: 'Coding',
        slug: 'coding',
        description: 'Programming and computer science',
        icon: 'Code',
        color: 'bg-indigo-500',
        minGrade: 3,
        maxGrade: 12,
        orderIndex: 6,
      },
    }),
  ]);

  // Create Math topics
  const mathSubject = subjects[0];
  await Promise.all([
    prisma.topic.create({
      data: {
        subjectId: mathSubject.id,
        name: 'Fractions',
        slug: 'fractions',
        description: 'Adding, subtracting, multiplying, and dividing fractions',
        gradeLevel: 5,
        difficulty: 'MEDIUM',
        orderIndex: 1,
      },
    }),
    prisma.topic.create({
      data: {
        subjectId: mathSubject.id,
        name: 'Decimals',
        slug: 'decimals',
        description: 'Operations with decimal numbers',
        gradeLevel: 5,
        difficulty: 'MEDIUM',
        orderIndex: 2,
      },
    }),
    prisma.topic.create({
      data: {
        subjectId: mathSubject.id,
        name: 'Percentages',
        slug: 'percentages',
        description: 'Converting and calculating percentages',
        gradeLevel: 6,
        difficulty: 'MEDIUM',
        orderIndex: 3,
      },
    }),
    prisma.topic.create({
      data: {
        subjectId: mathSubject.id,
        name: 'Basic Algebra',
        slug: 'basic-algebra',
        description: 'Variables, expressions, and simple equations',
        gradeLevel: 7,
        difficulty: 'MEDIUM',
        orderIndex: 4,
      },
    }),
    prisma.topic.create({
      data: {
        subjectId: mathSubject.id,
        name: 'Geometry',
        slug: 'geometry',
        description: 'Shapes, angles, area, and perimeter',
        gradeLevel: 6,
        difficulty: 'MEDIUM',
        orderIndex: 5,
      },
    }),
    prisma.topic.create({
      data: {
        subjectId: mathSubject.id,
        name: 'Word Problems',
        slug: 'word-problems',
        description: 'Real-world math problem solving',
        gradeLevel: 5,
        difficulty: 'HARD',
        orderIndex: 6,
      },
    }),
  ]);

  // Create English topics
  const englishSubject = subjects[1];
  await Promise.all([
    prisma.topic.create({
      data: {
        subjectId: englishSubject.id,
        name: 'Grammar',
        slug: 'grammar',
        description: 'Sentence structure and grammar rules',
        gradeLevel: 5,
        difficulty: 'MEDIUM',
        orderIndex: 1,
      },
    }),
    prisma.topic.create({
      data: {
        subjectId: englishSubject.id,
        name: 'Parts of Speech',
        slug: 'parts-of-speech',
        description: 'Nouns, verbs, adjectives, adverbs, etc.',
        gradeLevel: 4,
        difficulty: 'EASY',
        orderIndex: 2,
      },
    }),
    prisma.topic.create({
      data: {
        subjectId: englishSubject.id,
        name: 'Vocabulary',
        slug: 'vocabulary',
        description: 'Word meanings and usage',
        gradeLevel: 5,
        difficulty: 'MEDIUM',
        orderIndex: 3,
      },
    }),
  ]);

  // Create Achievements (updated to match AchievementChecker condition types)
  const achievements = [
    // First Session
    {
      code: 'first_session',
      name: 'Getting Started',
      description: 'Complete your first learning session',
      icon: 'Star',
      category: 'milestone',
      condition: { type: 'first_session' },
      pointsReward: 10,
      rarity: 'common',
      orderIndex: 1,
    },
    // Session Count
    {
      code: '10_sessions',
      name: 'Dedicated Learner',
      description: 'Complete 10 learning sessions',
      icon: 'BookMarked',
      category: 'milestone',
      condition: { type: 'session_count', count: 10 },
      pointsReward: 50,
      rarity: 'rare',
      orderIndex: 2,
    },
    {
      code: '50_sessions',
      name: 'Learning Champion',
      description: 'Complete 50 learning sessions',
      icon: 'Trophy',
      category: 'milestone',
      condition: { type: 'session_count', count: 50 },
      pointsReward: 200,
      rarity: 'epic',
      orderIndex: 3,
    },
    // Streaks
    {
      code: '3_day_streak',
      name: 'On a Roll',
      description: 'Maintain a 3-day learning streak',
      icon: 'Flame',
      category: 'streak',
      condition: { type: 'streak', days: 3 },
      pointsReward: 25,
      rarity: 'common',
      orderIndex: 4,
    },
    {
      code: '7_day_streak',
      name: 'Week Warrior',
      description: 'Maintain a 7-day learning streak',
      icon: 'Flame',
      category: 'streak',
      condition: { type: 'streak', days: 7 },
      pointsReward: 100,
      rarity: 'rare',
      orderIndex: 5,
    },
    {
      code: '30_day_streak',
      name: 'Streak Master',
      description: 'Maintain a 30-day learning streak',
      icon: 'Flame',
      category: 'streak',
      condition: { type: 'streak', days: 30 },
      pointsReward: 500,
      rarity: 'legendary',
      orderIndex: 6,
    },
    // Problems Solved
    {
      code: '100_problems',
      name: 'Problem Solver',
      description: 'Solve 100 problems correctly',
      icon: 'CheckCircle',
      category: 'progress',
      condition: { type: 'problems_solved', count: 100 },
      pointsReward: 75,
      rarity: 'rare',
      orderIndex: 7,
    },
    {
      code: '500_problems',
      name: 'Math Wizard',
      description: 'Solve 500 problems correctly',
      icon: 'Zap',
      category: 'progress',
      condition: { type: 'problems_solved', count: 500 },
      pointsReward: 300,
      rarity: 'epic',
      orderIndex: 8,
    },
    // Perfect Session
    {
      code: 'perfect_session',
      name: 'Perfect Score',
      description: 'Get 100% accuracy in a practice session',
      icon: 'Award',
      category: 'performance',
      condition: { type: 'perfect_session' },
      pointsReward: 50,
      rarity: 'rare',
      orderIndex: 9,
    },
    // Time Spent
    {
      code: '10_hours',
      name: 'Time Well Spent',
      description: 'Spend 10 hours learning',
      icon: 'Clock',
      category: 'progress',
      condition: { type: 'time_spent', minutes: 600 },
      pointsReward: 100,
      rarity: 'rare',
      orderIndex: 10,
    },
    {
      code: '50_hours',
      name: 'Learning Expert',
      description: 'Spend 50 hours learning',
      icon: 'Clock',
      category: 'progress',
      condition: { type: 'time_spent', minutes: 3000 },
      pointsReward: 500,
      rarity: 'epic',
      orderIndex: 11,
    },
    // Topics Mastered
    {
      code: '5_topics_mastered',
      name: 'Topic Explorer',
      description: 'Master 5 topics',
      icon: 'BookOpen',
      category: 'progress',
      condition: { type: 'topics_mastered', count: 5 },
      pointsReward: 150,
      rarity: 'rare',
      orderIndex: 12,
    },
    {
      code: '20_topics_mastered',
      name: 'Knowledge Seeker',
      description: 'Master 20 topics',
      icon: 'GraduationCap',
      category: 'progress',
      condition: { type: 'topics_mastered', count: 20 },
      pointsReward: 600,
      rarity: 'epic',
      orderIndex: 13,
    },
    // Points Earned
    {
      code: '1000_points',
      name: 'Point Collector',
      description: 'Earn 1,000 points',
      icon: 'Coins',
      category: 'progress',
      condition: { type: 'points_earned', points: 1000 },
      pointsReward: 200,
      rarity: 'rare',
      orderIndex: 14,
    },
    // Mastery Level
    {
      code: 'subject_master',
      name: 'Subject Master',
      description: 'Reach 80% mastery in any subject',
      icon: 'Trophy',
      category: 'mastery',
      condition: { type: 'mastery_level', level: 80 },
      pointsReward: 250,
      rarity: 'epic',
      orderIndex: 15,
    },
  ];

  await Promise.all(
    achievements.map(achievement => prisma.achievement.create({ data: achievement }))
  );

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@learnai.com',
      passwordHash: hashedPassword,
      role: 'PARENT',
      subscriptionTier: 'PREMIUM',
    },
  });

  // Create demo student
  await prisma.student.create({
    data: {
      userId: demoUser.id,
      parentId: demoUser.id,
      firstName: 'Alex',
      lastName: 'Student',
      gradeLevel: 5,
      birthDate: new Date('2014-05-15'),
    },
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
