'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, User, GraduationCap, CheckCircle, Zap, Shield, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'PARENT',
    gradeLevel: 5,
  });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation helper
  const validatePassword = (password) => {
    const requirements = {
      minLength: password.length >= 12,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
    };
    return requirements;
  };

  // Get password strength
  const getPasswordStrength = (password) => {
    const reqs = validatePassword(password);
    const metCount = Object.values(reqs).filter(Boolean).length;
    if (metCount < 2) return { strength: 'weak', color: 'red' };
    if (metCount < 4) return { strength: 'medium', color: 'orange' };
    if (metCount < 5) return { strength: 'good', color: 'blue' };
    return { strength: 'strong', color: 'green' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});
    setIsLoading(true);

    // Validation
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    // Password validation (match backend requirements)
    const passwordReqs = validatePassword(formData.password);
    if (!passwordReqs.minLength) {
      newErrors.password = 'Password must be at least 12 characters';
    } else if (!passwordReqs.hasUpperCase) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!passwordReqs.hasLowerCase) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!passwordReqs.hasNumber) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!passwordReqs.hasSpecial) {
      newErrors.password = 'Password must contain at least one special character';
    }

    // Password confirmation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Grade level validation for students
    if (formData.role === 'STUDENT' && formData.gradeLevel === undefined) {
      newErrors.gradeLevel = 'Grade level is required for students';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setError(Object.values(newErrors)[0]);
      addToast(Object.values(newErrors)[0], 'error');
      setIsLoading(false);
      return;
    }

    try {
      // Fix: Use object parameter instead of separate parameters
      const data = await register({
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        role: formData.role,
        gradeLevel: formData.role === 'STUDENT' ? formData.gradeLevel : undefined,
      });

      addToast('Account created successfully!', 'success');

      // Redirect based on role
      if (formData.role === 'STUDENT' && (!data.user.students || data.user.students.length === 0)) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      // Handle detailed error messages from backend
      let errorMessage = err.message || 'Registration failed. Please try again.';
      
      // Check if error has details (from Zod validation)
      if (err.details && Array.isArray(err.details)) {
        const fieldErrors = {};
        err.details.forEach((detail) => {
          if (detail.path && detail.path.length > 0) {
            fieldErrors[detail.path[0]] = detail.message;
          }
        });
        setErrors(fieldErrors);
        errorMessage = err.details[0]?.message || errorMessage;
      }
      
      setError(errorMessage);
      addToast(errorMessage, 'error');
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
            href="/login"
            className="btn btn-secondary"
            style={{
              fontSize: 'var(--text-sm)',
              padding: 'var(--space-sm) var(--space-lg)',
            }}
          >
            Sign in
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
                Start learning today
              </h1>
              <p style={{
                fontSize: 'var(--text-lg)',
                color: 'var(--color-text-secondary)',
              }}>
                Create your account and unlock personalized education
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
              {/* First Name */}
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <label
                  htmlFor="firstName"
                  style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-xs)',
                  }}
                >
                  First Name
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
                    id="firstName"
                    type="text"
                    required
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Enter your first name"
                    aria-required="true"
                    style={{
                      width: '100%',
                      padding: 'var(--space-md)',
                      paddingLeft: 'calc(var(--space-md) * 2 + 18px)',
                      fontSize: 'var(--text-base)',
                      color: 'var(--color-text-primary)',
                      background: 'var(--color-bg-base)',
                      border: `1px solid ${errors.firstName ? 'var(--color-error)' : 'var(--color-border-subtle)'}`,
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

              {/* Last Name */}
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <label
                  htmlFor="lastName"
                  style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-xs)',
                  }}
                >
                  Last Name
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
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Enter your last name"
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

              {/* Email */}
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
                      border: `1px solid ${errors.email ? 'var(--color-error)' : 'var(--color-border-subtle)'}`,
                      borderRadius: 'var(--radius-lg)',
                      transition: 'all var(--transition-fast)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-accent)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-accent-subtle)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = errors.email ? 'var(--color-error)' : 'var(--color-border-subtle)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                {errors.email && (
                  <p style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-error)',
                    marginTop: 'var(--space-xs)',
                    margin: 0,
                  }}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
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
                    type={showPassword ? 'text' : 'password'}
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
                      paddingRight: 'calc(var(--space-md) * 2 + 18px)',
                      fontSize: 'var(--text-base)',
                      color: 'var(--color-text-primary)',
                      background: 'var(--color-bg-base)',
                      border: `1px solid ${errors.password ? 'var(--color-error)' : 'var(--color-border-subtle)'}`,
                      borderRadius: 'var(--radius-lg)',
                      transition: 'all var(--transition-fast)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-accent)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-accent-subtle)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = errors.password ? 'var(--color-error)' : 'var(--color-border-subtle)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 'var(--space-md)',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 'var(--space-xs)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff style={{ width: '18px', height: '18px', color: 'var(--color-text-tertiary)' }} />
                    ) : (
                      <Eye style={{ width: '18px', height: '18px', color: 'var(--color-text-tertiary)' }} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-error)',
                    marginTop: 'var(--space-xs)',
                    margin: 0,
                  }}>
                    {errors.password}
                  </p>
                )}
                {!errors.password && formData.password && (
                  <div style={{ marginTop: 'var(--space-xs)' }}>
                    <p style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-tertiary)',
                      marginBottom: 'var(--space-2xs)',
                      margin: 0,
                    }}>
                      Password requirements:
                    </p>
                    <ul style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-tertiary)',
                      margin: 0,
                      paddingLeft: 'var(--space-md)',
                      listStyle: 'none',
                    }}>
                      <li style={{ color: validatePassword(formData.password).minLength ? 'var(--color-success)' : 'var(--color-text-tertiary)' }}>
                        {validatePassword(formData.password).minLength ? '✓' : '○'} At least 12 characters
                      </li>
                      <li style={{ color: validatePassword(formData.password).hasUpperCase ? 'var(--color-success)' : 'var(--color-text-tertiary)' }}>
                        {validatePassword(formData.password).hasUpperCase ? '✓' : '○'} One uppercase letter
                      </li>
                      <li style={{ color: validatePassword(formData.password).hasLowerCase ? 'var(--color-success)' : 'var(--color-text-tertiary)' }}>
                        {validatePassword(formData.password).hasLowerCase ? '✓' : '○'} One lowercase letter
                      </li>
                      <li style={{ color: validatePassword(formData.password).hasNumber ? 'var(--color-success)' : 'var(--color-text-tertiary)' }}>
                        {validatePassword(formData.password).hasNumber ? '✓' : '○'} One number
                      </li>
                      <li style={{ color: validatePassword(formData.password).hasSpecial ? 'var(--color-success)' : 'var(--color-text-tertiary)' }}>
                        {validatePassword(formData.password).hasSpecial ? '✓' : '○'} One special character
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: 'var(--space-md)' }}>
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
                  Confirm Password
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
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Re-enter your password"
                    aria-required="true"
                    style={{
                      width: '100%',
                      padding: 'var(--space-md)',
                      paddingLeft: 'calc(var(--space-md) * 2 + 18px)',
                      paddingRight: 'calc(var(--space-md) * 2 + 18px)',
                      fontSize: 'var(--text-base)',
                      color: 'var(--color-text-primary)',
                      background: 'var(--color-bg-base)',
                      border: `1px solid ${errors.confirmPassword ? 'var(--color-error)' : 'var(--color-border-subtle)'}`,
                      borderRadius: 'var(--radius-lg)',
                      transition: 'all var(--transition-fast)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-accent)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-accent-subtle)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = errors.confirmPassword ? 'var(--color-error)' : 'var(--color-border-subtle)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: 'var(--space-md)',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 'var(--space-xs)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff style={{ width: '18px', height: '18px', color: 'var(--color-text-tertiary)' }} />
                    ) : (
                      <Eye style={{ width: '18px', height: '18px', color: 'var(--color-text-tertiary)' }} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-error)',
                    marginTop: 'var(--space-xs)',
                    margin: 0,
                  }}>
                    {errors.confirmPassword}
                  </p>
                )}
                {!errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-success)',
                    marginTop: 'var(--space-xs)',
                    margin: 0,
                  }}>
                    ✓ Passwords match
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <label
                  htmlFor="role"
                  style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-xs)',
                  }}
                >
                  I am a...
                </label>
                <select
                  id="role"
                  aria-required="true"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 'var(--space-md)',
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
                >
                  <option value="PARENT">Parent</option>
                  <option value="STUDENT">Student</option>
                </select>
              </div>

              {/* Grade Level (conditional) */}
              {formData.role === 'STUDENT' && (
                <div style={{ marginBottom: 'var(--space-lg)' }}>
                  <label
                    htmlFor="gradeLevel"
                    style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--weight-medium)',
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--space-xs)',
                    }}
                  >
                    Grade Level
                  </label>
                  <select
                    id="gradeLevel"
                    aria-required="true"
                    value={formData.gradeLevel}
                    onChange={(e) => setFormData({ ...formData, gradeLevel: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: 'var(--space-md)',
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
                  >
                    <option value="0">Kindergarten</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}th Grade
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                  marginTop: formData.role !== 'STUDENT' ? 'var(--space-lg)' : 0,
                }}
                aria-busy={isLoading}
                aria-label={isLoading ? 'Creating account, please wait' : 'Create your account'}
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            {/* Sign In Link */}
            <div style={{ marginTop: 'var(--space-lg)', textAlign: 'center' }}>
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
                    textDecoration: 'none',
                  }}
                >
                  Sign in
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
                By creating an account, you agree to our{' '}
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
              Why choose LearnAI Academy?
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
                  <Zap style={{ width: '24px', height: '24px', color: 'var(--color-accent)' }} />
                </div>
                <div>
                  <h3 style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-2xs)',
                  }}>
                    AI-Powered Learning
                  </h3>
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                    margin: 0,
                  }}>
                    Advanced AI technology personalizes lessons to match your child's unique learning style
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
                  <CheckCircle style={{ width: '24px', height: '24px', color: 'var(--color-accent)' }} />
                </div>
                <div>
                  <h3 style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-2xs)',
                  }}>
                    Comprehensive Curriculum
                  </h3>
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                    margin: 0,
                  }}>
                    Full coverage of Math, English, Science, and more for grades K-12
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
                  <Shield style={{ width: '24px', height: '24px', color: 'var(--color-accent)' }} />
                </div>
                <div>
                  <h3 style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-2xs)',
                  }}>
                    Safe & Secure
                  </h3>
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                    margin: 0,
                  }}>
                    Privacy-first platform with enterprise-grade security for your family
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{
              marginTop: 'var(--space-2xl)',
              padding: 'var(--space-lg)',
              background: 'var(--color-bg-base)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border-subtle)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 'var(--space-lg)',
            }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  fontSize: 'var(--text-3xl)',
                  fontWeight: 'var(--weight-bold)',
                  color: 'var(--color-accent)',
                  marginBottom: 'var(--space-2xs)',
                }}>
                  10K+
                </p>
                <p style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-secondary)',
                  margin: 0,
                }}>
                  Active Students
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  fontSize: 'var(--text-3xl)',
                  fontWeight: 'var(--weight-bold)',
                  color: 'var(--color-accent)',
                  marginBottom: 'var(--space-2xs)',
                }}>
                  95%
                </p>
                <p style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-secondary)',
                  margin: 0,
                }}>
                  Satisfaction Rate
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  fontSize: 'var(--text-3xl)',
                  fontWeight: 'var(--weight-bold)',
                  color: 'var(--color-accent)',
                  marginBottom: 'var(--space-2xs)',
                }}>
                  50+
                </p>
                <p style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-secondary)',
                  margin: 0,
                }}>
                  Subjects
                </p>
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
