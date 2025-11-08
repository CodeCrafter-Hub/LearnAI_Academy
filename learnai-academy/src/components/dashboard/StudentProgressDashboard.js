'use client';

import { useState, useEffect } from 'react';
import { getGradeTheme, getClassroomStyles, getSubjectClassroom } from '@/lib/classroomThemes';
import { AchievementTracker, ACHIEVEMENT_TIERS, getMotivationalMessage } from '@/lib/achievementSystem';
import { ProgressDisplay } from '../learning/ClassroomVisuals';

/**
 * Student Progress Dashboard
 * Grade-appropriate dashboard showing student progress, achievements, and stats
 */
export default function StudentProgressDashboard({ student }) {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [achievementTracker, setAchievementTracker] = useState(null);
  const [view, setView] = useState('overview'); // overview, subject, achievements, stats

  const gradeTheme = getGradeTheme(student.gradeLevel);

  useEffect(() => {
    const tracker = new AchievementTracker(student.id);
    tracker.loadProgress();
    setAchievementTracker(tracker);
  }, [student.id]);

  if (!achievementTracker) {
    return <LoadingDashboard gradeLevel={student.gradeLevel} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      {/* Dashboard Header */}
      <DashboardHeader
        student={student}
        achievementTracker={achievementTracker}
        gradeLevel={student.gradeLevel}
      />

      {/* Navigation */}
      <DashboardNav
        view={view}
        onViewChange={setView}
        gradeLevel={student.gradeLevel}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto mt-8">
        {view === 'overview' && (
          <OverviewView
            student={student}
            achievementTracker={achievementTracker}
            onSubjectSelect={setSelectedSubject}
          />
        )}

        {view === 'achievements' && (
          <AchievementsView
            student={student}
            achievementTracker={achievementTracker}
          />
        )}

        {view === 'stats' && (
          <StatsView
            student={student}
            achievementTracker={achievementTracker}
          />
        )}

        {view === 'rewards' && (
          <RewardsView
            student={student}
            achievementTracker={achievementTracker}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Dashboard Header with Level & Points
 */
function DashboardHeader({ student, achievementTracker, gradeLevel }) {
  const gradeTheme = getGradeTheme(gradeLevel);
  const levelProgress = achievementTracker.getLevelProgress();
  const motivationalMsg = getMotivationalMessage(levelProgress.currentLevel, gradeLevel);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border-4 border-blue-300">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Student Info */}
          <div className="text-center md:text-left">
            <h1
              className={`${
                gradeLevel <= 2
                  ? 'text-5xl'
                  : gradeLevel <= 5
                  ? 'text-4xl'
                  : 'text-3xl'
              } font-bold text-gray-800 mb-2`}
            >
              {gradeLevel <= 5 ? `${student.name}'s Learning Dashboard!` : `${student.name}'s Dashboard`}
            </h1>
            <p
              className={`${
                gradeLevel <= 5 ? 'text-xl' : 'text-lg'
              } text-gray-600`}
            >
              Grade {student.gradeLevel}
              {gradeTheme.emojis && ' 📚'}
            </p>
          </div>

          {/* Level & Points */}
          <div className="flex gap-6">
            {/* Level */}
            <div className="text-center">
              <div
                className={`${
                  gradeLevel <= 2
                    ? 'w-32 h-32'
                    : gradeLevel <= 5
                    ? 'w-28 h-28'
                    : 'w-24 h-24'
                } bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-glow`}
              >
                <div>
                  <div className="text-white text-sm font-semibold">LEVEL</div>
                  <div
                    className={`text-white font-bold ${
                      gradeLevel <= 2 ? 'text-5xl' : 'text-4xl'
                    }`}
                  >
                    {levelProgress.currentLevel}
                  </div>
                </div>
              </div>
            </div>

            {/* Points */}
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">
                {gradeLevel <= 5 ? '⭐ Points' : 'Total Points'}
              </div>
              <div
                className={`${
                  gradeLevel <= 2 ? 'text-5xl' : 'text-4xl'
                } font-bold text-yellow-600 mb-2`}
              >
                {levelProgress.currentPoints.toLocaleString()}
              </div>

              {/* Progress to Next Level */}
              {levelProgress.currentLevel < 20 && (
                <div className="w-48">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${levelProgress.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {levelProgress.pointsInLevel} / {levelProgress.pointsNeeded} to Level{' '}
                    {levelProgress.currentLevel + 1}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Motivational Message */}
        {motivationalMsg && (
          <div
            className={`mt-4 text-center ${
              gradeLevel <= 2
                ? 'text-2xl'
                : gradeLevel <= 5
                ? 'text-xl'
                : 'text-lg'
            } font-semibold text-purple-600`}
          >
            {motivationalMsg}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Dashboard Navigation
 */
function DashboardNav({ view, onViewChange, gradeLevel }) {
  const gradeTheme = getGradeTheme(gradeLevel);

  const tabs = [
    { id: 'overview', name: 'Overview', emoji: '📊' },
    { id: 'achievements', name: 'Achievements', emoji: '🏆' },
    { id: 'stats', name: 'Stats', emoji: '📈' },
    { id: 'rewards', name: 'Rewards', emoji: '🎁' },
  ];

  return (
    <div className="max-w-7xl mx-auto mt-6">
      <div className="flex flex-wrap gap-3 justify-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={`${
              view === tab.id
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-110'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } px-6 py-3 rounded-2xl font-bold shadow-lg transition-all transform hover:scale-105 ${
              gradeLevel <= 5 ? 'text-lg' : 'text-base'
            }`}
          >
            {gradeTheme.emojis && gradeLevel <= 8 && (
              <span className="mr-2">{tab.emoji}</span>
            )}
            {tab.name}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Overview View - Main dashboard
 */
function OverviewView({ student, achievementTracker, onSubjectSelect }) {
  const subjects = ['Math', 'Reading', 'Science', 'English', 'Coding'];
  const recentAchievements = achievementTracker.getRecentAchievements(3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Subjects */}
      <div className="lg:col-span-2 space-y-6">
        <SectionHeader
          title={student.gradeLevel <= 5 ? 'Your Subjects' : 'Subjects'}
          emoji="📚"
          gradeLevel={student.gradeLevel}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject}
              subject={subject}
              student={student}
              onClick={() => onSubjectSelect(subject)}
            />
          ))}
        </div>
      </div>

      {/* Right Column: Quick Stats & Recent Achievements */}
      <div className="space-y-6">
        {/* Quick Stats */}
        <SectionHeader
          title={student.gradeLevel <= 5 ? 'Your Stats' : 'Quick Stats'}
          emoji="📊"
          gradeLevel={student.gradeLevel}
        />
        <QuickStatsCard
          stats={achievementTracker.stats}
          gradeLevel={student.gradeLevel}
        />

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <>
            <SectionHeader
              title="Recent Achievements"
              emoji="🏆"
              gradeLevel={student.gradeLevel}
            />
            <div className="space-y-3">
              {recentAchievements.map((achievement, i) => (
                <AchievementCard
                  key={i}
                  achievement={achievement}
                  gradeLevel={student.gradeLevel}
                  compact
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Subject Card
 */
function SubjectCard({ subject, student, onClick }) {
  const classroom = getSubjectClassroom(subject.toLowerCase());
  const styles = getClassroomStyles(student.gradeLevel, subject.toLowerCase());

  // Mock progress data - in production, load from student's actual progress
  const progress = {
    percentComplete: Math.floor(Math.random() * 100),
    topicsCompleted: Math.floor(Math.random() * 20),
    pointsEarned: Math.floor(Math.random() * 500),
  };

  return (
    <button
      onClick={onClick}
      className={`${styles.card} ${styles.spacing} hover:shadow-2xl transition-all transform hover:scale-105 text-left group relative overflow-hidden`}
    >
      {/* Background Gradient */}
      <div
        className={`absolute inset-0 ${classroom.color} opacity-10 group-hover:opacity-20 transition-opacity`}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Icon & Name */}
        <div className="flex items-center justify-between mb-4">
          <div className={`${classroom.color} ${styles.card} p-4 group-hover:scale-110 transition-transform`}>
            <span className="text-5xl">{classroom.icon}</span>
          </div>
          {progress.percentComplete > 0 && (
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              {progress.percentComplete}%
            </div>
          )}
        </div>

        {/* Subject Name */}
        <h3 className={`${styles.text.heading} font-bold text-gray-800 mb-3`}>
          {classroom.name}
        </h3>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`${classroom.color} h-3 rounded-full transition-all duration-500`}
              style={{ width: `${progress.percentComplete}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {progress.topicsCompleted} topics
          </span>
          {progress.pointsEarned > 0 && (
            <span className="text-yellow-600 font-semibold">
              {progress.pointsEarned} pts
            </span>
          )}
        </div>

        {/* Enter Button */}
        <div
          className={`mt-4 ${classroom.color} bg-opacity-10 border-2 border-current rounded-lg p-3 text-center font-semibold group-hover:bg-opacity-20 transition-all`}
        >
          Continue Learning →
        </div>
      </div>
    </button>
  );
}

/**
 * Quick Stats Card
 */
function QuickStatsCard({ stats, gradeLevel }) {
  const gradeTheme = getGradeTheme(gradeLevel);

  const quickStats = [
    {
      label: gradeLevel <= 5 ? '✅ Total Correct' : 'Correct Answers',
      value: stats.correctAnswers || 0,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: gradeLevel <= 5 ? '🔥 Best Streak' : 'Best Streak',
      value: stats.bestStreak || 0,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: gradeLevel <= 5 ? '📅 Day Streak' : 'Daily Streak',
      value: stats.dailyStreak || 0,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: gradeLevel <= 5 ? '🎯 Topics Done' : 'Topics Mastered',
      value: stats.topicsMastered?.size || 0,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      {quickStats.map((stat, i) => (
        <div key={i} className={`${stat.bg} rounded-xl p-4 border-2 border-gray-200`}>
          <div className="flex items-center justify-between">
            <span
              className={`${
                gradeLevel <= 5 ? 'text-base' : 'text-sm'
              } text-gray-600`}
            >
              {stat.label}
            </span>
            <span
              className={`${
                gradeLevel <= 2 ? 'text-3xl' : 'text-2xl'
              } font-bold ${stat.color}`}
            >
              {stat.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Achievements View
 */
function AchievementsView({ student, achievementTracker }) {
  const categories = achievementTracker.getCategoryProgress();

  return (
    <div className="space-y-8">
      {Object.entries(categories).map(([category, achievements]) => (
        <div key={category}>
          <SectionHeader
            title={category.charAt(0).toUpperCase() + category.slice(1)}
            gradeLevel={student.gradeLevel}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {achievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                gradeLevel={student.gradeLevel}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Achievement Card
 */
function AchievementCard({ achievement, gradeLevel, compact = false }) {
  const tier = ACHIEVEMENT_TIERS[achievement.tier];
  const unlocked = achievement.unlocked;

  return (
    <div
      className={`${
        unlocked
          ? `bg-gradient-to-br ${tier.color} text-white animate-glow`
          : 'bg-gray-100 text-gray-400'
      } ${compact ? 'p-4' : 'p-6'} rounded-2xl shadow-lg transition-all transform hover:scale-105`}
    >
      <div className="flex items-start gap-4">
        <div className={compact ? 'text-4xl' : 'text-6xl'}>
          {unlocked ? achievement.emoji : '🔒'}
        </div>
        <div className="flex-1">
          <h4 className={`${compact ? 'text-lg' : 'text-xl'} font-bold mb-1`}>
            {achievement.name}
          </h4>
          <p
            className={`${compact ? 'text-sm' : 'text-base'} ${
              unlocked ? 'text-white opacity-90' : 'text-gray-500'
            }`}
          >
            {achievement.description}
          </p>
          {!compact && (
            <div className="mt-3 flex items-center justify-between">
              <span
                className={`text-sm font-semibold ${
                  unlocked ? 'text-white' : 'text-gray-500'
                }`}
              >
                {achievement.tier.toUpperCase()}
              </span>
              <span
                className={`text-sm font-bold ${
                  unlocked ? 'text-yellow-200' : 'text-gray-400'
                }`}
              >
                +{achievement.points} pts
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Stats View
 */
function StatsView({ student, achievementTracker }) {
  const stats = achievementTracker.stats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="Total Questions"
        value={stats.totalAnswers || 0}
        icon="📝"
        color="from-blue-400 to-blue-600"
        gradeLevel={student.gradeLevel}
      />
      <StatCard
        title="Correct Answers"
        value={stats.correctAnswers || 0}
        icon="✅"
        color="from-green-400 to-green-600"
        gradeLevel={student.gradeLevel}
      />
      <StatCard
        title="Accuracy"
        value={`${Math.round(
          (stats.correctAnswers / (stats.totalAnswers || 1)) * 100
        )}%`}
        icon="🎯"
        color="from-yellow-400 to-orange-600"
        gradeLevel={student.gradeLevel}
      />
      <StatCard
        title="Current Streak"
        value={stats.currentStreak || 0}
        icon="🔥"
        color="from-orange-400 to-red-600"
        gradeLevel={student.gradeLevel}
      />
      <StatCard
        title="Best Streak"
        value={stats.bestStreak || 0}
        icon="⚡"
        color="from-purple-400 to-pink-600"
        gradeLevel={student.gradeLevel}
      />
      <StatCard
        title="Topics Mastered"
        value={stats.topicsMastered?.size || 0}
        icon="🎓"
        color="from-indigo-400 to-purple-600"
        gradeLevel={student.gradeLevel}
      />
    </div>
  );
}

/**
 * Stat Card Component
 */
function StatCard({ title, value, icon, color, gradeLevel }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-2xl shadow-lg p-6 text-white`}>
      <div className="flex items-start justify-between mb-4">
        <div className={gradeLevel <= 5 ? 'text-5xl' : 'text-4xl'}>{icon}</div>
      </div>
      <div className={`${gradeLevel <= 2 ? 'text-5xl' : 'text-4xl'} font-bold mb-2`}>
        {value}
      </div>
      <div className={`${gradeLevel <= 5 ? 'text-lg' : 'text-base'} opacity-90`}>
        {title}
      </div>
    </div>
  );
}

/**
 * Rewards View
 */
function RewardsView({ student, achievementTracker }) {
  const rewards = achievementTracker.getUnlockedRewards();

  return (
    <div className="space-y-8">
      {/* Avatars */}
      <div>
        <SectionHeader title="Avatars" emoji="🎭" gradeLevel={student.gradeLevel} />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
          {rewards.avatars.map((avatar) => (
            <RewardCard
              key={avatar.id}
              reward={avatar}
              gradeLevel={student.gradeLevel}
            />
          ))}
        </div>
      </div>

      {/* Themes */}
      <div>
        <SectionHeader title="Classroom Themes" emoji="🎨" gradeLevel={student.gradeLevel} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {rewards.themes.map((theme) => (
            <RewardCard
              key={theme.id}
              reward={theme}
              gradeLevel={student.gradeLevel}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Reward Card
 */
function RewardCard({ reward, gradeLevel }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition-all transform hover:scale-105">
      <div className={gradeLevel <= 5 ? 'text-6xl mb-3' : 'text-5xl mb-2'}>
        {reward.emoji || '🎁'}
      </div>
      <div className={`${gradeLevel <= 5 ? 'text-lg' : 'text-base'} font-bold text-gray-800`}>
        {reward.name}
      </div>
      {reward.level !== undefined && (
        <div className="text-sm text-gray-500 mt-1">Level {reward.level}</div>
      )}
    </div>
  );
}

/**
 * Section Header
 */
function SectionHeader({ title, emoji, gradeLevel }) {
  const gradeTheme = getGradeTheme(gradeLevel);

  return (
    <h2
      className={`${
        gradeLevel <= 2 ? 'text-4xl' : gradeLevel <= 5 ? 'text-3xl' : 'text-2xl'
      } font-bold text-gray-800`}
    >
      {emoji && gradeTheme.emojis && <span className="mr-3">{emoji}</span>}
      {title}
    </h2>
  );
}

/**
 * Loading Dashboard
 */
function LoadingDashboard({ gradeLevel }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl mb-6 animate-bounce">
          {gradeLevel <= 5 ? '🌟' : '📊'}
        </div>
        <div
          className={`${
            gradeLevel <= 5 ? 'text-3xl' : 'text-2xl'
          } font-bold text-gray-700`}
        >
          {gradeLevel <= 5 ? 'Loading your dashboard...' : 'Loading dashboard...'}
        </div>
      </div>
    </div>
  );
}
