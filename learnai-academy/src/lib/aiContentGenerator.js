/**
 * AI Content Generator
 * Generates unlimited dynamic problems, explanations, and content using Claude AI
 * This creates truly personalized, never-repeating educational content
 */

import Anthropic from '@anthropic-ai/sdk';

/**
 * Content generation templates
 */
const GENERATION_TEMPLATES = {
  math: {
    problem: {
      prompt: (topic, difficulty, gradeLevel) => `Generate a ${difficulty}/10 difficulty ${topic} problem for grade ${gradeLevel}.

Requirements:
- Age-appropriate for grade ${gradeLevel}
- Difficulty level ${difficulty}/10
- Include the problem, solution, and step-by-step explanation
- Make it engaging and relatable to students

Return JSON format:
{
  "problem": "The actual problem text",
  "answer": "The correct answer",
  "solution": "Step-by-step solution",
  "explanation": "Why this solution works",
  "hints": ["hint 1", "hint 2", "hint 3"],
  "commonMistakes": ["mistake 1", "mistake 2"],
  "realWorldApplication": "How this applies in real life"
}`,
    },
    explanation: {
      prompt: (concept, gradeLevel) => `Explain ${concept} for a grade ${gradeLevel} student.

Create:
- Simple, clear explanation
- Visual description if applicable
- Examples
- Common misconceptions
- Practice tips

Use grade-appropriate language.`,
    },
  },
  reading: {
    passage: {
      prompt: (topic, difficulty, gradeLevel, length) => `Create a ${length}-word reading passage about ${topic} for grade ${gradeLevel}.

Difficulty: ${difficulty}/10
Requirements:
- Engaging narrative or informational text
- Age-appropriate vocabulary
- Include 5 comprehension questions (multiple choice and short answer)
- Provide answers and explanations

Return JSON with: passage, questions[], answers[], vocabulary[]`,
    },
  },
  science: {
    experiment: {
      prompt: (topic, gradeLevel) => `Design a safe, simple science experiment about ${topic} for grade ${gradeLevel}.

Include:
- Hypothesis
- Materials (household items preferred)
- Step-by-step procedure
- Expected results
- Explanation of the science
- Safety precautions
- Discussion questions

Make it hands-on and engaging.`,
    },
  },
};

/**
 * AIContentGenerator
 * Dynamically generates educational content using AI
 */
export class AIContentGenerator {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Anthropic API key is required');
    }
    this.client = new Anthropic({ apiKey });
    this.model = 'claude-sonnet-4-5-20250929';
    this.generationCache = new Map();
  }

  /**
   * Generate math problem
   */
  async generateMathProblem(topic, difficulty, gradeLevel, options = {}) {
    const {
      style = 'word-problem', // word-problem, equation, visual
      context = null,
      avoidSimilarTo = [],
    } = options;

    const cacheKey = `math_${topic}_${difficulty}_${gradeLevel}`;

    const prompt = this.buildMathProblemPrompt(topic, difficulty, gradeLevel, style, context, avoidSimilarTo);

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2000,
        temperature: 0.9, // Higher for more variety
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0].text;
      const problem = this.parseProblemResponse(content);

      // Add metadata
      problem.id = this.generateId();
      problem.generatedAt = new Date().toISOString();
      problem.topic = topic;
      problem.difficulty = difficulty;
      problem.gradeLevel = gradeLevel;
      problem.type = 'ai-generated';

      return problem;
    } catch (error) {
      console.error('Error generating math problem:', error);
      throw error;
    }
  }

  /**
   * Build math problem prompt
   */
  buildMathProblemPrompt(topic, difficulty, gradeLevel, style, context, avoid) {
    let prompt = `Generate a unique ${topic} problem for grade ${gradeLevel} students.

**Difficulty**: ${difficulty}/10
**Style**: ${style}
**Grade Level**: ${gradeLevel}

`;

    if (context) {
      prompt += `**Context/Theme**: ${context}\n\n`;
    }

    if (avoid.length > 0) {
      prompt += `**Avoid problems similar to**: ${avoid.join(', ')}\n\n`;
    }

    prompt += `Requirements:
1. Create an engaging, age-appropriate problem
2. Use relatable scenarios (sports, games, everyday situations)
3. Include clear question and answer
4. Provide step-by-step solution
5. Add 3 progressive hints
6. List common mistakes students make
7. Explain real-world application

Return in JSON format:
{
  "problem": "The problem text",
  "answer": "The correct answer (number or expression)",
  "solution": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
  "explanation": "Why this solution works",
  "hints": ["Gentle hint", "More specific hint", "Almost gives it away"],
  "commonMistakes": ["Mistake 1 and why", "Mistake 2 and why"],
  "realWorldApplication": "How this math is used in real life",
  "visualAid": "Description of helpful visual/diagram",
  "difficulty": ${difficulty},
  "skillsRequired": ["skill1", "skill2"]
}

Make it fun and educational!`;

    return prompt;
  }

  /**
   * Generate reading passage
   */
  async generateReadingPassage(topic, difficulty, gradeLevel, options = {}) {
    const {
      length = 200, // words
      genre = 'informational', // narrative, informational, persuasive
      includeImages = false,
    } = options;

    const prompt = `Create a ${length}-word ${genre} reading passage about ${topic} for grade ${gradeLevel}.

**Difficulty**: ${difficulty}/10 (Lexile appropriate for grade ${gradeLevel})
**Genre**: ${genre}
**Length**: ${length} words

Requirements:
1. Engaging content that captures student interest
2. Age-appropriate vocabulary with some challenge words
3. Clear structure (introduction, body, conclusion)
4. Include 5 comprehension questions:
   - 2 literal (who, what, when, where)
   - 2 inferential (why, how, deeper meaning)
   - 1 critical thinking (opinion, evaluation)
5. Provide answer key
6. List vocabulary words with definitions
7. Suggest discussion topics

Return JSON:
{
  "title": "Engaging title",
  "passage": "Full passage text",
  "wordCount": ${length},
  "questions": [
    {
      "type": "literal/inferential/critical",
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "B",
      "explanation": "Why this is correct"
    }
  ],
  "vocabulary": [
    {
      "word": "word",
      "definition": "grade-appropriate definition",
      "sentence": "example sentence"
    }
  ],
  "discussionTopics": ["topic 1", "topic 2"],
  "lexileLevel": "estimated lexile"
}`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 3000,
        temperature: 0.8,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0].text;
      const passage = this.parsePassageResponse(content);

      passage.id = this.generateId();
      passage.generatedAt = new Date().toISOString();
      passage.topic = topic;
      passage.gradeLevel = gradeLevel;
      passage.type = 'ai-generated';

      return passage;
    } catch (error) {
      console.error('Error generating reading passage:', error);
      throw error;
    }
  }

  /**
   * Generate science experiment
   */
  async generateScienceExperiment(topic, gradeLevel, options = {}) {
    const {
      location = 'classroom', // classroom, home, outdoor
      materials = 'common', // common, specialized
    } = options;

    const prompt = `Design a hands-on science experiment about ${topic} for grade ${gradeLevel}.

**Location**: ${location}
**Materials**: ${materials} (prefer household/easily available items)

Create a complete experiment guide:

1. **Title**: Catchy, descriptive title
2. **Objective**: What students will learn
3. **Hypothesis**: What students should predict
4. **Materials**: List everything needed (be specific)
5. **Safety**: Important safety precautions
6. **Procedure**: Step-by-step instructions (numbered)
7. **Observations**: What to look for/measure
8. **Expected Results**: What should happen
9. **Explanation**: The science behind it (grade-appropriate)
10. **Variations**: 2-3 ways to modify the experiment
11. **Discussion Questions**: 5 questions to deepen understanding
12. **Real-World Connection**: Where this science matters

Make it:
- Safe and age-appropriate
- Engaging and fun
- Educational with clear learning outcomes
- Using accessible materials

Return detailed JSON format.`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2500,
        temperature: 0.8,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0].text;
      const experiment = this.parseExperimentResponse(content);

      experiment.id = this.generateId();
      experiment.generatedAt = new Date().toISOString();
      experiment.topic = topic;
      experiment.gradeLevel = gradeLevel;
      experiment.type = 'ai-generated';

      return experiment;
    } catch (error) {
      console.error('Error generating science experiment:', error);
      throw error;
    }
  }

  /**
   * Generate explanation
   */
  async generateExplanation(concept, gradeLevel, options = {}) {
    const {
      style = 'simple', // simple, detailed, visual, analogy-based
      priorKnowledge = [],
    } = options;

    const prompt = `Explain "${concept}" for a grade ${gradeLevel} student.

**Style**: ${style}
**Prior Knowledge**: ${priorKnowledge.join(', ') || 'basic grade level knowledge'}

Create a comprehensive explanation:

1. **Simple Definition**: One-sentence explanation
2. **Detailed Explanation**: 2-3 paragraphs using grade-appropriate language
3. **Visual Description**: How to visualize/illustrate this concept
4. **Analogy**: A relatable comparison to help understand
5. **Examples**: 3 concrete examples
6. **Common Misconceptions**: What students often get wrong
7. **Practice Tips**: How to master this concept
8. **Related Concepts**: What builds on this
9. **Real-World Applications**: Where this matters in life

Use:
- Clear, simple language
- Relatable examples
- Encouraging tone
- Grade-appropriate vocabulary

Return JSON format with all sections.`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2000,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0].text;
      const explanation = this.parseExplanationResponse(content);

      explanation.id = this.generateId();
      explanation.generatedAt = new Date().toISOString();
      explanation.concept = concept;
      explanation.gradeLevel = gradeLevel;
      explanation.type = 'ai-generated';

      return explanation;
    } catch (error) {
      console.error('Error generating explanation:', error);
      throw error;
    }
  }

  /**
   * Generate practice problem set
   */
  async generateProblemSet(topic, difficulty, gradeLevel, count = 10, options = {}) {
    const {
      progressiveDifficulty = true,
      includeReview = true,
      theme = null,
    } = options;

    const problems = [];

    // Generate problems with varying difficulty
    for (let i = 0; i < count; i++) {
      let problemDifficulty = difficulty;

      if (progressiveDifficulty) {
        // Start easier, get harder
        problemDifficulty = Math.max(1, difficulty - 2 + Math.floor(i / (count / 4)));
      }

      const problem = await this.generateMathProblem(
        topic,
        problemDifficulty,
        gradeLevel,
        {
          context: theme,
          avoidSimilarTo: problems.map(p => p.problem),
        }
      );

      problems.push(problem);

      // Small delay to avoid rate limiting
      await this.delay(500);
    }

    return {
      id: this.generateId(),
      topic,
      gradeLevel,
      difficulty,
      problems,
      progressiveDifficulty,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate personalized content based on student profile
   */
  async generatePersonalizedContent(student, topic, options = {}) {
    const {
      contentType = 'problem',
      difficulty = student.currentDifficulty || 5,
    } = options;

    // Analyze student's learning style, interests, mistakes
    const prompt = `Generate personalized ${contentType} about ${topic} for a grade ${student.gradeLevel} student.

**Student Profile**:
- Learning Style: ${student.learningStyle || 'balanced'}
- Interests: ${student.interests?.join(', ') || 'general'}
- Strengths: ${student.strengths?.join(', ') || 'to be determined'}
- Areas for Growth: ${student.weaknesses?.join(', ') || 'to be determined'}
- Recent Mistakes: ${student.recentMistakes?.slice(0, 3).join(', ') || 'none'}

Create content that:
1. Matches their learning style
2. Incorporates their interests
3. Builds on their strengths
4. Addresses their growth areas
5. Avoids past mistakes

Make it highly engaging and personalized to THIS student.`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2000,
        temperature: 0.9,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0].text;

      return {
        content: this.parseContentResponse(content, contentType),
        personalized: true,
        studentId: student.id,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating personalized content:', error);
      throw error;
    }
  }

  /**
   * Generate adaptive follow-up questions
   */
  async generateFollowUp(originalQuestion, studentAnswer, wasCorrect, gradeLevel) {
    const prompt = `Generate a follow-up question based on student performance.

**Original Question**: ${originalQuestion}
**Student's Answer**: ${studentAnswer}
**Correct**: ${wasCorrect}
**Grade Level**: ${gradeLevel}

If student was correct:
- Create a slightly harder question on the same concept
- Extend to a related concept
- Apply to a new context

If student was incorrect:
- Create an easier question targeting the same skill
- Break down into smaller steps
- Provide scaffolding

Return JSON:
{
  "question": "The follow-up question",
  "reasoning": "Why this question is appropriate",
  "difficulty": "relative difficulty (easier/same/harder)",
  "concept": "what this targets",
  "answer": "correct answer",
  "hints": ["hint1", "hint2"]
}`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1000,
        temperature: 0.8,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0].text;
      return this.parseFollowUpResponse(content);
    } catch (error) {
      console.error('Error generating follow-up:', error);
      throw error;
    }
  }

  /**
   * Parse responses
   */
  parseProblemResponse(content) {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) ||
                       content.match(/```\n([\s\S]*?)\n```/) ||
                       [null, content];

      const jsonStr = jsonMatch[1] || content;
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error parsing problem response:', error);
      // Return structured fallback
      return {
        problem: content,
        answer: 'Parse error',
        solution: ['See content'],
        explanation: content,
        hints: ['Try again'],
        commonMistakes: [],
        realWorldApplication: 'N/A',
      };
    }
  }

  parsePassageResponse(content) {
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) ||
                       content.match(/```\n([\s\S]*?)\n```/) ||
                       [null, content];

      const jsonStr = jsonMatch[1] || content;
      return JSON.parse(jsonStr);
    } catch (error) {
      return {
        title: 'Reading Passage',
        passage: content,
        questions: [],
        vocabulary: [],
      };
    }
  }

  parseExperimentResponse(content) {
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) ||
                       content.match(/```\n([\s\S]*?)\n```/) ||
                       [null, content];

      const jsonStr = jsonMatch[1] || content;
      return JSON.parse(jsonStr);
    } catch (error) {
      return {
        title: 'Science Experiment',
        content: content,
        materials: [],
        procedure: [],
      };
    }
  }

  parseExplanationResponse(content) {
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) ||
                       content.match(/```\n([\s\S]*?)\n```/) ||
                       [null, content];

      const jsonStr = jsonMatch[1] || content;
      return JSON.parse(jsonStr);
    } catch (error) {
      return {
        definition: content,
        explanation: content,
        examples: [],
      };
    }
  }

  parseContentResponse(content, type) {
    return this.parseProblemResponse(content);
  }

  parseFollowUpResponse(content) {
    return this.parseProblemResponse(content);
  }

  /**
   * Helpers
   */
  generateId() {
    return `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * ContentBatchGenerator
 * Generates content in batches for efficiency
 */
export class ContentBatchGenerator {
  constructor(aiGenerator) {
    this.generator = aiGenerator;
    this.queue = [];
    this.processing = false;
  }

  /**
   * Queue content generation
   */
  async queueGeneration(type, params) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        type,
        params,
        resolve,
        reject,
      });

      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  /**
   * Process queue
   */
  async processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const item = this.queue.shift();

    try {
      let result;

      switch (item.type) {
        case 'math-problem':
          result = await this.generator.generateMathProblem(...item.params);
          break;
        case 'reading-passage':
          result = await this.generator.generateReadingPassage(...item.params);
          break;
        case 'science-experiment':
          result = await this.generator.generateScienceExperiment(...item.params);
          break;
        case 'explanation':
          result = await this.generator.generateExplanation(...item.params);
          break;
        default:
          throw new Error(`Unknown generation type: ${item.type}`);
      }

      item.resolve(result);
    } catch (error) {
      item.reject(error);
    }

    // Continue processing
    setTimeout(() => this.processQueue(), 1000); // 1 second between requests
  }
}

/**
 * Example Usage
 */

/*
// Initialize generator
const generator = new AIContentGenerator(anthropicApiKey);

// Generate a math problem
const problem = await generator.generateMathProblem(
  'fractions',
  6, // difficulty
  4, // grade level
  {
    style: 'word-problem',
    context: 'cooking',
  }
);

console.log('Problem:', problem.problem);
console.log('Answer:', problem.answer);
console.log('Hints:', problem.hints);

// Generate a problem set
const problemSet = await generator.generateProblemSet(
  'multiplication',
  5,
  3,
  10,
  {
    progressiveDifficulty: true,
    theme: 'sports',
  }
);

console.log('Generated', problemSet.problems.length, 'problems');

// Generate reading passage
const passage = await generator.generateReadingPassage(
  'dolphins',
  5,
  3,
  {
    length: 200,
    genre: 'informational',
  }
);

console.log('Passage:', passage.passage);
console.log('Questions:', passage.questions.length);

// Generate science experiment
const experiment = await generator.generateScienceExperiment(
  'density',
  5,
  {
    location: 'home',
    materials: 'common',
  }
);

console.log('Experiment:', experiment.title);
console.log('Materials:', experiment.materials);

// Generate personalized content
const personalized = await generator.generatePersonalizedContent(
  {
    id: 'student123',
    gradeLevel: 4,
    learningStyle: 'visual',
    interests: ['sports', 'animals'],
    weaknesses: ['fractions'],
  },
  'fractions'
);

console.log('Personalized:', personalized.content);

// Batch generation
const batchGenerator = new ContentBatchGenerator(generator);

const problem1 = batchGenerator.queueGeneration('math-problem', ['addition', 3, 2]);
const problem2 = batchGenerator.queueGeneration('math-problem', ['subtraction', 4, 2]);
const problem3 = batchGenerator.queueGeneration('math-problem', ['multiplication', 5, 3]);

const results = await Promise.all([problem1, problem2, problem3]);
console.log('Batch generated:', results.length, 'problems');
*/

export { AIContentGenerator, ContentBatchGenerator };
