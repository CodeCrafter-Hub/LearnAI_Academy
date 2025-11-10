'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EnterpriseHeader from '@/components/layout/EnterpriseHeader';
import ProgressChart from '@/components/progress/ProgressChart';
import { useAuth } from '@/hooks/useAuth';
import { Home, Download, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export default function ParentDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        loadData();
      }
    }
  }, [authLoading, isAuthenticated, selectedPeriod]);

  const loadData = async () => {
    try {
      const studentId = user?.students?.[0]?.id;

      if (!studentId) return;

      // Load analytics
      const analyticsRes = await fetch(
        `/api/analytics/${studentId}?period=${selectedPeriod}`,
        { credentials: 'include' }
      );
      const analyticsData = await analyticsRes.json();
      setAnalytics(analyticsData);

      // Load progress
      const progressRes = await fetch(`/api/students/${studentId}/progress`, {
        credentials: 'include',
      });
      const progressData = await progressRes.json();
      setProgress(progressData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = () => {
    // Generate CSV report
    const csv = generateCSVReport();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learning-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const generateCSVReport = () => {
    let csv = 'Date,Subject,Topic,Mode,Duration (min),Points\n';
    
    progress?.recentSessions?.forEach(session => {
      csv += `${new Date(session.startedAt).toLocaleDateString()},${session.subject},${session.topic},${session.mode},${session.durationMinutes},${session.pointsEarned}\n`;
    });
    
    return csv;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <EnterpriseHeader />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Parent Dashboard</h1>
            <p className="text-gray-600">Monitor your child's learning progress</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={exportReport}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              <Download className="w-5 h-5" />
              Export Report
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-blue-500 hover:text-blue-600 font-medium"
            >
              <Home className="w-5 h-5" />
              Dashboard
            </button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-8">
          {['7d', '30d', '90d'].map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-gray-600 text-sm mb-1">Total Sessions</div>
            <div className="text-3xl font-bold text-gray-800">
              {analytics?.summary?.totalSessions || 0}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-gray-600 text-sm mb-1">Learning Time</div>
            <div className="text-3xl font-bold text-gray-800">
              {Math.round((analytics?.summary?.totalMinutes || 0) / 60)}h
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-gray-600 text-sm mb-1">Avg Session</div>
            <div className="text-3xl font-bold text-gray-800">
              {Math.round(analytics?.summary?.averageSessionLength || 0)} min
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-gray-600 text-sm mb-1">Points Earned</div>
            <div className="text-3xl font-bold text-gray-800">
              {analytics?.summary?.totalPoints || 0}
            </div>
          </div>
        </div>

        {/* Learning Trends */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Learning Trends</h2>
          <ProgressChart data={analytics?.learningTrends || []} type="line" />
        </div>

        {/* Subject Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Subject Breakdown</h2>
          <div className="space-y-4">
            {Object.entries(analytics?.subjectBreakdown || {}).map(([subject, data]) => {
              const total = analytics?.summary?.totalSessions || 1;
              const percentage = Math.round((data.sessions / total) * 100);
              
              return (
                <div key={subject}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-800">{subject}</span>
                    <span className="text-gray-600">
                      {data.sessions} sessions ({percentage}%) • 🎯 {data.practiceCount} practice • 💡 {data.helpCount} help
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Strengths */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-800">Strengths</h2>
            </div>
            {analytics?.strengths && analytics.strengths.length > 0 ? (
              <div className="space-y-3">
                {analytics.strengths.map((item, i) => (
                  <div key={i} className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="font-medium text-gray-800">{item.topic}</div>
                    <div className="text-sm text-gray-600">{item.subject}</div>
                    <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${item.masteryLevel * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Keep learning to identify strengths!</p>
            )}
          </div>

          {/* Areas for Improvement */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-800">Areas for Improvement</h2>
            </div>
            {analytics?.areasForImprovement && analytics.areasForImprovement.length > 0 ? (
              <div className="space-y-3">
                {analytics.areasForImprovement.map((item, i) => (
                  <div key={i} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="font-medium text-gray-800">{item.topic}</div>
                    <div className="text-sm text-gray-600">{item.subject}</div>
                    <div className="text-xs text-yellow-700 mt-1">{item.reason}</div>
                    <div className="mt-2 w-full bg-yellow-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${item.masteryLevel * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No areas needing improvement yet!</p>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {analytics?.recommendations && analytics.recommendations.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-800">Recommendations</h2>
            </div>
            <div className="space-y-3">
              {analytics.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg border-2 ${
                    rec.priority === 'high'
                      ? 'bg-red-50 border-red-200'
                      : rec.priority === 'medium'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 px-2 py-1 rounded text-xs font-bold ${
                        rec.priority === 'high'
                          ? 'bg-red-200 text-red-800'
                          : rec.priority === 'medium'
                          ? 'bg-yellow-200 text-yellow-800'
                          : 'bg-blue-200 text-blue-800'
                      }`}
                    >
                      {rec.priority.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{rec.message}</div>
                      {rec.subject && rec.topic && (
                        <div className="text-sm text-gray-600 mt-1">
                          {rec.subject} - {rec.topic}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Session History */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Session History</h2>
          {progress?.recentSessions && progress.recentSessions.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {progress.recentSessions.map((session, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                  <div>
                    <div className="font-medium text-gray-800">
                      {session.subject} - {session.topic}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(session.startedAt).toLocaleString()} •{' '}
                      {session.mode === 'PRACTICE' ? '🎯 Practice' : '💡 Help'} •{' '}
                      {session.difficulty}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-800">{session.durationMinutes} min</div>
                    <div className="text-xs text-gray-500">+{session.pointsEarned} points</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No sessions recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
