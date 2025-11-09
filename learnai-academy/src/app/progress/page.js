'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import ProgressChart from '@/components/visualizations/ProgressChart';
import { TrendingUp, Target, Award, BookOpen, Calendar } from 'lucide-react';

export default function ProgressPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // week, month, all

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        loadProgress();
      }
    }
  }, [authLoading, isAuthenticated, timeRange]);

  const loadProgress = async () => {
    try {
      const studentId = user?.students?.[0]?.id;
      if (!studentId) {
        router.push('/onboarding');
        return;
      }

      const response = await fetch(`/api/students/${studentId}/progress?timeRange=${timeRange}`, {
        credentials: 'include',
      });
      const data = await response.json();
      setProgress(data);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>
        <Header />
        <main className="container" style={{ paddingBlock: 'var(--space-xl)' }}>
          <div className="skeleton" style={{ height: '40px', width: '300px', marginBottom: 'var(--space-xl)' }}></div>
          <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-xl)' }}></div>
        </main>
      </div>
    );
  }

  // Prepare chart data
  const chartData = progress?.recentSessions
    ?.slice(-14)
    .map((session, index) => ({
      label: new Date(session.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: session.pointsEarned || 0,
    })) || [];

  const subjectProgress = progress?.progressBySubject || {};

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>
      <Header />
      <main className="container animate-fade-in" style={{ paddingBlock: 'var(--space-xl)' }}>
        {/* Header */}
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
            <div>
              <h1 style={{
                fontSize: 'var(--text-4xl)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-xs)',
              }}>
                Your Progress
              </h1>
              <p style={{
                fontSize: 'var(--text-lg)',
                color: 'var(--color-text-secondary)',
              }}>
                Track your learning journey and see how far you've come
              </p>
            </div>

            {/* Time Range Selector */}
            <div style={{ display: 'flex', gap: 'var(--space-xs)', background: 'var(--color-bg-subtle)', padding: 'var(--space-2xs)', borderRadius: 'var(--radius-lg)' }}>
              {['week', 'month', 'all'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={timeRange === range ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
                  style={{
                    textTransform: 'capitalize',
                  }}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Summary Stats */}
        <section className="grid grid-auto-fit" style={{ gap: 'var(--space-md)', marginBottom: 'var(--space-2xl)' }}>
          <div className="surface-elevated animate-scale-in" style={{ padding: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <TrendingUp style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', fontWeight: 'var(--weight-medium)' }}>
                  Total Points
                </div>
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text-primary)' }}>
              {progress?.summary?.totalPoints?.toLocaleString() || 0}
            </div>
          </div>

          <div className="surface-elevated animate-scale-in" style={{ padding: 'var(--space-lg)', animationDelay: '50ms' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Target style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', fontWeight: 'var(--weight-medium)' }}>
                  Mastery Level
                </div>
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text-primary)' }}>
              {progress?.summary?.masteryLevel || 'Beginner'}
            </div>
          </div>

          <div className="surface-elevated animate-scale-in" style={{ padding: 'var(--space-lg)', animationDelay: '100ms' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <BookOpen style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', fontWeight: 'var(--weight-medium)' }}>
                  Sessions Completed
                </div>
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text-primary)' }}>
              {progress?.summary?.totalSessions || 0}
            </div>
          </div>

          <div className="surface-elevated animate-scale-in" style={{ padding: 'var(--space-lg)', animationDelay: '150ms' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Award style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', fontWeight: 'var(--weight-medium)' }}>
                  Achievements
                </div>
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text-primary)' }}>
              {progress?.achievements?.length || 0}
            </div>
          </div>
        </section>

        {/* Progress Chart */}
        {chartData.length > 0 && (
          <section style={{ marginBottom: 'var(--space-2xl)' }}>
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-md)',
            }}>
              Points Over Time
            </h2>
            <ProgressChart data={chartData} type="line" height={300} showTrend={true} />
          </section>
        )}

        {/* Subject Progress */}
        {Object.keys(subjectProgress).length > 0 && (
          <section style={{ marginBottom: 'var(--space-2xl)' }}>
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-md)',
            }}>
              Progress by Subject
            </h2>
            <div className="grid grid-auto-fit" style={{ gap: 'var(--space-md)' }}>
              {Object.entries(subjectProgress).map(([subject, data]) => (
                <div
                  key={subject}
                  className="surface-elevated animate-fade-in"
                  style={{ padding: 'var(--space-lg)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
                    <h3 style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--weight-semibold)',
                      color: 'var(--color-text-primary)',
                      textTransform: 'capitalize',
                    }}>
                      {subject}
                    </h3>
                    <span style={{
                      fontSize: 'var(--text-xl)',
                      fontWeight: 'var(--weight-bold)',
                      color: 'var(--color-accent)',
                    }}>
                      {Math.round(data.progress || 0)}%
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'var(--color-bg-muted)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${data.progress || 0}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--color-accent) 0%, var(--color-primary) 100%)',
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-sm)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                    <span>{data.completedTopics || 0} topics completed</span>
                    <span>{data.points || 0} points</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
