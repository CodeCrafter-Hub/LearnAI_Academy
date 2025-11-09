'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight, GraduationCap, Sparkles } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { user, refreshUser, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState(1);

  // Redirect admins and users who already have student profiles
  useEffect(() => {
    if (!authLoading && user) {
      // Admins don't need onboarding
      if (user.role === 'ADMIN' || user.is_admin) {
        router.push('/dashboard');
        return;
      }
      // If user already has a student profile, skip onboarding
      if (user.students && user.students.length > 0) {
        router.push('/dashboard');
        return;
      }
    }
  }, [user, authLoading, router]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gradeLevel: 5,
    favoriteSubjects: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const subjects = [
    { id: 'math', name: 'Math', icon: '∑' },
    { id: 'english', name: 'English', icon: 'Aa' },
    { id: 'science', name: 'Science', icon: '⚗' },
    { id: 'reading', name: 'Reading', icon: '📕' },
    { id: 'writing', name: 'Writing', icon: '✎' },
    { id: 'coding', name: 'Coding', icon: '</>' },
  ];

  const toggleSubject = (subjectId) => {
    setFormData(prev => ({
      ...prev,
      favoriteSubjects: prev.favoriteSubjects.includes(subjectId)
        ? prev.favoriteSubjects.filter(id => id !== subjectId)
        : [...prev.favoriteSubjects, subjectId],
    }));
  };

  const handleNext = () => {
    if (step === 1 && (!formData.firstName || !formData.lastName)) {
      addToast('Please fill in your name', 'warning');
      return;
    }
    if (step === 2 && formData.favoriteSubjects.length === 0) {
      addToast('Please select at least one subject', 'warning');
      return;
    }
    setStep(step + 1);
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Create student profile
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          gradeLevel: formData.gradeLevel,
          parentId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create student profile');
      }

      await refreshUser(); // Refresh user data from server
      addToast('Profile created successfully!', 'success');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating profile:', error);
      addToast('Failed to create profile. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full mx-1 ${
                  s <= step ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="text-center text-sm text-gray-600">
            Step {step} of 3
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <GraduationCap className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome to LearnAI Academy!
              </h1>
              <p className="text-gray-600">
                Let's set up your learning profile
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your first name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your last name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade Level
              </label>
              <select
                value={formData.gradeLevel}
                onChange={(e) => setFormData({ ...formData, gradeLevel: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="0">Kindergarten</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Grade {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Favorite Subjects */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Sparkles className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                What are you interested in?
              </h1>
              <p className="text-gray-600">
                Select your favorite subjects (you can change this later)
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => toggleSubject(subject.id)}
                  style={{
                    padding: 'var(--space-lg)',
                    borderRadius: 'var(--radius-xl)',
                    border: formData.favoriteSubjects.includes(subject.id)
                      ? '2px solid var(--color-accent)'
                      : '2px solid var(--color-border-subtle)',
                    background: formData.favoriteSubjects.includes(subject.id)
                      ? 'var(--color-accent-subtle)'
                      : 'var(--color-bg-base)',
                    transition: 'all var(--transition-base)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!formData.favoriteSubjects.includes(subject.id)) {
                      e.currentTarget.style.borderColor = 'var(--color-border-muted)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!formData.favoriteSubjects.includes(subject.id)) {
                      e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
                    }
                  }}
                >
                  <div style={{
                    fontSize: 'var(--text-4xl)',
                    marginBottom: 'var(--space-xs)',
                    color: 'var(--color-text-primary)',
                  }}>
                    {subject.icon}
                  </div>
                  <div style={{
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--color-text-primary)',
                  }}>
                    {subject.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Ready to Learn */}
        {step === 3 && (
          <div className="text-center space-y-6">
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-success-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginInline: 'auto',
              marginBottom: 'var(--space-md)',
            }}>
              <svg
                style={{ width: '48px', height: '48px', color: 'var(--color-success)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              You're all set!
            </h1>
            <p className="text-gray-600 mb-8">
              Your personalized learning journey is ready to begin.
            </p>
            <div style={{
              background: 'var(--color-accent-subtle)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-lg)',
            }}>
              <h3 style={{
                fontWeight: 'var(--weight-bold)',
                fontSize: 'var(--text-lg)',
                marginBottom: 'var(--space-sm)',
                color: 'var(--color-text-primary)',
              }}>
                What's Next?
              </h3>
              <ul style={{
                textAlign: 'left',
                listStyle: 'none',
                padding: 0,
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
              }}>
                <li style={{ marginBottom: 'var(--space-xs)', display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                  <svg style={{ width: '16px', height: '16px', color: 'var(--color-success)', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Explore subjects and topics
                </li>
                <li style={{ marginBottom: 'var(--space-xs)', display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                  <svg style={{ width: '16px', height: '16px', color: 'var(--color-success)', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Start your first learning session
                </li>
                <li style={{ marginBottom: 'var(--space-xs)', display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                  <svg style={{ width: '16px', height: '16px', color: 'var(--color-success)', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Earn achievements as you learn
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                  <svg style={{ width: '16px', height: '16px', color: 'var(--color-success)', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Track your progress
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}
          <div className="flex-1" />
          {step < 3 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={isLoading}
              className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating Profile...' : 'Start Learning'}
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

