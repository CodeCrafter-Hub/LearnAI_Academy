import { CurriculumAgent } from './CurriculumAgent.js';
import { groqClient } from '../groqClient.js';

/**
 * MathCurriculumAgent - Specialized curriculum agent for Math
 * 
 * Extends CurriculumAgent with math-specific curriculum generation
 */
export class MathCurriculumAgent extends CurriculumAgent {
  constructor() {
    super('Math Curriculum Specialist', 'math');
  }

  /**
   * Generate math-specific practice problems
   */
  async generateMathProblems(topic, gradeLevel, count = 10, difficulty = 'MEDIUM') {
    const gradeBand = this.getGradeBand(gradeLevel);
    
    // Math-specific problem generation guidelines
    const mathGuidelines = this.getMathSpecificGuidelines(topic, gradeBand, difficulty);

    const prompt = `You are a math curriculum specialist creating practice problems for ${topic} at ${gradeLevel}th grade level (${gradeBand}).

${mathGuidelines}

Generate ${count} practice problems at ${difficulty} difficulty level.

For each problem, provide:
1. Problem statement (clear, age-appropriate, with context)
2. Correct answer (numeric or symbolic)
3. Step-by-step solution (detailed for ${gradeBand} level)
4. Common mistakes to watch for
5. Hints for struggling students
6. Real-world connection (if applicable)

Problem Types:
${this.getProblemTypesForGrade(gradeBand)}

Format as JSON array with these fields:
- problem: string
- answer: number or string
- solution: array of steps (each step is a string)
- commonMistakes: array of strings
- hints: array of strings
- difficulty: "${difficulty}"
- gradeLevel: ${gradeLevel}
- realWorldConnection: string (optional)`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: `Generate ${count} math practice problems for ${topic}.` },
    ], {
      model: groqClient.models.smart,
      temperature: 0.4,
      maxTokens: 4000,
    });

    return this.parseProblems(response.content);
  }

  /**
   * Generate math lesson plan with visual aids
   */
  async generateMathLessonPlan(topic, gradeLevel, options = {}) {
    const lessonPlan = await super.generateLessonPlan(topic, gradeLevel, options);
    
    // Enhance with math-specific elements
    const mathEnhancements = {
      visualAids: await this.generateVisualAidDescriptions(topic, gradeLevel),
      manipulatives: this.getManipulativesForTopic(topic, gradeLevel),
      realWorldExamples: await this.generateRealWorldExamples(topic, gradeLevel),
    };

    return {
      ...lessonPlan,
      mathSpecific: mathEnhancements,
    };
  }

  /**
   * Get math-specific guidelines for problem generation
   */
  getMathSpecificGuidelines(topic, gradeBand, difficulty) {
    const guidelines = {
      'K-2': `
MATH GUIDELINES FOR K-2:
- Use concrete objects and pictures
- Use number words: "three apples" not "3 apples" in problems
- Keep numbers small (1-20)
- Use familiar contexts: toys, food, family
- Include visual descriptions: "Draw 5 circles..."
- Use manipulatives: blocks, counters, fingers
- Focus on counting, addition, subtraction basics`,

      '3-5': `
MATH GUIDELINES FOR 3-5:
- Use money, measurement, time contexts
- Numbers up to 1000
- Introduce multiplication, division, fractions
- Use visual models: arrays, number lines, area models
- Connect to real-world: shopping, cooking, sports
- Include word problems with context
- Show multiple solution methods`,

      '6-8': `
MATH GUIDELINES FOR 6-8:
- Introduce algebra, ratios, proportions
- Use negative numbers, decimals, percentages
- Include multi-step problems
- Connect to real-world problems: budgets, recipes, scale
- Encourage different solution strategies
- Include word problems with multiple variables
- Prepare for algebra thinking`,

      '9-12': `
MATH GUIDELINES FOR 9-12:
- Abstract algebraic thinking
- Functions, equations, graphing
- Geometry proofs and reasoning
- Statistics and probability
- Real-world applications: physics, engineering, finance
- Multiple solution methods
- Critical thinking and analysis
- Prepare for college-level math`,
    };

    return guidelines[gradeBand] || guidelines['3-5'];
  }

  /**
   * Get appropriate problem types for grade band
   */
  getProblemTypesForGrade(gradeBand) {
    const types = {
      'K-2': '- Counting problems\n- Simple addition/subtraction\n- Number recognition\n- Pattern problems',
      '3-5': '- Word problems\n- Multi-step problems\n- Multiplication/division\n- Fraction problems\n- Measurement problems',
      '6-8': '- Multi-step word problems\n- Algebraic thinking\n- Ratio and proportion\n- Geometry problems\n- Data analysis',
      '9-12': '- Complex word problems\n- Algebraic equations\n- Geometric proofs\n- Function problems\n- Statistical analysis',
    };

    return types[gradeBand] || types['3-5'];
  }

  /**
   * Generate visual aid descriptions for math concepts
   */
  async generateVisualAidDescriptions(topic, gradeLevel) {
    const prompt = `Describe visual aids (drawings, diagrams, models) that would help teach ${topic} to ${gradeLevel}th grade students.

Provide descriptions for:
1. Main visual aid (diagram or model)
2. Step-by-step visual progression
3. Interactive elements (if applicable)

Format as JSON array.`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: `Generate visual aid descriptions.` },
    ], {
      model: groqClient.models.fast,
      temperature: 0.5,
      maxTokens: 1000,
    });

    try {
      const jsonMatch = response.content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
    } catch (error) {
      console.error('Error parsing visual aids:', error);
    }

    return { raw: response.content };
  }

  /**
   * Get appropriate manipulatives for topic
   */
  getManipulativesForTopic(topic, gradeLevel) {
    const manipulatives = {
      'K-2': ['counting blocks', 'number lines', 'ten frames', 'base-10 blocks'],
      '3-5': ['fraction circles', 'geoboards', 'pattern blocks', 'measuring tools'],
      '6-8': ['algebra tiles', 'graph paper', 'protractors', 'calculators'],
      '9-12': ['graphing calculators', 'geometric models', 'statistical tools'],
    };

    const gradeBand = this.getGradeBand(gradeLevel);
    return manipulatives[gradeBand] || [];
  }

  /**
   * Generate real-world examples for math concepts
   */
  async generateRealWorldExamples(topic, gradeLevel) {
    const prompt = `Generate 3-5 real-world examples that connect ${topic} to everyday life for ${gradeLevel}th grade students.

Make examples:
- Age-appropriate and relatable
- Concrete and specific
- Engaging and interesting
- Show practical applications

Format as JSON array with fields:
- example: string (description)
- context: string (where this appears in real life)
- connection: string (how it connects to the math concept)`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: `Generate real-world examples.` },
    ], {
      model: groqClient.models.fast,
      temperature: 0.6,
      maxTokens: 800,
    });

    try {
      const jsonMatch = response.content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
    } catch (error) {
      console.error('Error parsing real-world examples:', error);
    }

    return { raw: response.content };
  }
}

export default MathCurriculumAgent;

