'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import Header from '@/components/layout/Header';
import ChatInterface from '@/components/learning/ChatInterface';
import SubjectSelector from '@/components/learning/SubjectSelector';
import TopicSelector from '@/components/learning/TopicSelector';
import ModeSelector from '@/components/learning/ModeSelector';
import DifficultySelector from '@/components/learning/DifficultySelector';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { ArrowLeft, X } from 'lucide-react';

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

  const startSession = async (difficulty) => {
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
          difficulty,
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
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--color-bg-base)' }}>
        {/* Session Header - Glassy */}
        <div className="glass" style={{
          padding: 'var(--space-md)',
          borderBottom: '1px solid var(--color-border-subtle)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--z-sticky)',
        }}>
          <div className="container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <h2 style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-3xs)',
              }}>
                {selectedTopic.name}
              </h2>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
              }}>
                {selectedMode === 'PRACTICE' ? 'Practice Mode' : 'Help Mode'}
              </p>
            </div>
            <button
              onClick={endSession}
              className="btn btn-secondary"
              style={{ gap: 'var(--space-2xs)' }}
            >
              <X className="w-4 h-4" />
              End Session
            </button>
          </div>
        </div>

        {/* Chat Interface */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <ChatInterface sessionId={sessionId} onSessionEnd={endSession} />
        </div>
      </div>
    );
  }

  // Selection Flow View
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>
      <Header />

      <main className="container animate-fade-in" style={{ paddingBlock: 'var(--space-xl)' }}>
        {/* Breadcrumb Navigation */}
        <nav style={{ marginBottom: 'var(--space-lg)' }}>
          <button
            onClick={handleBack}
            className="btn btn-ghost"
            style={{ padding: 'var(--space-xs) var(--space-sm)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 'subject' ? 'Dashboard' : 'Back'}
          </button>
        </nav>

        {/* Progress Indicator */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-xs)',
          marginBottom: 'var(--space-2xl)',
          justifyContent: 'center',
          maxWidth: '480px',
          marginInline: 'auto',
        }}>
          {['subject', 'topic', 'mode', 'difficulty'].map((stepName, index) => {
            const stepIndex = ['subject', 'topic', 'mode', 'difficulty'].indexOf(step);
            const currentIndex = ['subject', 'topic', 'mode', 'difficulty'].indexOf(stepName);
            const isActive = currentIndex <= stepIndex;

            return (
              <div
                key={stepName}
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: 'var(--radius-full)',
                  background: isActive ? 'var(--color-accent)' : 'var(--color-bg-muted)',
                  transition: 'all var(--transition-base)',
                }}
              />
            );
          })}
        </div>

        {/* Subject Selection */}
        {step === 'subject' && (
          <div className="animate-fade-in">
            <SubjectSelector
              subjects={subjects}
              onSelect={(subject) => {
                setSelectedSubject(subject);
                setStep('topic');
              }}
            />
          </div>
        )}

        {/* Topic Selection */}
        {step === 'topic' && selectedSubject && (
          <div className="animate-fade-in">
            <TopicSelector
              subject={selectedSubject}
              onSelect={(topic) => {
                setSelectedTopic(topic);
                setStep('mode');
              }}
            />
          </div>
        )}

        {/* Mode Selection */}
        {step === 'mode' && selectedTopic && (
          <div className="animate-fade-in">
            <ModeSelector
              topicName={selectedTopic.name}
              onSelect={(mode) => {
                setSelectedMode(mode);
                setStep('difficulty');
              }}
            />
          </div>
        )}

        {/* Difficulty Selection */}
        {step === 'difficulty' && selectedMode && (
          <div className="animate-fade-in">
            <DifficultySelector
              topicName={selectedTopic.name}
              mode={selectedMode}
              onSelect={startSession}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div style={{ marginTop: 'var(--space-xl)' }}>
            <LoadingSpinner message="Starting your session..." />
          </div>
        )}
      </main>
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: 'var(--color-bg-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <LoadingSpinner message="Loading..." />
      </div>
    }>
      <LearnPageContent />
    </Suspense>
  );
}
