/**
 * Learning Style Detection and Adaptation System
 *
 * Revolutionary system that automatically detects and adapts to each student's unique learning style:
 * - VARK model (Visual, Auditory, Reading/Writing, Kinesthetic)
 * - Multiple Intelligences (Gardner's theory)
 * - Cognitive processing preferences
 * - Engagement pattern analysis
 * - Real-time content adaptation
 * - Personalized presentation strategies
 *
 * Transforms education by delivering content in the way each student learns best.
 */

// VARK Learning Styles
const VARK_STYLES = {
  VISUAL: 'visual',
  AUDITORY: 'auditory',
  READING_WRITING: 'reading_writing',
  KINESTHETIC: 'kinesthetic',
};

// Multiple Intelligences (Gardner)
const INTELLIGENCES = {
  LINGUISTIC: 'linguistic',
  LOGICAL_MATHEMATICAL: 'logical_mathematical',
  SPATIAL: 'spatial',
  BODILY_KINESTHETIC: 'bodily_kinesthetic',
  MUSICAL: 'musical',
  INTERPERSONAL: 'interpersonal',
  INTRAPERSONAL: 'intrapersonal',
  NATURALISTIC: 'naturalistic',
};

// Cognitive Processing Styles
const PROCESSING_STYLES = {
  SEQUENTIAL: 'sequential', // Step-by-step, linear
  GLOBAL: 'global', // Big picture first
  ACTIVE: 'active', // Learn by doing
  REFLECTIVE: 'reflective', // Learn by thinking
  SENSING: 'sensing', // Concrete, practical
  INTUITIVE: 'intuitive', // Abstract, theoretical
};

// Content presentation strategies for each learning style
const PRESENTATION_STRATEGIES = {
  [VARK_STYLES.VISUAL]: {
    preferences: [
      'diagrams',
      'charts',
      'graphs',
      'videos',
      'color_coding',
      'mind_maps',
      'infographics',
      'animations',
    ],
    avoid: ['long_text_blocks', 'audio_only'],
    instructions: 'Use visual aids, diagrams, and color-coded information',
  },
  [VARK_STYLES.AUDITORY]: {
    preferences: [
      'audio_explanations',
      'discussions',
      'verbal_instructions',
      'podcasts',
      'music_mnemonics',
      'read_aloud',
      'group_discussions',
    ],
    avoid: ['text_heavy', 'silent_reading'],
    instructions: 'Provide audio explanations, encourage discussion, read aloud',
  },
  [VARK_STYLES.READING_WRITING]: {
    preferences: [
      'written_notes',
      'articles',
      'essays',
      'lists',
      'definitions',
      'textbooks',
      'written_summaries',
      'note_taking',
    ],
    avoid: ['video_only', 'audio_only'],
    instructions: 'Provide detailed written materials, encourage note-taking',
  },
  [VARK_STYLES.KINESTHETIC]: {
    preferences: [
      'hands_on_activities',
      'experiments',
      'simulations',
      'physical_models',
      'role_playing',
      'movement',
      'real_world_examples',
      'interactive_demos',
    ],
    avoid: ['passive_reading', 'long_lectures'],
    instructions: 'Use interactive activities, experiments, and hands-on practice',
  },
};

// Behavioral indicators for learning style detection
const BEHAVIORAL_INDICATORS = {
  visual: {
    contentInteraction: {
      imageViews: 0.4,
      videoWatches: 0.3,
      diagramInteractions: 0.3,
      textReading: -0.2,
    },
    timeSpent: {
      visualContent: 0.5,
      textContent: -0.3,
    },
    performance: {
      visualQuestions: 0.3,
      textQuestions: -0.2,
    },
  },
  auditory: {
    contentInteraction: {
      audioPlays: 0.5,
      videoWatches: 0.2,
      readAloudUsage: 0.3,
      textReading: -0.2,
    },
    timeSpent: {
      audioContent: 0.5,
      silentReading: -0.3,
    },
    performance: {
      verbalExplanations: 0.3,
    },
  },
  reading_writing: {
    contentInteraction: {
      textReading: 0.5,
      noteTaking: 0.3,
      writtenResponses: 0.2,
      videoSkips: 0.1,
    },
    timeSpent: {
      textContent: 0.5,
      writingActivities: 0.3,
    },
    performance: {
      writtenQuestions: 0.3,
      essayTasks: 0.2,
    },
  },
  kinesthetic: {
    contentInteraction: {
      interactiveSimulations: 0.5,
      experiments: 0.3,
      practiceProblems: 0.2,
      passiveReading: -0.3,
    },
    timeSpent: {
      interactiveContent: 0.5,
      staticContent: -0.3,
    },
    performance: {
      practicalTasks: 0.4,
      theoreticalQuestions: -0.2,
    },
  },
};

/**
 * Learning Style Detector - Analyzes behavior to detect learning preferences
 */
export class LearningStyleDetector {
  constructor(storageKey = 'learning_style_profiles') {
    this.storageKey = storageKey;
    this.profiles = this.loadProfiles();
  }

  /**
   * Load learning style profiles
   */
  loadProfiles() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading learning style profiles:', error);
      return {};
    }
  }

  /**
   * Save learning style profiles
   */
  saveProfiles() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.profiles));
    } catch (error) {
      console.error('Error saving learning style profiles:', error);
    }
  }

  /**
   * Initialize profile for a student
   */
  initializeProfile(studentId) {
    if (this.profiles[studentId]) {
      return this.profiles[studentId];
    }

    this.profiles[studentId] = {
      studentId,
      varkScores: {
        [VARK_STYLES.VISUAL]: 0.25,
        [VARK_STYLES.AUDITORY]: 0.25,
        [VARK_STYLES.READING_WRITING]: 0.25,
        [VARK_STYLES.KINESTHETIC]: 0.25,
      },
      intelligences: Object.values(INTELLIGENCES).reduce((acc, intelligence) => {
        acc[intelligence] = 0.125; // Equal distribution initially
        return acc;
      }, {}),
      processingStyles: {
        [PROCESSING_STYLES.SEQUENTIAL]: 0.5,
        [PROCESSING_STYLES.GLOBAL]: 0.5,
        [PROCESSING_STYLES.ACTIVE]: 0.5,
        [PROCESSING_STYLES.REFLECTIVE]: 0.5,
        [PROCESSING_STYLES.SENSING]: 0.5,
        [PROCESSING_STYLES.INTUITIVE]: 0.5,
      },
      behaviorData: {
        contentInteractions: {},
        timeSpent: {},
        performanceByType: {},
        totalSessions: 0,
      },
      confidence: 0, // 0-100, how confident we are in the detection
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    this.saveProfiles();
    return this.profiles[studentId];
  }

  /**
   * Record behavioral data
   */
  recordBehavior(studentId, behavior) {
    const profile = this.initializeProfile(studentId);
    const { behaviorData } = profile;

    // Update content interactions
    if (behavior.contentType) {
      behaviorData.contentInteractions[behavior.contentType] =
        (behaviorData.contentInteractions[behavior.contentType] || 0) + 1;
    }

    // Update time spent
    if (behavior.timeSpent && behavior.activityType) {
      behaviorData.timeSpent[behavior.activityType] =
        (behaviorData.timeSpent[behavior.activityType] || 0) + behavior.timeSpent;
    }

    // Update performance by type
    if (behavior.questionType && behavior.correct !== undefined) {
      if (!behaviorData.performanceByType[behavior.questionType]) {
        behaviorData.performanceByType[behavior.questionType] = {
          correct: 0,
          total: 0,
        };
      }
      behaviorData.performanceByType[behavior.questionType].total++;
      if (behavior.correct) {
        behaviorData.performanceByType[behavior.questionType].correct++;
      }
    }

    behaviorData.totalSessions++;
    profile.lastUpdated = new Date().toISOString();

    // Recalculate learning style if we have enough data
    if (behaviorData.totalSessions >= 5) {
      this.calculateLearningStyle(studentId);
    }

    this.saveProfiles();
  }

  /**
   * Calculate learning style from behavioral data
   */
  calculateLearningStyle(studentId) {
    const profile = this.profiles[studentId];
    if (!profile) return null;

    const { behaviorData } = profile;
    const scores = {
      [VARK_STYLES.VISUAL]: 0,
      [VARK_STYLES.AUDITORY]: 0,
      [VARK_STYLES.READING_WRITING]: 0,
      [VARK_STYLES.KINESTHETIC]: 0,
    };

    // Calculate scores based on behavioral indicators
    Object.entries(BEHAVIORAL_INDICATORS).forEach(([style, indicators]) => {
      let score = 0;

      // Content interaction patterns
      Object.entries(indicators.contentInteraction).forEach(([contentType, weight]) => {
        const interactions = behaviorData.contentInteractions[contentType] || 0;
        score += interactions * weight;
      });

      // Time spent patterns
      Object.entries(indicators.timeSpent).forEach(([activityType, weight]) => {
        const time = behaviorData.timeSpent[activityType] || 0;
        score += (time / 60) * weight; // Convert to minutes
      });

      // Performance patterns
      Object.entries(indicators.performance).forEach(([questionType, weight]) => {
        const perf = behaviorData.performanceByType[questionType];
        if (perf && perf.total > 0) {
          const accuracy = perf.correct / perf.total;
          score += accuracy * weight * 10;
        }
      });

      scores[style] = Math.max(0, score);
    });

    // Normalize scores to sum to 1
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    if (total > 0) {
      Object.keys(scores).forEach(style => {
        scores[style] = scores[style] / total;
      });
    } else {
      // If no clear preference, default to equal distribution
      Object.keys(scores).forEach(style => {
        scores[style] = 0.25;
      });
    }

    profile.varkScores = scores;

    // Calculate confidence based on data quantity and clarity
    const dataPoints = behaviorData.totalSessions;
    const scoreVariance = this.calculateVariance(Object.values(scores));

    // Higher variance = clearer preference = higher confidence
    // More data points = higher confidence
    profile.confidence = Math.min(
      100,
      (dataPoints / 20) * 50 + scoreVariance * 50
    );

    this.saveProfiles();

    return {
      primaryStyle: this.getPrimaryStyle(studentId),
      scores,
      confidence: profile.confidence,
    };
  }

  /**
   * Calculate variance of scores (higher = more distinct preferences)
   */
  calculateVariance(scores) {
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const squaredDiffs = scores.map(score => Math.pow(score - mean, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / scores.length;

    // Normalize variance to 0-1 range (theoretical max variance is 0.1875 for 4 values summing to 1)
    return Math.min(1, variance / 0.1875);
  }

  /**
   * Get primary learning style
   */
  getPrimaryStyle(studentId) {
    const profile = this.profiles[studentId];
    if (!profile) return null;

    let maxScore = 0;
    let primaryStyle = null;

    Object.entries(profile.varkScores).forEach(([style, score]) => {
      if (score > maxScore) {
        maxScore = score;
        primaryStyle = style;
      }
    });

    return {
      style: primaryStyle,
      score: maxScore,
      confidence: profile.confidence,
      multimodal: maxScore < 0.4, // If no dominant style (< 40%), student is multimodal
    };
  }

  /**
   * Get learning style profile
   */
  getProfile(studentId) {
    const profile = this.profiles[studentId];
    if (!profile) return null;

    return {
      ...profile,
      primaryStyle: this.getPrimaryStyle(studentId),
      recommendations: this.getRecommendations(studentId),
    };
  }

  /**
   * Get personalized recommendations
   */
  getRecommendations(studentId) {
    const primary = this.getPrimaryStyle(studentId);
    if (!primary || !primary.style) return [];

    const strategies = PRESENTATION_STRATEGIES[primary.style];
    if (!strategies) return [];

    return {
      style: primary.style,
      preferences: strategies.preferences,
      avoid: strategies.avoid,
      instructions: strategies.instructions,
      confidence: primary.confidence,
    };
  }

  /**
   * Administer learning style assessment
   */
  createAssessment() {
    return {
      title: 'Learning Style Assessment',
      description: 'Help us understand how you learn best!',
      questions: [
        {
          id: 'q1',
          question: 'When learning something new, I prefer to:',
          type: 'single_choice',
          options: [
            { id: 'visual', text: 'See diagrams and pictures', style: VARK_STYLES.VISUAL },
            { id: 'auditory', text: 'Hear explanations', style: VARK_STYLES.AUDITORY },
            { id: 'reading', text: 'Read detailed instructions', style: VARK_STYLES.READING_WRITING },
            { id: 'kinesthetic', text: 'Try it myself hands-on', style: VARK_STYLES.KINESTHETIC },
          ],
        },
        {
          id: 'q2',
          question: 'I remember things best when I:',
          type: 'single_choice',
          options: [
            { id: 'visual', text: 'Can visualize them in my mind', style: VARK_STYLES.VISUAL },
            { id: 'auditory', text: 'Hear them spoken or explained', style: VARK_STYLES.AUDITORY },
            { id: 'reading', text: 'Write them down or read about them', style: VARK_STYLES.READING_WRITING },
            { id: 'kinesthetic', text: 'Practice or experience them', style: VARK_STYLES.KINESTHETIC },
          ],
        },
        {
          id: 'q3',
          question: 'When studying, I like to:',
          type: 'single_choice',
          options: [
            { id: 'visual', text: 'Use colorful notes and mind maps', style: VARK_STYLES.VISUAL },
            { id: 'auditory', text: 'Discuss topics with others or listen to recordings', style: VARK_STYLES.AUDITORY },
            { id: 'reading', text: 'Read textbooks and take detailed notes', style: VARK_STYLES.READING_WRITING },
            { id: 'kinesthetic', text: 'Do practice problems or experiments', style: VARK_STYLES.KINESTHETIC },
          ],
        },
        {
          id: 'q4',
          question: 'I learn math best through:',
          type: 'single_choice',
          options: [
            { id: 'visual', text: 'Visual representations and graphs', style: VARK_STYLES.VISUAL },
            { id: 'auditory', text: 'Verbal explanations of steps', style: VARK_STYLES.AUDITORY },
            { id: 'reading', text: 'Written formulas and examples', style: VARK_STYLES.READING_WRITING },
            { id: 'kinesthetic', text: 'Working through problems myself', style: VARK_STYLES.KINESTHETIC },
          ],
        },
        {
          id: 'q5',
          question: 'When given directions, I prefer:',
          type: 'single_choice',
          options: [
            { id: 'visual', text: 'A map or diagram', style: VARK_STYLES.VISUAL },
            { id: 'auditory', text: 'Spoken instructions', style: VARK_STYLES.AUDITORY },
            { id: 'reading', text: 'Written step-by-step directions', style: VARK_STYLES.READING_WRITING },
            { id: 'kinesthetic', text: 'Someone to show me or go with me', style: VARK_STYLES.KINESTHETIC },
          ],
        },
        {
          id: 'q6',
          question: 'In class, I learn best from:',
          type: 'single_choice',
          options: [
            { id: 'visual', text: 'Videos, presentations, and demonstrations', style: VARK_STYLES.VISUAL },
            { id: 'auditory', text: 'Lectures and discussions', style: VARK_STYLES.AUDITORY },
            { id: 'reading', text: 'Textbooks and handouts', style: VARK_STYLES.READING_WRITING },
            { id: 'kinesthetic', text: 'Lab work and group activities', style: VARK_STYLES.KINESTHETIC },
          ],
        },
        {
          id: 'q7',
          question: 'When solving a problem, I:',
          type: 'single_choice',
          options: [
            { id: 'sequential', text: 'Work through it step-by-step', style: PROCESSING_STYLES.SEQUENTIAL },
            { id: 'global', text: 'Need to understand the big picture first', style: PROCESSING_STYLES.GLOBAL },
          ],
        },
        {
          id: 'q8',
          question: 'I understand concepts better when they are:',
          type: 'single_choice',
          options: [
            { id: 'sensing', text: 'Practical and connected to real life', style: PROCESSING_STYLES.SENSING },
            { id: 'intuitive', text: 'Theoretical and abstract', style: PROCESSING_STYLES.INTUITIVE },
          ],
        },
      ],
    };
  }

  /**
   * Score assessment results
   */
  scoreAssessment(studentId, responses) {
    const profile = this.initializeProfile(studentId);
    const scores = {
      [VARK_STYLES.VISUAL]: 0,
      [VARK_STYLES.AUDITORY]: 0,
      [VARK_STYLES.READING_WRITING]: 0,
      [VARK_STYLES.KINESTHETIC]: 0,
    };

    const processingScores = {
      [PROCESSING_STYLES.SEQUENTIAL]: 0,
      [PROCESSING_STYLES.GLOBAL]: 0,
      [PROCESSING_STYLES.SENSING]: 0,
      [PROCESSING_STYLES.INTUITIVE]: 0,
    };

    // Count responses for each style
    responses.forEach(response => {
      const style = response.selectedStyle;
      if (Object.values(VARK_STYLES).includes(style)) {
        scores[style]++;
      } else if (Object.values(PROCESSING_STYLES).includes(style)) {
        processingScores[style]++;
      }
    });

    // Normalize VARK scores
    const varkTotal = Object.values(scores).reduce((sum, score) => sum + score, 0);
    if (varkTotal > 0) {
      Object.keys(scores).forEach(style => {
        scores[style] = scores[style] / varkTotal;
      });
    }

    // Normalize processing scores
    Object.entries(processingScores).forEach(([style, score]) => {
      if (style === PROCESSING_STYLES.SEQUENTIAL || style === PROCESSING_STYLES.GLOBAL) {
        const total = processingScores[PROCESSING_STYLES.SEQUENTIAL] + processingScores[PROCESSING_STYLES.GLOBAL];
        if (total > 0) {
          profile.processingStyles[PROCESSING_STYLES.SEQUENTIAL] = processingScores[PROCESSING_STYLES.SEQUENTIAL] / total;
          profile.processingStyles[PROCESSING_STYLES.GLOBAL] = processingScores[PROCESSING_STYLES.GLOBAL] / total;
        }
      } else if (style === PROCESSING_STYLES.SENSING || style === PROCESSING_STYLES.INTUITIVE) {
        const total = processingScores[PROCESSING_STYLES.SENSING] + processingScores[PROCESSING_STYLES.INTUITIVE];
        if (total > 0) {
          profile.processingStyles[PROCESSING_STYLES.SENSING] = processingScores[PROCESSING_STYLES.SENSING] / total;
          profile.processingStyles[PROCESSING_STYLES.INTUITIVE] = processingScores[PROCESSING_STYLES.INTUITIVE] / total;
        }
      }
    });

    profile.varkScores = scores;
    profile.confidence = 60; // Assessment provides medium confidence, behavior data improves it
    profile.lastUpdated = new Date().toISOString();

    this.saveProfiles();

    return {
      primaryStyle: this.getPrimaryStyle(studentId),
      scores,
      processingStyles: profile.processingStyles,
      confidence: profile.confidence,
    };
  }
}

/**
 * Content Adapter - Adapts content presentation based on learning style
 */
export class ContentAdapter {
  constructor(detector) {
    this.detector = detector;
  }

  /**
   * Adapt content for student's learning style
   */
  adaptContent(studentId, content) {
    const profile = this.detector.getProfile(studentId);
    if (!profile) {
      return content; // Return unchanged if no profile
    }

    const primary = profile.primaryStyle;
    if (!primary || primary.confidence < 30) {
      return content; // Not enough confidence to adapt
    }

    const adapted = { ...content };

    // Add style-specific enhancements
    switch (primary.style) {
      case VARK_STYLES.VISUAL:
        adapted.visualEnhancements = this.addVisualEnhancements(content);
        adapted.presentationOrder = ['image', 'video', 'diagram', 'text', 'audio'];
        adapted.textFormatting = {
          useColorCoding: true,
          useBulletPoints: true,
          useHighlighting: true,
        };
        break;

      case VARK_STYLES.AUDITORY:
        adapted.audioEnhancements = this.addAudioEnhancements(content);
        adapted.presentationOrder = ['audio', 'video', 'text', 'image'];
        adapted.textFormatting = {
          enableReadAloud: true,
          includeVerbalsummary: true,
        };
        break;

      case VARK_STYLES.READING_WRITING:
        adapted.textEnhancements = this.addTextEnhancements(content);
        adapted.presentationOrder = ['text', 'article', 'notes', 'image', 'video'];
        adapted.textFormatting = {
          detailedExplanations: true,
          includeWritingPrompts: true,
          provideSummaryTemplates: true,
        };
        break;

      case VARK_STYLES.KINESTHETIC:
        adapted.interactiveEnhancements = this.addInteractiveEnhancements(content);
        adapted.presentationOrder = ['interactive', 'simulation', 'practice', 'video', 'text'];
        adapted.textFormatting = {
          includeHandsOnActivities: true,
          addRealWorldExamples: true,
          breakIntoSteps: true,
        };
        break;
    }

    // Add processing style adaptations
    if (profile.processingStyles[PROCESSING_STYLES.SEQUENTIAL] > 0.6) {
      adapted.structure = 'linear';
      adapted.showProgressSteps = true;
    } else if (profile.processingStyles[PROCESSING_STYLES.GLOBAL] > 0.6) {
      adapted.structure = 'overview_first';
      adapted.showBigPicture = true;
    }

    adapted.adaptedFor = primary.style;
    adapted.confidence = primary.confidence;

    return adapted;
  }

  /**
   * Add visual enhancements
   */
  addVisualEnhancements(content) {
    return {
      suggestDiagrams: true,
      suggestMindMaps: true,
      suggestInfographics: true,
      colorCode: {
        keyTerms: '#3B82F6',
        examples: '#10B981',
        warnings: '#EF4444',
        tips: '#F59E0B',
      },
      visualAids: [
        'Add diagrams to illustrate concepts',
        'Use charts for data presentation',
        'Include visual timelines for sequences',
        'Provide color-coded notes',
      ],
    };
  }

  /**
   * Add audio enhancements
   */
  addAudioEnhancements(content) {
    return {
      enableTextToSpeech: true,
      suggestDiscussions: true,
      suggestVerbalization: true,
      audioTips: [
        'Read content aloud',
        'Discuss with others',
        'Listen to audio explanations',
        'Create verbal mnemonics',
      ],
    };
  }

  /**
   * Add text enhancements
   */
  addTextEnhancements(content) {
    return {
      provideDetailedNotes: true,
      includeGlossary: true,
      addWritingPrompts: true,
      textTips: [
        'Take detailed written notes',
        'Create outlines and summaries',
        'Write explanations in your own words',
        'Make lists and bullet points',
      ],
    };
  }

  /**
   * Add interactive enhancements
   */
  addInteractiveEnhancements(content) {
    return {
      suggestHandsOn: true,
      includeSimulations: true,
      addPracticeProblems: true,
      interactiveTips: [
        'Try hands-on experiments',
        'Work through practice problems',
        'Use interactive simulations',
        'Apply concepts to real situations',
      ],
    };
  }

  /**
   * Get study recommendations based on learning style
   */
  getStudyRecommendations(studentId, topic) {
    const profile = this.detector.getProfile(studentId);
    if (!profile || !profile.primaryStyle) {
      return this.getDefaultRecommendations(topic);
    }

    const style = profile.primaryStyle.style;
    const recommendations = {
      topic,
      style,
      activities: [],
      resources: [],
      strategies: [],
    };

    switch (style) {
      case VARK_STYLES.VISUAL:
        recommendations.activities = [
          `Create a mind map of ${topic} concepts`,
          `Watch educational videos about ${topic}`,
          `Draw diagrams to illustrate key ideas`,
          `Use color-coding in your notes`,
        ];
        recommendations.resources = ['Educational videos', 'Infographics', 'Diagrams', 'Visual tutorials'];
        recommendations.strategies = [
          'Use visual organizers',
          'Create concept maps',
          'Study with charts and graphs',
          'Visualize information',
        ];
        break;

      case VARK_STYLES.AUDITORY:
        recommendations.activities = [
          `Discuss ${topic} with classmates or friends`,
          `Listen to podcasts or audio lessons about ${topic}`,
          `Read your notes aloud`,
          `Create verbal mnemonics for key concepts`,
        ];
        recommendations.resources = ['Podcasts', 'Audio lectures', 'Discussion groups', 'Read-aloud tools'];
        recommendations.strategies = [
          'Study in groups',
          'Record and replay lessons',
          'Use verbal repetition',
          'Explain concepts out loud',
        ];
        break;

      case VARK_STYLES.READING_WRITING:
        recommendations.activities = [
          `Write detailed notes about ${topic}`,
          `Read articles and textbooks on ${topic}`,
          `Create study guides and outlines`,
          `Write practice essays or summaries`,
        ];
        recommendations.resources = ['Textbooks', 'Articles', 'Written guides', 'Note-taking apps'];
        recommendations.strategies = [
          'Take comprehensive notes',
          'Rewrite information',
          'Create glossaries',
          'Write summaries',
        ];
        break;

      case VARK_STYLES.KINESTHETIC:
        recommendations.activities = [
          `Do hands-on experiments related to ${topic}`,
          `Work through practice problems`,
          `Create physical models or demonstrations`,
          `Take study breaks with movement`,
        ];
        recommendations.resources = ['Interactive simulations', 'Lab activities', 'Practice problems', 'Physical models'];
        recommendations.strategies = [
          'Learn by doing',
          'Take frequent breaks',
          'Use real-world examples',
          'Practice immediately',
        ];
        break;
    }

    return recommendations;
  }

  /**
   * Get default recommendations when style is unknown
   */
  getDefaultRecommendations(topic) {
    return {
      topic,
      style: 'multimodal',
      activities: [
        `Try different study methods for ${topic}`,
        `Mix visual, auditory, and hands-on approaches`,
        `See which methods work best for you`,
      ],
      resources: ['Variety of content types', 'Multi-format materials'],
      strategies: [
        'Experiment with different techniques',
        'Use multiple senses',
        'Find what works for you',
      ],
    };
  }
}

export { VARK_STYLES, INTELLIGENCES, PROCESSING_STYLES, PRESENTATION_STRATEGIES };
export default LearningStyleDetector;
