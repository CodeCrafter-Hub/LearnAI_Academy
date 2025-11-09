/**
 * Classroom Theme System
 * Defines age-appropriate visual themes for different grade levels
 */

export const GRADE_THEMES = {
  // K-2: Playful, colorful, large elements
  EARLY_ELEMENTARY: {
    grades: [0, 1, 2],
    style: {
      fontSize: 'large',
      spacing: 'generous',
      corners: 'very-rounded',
      animations: 'bouncy',
      illustrations: 'cartoon',
    },
    colors: {
      primary: 'from-yellow-400 via-orange-400 to-red-400',
      secondary: 'from-blue-400 via-purple-400 to-pink-400',
      accent: 'from-green-400 to-teal-400',
    },
    emojis: true,
    voiceEncouragement: 'frequent',
  },

  // 3-5: Balanced, engaging, structured
  UPPER_ELEMENTARY: {
    grades: [3, 4, 5],
    style: {
      fontSize: 'medium-large',
      spacing: 'comfortable',
      corners: 'rounded',
      animations: 'smooth',
      illustrations: 'friendly',
    },
    colors: {
      primary: 'from-blue-500 to-indigo-600',
      secondary: 'from-purple-500 to-pink-600',
      accent: 'from-emerald-500 to-teal-600',
    },
    emojis: true,
    voiceEncouragement: 'moderate',
  },

  // 6-8: More mature, professional, focused
  MIDDLE_SCHOOL: {
    grades: [6, 7, 8],
    style: {
      fontSize: 'medium',
      spacing: 'standard',
      corners: 'slightly-rounded',
      animations: 'subtle',
      illustrations: 'modern',
    },
    colors: {
      primary: 'from-indigo-600 to-blue-700',
      secondary: 'from-violet-600 to-purple-700',
      accent: 'from-cyan-600 to-blue-700',
    },
    emojis: 'selective',
    voiceEncouragement: 'occasional',
  },

  // 9-12: Professional, sophisticated, minimalist
  HIGH_SCHOOL: {
    grades: [9, 10, 11, 12],
    style: {
      fontSize: 'standard',
      spacing: 'compact',
      corners: 'minimal-rounded',
      animations: 'none',
      illustrations: 'abstract',
    },
    colors: {
      primary: 'from-slate-700 to-gray-800',
      secondary: 'from-blue-700 to-indigo-800',
      accent: 'from-emerald-700 to-teal-800',
    },
    emojis: false,
    voiceEncouragement: 'minimal',
  },
};

/**
 * Subject-Specific Classroom Themes
 * Each subject has its own visual identity and learning environment
 */
export const SUBJECT_CLASSROOMS = {
  MATH: {
    name: 'Math',
    slug: 'math',
    icon: '🔢',
    color: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    borderColor: 'border-blue-300',
    classroom: {
      background: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
      pattern: 'geometric', // Grid patterns, equations background
      elements: ['📐', '📊', '∑', 'π', '∞', '='],
      atmosphere: 'focused',
      soundscape: 'quiet-classical',
    },
    learning: {
      workspace: 'graph-paper',
      tools: ['calculator', 'ruler', 'protractor', 'graph'],
    },
  },

  READING: {
    name: 'Reading',
    slug: 'reading',
    icon: '📚',
    color: 'bg-gradient-to-br from-amber-500 to-orange-600',
    borderColor: 'border-amber-300',
    classroom: {
      background: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50',
      pattern: 'books', // Bookshelf, library theme
      elements: ['📖', '✨', '🦉', '💡', '🎭', '📝'],
      atmosphere: 'cozy-library',
      soundscape: 'pages-turning',
    },
    learning: {
      workspace: 'reading-nook',
      tools: ['bookmark', 'highlighter', 'dictionary', 'notes'],
    },
  },

  ENGLISH: {
    name: 'English',
    slug: 'english',
    icon: '✍️',
    color: 'bg-gradient-to-br from-green-500 to-emerald-600',
    borderColor: 'border-green-300',
    classroom: {
      background: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50',
      pattern: 'writing', // Paper, quill patterns
      elements: ['✍️', '📝', '✏️', '📄', '🖊️', 'ABC'],
      atmosphere: 'creative-studio',
      soundscape: 'gentle-writing',
    },
    learning: {
      workspace: 'writing-desk',
      tools: ['pen', 'paper', 'thesaurus', 'grammar-guide'],
    },
  },

  SCIENCE: {
    name: 'Science',
    slug: 'science',
    icon: '🔬',
    color: 'bg-gradient-to-br from-purple-500 to-violet-600',
    borderColor: 'border-purple-300',
    classroom: {
      background: 'bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50',
      pattern: 'laboratory', // Lab equipment, molecules
      elements: ['🔬', '⚗️', '🧪', '🔭', '⚛️', '🌍'],
      atmosphere: 'laboratory',
      soundscape: 'science-lab',
    },
    learning: {
      workspace: 'lab-bench',
      tools: ['microscope', 'beaker', 'periodic-table', 'safety-goggles'],
    },
  },

  WRITING: {
    name: 'Writing',
    slug: 'writing',
    icon: '✏️',
    color: 'bg-gradient-to-br from-rose-500 to-pink-600',
    borderColor: 'border-rose-300',
    classroom: {
      background: 'bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50',
      pattern: 'journal', // Lined paper, creative elements
      elements: ['✏️', '📓', '💭', '✨', '🎨', '📖'],
      atmosphere: 'creative-space',
      soundscape: 'soft-music',
    },
    learning: {
      workspace: 'creative-desk',
      tools: ['pencil', 'eraser', 'story-prompts', 'word-bank'],
    },
  },

  CODING: {
    name: 'Coding',
    slug: 'coding',
    icon: '💻',
    color: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-300',
    classroom: {
      background: 'bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50',
      pattern: 'digital', // Code snippets, binary
      elements: ['💻', '⌨️', '🖱️', '<>', '{}', '01'],
      atmosphere: 'tech-hub',
      soundscape: 'keyboard-typing',
    },
    learning: {
      workspace: 'code-editor',
      tools: ['computer', 'debugger', 'documentation', 'terminal'],
    },
  },
};

/**
 * Get appropriate theme for student's grade level
 */
export function getGradeTheme(gradeLevel) {
  if (gradeLevel <= 2) return GRADE_THEMES.EARLY_ELEMENTARY;
  if (gradeLevel <= 5) return GRADE_THEMES.UPPER_ELEMENTARY;
  if (gradeLevel <= 8) return GRADE_THEMES.MIDDLE_SCHOOL;
  return GRADE_THEMES.HIGH_SCHOOL;
}

/**
 * Get classroom configuration for subject
 */
export function getSubjectClassroom(subjectSlug) {
  const subject = Object.values(SUBJECT_CLASSROOMS).find(
    s => s.slug === subjectSlug.toLowerCase()
  );
  return subject || SUBJECT_CLASSROOMS.MATH;
}

/**
 * Generate age-appropriate encouragement messages
 */
export function getEncouragementMessage(gradeLevel, context = 'general') {
  const theme = getGradeTheme(gradeLevel);

  const messages = {
    EARLY_ELEMENTARY: {
      start: ['Let\'s learn something awesome! 🌟', 'You\'re going to do great! ⭐', 'Ready to have fun learning? 🎉'],
      correct: ['Amazing! You got it! 🎊', 'Wow! Super job! ⭐', 'You\'re a star! 🌟'],
      encourage: ['You can do it! 💪', 'Try again! You\'re so close! 🌈', 'Don\'t give up! You\'re awesome! ✨'],
      complete: ['You did it! Hooray! 🎉', 'Amazing work today! 🌟', 'You\'re a learning superstar! ⭐'],
    },
    UPPER_ELEMENTARY: {
      start: ['Let\'s dive in! 🚀', 'Ready to learn something cool? 💡', 'Time to challenge yourself! 🎯'],
      correct: ['Excellent work! 🎉', 'That\'s right! Great thinking! 💡', 'Perfect! You nailed it! ⭐'],
      encourage: ['Give it another try! 🔄', 'You\'re on the right track! 🎯', 'Think it through - you\'ve got this! 💪'],
      complete: ['Awesome session! Well done! 🎉', 'Great work today! 🌟', 'You crushed it! 🎊'],
    },
    MIDDLE_SCHOOL: {
      start: ['Let\'s get started 📚', 'Ready to learn? 💡', 'Time to focus 🎯'],
      correct: ['Correct! Well done 👍', 'Nice work! ✓', 'Excellent 🌟'],
      encourage: ['Try again 🔄', 'Think carefully 🤔', 'You can figure this out 💡'],
      complete: ['Great session! 👏', 'Well done today 🎉', 'Nice work! ✓'],
    },
    HIGH_SCHOOL: {
      start: ['Begin session', 'Ready when you are', 'Let\'s proceed'],
      correct: ['Correct ✓', 'Well done', 'Excellent'],
      encourage: ['Reconsider', 'Review your approach', 'Try a different method'],
      complete: ['Session complete', 'Well done', 'Good work'],
    },
  };

  const themeKey = Object.keys(GRADE_THEMES).find(
    key => GRADE_THEMES[key] === theme
  );

  return messages[themeKey][context] || messages.UPPER_ELEMENTARY[context];
}

/**
 * Get classroom CSS classes based on theme and subject
 */
export function getClassroomStyles(gradeLevel, subjectSlug) {
  const gradeTheme = getGradeTheme(gradeLevel);
  const classroom = getSubjectClassroom(subjectSlug);

  return {
    container: `${classroom.classroom.background} min-h-screen`,
    header: `${classroom.color} text-white shadow-lg`,
    card: `bg-white ${gradeTheme.style.corners === 'very-rounded' ? 'rounded-3xl' : gradeTheme.style.corners === 'rounded' ? 'rounded-2xl' : 'rounded-xl'} shadow-lg`,
    button: `${classroom.color} text-white ${gradeTheme.style.corners === 'very-rounded' ? 'rounded-full' : 'rounded-lg'} px-6 py-3 font-semibold hover:opacity-90 transition-all transform hover:scale-105`,
    text: {
      heading: gradeTheme.style.fontSize === 'large' ? 'text-4xl' : gradeTheme.style.fontSize === 'medium-large' ? 'text-3xl' : gradeTheme.style.fontSize === 'medium' ? 'text-2xl' : 'text-xl',
      body: gradeTheme.style.fontSize === 'large' ? 'text-xl' : gradeTheme.style.fontSize === 'medium-large' ? 'text-lg' : 'text-base',
    },
    spacing: gradeTheme.style.spacing === 'generous' ? 'p-8 gap-6' : gradeTheme.style.spacing === 'comfortable' ? 'p-6 gap-4' : 'p-4 gap-3',
    showEmojis: gradeTheme.emojis === true,
  };
}
