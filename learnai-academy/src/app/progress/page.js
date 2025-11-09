'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import ProgressCard from '@/components/progress/ProgressCard';
import ProgressChart from '@/components/progress/ProgressChart';
import { Home, TrendingUp, Clock, Star, BookMarked } from 'lucide-react';

export default function ProgressPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));
      const studentId = userData.students?.[0]?.id;

      if (!studentId) return;

      const response = await fetch(`/api/students/${studentId}/progress`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      setProgress(data);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="skeleton" style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            margin: '0 auto var(--space-md)',
          }} />
          <p style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-base)',
          }}>Loading your progress...</p>
        </div>
      </div>
    );
  }

  const totalPoints = progress?.summary?.totalPoints || 0;
  const totalSessions = progress?.summary?.totalSessions || 0;
  const totalMinutes = progress?.summary?.totalMinutes || 0;
  const currentStreak = progress?.summary?.currentStreak || 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-base)',
    }}>
      <Header />

      <div className="container" style={{
        padding: 'var(--space-lg) var(--space-md)',
      }}>
        {/* Header */}
        <div className="animate-fade-in" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-2xl)',
          flexWrap: 'wrap',
          gap: 'var(--space-md)',
        }}>
          <div>
            <h1 style={{
              fontSize: 'var(--text-4xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-xs)',
            }}>Your Learning Journey</h1>
            <p style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--color-text-secondary)',
            }}>Track your growth and mastery</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
              padding: 'var(--space-sm) var(--space-md)',
              background: 'none',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--color-accent)',
              fontWeight: 'var(--weight-medium)',
              fontSize: 'var(--text-base)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-muted)';
              e.currentTarget.style.borderColor = 'var(--color-accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
            }}
          >
            <Home className="w-5 h-5" />
            Dashboard
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-auto-fit" style={{
          marginBottom: 'var(--space-2xl)',
        }}>
          {[
            { title: 'Total Points', value: totalPoints.toLocaleString(), icon: Star, gradient: 'linear-gradient(135deg, hsl(45, 90%, 60%) 0%, hsl(30, 85%, 55%) 100%)' },
            { title: 'Sessions', value: totalSessions, icon: BookMarked, gradient: 'linear-gradient(135deg, hsl(220, 80%, 60%) 0%, hsl(260, 70%, 60%) 100%)' },
            { title: 'Learning Time', value: `${Math.round(totalMinutes / 60)}h`, subtitle: `${totalMinutes} minutes`, icon: Clock, gradient: 'linear-gradient(135deg, hsl(145, 65%, 50%) 0%, hsl(175, 65%, 45%) 100%)' },
            { title: 'Current Streak', value: `${currentStreak} days`, icon: TrendingUp, gradient: 'linear-gradient(135deg, hsl(340, 75%, 60%) 0%, hsl(350, 70%, 55%) 100%)' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="surface-elevated animate-scale-in"
                style={{
                  padding: 'var(--space-lg)',
                  transition: 'all var(--transition-base)',
                  animationDelay: `${idx * 50}ms`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-lg)',
                  background: stat.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--space-md)',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <Icon className="w-6 h-6" style={{ color: 'white' }} />
                </div>
                <div style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-medium)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--space-2xs)',
                }}>
                  {stat.title}
                </div>
                <div style={{
                  fontSize: 'var(--text-3xl)',
                  fontWeight: 'var(--weight-bold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: stat.subtitle ? 'var(--space-2xs)' : 0,
                }}>
                  {stat.value}
                </div>
                {stat.subtitle && (
                  <div style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-tertiary)',
                  }}>
                    {stat.subtitle}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Activity Chart */}
        <div className="surface-elevated animate-fade-in" style={{
          padding: 'var(--space-lg)',
          marginBottom: 'var(--space-2xl)',
          animationDelay: '200ms',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-lg)',
            flexWrap: 'wrap',
            gap: 'var(--space-md)',
          }}>
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--color-text-primary)',
            }}>Learning Activity</h2>
            <div style={{
              display: 'flex',
              gap: 'var(--space-xs)',
            }}>
              {['7d', '30d'].map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  style={{
                    padding: 'var(--space-xs) var(--space-md)',
                    borderRadius: 'var(--radius-lg)',
                    border: 'none',
                    background: selectedPeriod === period ? 'var(--color-accent)' : 'var(--color-bg-muted)',
                    color: selectedPeriod === period ? 'white' : 'var(--color-text-secondary)',
                    fontWeight: 'var(--weight-medium)',
                    fontSize: 'var(--text-sm)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedPeriod !== period) {
                      e.currentTarget.style.background = 'var(--color-bg-elevated)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedPeriod !== period) {
                      e.currentTarget.style.background = 'var(--color-bg-muted)';
                    }
                  }}
                >
                  {period === '7d' ? '7 Days' : '30 Days'}
                </button>
              ))}
            </div>
          </div>
          <ProgressChart data={progress?.activityChart || []} type="line" />
        </div>

        {/* Subject Progress */}
        <div className="surface-elevated animate-fade-in" style={{
          padding: 'var(--space-lg)',
          marginBottom: 'var(--space-2xl)',
          animationDelay: '250ms',
        }}>
          <h2 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-lg)',
          }}>Subject Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(progress?.progressBySubject || {}).map(([slug, data], idx) => (
              <div
                key={slug}
                className="animate-scale-in"
                style={{
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-lg)',
                  background: 'var(--color-bg-base)',
                  animationDelay: `${idx * 50}ms`,
                }}
              >
                <h3 style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--weight-bold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-md)',
                }}>{data.subject}</h3>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-md)',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 'var(--text-sm)',
                  }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Average Mastery:</span>
                    <span style={{
                      fontWeight: 'var(--weight-bold)',
                      color: 'var(--color-text-primary)',
                    }}>
                      {Math.round(data.averageMastery * 100)}%
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '12px',
                    background: 'var(--color-bg-muted)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}>
                    <div
                      style={{
                        height: '100%',
                        background: 'var(--color-accent)',
                        borderRadius: 'var(--radius-full)',
                        width: `${data.averageMastery * 100}%`,
                        transition: 'width 500ms ease-out',
                      }}
                    />
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-tertiary)',
                  }}>
                    <span>{data.totalSessions} sessions</span>
                    <span>{data.topics.length} topics</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Mastery */}
        <div className="surface-elevated animate-fade-in" style={{
          padding: 'var(--space-lg)',
          marginBottom: 'var(--space-2xl)',
          animationDelay: '300ms',
        }}>
          <h2 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-lg)',
          }}>Topic Mastery</h2>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-sm)',
          }}>
            {Object.entries(progress?.progressBySubject || {}).map(([slug, subjectData]) =>
              subjectData.topics.map((topic, idx) => {
                const masteryColor = topic.masteryLevel >= 0.8
                  ? 'hsl(145, 65%, 50%)'
                  : topic.masteryLevel >= 0.5
                  ? 'hsl(45, 90%, 55%)'
                  : 'hsl(0, 70%, 55%)';

                return (
                  <div
                    key={`${slug}-${idx}`}
                    className="animate-fade-in"
                    style={{
                      padding: 'var(--space-md)',
                      background: 'var(--color-bg-muted)',
                      borderRadius: 'var(--radius-lg)',
                      animationDelay: `${idx * 20}ms`,
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 'var(--space-xs)',
                    }}>
                      <div>
                        <span style={{
                          fontWeight: 'var(--weight-medium)',
                          color: 'var(--color-text-primary)',
                        }}>{topic.topicName}</span>
                        <span style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-tertiary)',
                          marginLeft: 'var(--space-xs)',
                        }}>({subjectData.subject})</span>
                      </div>
                      <span style={{
                        fontWeight: 'var(--weight-bold)',
                        color: 'var(--color-text-primary)',
                      }}>
                        {Math.round(topic.masteryLevel * 100)}%
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: 'var(--color-bg-elevated)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}>
                      <div
                        style={{
                          height: '100%',
                          background: masteryColor,
                          borderRadius: 'var(--radius-full)',
                          width: `${topic.masteryLevel * 100}%`,
                          transition: 'width 500ms ease-out',
                        }}
                      />
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-tertiary)',
                      marginTop: 'var(--space-xs)',
                    }}>
                      <span>{topic.sessionsCount} sessions</span>
                      <span>{topic.totalTimeMinutes} min</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="surface-elevated animate-fade-in" style={{
          padding: 'var(--space-lg)',
          animationDelay: '350ms',
        }}>
          <h2 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-lg)',
          }}>Recent Sessions</h2>
          {progress?.recentSessions && progress.recentSessions.length > 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-sm)',
            }}>
              {progress.recentSessions.map((session, i) => (
                <div
                  key={i}
                  className="animate-fade-in"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-md)',
                    background: 'var(--color-bg-muted)',
                    borderRadius: 'var(--radius-lg)',
                    gap: 'var(--space-md)',
                    animationDelay: `${i * 30}ms`,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: 'var(--weight-medium)',
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--space-2xs)',
                    }}>
                      {session.subject} - {session.topic}
                    </div>
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-secondary)',
                    }}>
                      {new Date(session.startedAt).toLocaleString()} •{' '}
                      {session.mode === 'PRACTICE' ? '🎯 Practice' : '💡 Help'} •{' '}
                      {session.difficulty}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontWeight: 'var(--weight-bold)',
                      color: 'var(--color-accent)',
                    }}>+{session.pointsEarned}</div>
                    <div style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-tertiary)',
                    }}>{session.durationMinutes} min</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
              padding: 'var(--space-2xl) 0',
            }}>
              No sessions yet. Start learning to see your history!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
