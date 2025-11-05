import { CurriculumAgent } from './CurriculumAgent.js';
import { groqClient } from '../groqClient.js';

/**
 * EnglishCurriculumAgent - Specialized curriculum agent for English/Language Arts
 * 
 * Extends CurriculumAgent with English-specific curriculum generation
 */
export class EnglishCurriculumAgent extends CurriculumAgent {
  constructor() {
    super('English Curriculum Specialist', 'english');
  }

  /**
   * Generate English-specific practice exercises
   */
  async generateEnglishExercises(topic, gradeLevel, count = 10, difficulty = 'MEDIUM') {
    const gradeBand = this.getGradeBand(gradeLevel);
    
    const englishGuidelines = this.getEnglishSpecificGuidelines(topic, gradeBand, difficulty);

    const prompt = `You are an English curriculum specialist creating practice exercises for ${topic} at ${gradeLevel}th grade level (${gradeBand}).

${englishGuidelines}

Generate ${count} practice exercises at ${difficulty} difficulty level.

For each exercise, provide:
1. Exercise statement (clear, engaging, age-appropriate)
2. Correct answer or model response
3. Explanation of the rule or concept
4. Common mistakes to watch for
5. Examples of correct usage
6. Extension activities (if applicable)

Exercise Types:
${this.getExerciseTypesForGrade(gradeBand)}

Format as JSON array with these fields:
- exercise: string
- answer: string (correct answer or model response)
- explanation: string (why this is correct)
- commonMistakes: array of strings
- examples: array of strings (correct usage examples)
- difficulty: "${difficulty}"
- gradeLevel: ${gradeLevel}
- exerciseType: string (grammar, vocabulary, reading, writing, etc.)`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: `Generate ${count} English practice exercises for ${topic}.` },
    ], {
      model: groqClient.models.smart,
      temperature: 0.4,
      maxTokens: 4000,
    });

    return this.parseExercises(response.content);
  }

  /**
   * Generate English lesson plan with reading/writing components
   */
  async generateEnglishLessonPlan(topic, gradeLevel, options = {}) {
    const lessonPlan = await super.generateLessonPlan(topic, gradeLevel, options);
    
    // Enhance with English-specific elements
    const englishEnhancements = {
      readingComponents: await this.generateReadingComponents(topic, gradeLevel),
      writingComponents: await this.generateWritingComponents(topic, gradeLevel),
      vocabularyBuilding: await this.generateVocabularyActivities(topic, gradeLevel),
      grammarFocus: this.getGrammarFocusForTopic(topic, gradeLevel),
    };

    return {
      ...lessonPlan,
      englishSpecific: englishEnhancements,
    };
  }

  /**
   * Get English-specific guidelines for exercise generation
   */
  getEnglishSpecificGuidelines(topic, gradeBand, difficulty) {
    const guidelines = {
      'K-2': `
ENGLISH GUIDELINES FOR K-2:
- Use simple, familiar words
- Focus on phonics and letter recognition
- Use picture-based activities
- Incorporate songs, rhymes, and games
- Build vocabulary through context
- Use simple sentence structures
- Focus on storytelling and listening
- Make it fun and interactive
- Use visual aids and manipulatives`,
      '3-5': `
ENGLISH GUIDELINES FOR 3-5:
- Introduce grammar rules with examples
- Build vocabulary through reading
- Focus on sentence structure
- Practice with age-appropriate texts
- Use engaging topics: animals, sports, adventures
- Include writing exercises
- Teach punctuation and capitalization
- Connect to their favorite books/stories
- Use word families and patterns`,
      '6-8': `
ENGLISH GUIDELINES FOR 6-8:
- Deepen grammar understanding
- Expand vocabulary with context clues
- Analyze text structure and meaning
- Practice essay writing
- Introduce literary devices
- Use complex sentence structures
- Focus on clarity and precision
- Connect to literature and current events
- Practice editing and revision`,
      '9-12': `
ENGLISH GUIDELINES FOR 9-12:
- Advanced grammar and syntax
- Complex vocabulary and word roots
- Literary analysis and interpretation
- Essay writing and argumentation
- Research and citation skills
- Critical reading and analysis
- Creative and expository writing
- Prepare for college-level English
- Develop voice and style`,
    };

    return guidelines[gradeBand] || guidelines['3-5'];
  }

  /**
   * Get appropriate exercise types for grade band
   */
  getExerciseTypesForGrade(gradeBand) {
    const types = {
      'K-2': '- Letter recognition and phonics\n- Simple word matching\n- Picture-sentence matching\n- Rhyming words\n- Basic sentence completion\n- Vocabulary building',
      '3-5': '- Grammar exercises (parts of speech)\n- Sentence structure\n- Punctuation practice\n- Vocabulary in context\n- Reading comprehension\n- Simple writing prompts',
      '6-8': '- Grammar review and application\n- Sentence variety and complexity\n- Vocabulary expansion\n- Reading comprehension with analysis\n- Writing prompts (narrative, expository)\n- Editing and revision',
      '9-12': '- Advanced grammar and syntax\n- Vocabulary and word analysis\n- Literary analysis questions\n- Argumentative writing\n- Research and citation\n- Creative writing prompts\n- Essay structure and development',
    };

    return types[gradeBand] || types['3-5'];
  }

  /**
   * Generate reading components for lesson
   */
  async generateReadingComponents(topic, gradeLevel) {
    const prompt = `Generate reading components for teaching ${topic} to ${gradeLevel}th grade students.

Include:
1. Reading passages (age-appropriate, engaging)
2. Comprehension questions
3. Vocabulary focus words
4. Discussion questions
5. Reading strategies to apply

Format as JSON object with fields:
- passages: array of objects with {title, text, length}
- comprehensionQuestions: array of strings
- vocabularyWords: array of objects with {word, definition, context}
- discussionQuestions: array of strings
- readingStrategies: array of strings`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: `Generate reading components.` },
    ], {
      model: groqClient.models.smart,
      temperature: 0.5,
      maxTokens: 2000,
    });

    return this.parseJSONResponse(response.content);
  }

  /**
   * Generate writing components for lesson
   */
  async generateWritingComponents(topic, gradeLevel) {
    const prompt = `Generate writing components for teaching ${topic} to ${gradeLevel}th grade students.

Include:
1. Writing prompts (age-appropriate, engaging)
2. Writing structure guidance
3. Revision checklists
4. Peer review questions
5. Examples of good writing

Format as JSON object with fields:
- prompts: array of objects with {prompt, type, length}
- structureGuidance: string
- revisionChecklist: array of strings
- peerReviewQuestions: array of strings
- examples: array of strings`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: `Generate writing components.` },
    ], {
      model: groqClient.models.smart,
      temperature: 0.6,
      maxTokens: 2000,
    });

    return this.parseJSONResponse(response.content);
  }

  /**
   * Generate vocabulary activities
   */
  async generateVocabularyActivities(topic, gradeLevel) {
    const prompt = `Generate vocabulary-building activities for ${topic} at ${gradeLevel}th grade level.

Include:
1. Key vocabulary words
2. Word games and activities
3. Context usage exercises
4. Word relationship activities (synonyms, antonyms, word families)

Format as JSON object.`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: `Generate vocabulary activities.` },
    ], {
      model: groqClient.models.fast,
      temperature: 0.5,
      maxTokens: 1500,
    });

    return this.parseJSONResponse(response.content);
  }

  /**
   * Get grammar focus for topic
   */
  getGrammarFocusForTopic(topic, gradeLevel) {
    const gradeBand = this.getGradeBand(gradeLevel);
    
    const grammarFocus = {
      'K-2': ['Capitalization', 'Ending punctuation', 'Simple sentences', 'Nouns and verbs'],
      '3-5': ['Parts of speech', 'Sentence structure', 'Punctuation', 'Subject-verb agreement'],
      '6-8': ['Complex sentences', 'Verb tenses', 'Pronouns', 'Commas and semicolons'],
      '9-12': ['Advanced syntax', 'Parallel structure', 'Active vs passive voice', 'Subordination'],
    };

    return grammarFocus[gradeBand] || grammarFocus['3-5'];
  }

  /**
   * Parse exercises from AI response
   */
  parseExercises(content) {
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      
      // Fallback: try to parse as JSON directly
      return JSON.parse(content);
    } catch (error) {
      console.error('Error parsing exercises:', error);
      return { raw: content, error: 'Failed to parse exercises' };
    }
  }

  /**
   * Parse JSON response (helper method)
   */
  parseJSONResponse(content) {
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      return JSON.parse(content);
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      return { raw: content };
    }
  }
}

export default EnglishCurriculumAgent;

