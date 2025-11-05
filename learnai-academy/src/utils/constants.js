export const GRADE_LEVELS = [
  { value: 0, label: 'Kindergarten' },
  { value: 1, label: '1st Grade' },
  { value: 2, label: '2nd Grade' },
  { value: 3, label: '3rd Grade' },
  { value: 4, label: '4th Grade' },
  { value: 5, label: '5th Grade' },
  { value: 6, label: '6th Grade' },
  { value: 7, label: '7th Grade' },
  { value: 8, label: '8th Grade' },
  { value: 9, label: '9th Grade' },
  { value: 10, label: '10th Grade' },
  { value: 11, label: '11th Grade' },
  { value: 12, label: '12th Grade' },
];

export const SESSION_MODES = {
  PRACTICE: 'practice',
  HELP: 'help',
  ASSESSMENT: 'assessment',
  PROJECT: 'project',
};

export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
  FAMILY: 'family',
  SCHOOL: 'school',
};

export const RATE_LIMITS = {
  FREE: 10, // messages per minute
  PREMIUM: 60,
  FAMILY: 60,
  SCHOOL: 120,
};

export const POINTS_MULTIPLIER = {
  EASY: 1,
  MEDIUM: 1.2,
  HARD: 1.5,
};

export const MODE_BONUS = {
  PRACTICE: 10,
  HELP: 0,
  ASSESSMENT: 20,
  PROJECT: 30,
};

export const ACHIEVEMENT_CATEGORIES = {
  MILESTONE: 'milestone',
  STREAK: 'streak',
  MASTERY: 'mastery',
  EXPLORATION: 'exploration',
  SOCIAL: 'social',
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
  },
  STUDENTS: {
    BASE: '/api/students',
    PROGRESS: (id) => `/api/students/${id}/progress`,
  },
  SUBJECTS: '/api/subjects',
  SESSIONS: {
    BASE: '/api/sessions',
    END: (id) => `/api/sessions/${id}/end`,
    MESSAGES: (id) => `/api/sessions/${id}/messages`,
  },
  ACHIEVEMENTS: '/api/achievements',
  ANALYTICS: (studentId) => `/api/analytics/${studentId}`,
};

export const COLORS = {
  SUBJECTS: {
    math: 'bg-blue-500',
    english: 'bg-red-500',
    reading: 'bg-green-500',
    science: 'bg-purple-500',
    writing: 'bg-orange-500',
    coding: 'bg-indigo-500',
  },
  DIFFICULTY: {
    easy: 'bg-green-500',
    medium: 'bg-yellow-500',
    hard: 'bg-red-500',
  },
  MASTERY: {
    master: 'bg-green-500',
    proficient: 'bg-blue-500',
    developing: 'bg-yellow-500',
    beginning: 'bg-orange-500',
    notStarted: 'bg-gray-500',
  },
};
