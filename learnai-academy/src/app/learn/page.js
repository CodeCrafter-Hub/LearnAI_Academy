'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import Header from '@/components/layout/Header';
import ChatInterface from '@/components/learning/ChatInterface';
import { Home, X } from 'lucide-react';
import Classroom, {
  ClassroomHeader,
  ClassroomWorkspace,
  SubjectClassroomCard,
} from '@/components/learning/Classroom';
import { getClassroomStyles } from '@/lib/classroomThemes';

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
    const gradeLevel = user?.students?.[0]?.gradeLevel || 5;

    return (
      <Classroom
        gradeLevel={gradeLevel}
        subject={selectedSubject.slug}
        onEnter={() => {
          addToast('Welcome to class! Ready to learn?', 'success');
        }}
      >
        <div className="flex flex-col h-screen">
          {/* Classroom Header */}
          <ClassroomHeader
            gradeLevel={gradeLevel}
            subject={selectedSubject.slug}
            topic={selectedTopic.name}
            mode={selectedMode}
            onExit={endSession}
          />

          {/* Chat Interface */}
          <div className="flex-1 overflow-hidden">
            <ChatInterface sessionId={sessionId} onSessionEnd={endSession} />
          </div>
        </div>
      </Classroom>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8" role="main">
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
          aria-label={step === 'subject' ? 'Back to Dashboard' : 'Go back to previous step'}
        >
          <Home className="w-5 h-5" aria-hidden="true" />
          {step === 'subject' ? 'Back to Dashboard' : 'Back'}
        </button>

        {/* Subject Selection */}
        {step === 'subject' && (
          <section aria-labelledby="subject-selection-heading">
            <h1 id="subject-selection-heading" className="text-3xl font-bold text-gray-800 mb-6">
              Choose Your Classroom
            </h1>
            <p className="text-gray-600 mb-8">
              Select a subject to enter its learning environment
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map(subject => (
                <SubjectClassroomCard
                  key={subject.id}
                  gradeLevel={user?.students?.[0]?.gradeLevel || 5}
                  subject={subject}
                  onClick={() => {
                    setSelectedSubject(subject);
                    setStep('topic');
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Topic Selection */}
        {step === 'topic' && selectedSubject && (() => {
          const gradeLevel = user?.students?.[0]?.gradeLevel || 5;
          const styles = getClassroomStyles(gradeLevel, selectedSubject.slug);

          return (
            <section aria-labelledby="topic-selection-heading">
              <h1 id="topic-selection-heading" className={`${styles.text.heading} font-bold text-gray-800 mb-2`}>
                {selectedSubject.name}
              </h1>
              <p className={`${styles.text.body} text-gray-600 mb-6`}>
                Choose a topic to study
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedSubject.topics?.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => {
                      setSelectedTopic(topic);
                      setStep('mode');
                    }}
                    className={`${styles.card} ${styles.spacing} hover:shadow-2xl transition-all text-left group`}
                  >
                    <h3 className={`${styles.text.heading} font-bold text-gray-800 mb-2`}>
                      {topic.name}
                    </h3>
                    <p className={`${styles.text.body} text-gray-600`}>
                      {topic.description}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          );
        })()}

        {/* Mode Selection */}
        {step === 'mode' && selectedTopic && (() => {
          const gradeLevel = user?.students?.[0]?.gradeLevel || 5;
          const styles = getClassroomStyles(gradeLevel, selectedSubject.slug);

          return (
            <section aria-labelledby="mode-selection-heading">
              <h1 id="mode-selection-heading" className={`${styles.text.heading} font-bold text-gray-800 mb-2`}>
                {selectedTopic.name}
              </h1>
              <p className={`${styles.text.body} text-gray-600 mb-6`}>
                Choose your learning mode
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => {
                    setSelectedMode('PRACTICE');
                    setStep('difficulty');
                  }}
                  className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-8 text-white shadow-lg hover:shadow-2xl transition-all text-left group"
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                    🎯
                  </div>
                  <h2 className={`${styles.text.heading} font-bold mb-3`}>
                    Practice Mode
                  </h2>
                  <p className={`${styles.text.body} text-white/90 mb-4`}>
                    Solve problems and get instant feedback
                  </p>
                  <div className={`flex flex-wrap gap-2 ${styles.text.body}`}>
                    <span className="bg-white/20 px-3 py-1 rounded-full">
                      ✓ Structured practice
                    </span>
                    <span className="bg-white/20 px-3 py-1 rounded-full">
                      ✓ Bonus points
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setSelectedMode('HELP');
                    setStep('difficulty');
                  }}
                  className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl p-8 text-white shadow-lg hover:shadow-2xl transition-all text-left group"
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                    💡
                  </div>
                  <h2 className={`${styles.text.heading} font-bold mb-3`}>
                    Help Mode
                  </h2>
                  <p className={`${styles.text.body} text-white/90 mb-4`}>
                    Ask questions and get explanations
                  </p>
                  <div className={`flex flex-wrap gap-2 ${styles.text.body}`}>
                    <span className="bg-white/20 px-3 py-1 rounded-full">
                      ✓ Open Q&A
                    </span>
                    <span className="bg-white/20 px-3 py-1 rounded-full">
                      ✓ Deep learning
                    </span>
                  </div>
                </button>
              </div>
            </section>
          );
        })()}

        {/* Difficulty Selection */}
        {step === 'difficulty' && (() => {
          const gradeLevel = user?.students?.[0]?.gradeLevel || 5;
          const styles = getClassroomStyles(gradeLevel, selectedSubject.slug);

          return (
            <section aria-labelledby="difficulty-selection-heading">
              <h1 id="difficulty-selection-heading" className={`${styles.text.heading} font-bold text-gray-800 mb-2`}>
                Choose Difficulty
              </h1>
              <p className={`${styles.text.body} text-gray-600 mb-6`}>
                {selectedTopic.name} - {selectedMode === 'PRACTICE' ? 'Practice' : 'Help'} Mode
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  onClick={() => {
                    setSelectedDifficulty('EASY');
                    startSession();
                  }}
                  disabled={isLoading}
                  className={`${styles.card} ${styles.spacing} hover:shadow-2xl transition-all text-center border-4 border-green-200 hover:border-green-400 disabled:opacity-50 group`}
                >
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                    🌱
                  </div>
                  <h3 className={`${styles.text.heading} font-bold text-gray-800 mb-2`}>
                    Easy
                  </h3>
                  <p className={`${styles.text.body} text-gray-600 mb-4`}>
                    Perfect for learning new concepts
                  </p>
                  <div className={`bg-green-100 text-green-700 px-3 py-1 rounded-full ${styles.text.body} font-medium inline-block`}>
                    Points: 1x
                  </div>
                </button>

                <button
                  onClick={() => {
                    setSelectedDifficulty('MEDIUM');
                    startSession();
                  }}
                  disabled={isLoading}
                  className={`${styles.card} ${styles.spacing} hover:shadow-2xl transition-all text-center border-4 border-yellow-200 hover:border-yellow-400 disabled:opacity-50 group`}
                >
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                    🌟
                  </div>
                  <h3 className={`${styles.text.heading} font-bold text-gray-800 mb-2`}>
                    Medium
                  </h3>
                  <p className={`${styles.text.body} text-gray-600 mb-4`}>
                    Good balance of challenge
                  </p>
                  <div className={`bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full ${styles.text.body} font-medium inline-block`}>
                    Points: 1.2x
                  </div>
                </button>

                <button
                  onClick={() => {
                    setSelectedDifficulty('HARD');
                    startSession();
                  }}
                  disabled={isLoading}
                  className={`${styles.card} ${styles.spacing} hover:shadow-2xl transition-all text-center border-4 border-red-200 hover:border-red-400 disabled:opacity-50 group`}
                >
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                    🔥
                  </div>
                  <h3 className={`${styles.text.heading} font-bold text-gray-800 mb-2`}>
                    Hard
                  </h3>
                  <p className={`${styles.text.body} text-gray-600 mb-4`}>
                    Maximum challenge
                  </p>
                  <div className={`bg-red-100 text-red-700 px-3 py-1 rounded-full ${styles.text.body} font-medium inline-block`}>
                    Points: 1.5x
                  </div>
                </button>
              </div>
            </section>
          );
        })()}

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
