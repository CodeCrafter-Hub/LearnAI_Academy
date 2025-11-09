'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import Header from '@/components/layout/Header';
import AdaptiveSidebar from '@/components/layout/AdaptiveSidebar';
import ChatInterface from '@/components/learning/ChatInterface';
import AdaptiveClassroom from '@/components/learning/AdaptiveClassroom';
import BreakReminder from '@/components/study/BreakReminder';
import FocusMode, { FocusModeToggle } from '@/components/study/FocusMode';
import SubjectSelector from '@/components/learning/SubjectSelector';
import TopicSelector from '@/components/learning/TopicSelector';
import ModeSelector from '@/components/learning/ModeSelector';
import DifficultySelector from '@/components/learning/DifficultySelector';
import EnhancedProgressIndicator from '@/components/learning/EnhancedProgressIndicator';
import PageTransition from '@/components/learning/PageTransition';
import EnhancedSessionHeader from '@/components/learning/EnhancedSessionHeader';
import GradePasswordPrompt from '@/components/learning/GradePasswordPrompt';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { ArrowLeft, X, TrendingUp } from 'lucide-react';
import ClassroomEvaluationWidget from '@/components/ui/ClassroomEvaluationWidget';

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
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [requestedGrade, setRequestedGrade] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [focusModeEnabled, setFocusModeEnabled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const checkGradeAccess = (gradeLevel) => {
    // Check if grade is already unlocked in this session
    const unlockedGrades = JSON.parse(sessionStorage.getItem('unlockedGrades') || '[]');
    return unlockedGrades.includes(gradeLevel);
  };

  const loadSubjects = async (gradeLevel = null) => {
    try {
      const targetGrade = gradeLevel || user.students[0].gradeLevel;

      // Check if grade requires password and isn't unlocked
      if (targetGrade !== user.students[0].gradeLevel && !checkGradeAccess(targetGrade)) {
        setRequestedGrade(targetGrade);
        setShowPasswordPrompt(true);
        return;
      }

      const response = await fetch(
        `/api/subjects?gradeLevel=${targetGrade}`,
        { credentials: 'include' }
      );

      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      addToast('Failed to load subjects', 'error');
    }
  };

  const handlePasswordSuccess = () => {
    setShowPasswordPrompt(false);
    addToast(`Grade ${requestedGrade === 0 ? 'Kindergarten' : requestedGrade} unlocked!`, 'success');
    loadSubjects(requestedGrade);
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
    // Set session start time if not set
    if (!sessionStartTime) {
      setSessionStartTime(new Date().toISOString());
    }

    return (
      <FocusMode enabled={focusModeEnabled} onToggle={() => setFocusModeEnabled(!focusModeEnabled)}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--color-bg-base)' }}>
          {/* Break Reminder */}
          {sessionStartTime && (
            <BreakReminder
              sessionStartTime={sessionStartTime}
              gradeLevel={user?.students?.[0]?.gradeLevel || 5}
              onBreakStart={(duration) => {
                addToast(`Taking a ${duration}-minute break. Great work!`, 'info');
              }}
            />
          )}

          {/* Enhanced Session Header */}
          <EnhancedSessionHeader
            topicName={selectedTopic.name}
            mode={selectedMode}
            subjectName={selectedSubject?.name}
            gradeLevel={user?.students?.[0]?.gradeLevel || 5}
            onEndSession={endSession}
            onToggleFocus={() => setFocusModeEnabled(!focusModeEnabled)}
            focusModeEnabled={focusModeEnabled}
            sessionStartTime={sessionStartTime}
          />

          {/* Adaptive Classroom */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <AdaptiveClassroom
              sessionId={sessionId}
              subjectSlug={selectedSubject?.slug}
              gradeLevel={user?.students?.[0]?.gradeLevel}
              onSessionEnd={endSession}
            />
          </div>
        </div>
      </FocusMode>
    );
  }

  // Selection Flow View
  const gradeLevel = user?.students?.[0]?.gradeLevel || 5;
  const isSelectionPhase = step !== 'session';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)', display: 'flex' }}>
      {/* Adaptive Sidebar - Only show during selection phase */}
      {isSelectionPhase && (
        <AdaptiveSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          gradeLevel={gradeLevel}
          showDuringLearning={false}
        />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Header />

        <main className="container" style={{ 
          paddingBlock: gradeLevel <= 2 ? 'var(--space-2xl)' : 'var(--space-xl)', 
          flex: 1,
          maxWidth: gradeLevel <= 2 ? '1200px' : '1400px',
          marginInline: 'auto',
          width: '100%',
        }}>
        {/* Breadcrumb Navigation */}
        <nav style={{ 
          marginBottom: gradeLevel <= 2 ? 'var(--space-xl)' : 'var(--space-lg)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-sm)',
        }}>
          <button
            onClick={handleBack}
            className="btn btn-ghost"
            style={{ 
              padding: gradeLevel <= 2 ? 'var(--space-sm) var(--space-md)' : 'var(--space-xs) var(--space-sm)',
              fontSize: gradeLevel <= 2 ? 'var(--text-base)' : 'var(--text-sm)',
              minHeight: gradeLevel <= 2 ? '48px' : '40px',
            }}
          >
            <ArrowLeft size={gradeLevel <= 2 ? 20 : 16} />
            {step === 'subject' ? 'Dashboard' : 'Back'}
          </button>

          {/* Grade Selector for Testing */}
          {step === 'subject' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <label style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                fontWeight: 'var(--weight-medium)',
              }}>
                Test Grade:
              </label>
              <select
                onChange={(e) => loadSubjects(parseInt(e.target.value))}
                defaultValue={user?.students[0]?.gradeLevel || 5}
                style={{
                  padding: 'var(--space-xs) var(--space-sm)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-primary)',
                  background: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                }}
              >
                <option value="0">Kindergarten</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>Grade {i + 1}</option>
                ))}
              </select>
              <button
                onClick={() => router.push(`/learn/grade/${user?.students?.[0]?.gradeLevel || 5}`)}
                className="btn btn-ghost flex items-center gap-2"
                style={{ fontSize: 'var(--text-sm)' }}
              >
                <TrendingUp className="w-4 h-4" />
                Grade Hub
              </button>
            </div>
          )}
        </nav>

        {/* Enhanced Progress Indicator */}
        <EnhancedProgressIndicator 
          currentStep={step} 
          gradeLevel={gradeLevel}
        />

        {/* Classroom Evaluation Widget - Only on subject selection */}
        {step === 'subject' && (
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <ClassroomEvaluationWidget gradeLevel={user?.students?.[0]?.gradeLevel || 5} />
          </div>
        )}

        {/* Subject Selection */}
        {step === 'subject' && (
          <PageTransition step={step} direction="forward">
            <SubjectSelector
              subjects={subjects}
              gradeLevel={gradeLevel}
              onSelect={(subject) => {
                setSelectedSubject(subject);
                setStep('topic');
              }}
            />
          </PageTransition>
        )}

        {/* Topic Selection */}
        {step === 'topic' && selectedSubject && (
          <PageTransition step={step} direction="forward">
            <TopicSelector
              subject={selectedSubject}
              gradeLevel={gradeLevel}
              onSelect={(topic) => {
                setSelectedTopic(topic);
                setStep('mode');
              }}
            />
          </PageTransition>
        )}

        {/* Mode Selection */}
        {step === 'mode' && selectedTopic && (
          <PageTransition step={step} direction="forward">
            <ModeSelector
              topicName={selectedTopic.name}
              gradeLevel={gradeLevel}
              onSelect={(mode) => {
                setSelectedMode(mode);
                setStep('difficulty');
              }}
            />
          </PageTransition>
        )}

        {/* Difficulty Selection */}
        {step === 'difficulty' && selectedMode && (
          <PageTransition step={step} direction="forward">
            <DifficultySelector
              topicName={selectedTopic.name}
              mode={selectedMode}
              gradeLevel={gradeLevel}
              onSelect={startSession}
              isLoading={isLoading}
            />
          </PageTransition>
        )}

        {/* Loading State */}
        {isLoading && (
          <div style={{ marginTop: 'var(--space-xl)' }}>
            <LoadingSpinner message="Starting your session..." />
          </div>
        )}
        </main>
      </div>

      {/* Password Prompt Modal */}
      {showPasswordPrompt && requestedGrade !== null && (
        <GradePasswordPrompt
          gradeLevel={requestedGrade}
          onSuccess={handlePasswordSuccess}
          onCancel={() => {
            setShowPasswordPrompt(false);
            setRequestedGrade(null);
          }}
        />
      )}
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
