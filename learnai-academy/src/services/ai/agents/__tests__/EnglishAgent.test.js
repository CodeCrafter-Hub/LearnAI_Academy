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

import { EnglishAgent } from '../EnglishAgent';

describe('EnglishAgent', () => {
  let englishAgent;

  beforeEach(() => {
    englishAgent = new EnglishAgent();
  });

  describe('Constructor', () => {
    it('should create an EnglishAgent instance', () => {
      expect(englishAgent).toBeInstanceOf(EnglishAgent);
    });
  });

  describe('getSubjectSpecificGuidelines', () => {
    it('should return English-specific teaching guidelines', () => {
      const guidelines = englishAgent.getSubjectSpecificGuidelines();

      expect(guidelines).toContain('ENGLISH-SPECIFIC GUIDELINES');
      expect(guidelines).toContain('grammar');
      expect(guidelines).toContain('vocabulary');
      expect(guidelines).toContain('COMMON TOPICS');
      expect(guidelines).toContain('Parts of Speech');
      expect(guidelines).toContain('Sentence Structure');
    });

    it('should include memory tricks and mnemonics', () => {
      const guidelines = englishAgent.getSubjectSpecificGuidelines();

      expect(guidelines).toContain('mnemonics');
      expect(guidelines).toContain('i before e except after c');
    });

    it('should include teaching strategies', () => {
      const guidelines = englishAgent.getSubjectSpecificGuidelines();

      expect(guidelines).toContain('TEACHING STRATEGIES');
      expect(guidelines).toContain('silly sentences');
      expect(guidelines).toContain('treasure hunt');
    });

    it('should mention common confusing words', () => {
      const guidelines = englishAgent.getSubjectSpecificGuidelines();

      expect(guidelines).toContain('homophones');
      expect(guidelines).toContain('there/their/they\'re');
    });
  });
});
