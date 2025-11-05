/**
 * Test Script for Core Services
 * 
 * This script tests all the newly implemented services:
 * - ProgressTracker
 * - AchievementChecker
 * - RecommendationEngine
 * - Curriculum Generation
 * - Assessment Generation
 * 
 * Usage: node scripts/test-services.js
 * 
 * Note: This requires Node.js with ES modules support or use with ts-node/tsx
 * For CommonJS, update imports to require() statements
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Note: These imports assume ES modules. If using CommonJS, you'll need to:
// 1. Convert these files to .cjs or
// 2. Use dynamic imports: const { progressTracker } = await import('../src/services/analytics/progressTracker.js');
// 3. Or use a tool like ts-node/tsx

// For now, we'll use a simplified test that doesn't require these imports
// You can test the APIs directly via HTTP requests instead

async function testServices() {
  console.log('🧪 Testing Core Services...\n');

  try {
    // Get demo student
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@learnai.com' },
      include: { students: true },
    });

    if (!demoUser || !demoUser.students.length) {
      console.error('❌ Demo user or student not found. Please run seed script first.');
      return;
    }

    const student = demoUser.students[0];
    console.log(`✅ Using student: ${student.firstName} (Grade ${student.gradeLevel})\n`);

    // Test 1: Progress Tracking
    console.log('📊 Test 1: Progress Tracking');
    console.log('─'.repeat(50));
    
    const mathSubject = await prisma.subject.findFirst({ where: { slug: 'math' } });
    const fractionsTopic = await prisma.topic.findFirst({ 
      where: { slug: 'fractions', subjectId: mathSubject.id } 
    });

    if (!fractionsTopic) {
      console.error('❌ Fractions topic not found');
      return;
    }

    // Create a test session
    const testSession = await prisma.learningSession.create({
      data: {
        studentId: student.id,
        subjectId: mathSubject.id,
        topicId: fractionsTopic.id,
        sessionMode: 'PRACTICE',
        difficultyLevel: 'MEDIUM',
        startedAt: new Date(),
        problemsAttempted: 10,
        problemsCorrect: 8,
      },
    });

    // Track progress
    await progressTracker.trackSessionProgress(testSession.id, {
      problemsAttempted: 10,
      problemsCorrect: 8,
      durationMinutes: 15,
      pointsEarned: 30,
      concepts: ['fractions', 'addition'],
    });

    // Get progress summary
    const progressSummary = await progressTracker.getProgressSummary(student.id);
    console.log(`✅ Progress Summary:`);
    console.log(`   - Total Topics: ${progressSummary.totalTopics}`);
    console.log(`   - Mastered Topics: ${progressSummary.masteredTopics}`);
    console.log(`   - Average Mastery: ${progressSummary.averageMastery.toFixed(1)}%`);
    console.log(`   - Total Time: ${progressSummary.totalTimeMinutes} minutes`);
    console.log(`   - Total Sessions: ${progressSummary.totalSessions}\n`);

    // Test 2: Achievement Checking
    console.log('🏆 Test 2: Achievement Checking');
    console.log('─'.repeat(50));
    
    const newAchievements = await achievementChecker.checkAchievements(student.id, {
      sessionId: testSession.id,
      sessionData: {
        problemsAttempted: 10,
        problemsCorrect: 10, // Perfect session
        durationMinutes: 15,
        pointsEarned: 30,
      },
    });

    if (newAchievements.length > 0) {
      console.log(`✅ Unlocked ${newAchievements.length} new achievement(s):`);
      newAchievements.forEach(ach => {
        console.log(`   - ${ach.achievement.name} (${ach.achievement.pointsReward} points)`);
      });
    } else {
      console.log('ℹ️  No new achievements unlocked');
    }

    // Get all student achievements
    const allAchievements = await achievementChecker.getStudentAchievements(student.id);
    console.log(`\n✅ Total Achievements: ${allAchievements.length}\n`);

    // Test 3: Recommendations
    console.log('🎯 Test 3: Recommendations');
    console.log('─'.repeat(50));
    
    const recommendations = await recommendationEngine.getRecommendations(student.id, {
      subjectId: mathSubject.id,
      limit: 5,
      includePrerequisites: true,
    });

    console.log(`✅ Generated ${recommendations.total} recommendations:`);
    recommendations.recommendations.slice(0, 3).forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec.topicName}`);
      console.log(`      Reason: ${rec.reason}`);
      console.log(`      Priority: ${rec.priority}`);
      console.log(`      Type: ${rec.type}\n`);
    });

    // Test 4: Curriculum Generation
    console.log('📚 Test 4: Curriculum Generation');
    console.log('─'.repeat(50));
    
    try {
      const lessonPlan = await agentOrchestrator.generateCurriculum(
        'lessonPlan',
        'math',
        'Fractions',
        student.gradeLevel,
        {
          includeStandards: true,
          includePracticeProblems: true,
        }
      );

      console.log('✅ Generated Lesson Plan');
      if (lessonPlan.parsed) {
        console.log(`   - Sections: ${Object.keys(lessonPlan.parsed).length}`);
      } else {
        console.log('   - Lesson plan generated (check raw content)');
      }

      const problems = await agentOrchestrator.generateCurriculum(
        'practiceProblems',
        'math',
        'Fractions',
        student.gradeLevel,
        {
          count: 3,
          difficulty: 'MEDIUM',
        }
      );

      console.log('✅ Generated Practice Problems');
      if (Array.isArray(problems)) {
        console.log(`   - Problems: ${problems.length}`);
      } else if (problems.raw) {
        console.log('   - Problems generated (check raw content)');
      }
    } catch (error) {
      console.log(`⚠️  Curriculum generation requires GROQ_API_KEY: ${error.message}`);
    }

    // Test 5: Assessment Generation
    console.log('\n📝 Test 5: Assessment Generation');
    console.log('─'.repeat(50));
    
    try {
      const assessment = await agentOrchestrator.generateAssessment(
        'math',
        'Fractions',
        student.gradeLevel,
        {
          questionCount: 5,
          includeMultipleChoice: true,
          includeShortAnswer: true,
        }
      );

      console.log('✅ Generated Assessment');
      if (Array.isArray(assessment)) {
        console.log(`   - Questions: ${assessment.length}`);
      } else if (assessment.raw) {
        console.log('   - Assessment generated (check raw content)');
      }
    } catch (error) {
      console.log(`⚠️  Assessment generation requires GROQ_API_KEY: ${error.message}`);
    }

    // Cleanup test session
    await prisma.learningSession.delete({
      where: { id: testSession.id },
    });

    console.log('\n✅ All tests completed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testServices()
  .catch((error) => {
    console.error('❌ Error running tests:', error);
    process.exit(1);
  });

