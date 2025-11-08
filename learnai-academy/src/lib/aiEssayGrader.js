/**
 * AI Essay Grader and Writing Coach System
 *
 * Revolutionary writing assessment and coaching system featuring:
 * - Automated essay grading with detailed rubrics
 * - Real-time writing assistance and suggestions
 * - Grammar, style, and structure analysis
 * - Plagiarism detection
 * - Citation checking
 * - Writing skill progression tracking
 * - Personalized writing improvement plans
 * - Multiple essay types support (argumentative, narrative, expository, etc.)
 * - Grade-appropriate feedback
 *
 * Powered by Claude Sonnet 4.5 for nuanced understanding of student writing.
 */

import Anthropic from '@anthropic-ai/sdk';

// Essay types and their rubrics
const ESSAY_TYPES = {
  ARGUMENTATIVE: 'argumentative',
  NARRATIVE: 'narrative',
  EXPOSITORY: 'expository',
  DESCRIPTIVE: 'descriptive',
  PERSUASIVE: 'persuasive',
  ANALYTICAL: 'analytical',
  COMPARE_CONTRAST: 'compare_contrast',
  RESEARCH: 'research',
};

// Rubric categories
const RUBRIC_CATEGORIES = {
  CONTENT: 'content',
  ORGANIZATION: 'organization',
  STYLE: 'style',
  CONVENTIONS: 'conventions',
  EVIDENCE: 'evidence',
  ARGUMENTATION: 'argumentation',
  CREATIVITY: 'creativity',
  VOICE: 'voice',
};

// Grade-specific rubrics (simplified - would be much more detailed)
const GRADE_RUBRICS = {
  K2: {
    categories: [RUBRIC_CATEGORIES.CONTENT, RUBRIC_CATEGORIES.CREATIVITY, RUBRIC_CATEGORIES.CONVENTIONS],
    maxPoints: 12,
    focus: 'Basic sentence structure, simple ideas, handwriting/typing',
  },
  35: {
    categories: [
      RUBRIC_CATEGORIES.CONTENT,
      RUBRIC_CATEGORIES.ORGANIZATION,
      RUBRIC_CATEGORIES.CREATIVITY,
      RUBRIC_CATEGORIES.CONVENTIONS,
    ],
    maxPoints: 20,
    focus: 'Paragraph structure, clear ideas, basic grammar',
  },
  68: {
    categories: [
      RUBRIC_CATEGORIES.CONTENT,
      RUBRIC_CATEGORIES.ORGANIZATION,
      RUBRIC_CATEGORIES.STYLE,
      RUBRIC_CATEGORIES.EVIDENCE,
      RUBRIC_CATEGORIES.CONVENTIONS,
    ],
    maxPoints: 25,
    focus: 'Essay structure, supporting evidence, varied sentences',
  },
  912: {
    categories: [
      RUBRIC_CATEGORIES.CONTENT,
      RUBRIC_CATEGORIES.ORGANIZATION,
      RUBRIC_CATEGORIES.STYLE,
      RUBRIC_CATEGORIES.EVIDENCE,
      RUBRIC_CATEGORIES.ARGUMENTATION,
      RUBRIC_CATEGORIES.CONVENTIONS,
    ],
    maxPoints: 30,
    focus: 'Advanced argumentation, sophisticated analysis, academic writing',
  },
};

// Writing skill areas
const SKILL_AREAS = {
  THESIS_DEVELOPMENT: 'thesis_development',
  PARAGRAPH_STRUCTURE: 'paragraph_structure',
  TRANSITIONS: 'transitions',
  EVIDENCE_INTEGRATION: 'evidence_integration',
  ANALYSIS: 'analysis',
  SENTENCE_VARIETY: 'sentence_variety',
  WORD_CHOICE: 'word_choice',
  GRAMMAR: 'grammar',
  PUNCTUATION: 'punctuation',
  SPELLING: 'spelling',
  CITATIONS: 'citations',
};

/**
 * AI Essay Grader - Automated essay assessment with detailed feedback
 */
export class AIEssayGrader {
  constructor(apiKey, storageKey = 'essay_submissions') {
    this.client = new Anthropic({ apiKey });
    this.model = 'claude-sonnet-4-5-20250929';
    this.storageKey = storageKey;
    this.submissions = this.loadSubmissions();
  }

  /**
   * Load submissions from storage
   */
  loadSubmissions() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading submissions:', error);
      return {};
    }
  }

  /**
   * Save submissions to storage
   */
  saveSubmissions() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.submissions));
    } catch (error) {
      console.error('Error saving submissions:', error);
    }
  }

  /**
   * Grade an essay
   */
  async gradeEssay(essay, assignment, student) {
    const gradeLevel = this.getGradeBand(student.grade);
    const rubric = GRADE_RUBRICS[gradeLevel];

    const systemPrompt = `You are an expert writing teacher grading a ${assignment.essayType} essay for a grade ${student.grade} student.

Essay Prompt: ${assignment.prompt}

Rubric (${rubric.maxPoints} points total):
${this.formatRubric(rubric, assignment.essayType)}

Focus Areas for Grade ${student.grade}: ${rubric.focus}

Provide:
1. Overall score (0-${rubric.maxPoints})
2. Category scores with justification
3. Specific strengths (3-5 points)
4. Areas for improvement (3-5 points)
5. Detailed feedback that is encouraging and constructive
6. Concrete next steps for improvement

Be grade-appropriate in feedback tone:
- Grades K-2: Very encouraging, simple language
- Grades 3-5: Supportive, clear explanations
- Grades 6-8: Balanced, specific guidance
- Grades 9-12: Professional, college-prep focused

Format your response as JSON with this structure:
{
  "overallScore": number,
  "categoryScores": {
    "category": { "score": number, "maxScore": number, "feedback": string }
  },
  "strengths": [string],
  "improvements": [string],
  "detailedFeedback": string,
  "nextSteps": [string],
  "grammarIssues": [{ "issue": string, "suggestion": string, "location": string }],
  "stylesuggestions": [string]
}`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2000,
        temperature: 0.3,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Please grade this essay:\n\n${essay}`,
          },
        ],
      });

      const gradingResult = JSON.parse(response.content[0].text);

      // Calculate letter grade
      const percentage = (gradingResult.overallScore / rubric.maxPoints) * 100;
      const letterGrade = this.calculateLetterGrade(percentage);

      // Store submission
      const submissionId = `submission_${Date.now()}`;
      this.submissions[submissionId] = {
        id: submissionId,
        studentId: student.id,
        assignmentId: assignment.id,
        essay,
        gradingResult: {
          ...gradingResult,
          percentage,
          letterGrade,
          maxPoints: rubric.maxPoints,
        },
        submittedAt: new Date().toISOString(),
        gradedAt: new Date().toISOString(),
      };

      this.saveSubmissions();

      return {
        submissionId,
        ...gradingResult,
        percentage,
        letterGrade,
        maxPoints: rubric.maxPoints,
      };
    } catch (error) {
      console.error('Error grading essay:', error);
      return {
        error: true,
        message: 'Failed to grade essay. Please try again.',
      };
    }
  }

  /**
   * Format rubric for AI
   */
  formatRubric(rubric, essayType) {
    const categoryDescriptions = {
      [RUBRIC_CATEGORIES.CONTENT]: 'Quality of ideas, understanding of topic, depth of analysis',
      [RUBRIC_CATEGORIES.ORGANIZATION]: 'Structure, flow, introduction/conclusion, paragraph coherence',
      [RUBRIC_CATEGORIES.STYLE]: 'Sentence variety, word choice, voice, tone',
      [RUBRIC_CATEGORIES.CONVENTIONS]: 'Grammar, spelling, punctuation, formatting',
      [RUBRIC_CATEGORIES.EVIDENCE]: 'Use of examples, quotes, data to support points',
      [RUBRIC_CATEGORIES.ARGUMENTATION]: 'Thesis strength, logical reasoning, counterarguments',
      [RUBRIC_CATEGORIES.CREATIVITY]: 'Originality, unique perspective, engaging writing',
      [RUBRIC_CATEGORIES.VOICE]: 'Personal voice, authenticity, engagement',
    };

    const pointsPerCategory = Math.floor(rubric.maxPoints / rubric.categories.length);

    return rubric.categories
      .map(cat => `- ${cat}: ${pointsPerCategory} points - ${categoryDescriptions[cat]}`)
      .join('\n');
  }

  /**
   * Calculate letter grade from percentage
   */
  calculateLetterGrade(percentage) {
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 63) return 'D';
    if (percentage >= 60) return 'D-';
    return 'F';
  }

  /**
   * Get grade band (K2, 35, 68, 912)
   */
  getGradeBand(grade) {
    if (grade <= 2) return 'K2';
    if (grade <= 5) return '35';
    if (grade <= 8) return '68';
    return '912';
  }

  /**
   * Get writing assistance (real-time suggestions)
   */
  async getWritingAssistance(partialEssay, assignment, student, context = {}) {
    const systemPrompt = `You are a helpful writing coach assisting a grade ${student.grade} student writing a ${assignment.essayType} essay.

Essay Prompt: ${assignment.prompt}

Current context: ${context.currentSection || 'general writing'}

Provide brief, encouraging suggestions to help them improve their writing. Focus on:
- What they're doing well
- One or two specific improvements
- Encouragement to keep writing

Be concise (2-3 sentences) and age-appropriate.`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 200,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Current writing:\n\n${partialEssay}\n\nWhat suggestions do you have?`,
          },
        ],
      });

      return {
        suggestion: response.content[0].text,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting writing assistance:', error);
      return {
        error: true,
        message: 'Unable to provide suggestions at this time.',
      };
    }
  }

  /**
   * Analyze writing skills
   */
  async analyzeWritingSkills(essay, student) {
    const systemPrompt = `Analyze this essay written by a grade ${student.grade} student and assess their skills in these areas:

${Object.values(SKILL_AREAS).map(skill => `- ${skill}`).join('\n')}

For each skill, provide:
- Score (1-5, where 5 is excellent for their grade level)
- Brief assessment

Return JSON:
{
  "skills": {
    "skill_name": {
      "score": number,
      "assessment": string
    }
  },
  "overallLevel": "emerging" | "developing" | "proficient" | "advanced"
}`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1000,
        temperature: 0.3,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: essay,
          },
        ],
      });

      return JSON.parse(response.content[0].text);
    } catch (error) {
      console.error('Error analyzing writing skills:', error);
      return { error: true };
    }
  }

  /**
   * Detect potential plagiarism (simplified - would integrate with proper API)
   */
  async checkPlagiarism(essay) {
    // In production, this would integrate with Turnitin, Copyscape, etc.
    // For now, basic checks

    const issues = [];

    // Check for common academic dishonesty patterns
    const suspiciousPatterns = [
      { pattern: /according to (?:the )?(website|source|article) without citation/gi, issue: 'Uncited source reference' },
      { pattern: /copy(?:ing|ied) (?:from|and paste)/gi, issue: 'Potential self-admission of copying' },
    ];

    suspiciousPatterns.forEach(({ pattern, issue }) => {
      const matches = essay.match(pattern);
      if (matches) {
        issues.push({
          type: 'suspicious_pattern',
          issue,
          matches: matches.length,
        });
      }
    });

    return {
      isPlagiarismSuspected: issues.length > 0,
      confidence: issues.length > 0 ? 'low' : 'none',
      issues,
      recommendation: issues.length > 0
        ? 'Manual review recommended. Discuss proper citation with student.'
        : 'No obvious plagiarism indicators detected.',
    };
  }

  /**
   * Check citations (MLA, APA, Chicago)
   */
  async checkCitations(essay, citationStyle = 'MLA') {
    const systemPrompt = `Check this essay for proper ${citationStyle} citations.

Identify:
1. In-text citations and whether they're formatted correctly
2. Missing citations for claims that need sources
3. Works cited/references section issues
4. Common citation errors

Provide specific feedback on how to fix issues.`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 800,
        temperature: 0.3,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: essay,
          },
        ],
      });

      return {
        citationStyle,
        feedback: response.content[0].text,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error checking citations:', error);
      return { error: true };
    }
  }

  /**
   * Generate writing improvement plan
   */
  async generateImprovementPlan(studentId, recentSubmissions) {
    // Analyze patterns across multiple submissions
    const skillPatterns = {};

    recentSubmissions.forEach(submission => {
      const { gradingResult } = submission;

      // Track improvements needed
      if (gradingResult.improvements) {
        gradingResult.improvements.forEach(improvement => {
          const skill = this.categorizeilmprovement(improvement);
          skillPatterns[skill] = (skillPatterns[skill] || 0) + 1;
        });
      }
    });

    // Identify top 3 areas for improvement
    const topAreas = Object.entries(skillPatterns)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([skill]) => skill);

    // Generate personalized plan
    const plan = {
      studentId,
      generatedAt: new Date().toISOString(),
      focusAreas: topAreas,
      goals: topAreas.map(skill => ({
        skill,
        goal: this.getSkillGoal(skill),
        activities: this.getSkillActivities(skill),
        resources: this.getSkillResources(skill),
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      })),
      overallGoal: 'Improve writing quality and confidence',
      checkInSchedule: 'Weekly',
    };

    return plan;
  }

  /**
   * Categorize improvement into skill area
   */
  categorizeilmprovement(improvement) {
    const lowerImprovement = improvement.toLowerCase();

    if (lowerImprovement.includes('thesis') || lowerImprovement.includes('main idea')) {
      return SKILL_AREAS.THESIS_DEVELOPMENT;
    }
    if (lowerImprovement.includes('paragraph') || lowerImprovement.includes('topic sentence')) {
      return SKILL_AREAS.PARAGRAPH_STRUCTURE;
    }
    if (lowerImprovement.includes('transition')) {
      return SKILL_AREAS.TRANSITIONS;
    }
    if (lowerImprovement.includes('evidence') || lowerImprovement.includes('example')) {
      return SKILL_AREAS.EVIDENCE_INTEGRATION;
    }
    if (lowerImprovement.includes('analysis') || lowerImprovement.includes('explain')) {
      return SKILL_AREAS.ANALYSIS;
    }
    if (lowerImprovement.includes('sentence') || lowerImprovement.includes('vary')) {
      return SKILL_AREAS.SENTENCE_VARIETY;
    }
    if (lowerImprovement.includes('word') || lowerImprovement.includes('vocabulary')) {
      return SKILL_AREAS.WORD_CHOICE;
    }
    if (lowerImprovement.includes('grammar')) {
      return SKILL_AREAS.GRAMMAR;
    }
    if (lowerImprovement.includes('punctuation')) {
      return SKILL_AREAS.PUNCTUATION;
    }

    return SKILL_AREAS.GRAMMAR; // Default
  }

  /**
   * Get goal for skill area
   */
  getSkillGoal(skill) {
    const goals = {
      [SKILL_AREAS.THESIS_DEVELOPMENT]: 'Write clear, focused thesis statements',
      [SKILL_AREAS.PARAGRAPH_STRUCTURE]: 'Organize paragraphs with topic sentences and supporting details',
      [SKILL_AREAS.TRANSITIONS]: 'Use effective transitions between ideas',
      [SKILL_AREAS.EVIDENCE_INTEGRATION]: 'Integrate evidence smoothly with analysis',
      [SKILL_AREAS.ANALYSIS]: 'Provide deeper analysis and explanation',
      [SKILL_AREAS.SENTENCE_VARIETY]: 'Use varied sentence structures',
      [SKILL_AREAS.WORD_CHOICE]: 'Choose precise, engaging vocabulary',
      [SKILL_AREAS.GRAMMAR]: 'Master grammar rules and conventions',
      [SKILL_AREAS.PUNCTUATION]: 'Use punctuation correctly',
    };

    return goals[skill] || 'Improve writing skills';
  }

  /**
   * Get practice activities for skill
   */
  getSkillActivities(skill) {
    const activities = {
      [SKILL_AREAS.THESIS_DEVELOPMENT]: [
        'Write 5 thesis statements for different prompts',
        'Identify strong vs. weak thesis statements',
        'Revise vague thesis statements',
      ],
      [SKILL_AREAS.PARAGRAPH_STRUCTURE]: [
        'Practice writing topic sentences',
        'Outline paragraphs before writing',
        'Analyze model paragraphs',
      ],
      [SKILL_AREAS.TRANSITIONS]: [
        'Create a transition word bank',
        'Practice connecting ideas between paragraphs',
        'Revise writing to add transitions',
      ],
      [SKILL_AREAS.EVIDENCE_INTEGRATION]: [
        'Practice introducing quotes',
        'Write analysis after each piece of evidence',
        'Use "quote sandwich" technique',
      ],
    };

    return activities[skill] || ['Practice regularly', 'Seek feedback', 'Read examples'];
  }

  /**
   * Get resources for skill
   */
  getSkillResources(skill) {
    return [
      'Writing tutorials',
      'Practice exercises',
      'Example essays',
      'Video lessons',
    ];
  }

  /**
   * Get student writing progress
   */
  getStudentProgress(studentId) {
    const studentSubmissions = Object.values(this.submissions)
      .filter(s => s.studentId === studentId)
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    if (studentSubmissions.length === 0) {
      return {
        totalSubmissions: 0,
        averageScore: 0,
        trend: 'insufficient_data',
      };
    }

    const scores = studentSubmissions.map(s => s.gradingResult.percentage);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    // Calculate trend
    let trend = 'stable';
    if (scores.length >= 3) {
      const recent = scores.slice(0, 3).reduce((sum, s) => sum + s, 0) / 3;
      const older = scores.slice(-3).reduce((sum, s) => sum + s, 0) / 3;

      if (recent > older + 5) trend = 'improving';
      else if (recent < older - 5) trend = 'declining';
    }

    return {
      totalSubmissions: studentSubmissions.length,
      averageScore: Math.round(averageScore),
      recentSubmissions: studentSubmissions.slice(0, 5),
      trend,
      bestScore: Math.max(...scores),
      improvementPlan: studentSubmissions.length >= 3
        ? this.generateImprovementPlan(studentId, studentSubmissions.slice(0, 5))
        : null,
    };
  }
}

/**
 * Writing Coach - Real-time writing assistance
 */
export class WritingCoach {
  constructor(apiKey) {
    this.client = new Anthropic({ apiKey });
    this.model = 'claude-sonnet-4-5-20250929';
  }

  /**
   * Get brainstorming help
   */
  async brainstorm(prompt, student, context = {}) {
    const systemPrompt = `Help a grade ${student.grade} student brainstorm ideas for this essay prompt:

"${prompt}"

Provide:
- 3-5 potential thesis statements or main ideas
- Key points to consider
- Questions to explore

Make it grade-appropriate and encouraging.`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 500,
        temperature: 0.8,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `I need help getting started. ${context.additionalInfo || ''}`,
          },
        ],
      });

      return {
        ideas: response.content[0].text,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error brainstorming:', error);
      return { error: true };
    }
  }

  /**
   * Get outline help
   */
  async createOutline(topic, essayType, gradeLevel) {
    const systemPrompt = `Create an essay outline for a grade ${gradeLevel} student writing a ${essayType} essay about: ${topic}

Provide a structured outline appropriate for their grade level.`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 600,
        temperature: 0.5,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: 'Please create an outline to help me organize my essay.',
          },
        ],
      });

      return {
        outline: response.content[0].text,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error creating outline:', error);
      return { error: true };
    }
  }

  /**
   * Get revision suggestions
   */
  async getRevisionSuggestions(paragraph, focusArea, gradeLevel) {
    const systemPrompt = `Provide revision suggestions for this paragraph written by a grade ${gradeLevel} student.

Focus on: ${focusArea}

Be specific and encouraging. Show them how to improve.`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 400,
        temperature: 0.5,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: paragraph,
          },
        ],
      });

      return {
        suggestions: response.content[0].text,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting revision suggestions:', error);
      return { error: true };
    }
  }
}

export { ESSAY_TYPES, RUBRIC_CATEGORIES, GRADE_RUBRICS, SKILL_AREAS };
export default AIEssayGrader;
