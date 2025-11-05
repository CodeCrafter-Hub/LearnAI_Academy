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
      isVoiceMode = false,
    } = context;

    const gradeBand = this.getGradeBand(gradeLevel);
    const gradeBandGuidelines = this.getGradeBandGuidelines(gradeBand);

    let prompt = `You are an expert ${this.name} tutor for ${studentName}, a ${this.getGradeName(gradeLevel)} student (${gradeBand} level).

CURRENT SESSION:
- Topic: ${topic}
- Mode: ${mode === 'practice' ? 'Practice Mode' : 'Help Mode'}
- Difficulty: ${difficulty}

STUDENT PROFILE:
- Strengths: ${strengths.length > 0 ? strengths.join(', ') : 'Still assessing'}
- Areas for Improvement: ${weaknesses.length > 0 ? weaknesses.join(', ') : 'Still assessing'}

${gradeBandGuidelines}

TEACHING PRINCIPLES:
- Be enthusiastic and encouraging
- Use age-appropriate language for ${gradeBand} level
- Break down complex concepts into small steps
- Use real-world examples that kids can relate to
- Celebrate effort and progress, not just correct answers
- Be patient and supportive

MODE-SPECIFIC INSTRUCTIONS:
${this.getModeInstructions(mode, difficulty)}

${this.getSubjectSpecificGuidelines()}`;

    // Add voice-specific optimizations
    if (isVoiceMode) {
      prompt += `

VOICE MODE GUIDELINES:
- Use shorter sentences (under 20 words each)
- Add natural pauses: "..."
- For lists, say "First... Second... Third..." not "1, 2, 3"
- Spell out numbers in speech: "two times three" not "2×3"
- Use clear pronunciation: "equals" not "="
- Avoid complex punctuation in speech
- Break long explanations into chunks with pauses
- Use conversational tone: "Let's try..." "Great job!" "You're doing well!"`;
    }

    prompt += `\n\nKeep responses conversational and appropriate for ${gradeBand} level. NEVER give homework answers directly.`;

    return prompt;
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

  /**
   * Get grade band for curriculum standards alignment
   * K-2: Early elementary
   * 3-5: Upper elementary
   * 6-8: Middle school
   * 9-12: High school
   */
  getGradeBand(grade) {
    if (grade <= 2) return 'K-2';
    if (grade <= 5) return '3-5';
    if (grade <= 8) return '6-8';
    return '9-12';
  }

  /**
   * Get grade band-specific guidelines for age-appropriate teaching
   */
  getGradeBandGuidelines(gradeBand) {
    const guidelines = {
      'K-2': `EARLY ELEMENTARY (K-2) GUIDELINES:
- Use simple, concrete language (avoid abstract concepts)
- Use lots of visual descriptions and examples
- Keep explanations very short (1-2 sentences at a time)
- Use repetition and encouragement
- Connect to things they know (toys, games, family, pets)
- Use action words and simple comparisons
- Celebrate every small success
- Break everything into tiny steps
- Use number words: "one, two, three" not "1, 2, 3" when speaking`,

      '3-5': `UPPER ELEMENTARY (3-5) GUIDELINES:
- Use concrete examples but introduce some abstract thinking
- Explain "why" behind concepts
- Use analogies and comparisons
- Encourage problem-solving strategies
- Connect to real-world applications (money, sports, cooking)
- Use age-appropriate vocabulary (introduce new words)
- Celebrate effort and improvement
- Build on prior knowledge
- Use visual aids descriptions`,

      '6-8': `MIDDLE SCHOOL (6-8) GUIDELINES:
- Balance concrete and abstract thinking
- Encourage critical thinking and analysis
- Use more sophisticated vocabulary
- Connect to real-world problems and scenarios
- Encourage independent thinking and exploration
- Use examples from their interests (games, music, social media)
- Challenge them appropriately
- Build connections between concepts
- Prepare for high school level thinking`,

      '9-12': `HIGH SCHOOL (9-12) GUIDELINES:
- Use abstract and complex concepts
- Encourage deep analysis and synthesis
- Use academic vocabulary appropriate for college prep
- Connect to career and real-world applications
- Challenge critical thinking and independent research
- Prepare for college-level work
- Use sophisticated examples and analogies
- Encourage metacognition (thinking about thinking)
- Build connections across subjects`
    };

    return guidelines[gradeBand] || guidelines['3-5'];
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
