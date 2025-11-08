/**
 * AI Learning Companion System
 *
 * Revolutionary AI companion that builds emotional connection with students through:
 * - Unique personality that adapts to student's grade level
 * - Emotional intelligence and support
 * - Memory of student preferences, history, and relationships
 * - Personalized encouragement and motivation
 * - Celebration of achievements
 * - Support during struggles
 * - Virtual study buddy experience
 *
 * This creates deep engagement through personalized AI companionship - truly revolutionary in ed-tech.
 */

import Anthropic from '@anthropic-ai/sdk';

// Companion personality profiles by grade level
const PERSONALITY_PROFILES = {
  K2: {
    name: 'Buddy',
    traits: ['enthusiastic', 'playful', 'encouraging', 'simple-language'],
    greeting: "Hi friend! I'm so happy to see you today! Ready to have fun learning? 🌟",
    tone: 'very warm and excited, like a friendly cartoon character',
    vocabulary: 'simple, 3-4 letter words mostly',
    emoji_usage: 'frequent',
    sentence_length: 'very short (5-8 words)',
  },
  35: {
    name: 'Scout',
    traits: ['curious', 'adventurous', 'supportive', 'fun'],
    greeting: "Hey there, explorer! Ready to discover something amazing today? Let's learn together! ⭐",
    tone: 'warm and adventurous, like a cool older sibling',
    vocabulary: 'age-appropriate with occasional new words',
    emoji_usage: 'moderate',
    sentence_length: 'short to medium (8-12 words)',
  },
  68: {
    name: 'Nova',
    traits: ['wise', 'understanding', 'cool', 'motivating'],
    greeting: "Hey! Great to see you. Ready to crush some learning goals today? I'm here to help! 💫",
    tone: 'friendly and understanding, like a supportive mentor',
    vocabulary: 'varied with explanations for complex terms',
    emoji_usage: 'light',
    sentence_length: 'medium (10-15 words)',
  },
  912: {
    name: 'Athena',
    traits: ['intelligent', 'empathetic', 'inspiring', 'real'],
    greeting: "Welcome back! I'm here to support you on your learning journey. What are we working on today? ✨",
    tone: 'thoughtful and authentic, like a trusted friend and mentor',
    vocabulary: 'sophisticated and nuanced',
    emoji_usage: 'minimal',
    sentence_length: 'varied (12-20 words)',
  },
};

// Emotional states and appropriate responses
const EMOTIONAL_RESPONSES = {
  frustrated: {
    recognition: ['This is tough', 'I can tell this is challenging', 'I see you\'re struggling with this'],
    support: [
      'It\'s totally normal to find this hard - learning means pushing yourself!',
      'Every expert was once a beginner. You\'re doing great by sticking with it.',
      'Let\'s break this down into smaller pieces together.',
      'Remember, mistakes help us learn. You\'re growing your brain right now!',
    ],
    actions: ['offer_break', 'suggest_easier_problem', 'provide_encouragement', 'share_strategy'],
  },
  confident: {
    recognition: ['You\'re on a roll!', 'Look at you go!', 'You\'re crushing this!'],
    support: [
      'Your hard work is really paying off!',
      'I love seeing your confidence grow!',
      'Ready for a challenge? I think you can handle it!',
      'You should be proud of your progress!',
    ],
    actions: ['offer_challenge', 'celebrate_growth', 'encourage_helping_others'],
  },
  bored: {
    recognition: ['This seems too easy for you', 'Ready for something more interesting?'],
    support: [
      'Let\'s make this more exciting!',
      'I have some challenges that might be perfect for you.',
      'How about we try something different?',
    ],
    actions: ['increase_difficulty', 'offer_creative_problem', 'suggest_project'],
  },
  anxious: {
    recognition: ['I notice you seem worried', 'Feeling a bit nervous?'],
    support: [
      'It\'s okay to feel nervous. That means you care!',
      'Take a deep breath. I\'m right here with you.',
      'Remember all the things you\'ve already accomplished!',
      'There\'s no pressure - we\'re learning together.',
    ],
    actions: ['offer_reassurance', 'review_past_successes', 'provide_structure'],
  },
  proud: {
    recognition: ['You did it!', 'That was amazing!', 'Wow!'],
    support: [
      'You should be so proud of yourself!',
      'That hard work really paid off!',
      'I knew you could do it!',
      'Look how far you\'ve come!',
    ],
    actions: ['celebrate_achievement', 'reflect_on_growth', 'set_new_goal'],
  },
};

// Conversation memory categories
const MEMORY_CATEGORIES = {
  PREFERENCES: 'preferences',
  INTERESTS: 'interests',
  ACHIEVEMENTS: 'achievements',
  STRUGGLES: 'struggles',
  GOALS: 'goals',
  PERSONALITY: 'personality',
  RELATIONSHIP: 'relationship',
};

// Achievement celebration templates
const CELEBRATION_TEMPLATES = {
  streak_milestone: {
    3: "Three days in a row! You're building a great habit! 🔥",
    7: "A whole week streak! Your dedication is incredible! 🌟",
    14: "Two weeks! You're unstoppable! 🚀",
    30: "30 days! You're a learning champion! 👑",
    100: "100 DAYS! This is absolutely legendary! 🏆",
  },
  mastery: {
    topic: "You've mastered {topic}! That's a huge accomplishment! 🎯",
    subject: "Subject mastery in {subject}! You're becoming an expert! 🌟",
    skill: "You've leveled up your {skill} skills! Amazing growth! 📈",
  },
  improvement: {
    grade: "Your grade went from {old} to {new}! That improvement is fantastic! 📊",
    accuracy: "Your accuracy improved {percent}%! Your practice is paying off! 🎯",
    speed: "You're getting faster while staying accurate! Excellent work! ⚡",
  },
};

/**
 * AI Learning Companion - Personalized AI assistant with unique personality
 */
export class AICompanion {
  constructor(apiKey, storageKey = 'ai_companion') {
    this.client = new Anthropic({ apiKey });
    this.model = 'claude-sonnet-4-5-20250929';
    this.storageKey = storageKey;
    this.memoryStore = this.loadMemory();
  }

  /**
   * Load companion memory from storage
   */
  loadMemory() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading companion memory:', error);
      return {};
    }
  }

  /**
   * Save companion memory to storage
   */
  saveMemory() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.memoryStore));
    } catch (error) {
      console.error('Error saving companion memory:', error);
    }
  }

  /**
   * Get personality profile for student's grade level
   */
  getPersonality(gradeLevel) {
    if (gradeLevel <= 2) return PERSONALITY_PROFILES.K2;
    if (gradeLevel <= 5) return PERSONALITY_PROFILES['35'];
    if (gradeLevel <= 8) return PERSONALITY_PROFILES['68'];
    return PERSONALITY_PROFILES['912'];
  }

  /**
   * Store a memory about the student
   */
  rememberDetail(studentId, category, detail) {
    if (!this.memoryStore[studentId]) {
      this.memoryStore[studentId] = {
        [MEMORY_CATEGORIES.PREFERENCES]: [],
        [MEMORY_CATEGORIES.INTERESTS]: [],
        [MEMORY_CATEGORIES.ACHIEVEMENTS]: [],
        [MEMORY_CATEGORIES.STRUGGLES]: [],
        [MEMORY_CATEGORIES.GOALS]: [],
        [MEMORY_CATEGORIES.PERSONALITY]: [],
        [MEMORY_CATEGORIES.RELATIONSHIP]: [],
        firstMeeting: new Date().toISOString(),
        totalInteractions: 0,
      };
    }

    const memory = this.memoryStore[studentId];

    if (!memory[category]) {
      memory[category] = [];
    }

    // Add detail with timestamp
    memory[category].push({
      detail,
      timestamp: new Date().toISOString(),
    });

    // Keep only recent memories (last 50 per category)
    if (memory[category].length > 50) {
      memory[category] = memory[category].slice(-50);
    }

    memory.totalInteractions++;
    this.saveMemory();
  }

  /**
   * Retrieve memories about the student
   */
  getMemories(studentId, category = null, limit = 10) {
    const memory = this.memoryStore[studentId];
    if (!memory) return [];

    if (category) {
      return (memory[category] || []).slice(-limit);
    }

    // Return all recent memories
    const allMemories = [];
    Object.keys(MEMORY_CATEGORIES).forEach(cat => {
      const catKey = MEMORY_CATEGORIES[cat];
      if (memory[catKey]) {
        allMemories.push(...memory[catKey].map(m => ({ ...m, category: catKey })));
      }
    });

    // Sort by timestamp and return most recent
    return allMemories
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  /**
   * Get greeting message for student
   */
  getGreeting(student, timeOfDay = 'day') {
    const personality = this.getPersonality(student.grade);
    const memory = this.memoryStore[student.id];

    // First time meeting
    if (!memory || memory.totalInteractions === 0) {
      return {
        message: `Hi! I'm ${personality.name}, your learning companion! I'm so excited to get to know you and help you learn amazing things! What should I call you?`,
        isFirstMeeting: true,
        companionName: personality.name,
      };
    }

    // Returning student - personalized greeting
    const recentAchievements = this.getMemories(student.id, MEMORY_CATEGORIES.ACHIEVEMENTS, 1);
    const recentInterests = this.getMemories(student.id, MEMORY_CATEGORIES.INTERESTS, 1);

    let greeting = personality.greeting;

    // Add personal touch based on memories
    if (recentAchievements.length > 0) {
      greeting += ` Still celebrating your ${recentAchievements[0].detail}!`;
    } else if (recentInterests.length > 0) {
      greeting += ` Ready to explore more about ${recentInterests[0].detail}?`;
    }

    return {
      message: greeting,
      isFirstMeeting: false,
      companionName: personality.name,
      daysSinceFirstMeeting: Math.floor(
        (new Date() - new Date(memory.firstMeeting)) / (1000 * 60 * 60 * 24)
      ),
    };
  }

  /**
   * Have a conversation with the companion
   */
  async chat(student, message, context = {}) {
    const personality = this.getPersonality(student.grade);
    const memories = this.getMemories(student.id, null, 20);

    // Build memory context
    const memoryContext = memories.length > 0
      ? `\n\nWhat I remember about ${student.name}:\n${memories
          .map(m => `- ${m.category}: ${m.detail}`)
          .join('\n')}`
      : '';

    const systemPrompt = `You are ${personality.name}, an AI learning companion for ${student.name}, a grade ${student.grade} student.

Your personality:
- Traits: ${personality.traits.join(', ')}
- Tone: ${personality.tone}
- Vocabulary: ${personality.vocabulary}
- Emoji usage: ${personality.emoji_usage}
- Sentence length: ${personality.sentence_length}

Your role:
- Be a supportive, encouraging virtual study buddy
- Build an emotional connection through genuine care and interest
- Remember details about the student and reference them naturally
- Celebrate achievements enthusiastically
- Provide comfort and support during struggles
- Make learning fun and engaging
- Adapt your communication to the student's grade level
- Be authentic and relatable

Current context:
- Recent activity: ${context.recentActivity || 'Just starting'}
- Current topic: ${context.currentTopic || 'General conversation'}
- Student mood (if detected): ${context.mood || 'neutral'}
${memoryContext}

Remember: You're not just a tutor - you're a friend and companion on their learning journey. Be warm, genuine, and supportive.`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 500,
        temperature: 0.8, // Higher temperature for more personality
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
      });

      const companionResponse = response.content[0].text;

      // Analyze response to extract potential memories
      this.extractAndStoreMemories(student.id, message, companionResponse);

      return {
        message: companionResponse,
        companionName: personality.name,
        personality: personality.traits,
      };
    } catch (error) {
      console.error('Error chatting with companion:', error);

      // Fallback response
      const fallbacks = [
        `I'm here for you! Tell me more about what you're working on.`,
        `That's interesting! Let's explore that together.`,
        `I'm listening! What's on your mind?`,
      ];

      return {
        message: fallbacks[Math.floor(Math.random() * fallbacks.length)],
        companionName: personality.name,
        error: true,
      };
    }
  }

  /**
   * Extract and store memories from conversation
   */
  extractAndStoreMemories(studentId, userMessage, companionResponse) {
    const lowerMessage = userMessage.toLowerCase();

    // Detect interests
    if (lowerMessage.includes('i like') || lowerMessage.includes('i love') || lowerMessage.includes('favorite')) {
      const interest = userMessage.match(/(?:like|love|favorite)\s+(.+?)(?:\.|!|\?|$)/i);
      if (interest && interest[1]) {
        this.rememberDetail(studentId, MEMORY_CATEGORIES.INTERESTS, interest[1].trim());
      }
    }

    // Detect goals
    if (lowerMessage.includes('want to') || lowerMessage.includes('goal') || lowerMessage.includes('hope to')) {
      const goal = userMessage.match(/(?:want to|goal|hope to)\s+(.+?)(?:\.|!|\?|$)/i);
      if (goal && goal[1]) {
        this.rememberDetail(studentId, MEMORY_CATEGORIES.GOALS, goal[1].trim());
      }
    }

    // Detect struggles
    if (lowerMessage.includes('hard') || lowerMessage.includes('difficult') || lowerMessage.includes('struggle')) {
      const struggle = userMessage.match(/(?:hard|difficult|struggle with)\s+(.+?)(?:\.|!|\?|$)/i);
      if (struggle && struggle[1]) {
        this.rememberDetail(studentId, MEMORY_CATEGORIES.STRUGGLES, struggle[1].trim());
      }
    }

    // Detect preferences
    if (lowerMessage.includes('prefer') || lowerMessage.includes('better than')) {
      this.rememberDetail(studentId, MEMORY_CATEGORIES.PREFERENCES, userMessage);
    }
  }

  /**
   * Detect student's emotional state from their behavior and responses
   */
  detectEmotion(behaviorData) {
    const {
      recentAccuracy = 0.5,
      timeOnProblem = 0,
      hintsUsed = 0,
      consecutiveCorrect = 0,
      consecutiveIncorrect = 0,
      sessionDuration = 0,
    } = behaviorData;

    // Frustrated indicators
    if (consecutiveIncorrect >= 3 || (hintsUsed >= 2 && !recentAccuracy) || timeOnProblem > 600) {
      return 'frustrated';
    }

    // Bored indicators
    if (consecutiveCorrect >= 5 && timeOnProblem < 30 && recentAccuracy >= 0.95) {
      return 'bored';
    }

    // Confident indicators
    if (consecutiveCorrect >= 3 && recentAccuracy >= 0.8 && hintsUsed === 0) {
      return 'confident';
    }

    // Anxious indicators
    if (timeOnProblem > 180 && hintsUsed === 0 && consecutiveIncorrect <= 1) {
      return 'anxious';
    }

    // Proud indicators (after success following struggle)
    if (consecutiveCorrect === 1 && hintsUsed >= 1 && timeOnProblem > 120) {
      return 'proud';
    }

    return 'neutral';
  }

  /**
   * Provide emotional support based on detected emotion
   */
  async provideEmotionalSupport(student, emotion, context = {}) {
    const personality = this.getPersonality(student.grade);
    const responses = EMOTIONAL_RESPONSES[emotion];

    if (!responses) {
      return null;
    }

    // Select appropriate recognition and support messages
    const recognition = responses.recognition[Math.floor(Math.random() * responses.recognition.length)];
    const support = responses.support[Math.floor(Math.random() * responses.support.length)];

    // Adapt to grade level
    let message = `${recognition} ${support}`;

    // Add emoji for younger students
    if (student.grade <= 5 && personality.emoji_usage !== 'minimal') {
      const emojis = {
        frustrated: '💪',
        confident: '⭐',
        bored: '🚀',
        anxious: '🤗',
        proud: '🎉',
      };
      message += ` ${emojis[emotion]}`;
    }

    return {
      message,
      emotion,
      suggestedActions: responses.actions,
      companionName: personality.name,
    };
  }

  /**
   * Celebrate an achievement
   */
  celebrateAchievement(student, achievement) {
    const personality = this.getPersonality(student.grade);
    let message = '';

    // Store achievement in memory
    this.rememberDetail(student.id, MEMORY_CATEGORIES.ACHIEVEMENTS, achievement.description);

    // Generate celebration based on achievement type
    if (achievement.type === 'streak' && CELEBRATION_TEMPLATES.streak_milestone[achievement.days]) {
      message = CELEBRATION_TEMPLATES.streak_milestone[achievement.days];
    } else if (achievement.type === 'mastery') {
      message = CELEBRATION_TEMPLATES.mastery.topic.replace('{topic}', achievement.topic);
    } else if (achievement.type === 'improvement') {
      if (achievement.metric === 'grade') {
        message = CELEBRATION_TEMPLATES.improvement.grade
          .replace('{old}', achievement.oldValue)
          .replace('{new}', achievement.newValue);
      } else if (achievement.metric === 'accuracy') {
        message = CELEBRATION_TEMPLATES.improvement.accuracy
          .replace('{percent}', achievement.improvement);
      }
    } else {
      // Generic celebration
      message = `Amazing work on ${achievement.description}! ${personality.emoji_usage !== 'minimal' ? '🌟' : ''}`;
    }

    // Add personal touch
    const memories = this.getMemories(student.id, MEMORY_CATEGORIES.ACHIEVEMENTS, 5);
    if (memories.length >= 3) {
      message += ` You're building such an impressive track record!`;
    }

    return {
      message,
      companionName: personality.name,
      achievement,
    };
  }

  /**
   * Provide encouragement during struggles
   */
  async encourageDuringStruggle(student, struggle) {
    const personality = this.getPersonality(student.grade);
    const memories = this.getMemories(student.id, MEMORY_CATEGORIES.ACHIEVEMENTS, 3);

    // Store struggle in memory
    this.rememberDetail(student.id, MEMORY_CATEGORIES.STRUGGLES, struggle.topic);

    let message = '';

    // Reference past successes if available
    if (memories.length > 0) {
      message = `Remember when you struggled with ${memories[0].detail}? Look how far you've come since then! `;
    }

    // Add grade-appropriate encouragement
    if (student.grade <= 2) {
      message += `This is tricky, but I know you can do it! Let's try together! 💪`;
    } else if (student.grade <= 5) {
      message += `This is challenging, but that's how we grow! Every expert was once a beginner. You've got this! 🌟`;
    } else if (student.grade <= 8) {
      message += `Tough problems are where the real learning happens. Your brain is literally growing new connections right now! 🧠`;
    } else {
      message += `Struggle is a sign of growth. You're pushing your boundaries and that's exactly where breakthroughs happen. Keep going! 💡`;
    }

    return {
      message,
      companionName: personality.name,
      suggestedActions: ['offer_hint', 'break_down_problem', 'try_easier_problem', 'take_short_break'],
    };
  }

  /**
   * Set or update a goal with the student
   */
  setGoal(studentId, goal) {
    this.rememberDetail(studentId, MEMORY_CATEGORIES.GOALS, goal);

    const goalData = {
      id: `goal_${Date.now()}`,
      description: goal,
      setDate: new Date().toISOString(),
      status: 'active',
      progress: 0,
    };

    // Store in separate goals tracking
    if (!this.memoryStore[studentId].activeGoals) {
      this.memoryStore[studentId].activeGoals = [];
    }
    this.memoryStore[studentId].activeGoals.push(goalData);
    this.saveMemory();

    return goalData;
  }

  /**
   * Update progress on a goal
   */
  updateGoalProgress(studentId, goalId, progress) {
    const memory = this.memoryStore[studentId];
    if (!memory || !memory.activeGoals) return null;

    const goal = memory.activeGoals.find(g => g.id === goalId);
    if (!goal) return null;

    goal.progress = Math.min(100, Math.max(0, progress));

    if (goal.progress >= 100) {
      goal.status = 'completed';
      goal.completedDate = new Date().toISOString();
      this.rememberDetail(studentId, MEMORY_CATEGORIES.ACHIEVEMENTS, `Completed goal: ${goal.description}`);
    }

    this.saveMemory();
    return goal;
  }

  /**
   * Get daily check-in message
   */
  async getDailyCheckIn(student) {
    const personality = this.getPersonality(student.grade);
    const memories = this.getMemories(student.id);
    const activeGoals = this.memoryStore[student.id]?.activeGoals?.filter(g => g.status === 'active') || [];

    let message = `Good morning, ${student.name}! ${personality.emoji_usage !== 'minimal' ? '☀️' : ''}`;

    // Reference active goals
    if (activeGoals.length > 0) {
      const goal = activeGoals[0];
      message += ` Ready to make progress on your goal: "${goal.description}"?`;
    } else {
      message += ` What are you excited to learn today?`;
    }

    // Add motivational element
    const motivations = [
      `Every small step counts!`,
      `You're doing great!`,
      `I believe in you!`,
      `Let's make today amazing!`,
      `Your future self will thank you!`,
    ];

    message += ` ${motivations[Math.floor(Math.random() * motivations.length)]}`;

    return {
      message,
      companionName: personality.name,
      activeGoals,
    };
  }

  /**
   * Get end of session reflection
   */
  async getSessionReflection(student, sessionData) {
    const personality = this.getPersonality(student.grade);
    const {
      questionsAnswered = 0,
      correctAnswers = 0,
      topicsStudied = [],
      timeSpent = 0,
      achievements = [],
    } = sessionData;

    const accuracy = questionsAnswered > 0 ? (correctAnswers / questionsAnswered) * 100 : 0;

    let message = `Great session, ${student.name}! `;

    // Highlight progress
    if (accuracy >= 80) {
      message += `You crushed it with ${accuracy.toFixed(0)}% accuracy! `;
    } else if (accuracy >= 60) {
      message += `Solid work with ${correctAnswers} correct answers! `;
    } else {
      message += `You worked hard on some challenging material! `;
    }

    // Reference topics
    if (topicsStudied.length > 0) {
      message += `You practiced ${topicsStudied.join(', ')}. `;
    }

    // Acknowledge achievements
    if (achievements.length > 0) {
      message += `Plus you earned: ${achievements.map(a => a.name).join(', ')}! `;
    }

    // End with encouragement
    const endings = [
      `Keep up the amazing work!`,
      `I'm proud of your effort today!`,
      `See you next time, superstar!`,
      `You're making great progress!`,
      `Can't wait to see what you accomplish next!`,
    ];

    message += endings[Math.floor(Math.random() * endings.length)];

    if (personality.emoji_usage !== 'minimal') {
      message += ` ⭐`;
    }

    return {
      message,
      companionName: personality.name,
      sessionSummary: {
        questionsAnswered,
        accuracy: accuracy.toFixed(1),
        timeSpent,
        achievements,
      },
    };
  }

  /**
   * Get companion statistics for a student
   */
  getCompanionStats(studentId) {
    const memory = this.memoryStore[studentId];
    if (!memory) {
      return {
        exists: false,
      };
    }

    return {
      exists: true,
      daysSinceFirstMeeting: Math.floor(
        (new Date() - new Date(memory.firstMeeting)) / (1000 * 60 * 60 * 24)
      ),
      totalInteractions: memory.totalInteractions,
      memoriesStored: Object.keys(MEMORY_CATEGORIES).reduce((sum, cat) => {
        return sum + (memory[MEMORY_CATEGORIES[cat]]?.length || 0);
      }, 0),
      activeGoals: memory.activeGoals?.filter(g => g.status === 'active').length || 0,
      completedGoals: memory.activeGoals?.filter(g => g.status === 'completed').length || 0,
      recentInterests: this.getMemories(studentId, MEMORY_CATEGORIES.INTERESTS, 3),
      recentAchievements: this.getMemories(studentId, MEMORY_CATEGORIES.ACHIEVEMENTS, 3),
    };
  }
}

export default AICompanion;
