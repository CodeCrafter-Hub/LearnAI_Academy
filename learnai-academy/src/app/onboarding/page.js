'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { ArrowRight, GraduationCap, Sparkles } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gradeLevel: 5,
    favoriteSubjects: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const subjects = [
    { id: 'math', name: 'Math', emoji: '🔢' },
    { id: 'english', name: 'English', emoji: '📚' },
    { id: 'science', name: 'Science', emoji: '🔬' },
    { id: 'reading', name: 'Reading', emoji: '📖' },
    { id: 'writing', name: 'Writing', emoji: '✍️' },
    { id: 'coding', name: 'Coding', emoji: '💻' },
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
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));

      // Create student profile
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          gradeLevel: formData.gradeLevel,
          parentId: userData.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create student profile');
      }

      const data = await response.json();
      
      // Update user data
      const updatedUser = {
        ...userData,
        students: [data.student],
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

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
                  className={`p-6 rounded-xl border-2 transition-all ${
                    formData.favoriteSubjects.includes(subject.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-4xl mb-2">{subject.emoji}</div>
                  <div className="font-medium text-gray-800">{subject.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Ready to Learn */}
        {step === 3 && (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              You're all set!
            </h1>
            <p className="text-gray-600 mb-8">
              Your personalized learning journey is ready to begin.
            </p>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2">What's Next?</h3>
              <ul className="text-left space-y-2 text-sm opacity-90">
                <li>✓ Explore subjects and topics</li>
                <li>✓ Start your first learning session</li>
                <li>✓ Earn achievements as you learn</li>
                <li>✓ Track your progress</li>
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

