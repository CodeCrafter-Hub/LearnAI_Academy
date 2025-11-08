/**
 * AI Tutor System
 * Real-time intelligent tutoring that helps students when they're stuck
 */

import Anthropic from '@anthropic-ai/sdk';

/**
 * AI Tutor - Provides personalized, real-time help to students
 */
export class AITutor {
  constructor(apiKey) {
    this.client = new Anthropic({ apiKey });
    this.model = 'claude-sonnet-4-5-20250929';
    this.conversationHistory = new Map(); // studentId -> conversation
  }

  /**
   * Get help with a specific question
   */
  async getHelp(student, question, context = {}) {
    const {
      attempts = 0,
      previousAnswers = [],
      topic = null,
      difficulty = null,
      learningObjectives = [],
    } = context;

    const prompt = this.buildHelpPrompt(
      student,
      question,
      attempts,
      previousAnswers,
      topic,
      difficulty,
      learningObjectives
    );

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const helpText = response.content[0].text;

    // Store in conversation history
    this.addToHistory(student.id, {
      type: 'help_request',
      question,
      help: helpText,
      timestamp: new Date().toISOString(),
    });

    return {
      helpText: this.formatHelpForGrade(helpText, student.gradeLevel),
      encouragement: this.getEncouragement(student.gradeLevel, attempts),
      nextSteps: this.suggestNextSteps(attempts, student.gradeLevel),
    };
  }

  /**
   * Build help prompt for AI tutor
   */
  buildHelpPrompt(student, question, attempts, previousAnswers, topic, difficulty, objectives) {
    return `You are a patient, encouraging AI tutor helping a ${this.getGradeDescription(student.gradeLevel)} student.

**Student Info:**
- Grade: ${student.gradeLevel}
- Name: ${student.name}
- Current topic: ${topic?.name || 'General practice'}
- Difficulty level: ${difficulty || 'Unknown'}

**Question:**
${question.text}

${question.options ? `**Answer Choices:**\n${question.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join('\n')}` : ''}

**Student's Situation:**
- Attempts so far: ${attempts}
${previousAnswers.length > 0 ? `- Previous answers: ${previousAnswers.join(', ')}` : ''}

**Learning Objectives:**
${objectives.map((obj) => `- ${obj}`).join('\n') || 'Not specified'}

**Your Task:**
Provide helpful, age-appropriate guidance that:

1. **Doesn't Give Away the Answer** - Help them think, don't solve it for them
2. **Is Encouraging** - Build confidence, especially after ${attempts} attempt(s)
3. **Provides Strategy** - Teach how to approach this type of problem
4. **Uses Simple Language** - Match ${this.getGradeDescription(student.gradeLevel)} comprehension
5. **Gives Examples** - Use relatable examples if helpful
6. **Breaks It Down** - Simplify into smaller steps

**Help Style for ${this.getGradeDescription(student.gradeLevel)}:**
${this.getHelpStyleGuidelines(student.gradeLevel)}

Provide your help now:`;
  }

  /**
   * Explain why an answer was wrong
   */
  async explainMistake(student, question, studentAnswer, correctAnswer, context = {}) {
    const prompt = `You are helping a ${this.getGradeDescription(student.gradeLevel)} student understand their mistake.

**Question:**
${question.text}

**Student's Answer:**
${studentAnswer}

**Correct Answer:**
${correctAnswer}

**Why the Student Might Have Made This Mistake:**
${question.commonMistakes?.find((m) => m.includes(studentAnswer)) || 'Unknown misconception'}

**Your Task:**
Explain in a kind, clear way:

1. **Why their answer was incorrect** (without making them feel bad)
2. **What misconception they might have**
3. **The correct reasoning**
4. **How to avoid this mistake in the future**

**Tone:** Encouraging, patient, ${student.gradeLevel <= 2 ? 'very simple and fun' : student.gradeLevel <= 5 ? 'friendly and clear' : student.gradeLevel <= 8 ? 'supportive and explanatory' : 'clear and instructive'}

**Length:** ${student.gradeLevel <= 2 ? '2-3 short sentences' : student.gradeLevel <= 5 ? '3-4 sentences' : student.gradeLevel <= 8 ? '1 paragraph' : '1-2 paragraphs'}

Provide your explanation now:`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1000,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    });

    const explanation = response.content[0].text;

    // Store in conversation history
    this.addToHistory(student.id, {
      type: 'mistake_explanation',
      question,
      studentAnswer,
      correctAnswer,
      explanation,
      timestamp: new Date().toISOString(),
    });

    return {
      explanation: this.formatHelpForGrade(explanation, student.gradeLevel),
      relatedConcepts: this.identifyRelatedConcepts(question, context.topic),
      practiceRecommendation: this.recommendPractice(question, student.gradeLevel),
    };
  }

  /**
   * Provide a hint (progressive hints based on attempt number)
   */
  async getHint(student, question, attemptNumber, context = {}) {
    const hintLevel = Math.min(attemptNumber, 3); // Max 3 hint levels

    const prompt = `Provide hint level ${hintLevel} for a ${this.getGradeDescription(student.gradeLevel)} student.

**Question:**
${question.text}

**Hint Level ${hintLevel}:**
${hintLevel === 1 ? 'Gentle nudge - point them in the right direction' : ''}
${hintLevel === 2 ? 'More specific - help them understand the approach' : ''}
${hintLevel === 3 ? 'Almost gives it away - detailed guidance' : ''}

**Guidelines:**
- Use age-appropriate language for grade ${student.gradeLevel}
- ${student.gradeLevel <= 2 ? 'Very simple, fun, with emojis' : student.gradeLevel <= 5 ? 'Clear and encouraging' : student.gradeLevel <= 8 ? 'Supportive and explanatory' : 'Direct and helpful'}
- 1-2 sentences for level 1, 2-3 for level 2, 3-4 for level 3
- Don't give away the final answer

Provide hint now:`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 500,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    });

    return {
      hint: this.formatHelpForGrade(response.content[0].text, student.gradeLevel),
      hintLevel,
      maxHints: 3,
      visualAid: this.suggestVisualAid(question, student.gradeLevel),
    };
  }

  /**
   * Answer a general question from student
   */
  async answerQuestion(student, studentQuestion, context = {}) {
    // Get conversation history for context
    const history = this.getHistory(student.id);
    const recentHistory = history.slice(-5); // Last 5 interactions

    const prompt = `You are a helpful AI tutor talking with ${student.name}, a ${this.getGradeDescription(student.gradeLevel)} student.

**Student's Question:**
"${studentQuestion}"

**Context:**
${context.topic ? `Current topic: ${context.topic.name}` : ''}
${context.subject ? `Subject: ${context.subject}` : ''}

${recentHistory.length > 0 ? `**Recent Conversation:**\n${this.formatHistory(recentHistory)}` : ''}

**Your Task:**
Answer their question in a way that:
1. Is accurate and helpful
2. Matches their grade level (${student.gradeLevel})
3. Encourages curiosity
4. Connects to what they're learning
5. ${student.gradeLevel <= 5 ? 'Is fun and engaging with examples they can relate to' : 'Is clear and builds understanding'}

**Tone:** ${student.gradeLevel <= 2 ? 'Super friendly, simple, fun! Use emojis!' : student.gradeLevel <= 5 ? 'Friendly and encouraging' : student.gradeLevel <= 8 ? 'Supportive and clear' : 'Professional but approachable'}

Answer now:`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1500,
      temperature: 0.8,
      messages: [{ role: 'user', content: prompt }],
    });

    const answer = response.content[0].text;

    // Store in conversation history
    this.addToHistory(student.id, {
      type: 'question_answer',
      question: studentQuestion,
      answer,
      timestamp: new Date().toISOString(),
    });

    return {
      answer: this.formatHelpForGrade(answer, student.gradeLevel),
      followUpSuggestions: this.generateFollowUpQuestions(studentQuestion, student.gradeLevel),
    };
  }

  /**
   * Provide step-by-step solution walkthrough (after student completes or gives up)
   */
  async provideSolution(student, question, context = {}) {
    const prompt = `Provide a complete step-by-step solution walkthrough for a ${this.getGradeDescription(student.gradeLevel)} student.

**Question:**
${question.text}

**Correct Answer:**
${question.correctAnswer}

**Explanation:**
${question.explanation || 'Not provided'}

**Your Task:**
Create a detailed walkthrough that:

1. **Shows Each Step** clearly
2. **Explains the Reasoning** at each step
3. **Uses ${student.gradeLevel <= 5 ? 'Simple Language and Examples' : student.gradeLevel <= 8 ? 'Clear Explanations' : 'Precise Mathematical/Logical Reasoning'}**
4. **Highlights Key Concepts** being used
5. **Provides Tips** for similar problems

**Format:**
${student.gradeLevel <= 2 ? 'Very simple, numbered steps with emojis' : student.gradeLevel <= 5 ? 'Clear numbered steps with examples' : student.gradeLevel <= 8 ? 'Organized steps with explanations' : 'Formal step-by-step with justifications'}

Provide solution walkthrough:`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2000,
      temperature: 0.5,
      messages: [{ role: 'user', content: prompt }],
    });

    return {
      solution: this.formatHelpForGrade(response.content[0].text, student.gradeLevel),
      keyTakeaways: this.extractKeyTakeaways(question, student.gradeLevel),
      practiceProblems: this.suggestSimilarProblems(question, context.topic),
    };
  }

  /**
   * Helper: Format help text for grade level
   */
  formatHelpForGrade(text, gradeLevel) {
    // For K-2, ensure very simple language
    if (gradeLevel <= 2) {
      // Could add text simplification here in production
      return text;
    }

    // For 3-12, return as is (AI already tailored it)
    return text;
  }

  /**
   * Helper: Get encouragement based on grade and attempts
   */
  getEncouragement(gradeLevel, attempts) {
    const messages = {
      K2: {
        1: ["You're doing great! Keep trying! 🌟", "Don't give up! You can do this! 💪", "Try again! You're so close! ⭐"],
        2: ["You're working so hard! That's awesome! 🎉", "Keep going! Every try helps you learn! 🌈", "You're getting better! Try once more! ✨"],
        3: ["Wow, you're really trying! I'm proud of you! 🏆", "Learning takes practice! You're doing amazing! 🎊", "Keep at it! You're a learning superstar! 🌟"],
      },
      '3-5': {
        1: ["Good effort! Think it through! 💡", "You've got this! Try again! 🎯", "Keep thinking! You're on the right track! ⭐"],
        2: ["Great persistence! Keep problem-solving! 🔍", "Don't give up! You're learning! 💪", "Try a different approach! 🔄"],
        3: ["Excellent effort! You're really thinking hard! 🧠", "Your persistence is impressive! 🌟", "Keep going! Learning from mistakes is important! 📚"],
      },
      '6-8': {
        1: ["Think it through carefully", "You're on the right track", "Review the question and try again"],
        2: ["Good effort - try another approach", "Consider the problem from a different angle", "You're making progress"],
        3: ["Your persistence shows dedication", "Learning happens through effort", "Keep problem-solving"],
      },
      '9-12': {
        1: ["Reconsider your approach", "Review the key concepts", "Think through the logic"],
        2: ["Try a different method", "Break down the problem", "Review the fundamentals"],
        3: ["Strong effort demonstrated", "Persistence is valuable", "Consider seeking additional resources"],
      },
    };

    const band = gradeLevel <= 2 ? 'K2' : gradeLevel <= 5 ? '3-5' : gradeLevel <= 8 ? '6-8' : '9-12';
    const attemptKey = Math.min(attempts, 3);
    const options = messages[band][attemptKey] || messages[band][1];

    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Helper: Suggest next steps
   */
  suggestNextSteps(attempts, gradeLevel) {
    if (attempts === 0) {
      return {
        action: 'try_answering',
        message: gradeLevel <= 5 ? "Give it your best try! 🎯" : "Attempt the question",
      };
    } else if (attempts === 1) {
      return {
        action: 'use_hint',
        message: gradeLevel <= 5 ? "Need a hint? Click for help! 💡" : "Consider using a hint",
      };
    } else if (attempts === 2) {
      return {
        action: 'get_explanation',
        message: gradeLevel <= 5 ? "Want me to explain it? 📖" : "Request a detailed explanation",
      };
    } else {
      return {
        action: 'see_solution',
        message: gradeLevel <= 5 ? "Let's see how to solve it! ✨" : "View complete solution",
      };
    }
  }

  /**
   * Helper: Get grade description
   */
  getGradeDescription(gradeLevel) {
    if (gradeLevel === 0) return 'Kindergarten';
    if (gradeLevel <= 2) return `${gradeLevel}st/2nd grade (ages 5-8)`;
    if (gradeLevel <= 5) return `${gradeLevel}th grade (ages 8-11)`;
    if (gradeLevel <= 8) return `${gradeLevel}th grade (ages 11-14)`;
    return `${gradeLevel}th grade (ages 14-18)`;
  }

  /**
   * Helper: Get help style guidelines by grade
   */
  getHelpStyleGuidelines(gradeLevel) {
    if (gradeLevel <= 2) {
      return `- Use VERY simple words (like talking to a 5-7 year old)
- Include fun emojis 🎨🌈⭐
- Give examples using toys, animals, everyday objects
- Keep it short (2-3 sentences max)
- Be super encouraging and positive
- Use "you can do it!" energy`;
    } else if (gradeLevel <= 5) {
      return `- Use clear, simple language
- Include helpful examples from their life (games, sports, school)
- Be encouraging and friendly
- Break complex ideas into smaller pieces
- 3-4 sentences
- Make learning feel fun!`;
    } else if (gradeLevel <= 8) {
      return `- Use clear explanations
- Provide logical reasoning
- Give relevant examples
- Be supportive but not overly cheerful
- 1-2 paragraphs
- Focus on understanding, not just answers`;
    } else {
      return `- Be direct and clear
- Provide rigorous explanations
- Use proper terminology
- Focus on conceptual understanding
- 1-2 paragraphs
- Professional but encouraging tone`;
    }
  }

  /**
   * Conversation history management
   */
  addToHistory(studentId, entry) {
    if (!this.conversationHistory.has(studentId)) {
      this.conversationHistory.set(studentId, []);
    }

    const history = this.conversationHistory.get(studentId);
    history.push(entry);

    // Keep only last 20 entries
    if (history.length > 20) {
      history.shift();
    }
  }

  getHistory(studentId) {
    return this.conversationHistory.get(studentId) || [];
  }

  clearHistory(studentId) {
    this.conversationHistory.delete(studentId);
  }

  formatHistory(history) {
    return history
      .map((entry) => {
        if (entry.type === 'help_request') {
          return `Student needed help with a question`;
        } else if (entry.type === 'question_answer') {
          return `Student asked: "${entry.question}"`;
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');
  }

  /**
   * Additional helper methods
   */
  identifyRelatedConcepts(question, topic) {
    // In production, this would analyze the question and topic
    // For now, return placeholder
    return topic?.prerequisites || [];
  }

  recommendPractice(question, gradeLevel) {
    return {
      similarQuestions: 3,
      topic: question.topic,
      difficulty: question.difficulty,
    };
  }

  suggestVisualAid(question, gradeLevel) {
    if (gradeLevel <= 5) {
      // Younger students benefit from visuals
      if (question.type === 'problem-solving' || question.topic?.includes('math')) {
        return {
          type: 'number-line',
          description: 'Try using a number line to visualize this!',
        };
      }
    }
    return null;
  }

  extractKeyTakeaways(question, gradeLevel) {
    // Extract from question's learning objectives or explanation
    return question.learningObjectives?.slice(0, 3) || [];
  }

  suggestSimilarProblems(question, topic) {
    return {
      difficulty: question.difficulty,
      count: 3,
      topicId: topic?.id,
    };
  }

  generateFollowUpQuestions(studentQuestion, gradeLevel) {
    // In production, use AI to generate relevant follow-up questions
    // For now, return grade-appropriate prompts
    if (gradeLevel <= 5) {
      return [
        "Want to learn more about this? 🤔",
        "Should we try a practice problem? 📝",
        "Any other questions? 💭",
      ];
    } else {
      return [
        "Would you like to explore this concept further?",
        "Do you want to see a related example?",
        "Any other questions on this topic?",
      ];
    }
  }
}

/**
 * Tutor UI Helper - Manages tutor interface components
 */
export class TutorUIHelper {
  static getHelpButtonConfig(gradeLevel, attempts) {
    if (gradeLevel <= 2) {
      return {
        text: attempts === 0 ? "Need Help? 🆘" : "More Help? 💡",
        color: 'from-green-400 to-green-600',
        size: 'large',
        icon: '🤖',
      };
    } else if (gradeLevel <= 5) {
      return {
        text: attempts === 0 ? "Get Help 💡" : "Need More Help?",
        color: 'from-blue-400 to-blue-600',
        size: 'medium',
        icon: '💭',
      };
    } else if (gradeLevel <= 8) {
      return {
        text: attempts === 0 ? "Get Help" : "Request Help",
        color: 'from-purple-400 to-purple-600',
        size: 'medium',
        icon: '?',
      };
    } else {
      return {
        text: "Request Assistance",
        color: 'from-gray-600 to-gray-800',
        size: 'small',
        icon: 'i',
      };
    }
  }

  static formatTutorResponse(response, gradeLevel) {
    // Add appropriate emojis and formatting for grade level
    if (gradeLevel <= 2) {
      return {
        ...response,
        avatar: '🤖',
        bubbleStyle: 'playful',
        textSize: 'large',
      };
    } else if (gradeLevel <= 5) {
      return {
        ...response,
        avatar: '💡',
        bubbleStyle: 'friendly',
        textSize: 'medium',
      };
    } else {
      return {
        ...response,
        avatar: null,
        bubbleStyle: 'clean',
        textSize: 'standard',
      };
    }
  }
}

/**
 * Example Usage
 */

/*
// Initialize
const tutor = new AITutor(process.env.ANTHROPIC_API_KEY);

// Student needs help with a question
const help = await tutor.getHelp(student, question, {
  attempts: 2,
  previousAnswers: ['A', 'C'],
  topic: currentTopic,
  difficulty: 4,
});

console.log(help.helpText);
console.log(help.encouragement);

// Student got an answer wrong - explain why
const explanation = await tutor.explainMistake(
  student,
  question,
  studentAnswer,
  correctAnswer,
  { topic: currentTopic }
);

console.log(explanation.explanation);

// Student asks a question
const answer = await tutor.answerQuestion(
  student,
  "Why do we need to learn this?",
  { topic: currentTopic, subject: 'math' }
);

console.log(answer.answer);

// Provide hints progressively
const hint = await tutor.getHint(student, question, attemptNumber);
console.log(`Hint ${hint.hintLevel}/${hint.maxHints}: ${hint.hint}`);
*/
