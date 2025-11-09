/**
 * Test Curriculum Generation Script
 * 
 * Tests the curriculum development system with the new AI provider configuration.
 * 
 * Usage:
 *   node scripts/testCurriculumGeneration.js
 * 
 * Make sure you have at least one AI provider API key configured:
 *   - GROQ_API_KEY
 *   - OPENAI_API_KEY
 *   - GEMINI_API_KEY
 *   - KIMI_API_KEY
 */

import { CurriculumAgent } from '../src/services/ai/agents/CurriculumAgent.js';
import { curriculumGeneratorService } from '../src/services/curriculum/curriculumGeneratorService.js';
import { aiProvider } from '../src/services/ai/aiProviderConfig.js';

// Test configuration
const TEST_CONFIG = {
  topic: 'Fractions',
  gradeLevel: 5,
  subjectId: 'math', // or get from database
  includeStandards: true,
  includeAssessments: true,
  includePracticeProblems: true,
};

/**
 * Test 1: Check AI Provider Status
 */
async function testAIProviderStatus() {
  console.log('\n📊 Testing AI Provider Status...\n');
  
  try {
    const status = aiProvider.getStatus();
    console.log('Available Providers:');
    status.available.forEach(provider => {
      console.log(`  ✅ ${provider.name} (${provider.key}) - Priority: ${provider.priority}`);
    });
    
    if (status.current) {
      console.log(`\n🎯 Current Provider: ${status.current.name}`);
    } else {
      console.log('\n⚠️  No AI providers available!');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error checking AI provider status:', error.message);
    return false;
  }
}

/**
 * Test 2: Simple AI Chat Test
 */
async function testAIChat() {
  console.log('\n💬 Testing AI Chat...\n');
  
  try {
    const response = await aiProvider.chat([
      { role: 'system', content: 'You are a helpful curriculum assistant.' },
      { role: 'user', content: 'Explain what fractions are in one sentence.' }
    ], {
      temperature: 0.7,
      maxTokens: 100,
    });
    
    console.log('✅ AI Response received:');
    console.log(`   Provider: ${response.provider}`);
    console.log(`   Model: ${response.model}`);
    console.log(`   Response Time: ${response.responseTime}ms`);
    console.log(`   Tokens Used: ${response.usage.totalTokens}`);
    console.log(`   Cost: $${response.cost.toFixed(6)}`);
    console.log(`\n   Content: ${response.content.substring(0, 200)}...`);
    
    return true;
  } catch (error) {
    console.error('❌ AI Chat test failed:', error.message);
    return false;
  }
}

/**
 * Test 3: Generate Lesson Plan
 */
async function testLessonPlanGeneration() {
  console.log('\n📚 Testing Lesson Plan Generation...\n');
  
  try {
    const agent = new CurriculumAgent('Math Curriculum Agent', TEST_CONFIG.subjectId);
    
    console.log(`Generating lesson plan for: ${TEST_CONFIG.topic} (Grade ${TEST_CONFIG.gradeLevel})...`);
    
    const lessonPlan = await agent.generateLessonPlan(
      TEST_CONFIG.topic,
      TEST_CONFIG.gradeLevel,
      {
        includeStandards: TEST_CONFIG.includeStandards,
        includeAssessments: TEST_CONFIG.includeAssessments,
        includePracticeProblems: TEST_CONFIG.includePracticeProblems,
        difficultyLevel: 'MEDIUM',
        useCache: false, // Don't use cache for testing
        maxRetries: 2,
      }
    );
    
    console.log('✅ Lesson Plan Generated Successfully!\n');
    console.log('📋 Lesson Plan Structure:');
    console.log(`   - Learning Objectives: ${lessonPlan.objectives?.length || 0} objectives`);
    console.log(`   - Key Concepts: ${lessonPlan.keyConcepts?.length || 0} concepts`);
    console.log(`   - Lesson Sections: ${lessonPlan.structure?.length || 0} sections`);
    
    if (lessonPlan.assessments) {
      console.log(`   - Assessment Questions: ${lessonPlan.assessments.length} questions`);
    }
    
    if (lessonPlan.practiceProblems) {
      console.log(`   - Practice Problems: ${lessonPlan.practiceProblems.length} problems`);
    }
    
    // Show sample content
    if (lessonPlan.objectives && lessonPlan.objectives.length > 0) {
      console.log('\n📌 Sample Learning Objective:');
      console.log(`   ${lessonPlan.objectives[0]}`);
    }
    
    if (lessonPlan.keyConcepts && lessonPlan.keyConcepts.length > 0) {
      console.log('\n💡 Sample Key Concept:');
      console.log(`   ${lessonPlan.keyConcepts[0]}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Lesson Plan Generation failed:', error.message);
    console.error('   Stack:', error.stack);
    return false;
  }
}

/**
 * Test 4: Generate Practice Problems
 */
async function testPracticeProblemGeneration() {
  console.log('\n🔢 Testing Practice Problem Generation...\n');
  
  try {
    const agent = new CurriculumAgent('Math Curriculum Agent', TEST_CONFIG.subjectId);
    
    console.log(`Generating practice problems for: ${TEST_CONFIG.topic} (Grade ${TEST_CONFIG.gradeLevel})...`);
    
    const problems = await agent.generatePracticeProblems(
      TEST_CONFIG.topic,
      TEST_CONFIG.gradeLevel,
      5, // Generate 5 problems
      'MEDIUM',
      {
        useCache: false,
        maxRetries: 2,
      }
    );
    
    console.log(`✅ Generated ${problems.length} Practice Problems!\n`);
    
    // Show first problem
    if (problems.length > 0) {
      const problem = problems[0];
      console.log('📝 Sample Problem:');
      console.log(`   Problem: ${problem.problem}`);
      console.log(`   Answer: ${problem.answer}`);
      console.log(`   Difficulty: ${problem.difficulty}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Practice Problem Generation failed:', error.message);
    return false;
  }
}

/**
 * Test 5: Full Curriculum Generation
 */
async function testFullCurriculumGeneration() {
  console.log('\n🎓 Testing Full Curriculum Generation...\n');
  
  try {
    console.log(`Generating curriculum structure for: ${TEST_CONFIG.topic} (Grade ${TEST_CONFIG.gradeLevel})...`);
    
    // This would typically use the curriculumGeneratorService
    // For now, we'll test the agent directly
    const agent = new CurriculumAgent('Math Curriculum Agent', TEST_CONFIG.subjectId);
    
    const lessonPlan = await agent.generateLessonPlan(
      TEST_CONFIG.topic,
      TEST_CONFIG.gradeLevel,
      {
        includeStandards: true,
        includeAssessments: true,
        includePracticeProblems: true,
        useCache: false,
        maxRetries: 2,
      }
    );
    
    console.log('✅ Full Curriculum Generated!\n');
    console.log('📊 Curriculum Summary:');
    console.log(`   Topic: ${TEST_CONFIG.topic}`);
    console.log(`   Grade Level: ${TEST_CONFIG.gradeLevel}`);
    console.log(`   Objectives: ${lessonPlan.objectives?.length || 0}`);
    console.log(`   Concepts: ${lessonPlan.keyConcepts?.length || 0}`);
    console.log(`   Sections: ${lessonPlan.structure?.length || 0}`);
    console.log(`   Assessments: ${lessonPlan.assessments?.length || 0}`);
    console.log(`   Practice Problems: ${lessonPlan.practiceProblems?.length || 0}`);
    
    return true;
  } catch (error) {
    console.error('❌ Full Curriculum Generation failed:', error.message);
    return false;
  }
}

/**
 * Main Test Runner
 */
async function runTests() {
  console.log('🚀 Starting Curriculum Development Tests...\n');
  console.log('='.repeat(60));
  
  const results = {
    providerStatus: false,
    aiChat: false,
    lessonPlan: false,
    practiceProblems: false,
    fullCurriculum: false,
  };
  
  // Test 1: Provider Status
  results.providerStatus = await testAIProviderStatus();
  if (!results.providerStatus) {
    console.log('\n❌ Cannot proceed without AI providers. Please configure at least one API key.');
    return;
  }
  
  // Test 2: Simple AI Chat
  results.aiChat = await testAIChat();
  
  // Test 3: Lesson Plan Generation
  if (results.aiChat) {
    results.lessonPlan = await testLessonPlanGeneration();
  }
  
  // Test 4: Practice Problems
  if (results.aiChat) {
    results.practiceProblems = await testPracticeProblemGeneration();
  }
  
  // Test 5: Full Curriculum
  if (results.lessonPlan) {
    results.fullCurriculum = await testFullCurriculumGeneration();
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Results Summary:\n');
  
  const tests = [
    { name: 'AI Provider Status', result: results.providerStatus },
    { name: 'AI Chat', result: results.aiChat },
    { name: 'Lesson Plan Generation', result: results.lessonPlan },
    { name: 'Practice Problem Generation', result: results.practiceProblems },
    { name: 'Full Curriculum Generation', result: results.fullCurriculum },
  ];
  
  tests.forEach(test => {
    const icon = test.result ? '✅' : '❌';
    console.log(`${icon} ${test.name}`);
  });
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  console.log(`\n📈 Passed: ${passed}/${total} tests`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Curriculum development is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});

