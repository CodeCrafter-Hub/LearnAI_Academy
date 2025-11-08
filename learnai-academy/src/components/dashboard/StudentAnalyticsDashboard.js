/**
 * Student Analytics Dashboard
 * Personal analytics and insights for students
 */

'use client';

import React, { useState, useEffect } from 'react';
import { getSubjectColor, getGradeTheme } from '@/lib/classroomThemes';

/**
 * Main Student Analytics Dashboard
 */
export default function StudentAnalyticsDashboard({ student, learningHub }) {
  const [view, setView] = useState('overview'); // overview, subjects, skills, progress, goals
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [timeRange, setTimeRange] = useState('week');

  const gradeTheme = getGradeTheme(student.gradeLevel);

  useEffect(() => {
    loadDashboardData();
  }, [student.id, timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (learningHub) {
        const data = await learningHub.getStudentDashboard(student.id, student.gradeLevel);
        setDashboardData(data);
      } else {
        // Use mock data
        setDashboardData(generateMockData(student));
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className={gradeTheme.textSize.large}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ backgroundColor: gradeTheme.colors.background }}>
      {/* Header */}
      <DashboardHeader student={student} data={dashboardData} gradeTheme={gradeTheme} />

      {/* Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['overview', 'subjects', 'skills', 'progress', 'goals'].map((tab) => (
          <button
            key={tab}
            onClick={() => setView(tab)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              view === tab
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
            } ${gradeTheme.textSize.base}`}
          >
            {getViewIcon(tab)} {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {view === 'overview' && <OverviewView data={dashboardData} student={student} gradeTheme={gradeTheme} />}
        {view === 'subjects' && <SubjectsView data={dashboardData} student={student} gradeTheme={gradeTheme} />}
        {view === 'skills' && <SkillsView data={dashboardData} student={student} gradeTheme={gradeTheme} />}
        {view === 'progress' && <ProgressView data={dashboardData} student={student} gradeTheme={gradeTheme} />}
        {view === 'goals' && <GoalsView data={dashboardData} student={student} gradeTheme={gradeTheme} />}
      </div>
    </div>
  );
}

/**
 * Dashboard Header
 */
function DashboardHeader({ student, data, gradeTheme }) {
  return (
    <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl p-6 mb-6 text-white">
      <div className="flex justify-between items-start">
        <div>
          <h1 className={`font-bold mb-2 ${gradeTheme.textSize.title}`}>
            {gradeTheme.encouragement.greeting}, {student.name || 'Student'}! 🌟
          </h1>
          <p className={gradeTheme.textSize.large}>
            Let's see how awesome you're doing!
          </p>
        </div>
        <div className="text-right">
          <div className="text-5xl mb-2">{data.streak.currentStreak}</div>
          <div className={gradeTheme.textSize.base}>🔥 Day Streak</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <QuickStat
          icon="⭐"
          value={data.achievements.totalEarned || 0}
          label="Achievements"
          gradeTheme={gradeTheme}
        />
        <QuickStat
          icon="📚"
          value={calculateTotalTopics(data.subjectProgress)}
          label="Topics Mastered"
          gradeTheme={gradeTheme}
        />
        <QuickStat
          icon="🎯"
          value={`${Math.round(calculateOverallAccuracy(data))}%`}
          label="Accuracy"
          gradeTheme={gradeTheme}
        />
        <QuickStat
          icon="⚡"
          value={data.reviewsDue || 0}
          label="Reviews Due"
          gradeTheme={gradeTheme}
        />
      </div>
    </div>
  );
}

function QuickStat({ icon, value, label, gradeTheme }) {
  return (
    <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 text-center">
      <div className="text-3xl mb-1">{icon}</div>
      <div className={`font-bold ${gradeTheme.textSize.xl}`}>{value}</div>
      <div className={`${gradeTheme.textSize.small} opacity-90`}>{label}</div>
    </div>
  );
}

/**
 * Overview View
 */
function OverviewView({ data, student, gradeTheme }) {
  return (
    <div className="space-y-6">
      {/* Today's Habits */}
      {data.habits && data.habits.summary.total > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className={`font-bold mb-4 ${gradeTheme.textSize.xl}`}>
            📋 Today's Goals
          </h2>
          <div className="space-y-3">
            {data.habits.habits.map((habit) => (
              <HabitProgressBar key={habit.habitId} habit={habit} gradeTheme={gradeTheme} />
            ))}
          </div>
          <div className="mt-4 text-center">
            <span className={`font-semibold ${gradeTheme.textSize.base}`}>
              {data.habits.summary.completed} of {data.habits.summary.total} completed!
              {data.habits.summary.completed === data.habits.summary.total && ' 🎉'}
            </span>
          </div>
        </div>
      )}

      {/* Subject Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className={`font-bold mb-4 ${gradeTheme.textSize.xl}`}>
          📚 Subject Progress
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.subjectProgress.map((subject) => (
            <SubjectProgressCard
              key={subject.subject}
              subject={subject}
              gradeTheme={gradeTheme}
            />
          ))}
        </div>
      </div>

      {/* Recent Achievements */}
      {data.achievements && data.achievements.recent && data.achievements.recent.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className={`font-bold mb-4 ${gradeTheme.textSize.xl}`}>
            🏆 Recent Achievements
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.achievements.recent.slice(0, 4).map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                gradeTheme={gradeTheme}
              />
            ))}
          </div>
        </div>
      )}

      {/* What to Do Next */}
      <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl shadow-lg p-6 text-white">
        <h2 className={`font-bold mb-4 ${gradeTheme.textSize.xl}`}>
          🚀 What Should I Do Next?
        </h2>
        <div className="space-y-3">
          {getNextActionRecommendations(data).map((action, index) => (
            <ActionCard key={index} action={action} gradeTheme={gradeTheme} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Subjects View
 */
function SubjectsView({ data, student, gradeTheme }) {
  return (
    <div className="space-y-6">
      {data.subjectProgress.map((subject) => (
        <div key={subject.subject} className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-bold ${gradeTheme.textSize.xl}`} style={{ color: getSubjectColor(subject.subject) }}>
              {getSubjectIcon(subject.subject)} {subject.subject.charAt(0).toUpperCase() + subject.subject.slice(1)}
            </h2>
            <div className={`font-bold ${gradeTheme.textSize.xl}`} style={{ color: getSubjectColor(subject.subject) }}>
              {Math.round(subject.progress)}%
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="h-4 rounded-full transition-all duration-500"
                style={{
                  width: `${subject.progress}%`,
                  backgroundColor: getSubjectColor(subject.subject),
                }}
              ></div>
            </div>
          </div>

          {/* Current Topic */}
          {subject.currentTopic && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className={`font-semibold mb-1 ${gradeTheme.textSize.base}`}>
                📖 Currently Learning:
              </div>
              <div className={gradeTheme.textSize.large}>{subject.currentTopic.topic.name}</div>
            </div>
          )}

          {/* Next Topic */}
          {subject.nextTopic && (
            <div className="p-4 bg-green-50 rounded-lg">
              <div className={`font-semibold mb-1 ${gradeTheme.textSize.base}`}>
                ⭐ Up Next:
              </div>
              <div className={gradeTheme.textSize.large}>{subject.nextTopic.topic.name}</div>
              <div className={`text-gray-600 mt-1 ${gradeTheme.textSize.small}`}>
                Readiness: {Math.round(subject.nextTopic.readiness)}%
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Skills View
 */
function SkillsView({ data, student, gradeTheme }) {
  const strengths = data.mistakeAnalysis?.patterns
    ? data.subjectProgress.filter((s) => s.progress > 80)
    : [];

  const areasToImprove = data.mistakeAnalysis?.patterns || [];

  return (
    <div className="space-y-6">
      {/* Strengths */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className={`font-bold mb-4 ${gradeTheme.textSize.xl} text-green-600`}>
          💪 Your Strengths
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strengths.length > 0 ? (
            strengths.map((strength) => (
              <StrengthCard key={strength.subject} strength={strength} gradeTheme={gradeTheme} />
            ))
          ) : (
            <p className={gradeTheme.textSize.base}>Keep practicing to discover your strengths!</p>
          )}
        </div>
      </div>

      {/* Areas to Improve */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className={`font-bold mb-4 ${gradeTheme.textSize.xl} text-orange-600`}>
          🎯 Let's Get Better At
        </h2>
        <div className="space-y-4">
          {areasToImprove.length > 0 ? (
            areasToImprove.slice(0, 5).map((pattern, index) => (
              <ImprovementCard key={index} pattern={pattern} gradeTheme={gradeTheme} />
            ))
          ) : (
            <p className={gradeTheme.textSize.base}>Great job! No major areas for improvement detected.</p>
          )}
        </div>
      </div>

      {/* Skill Badges */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className={`font-bold mb-4 ${gradeTheme.textSize.xl}`}>
          🎖️ Skill Badges
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {generateSkillBadges(data).map((badge, index) => (
            <SkillBadge key={index} badge={badge} gradeTheme={gradeTheme} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Progress View
 */
function ProgressView({ data, student, gradeTheme }) {
  return (
    <div className="space-y-6">
      {/* Learning Journey Timeline */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className={`font-bold mb-4 ${gradeTheme.textSize.xl}`}>
          🗺️ Your Learning Journey
        </h2>
        <LearningTimeline data={data} gradeTheme={gradeTheme} />
      </div>

      {/* Spaced Repetition Progress */}
      {data.reviewStats && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className={`font-bold mb-4 ${gradeTheme.textSize.xl}`}>
            ♻️ Review Progress
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ReviewStat label="Total Cards" value={data.reviewStats.total} icon="📇" gradeTheme={gradeTheme} />
            <ReviewStat label="Mastered" value={data.reviewStats.mastered} icon="⭐" gradeTheme={gradeTheme} />
            <ReviewStat label="Learning" value={data.reviewStats.learning} icon="📚" gradeTheme={gradeTheme} />
            <ReviewStat label="Due Today" value={data.reviewStats.dueToday} icon="⏰" gradeTheme={gradeTheme} />
          </div>
          <div className="mt-4">
            <div className={`font-semibold mb-2 ${gradeTheme.textSize.base}`}>
              Success Rate: {Math.round(data.reviewStats.successRate)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600"
                style={{ width: `${data.reviewStats.successRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Heatmap */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className={`font-bold mb-4 ${gradeTheme.textSize.xl}`}>
          📅 Activity Calendar
        </h2>
        <ActivityHeatmap data={data} gradeTheme={gradeTheme} />
      </div>
    </div>
  );
}

/**
 * Goals View
 */
function GoalsView({ data, student, gradeTheme }) {
  const [showCreateGoal, setShowCreateGoal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Active Goals */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`font-bold ${gradeTheme.textSize.xl}`}>
            🎯 My Goals
          </h2>
          <button
            onClick={() => setShowCreateGoal(!showCreateGoal)}
            className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 ${gradeTheme.textSize.base}`}
          >
            + New Goal
          </button>
        </div>

        <div className="space-y-4">
          {generateGoals(data).map((goal) => (
            <GoalCard key={goal.id} goal={goal} gradeTheme={gradeTheme} />
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className={`font-bold mb-4 ${gradeTheme.textSize.xl}`}>
          🏁 Milestones
        </h2>
        <div className="space-y-3">
          {data.streak.milestones.map((milestone) => (
            <MilestoneCard key={milestone.days} milestone={milestone} gradeTheme={gradeTheme} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ========== UI Components ========== */

function HabitProgressBar({ habit, gradeTheme }) {
  const percentage = habit.progressPercentage;
  const completed = habit.completed;

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className={gradeTheme.textSize.base}>
          {habit.icon} {habit.name}
        </span>
        <span className={`font-semibold ${gradeTheme.textSize.base}`}>
          {habit.progress}/{habit.target} {habit.unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all ${
            completed ? 'bg-green-500' : 'bg-blue-500'
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

function SubjectProgressCard({ subject, gradeTheme }) {
  const color = getSubjectColor(subject.subject);

  return (
    <div
      className="p-4 rounded-lg border-2 hover:shadow-lg transition-shadow cursor-pointer"
      style={{ borderColor: color }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`font-semibold ${gradeTheme.textSize.base}`} style={{ color }}>
          {getSubjectIcon(subject.subject)} {subject.subject}
        </span>
        <span className={`font-bold ${gradeTheme.textSize.large}`} style={{ color }}>
          {Math.round(subject.progress)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="h-2 rounded-full"
          style={{ width: `${subject.progress}%`, backgroundColor: color }}
        ></div>
      </div>
    </div>
  );
}

function AchievementCard({ achievement, gradeTheme }) {
  return (
    <div className="text-center p-4 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg hover:scale-105 transition-transform">
      <div className="text-4xl mb-2">{achievement.icon}</div>
      <div className={`font-semibold ${gradeTheme.textSize.small}`}>{achievement.name}</div>
    </div>
  );
}

function ActionCard({ action, gradeTheme }) {
  return (
    <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 hover:bg-opacity-30 transition-all cursor-pointer">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{action.icon}</span>
        <div>
          <div className={`font-semibold ${gradeTheme.textSize.base}`}>{action.title}</div>
          <div className={`opacity-90 ${gradeTheme.textSize.small}`}>{action.description}</div>
        </div>
      </div>
    </div>
  );
}

function StrengthCard({ strength, gradeTheme }) {
  return (
    <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{getSubjectIcon(strength.subject)}</span>
        <span className={`font-semibold ${gradeTheme.textSize.base}`}>
          {strength.subject.charAt(0).toUpperCase() + strength.subject.slice(1)}
        </span>
      </div>
      <div className={`text-gray-700 ${gradeTheme.textSize.small}`}>
        {Math.round(strength.progress)}% Complete - Excellent work!
      </div>
    </div>
  );
}

function ImprovementCard({ pattern, gradeTheme }) {
  return (
    <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
      <div className={`font-semibold mb-1 ${gradeTheme.textSize.base}`}>
        {pattern.misconception}
      </div>
      <div className={`text-gray-700 mb-2 ${gradeTheme.textSize.small}`}>
        {pattern.description}
      </div>
      <div className={`text-orange-600 font-medium ${gradeTheme.textSize.small}`}>
        {pattern.occurrences} mistakes - Let's practice this!
      </div>
    </div>
  );
}

function SkillBadge({ badge, gradeTheme }) {
  return (
    <div
      className={`text-center p-3 rounded-lg ${
        badge.earned ? 'bg-gradient-to-br from-yellow-200 to-yellow-400' : 'bg-gray-200 opacity-50'
      }`}
    >
      <div className="text-3xl mb-1">{badge.icon}</div>
      <div className={`${gradeTheme.textSize.tiny} font-medium`}>{badge.name}</div>
    </div>
  );
}

function LearningTimeline({ data, gradeTheme }) {
  const events = generateTimelineEvents(data);

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
              event.type === 'achievement' ? 'bg-yellow-400' :
              event.type === 'milestone' ? 'bg-purple-400' :
              'bg-blue-400'
            }`}>
              {event.icon}
            </div>
            {index < events.length - 1 && <div className="w-1 h-12 bg-gray-300"></div>}
          </div>
          <div className="flex-1 pb-4">
            <div className={`font-semibold ${gradeTheme.textSize.base}`}>{event.title}</div>
            <div className={`text-gray-600 ${gradeTheme.textSize.small}`}>{event.description}</div>
            <div className={`text-gray-400 ${gradeTheme.textSize.tiny}`}>{event.date}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewStat({ label, value, icon, gradeTheme }) {
  return (
    <div className="text-center p-4 bg-gray-50 rounded-lg">
      <div className="text-3xl mb-2">{icon}</div>
      <div className={`font-bold ${gradeTheme.textSize.xl}`}>{value}</div>
      <div className={`text-gray-600 ${gradeTheme.textSize.small}`}>{label}</div>
    </div>
  );
}

function ActivityHeatmap({ data, gradeTheme }) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendar = generateCalendarData(30);

  return (
    <div>
      <div className="grid grid-cols-7 gap-2 mb-2">
        {days.map((day) => (
          <div key={day} className={`text-center ${gradeTheme.textSize.tiny} text-gray-600`}>
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {calendar.map((day, index) => (
          <div
            key={index}
            className={`aspect-square rounded ${
              day.active
                ? day.intensity > 2
                  ? 'bg-green-600'
                  : day.intensity > 1
                  ? 'bg-green-400'
                  : 'bg-green-200'
                : 'bg-gray-100'
            } hover:scale-110 transition-transform cursor-pointer`}
            title={`${day.date}: ${day.sessions} sessions`}
          ></div>
        ))}
      </div>
    </div>
  );
}

function GoalCard({ goal, gradeTheme }) {
  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className={`font-semibold ${gradeTheme.textSize.base}`}>{goal.title}</div>
          <div className={`text-gray-600 ${gradeTheme.textSize.small}`}>{goal.description}</div>
        </div>
        <span className="text-3xl">{goal.icon}</span>
      </div>
      <div className="flex justify-between text-sm mb-2">
        <span>Progress</span>
        <span className="font-semibold">{goal.progress}%</span>
      </div>
      <div className="w-full bg-white rounded-full h-3">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
          style={{ width: `${goal.progress}%` }}
        ></div>
      </div>
      <div className={`text-gray-500 mt-2 ${gradeTheme.textSize.tiny}`}>
        Target: {goal.target}
      </div>
    </div>
  );
}

function MilestoneCard({ milestone, gradeTheme }) {
  return (
    <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg">
      <div className="text-4xl">{milestone.icon}</div>
      <div>
        <div className={`font-semibold ${gradeTheme.textSize.base}`}>{milestone.name}</div>
        <div className={`text-gray-600 ${gradeTheme.textSize.small}`}>
          Achieved on {new Date(milestone.achievedDate).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

/* ========== Helper Functions ========== */

function getViewIcon(view) {
  const icons = {
    overview: '🏠',
    subjects: '📚',
    skills: '💪',
    progress: '📈',
    goals: '🎯',
  };
  return icons[view] || '';
}

function getSubjectIcon(subject) {
  const icons = {
    math: '🔢',
    reading: '📖',
    science: '🔬',
    writing: '✍️',
    coding: '💻',
  };
  return icons[subject] || '📚';
}

function calculateTotalTopics(subjectProgress) {
  return subjectProgress.reduce((sum, s) => {
    const completed = Math.round(s.progress / 100 * 10); // Estimate
    return sum + completed;
  }, 0);
}

function calculateOverallAccuracy(data) {
  if (data.overallPerformance && data.overallPerformance.overallAccuracy) {
    return data.overallPerformance.overallAccuracy;
  }
  return 85; // Default
}

function getNextActionRecommendations(data) {
  const actions = [];

  if (data.reviewsDue > 0) {
    actions.push({
      icon: '♻️',
      title: 'Review Time!',
      description: `${data.reviewsDue} items ready to review`,
    });
  }

  if (data.habits.summary.remaining > 0) {
    actions.push({
      icon: '✅',
      title: 'Complete Daily Goals',
      description: `${data.habits.summary.remaining} habits left today`,
    });
  }

  actions.push({
    icon: '🚀',
    title: 'Continue Learning',
    description: 'Practice new topics and level up!',
  });

  return actions;
}

function generateSkillBadges(data) {
  return [
    { icon: '🔢', name: 'Math', earned: true },
    { icon: '📖', name: 'Reading', earned: true },
    { icon: '🔬', name: 'Science', earned: false },
    { icon: '✍️', name: 'Writing', earned: true },
    { icon: '⚡', name: 'Speed', earned: true },
    { icon: '🎯', name: 'Accuracy', earned: false },
  ];
}

function generateTimelineEvents(data) {
  return [
    {
      type: 'achievement',
      icon: '🏆',
      title: 'Math Champion',
      description: 'Completed 10 math topics',
      date: 'Today',
    },
    {
      type: 'milestone',
      icon: '🔥',
      title: '7-Day Streak',
      description: 'Studied for 7 days in a row',
      date: 'Yesterday',
    },
    {
      type: 'progress',
      icon: '📚',
      title: 'Topic Mastered',
      description: 'Mastered Multiplication',
      date: '2 days ago',
    },
  ];
}

function generateCalendarData(days) {
  return Array(days)
    .fill(null)
    .map(() => ({
      active: Math.random() > 0.3,
      intensity: Math.floor(Math.random() * 4),
      sessions: Math.floor(Math.random() * 3),
      date: new Date().toLocaleDateString(),
    }));
}

function generateGoals(data) {
  return [
    {
      id: 1,
      title: 'Master Multiplication',
      description: 'Complete all multiplication topics',
      progress: 75,
      target: 'End of month',
      icon: '🔢',
    },
    {
      id: 2,
      title: '30-Day Streak',
      description: 'Study every day for 30 days',
      progress: Math.round((data.streak.currentStreak / 30) * 100),
      target: '30 days',
      icon: '🔥',
    },
  ];
}

function generateMockData(student) {
  return {
    studentId: student.id,
    gradeLevel: student.gradeLevel,
    streak: { currentStreak: 7, longestStreak: 15, milestones: [] },
    habits: {
      habits: [],
      summary: { total: 3, completed: 2, remaining: 1 },
    },
    achievements: { totalEarned: 12, recent: [] },
    subjectProgress: [
      { subject: 'math', progress: 75, currentTopic: null, nextTopic: null },
      { subject: 'reading', progress: 60, currentTopic: null, nextTopic: null },
      { subject: 'science', progress: 45, currentTopic: null, nextTopic: null },
    ],
    reviewsDue: 5,
    reviewStats: {
      total: 50,
      mastered: 20,
      learning: 25,
      dueToday: 5,
      successRate: 85,
    },
    mistakeAnalysis: { patterns: [] },
    overallPerformance: { overallAccuracy: 87 },
  };
}
