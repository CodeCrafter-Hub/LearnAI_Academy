# Usage Examples - Complete Guide

This document provides comprehensive examples of how to use all the new features and services.

---

## 📚 Table of Contents

1. [Progress Tracking](#progress-tracking)
2. [Achievements](#achievements)
3. [Recommendations](#recommendations)
4. [Curriculum Generation](#curriculum-generation)
5. [Assessment Generation](#assessment-generation)
6. [Complete Workflow](#complete-workflow)

---

## 📊 Progress Tracking

### Track Session Progress

```javascript
import { progressTracker } from '@/services/analytics/progressTracker';

// After a learning session ends
const sessionData = {
  problemsAttempted: 10,
  problemsCorrect: 8,
  durationMinutes: 15,
  pointsEarned: 30,
  concepts: ['fractions', 'addition'], // Optional: concepts covered
};

await progressTracker.trackSessionProgress(sessionId, sessionData);
```

### Get Progress Summary

```javascript
// Get overall progress
const summary = await progressTracker.getProgressSummary(studentId);

console.log(summary);
// {
//   totalTopics: 12,
//   masteredTopics: 3,
//   inProgressTopics: 5,
//   averageMastery: 65.5,
//   totalTimeMinutes: 450,
//   totalSessions: 25,
//   progressRecords: [...]
// }

// Get progress for specific subject
const mathProgress = await progressTracker.getProgressSummary(studentId, mathSubjectId);
```

### Get Topic Progress

```javascript
const topicProgress = await progressTracker.getTopicProgress(studentId, topicId);

console.log(topicProgress);
// {
//   masteryLevel: 75.5,
//   totalTimeMinutes: 120,
//   sessionsCount: 8,
//   strengths: ['fraction addition', 'simplifying'],
//   weaknesses: ['fraction division', 'word problems'],
//   lastPracticedAt: '2024-01-15T10:30:00Z'
// }
```

---

## 🏆 Achievements

### Check Achievements

```javascript
import { achievementChecker } from '@/services/analytics/achievementChecker';

// After a session ends
const newAchievements = await achievementChecker.checkAchievements(studentId, {
  sessionId: sessionId,
  sessionData: {
    problemsAttempted: 10,
    problemsCorrect: 10, // Perfect session!
    durationMinutes: 15,
    pointsEarned: 30,
  },
});

if (newAchievements.length > 0) {
  console.log(`🎉 Unlocked ${newAchievements.length} achievement(s)!`);
  newAchievements.forEach(ach => {
    console.log(`- ${ach.achievement.name}: ${ach.achievement.description}`);
  });
}
```

### Get Student Achievements

```javascript
const achievements = await achievementChecker.getStudentAchievements(studentId);

achievements.forEach(ach => {
  console.log(`${ach.name} - Unlocked: ${ach.unlockedAt}`);
});
```

### Get Achievement Progress

```javascript
// Check progress toward unlocking an achievement
const progress = await achievementChecker.getAchievementProgress(
  studentId,
  achievementId
);

console.log(progress);
// {
//   unlocked: false,
//   progress: 75, // 75% complete
//   current: 7,  // 7 days
//   target: 10   // Need 10 days
// }
```

### API Usage

```javascript
// Get all achievements for a student
const response = await fetch(`/api/achievements?studentId=${studentId}`, {
  headers: { 'Authorization': `Bearer ${token}` },
});

const { achievements } = await response.json();

// Filter unlocked vs locked
const unlocked = achievements.filter(a => a.unlocked);
const locked = achievements.filter(a => !a.unlocked);
```

---

## 🎯 Recommendations

### Get Recommendations

```javascript
import { recommendationEngine } from '@/services/analytics/recommendationEngine';

// Get personalized recommendations
const recommendations = await recommendationEngine.getRecommendations(studentId, {
  subjectId: mathSubjectId, // Optional: filter by subject
  limit: 5,
  includePrerequisites: true,
});

console.log(recommendations);
// {
//   recommendations: [
//     {
//       topicId: 'uuid',
//       topicName: 'Advanced Fractions',
//       subjectId: 'math-uuid',
//       subjectName: 'Mathematics',
//       reason: 'Next step after mastering Fractions',
//       priority: 85,
//       type: 'learning_path'
//     },
//     {
//       topicId: 'uuid',
//       topicName: 'Basic Algebra',
//       reason: 'Strengthen Basic Algebra (45% mastery)',
//       priority: 55,
//       type: 'strengthen',
//       currentMastery: 45
//     }
//   ],
//   total: 8,
//   strategies: {
//     learningPath: 3,
//     strengthen: 2,
//     prerequisite: 1,
//     advanced: 2
//   }
// }
```

### Get Learning Path

```javascript
const learningPath = await recommendationEngine.getLearningPath(
  studentId,
  mathSubjectId // Optional
);

console.log(learningPath);
// {
//   learningPath: [...recommendations],
//   bySubject: {
//     'math-uuid': [...math recommendations],
//     'science-uuid': [...science recommendations]
//   },
//   strategies: {...}
// }
```

### API Usage

```javascript
// Get recommendations
const response = await fetch(
  `/api/recommendations?studentId=${studentId}&subjectId=${mathSubjectId}&limit=5`,
  {
    headers: { 'Authorization': `Bearer ${token}` },
  }
);

const data = await response.json();

// Get learning path
const pathResponse = await fetch('/api/recommendations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    studentId,
    subjectId: mathSubjectId,
    limit: 10,
    includePrerequisites: true,
  }),
});

const pathData = await pathResponse.json();
```

---

## 📖 Curriculum Generation

### Generate Lesson Plan

```javascript
import { agentOrchestrator } from '@/services/ai/agentOrchestrator';

const lessonPlan = await agentOrchestrator.generateCurriculum(
  'lessonPlan',
  'math', // subject slug
  'Fractions',
  4, // grade level
  {
    includeStandards: true,
    includeAssessments: true,
    includePracticeProblems: true,
    difficultyLevel: 'MEDIUM',
  }
);

console.log(lessonPlan);
// Contains: objectives, prerequisites, key concepts, lesson structure, etc.
```

### Generate Practice Problems

```javascript
const problems = await agentOrchestrator.generateCurriculum(
  'practiceProblems',
  'math',
  'Fractions',
  4,
  {
    count: 10,
    difficulty: 'MEDIUM',
  }
);

// problems is an array of:
// {
//   problem: "What is 1/2 + 1/4?",
//   answer: "3/4",
//   solution: ["Step 1: Find common denominator", "..."],
//   commonMistakes: ["Forgetting to find common denominator"],
//   hints: ["Think about pizza slices"],
//   difficulty: "MEDIUM",
//   gradeLevel: 4
// }
```

### Generate Content Items

```javascript
const contentItems = await agentOrchestrator.generateCurriculum(
  'contentItems',
  'science',
  'Photosynthesis',
  5,
  {
    contentType: 'EXPLANATION',
    count: 5,
  }
);
```

### API Usage

```javascript
// Generate lesson plan
const response = await fetch('/api/curriculum', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    task: 'lessonPlan',
    subjectId: mathSubjectId,
    topicId: fractionsTopicId,
    gradeLevel: 4,
    options: {
      includeStandards: true,
      includeAssessments: true,
      includePracticeProblems: true,
    },
  }),
});

const { result, savedItems } = await response.json();

// Generate practice problems
const problemsResponse = await fetch('/api/curriculum', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    task: 'practiceProblems',
    subjectId: mathSubjectId,
    topicId: fractionsTopicId,
    gradeLevel: 4,
    options: {
      count: 20,
      difficulty: 'MEDIUM',
    },
  }),
});

const { result: problems } = await problemsResponse.json();
```

---

## 📝 Assessment Generation

### Generate Assessment

```javascript
const assessment = await agentOrchestrator.generateAssessment(
  'math', // subject slug
  'Fractions',
  4, // grade level
  {
    questionCount: 15,
    includeMultipleChoice: true,
    includeShortAnswer: true,
    includeProblemSolving: true,
  }
);
```

### Grade Assessment

```javascript
const studentAnswers = [
  { questionId: 1, answer: '3/4' },
  { questionId: 2, answer: 'The common denominator is 8' },
  // ... more answers
];

const results = await agentOrchestrator.gradeAssessment(
  assessmentId,
  studentAnswers,
  {
    studentId,
    gradeLevel: 4,
    subject: 'math',
    subjectName: 'Mathematics',
  }
);

console.log(results);
// {
//   score: 85.5,
//   totalCorrect: 12,
//   totalQuestions: 15,
//   questionResults: [
//     {
//       questionId: 1,
//       question: "What is 1/2 + 1/4?",
//       studentAnswer: "3/4",
//       correctAnswer: "3/4",
//       isCorrect: true,
//       points: 10,
//       feedback: "Great job! You correctly added the fractions."
//     },
//     // ...
//   ],
//   learningGaps: [
//     {
//       topic: "Fractions",
//       concept: "Adding fractions with different denominators",
//       questionIndex: 5
//     }
//   ],
//   recommendations: {
//     text: "Based on your assessment...",
//     nextSteps: [
//       "Review adding fractions with different denominators",
//       "Practice converting improper fractions"
//     ]
//   }
// }
```

### API Usage

```javascript
// Generate assessment
const assessmentResponse = await fetch('/api/assessments/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    topicId: fractionsTopicId,
    gradeLevel: 4,
    assessmentType: 'diagnostic',
    questionCount: 15,
    options: {
      includeMultipleChoice: true,
      includeShortAnswer: true,
      timeLimitMinutes: 30,
    },
  }),
});

const { assessment } = await assessmentResponse.json();

// Grade assessment
const gradeResponse = await fetch(`/api/assessments/${assessment.id}/grade`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    studentId,
    answers: studentAnswers,
  }),
});

const { result } = await gradeResponse.json();
```

---

## 🔄 Complete Workflow Example

### Full Learning Session Flow

```javascript
// 1. Create session
const sessionResponse = await fetch('/api/sessions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    studentId,
    subjectId: mathSubjectId,
    topicId: fractionsTopicId,
    mode: 'PRACTICE',
    difficulty: 'MEDIUM',
    isVoiceMode: true,
  }),
});

const { session } = await sessionResponse.json();

// 2. Student interacts with AI tutor
// ... send messages via /api/sessions/[id]/messages

// 3. Update session with problems attempted/correct
await prisma.learningSession.update({
  where: { id: session.id },
  data: {
    problemsAttempted: 10,
    problemsCorrect: 8,
  },
});

// 4. End session (automatically tracks progress and checks achievements)
const endResponse = await fetch(`/api/sessions/${session.id}/end`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const { newAchievements } = await endResponse.json();

// 5. Get updated progress
const progressSummary = await progressTracker.getProgressSummary(studentId);

// 6. Get recommendations for next steps
const recommendations = await recommendationEngine.getRecommendations(studentId, {
  subjectId: mathSubjectId,
  limit: 5,
});

// 7. Display to student:
//    - Progress summary
//    - New achievements
//    - Recommendations for next topics
```

### Assessment Workflow

```javascript
// 1. Generate diagnostic assessment
const assessment = await agentOrchestrator.generateAssessment(
  'math',
  'Fractions',
  4,
  { questionCount: 15 }
);

// 2. Save assessment
const savedAssessment = await prisma.assessment.create({
  data: {
    name: 'Fractions Diagnostic',
    assessmentType: 'diagnostic',
    subjectId: mathSubjectId,
    gradeLevel: 4,
    totalQuestions: 15,
    metadata: { questions: assessment.questions },
  },
});

// 3. Student takes assessment
// ... present questions, collect answers

// 4. Grade assessment
const results = await agentOrchestrator.gradeAssessment(
  savedAssessment.id,
  studentAnswers,
  { studentId, gradeLevel: 4, subject: 'math' }
);

// 5. Save results
await prisma.assessmentResult.create({
  data: {
    assessmentId: savedAssessment.id,
    studentId,
    score: results.score,
    totalCorrect: results.totalCorrect,
    totalQuestions: results.totalQuestions,
    questionResults: results.questionResults,
    recommendedTopics: results.recommendations.nextSteps,
  },
});

// 6. Update progress based on assessment
await progressTracker.updateProgress(studentId, topicId, {
  masteryLevel: results.score, // Use assessment score as mastery
  weaknesses: results.learningGaps.map(g => g.concept),
});

// 7. Get recommendations based on assessment results
const recommendations = await recommendationEngine.getRecommendations(studentId, {
  subjectId: mathSubjectId,
  includePrerequisites: true, // Important after assessment!
});
```

---

## 🧪 Testing

Run the test script to verify everything works:

```bash
node scripts/test-services.js
```

This will test:
- ✅ Progress tracking
- ✅ Achievement checking
- ✅ Recommendations
- ✅ Curriculum generation
- ✅ Assessment generation

---

## 📚 Additional Resources

- **API_USAGE_GUIDE.md** - Complete API reference
- **CORE_SERVICES_IMPLEMENTATION.md** - Service implementation details
- **AGENT_ARCHITECTURE_PROPOSAL.md** - Architecture documentation
- **IMPLEMENTATION_SUMMARY.md** - Implementation overview

---

## 💡 Tips

1. **Progress Tracking**: Always track progress after sessions end, not during
2. **Achievements**: Check achievements after progress updates
3. **Recommendations**: Refresh recommendations after each session
4. **Curriculum**: Cache generated curriculum to reduce API costs
5. **Assessments**: Use diagnostic assessments to identify learning gaps

---

## 🚀 Next Steps

1. Integrate these examples into your frontend
2. Add error handling and loading states
3. Implement caching for generated content
4. Add analytics tracking
5. Create user-friendly UI components

