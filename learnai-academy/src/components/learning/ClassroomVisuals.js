'use client';

import { useState, useEffect } from 'react';
import { getGradeTheme, getSubjectClassroom } from '@/lib/classroomThemes';

/**
 * Grade-Subject Specific Visual Customizations
 * Creates unique, immersive visual environments for each combination
 */

/**
 * Animated Classroom Background
 */
export function AnimatedClassroomBackground({ gradeLevel, subject }) {
  const gradeTheme = getGradeTheme(gradeLevel);
  const classroom = getSubjectClassroom(subject);

  // Choose animation style based on grade
  const useAnimations = gradeTheme.style.animations !== 'none';

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Background Pattern */}
      <BackgroundPattern
        subject={subject}
        gradeLevel={gradeLevel}
        animated={useAnimations}
      />

      {/* Floating Elements */}
      {useAnimations && (
        <FloatingElements
          elements={classroom.classroom.elements}
          gradeLevel={gradeLevel}
          density={gradeLevel <= 2 ? 'high' : gradeLevel <= 5 ? 'medium' : 'low'}
        />
      )}

      {/* Ambient Effects */}
      {gradeLevel <= 5 && (
        <AmbientEffects subject={subject} gradeLevel={gradeLevel} />
      )}
    </div>
  );
}

/**
 * Subject-Specific Background Patterns
 */
function BackgroundPattern({ subject, gradeLevel, animated }) {
  const patterns = {
    math: <MathPattern gradeLevel={gradeLevel} animated={animated} />,
    reading: <ReadingPattern gradeLevel={gradeLevel} animated={animated} />,
    english: <WritingPattern gradeLevel={gradeLevel} animated={animated} />,
    science: <SciencePattern gradeLevel={gradeLevel} animated={animated} />,
    coding: <CodingPattern gradeLevel={gradeLevel} animated={animated} />,
  };

  return (
    <div className="absolute inset-0 opacity-5">
      {patterns[subject] || patterns.math}
    </div>
  );
}

/**
 * Math Classroom Pattern
 */
function MathPattern({ gradeLevel, animated }) {
  const symbols = gradeLevel <= 2
    ? ['1', '2', '3', '4', '5', '+', '-', '=']
    : gradeLevel <= 5
    ? ['×', '÷', '½', '¾', '=', '+', '-', '%']
    : gradeLevel <= 8
    ? ['π', '∑', '∞', '√', '²', '³', 'x', 'y']
    : ['∫', '∂', 'α', 'β', 'θ', '∞', '≈', '≠'];

  return (
    <div className="grid grid-cols-12 gap-8 p-8 h-full">
      {Array.from({ length: 60 }).map((_, i) => (
        <div
          key={i}
          className={`text-4xl font-bold text-blue-300 ${animated ? 'animate-pulse' : ''}`}
          style={{
            animationDelay: `${i * 0.1}s`,
            opacity: 0.3 + Math.random() * 0.3,
          }}
        >
          {symbols[Math.floor(Math.random() * symbols.length)]}
        </div>
      ))}
    </div>
  );
}

/**
 * Reading Classroom Pattern
 */
function ReadingPattern({ gradeLevel, animated }) {
  const decorations = gradeLevel <= 2
    ? ['📖', '✨', '🌟', '⭐', '💫']
    : gradeLevel <= 5
    ? ['📚', '📖', '✒️', '📝', '💡']
    : ['📚', '🖊️', '📜', '🎭', '🏛️'];

  return (
    <div className="flex flex-wrap gap-12 p-8 justify-around">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className={`text-5xl ${animated ? 'animate-float' : ''}`}
          style={{
            animationDelay: `${i * 0.2}s`,
            opacity: 0.2 + Math.random() * 0.2,
          }}
        >
          {decorations[Math.floor(Math.random() * decorations.length)]}
        </div>
      ))}
    </div>
  );
}

/**
 * Writing Classroom Pattern
 */
function WritingPattern({ gradeLevel, animated }) {
  // Lined paper effect
  return (
    <div className="h-full flex flex-col justify-around">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="w-full h-0.5 bg-gradient-to-r from-transparent via-pink-200 to-transparent"
          style={{
            opacity: i % 3 === 0 ? 0.3 : 0.1,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Science Classroom Pattern
 */
function SciencePattern({ gradeLevel, animated }) {
  const elements = gradeLevel <= 2
    ? ['🔬', '🧪', '⚗️', '🌍', '⭐', '🌙']
    : gradeLevel <= 5
    ? ['🔬', '⚗️', '🧪', '⚛️', '🔭', '🌍']
    : gradeLevel <= 8
    ? ['⚛️', '🧬', '⚗️', '🔬', '⚡', '🌋']
    : ['⚛️', '🧬', '∆H', 'H₂O', 'CO₂', 'DNA'];

  return (
    <div className="grid grid-cols-10 gap-10 p-8">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className={`text-4xl ${animated ? 'animate-bounce' : ''}`}
          style={{
            animationDelay: `${i * 0.15}s`,
            opacity: 0.2 + Math.random() * 0.2,
          }}
        >
          {elements[Math.floor(Math.random() * elements.length)]}
        </div>
      ))}
    </div>
  );
}

/**
 * Coding Classroom Pattern
 */
function CodingPattern({ gradeLevel, animated }) {
  const codeSnippets = gradeLevel <= 5
    ? ['<>', '{  }', '(  )', '[ ]', '0101', '//']
    : ['function', 'class', 'const', 'let', '=>', '{}', '[ ]', '< />'];

  return (
    <div className="font-mono text-xl grid grid-cols-8 gap-6 p-8">
      {Array.from({ length: 64 }).map((_, i) => (
        <div
          key={i}
          className={`text-cyan-300 ${animated ? 'animate-pulse' : ''}`}
          style={{
            animationDelay: `${i * 0.05}s`,
            opacity: 0.15 + Math.random() * 0.15,
          }}
        >
          {codeSnippets[Math.floor(Math.random() * codeSnippets.length)]}
        </div>
      ))}
    </div>
  );
}

/**
 * Floating Elements
 */
function FloatingElements({ elements, gradeLevel, density }) {
  const count = density === 'high' ? 12 : density === 'medium' ? 8 : 4;
  const size = gradeLevel <= 2 ? 'text-6xl' : gradeLevel <= 5 ? 'text-5xl' : 'text-4xl';

  return (
    <div className="absolute inset-0">
      {Array.from({ length: count }).map((_, i) => {
        const element = elements[i % elements.length];
        const position = getRandomPosition(i);
        const duration = 10 + Math.random() * 10;

        return (
          <div
            key={i}
            className={`absolute ${size} animate-float`}
            style={{
              ...position,
              animationDuration: `${duration}s`,
              animationDelay: `${i * 0.5}s`,
              opacity: 0.2 + Math.random() * 0.2,
            }}
          >
            {element}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Ambient Effects (sparkles, particles, etc.)
 */
function AmbientEffects({ subject, gradeLevel }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (gradeLevel > 5) return; // Only for younger students

    const interval = setInterval(() => {
      const newParticle = {
        id: Date.now(),
        left: `${Math.random() * 100}%`,
        duration: 2 + Math.random() * 3,
      };

      setParticles((prev) => [...prev.slice(-10), newParticle]);

      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, newParticle.duration * 1000);
    }, gradeLevel <= 2 ? 1000 : 2000);

    return () => clearInterval(interval);
  }, [gradeLevel]);

  const particleEmoji = {
    math: '✨',
    reading: '⭐',
    english: '✏️',
    science: '💫',
    coding: '💻',
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-sparkle"
          style={{
            left: particle.left,
            top: '-50px',
            animationDuration: `${particle.duration}s`,
          }}
        >
          <span className="text-3xl opacity-60">
            {particleEmoji[subject] || '✨'}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Classroom Decorations (Bulletin Board, Posters, etc.)
 */
export function ClassroomDecorations({ gradeLevel, subject }) {
  const decorations = getDecorationsForGrade(gradeLevel, subject);

  if (gradeLevel > 8) return null; // High schoolers get minimal decorations

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top Bulletin Board */}
      {gradeLevel <= 5 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-3/4">
          <BulletinBoard gradeLevel={gradeLevel} subject={subject} />
        </div>
      )}

      {/* Side Posters */}
      <div className="absolute left-4 top-1/4 space-y-6">
        {decorations.leftPosters.map((poster, i) => (
          <Poster key={i} {...poster} gradeLevel={gradeLevel} />
        ))}
      </div>

      <div className="absolute right-4 top-1/4 space-y-6">
        {decorations.rightPosters.map((poster, i) => (
          <Poster key={i} {...poster} gradeLevel={gradeLevel} />
        ))}
      </div>
    </div>
  );
}

/**
 * Virtual Bulletin Board
 */
function BulletinBoard({ gradeLevel, subject }) {
  const classroom = getSubjectClassroom(subject);

  return (
    <div className="bg-gradient-to-br from-yellow-100 to-orange-100 border-8 border-amber-600 rounded-lg p-6 shadow-2xl">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-amber-800">
          {classroom.icon} {classroom.name} Class {classroom.icon}
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {classroom.classroom.elements.slice(0, 6).map((element, i) => (
          <div
            key={i}
            className="bg-white rounded-lg p-4 shadow-md border-2 border-amber-300 text-center"
          >
            <div className="text-4xl mb-2">{element}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Educational Poster
 */
function Poster({ title, emoji, content, color, gradeLevel }) {
  return (
    <div
      className={`${color} p-4 rounded-lg shadow-xl border-4 border-white w-48 transform hover:scale-105 transition-all`}
    >
      <div className="text-center">
        <div className="text-5xl mb-2">{emoji}</div>
        <div className="text-lg font-bold text-white mb-2">{title}</div>
        {content && (
          <div className="text-sm text-white opacity-90">{content}</div>
        )}
      </div>
    </div>
  );
}

/**
 * Progress Display (Grade-Appropriate)
 */
export function ProgressDisplay({ gradeLevel, progress }) {
  const gradeTheme = getGradeTheme(gradeLevel);

  if (gradeLevel <= 2) {
    return <ProgressDisplayYoung progress={progress} />;
  } else if (gradeLevel <= 5) {
    return <ProgressDisplayElementary progress={progress} />;
  } else if (gradeLevel <= 8) {
    return <ProgressDisplayMiddle progress={progress} />;
  } else {
    return <ProgressDisplayHigh progress={progress} />;
  }
}

function ProgressDisplayYoung({ progress }) {
  return (
    <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl p-6 border-4 border-yellow-400 shadow-lg">
      <div className="text-center mb-4">
        <div className="text-5xl mb-2">⭐</div>
        <div className="text-3xl font-bold text-yellow-700">Your Progress!</div>
      </div>

      <div className="space-y-4">
        {/* Stars Earned */}
        <div className="bg-white rounded-2xl p-4 border-4 border-yellow-300">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">Stars</span>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(progress.points || 0, 10) }).map((_, i) => (
                <span key={i} className="text-3xl">⭐</span>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements */}
        {progress.achievements && progress.achievements.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border-4 border-purple-300">
            <div className="text-2xl font-bold mb-2">Achievements! 🎉</div>
            <div className="flex flex-wrap gap-2">
              {progress.achievements.map((achievement, i) => (
                <div key={i} className="text-4xl">
                  {achievement.emoji}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProgressDisplayElementary({ progress }) {
  return (
    <div className="bg-white rounded-2xl p-6 border-4 border-blue-300 shadow-lg">
      <div className="text-center mb-4">
        <div className="text-4xl mb-2">📊</div>
        <div className="text-2xl font-bold text-blue-700">Your Progress</div>
      </div>

      <div className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Completion</span>
            <span className="font-bold text-blue-600">
              {progress.percentComplete || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
              style={{ width: `${progress.percentComplete || 0}%` }}
            >
              {(progress.percentComplete || 0) > 10 && (
                <span className="text-white font-bold text-sm">
                  {progress.percentComplete}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-200">
            <div className="text-sm text-blue-600">Points</div>
            <div className="text-2xl font-bold text-blue-700">
              {progress.points || 0}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border-2 border-green-200">
            <div className="text-sm text-green-600">Accuracy</div>
            <div className="text-2xl font-bold text-green-700">
              {progress.accuracy || 0}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressDisplayMiddle({ progress }) {
  return (
    <div className="bg-white rounded-xl p-5 border-2 border-gray-300 shadow-md">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Progress Overview</h3>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Completion:</span>
          <span className="font-bold text-blue-600">
            {progress.percentComplete || 0}%
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-lg h-4">
          <div
            className="bg-blue-600 h-4 rounded-lg transition-all duration-500"
            style={{ width: `${progress.percentComplete || 0}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="text-center">
            <div className="text-sm text-gray-600">Points</div>
            <div className="text-lg font-bold">{progress.points || 0}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Accuracy</div>
            <div className="text-lg font-bold">{progress.accuracy || 0}%</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Streak</div>
            <div className="text-lg font-bold">{progress.streak || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressDisplayHigh({ progress }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-300">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Progress</h3>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Completion</span>
          <span className="font-semibold">{progress.percentComplete || 0}%</span>
        </div>

        <div className="w-full bg-gray-300 rounded h-2">
          <div
            className="bg-gray-700 h-2 rounded transition-all"
            style={{ width: `${progress.percentComplete || 0}%` }}
          />
        </div>

        <div className="flex justify-between text-sm pt-2">
          <div>
            <span className="text-gray-600">Points: </span>
            <span className="font-semibold">{progress.points || 0}</span>
          </div>
          <div>
            <span className="text-gray-600">Accuracy: </span>
            <span className="font-semibold">{progress.accuracy || 0}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper Functions
 */
function getRandomPosition(index) {
  const positions = [
    { top: '10%', left: '5%' },
    { top: '15%', right: '8%' },
    { top: '25%', left: '15%' },
    { top: '40%', left: '3%' },
    { top: '45%', right: '12%' },
    { top: '60%', right: '5%' },
    { top: '70%', left: '20%' },
    { top: '80%', left: '10%' },
    { bottom: '10%', right: '15%' },
    { bottom: '20%', left: '25%' },
  ];

  return positions[index % positions.length];
}

function getDecorationsForGrade(gradeLevel, subject) {
  if (gradeLevel <= 2) {
    return {
      leftPosters: [
        { title: 'You Can Do It!', emoji: '💪', color: 'bg-gradient-to-br from-pink-400 to-pink-600' },
        { title: 'Be Kind', emoji: '❤️', color: 'bg-gradient-to-br from-red-400 to-red-600' },
      ],
      rightPosters: [
        { title: 'Try Your Best!', emoji: '⭐', color: 'bg-gradient-to-br from-yellow-400 to-yellow-600' },
        { title: 'Have Fun!', emoji: '🎉', color: 'bg-gradient-to-br from-purple-400 to-purple-600' },
      ],
    };
  } else if (gradeLevel <= 5) {
    return {
      leftPosters: [
        { title: 'Growth Mindset', emoji: '🧠', color: 'bg-gradient-to-br from-blue-500 to-blue-700' },
      ],
      rightPosters: [
        { title: 'Teamwork', emoji: '🤝', color: 'bg-gradient-to-br from-green-500 to-green-700' },
      ],
    };
  } else {
    return { leftPosters: [], rightPosters: [] };
  }
}
