import { BaseAgent } from './BaseAgent.js';

export class MathAgent extends BaseAgent {
  constructor() {
    super('Math Tutor', 'math');
  }

  getSubjectSpecificGuidelines() {
    return `MATH-SPECIFIC GUIDELINES:
- Use visual representations when helpful (describe diagrams)
- Show multiple solution methods when appropriate
- Connect math to real-world applications (money, sports, cooking, games)
- Encourage mental math and estimation
- Celebrate mathematical thinking, not just correct answers
- Use number lines, arrays, and models to explain concepts

COMMON TOPICS:
- Fractions: Use pizza, cake, or pie analogies
- Decimals: Connect to money and measurement
- Percentages: Use sales, tips, and discounts
- Algebra: Frame as "mystery numbers" or puzzles
- Geometry: Reference shapes in everyday objects

PROBLEM-SOLVING STRATEGIES:
1. Understand the problem (what do we know? what do we need?)
2. Make a plan (what operation? what steps?)
3. Carry out the plan (show your work)
4. Check your answer (does it make sense?)`;
  }

  async process(context, message, metadata = {}) {
    // Check if we should generate a new problem
    if (context.mode === 'practice' && this.shouldGenerateNewProblem(context, message)) {
      metadata.generateProblem = true;
      metadata.previousProblems = this.getRecentProblems(context);
    }

    // Call parent process method
    const response = await super.process(context, message, metadata);

    // Extract problem data if in practice mode
    if (context.mode === 'practice') {
      response.problemData = this.extractProblemData(response.content);
    }

    return response;
  }

  shouldGenerateNewProblem(context, message) {
    const lastMessage = context.messages[context.messages.length - 1];
    
    // Generate if first message or student just answered
    return (
      context.messages.length <= 1 ||
      (lastMessage?.role === 'user' && this.looksLikeAnswer(message)) ||
      message.toLowerCase().includes('next problem') ||
      message.toLowerCase().includes('another one')
    );
  }

  looksLikeAnswer(message) {
    const answerPatterns = [
      /^[\d\s\+\-\*\/\(\)\.]+$/,  // Numbers and math operators
      /the answer is/i,
      /i think it'?s/i,
      /^[a-d]$/i,  // Multiple choice
      /equals?/i,
    ];
    
    return answerPatterns.some(pattern => pattern.test(message.trim()));
  }

  getRecentProblems(context) {
    // Extract problems from conversation to avoid repetition
    return context.messages
      .filter(msg => msg.role === 'assistant')
      .map(msg => this.extractProblemData(msg.content))
      .filter(data => data !== null)
      .slice(-5);
  }

  extractProblemData(content) {
    // Try to extract structured problem information
    const problemMatch = content.match(/Problem:?\s*(.+?)(?:\n|$)/i);
    const answerMatch = content.match(/(?:answer|solution):?\s*(.+?)(?:\n|$)/i);
    
    if (problemMatch) {
      return {
        problem: problemMatch[1].trim(),
        answer: answerMatch ? answerMatch[1].trim() : null,
      };
    }
    
    return null;
  }
}

export default MathAgent;
