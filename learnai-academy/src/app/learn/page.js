'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import Header from '@/components/layout/Header';
import ChatInterface from '@/components/learning/ChatInterface';
import { Home, X } from 'lucide-react';

function LearnPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [step, setStep] = useState('subject'); // subject, topic, mode, difficulty, session
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        loadSubjects();
      }
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    const subjectSlug = searchParams.get('subject');
    if (subjectSlug && subjects.length > 0) {
      const subject = subjects.find(s => s.slug === subjectSlug);
      if (subject) {
        setSelectedSubject(subject);
        setStep('topic');
      }
    }
  }, [subjects, searchParams]);

  const loadSubjects = async () => {
    try {
      const response = await fetch(
        `/api/subjects?gradeLevel=${user.students[0].gradeLevel}`,
        { credentials: 'include' }
      );

      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      addToast('Failed to load subjects', 'error');
    }
  };

  const startSession = async () => {
    setIsLoading(true);
    try {
      const studentId = user.students[0].id;

      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          studentId,
          subjectId: selectedSubject.id,
          topicId: selectedTopic.id,
          mode: selectedMode,
          difficulty: selectedDifficulty,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSessionId(data.session.id);
        setStep('session');
        addToast('Session started! Let\'s learn!', 'success');
      } else {
        addToast('Failed to start session', 'error');
      }
    } catch (error) {
      addToast('Failed to start session. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const endSession = async () => {
    try {
      await fetch(`/api/sessions/${sessionId}/end`, {
        method: 'POST',
        credentials: 'include',
      });

      addToast('Great work! Session completed.', 'success');
      router.push('/dashboard');
    } catch (error) {
      router.push('/dashboard');
    }
  };

  if (step === 'session' && sessionId) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Session Header */}
        <div className={`${selectedSubject.color} text-white p-4 shadow-md`}>
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{selectedTopic.name}</h2>
              <p className="text-sm opacity-90">
                {selectedMode === 'PRACTICE' ? '🎯 Practice' : '💡 Help'} • {selectedDifficulty}
              </p>
            </div>
            <button
              onClick={endSession}
              className="bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 font-medium transition-colors flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              End Session
            </button>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface sessionId={sessionId} onSessionEnd={endSession} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => {
            if (step === 'subject') {
              router.push('/dashboard');
            } else if (step === 'topic') {
              setStep('subject');
              setSelectedSubject(null);
            } else if (step === 'mode') {
              setStep('topic');
              setSelectedTopic(null);
            } else if (step === 'difficulty') {
              setStep('mode');
              setSelectedMode(null);
            }
          }}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-6"
        >
          <Home className="w-5 h-5" />
          {step === 'subject' ? 'Back to Dashboard' : 'Back'}
        </button>

        {/* Subject Selection */}
        {step === 'subject' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Choose a Subject
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjects.map(subject => (
                <button
                  key={subject.id}
                  onClick={() => {
                    setSelectedSubject(subject);
                    setStep('topic');
                  }}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all text-left"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {subject.name}
                  </h3>
                  <p className="text-sm text-gray-600">{subject.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Topic Selection */}
        {step === 'topic' && selectedSubject && (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {selectedSubject.name}
            </h1>
            <p className="text-gray-600 mb-6">Choose a topic to study</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedSubject.topics?.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => {
                    setSelectedTopic(topic);
                    setStep('mode');
                  }}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all text-left"
                >
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {topic.name}
                  </h3>
                  <p className="text-sm text-gray-600">{topic.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mode Selection */}
        {step === 'mode' && selectedTopic && (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {selectedTopic.name}
            </h1>
            <p className="text-gray-600 mb-6">Choose your learning mode</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => {
                  setSelectedMode('PRACTICE');
                  setStep('difficulty');
                }}
                className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transition-all text-left"
              >
                <div className="text-5xl mb-4">🎯</div>
                <h2 className="text-2xl font-bold mb-3">Practice Mode</h2>
                <p className="text-white/90 mb-4">
                  Solve problems and get instant feedback
                </p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full">✓ Structured practice</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">✓ Bonus points</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedMode('HELP');
                  setStep('difficulty');
                }}
                className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transition-all text-left"
              >
                <div className="text-5xl mb-4">💡</div>
                <h2 className="text-2xl font-bold mb-3">Help Mode</h2>
                <p className="text-white/90 mb-4">
                  Ask questions and get explanations
                </p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full">✓ Open Q&A</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">✓ Deep learning</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Difficulty Selection */}
        {step === 'difficulty' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Choose Difficulty
            </h1>
            <p className="text-gray-600 mb-6">
              {selectedTopic.name} - {selectedMode === 'PRACTICE' ? 'Practice' : 'Help'} Mode
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setSelectedDifficulty('EASY');
                  startSession();
                }}
                disabled={isLoading}
                className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all text-center border-4 border-green-200 hover:border-green-400 disabled:opacity-50"
              >
                <div className="text-5xl mb-3">🌱</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Easy</h3>
                <p className="text-gray-600 mb-4">Perfect for learning new concepts</p>
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  Points: 1x
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedDifficulty('MEDIUM');
                  startSession();
                }}
                disabled={isLoading}
                className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all text-center border-4 border-yellow-200 hover:border-yellow-400 disabled:opacity-50"
              >
                <div className="text-5xl mb-3">🌟</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Medium</h3>
                <p className="text-gray-600 mb-4">Good balance of challenge</p>
                <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                  Points: 1.2x
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedDifficulty('HARD');
                  startSession();
                }}
                disabled={isLoading}
                className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all text-center border-4 border-red-200 hover:border-red-400 disabled:opacity-50"
              >
                <div className="text-5xl mb-3">🔥</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Hard</h3>
                <p className="text-gray-600 mb-4">Maximum challenge</p>
                <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                  Points: 1.5x
                </div>
              </button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center mt-8">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Starting your session...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LearnPageContent />
    </Suspense>
  );
}
