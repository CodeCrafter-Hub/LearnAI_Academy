'use client';

import { useRouter } from 'next/navigation';
import { Brain, Zap, Trophy, Users, ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-base)',
    }}>
      {/* Hero Section */}
      <div className="container" style={{
        padding: 'clamp(3rem, 8vw, 5rem) var(--space-md)',
      }}>
        <div className="animate-fade-in" style={{
          textAlign: 'center',
          marginBottom: 'clamp(3rem, 6vw, 4rem)',
        }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-lg)',
            lineHeight: 'var(--leading-tight)',
          }}>
            Welcome to{' '}
            <span style={{
              background: 'linear-gradient(135deg, hsl(220, 80%, 60%) 0%, hsl(260, 70%, 60%) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              LearnAI Academy
            </span>
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-xl)',
            maxWidth: '42rem',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 'var(--leading-relaxed)',
          }}>
            Personalized AI tutoring for K-12 students. Learn at your own pace with intelligent tutors that adapt to your needs.
          </p>
          <div style={{
            display: 'flex',
            gap: 'var(--space-md)',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={() => router.push('/register')}
              className="animate-scale-in"
              style={{
                background: 'linear-gradient(135deg, hsl(220, 80%, 60%) 0%, hsl(260, 70%, 60%) 100%)',
                color: 'white',
                padding: 'var(--space-md) var(--space-xl)',
                borderRadius: 'var(--radius-xl)',
                fontWeight: 'var(--weight-semibold)',
                fontSize: 'var(--text-lg)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-xs)',
                boxShadow: 'var(--shadow-lg)',
                transition: 'all var(--transition-base)',
                animationDelay: '100ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push('/login')}
              className="surface-elevated animate-scale-in"
              style={{
                padding: 'var(--space-md) var(--space-xl)',
                borderRadius: 'var(--radius-xl)',
                fontWeight: 'var(--weight-semibold)',
                fontSize: 'var(--text-lg)',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                animationDelay: '150ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-auto-fit" style={{
          marginBottom: 'clamp(3rem, 6vw, 5rem)',
        }}>
          {[
            { icon: Brain, title: 'AI-Powered Tutoring', description: 'Get personalized help from specialized AI tutors for every subject', gradient: 'linear-gradient(135deg, hsl(220, 80%, 60%) 0%, hsl(260, 70%, 60%) 100%)' },
            { icon: Zap, title: 'Instant Feedback', description: 'Learn faster with immediate responses and guidance', gradient: 'linear-gradient(135deg, hsl(260, 70%, 60%) 0%, hsl(280, 65%, 55%) 100%)' },
            { icon: Trophy, title: 'Gamified Learning', description: 'Earn achievements, build streaks, and track progress', gradient: 'linear-gradient(135deg, hsl(45, 90%, 60%) 0%, hsl(30, 85%, 55%) 100%)' },
            { icon: Users, title: 'Parent Dashboard', description: 'Monitor progress and stay involved in your child\'s learning', gradient: 'linear-gradient(135deg, hsl(145, 65%, 50%) 0%, hsl(175, 65%, 45%) 100%)' },
          ].map((feature, idx) => (
            <FeatureCard key={feature.title} {...feature} index={idx} />
          ))}
        </div>

        {/* Subjects */}
        <div className="animate-fade-in" style={{
          textAlign: 'center',
          marginBottom: 'var(--space-xl)',
          animationDelay: '400ms',
        }}>
          <h2 style={{
            fontSize: 'var(--text-4xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-md)',
          }}>
            All Subjects Covered
          </h2>
          <p style={{
            fontSize: 'var(--text-xl)',
            color: 'var(--color-text-secondary)',
          }}>
            From kindergarten to high school, we've got you covered
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" style={{
          marginBottom: 'clamp(3rem, 6vw, 5rem)',
        }}>
          {[
            { name: 'Math', emoji: '🔢' },
            { name: 'English', emoji: '📚' },
            { name: 'Reading', emoji: '📖' },
            { name: 'Science', emoji: '🔬' },
            { name: 'Writing', emoji: '✍️' },
            { name: 'Coding', emoji: '💻' },
          ].map((subject, idx) => (
            <div
              key={subject.name}
              className="surface-elevated animate-scale-in"
              style={{
                padding: 'var(--space-lg)',
                textAlign: 'center',
                transition: 'all var(--transition-base)',
                animationDelay: `${450 + idx * 30}ms`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              <div style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                marginBottom: 'var(--space-xs)',
              }}>
                {subject.emoji}
              </div>
              <div style={{
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--color-text-primary)',
              }}>{subject.name}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="surface-elevated animate-fade-in" style={{
          background: 'linear-gradient(135deg, hsl(220, 80%, 60%) 0%, hsl(260, 70%, 60%) 100%)',
          borderRadius: 'var(--radius-3xl)',
          padding: 'clamp(2rem, 4vw, 3rem)',
          textAlign: 'center',
          animationDelay: '650ms',
        }}>
          <h2 style={{
            fontSize: 'var(--text-4xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'white',
            marginBottom: 'var(--space-md)',
          }}>
            Ready to Transform Learning?
          </h2>
          <p style={{
            fontSize: 'var(--text-xl)',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: 'var(--space-xl)',
          }}>
            Join thousands of students learning smarter with AI
          </p>
          <button
            onClick={() => router.push('/register')}
            style={{
              background: 'white',
              color: 'hsl(220, 80%, 60%)',
              padding: 'var(--space-md) var(--space-xl)',
              borderRadius: 'var(--radius-xl)',
              fontWeight: 'var(--weight-semibold)',
              fontSize: 'var(--text-lg)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-base)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = 'white';
            }}
          >
            Start Learning Today
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, gradient, index }) {
  return (
    <div
      className="surface-elevated animate-scale-in"
      style={{
        padding: 'var(--space-lg)',
        transition: 'all var(--transition-base)',
        animationDelay: `${200 + index * 50}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
    >
      <div style={{
        background: gradient,
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-sm)',
        display: 'inline-flex',
        marginBottom: 'var(--space-md)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <Icon className="w-8 h-8" style={{ color: 'white' }} />
      </div>
      <h3 style={{
        fontSize: 'var(--text-xl)',
        fontWeight: 'var(--weight-bold)',
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--space-xs)',
      }}>{title}</h3>
      <p style={{
        fontSize: 'var(--text-base)',
        color: 'var(--color-text-secondary)',
        lineHeight: 'var(--leading-relaxed)',
      }}>{description}</p>
    </div>
  );
}
