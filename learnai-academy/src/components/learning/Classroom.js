'use client';

import { useEffect, useState } from 'react';
import {
  getClassroomStyles,
  getSubjectClassroom,
  getGradeTheme,
  getEncouragementMessage,
} from '@/lib/classroomThemes';

/**
 * Subject-Specific Classroom Environment Component
 * Creates an immersive, age-appropriate learning space
 */
export default function Classroom({ gradeLevel, subject, children, onEnter }) {
  const [isEntering, setIsEntering] = useState(true);
  const classroom = getSubjectClassroom(subject);
  const gradeTheme = getGradeTheme(gradeLevel);
  const styles = getClassroomStyles(gradeLevel, subject);

  useEffect(() => {
    // Classroom entrance animation
    const timer = setTimeout(() => {
      setIsEntering(false);
      if (onEnter) onEnter();
    }, 800);

    return () => clearTimeout(timer);
  }, [onEnter]);

  return (
    <div className={`${styles.container} transition-all duration-500`}>
      {/* Classroom Door Animation (entrance) */}
      {isEntering && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 animate-fadeOut">
          <div className="text-center text-white animate-pulse">
            <div className="text-8xl mb-6">{classroom.icon}</div>
            <h2 className="text-4xl font-bold mb-4">
              Welcome to {classroom.name} Class!
            </h2>
            <div className="flex gap-3 justify-center text-5xl">
              {classroom.classroom.elements.slice(0, 3).map((element, i) => (
                <span
                  key={i}
                  className="animate-bounce"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {element}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Classroom Background Pattern */}
      <ClassroomBackground classroom={classroom} gradeTheme={gradeTheme} />

      {/* Main Classroom Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * Decorative Background for Classroom
 */
function ClassroomBackground({ classroom, gradeTheme }) {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10">
      {/* Floating Elements */}
      {classroom.classroom.elements.map((element, i) => (
        <FloatingElement
          key={i}
          element={element}
          index={i}
          total={classroom.classroom.elements.length}
          showAnimations={gradeTheme.style.animations !== 'none'}
        />
      ))}
    </div>
  );
}

/**
 * Individual Floating Classroom Element
 */
function FloatingElement({ element, index, total, showAnimations }) {
  const positions = [
    { top: '10%', left: '5%' },
    { top: '15%', right: '8%' },
    { top: '40%', left: '3%' },
    { top: '60%', right: '5%' },
    { top: '80%', left: '10%' },
    { bottom: '10%', right: '15%' },
  ];

  const position = positions[index % positions.length];
  const delay = index * 0.5;

  return (
    <div
      className={`absolute text-6xl ${showAnimations ? 'animate-float' : ''}`}
      style={{
        ...position,
        animationDelay: `${delay}s`,
        opacity: 0.3,
      }}
    >
      {element}
    </div>
  );
}

/**
 * Subject-Specific Classroom Header
 */
export function ClassroomHeader({ gradeLevel, subject, topic, mode, onExit }) {
  const classroom = getSubjectClassroom(subject);
  const styles = getClassroomStyles(gradeLevel, subject);

  return (
    <header className={`${styles.header} p-6`} role="banner">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Left: Subject Info */}
          <div className="flex items-center gap-4">
            <div className="text-5xl">{classroom.icon}</div>
            <div>
              <h1 className={`${styles.text.heading} font-bold mb-1`}>
                {classroom.name} Class
              </h1>
              {topic && (
                <p className={`${styles.text.body} opacity-90`}>
                  Today's Topic: {topic}
                </p>
              )}
              {mode && (
                <p className="text-sm opacity-75">
                  {mode === 'PRACTICE' ? '🎯 Practice Mode' : '💡 Help Mode'}
                </p>
              )}
            </div>
          </div>

          {/* Right: Exit Button */}
          {onExit && (
            <button
              onClick={onExit}
              className="bg-white/20 hover:bg-white/30 rounded-lg px-6 py-3 font-semibold transition-all transform hover:scale-105"
            >
              Exit Class
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

/**
 * Classroom Workspace - Main learning area
 */
export function ClassroomWorkspace({ gradeLevel, subject, children }) {
  const styles = getClassroomStyles(gradeLevel, subject);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className={`${styles.card} ${styles.spacing} min-h-[600px]`}>
        {children}
      </div>
    </div>
  );
}

/**
 * Classroom Encouragement Display
 */
export function ClassroomEncouragement({ gradeLevel, type = 'start' }) {
  const messages = getEncouragementMessage(gradeLevel, type);
  const message = Array.isArray(messages)
    ? messages[Math.floor(Math.random() * messages.length)]
    : messages;

  const gradeTheme = getGradeTheme(gradeLevel);

  if (gradeTheme.voiceEncouragement === 'minimal' && type !== 'complete') {
    return null;
  }

  return (
    <div className="text-center py-4">
      <p
        className={`font-semibold ${
          gradeTheme.style.fontSize === 'large' ? 'text-2xl' : 'text-lg'
        }`}
      >
        {message}
      </p>
    </div>
  );
}

/**
 * Subject Selection Card with Grade-Appropriate Styling
 */
export function SubjectClassroomCard({ gradeLevel, subject, onClick }) {
  const classroom = getSubjectClassroom(subject.slug);
  const styles = getClassroomStyles(gradeLevel, subject.slug);

  return (
    <button
      onClick={onClick}
      className={`${styles.card} ${styles.spacing} hover:shadow-2xl transition-all transform hover:scale-105 text-left w-full group`}
    >
      {/* Subject Icon */}
      <div className="flex items-start justify-between mb-4">
        <div className={`${classroom.color} ${styles.card} p-4 group-hover:scale-110 transition-transform`}>
          <span className="text-5xl">{classroom.icon}</span>
        </div>
      </div>

      {/* Subject Name */}
      <h3 className={`${styles.text.heading} font-bold text-gray-800 mb-3`}>
        {classroom.name}
      </h3>

      {/* Subject Description */}
      <p className={`${styles.text.body} text-gray-600 mb-4`}>
        {subject.description || `Learn ${classroom.name} in a fun way!`}
      </p>

      {/* Decorative Elements */}
      <div className="flex gap-2 text-2xl">
        {classroom.classroom.elements.slice(0, 4).map((element, i) => (
          <span key={i} className="opacity-40 group-hover:opacity-100 transition-opacity">
            {element}
          </span>
        ))}
      </div>

      {/* Enter Classroom Indicator */}
      <div className={`mt-4 ${classroom.color} bg-opacity-10 border-2 ${classroom.borderColor} rounded-lg p-3 text-center font-semibold`}>
        Enter {classroom.name} Classroom →
      </div>
    </button>
  );
}
