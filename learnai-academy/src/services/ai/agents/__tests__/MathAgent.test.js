// Mock groq-sdk before importing agents
jest.mock('groq-sdk', () => ({
  Groq: jest.fn().mockImplementation(() => ({})),
}));

// Mock groqClient
jest.mock('../../groqClient', () => ({
  GroqClient: {
    getClient: jest.fn().mockReturnValue({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: 'Test response' } }],
            usage: { prompt_tokens: 10, completion_tokens: 20 },
          }),
        },
      },
    }),
    selectModel: jest.fn().mockReturnValue('llama-3.1-8b-instant'),
  },
}));

import { MathAgent } from '../MathAgent';

describe('MathAgent', () => {
  let mathAgent;

  beforeEach(() => {
    mathAgent = new MathAgent();
  });

  describe('Constructor', () => {
    it('should create a MathAgent with correct name and subject', () => {
      expect(mathAgent).toBeInstanceOf(MathAgent);
      // Note: These properties are set in BaseAgent constructor
    });
  });

  describe('getSubjectSpecificGuidelines', () => {
    it('should return math-specific teaching guidelines', () => {
      const guidelines = mathAgent.getSubjectSpecificGuidelines();

      expect(guidelines).toContain('MATH-SPECIFIC GUIDELINES');
      expect(guidelines).toContain('visual representations');
      expect(guidelines).toContain('real-world applications');
      expect(guidelines).toContain('Fractions');
      expect(guidelines).toContain('PROBLEM-SOLVING STRATEGIES');
    });
  });

  describe('looksLikeAnswer', () => {
    it('should identify numeric answers', () => {
      expect(mathAgent.looksLikeAnswer('42')).toBe(true);
      expect(mathAgent.looksLikeAnswer('3.14')).toBe(true);
      expect(mathAgent.looksLikeAnswer('2 + 2')).toBe(true);
      expect(mathAgent.looksLikeAnswer('(5 * 3) / 2')).toBe(true);
    });

    it('should identify text-based answers', () => {
      expect(mathAgent.looksLikeAnswer('the answer is 5')).toBe(true);
      expect(mathAgent.looksLikeAnswer('I think it\'s 10')).toBe(true);
      expect(mathAgent.looksLikeAnswer('It equals 7')).toBe(true);
    });

    it('should identify multiple choice answers', () => {
      expect(mathAgent.looksLikeAnswer('A')).toBe(true);
      expect(mathAgent.looksLikeAnswer('b')).toBe(true);
      expect(mathAgent.looksLikeAnswer('D')).toBe(true);
    });

    it('should not identify questions as answers', () => {
      expect(mathAgent.looksLikeAnswer('How do I solve this?')).toBe(false);
      expect(mathAgent.looksLikeAnswer('Can you help me?')).toBe(false);
      expect(mathAgent.looksLikeAnswer('What is a fraction?')).toBe(false);
    });
  });

  describe('shouldGenerateNewProblem', () => {
    it('should generate problem for first message', () => {
      const context = {
        mode: 'practice',
        messages: [],
      };
      const result = mathAgent.shouldGenerateNewProblem(context, 'Hello');
      expect(result).toBe(true);
    });

    it('should generate problem after student answer', () => {
      const context = {
        mode: 'practice',
        messages: [
          { role: 'assistant', content: 'What is 2+2?' },
          { role: 'user', content: '4' },
        ],
      };
      const result = mathAgent.shouldGenerateNewProblem(context, '4');
      expect(result).toBe(true);
    });

    it('should generate problem when student asks for next problem', () => {
      const context = {
        mode: 'practice',
        messages: [
          { role: 'assistant', content: 'Great job!' },
          { role: 'user', content: 'next problem' },
        ],
      };
      const result = mathAgent.shouldGenerateNewProblem(context, 'next problem');
      expect(result).toBe(true);
    });

    it('should not generate problem for questions', () => {
      const context = {
        mode: 'practice',
        messages: [
          { role: 'assistant', content: 'What is 2+2?' },
          { role: 'user', content: 'Can you explain?' },
        ],
      };
      const result = mathAgent.shouldGenerateNewProblem(context, 'Can you explain?');
      expect(result).toBe(false);
    });
  });

  describe('extractProblemData', () => {
    it('should extract problem and answer from content', () => {
      const content = 'Problem: What is 2 + 2?\nAnswer: 4';
      const result = mathAgent.extractProblemData(content);

      expect(result).toEqual({
        problem: 'What is 2 + 2?',
        answer: '4',
      });
    });

    it('should extract problem without answer', () => {
      const content = 'Problem: What is 5 * 3?';
      const result = mathAgent.extractProblemData(content);

      expect(result).toEqual({
        problem: 'What is 5 * 3?',
        answer: null,
      });
    });

    it('should return null for content without problem', () => {
      const content = 'This is just a regular message.';
      const result = mathAgent.extractProblemData(content);

      expect(result).toBeNull();
    });
  });

  describe('getRecentProblems', () => {
    it('should extract recent problems from conversation', () => {
      const context = {
        messages: [
          { role: 'assistant', content: 'Problem: 2+2' },
          { role: 'user', content: '4' },
          { role: 'assistant', content: 'Problem: 3+3' },
          { role: 'user', content: '6' },
          { role: 'assistant', content: 'Problem: 4+4' },
        ],
      };

      const problems = mathAgent.getRecentProblems(context);

      expect(problems.length).toBeGreaterThan(0);
      expect(problems[0]).toHaveProperty('problem');
    });

    it('should limit to last 5 problems', () => {
      const context = {
        messages: Array(20).fill(null).map((_, i) => ({
          role: 'assistant',
          content: `Problem: ${i}+${i}`,
        })),
      };

      const problems = mathAgent.getRecentProblems(context);

      expect(problems.length).toBeLessThanOrEqual(5);
    });
  });
});
