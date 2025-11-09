/**
 * Parent and Teacher Dashboard
 * Comprehensive monitoring and analytics for student progress
 */

'use client';

import React, { useState, useEffect } from 'react';
import { getSubjectColor, getGradeTheme } from '@/lib/classroomThemes';

/**
 * Main Parent/Teacher Dashboard Component
 */
export default function ParentTeacherDashboard({ userRole, studentIds = [] }) {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [timeRange, setTimeRange] = useState('week'); // week, month, year, all
  const [view, setView] = useState('overview'); // overview, progress, performance, activity, insights
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  }, [selectedStudent, timeRange]);

  const loadStudentData = async () => {
    setLoading(true);
    // In production, fetch from API
    // For now, simulate data loading
    setTimeout(() => {
      setStudentData(generateMockData());
      setLoading(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <DashboardHeader
        userRole={userRole}
        selectedStudent={selectedStudent}
        onStudentChange={setSelectedStudent}
        studentIds={studentIds}
      />

      {/* Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['overview', 'progress', 'performance', 'activity', 'insights'].map((tab) => (
          <button
            key={tab}
            onClick={() => setView(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === tab
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white border border-gray-300"
        >
          <option value="all">All Subjects</option>
          <option value="math">Math</option>
          <option value="reading">Reading</option>
          <option value="science">Science</option>
          <option value="writing">Writing</option>
          <option value="coding">Coding</option>
        </select>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white border border-gray-300"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
        </select>

        <button
          onClick={() => exportReport(studentData)}
          className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
        >
          Export Report
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {view === 'overview' && <OverviewView data={studentData} />}
        {view === 'progress' && <ProgressView data={studentData} subject={selectedSubject} />}
        {view === 'performance' && <PerformanceView data={studentData} subject={selectedSubject} />}
        {view === 'activity' && <ActivityView data={studentData} timeRange={timeRange} />}
        {view === 'insights' && <InsightsView data={studentData} />}
      </div>
    </div>
  );
}

/**
 * Dashboard Header
 */
function DashboardHeader({ userRole, selectedStudent, onStudentChange, studentIds }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {userRole === 'parent' ? 'Parent' : 'Teacher'} Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor progress, view analytics, and support learning
          </p>
        </div>

        {studentIds.length > 1 && (
          <select
            value={selectedStudent || ''}
            onChange={(e) => onStudentChange(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-100 border border-gray-300"
          >
            <option value="">Select Student</option>
            {studentIds.map((id) => (
              <option key={id} value={id}>
                {id} {/* In production, fetch student name */}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

/**
 * Overview View
 */
function OverviewView({ data }) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Study Time"
          value={`${data.totalStudyHours}h`}
          subtitle="This week"
          icon="⏱️"
          trend={data.studyTimeTrend}
        />
        <MetricCard
          title="Overall Accuracy"
          value={`${data.overallAccuracy}%`}
          subtitle="Across all subjects"
          icon="🎯"
          trend={data.accuracyTrend}
        />
        <MetricCard
          title="Topics Mastered"
          value={data.topicsMastered}
          subtitle={`of ${data.totalTopics}`}
          icon="⭐"
          trend={data.masteryTrend}
        />
        <MetricCard
          title="Current Streak"
          value={`${data.currentStreak} days`}
          subtitle={`Best: ${data.bestStreak}`}
          icon="🔥"
          trend={data.streakTrend}
        />
      </div>

      {/* Subject Performance */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Subject Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.subjectPerformance.map((subject) => (
            <SubjectCard key={subject.name} subject={subject} />
          ))}
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Achievements</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.recentAchievements.slice(0, 4).map((achievement) => (
            <AchievementBadge key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </div>

      {/* Quick Alerts */}
      {data.alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Alerts & Recommendations</h2>
          <div className="space-y-3">
            {data.alerts.map((alert, index) => (
              <AlertCard key={index} alert={alert} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Progress View
 */
function ProgressView({ data, subject }) {
  const subjectData = subject === 'all'
    ? data.subjectPerformance
    : data.subjectPerformance.filter((s) => s.name.toLowerCase() === subject);

  return (
    <div className="space-y-6">
      {subjectData.map((subj) => (
        <div key={subj.name} className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold" style={{ color: getSubjectColor(subj.name.toLowerCase()) }}>
              {subj.name}
            </h2>
            <span className="text-gray-600">
              {subj.completedTopics} of {subj.totalTopics} topics completed
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round((subj.completedTopics / subj.totalTopics) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all"
                style={{
                  width: `${(subj.completedTopics / subj.totalTopics) * 100}%`,
                  backgroundColor: getSubjectColor(subj.name.toLowerCase()),
                }}
              ></div>
            </div>
          </div>

          {/* Topic List */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700 mb-3">Topic Progress</h3>
            {subj.topics.map((topic) => (
              <TopicProgressItem key={topic.id} topic={topic} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Performance View
 */
function PerformanceView({ data, subject }) {
  return (
    <div className="space-y-6">
      {/* Accuracy Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Accuracy Over Time</h2>
        <AccuracyChart data={data.accuracyHistory} subject={subject} />
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-green-600 mb-4">💪 Strengths</h2>
          <div className="space-y-3">
            {data.strengths.map((strength, index) => (
              <StrengthWeaknessCard key={index} item={strength} type="strength" />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-orange-600 mb-4">📈 Areas for Growth</h2>
          <div className="space-y-3">
            {data.weaknesses.map((weakness, index) => (
              <StrengthWeaknessCard key={index} item={weakness} type="weakness" />
            ))}
          </div>
        </div>
      </div>

      {/* Mistake Patterns */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Common Mistake Patterns</h2>
        <div className="space-y-4">
          {data.mistakePatterns.map((pattern, index) => (
            <MistakePatternCard key={index} pattern={pattern} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Activity View
 */
function ActivityView({ data, timeRange }) {
  return (
    <div className="space-y-6">
      {/* Activity Calendar */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Calendar</h2>
        <ActivityCalendar data={data.activityCalendar} />
      </div>

      {/* Session History */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Sessions</h2>
        <div className="space-y-3">
          {data.recentSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      </div>

      {/* Time Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Time Distribution</h2>
        <TimeDistributionChart data={data.timeDistribution} />
      </div>
    </div>
  );
}

/**
 * Insights View
 */
function InsightsView({ data }) {
  return (
    <div className="space-y-6">
      {/* AI-Generated Insights */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">🤖 AI Insights</h2>
        <div className="space-y-4">
          {data.aiInsights.map((insight, index) => (
            <AIInsightCard key={index} insight={insight} />
          ))}
        </div>
      </div>

      {/* Learning Recommendations */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recommended Actions</h2>
        <div className="space-y-4">
          {data.recommendations.map((rec, index) => (
            <RecommendationCard key={index} recommendation={rec} />
          ))}
        </div>
      </div>

      {/* Upcoming Reviews */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Reviews (Spaced Repetition)</h2>
        <UpcomingReviewsCalendar data={data.upcomingReviews} />
      </div>

      {/* Goal Progress */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Goal Progress</h2>
        <div className="space-y-4">
          {data.goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ========== UI Components ========== */

function MetricCard({ title, value, subtitle, icon, trend }) {
  const trendColor = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600';
  const trendIcon = trend > 0 ? '↑' : trend < 0 ? '↓' : '→';

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start mb-2">
        <p className="text-sm text-gray-600">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-sm text-gray-600">{subtitle}</span>
        <span className={`text-sm ${trendColor}`}>
          {trendIcon} {Math.abs(trend)}%
        </span>
      </div>
    </div>
  );
}

function SubjectCard({ subject }) {
  const color = getSubjectColor(subject.name.toLowerCase());

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold" style={{ color }}>{subject.name}</h3>
        <span className="text-2xl">{subject.icon}</span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Accuracy</span>
          <span className="font-medium">{subject.accuracy}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full"
            style={{ width: `${subject.accuracy}%`, backgroundColor: color }}
          ></div>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">
            {subject.completedTopics}/{subject.totalTopics}
          </span>
        </div>
      </div>
    </div>
  );
}

function AchievementBadge({ achievement }) {
  return (
    <div className="text-center p-4 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg">
      <div className="text-4xl mb-2">{achievement.icon}</div>
      <p className="font-semibold text-sm">{achievement.name}</p>
      <p className="text-xs text-gray-600 mt-1">{achievement.dateEarned}</p>
    </div>
  );
}

function AlertCard({ alert }) {
  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[alert.type]}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{alert.icon}</span>
        <div>
          <p className="font-semibold">{alert.title}</p>
          <p className="text-sm mt-1">{alert.message}</p>
        </div>
      </div>
    </div>
  );
}

function TopicProgressItem({ topic }) {
  const statusColors = {
    mastered: 'bg-green-100 text-green-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'not-started': 'bg-gray-100 text-gray-800',
    locked: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[topic.status]}`}>
          {topic.status}
        </span>
        <span className="text-gray-700">{topic.name}</span>
      </div>
      {topic.status !== 'not-started' && (
        <span className="text-sm text-gray-600">{topic.accuracy}% accuracy</span>
      )}
    </div>
  );
}

function AccuracyChart({ data, subject }) {
  // Simplified chart - in production, use a library like recharts
  return (
    <div className="h-64 flex items-end justify-between gap-2">
      {data.slice(-7).map((point, index) => (
        <div key={index} className="flex-1 flex flex-col items-center">
          <div className="w-full bg-gray-200 rounded-t-lg relative" style={{ height: '200px' }}>
            <div
              className="absolute bottom-0 w-full bg-blue-500 rounded-t-lg"
              style={{ height: `${point.accuracy}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-2">{point.date}</p>
        </div>
      ))}
    </div>
  );
}

function StrengthWeaknessCard({ item, type }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <span className="text-xl">{item.icon}</span>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{item.topic}</p>
        <p className="text-sm text-gray-600">{item.description}</p>
        <p className="text-xs text-gray-500 mt-1">{item.accuracy}% accuracy</p>
      </div>
    </div>
  );
}

function MistakePatternCard({ pattern }) {
  return (
    <div className="border-l-4 border-orange-500 p-4 bg-orange-50 rounded">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900">{pattern.name}</h3>
        <span className="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded">
          {pattern.occurrences} times
        </span>
      </div>
      <p className="text-sm text-gray-700 mb-2">{pattern.description}</p>
      <p className="text-xs text-gray-600">Recommended: {pattern.remediation}</p>
    </div>
  );
}

function ActivityCalendar({ data }) {
  // Simplified calendar - in production, use a proper calendar component
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => (
        <div key={day} className="text-center text-sm font-medium text-gray-600 pb-2">
          {day}
        </div>
      ))}
      {data.map((day, index) => (
        <div
          key={index}
          className={`aspect-square rounded ${
            day.active
              ? day.hours > 2
                ? 'bg-green-500'
                : day.hours > 1
                ? 'bg-green-300'
                : 'bg-green-100'
              : 'bg-gray-100'
          }`}
          title={`${day.hours} hours`}
        ></div>
      ))}
    </div>
  );
}

function SessionCard({ session }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
          style={{ backgroundColor: getSubjectColor(session.subject) + '20' }}
        >
          {session.icon}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{session.topic}</p>
          <p className="text-sm text-gray-600">
            {session.date} • {session.duration} min
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900">{session.accuracy}%</p>
        <p className="text-sm text-gray-600">{session.questionsCompleted} questions</p>
      </div>
    </div>
  );
}

function TimeDistributionChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.hours, 0);

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.subject}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700">{item.subject}</span>
            <span className="text-gray-600">{item.hours}h ({Math.round((item.hours / total) * 100)}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${(item.hours / total) * 100}%`,
                backgroundColor: getSubjectColor(item.subject.toLowerCase()),
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AIInsightCard({ insight }) {
  return (
    <div className="bg-white bg-opacity-20 rounded-lg p-4">
      <p className="font-medium mb-2">{insight.title}</p>
      <p className="text-sm opacity-90">{insight.description}</p>
    </div>
  );
}

function RecommendationCard({ recommendation }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <span className="text-2xl">{recommendation.icon}</span>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 mb-1">{recommendation.title}</h3>
        <p className="text-sm text-gray-700 mb-2">{recommendation.description}</p>
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded">
            {recommendation.priority} priority
          </span>
          <span className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded">
            {recommendation.estimatedTime} min
          </span>
        </div>
      </div>
    </div>
  );
}

function UpcomingReviewsCalendar({ data }) {
  return (
    <div className="space-y-2">
      {data.map((day) => (
        <div key={day.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">{day.date}</p>
            <p className="text-sm text-gray-600">{day.count} reviews scheduled</p>
          </div>
          <div className="flex gap-1">
            {day.subjects.map((subject, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded flex items-center justify-center text-xs"
                style={{ backgroundColor: getSubjectColor(subject.toLowerCase()) + '40' }}
                title={subject}
              >
                {subject[0]}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function GoalCard({ goal }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{goal.title}</h3>
          <p className="text-sm text-gray-600">{goal.description}</p>
        </div>
        <span className="text-2xl">{goal.icon}</span>
      </div>
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Progress</span>
        <span>{goal.progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="h-2 rounded-full bg-purple-500"
          style={{ width: `${goal.progress}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 mt-2">Target: {goal.targetDate}</p>
    </div>
  );
}

/* ========== Helper Functions ========== */

function exportReport(data) {
  // In production, generate and download PDF report
  console.log('Exporting report...', data);
  alert('Report export functionality would be implemented here');
}

function generateMockData() {
  // Mock data for demonstration
  return {
    totalStudyHours: 12.5,
    studyTimeTrend: 15,
    overallAccuracy: 87,
    accuracyTrend: 3,
    topicsMastered: 24,
    totalTopics: 45,
    masteryTrend: 8,
    currentStreak: 7,
    bestStreak: 15,
    streakTrend: 0,
    subjectPerformance: [
      {
        name: 'Math',
        icon: '🔢',
        accuracy: 89,
        completedTopics: 8,
        totalTopics: 12,
        topics: [
          { id: 1, name: 'Addition', status: 'mastered', accuracy: 95 },
          { id: 2, name: 'Subtraction', status: 'mastered', accuracy: 92 },
          { id: 3, name: 'Multiplication', status: 'in-progress', accuracy: 78 },
          { id: 4, name: 'Division', status: 'not-started' },
        ],
      },
      {
        name: 'Reading',
        icon: '📚',
        accuracy: 92,
        completedTopics: 10,
        totalTopics: 15,
        topics: [],
      },
      {
        name: 'Science',
        icon: '🔬',
        accuracy: 85,
        completedTopics: 6,
        totalTopics: 10,
        topics: [],
      },
    ],
    recentAchievements: [
      { id: 1, name: 'Math Master', icon: '🏆', dateEarned: 'Today' },
      { id: 2, name: '7-Day Streak', icon: '🔥', dateEarned: 'Today' },
      { id: 3, name: 'Perfect Score', icon: '💯', dateEarned: 'Yesterday' },
      { id: 4, name: 'Speed Demon', icon: '⚡', dateEarned: '2 days ago' },
    ],
    alerts: [
      {
        type: 'success',
        icon: '🎉',
        title: 'Great Progress!',
        message: 'Mastered 3 new topics this week',
      },
      {
        type: 'warning',
        icon: '⚠️',
        title: 'Needs Review',
        message: 'Fractions topic showing declining accuracy',
      },
    ],
    accuracyHistory: [
      { date: 'Mon', accuracy: 82 },
      { date: 'Tue', accuracy: 85 },
      { date: 'Wed', accuracy: 88 },
      { date: 'Thu', accuracy: 86 },
      { date: 'Fri', accuracy: 90 },
      { date: 'Sat', accuracy: 87 },
      { date: 'Sun', accuracy: 89 },
    ],
    strengths: [
      { icon: '✨', topic: 'Reading Comprehension', description: 'Excellent inference skills', accuracy: 95 },
      { icon: '🎯', topic: 'Basic Arithmetic', description: 'Strong foundation in addition/subtraction', accuracy: 93 },
    ],
    weaknesses: [
      { icon: '📊', topic: 'Fractions', description: 'Needs more practice with mixed numbers', accuracy: 68 },
      { icon: '✍️', topic: 'Grammar', description: 'Subject-verb agreement challenges', accuracy: 72 },
    ],
    mistakePatterns: [
      {
        name: 'Fraction Operations',
        occurrences: 5,
        description: 'Adding numerators and denominators separately',
        remediation: 'Visual fraction models and step-by-step practice',
      },
    ],
    activityCalendar: Array(28).fill(null).map((_, i) => ({
      active: Math.random() > 0.3,
      hours: Math.random() * 3,
    })),
    recentSessions: [
      {
        id: 1,
        subject: 'math',
        icon: '🔢',
        topic: 'Multiplication Tables',
        date: 'Today, 2:30 PM',
        duration: 25,
        accuracy: 89,
        questionsCompleted: 20,
      },
    ],
    timeDistribution: [
      { subject: 'Math', hours: 5 },
      { subject: 'Reading', hours: 4 },
      { subject: 'Science', hours: 2.5 },
      { subject: 'Writing', hours: 1 },
    ],
    aiInsights: [
      {
        title: 'Learning Style',
        description: 'This student excels with visual learning materials and interactive activities',
      },
      {
        title: 'Best Study Time',
        description: 'Peak performance occurs between 2-4 PM',
      },
    ],
    recommendations: [
      {
        icon: '📝',
        title: 'Practice Fractions',
        description: 'Focus on mixed number operations with visual aids',
        priority: 'high',
        estimatedTime: 20,
      },
    ],
    upcomingReviews: [
      { date: 'Tomorrow', count: 5, subjects: ['Math', 'Reading'] },
      { date: 'In 3 days', count: 8, subjects: ['Math', 'Science', 'Writing'] },
    ],
    goals: [
      {
        id: 1,
        title: 'Master Multiplication',
        description: 'Complete all multiplication topics',
        icon: '🎯',
        progress: 75,
        targetDate: 'End of month',
      },
    ],
  };
}
