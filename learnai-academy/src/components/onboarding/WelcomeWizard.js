'use client';

import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Sparkles, Target, BookOpen } from 'lucide-react';

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to LearnAI Academy!',
    description: 'Your personalized AI tutoring journey starts here.',
    icon: Sparkles,
    content: (
      <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
        <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
          We'll help you set up your learning profile in just a few steps.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-md)',
          marginTop: 'var(--space-xl)',
        }}>
          {[
            { icon: Target, text: 'Set Goals' },
            { icon: BookOpen, text: 'Choose Subjects' },
            { icon: Sparkles, text: 'Start Learning' },
          ].map((item, i) => (
            <div key={i} style={{
              padding: 'var(--space-lg)',
              background: 'var(--color-bg-subtle)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-sm)',
            }}>
              <item.icon style={{ width: '32px', height: '32px', color: 'var(--color-accent)' }} />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'grade',
    title: 'What grade are you in?',
    description: 'This helps us personalize your learning experience.',
    icon: BookOpen,
    content: (
      <div style={{ padding: 'var(--space-xl)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 'var(--space-sm)',
        }}>
          {Array.from({ length: 13 }, (_, i) => (
            <button
              key={i}
              className="btn btn-secondary"
              style={{
                padding: 'var(--space-md)',
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--weight-semibold)',
              }}
            >
              {i === 0 ? 'K' : i}
            </button>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'subjects',
    title: 'What would you like to learn?',
    description: 'Select all subjects you\'re interested in.',
    icon: Target,
    content: (
      <div style={{ padding: 'var(--space-xl)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 'var(--space-md)',
        }}>
          {['Math', 'English', 'Science', 'Reading', 'Writing', 'Coding'].map((subject) => (
            <button
              key={subject}
              className="btn btn-secondary"
              style={{
                padding: 'var(--space-lg)',
                fontSize: 'var(--text-base)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-sm)',
              }}
            >
              <Check style={{ width: '20px', height: '20px' }} />
              {subject}
            </button>
          ))}
        </div>
      </div>
    ),
  },
];

export default function WelcomeWizard({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const step = steps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onComplete?.({ grade: selectedGrade, subjects: selectedSubjects });
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: 'var(--space-lg)',
      }}
    >
      <div
        className="animate-scale-in"
        style={{
          background: 'var(--color-bg-elevated)',
          borderRadius: 'var(--radius-2xl)',
          border: '1px solid var(--color-border-subtle)',
          boxShadow: 'var(--shadow-xl)',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        {/* Progress bar */}
        <div
          style={{
            height: '4px',
            background: 'var(--color-bg-muted)',
            position: 'relative',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              background: 'var(--color-accent)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Header */}
        <div style={{
          padding: 'var(--space-2xl)',
          borderBottom: '1px solid var(--color-border-subtle)',
          textAlign: 'center',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-accent-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginInline: 'auto',
            marginBottom: 'var(--space-md)',
          }}>
            <Icon style={{ width: '32px', height: '32px', color: 'var(--color-accent)' }} />
          </div>
          <h2 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-sm)',
          }}>
            {step.title}
          </h2>
          <p style={{
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-secondary)',
          }}>
            {step.description}
          </p>
        </div>

        {/* Content */}
        <div style={{ minHeight: '300px' }}>
          {step.content}
        </div>

        {/* Footer */}
        <div style={{
          padding: 'var(--space-xl)',
          borderTop: '1px solid var(--color-border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <button
            onClick={handleBack}
            disabled={isFirstStep}
            className="btn btn-ghost"
            style={{
              opacity: isFirstStep ? 0.5 : 1,
              cursor: isFirstStep ? 'not-allowed' : 'pointer',
            }}
          >
            <ArrowLeft style={{ width: '20px', height: '20px' }} />
            Back
          </button>

          <div style={{
            display: 'flex',
            gap: 'var(--space-2xs)',
          }}>
            {steps.map((_, i) => (
              <div
                key={i}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: 'var(--radius-full)',
                  background: i === currentStep ? 'var(--color-accent)' : 'var(--color-bg-muted)',
                  transition: 'background var(--transition-fast)',
                }}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="btn btn-primary"
          >
            {isLastStep ? 'Get Started' : 'Next'}
            <ArrowRight style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}

