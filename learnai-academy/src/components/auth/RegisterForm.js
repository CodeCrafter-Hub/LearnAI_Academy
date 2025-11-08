'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Mail, Lock, User } from 'lucide-react';

export default function RegisterForm() {
  const router = useRouter();
  const { addToast } = useToast();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      addToast('Passwords do not match', 'error');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      addToast('Password must be at least 8 characters', 'error');
      return;
    }

    setIsLoading(true);

    try {
      await register(formData.name, formData.email, formData.password);
      addToast('Account created successfully!', 'success');
      router.push('/onboarding');
    } catch (err) {
      setError(err.message);
      addToast(err.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-lg)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
      }}>
        {/* Back to Home */}
        <button
          onClick={() => router.push('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-xs)',
            marginBottom: 'var(--space-xl)',
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-medium)',
            cursor: 'pointer',
            padding: 'var(--space-xs)',
            transition: 'color var(--transition-fast)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          Back to home
        </button>

        {/* Sign Up Card */}
        <div style={{
          background: 'var(--color-bg-base)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-2xl)',
          padding: 'var(--space-2xl)',
          boxShadow: 'var(--shadow-lg)',
        }}>
          {/* Header */}
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <h1 style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-xs)',
            }}>
              Create your account
            </h1>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-secondary)',
            }}>
              Start your personalized learning journey today
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
          <form onSubmit={handleSubmit} aria-label="Registration form">
            {/* Name Field */}
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label
                htmlFor="name"
                style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-medium)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-xs)',
                }}
              >
                Full name
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: 'var(--space-md)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}>
                  <User style={{ width: '18px', height: '18px', color: 'var(--color-text-tertiary)' }} />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
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
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-medium)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-xs)',
                }}
              >
                Password
              </label>
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
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a strong password"
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
              <p style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-tertiary)',
                marginTop: 'var(--space-xs)',
                margin: 0,
                paddingTop: 'var(--space-xs)',
              }}>
                Must be at least 8 characters
              </p>
            </div>

            {/* Confirm Password Field */}
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <label
                htmlFor="confirmPassword"
                style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-medium)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-xs)',
                }}
              >
                Confirm password
              </label>
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
                  id="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm your password"
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
              aria-label={isLoading ? 'Creating account, please wait' : 'Create your account'}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
            marginBlock: 'var(--space-xl)',
          }}>
            <div style={{
              flex: 1,
              height: '1px',
              background: 'var(--color-border-subtle)',
            }} />
            <span style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-tertiary)',
            }}>
              or
            </span>
            <div style={{
              flex: 1,
              height: '1px',
              background: 'var(--color-border-subtle)',
            }} />
          </div>

          {/* Sign In Link */}
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              margin: 0,
            }}>
              Already have an account?{' '}
              <a
                href="/login"
                style={{
                  color: 'var(--color-accent)',
                  fontWeight: 'var(--weight-semibold)',
                }}
              >
                Sign in
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 'var(--space-lg)',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-tertiary)',
            margin: 0,
          }}>
            By creating an account, you agree to our{' '}
            <a href="#" style={{ color: 'var(--color-accent)' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="#" style={{ color: 'var(--color-accent)' }}>Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
