import { groqClient } from '../groqClient.js';
import { contentFilter } from '../contentFilter.js';

export class BaseAgent {
  constructor(name, subjectId) {
    this.name = name;
    this.subjectId = subjectId;
  }

  buildSystemPrompt(context) {
    const {
      studentName,
      gradeLevel,
      topic,
      difficulty,
      mode,
      strengths = [],
      weaknesses = [],
    } = context;

    return `You are an expert ${this.name} tutor for ${studentName}, a ${this.getGradeName(gradeLevel)} student.

CURRENT SESSION:
- Topic: ${topic}
- Mode: ${mode === 'practice' ? 'Practice Mode' : 'Help Mode'}
- Difficulty: ${difficulty}

STUDENT PROFILE:
- Strengths: ${strengths.length > 0 ? strengths.join(', ') : 'Still assessing'}
- Areas for Improvement: ${weaknesses.length > 0 ? weaknesses.join(', ') : 'Still assessing'}

TEACHING PRINCIPLES:
- Be enthusiastic and encouraging
- Use age-appropriate language
- Break down complex concepts into small steps
- Use real-world examples that kids can relate to
- Celebrate effort and progress, not just correct answers
- Be patient and supportive

MODE-SPECIFIC INSTRUCTIONS:
${this.getModeInstructions(mode, difficulty)}

${this.getSubjectSpecificGuidelines()}

Keep responses conversational and concise for voice interaction. NEVER give homework answers directly.`;
  }

  getModeInstructions(mode, difficulty) {
    if (mode === 'practice') {
      return `PRACTICE MODE:
- Generate ONE practice problem at a time
- After student answers, provide detailed feedback
- Explain why the answer is correct or incorrect
- Show step-by-step solution if needed
- Generate next problem with appropriate difficulty
- Track their progress and adjust difficulty

Difficulty Guidelines:
- EASY: Simple, one-step problems with lots of guidance
- MEDIUM: Multi-step problems, encourage independent thinking
- HARD: Complex scenarios, minimal hints, challenge critical thinking`;
    }

    return `HELP MODE:
- Answer questions and explain concepts clearly
- Use the Socratic method - ask guiding questions
- Help them discover solutions rather than giving answers
- Provide examples to illustrate concepts
- Encourage curiosity and deeper understanding`;
  }

  getSubjectSpecificGuidelines() {
    // Override in child classes
    return '';
  }

  getGradeName(grade) {
    if (grade === 0) return 'Kindergarten';
    if (grade <= 5) return `${grade}th grade`;
    if (grade === 6) return '6th grade';
    if (grade === 7) return '7th grade';
    if (grade === 8) return '8th grade';
    return `${grade}th grade`;
  }

  async process(context, message, metadata = {}) {
    try {
      // Build system prompt
      const systemPrompt = this.buildSystemPrompt(context);

      // Prepare conversation history
      const messages = [
        { role: 'system', content: systemPrompt },
        ...context.messages.slice(-10).map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        })),
        { role: 'user', content: message },
      ];

      // Select appropriate model
      const model = groqClient.selectModel(
        this.assessComplexity(message),
        this.subjectId
      );

      // Get AI response
      const response = await groqClient.chat(messages, {
        model,
        temperature: 0.7,
        maxTokens: 1500,
      });

      // Filter content for safety
      const filtered = await contentFilter.filter(
        response.content,
        context.gradeLevel
      );

      return {
        content: filtered.content,
        filtered: filtered.wasFiltered,
        usage: response.usage,
        model: response.model,
        responseTime: response.responseTime,
      };
    } catch (error) {
      console.error(`Error in ${this.name}:`, error);
      return {
        content: "I'm having trouble right now. Let's try that again!",
        error: error.message,
      };
    }
  }

  assessComplexity(message) {
    // Simple heuristic for complexity
    const simplePatterns = [
      /^what is/i,
      /^define/i,
      /^yes|no$/i,
      /^(true|false)$/i,
    ];

    return simplePatterns.some(p => p.test(message.trim())) ? 'simple' : 'complex';
  }
}

export default BaseAgent;
