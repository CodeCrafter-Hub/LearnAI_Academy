'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import ChatInterface from '@/components/learning/ChatInterface';
import SubjectSelector from '@/components/learning/SubjectSelector';
import TopicSelector from '@/components/learning/TopicSelector';
import ModeSelector from '@/components/learning/ModeSelector';
import DifficultySelector from '@/components/learning/DifficultySelector';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Home, X } from 'lucide-react';

function LearnPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState('subject'); // subject, topic, mode, difficulty, session
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    // Check if subject is pre-selected from URL
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
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));

      const response = await fetch(
        `/api/subjects?gradeLevel=${userData.students[0].gradeLevel}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const startSession = async (difficulty) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));
      const studentId = userData.students[0].id;

      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId,
          subjectId: selectedSubject.id,
          topicId: selectedTopic.id,
          mode: selectedMode,
          difficulty,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSessionId(data.session.id);
        setStep('session');
      }
    } catch (error) {
      console.error('Error starting session:', error);
      alert('Failed to start session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const endSession = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/sessions/${sessionId}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error ending session:', error);
      router.push('/dashboard');
    }
  };

  const handleBack = () => {
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
  };

  // Session View (Chat Interface)
  if (step === 'session' && sessionId) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Session Header */}
        <div className={`${selectedSubject.color} text-white p-4 shadow-md`}>
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{selectedTopic.name}</h2>
              <p className="text-sm opacity-90">
                {selectedMode === 'PRACTICE' ? '🎯 Practice' : '💡 Help'} • {selectedMode}
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

  // Selection Flow View
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-6 transition-colors"
        >
          <Home className="w-5 h-5" />
          {step === 'subject' ? 'Back to Dashboard' : 'Back'}
        </button>

        {/* Subject Selection */}
        {step === 'subject' && (
          <SubjectSelector
            subjects={subjects}
            onSelect={(subject) => {
              setSelectedSubject(subject);
              setStep('topic');
            }}
          />
        )}

        {/* Topic Selection */}
        {step === 'topic' && selectedSubject && (
          <TopicSelector
            subject={selectedSubject}
            onSelect={(topic) => {
              setSelectedTopic(topic);
              setStep('mode');
            }}
          />
        )}

        {/* Mode Selection */}
        {step === 'mode' && selectedTopic && (
          <ModeSelector
            topicName={selectedTopic.name}
            onSelect={(mode) => {
              setSelectedMode(mode);
              setStep('difficulty');
            }}
          />
        )}

        {/* Difficulty Selection */}
        {step === 'difficulty' && selectedMode && (
          <DifficultySelector
            topicName={selectedTopic.name}
            mode={selectedMode}
            onSelect={startSession}
            isLoading={isLoading}
          />
        )}

        {/* Loading State */}
        {isLoading && <LoadingSpinner message="Starting your session..." />}
      </div>
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner message="Loading..." />
      </div>
    }>
      <LearnPageContent />
    </Suspense>
  );
}
