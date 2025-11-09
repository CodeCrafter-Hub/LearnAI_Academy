'use client';

import { useState, useEffect, useCallback } from 'react';
import Classroom, { ClassroomHeader, ClassroomWorkspace } from './Classroom';
import { AnimatedClassroomBackground } from './ClassroomVisuals';
import InteractiveActivity from './InteractiveActivity';
import { LearningToolsSidebar } from './LearningTools';
import { PerformanceTracker, QuestionSelector } from '@/lib/adaptiveDifficulty';
import { getCurriculumTopics } from '@/lib/curriculumData';
import { getGradeTheme, getEncouragementMessage } from '@/lib/classroomThemes';

/**
 * Complete Learning Session Manager
 * Orchestrates all classroom systems for a complete learning experience
 */
export default function LearningSessionManager({
  student,
  subject,
  onSessionComplete,
  onExit,
}) {
  const [sessionState, setSessionState] = useState('intro'); // intro, learning, break, complete
  const [currentTopic, setCurrentTopic] = useState(null);
  const [performanceTracker, setPerformanceTracker] = useState(null);
  const [questionSelector, setQuestionSelector] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showTools, setShowTools] = useState(false);
  const [sessionStats, setSessionStats] = useState(null);
  const [achievements, setAchievements] = useState([]);

  const gradeTheme = getGradeTheme(student.gradeLevel);
  const curriculum = getCurriculumTopics(student.gradeLevel, subject);

  // Initialize session
  useEffect(() => {
    if (!curriculum) return;

    // Select first topic or continue from student's progress
    const topic = curriculum.topics[0];
    setCurrentTopic(topic);

    // Initialize performance tracking
    const tracker = new PerformanceTracker(student.gradeLevel, subject);
    setPerformanceTracker(tracker);

    // Initialize question selector (would load from database in production)
    const sampleQuestions = generateSampleQuestions(topic, student.gradeLevel);
    const selector = new QuestionSelector(student.gradeLevel, subject, sampleQuestions);
    setQuestionSelector(selector);

    // Auto-start after intro
    const timer = setTimeout(() => {
      setSessionState('learning');
      loadNextQuestion(tracker, selector);
    }, 3000);

    return () => clearTimeout(timer);
  }, [student.gradeLevel, subject, curriculum]);

  // Check for break time
  useEffect(() => {
    if (!performanceTracker || sessionState !== 'learning') return;

    const interval = setInterval(() => {
      if (performanceTracker.shouldTakeBreak()) {
        handleBreakTime();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [performanceTracker, sessionState]);

  const loadNextQuestion = useCallback((tracker, selector) => {
    if (!tracker || !selector) return;

    const question = selector.getNextQuestion(tracker.currentDifficulty);
    if (question) {
      setCurrentQuestion(question);
    } else {
      // No more questions - complete session
      handleSessionComplete();
    }
  }, []);

  const handleAnswer = (correct, timeSpent) => {
    if (!performanceTracker || !questionSelector || !currentQuestion) return;

    // Record response
    const result = performanceTracker.recordResponse(
      correct,
      timeSpent,
      currentQuestion.difficulty
    );

    // Check for achievements
    const newAchievements = checkAchievements(performanceTracker.getStatistics());
    if (newAchievements.length > 0) {
      setAchievements([...achievements, ...newAchievements]);
      showAchievementNotification(newAchievements);
    }

    // Load next question after brief delay
    setTimeout(() => {
      loadNextQuestion(performanceTracker, questionSelector);
    }, 2000);
  };

  const handleBreakTime = () => {
    setSessionState('break');
  };

  const handleResumeFromBreak = () => {
    setSessionState('learning');
  };

  const handleSessionComplete = () => {
    const stats = performanceTracker.getStatistics();
    setSessionStats(stats);
    setSessionState('complete');

    if (onSessionComplete) {
      onSessionComplete({
        stats,
        achievements,
        topic: currentTopic,
      });
    }
  };

  const handleExit = () => {
    if (onExit) {
      onExit({
        stats: performanceTracker?.getStatistics(),
        achievements,
      });
    }
  };

  return (
    <Classroom
      gradeLevel={student.gradeLevel}
      subject={subject}
      onEnter={() => console.log('Entered classroom')}
    >
      <AnimatedClassroomBackground
        gradeLevel={student.gradeLevel}
        subject={subject}
      />

      {/* Session States */}
      {sessionState === 'intro' && (
        <IntroScreen
          gradeLevel={student.gradeLevel}
          subject={subject}
          topic={currentTopic}
          studentName={student.name}
        />
      )}

      {sessionState === 'learning' && currentQuestion && (
        <>
          <ClassroomHeader
            gradeLevel={student.gradeLevel}
            subject={subject}
            topic={currentTopic?.name}
            mode="PRACTICE"
            onExit={handleExit}
          />

          <div className="flex gap-4 p-4">
            {/* Main Learning Area */}
            <div className="flex-1">
              <ClassroomWorkspace
                gradeLevel={student.gradeLevel}
                subject={subject}
              >
                {/* Progress Bar */}
                <SessionProgressBar
                  stats={performanceTracker?.getStatistics()}
                  gradeLevel={student.gradeLevel}
                />

                {/* Current Activity */}
                <InteractiveActivity
                  gradeLevel={student.gradeLevel}
                  subject={subject}
                  topic={currentTopic}
                  activityType="multiple-choice"
                  onComplete={handleAnswer}
                />

                {/* Encouragement Messages */}
                {performanceTracker && (
                  <EncouragementDisplay
                    tracker={performanceTracker}
                    gradeLevel={student.gradeLevel}
                  />
                )}
              </ClassroomWorkspace>
            </div>

            {/* Tools Sidebar (collapsible for older students) */}
            {(showTools || student.gradeLevel <= 5) && (
              <div className="w-64">
                <LearningToolsSidebar
                  gradeLevel={student.gradeLevel}
                  subject={subject}
                  onToolSelect={(tool) => console.log('Selected tool:', tool)}
                />
              </div>
            )}
          </div>

          {/* Tools Toggle for older students */}
          {student.gradeLevel > 5 && !showTools && (
            <button
              onClick={() => setShowTools(true)}
              className="fixed right-4 bottom-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-all"
            >
              📚 Show Tools
            </button>
          )}
        </>
      )}

      {sessionState === 'break' && (
        <BreakScreen
          gradeLevel={student.gradeLevel}
          message={performanceTracker?.getBreakMessage()}
          onResume={handleResumeFromBreak}
          onEnd={handleSessionComplete}
        />
      )}

      {sessionState === 'complete' && (
        <SessionCompleteScreen
          gradeLevel={student.gradeLevel}
          stats={sessionStats}
          achievements={achievements}
          studentName={student.name}
          onContinue={() => window.location.reload()}
          onExit={handleExit}
        />
      )}
    </Classroom>
  );
}

/**
 * Intro Screen - Welcome students to the session
 */
function IntroScreen({ gradeLevel, subject, topic, studentName }) {
  const gradeTheme = getGradeTheme(gradeLevel);
  const messages = getEncouragementMessage(gradeLevel, 'start');
  const message = Array.isArray(messages)
    ? messages[Math.floor(Math.random() * messages.length)]
    : messages;

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center animate-fadeIn">
        <div className="text-8xl mb-6 animate-bounce">
          {gradeLevel <= 2 ? '🌟' : gradeLevel <= 5 ? '🚀' : gradeLevel <= 8 ? '📚' : '🎯'}
        </div>

        <h1
          className={`${
            gradeLevel <= 2
              ? 'text-5xl'
              : gradeLevel <= 5
              ? 'text-4xl'
              : 'text-3xl'
          } font-bold mb-4 text-gray-800`}
        >
          {gradeLevel <= 5 ? `Hi ${studentName}! ` : `Welcome, ${studentName}`}
        </h1>

        <p
          className={`${
            gradeLevel <= 2
              ? 'text-3xl'
              : gradeLevel <= 5
              ? 'text-2xl'
              : 'text-xl'
          } text-gray-600 mb-8`}
        >
          {message}
        </p>

        {topic && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-blue-300">
            <p className="text-lg text-gray-600 mb-2">
              {gradeLevel <= 5 ? "Today we're learning:" : 'Topic:'}
            </p>
            <p className="text-2xl font-bold text-blue-600">{topic.name}</p>
          </div>
        )}

        <div className="mt-8 text-gray-500 animate-pulse">
          {gradeLevel <= 5 ? 'Get ready to start...' : 'Preparing session...'}
        </div>
      </div>
    </div>
  );
}

/**
 * Session Progress Bar
 */
function SessionProgressBar({ stats, gradeLevel }) {
  if (!stats) return null;

  const gradeTheme = getGradeTheme(gradeLevel);

  return (
    <div className="mb-6 bg-white rounded-2xl p-4 shadow-lg border-2 border-blue-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-6">
          <div className="text-center">
            <div
              className={`${
                gradeLevel <= 5 ? 'text-sm' : 'text-xs'
              } text-gray-600 mb-1`}
            >
              {gradeLevel <= 2 ? '✅ Correct' : 'Correct'}
            </div>
            <div
              className={`${
                gradeLevel <= 2 ? 'text-3xl' : 'text-2xl'
              } font-bold text-green-600`}
            >
              {stats.correctAttempts}
            </div>
          </div>

          <div className="text-center">
            <div
              className={`${
                gradeLevel <= 5 ? 'text-sm' : 'text-xs'
              } text-gray-600 mb-1`}
            >
              {gradeLevel <= 2 ? '📝 Total' : 'Total'}
            </div>
            <div
              className={`${
                gradeLevel <= 2 ? 'text-3xl' : 'text-2xl'
              } font-bold text-blue-600`}
            >
              {stats.totalAttempts}
            </div>
          </div>

          <div className="text-center">
            <div
              className={`${
                gradeLevel <= 5 ? 'text-sm' : 'text-xs'
              } text-gray-600 mb-1`}
            >
              {gradeLevel <= 2 ? '⭐ Score' : 'Accuracy'}
            </div>
            <div
              className={`${
                gradeLevel <= 2 ? 'text-3xl' : 'text-2xl'
              } font-bold text-yellow-600`}
            >
              {stats.accuracy}%
            </div>
          </div>

          {stats.currentStreak > 0 && (
            <div className="text-center">
              <div
                className={`${
                  gradeLevel <= 5 ? 'text-sm' : 'text-xs'
                } text-gray-600 mb-1`}
              >
                {gradeLevel <= 2 ? '🔥 Streak' : 'Streak'}
              </div>
              <div
                className={`${
                  gradeLevel <= 2 ? 'text-3xl' : 'text-2xl'
                } font-bold text-orange-600`}
              >
                {stats.currentStreak}
              </div>
            </div>
          )}
        </div>

        {/* Difficulty Level Indicator */}
        {gradeLevel > 5 && (
          <div className="text-right">
            <div className="text-xs text-gray-600 mb-1">Difficulty</div>
            <div className="flex gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-8 rounded ${
                    i < stats.currentDifficulty ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Time Indicator */}
      <div className="text-xs text-gray-500 text-right">
        Session time: {stats.sessionDuration} min
      </div>
    </div>
  );
}

/**
 * Encouragement Display
 */
function EncouragementDisplay({ tracker, gradeLevel }) {
  const [encouragement, setEncouragement] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    const newEncouragement = tracker.generateEncouragement();
    if (newEncouragement) {
      setEncouragement(newEncouragement);
      setShow(true);

      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [tracker.consecutiveCorrect, tracker.history.length]);

  if (!show || !encouragement) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slideInDown">
      <div
        className={`${
          gradeLevel <= 2
            ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white text-2xl p-6 rounded-3xl'
            : gradeLevel <= 5
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl p-5 rounded-2xl'
            : 'bg-white border-2 border-blue-400 text-gray-800 text-lg p-4 rounded-xl'
        } shadow-2xl font-bold animate-celebrate`}
      >
        {encouragement}
      </div>
    </div>
  );
}

/**
 * Break Screen
 */
function BreakScreen({ gradeLevel, message, onResume, onEnd }) {
  const [countdown, setCountdown] = useState(300); // 5 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-2xl w-full text-center">
        <div className="text-9xl mb-6 animate-bounce">
          {gradeLevel <= 5 ? '🎮' : '☕'}
        </div>

        <h2
          className={`${
            gradeLevel <= 2 ? 'text-5xl' : gradeLevel <= 5 ? 'text-4xl' : 'text-3xl'
          } font-bold mb-6 text-gray-800`}
        >
          {gradeLevel <= 5 ? 'Break Time!' : 'Take a Break'}
        </h2>

        <p
          className={`${
            gradeLevel <= 2 ? 'text-2xl' : 'text-xl'
          } text-gray-600 mb-8`}
        >
          {message}
        </p>

        {gradeLevel <= 8 && (
          <div className="bg-white rounded-3xl p-8 shadow-xl mb-8">
            <h3 className="text-2xl font-bold mb-4 text-blue-600">
              {gradeLevel <= 5 ? 'Things to do:' : 'Suggested activities:'}
            </h3>
            <ul className="text-left text-lg space-y-2">
              <li>
                {gradeLevel <= 5 ? '💧' : '•'} Drink some water
              </li>
              <li>
                {gradeLevel <= 5 ? '🤸' : '•'} Stretch or move around
              </li>
              <li>
                {gradeLevel <= 5 ? '👀' : '•'} Rest your eyes
              </li>
              <li>
                {gradeLevel <= 5 ? '🍎' : '•'} Have a healthy snack
              </li>
            </ul>
          </div>
        )}

        {countdown > 0 && (
          <div className="text-4xl font-bold text-blue-600 mb-8">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={onResume}
            className="bg-green-500 text-white px-8 py-4 rounded-2xl text-xl font-bold hover:bg-green-600 transition-all transform hover:scale-105 shadow-lg"
          >
            {gradeLevel <= 5 ? "I'm Ready! Let's Go! 🚀" : 'Resume Session'}
          </button>
          <button
            onClick={onEnd}
            className="bg-gray-500 text-white px-8 py-4 rounded-2xl text-xl font-bold hover:bg-gray-600 transition-all transform hover:scale-105 shadow-lg"
          >
            {gradeLevel <= 5 ? 'Finish for Today' : 'End Session'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Session Complete Screen
 */
function SessionCompleteScreen({
  gradeLevel,
  stats,
  achievements,
  studentName,
  onContinue,
  onExit,
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-3xl w-full text-center">
        {/* Celebration Animation */}
        <div className="text-9xl mb-6 animate-celebrate">
          {gradeLevel <= 2 ? '🎉' : gradeLevel <= 5 ? '🎊' : gradeLevel <= 8 ? '🏆' : '✓'}
        </div>

        <h2
          className={`${
            gradeLevel <= 2 ? 'text-6xl' : gradeLevel <= 5 ? 'text-5xl' : 'text-4xl'
          } font-bold mb-4 text-gray-800`}
        >
          {gradeLevel <= 5
            ? `Amazing Work, ${studentName}!`
            : gradeLevel <= 8
            ? `Great Job, ${studentName}!`
            : `Session Complete`}
        </h2>

        <p
          className={`${
            gradeLevel <= 5 ? 'text-2xl' : 'text-xl'
          } text-gray-600 mb-8`}
        >
          {getCompleteMessage(gradeLevel, stats)}
        </p>

        {/* Stats Display */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard
              icon={gradeLevel <= 5 ? '📝' : null}
              label="Questions"
              value={stats.totalAttempts}
              gradeLevel={gradeLevel}
            />
            <StatCard
              icon={gradeLevel <= 5 ? '✅' : null}
              label="Correct"
              value={stats.correctAttempts}
              gradeLevel={gradeLevel}
              highlight="green"
            />
            <StatCard
              icon={gradeLevel <= 5 ? '⭐' : null}
              label="Accuracy"
              value={`${stats.accuracy}%`}
              gradeLevel={gradeLevel}
              highlight="yellow"
            />
            <StatCard
              icon={gradeLevel <= 5 ? '⏱️' : null}
              label="Time"
              value={`${stats.sessionDuration}m`}
              gradeLevel={gradeLevel}
            />
          </div>
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl p-8 shadow-xl mb-8">
            <h3
              className={`${
                gradeLevel <= 5 ? 'text-3xl' : 'text-2xl'
              } font-bold mb-4 text-orange-700`}
            >
              {gradeLevel <= 5 ? '🏆 Achievements Unlocked! 🏆' : 'Achievements'}
            </h3>
            <div className="flex flex-wrap gap-4 justify-center">
              {achievements.map((achievement, i) => (
                <AchievementBadge
                  key={i}
                  achievement={achievement}
                  gradeLevel={gradeLevel}
                />
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={onContinue}
            className="bg-blue-500 text-white px-8 py-4 rounded-2xl text-xl font-bold hover:bg-blue-600 transition-all transform hover:scale-105 shadow-lg"
          >
            {gradeLevel <= 5 ? 'Learn More! 🚀' : 'Continue Learning'}
          </button>
          <button
            onClick={onExit}
            className="bg-gray-500 text-white px-8 py-4 rounded-2xl text-xl font-bold hover:bg-gray-600 transition-all transform hover:scale-105 shadow-lg"
          >
            {gradeLevel <= 5 ? 'All Done! 👋' : 'Exit'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Stat Card Component
 */
function StatCard({ icon, label, value, gradeLevel, highlight }) {
  const colors = {
    green: 'from-green-400 to-green-600',
    yellow: 'from-yellow-400 to-orange-500',
    blue: 'from-blue-400 to-blue-600',
  };

  return (
    <div
      className={`${
        highlight
          ? `bg-gradient-to-br ${colors[highlight]} text-white`
          : 'bg-gray-50'
      } rounded-2xl p-6 shadow-md`}
    >
      {icon && gradeLevel <= 5 && <div className="text-4xl mb-2">{icon}</div>}
      <div
        className={`${
          gradeLevel <= 5 ? 'text-sm' : 'text-xs'
        } ${highlight ? 'text-white opacity-90' : 'text-gray-600'} mb-2`}
      >
        {label}
      </div>
      <div
        className={`${
          gradeLevel <= 2 ? 'text-4xl' : 'text-3xl'
        } font-bold ${highlight ? 'text-white' : 'text-gray-800'}`}
      >
        {value}
      </div>
    </div>
  );
}

/**
 * Achievement Badge Component
 */
function AchievementBadge({ achievement, gradeLevel }) {
  return (
    <div
      className={`${
        gradeLevel <= 5
          ? 'bg-white rounded-2xl p-4 shadow-lg border-4 border-yellow-400'
          : 'bg-white rounded-lg p-3 shadow-md border-2 border-yellow-300'
      } text-center animate-glow`}
    >
      <div className={gradeLevel <= 5 ? 'text-5xl mb-2' : 'text-3xl mb-1'}>
        {achievement.emoji}
      </div>
      <div
        className={`${
          gradeLevel <= 5 ? 'text-lg' : 'text-sm'
        } font-bold text-gray-800`}
      >
        {achievement.name}
      </div>
    </div>
  );
}

/**
 * Helper Functions
 */

function getCompleteMessage(gradeLevel, stats) {
  if (gradeLevel <= 2) {
    if (stats.accuracy >= 90) return "You're a SUPERSTAR! 🌟";
    if (stats.accuracy >= 75) return 'You did SO GOOD! ⭐';
    return 'Great job trying your best! 💪';
  } else if (gradeLevel <= 5) {
    if (stats.accuracy >= 90) return 'Outstanding performance! 🎉';
    if (stats.accuracy >= 75) return 'Excellent work today! 👏';
    return 'Good effort! Keep practicing! 💪';
  } else if (gradeLevel <= 8) {
    if (stats.accuracy >= 90) return 'Excellent work!';
    if (stats.accuracy >= 75) return 'Good job today!';
    return 'Keep up the practice!';
  } else {
    if (stats.accuracy >= 90) return 'Excellent performance';
    if (stats.accuracy >= 75) return 'Good work';
    return 'Continue practicing';
  }
}

function checkAchievements(stats) {
  const achievements = [];

  if (stats.currentStreak >= 5) {
    achievements.push({ emoji: '🔥', name: 'Hot Streak!' });
  }
  if (stats.currentStreak >= 10) {
    achievements.push({ emoji: '⚡', name: 'Lightning Round!' });
  }
  if (stats.accuracy >= 100) {
    achievements.push({ emoji: '💯', name: 'Perfect Score!' });
  }
  if (stats.accuracy >= 90) {
    achievements.push({ emoji: '🌟', name: 'Star Student!' });
  }
  if (stats.totalAttempts >= 20) {
    achievements.push({ emoji: '💪', name: 'Hard Worker!' });
  }

  return achievements;
}

function showAchievementNotification(achievements) {
  // Would trigger visual/sound notification
  console.log('New achievements:', achievements);
}

function generateSampleQuestions(topic, gradeLevel) {
  // In production, this would load from database
  // Generating sample questions for demo
  return Array.from({ length: 20 }).map((_, i) => ({
    id: `q${i}`,
    text: `Sample question ${i + 1}`,
    difficulty: Math.min(topic.difficulty + Math.floor(i / 5), 10),
    topic: topic.id,
    answers: ['Answer A', 'Answer B', 'Answer C', 'Answer D'],
    correctAnswer: Math.floor(Math.random() * 4),
    hints: ['Think about...', 'Remember that...', 'Try...'],
  }));
}
