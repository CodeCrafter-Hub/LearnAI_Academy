const { Prisma } = require('@prisma/client');
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

  // Create Achievements
  await Promise.all([
    prisma.achievement.create({
      data: {
        code: 'first-session',
        name: 'Getting Started',
        description: 'Complete your first learning session',
        icon: 'Star',
        category: 'milestone',
        condition: { type: 'session_count', value: 1 },
        pointsReward: 10,
        rarity: 'common',
        orderIndex: 1,
      },
    }),
    prisma.achievement.create({
      data: {
        code: '10-sessions',
        name: 'Dedicated Learner',
        description: 'Complete 10 learning sessions',
        icon: 'BookMarked',
        category: 'milestone',
        condition: { type: 'session_count', value: 10 },
        pointsReward: 50,
        rarity: 'rare',
        orderIndex: 2,
      },
    }),
    prisma.achievement.create({
      data: {
        code: '3-day-streak',
        name: 'On a Roll',
        description: 'Maintain a 3-day learning streak',
        icon: 'Flame',
        category: 'streak',
        condition: { type: 'streak', value: 3 },
        pointsReward: 25,
        rarity: 'common',
        orderIndex: 3,
      },
    }),
    prisma.achievement.create({
      data: {
        code: '7-day-streak',
        name: 'Week Warrior',
        description: 'Maintain a 7-day learning streak',
        icon: 'Flame',
        category: 'streak',
        condition: { type: 'streak', value: 7 },
        pointsReward: 100,
        rarity: 'rare',
        orderIndex: 4,
      },
    }),
  ]);

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
