# LearnAI Academy - Integration Example

## Complete Implementation Guide

This document provides a complete example of how to integrate all the grade-customized classroom systems into your LearnAI Academy application.

## Example: Complete Learning Flow

### 1. Student Data Model

```javascript
// Example student object
const student = {
  id: 'student_123',
  name: 'Emma',
  gradeLevel: 4, // 4th grade
  subjects: ['math', 'reading', 'science', 'english', 'coding'],
  preferences: {
    selectedAvatar: 'star',
    theme: 'default',
    soundEffects: true,
  },
};
```

### 2. Main Application Component

```javascript
'use client';

import { useState } from 'react';
import StudentProgressDashboard from '@/components/dashboard/StudentProgressDashboard';
import LearningSessionManager from '@/components/learning/LearningSessionManager';

export default function LearnAIApp() {
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard | learning
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Mock student data - in production, load from authentication/database
  const student = {
    id: 'student_123',
    name: 'Emma',
    gradeLevel: 4,
  };

  return (
    <div className="min-h-screen">
      {currentView === 'dashboard' && (
        <StudentProgressDashboard
          student={student}
          onStartLearning={(subject) => {
            setSelectedSubject(subject);
            setCurrentView('learning');
          }}
        />
      )}

      {currentView === 'learning' && selectedSubject && (
        <LearningSessionManager
          student={student}
          subject={selectedSubject}
          onSessionComplete={(data) => {
            console.log('Session complete!', data);
            setCurrentView('dashboard');
          }}
          onExit={() => {
            setCurrentView('dashboard');
          }}
        />
      )}
    </div>
  );
}
```

### 3. Subject Selection Page

```javascript
'use client';

import { SubjectClassroomCard } from '@/components/learning/Classroom';
import { getSubjectClassroom } from '@/lib/classroomThemes';

export default function SubjectSelection({ student, onSubjectSelect }) {
  const subjects = ['math', 'reading', 'science', 'english', 'coding'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-center text-gray-800 mb-8">
          Choose Your Subject
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => {
            // Mock progress - in production, load from database
            const progress = {
              percentComplete: Math.random() * 100,
              topicsCompleted: Math.floor(Math.random() * 20),
              pointsEarned: Math.floor(Math.random() * 500),
            };

            return (
              <SubjectClassroomCard
                key={subject}
                gradeLevel={student.gradeLevel}
                subject={{ slug: subject }}
                onClick={() => onSubjectSelect(subject)}
                progress={progress}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

### 4. Learning Session Example

```javascript
'use client';

import LearningSessionManager from '@/components/learning/LearningSessionManager';

export default function LearningPage() {
  const student = {
    id: 'student_123',
    name: 'Emma',
    gradeLevel: 4,
  };

  const handleSessionComplete = (sessionData) => {
    console.log('Session completed:', sessionData);
    // Save session data to database
    // Update student progress
    // Award achievements
    // Navigate to completion screen
  };

  const handleExit = (partialData) => {
    console.log('Session exited early:', partialData);
    // Save partial progress
    // Navigate back to dashboard
  };

  return (
    <LearningSessionManager
      student={student}
      subject="math"
      onSessionComplete={handleSessionComplete}
      onExit={handleExit}
    />
  );
}
```

### 5. Using Interactive Activities

```javascript
'use client';

import InteractiveActivity from '@/components/learning/InteractiveActivity';

export default function ActivityExample({ student, topic }) {
  const handleComplete = (correct, timeSpent) => {
    console.log('Answer:', correct ? 'Correct!' : 'Incorrect');
    console.log('Time spent:', timeSpent, 'seconds');

    // Record to performance tracker
    // Load next question
    // Update progress
  };

  return (
    <div className="p-8">
      <InteractiveActivity
        gradeLevel={student.gradeLevel}
        subject="math"
        topic={topic}
        activityType="multiple-choice"
        onComplete={handleComplete}
      />
    </div>
  );
}
```

### 6. Using Adaptive Difficulty

```javascript
import {
  PerformanceTracker,
  QuestionSelector,
} from '@/lib/adaptiveDifficulty';
import { getCurriculumTopics } from '@/lib/curriculumData';

export function setupAdaptiveLearning(student, subject) {
  // Initialize performance tracker
  const tracker = new PerformanceTracker(student.gradeLevel, subject);

  // Load questions from database or curriculum
  const curriculum = getCurriculumTopics(student.gradeLevel, subject);
  const questions = loadQuestionsForTopic(curriculum.topics[0]);

  // Initialize question selector
  const selector = new QuestionSelector(
    student.gradeLevel,
    subject,
    questions
  );

  // Get first question at appropriate difficulty
  const firstQuestion = selector.getNextQuestion(tracker.currentDifficulty);

  return { tracker, selector, firstQuestion };
}

export function handleStudentAnswer(tracker, selector, correct, timeSpent, currentDifficulty) {
  // Record the response
  const result = tracker.recordResponse(correct, timeSpent, currentDifficulty);

  console.log('New difficulty:', result.newDifficulty);
  console.log('Feedback:', result.feedback);
  console.log('Encouragement:', result.encouragement);

  // Check if break is needed
  if (tracker.shouldTakeBreak()) {
    return {
      action: 'break',
      message: tracker.getBreakMessage(),
    };
  }

  // Get next question
  const nextQuestion = selector.getNextQuestion(result.newDifficulty);

  return {
    action: 'continue',
    question: nextQuestion,
    stats: tracker.getStatistics(),
  };
}
```

### 7. Using Achievement System

```javascript
import { AchievementTracker } from '@/lib/achievementSystem';

export async function setupAchievements(studentId) {
  const tracker = new AchievementTracker(studentId);
  await tracker.loadProgress();
  return tracker;
}

export function handleSessionComplete(achievementTracker, sessionData) {
  // Update achievements based on session performance
  const newAchievements = achievementTracker.updateStats(sessionData);

  if (newAchievements.length > 0) {
    console.log('New achievements unlocked:', newAchievements);
    // Show achievement notification
    // Play celebration animation
    // Update UI
  }

  // Get level progress
  const levelProgress = achievementTracker.getLevelProgress();

  if (levelProgress.progress >= 100) {
    console.log('LEVEL UP! New level:', levelProgress.currentLevel + 1);
    // Show level up animation
  }

  return {
    achievements: newAchievements,
    levelProgress,
    stats: achievementTracker.stats,
  };
}
```

### 8. Grade-Specific UI Examples

```javascript
// K-2 Example (Very colorful, large, playful)
<div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 rounded-3xl p-8 shadow-2xl">
  <h1 className="text-6xl font-bold text-white mb-6">
    Let's Learn Math! 🎉
  </h1>
  <button className="bg-white text-orange-500 text-3xl font-bold py-6 px-12 rounded-full shadow-lg hover:scale-110 transition-transform">
    Start Learning! ⭐
  </button>
</div>

// 3-5 Example (Balanced, engaging)
<div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-xl">
  <h1 className="text-4xl font-bold text-white mb-4">
    Math Practice 🎯
  </h1>
  <button className="bg-white text-blue-600 text-xl font-bold py-4 px-8 rounded-lg shadow-md hover:scale-105 transition-transform">
    Begin Session
  </button>
</div>

// 6-8 Example (More mature, professional)
<div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl p-5 shadow-lg">
  <h1 className="text-3xl font-bold text-white mb-3">
    Mathematics
  </h1>
  <button className="bg-white text-indigo-700 text-lg font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors">
    Start Practice
  </button>
</div>

// 9-12 Example (Clean, professional, minimal)
<div className="bg-slate-700 rounded-lg p-4 shadow-md">
  <h1 className="text-2xl font-semibold text-white mb-2">
    Mathematics
  </h1>
  <button className="bg-white text-slate-700 text-base font-medium py-2 px-5 rounded hover:bg-gray-100 transition-colors">
    Begin
  </button>
</div>
```

### 9. Complete Session Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│               Student Dashboard                           │
│  - Progress overview                                      │
│  - Subject cards                                          │
│  - Achievements display                                   │
│  - Quick stats                                            │
└───────────────────┬─────────────────────────────────────┘
                    │ Select Subject
                    ▼
┌─────────────────────────────────────────────────────────┐
│            Classroom Entrance Animation                   │
│  - Welcome message                                        │
│  - Today's topic                                          │
│  - Grade-appropriate animations                           │
└───────────────────┬─────────────────────────────────────┘
                    │ Auto-start
                    ▼
┌─────────────────────────────────────────────────────────┐
│              Learning Session                             │
│  ┌─────────────────────────────────────────────┐        │
│  │ Performance Tracker                         │        │
│  │ - Tracks correct/incorrect                  │        │
│  │ - Adjusts difficulty                        │        │
│  │ - Monitors time                             │        │
│  └─────────────────────────────────────────────┘        │
│  ┌─────────────────────────────────────────────┐        │
│  │ Question Selector                           │        │
│  │ - Selects appropriate questions             │        │
│  │ - Avoids repeats                            │        │
│  │ - Matches difficulty                        │        │
│  └─────────────────────────────────────────────┘        │
│  ┌─────────────────────────────────────────────┐        │
│  │ Interactive Activity                        │        │
│  │ - Grade-appropriate UI                      │        │
│  │ - Real-time feedback                        │        │
│  │ - Visual aids (if K-5)                      │        │
│  └─────────────────────────────────────────────┘        │
└───────────────────┬─────────────────────────────────────┘
                    │ Attention span reached
                    ▼
┌─────────────────────────────────────────────────────────┐
│                 Break Screen                              │
│  - Rest recommendations                                   │
│  - Countdown timer                                        │
│  - Resume or End options                                  │
└───────────────────┬─────────────────────────────────────┘
                    │ Resume or Complete
                    ▼
┌─────────────────────────────────────────────────────────┐
│           Session Complete Screen                         │
│  - Session stats                                          │
│  - New achievements                                       │
│  - Level progress                                         │
│  - Grade-appropriate celebration                          │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│          Achievement System Update                        │
│  - Process session data                                   │
│  - Check achievement requirements                         │
│  - Update level/points                                    │
│  - Save progress                                          │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
              Back to Dashboard
```

## Data Flow Example

### Session Data Structure

```javascript
const sessionData = {
  studentId: 'student_123',
  subject: 'math',
  topic: 'multiplication-tables',
  gradeLevel: 4,

  // Performance metrics
  totalAttempts: 20,
  correctAttempts: 17,
  accuracy: 85,
  currentStreak: 5,
  sessionDuration: 23, // minutes

  // Difficulty progression
  startingDifficulty: 3,
  endingDifficulty: 4,
  averageDifficulty: 3.5,

  // Time tracking
  startTime: '2024-11-08T10:00:00Z',
  endTime: '2024-11-08T10:23:00Z',
  averageTimePerQuestion: 69, // seconds

  // Questions attempted
  questions: [
    {
      id: 'q1',
      difficulty: 3,
      correct: true,
      timeSpent: 45,
      hintsUsed: 0,
    },
    // ... more questions
  ],

  // Achievements unlocked
  achievementsUnlocked: ['streak_5', 'questions_10'],
  pointsEarned: 75,

  // Break taken
  breakTaken: true,
  breakDuration: 300, // seconds
};
```

### Student Progress Structure

```javascript
const studentProgress = {
  studentId: 'student_123',
  gradeLevel: 4,

  // Overall stats
  totalPoints: 1250,
  currentLevel: 8,
  totalSessions: 45,

  // Subject progress
  subjects: {
    math: {
      percentComplete: 65,
      topicsCompleted: 12,
      topicsTotal: 18,
      currentTopic: 'fractions-intro',
      pointsEarned: 450,
      accuracy: 82,
      lastSession: '2024-11-08T10:23:00Z',
    },
    // ... other subjects
  },

  // Achievements
  achievements: {
    unlocked: [
      'first_answer',
      'streak_3',
      'streak_5',
      'questions_10',
      'questions_50',
      'daily_learner',
    ],
    total: 6,
    byTier: {
      bronze: 2,
      silver: 2,
      gold: 2,
      platinum: 0,
    },
  },

  // Streaks
  streaks: {
    current: 5,
    best: 12,
    daily: 7, // days in a row
  },

  // Preferences
  preferences: {
    avatar: 'rocket',
    theme: 'space',
    soundEffects: true,
  },
};
```

## Best Practices

### 1. Always Use Grade-Appropriate Components

```javascript
// BAD - Not grade-specific
<div className="text-lg p-4">Learn Math</div>

// GOOD - Uses grade theme
import { getClassroomStyles } from '@/lib/classroomThemes';
const styles = getClassroomStyles(student.gradeLevel, 'math');
<div className={`${styles.text.heading} ${styles.spacing}`}>
  {gradeTheme.emojis ? 'Learn Math! 🎯' : 'Learn Math'}
</div>
```

### 2. Load Curriculum Data for Topics

```javascript
// Load grade-appropriate curriculum
import { getCurriculumTopics } from '@/lib/curriculumData';

const topics = getCurriculumTopics(student.gradeLevel, 'math');
console.log(topics.topics); // Grade-appropriate topics
console.log(topics.sessionDuration); // Optimal session length
```

### 3. Use Performance Tracker for Adaptive Learning

```javascript
// Initialize once per session
const tracker = new PerformanceTracker(student.gradeLevel, subject);

// Record each answer
const result = tracker.recordResponse(correct, timeSpent, difficulty);

// Check for breaks
if (tracker.shouldTakeBreak()) {
  showBreakScreen(tracker.getBreakMessage());
}
```

### 4. Track Achievements Consistently

```javascript
// Initialize on app load
const achievementTracker = new AchievementTracker(student.id);
await achievementTracker.loadProgress();

// Update after each session
const newAchievements = achievementTracker.updateStats(sessionData);

// Always save
await achievementTracker.saveProgress();
```

### 5. Respect Grade-Specific Attention Spans

```javascript
import { getSessionDuration } from '@/lib/curriculumData';

const optimalDuration = getSessionDuration(student.gradeLevel);
// K-2: 15 min, 3-5: 25 min, 6-8: 35 min, 9-12: 45 min

// Set up session timer
const sessionTimer = setTimeout(() => {
  suggestBreak();
}, optimalDuration * 60 * 1000);
```

## Integration Checklist

- [ ] Student authentication/profile loading
- [ ] Grade theme application throughout UI
- [ ] Curriculum data loaded for each subject
- [ ] Performance tracker initialized for sessions
- [ ] Achievement system tracking progress
- [ ] Break management based on attention span
- [ ] Progress saving to database
- [ ] Grade-appropriate feedback/encouragement
- [ ] Visual customizations matching grade
- [ ] Accessibility features (touch targets, contrast)

## Next Steps

1. **Database Integration**: Connect to your backend to load/save student data
2. **Question Bank**: Create or load comprehensive question banks
3. **Analytics**: Add analytics to track learning patterns
4. **Parent/Teacher Dashboards**: Build dashboards for adults
5. **Gamification**: Enhance with more game elements
6. **Social Features**: Add collaborative learning
7. **Mobile App**: Create native mobile versions
8. **Offline Support**: Enable offline learning

---

**Need Help?** Check the comprehensive docs at `/docs/GRADE_CLASSROOM_CUSTOMIZATION.md`
