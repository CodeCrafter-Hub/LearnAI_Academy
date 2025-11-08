'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Mail, Lock, GraduationCap, CheckCircle, TrendingUp, Award } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const { addToast } = useToast();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Use secure cookie-based authentication
      const data = await login(formData.email, formData.password);

      addToast('Welcome back!', 'success');

      // Check if student profile exists
      if (!data.user.students || data.user.students.length === 0) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message);
      addToast(err.message || 'Login failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--color-border-subtle)',
        background: 'var(--color-bg-base)',
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-lg) var(--space-xl)',
        }}>
          <button
            onClick={() => router.push('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <GraduationCap style={{ width: '32px', height: '32px', color: 'var(--color-accent)' }} />
            <span style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--color-text-primary)',
            }}>
              LearnAI Academy
            </span>
          </button>

          <a
            href="/register"
            className="btn btn-secondary"
            style={{
              fontSize: 'var(--text-sm)',
              padding: 'var(--space-sm) var(--space-lg)',
            }}
          >
            Sign up
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: 'calc(100vh - 80px - 60px)',
      }}>
        {/* Left Column - Form */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-2xl)',
        }}>
          <div style={{ width: '100%', maxWidth: '440px' }}>
            <div style={{ marginBottom: 'var(--space-2xl)' }}>
              <h1 style={{
                fontSize: 'var(--text-4xl)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-sm)',
              }}>
                Welcome back
              </h1>
              <p style={{
                fontSize: 'var(--text-lg)',
                color: 'var(--color-text-secondary)',
              }}>
                Sign in to continue your learning journey
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div
                role="alert"
                aria-live="polite"
                style={{
                  background: 'var(--color-error-subtle)',
                  border: '1px solid var(--color-error)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-md)',
                  marginBottom: 'var(--space-lg)',
                }}
              >
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-error)',
                  margin: 0,
                }}>
                  {error}
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} aria-label="Login form">
              {/* Email Field */}
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <label
                  htmlFor="email"
                  style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-xs)',
                  }}
                >
                  Email address
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: 'var(--space-md)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}>
                    <Mail style={{ width: '18px', height: '18px', color: 'var(--color-text-tertiary)' }} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    aria-required="true"
                    style={{
                      width: '100%',
                      padding: 'var(--space-md)',
                      paddingLeft: 'calc(var(--space-md) * 2 + 18px)',
                      fontSize: 'var(--text-base)',
                      color: 'var(--color-text-primary)',
                      background: 'var(--color-bg-base)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      transition: 'all var(--transition-fast)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-accent)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-accent-subtle)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div style={{ marginBottom: 'var(--space-lg)' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-xs)',
                }}>
                  <label
                    htmlFor="password"
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--weight-medium)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    Password
                  </label>
                  <a
                    href="#"
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-accent)',
                      fontWeight: 'var(--weight-medium)',
                      textDecoration: 'none',
                    }}
                  >
                    Forgot password?
                  </a>
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: 'var(--space-md)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}>
                    <Lock style={{ width: '18px', height: '18px', color: 'var(--color-text-tertiary)' }} />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                    aria-required="true"
                    style={{
                      width: '100%',
                      padding: 'var(--space-md)',
                      paddingLeft: 'calc(var(--space-md) * 2 + 18px)',
                      fontSize: 'var(--text-base)',
                      color: 'var(--color-text-primary)',
                      background: 'var(--color-bg-base)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      transition: 'all var(--transition-fast)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-accent)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-accent-subtle)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: 'var(--space-md)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--weight-semibold)',
                }}
                aria-busy={isLoading}
                aria-label={isLoading ? 'Signing in, please wait' : 'Sign in to your account'}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            {/* Sign Up Link */}
            <div style={{ marginTop: 'var(--space-lg)', textAlign: 'center' }}>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                margin: 0,
              }}>
                Don't have an account?{' '}
                <a
                  href="/register"
                  style={{
                    color: 'var(--color-accent)',
                    fontWeight: 'var(--weight-semibold)',
                    textDecoration: 'none',
                  }}
                >
                  Sign up for free
                </a>
              </p>
            </div>

            {/* Footer Links */}
            <div style={{
              marginTop: 'var(--space-2xl)',
              paddingTop: 'var(--space-lg)',
              borderTop: '1px solid var(--color-border-subtle)',
              textAlign: 'center',
            }}>
              <p style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-tertiary)',
                margin: 0,
              }}>
                By signing in, you agree to our{' '}
                <a href="#" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Terms of Service</a>
                {' '}and{' '}
                <a href="#" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Benefits */}
        <div style={{
          background: 'linear-gradient(135deg, var(--color-accent-subtle) 0%, var(--color-bg-muted) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-2xl)',
          borderLeft: '1px solid var(--color-border-subtle)',
        }}>
          <div style={{ maxWidth: '500px' }}>
            <h2 style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-xl)',
            }}>
              Continue your learning journey
            </h2>

            {/* Benefits List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                <div style={{
                  flexShrink: 0,
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--color-bg-base)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CheckCircle style={{ width: '24px', height: '24px', color: 'var(--color-accent)' }} />
                </div>
                <div>
                  <h3 style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-2xs)',
                  }}>
                    Personalized Learning
                  </h3>
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                    margin: 0,
                  }}>
                    AI-powered curriculum adapts to your child's learning pace and style
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                <div style={{
                  flexShrink: 0,
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--color-bg-base)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <TrendingUp style={{ width: '24px', height: '24px', color: 'var(--color-accent)' }} />
                </div>
                <div>
                  <h3 style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-2xs)',
                  }}>
                    Track Progress
                  </h3>
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                    margin: 0,
                  }}>
                    Monitor achievements, streaks, and learning milestones in real-time
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                <div style={{
                  flexShrink: 0,
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--color-bg-base)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Award style={{ width: '24px', height: '24px', color: 'var(--color-accent)' }} />
                </div>
                <div>
                  <h3 style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-2xs)',
                  }}>
                    Earn Achievements
                  </h3>
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                    margin: 0,
                  }}>
                    Unlock badges and rewards as you master new concepts and skills
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div style={{
              marginTop: 'var(--space-2xl)',
              padding: 'var(--space-lg)',
              background: 'var(--color-bg-base)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border-subtle)',
            }}>
              <p style={{
                fontSize: 'var(--text-base)',
                color: 'var(--color-text-primary)',
                fontStyle: 'italic',
                marginBottom: 'var(--space-md)',
              }}>
                "LearnAI Academy has transformed how my child learns. The personalized approach keeps them engaged and motivated every day."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <div>
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--color-text-primary)',
                    margin: 0,
                  }}>
                    Sarah Johnson
                  </p>
                  <p style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-secondary)',
                    margin: 0,
                  }}>
                    Parent of 5th grader
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--color-border-subtle)',
        background: 'var(--color-bg-base)',
        padding: 'var(--space-lg) 0',
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--space-xl)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-tertiary)',
        }}>
          <div>
            © 2024 LearnAI Academy. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
            <a href="#" style={{ color: 'var(--color-text-tertiary)', textDecoration: 'none', transition: 'color var(--transition-fast)' }}
               onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
               onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-tertiary)'}>
              Terms
            </a>
            <a href="#" style={{ color: 'var(--color-text-tertiary)', textDecoration: 'none', transition: 'color var(--transition-fast)' }}
               onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
               onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-tertiary)'}>
              Privacy
            </a>
            <a href="#" style={{ color: 'var(--color-text-tertiary)', textDecoration: 'none', transition: 'color var(--transition-fast)' }}
               onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
               onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-tertiary)'}>
              Help
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
