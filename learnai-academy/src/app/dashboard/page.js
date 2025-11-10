'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationContext } from '@/components/providers/NotificationProvider';
import EnterpriseHeader from '@/components/layout/EnterpriseHeader';
import SubjectCard from '@/components/learning/SubjectCard';
import StreakCounter from '@/components/gamification/StreakCounter';
import ProgressChart from '@/components/visualizations/ProgressChart';
import Leaderboard from '@/components/gamification/Leaderboard';
import AchievementBadge from '@/components/gamification/AchievementBadge';
import { Flame, Sparkles, Trophy, Lightbulb, TrendingUp, Clock, Award, GraduationCap } from 'lucide-react';
import ClassroomEvaluationWidget from '@/components/ui/ClassroomEvaluationWidget';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { notifyAchievement, notifyStreak } = useNotificationContext();
  const [subjects, setSubjects] = useState([]);
  const [progress, setProgress] = useState(null);
  const [student, setStudent] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRecentActivity, setShowRecentActivity] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [chartData, setChartData] = useState([]);

  const loadData = async () => {
    try {
      // Admins don't need student profiles - show admin dashboard
      if (user?.role === 'ADMIN' || user?.is_admin) {
        // Admin dashboard - show system overview instead of student-specific data
        setIsLoading(false);
        return;
      }

      // Get student ID (first student for now)
      const studentId = user?.students?.[0]?.id;
      if (!studentId && !(user?.role === 'ADMIN' || user?.is_admin)) {
        // Don't redirect here - let component handle it via useEffect
        setIsLoading(false);
        return;
      }
      
      if (!studentId) {
        setIsLoading(false);
        return; // Admin or no student profile
      }

      setStudent(user.students[0]);

      // Load subjects - using httpOnly cookies (credentials: 'include')
      try {
        const subjectsRes = await fetch(`/api/subjects?gradeLevel=${user.students[0].gradeLevel}`, {
          credentials: 'include',
        });
        if (subjectsRes.ok) {
          const subjectsData = await subjectsRes.json();
          setSubjects(subjectsData || []);
        }
      } catch (subjectsError) {
        console.warn('Error loading subjects:', subjectsError);
        setSubjects([]);
      }

      // Load progress
      let progressData = null;
      try {
        const progressRes = await fetch(`/api/students/${studentId}/progress`, {
          credentials: 'include',
        });
        if (progressRes.ok) {
          progressData = await progressRes.json();
          setProgress(progressData);
        }
      } catch (progressError) {
        console.warn('Error loading progress:', progressError);
        setProgress(null);
      }

      // Prepare chart data from recent sessions
      if (progressData && progressData.recentSessions && progressData.recentSessions.length > 0) {
        const chartPoints = progressData.recentSessions
          .slice(-7)
          .map((session, index) => ({
            label: new Date(session.startedAt).toLocaleDateString('en-US', { weekday: 'short' }),
            value: session.pointsEarned || 0,
          }));
        setChartData(chartPoints);
      }

      // Check for streak milestones
      const currentStreak = progressData?.summary?.currentStreak || 0;
      if (currentStreak > 0 && currentStreak % 7 === 0) {
        notifyStreak(currentStreak);
      }

      // Load recommendations
      try {
        const recommendationsRes = await fetch(`/api/recommendations?studentId=${studentId}&limit=5`, {
          credentials: 'include',
        });
        if (recommendationsRes.ok) {
          const recommendationsData = await recommendationsRes.json();
          setRecommendations(recommendationsData.recommendations || []);
        }
      } catch (recError) {
        // Continue even if recommendations fail
      }
    } catch (error) {
      // Error loading data - log but don't crash
      console.error('Error loading dashboard data:', error);
      // Show empty state instead of crashing
      setSubjects([]);
      setProgress(null);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubjectClick = (subject) => {
    router.push(`/learn?subject=${subject.slug}`);
  };

  // Load data when authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      loadData();
    }
  }, [authLoading, isAuthenticated, user]);

  // Redirect to onboarding if no student profile (but not admin)
  useEffect(() => {
    if (!authLoading && isAuthenticated && !student && !(user?.role === 'ADMIN' || user?.is_admin) && !isLoading) {
      router.push('/onboarding');
    }
  }, [authLoading, isAuthenticated, student, user, isLoading, router]);

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>
        <EnterpriseHeader />
        <main className="container" style={{ paddingBlock: 'var(--space-xl)' }}>
          <div className="skeleton" style={{ height: '40px', width: '300px', marginBottom: 'var(--space-sm)' }}></div>
          <div className="skeleton" style={{ height: '24px', width: '400px', marginBottom: 'var(--space-xl)' }}></div>

          <div className="grid grid-auto-fit" style={{ marginBottom: 'var(--space-xl)' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: '140px', borderRadius: 'var(--radius-xl)' }}></div>
            ))}
          </div>

          <div className="grid grid-auto-fit">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-xl)' }}></div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Show admin dashboard if user is admin
  if ((user?.role === 'ADMIN' || user?.is_admin) && !student) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>
        <EnterpriseHeader />
        <main className="container" style={{ paddingBlock: 'var(--space-xl)' }}>
          <h1 style={{
            fontSize: 'var(--text-5xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-md)',
          }}>
            Admin Dashboard
          </h1>
          <p style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-xl)',
          }}>
            Welcome to the admin dashboard. System management features coming soon.
          </p>
        </main>
      </div>
    );
  }

  // Show onboarding redirect if no student profile (but not admin)
  useEffect(() => {
    if (!authLoading && isAuthenticated && !student && !(user?.role === 'ADMIN' || user?.is_admin)) {
      router.push('/onboarding');
    }
  }, [authLoading, isAuthenticated, student, user, router]);

  if (!student && !(user?.role === 'ADMIN' || user?.is_admin)) {
    return null; // Will redirect via useEffect
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>
      <EnterpriseHeader />

      <main className="container animate-fade-in" style={{ paddingBlock: 'var(--space-xl)' }}>
        {/* Hero Welcome */}
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <h1 style={{
            fontSize: 'var(--text-5xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-xs)',
            letterSpacing: '-0.03em',
          }}>
            Welcome back, {student?.firstName || user?.email?.split('@')[0] || 'Student'}
          </h1>
          <p style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--leading-relaxed)',
          }}>
            Ready to continue your learning journey?
          </p>
        </section>

        {/* Stats Grid - Enhanced with New Components */}
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
            {/* Streak Counter - Enhanced Component */}
            <StreakCounter
              currentStreak={progress?.summary?.currentStreak || 0}
              targetStreak={30}
            />

            {/* Points Card */}
            <div className="surface-elevated animate-scale-in" style={{
              padding: 'var(--space-lg)',
              transition: 'all var(--transition-base)',
              cursor: 'default',
              animationDelay: '50ms',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-tertiary)',
                    fontWeight: 'var(--weight-medium)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Total Points
                  </div>
                </div>
              </div>
              <div style={{
                fontSize: 'var(--text-4xl)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2xs)',
              }}>
                {progress?.summary?.totalPoints?.toLocaleString() || 0}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                Amazing work!
              </div>
            </div>

            {/* Achievements Card */}
            <div className="surface-elevated animate-scale-in" style={{
              padding: 'var(--space-lg)',
              transition: 'all var(--transition-base)',
              cursor: 'default',
              animationDelay: '100ms',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-tertiary)',
                    fontWeight: 'var(--weight-medium)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Achievements
                  </div>
                </div>
              </div>
              <div style={{
                fontSize: 'var(--text-4xl)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2xs)',
              }}>
                {progress?.achievements?.length || 0}
                <span style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-tertiary)' }}>/10</span>
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                Badges earned
              </div>
            </div>
          </div>

          {/* Progress Chart */}
          {chartData.length > 0 && (
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <h3 style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-md)',
              }}>
                Weekly Progress
              </h3>
              <ProgressChart data={chartData} type="line" height={200} showTrend={true} />
            </div>
          )}

          {/* Recent Achievements */}
          {progress?.achievements && progress.achievements.length > 0 && (
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <h3 style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
              }}>
                <Award style={{ width: '24px', height: '24px', color: 'var(--color-accent)' }} />
                Recent Achievements
              </h3>
              <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                {progress.achievements.slice(0, 5).map((achievement, idx) => (
                  <AchievementBadge
                    key={achievement.id || idx}
                    achievement={achievement}
                    size="md"
                    onClick={() => router.push('/achievements')}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Subjects Grid */}
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <h2 style={{
            fontSize: 'var(--text-3xl)',
            fontWeight: 'var(--weight-semibold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-lg)',
          }}>
            Choose Your Subject
          </h2>

          {subjects.length > 0 ? (
            <div className="grid grid-auto-fit">
              {subjects.map((subject, idx) => (
                <div
                  key={subject.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <SubjectCard
                    subject={subject}
                    progress={progress?.progressBySubject?.[subject.slug]}
                    onClick={() => handleSubjectClick(subject)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="surface-subtle" style={{
              padding: 'var(--space-2xl)',
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
            }}>
              <p>No subjects available yet.</p>
            </div>
          )}
        </section>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section style={{ marginBottom: 'var(--space-2xl)' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              marginBottom: 'var(--space-lg)',
            }}>
              <Lightbulb style={{ width: '24px', height: '24px', color: 'var(--color-accent)' }} />
              <h2 style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--color-text-primary)',
              }}>
                Recommended for You
              </h2>
            </div>

            <div className="grid grid-auto-fit">
              {recommendations.slice(0, 6).map((rec, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (rec.topic?.slug) {
                      router.push(`/learn?subject=${rec.subject?.slug || 'math'}&topic=${rec.topic.slug}`);
                    } else {
                      router.push(`/learn?subject=${rec.subject?.slug || 'math'}`);
                    }
                  }}
                  className="surface-interactive animate-fade-in"
                  style={{
                    padding: 'var(--space-lg)',
                    textAlign: 'left',
                    border: '1px solid var(--color-border-subtle)',
                    background: 'var(--color-bg-elevated)',
                    animationDelay: `${idx * 50}ms`,
                  }}
                >
                  <div style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-accent)',
                    fontWeight: 'var(--weight-medium)',
                    marginBottom: 'var(--space-2xs)',
                  }}>
                    {rec.reason || 'Recommended'}
                  </div>
                  <div style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-2xs)',
                  }}>
                    {rec.topic?.name || rec.subject?.name}
                  </div>
                  <div style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                  }}>
                    {rec.subject?.name} {rec.topic && `• ${rec.topic.description?.slice(0, 60)}...`}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Recent Activity - Progressive Disclosure */}
        {progress?.recentSessions && progress.recentSessions.length > 0 && (
          <section style={{ marginBottom: 'var(--space-xl)' }}>
            <button
              onClick={() => setShowRecentActivity(!showRecentActivity)}
              className="btn-ghost"
              style={{
                width: '100%',
                justifyContent: 'space-between',
                padding: 'var(--space-md)',
                marginBottom: showRecentActivity ? 'var(--space-md)' : 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <Clock style={{ width: '20px', height: '20px' }} />
                <span style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)' }}>
                  Recent Activity
                </span>
              </div>
              <svg
                style={{
                  width: '20px',
                  height: '20px',
                  transform: showRecentActivity ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform var(--transition-base)',
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showRecentActivity && (
              <div className="stack animate-fade-in" style={{ gap: 'var(--space-xs)' }}>
                {progress.recentSessions.slice(0, 5).map((session, i) => (
                  <div
                    key={i}
                    className="surface-subtle"
                    style={{
                      padding: 'var(--space-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: 'var(--weight-medium)',
                        color: 'var(--color-text-primary)',
                        marginBottom: 'var(--space-3xs)',
                      }}>
                        {session.subject} - {session.topic}
                      </div>
                      <div style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-tertiary)',
                      }}>
                        {new Date(session.startedAt).toLocaleDateString()} • {session.durationMinutes} min
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: 'var(--text-xl)',
                        fontWeight: 'var(--weight-bold)',
                        color: 'var(--color-accent)',
                      }}>
                        +{session.pointsEarned}
                      </div>
                      <div style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-tertiary)',
                      }}>
                        points
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Leaderboard Section */}
        {leaderboardData.length > 0 && (
          <section style={{ marginBottom: 'var(--space-2xl)' }}>
            <Leaderboard
              entries={leaderboardData}
              currentUserId={user?.id}
              timeRange="week"
              maxEntries={10}
            />
          </section>
        )}

               {/* Classroom Evaluation Widget */}
               {student && (
                 <section style={{ marginBottom: 'var(--space-xl)' }}>
                   <div className="flex items-center gap-2 mb-4">
                     <GraduationCap className="w-5 h-5 text-blue-600" />
                     <h2 style={{
                       fontSize: 'var(--text-2xl)',
                       fontWeight: 'var(--weight-semibold)',
                       color: 'var(--color-text-primary)',
                     }}>
                       Classroom Experience
                     </h2>
                   </div>
                   <ClassroomEvaluationWidget gradeLevel={student.gradeLevel} />
                 </section>
               )}

               {/* Quick Actions */}
               <section className="cluster" style={{ justifyContent: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                 <button
                   onClick={() => router.push('/progress')}
                   className="btn btn-secondary btn-lg hover-lift"
                 >
                   <TrendingUp className="w-5 h-5" />
                   View Progress
                 </button>
                 <button
                   onClick={() => router.push('/achievements')}
                   className="btn btn-primary btn-lg hover-lift"
                 >
                   <Trophy className="w-5 h-5" />
                   Achievements
                 </button>
                 <button
                   onClick={() => router.push('/grades')}
                   className="btn btn-secondary btn-lg hover-lift"
                 >
                   <GraduationCap className="w-5 h-5" />
                   All Grades
                 </button>
               </section>
      </main>
    </div>
  );
}
