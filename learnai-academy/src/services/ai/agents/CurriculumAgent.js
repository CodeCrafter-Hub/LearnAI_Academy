import { BaseAgent } from './BaseAgent.js';
import { groqClient } from '../groqClient.js';
import { aiProvider } from '../aiProviderConfig.js';
import prisma from '../../../lib/prisma.js';
import { standardsService } from '../../curriculum/standardsService.js';
import { contentValidator } from '../../curriculum/contentValidator.js';
import { curriculumCache } from '../../curriculum/curriculumCache.js';

/**
 * CurriculumAgent - Formal Teacher Role
 * 
 * Purpose: Creates structured curriculum, lesson plans, assessments
 * Mode: Batch/Asynchronous (not real-time tutoring)
 * Output: Structured curriculum content, lesson plans, practice problems
 * 
 * Used for:
 * - Pre-generating content for topics
 * - Creating lesson sequences
 * - Building assessment questions
 * - Generating curriculum aligned to standards
 */
export class CurriculumAgent extends BaseAgent {
  constructor(name, subjectId) {
    super(name, subjectId);
    this.role = 'curriculum';
  }

  /**
   * Generate a complete lesson plan for a topic (IMPROVED with caching, validation, retry)
   */
  async generateLessonPlan(topic, gradeLevel, options = {}) {
    const {
      includeStandards = true,
      includeAssessments = true,
      includePracticeProblems = true,
      difficultyLevel = 'MEDIUM',
      topicId = null,
      useCache = true,
      maxRetries = 3,
    } = options;

    // Check cache first
    if (useCache && topicId) {
      const cached = await curriculumCache.getCached(topicId, gradeLevel, 'lessonPlan', options);
      if (cached) {
        return cached.content;
      }
    }

    const gradeBand = this.getGradeBand(gradeLevel);
    const standards = includeStandards ? await this.getLearningStandards(topic, gradeLevel) : null;

    // Retry logic with exponential backoff
    let lastError;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const prompt = `You are a curriculum specialist creating a formal lesson plan for ${topic} at ${gradeLevel}th grade level (${gradeBand}).

CURRICULUM CREATION TASK:
- Topic: ${topic}
- Grade Level: ${gradeLevel} (${gradeBand})
- Difficulty: ${difficultyLevel}

${standards ? `LEARNING STANDARDS TO ALIGN WITH:\n${standards.map(s => `- ${s.description}`).join('\n')}` : ''}

Create a comprehensive lesson plan with:
1. Learning Objectives (3-5 specific, measurable objectives)
2. Prerequisites (what students should know before this lesson)
3. Key Concepts (main ideas to teach)
4. Lesson Structure (step-by-step teaching sequence)
5. Examples and Activities (concrete examples and hands-on activities)
6. Assessment Questions (if requested)
7. Practice Problems (if requested)
8. Extension Activities (for advanced students)

Format the response as structured JSON with clear sections.`;

        const response = await groqClient.chat([
          { role: 'system', content: prompt },
          { role: 'user', content: `Generate a complete lesson plan for ${topic}.` },
        ], {
          model: groqClient.models.smart,
          temperature: 0.3, // Lower temperature for more structured output
          maxTokens: 3000,
        });

        const result = this.parseLessonPlan(response.content);
        
        // Cache the result if topicId is provided
        if (useCache && topicId) {
          await curriculumCache.cacheContent(topicId, gradeLevel, 'lessonPlan', result, options);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries - 1) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    // If all retries failed, throw the last error
    throw lastError || new Error('Failed to generate lesson plan after retries');
  }

  /**
   * Generate practice problems for a topic (IMPROVED with caching, validation, retry)
   */
  async generatePracticeProblems(topic, gradeLevel, count = 10, difficulty = 'MEDIUM', options = {}) {
    const {
      topicId = null,
      useCache = true,
      maxRetries = 3,
    } = options;

    // Check cache first
    if (useCache && topicId) {
      const cached = await curriculumCache.getCached(topicId, gradeLevel, 'practiceProblems', { difficulty, count });
      if (cached) {
        return cached.content;
      }
    }

    const gradeBand = this.getGradeBand(gradeLevel);
    const standards = await this.getLearningStandards(topic, gradeLevel);

    // Retry logic
    let lastError;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const prompt = `You are a curriculum specialist creating practice problems for ${topic} at ${gradeLevel}th grade level (${gradeBand}).

Generate ${count} practice problems at ${difficulty} difficulty level.

For each problem, provide:
1. Problem statement (clear and age-appropriate)
2. Correct answer
3. Step-by-step solution
4. Common mistakes to watch for
5. Hints for struggling students

Format as JSON array with these fields:
- problem: string
- answer: string (or number)
- solution: string (step-by-step)
- commonMistakes: array of strings
- hints: array of strings
- difficulty: "${difficulty}"
- gradeLevel: ${gradeLevel}`;

        const response = await groqClient.chat([
          { role: 'system', content: prompt },
          { role: 'user', content: `Generate ${count} practice problems.` },
        ], {
          model: groqClient.models.smart,
          temperature: 0.4,
          maxTokens: 4000,
        });

        const result = this.parseProblems(response.content);
        
        // Cache the result if topicId is provided
        if (useCache && topicId) {
          await curriculumCache.cacheContent(topicId, gradeLevel, 'practiceProblems', result, { difficulty, count });
        }
        
        return result;
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries - 1) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    // If all retries failed, throw the last error
    throw lastError || new Error('Failed to generate practice problems after retries');
  }

  /**
   * Generate assessment questions
   */
  async generateAssessment(topic, gradeLevel, questionCount = 10, options = {}) {
    const {
      assessmentType = 'formative',
      timeLimitMinutes = null,
      includeMultipleChoice = true,
      includeShortAnswer = true,
    } = options;

    const gradeBand = this.getGradeBand(gradeLevel);
    const standards = await this.getLearningStandards(topic, gradeLevel);

    const prompt = `You are a curriculum specialist creating an assessment for ${topic} at ${gradeLevel}th grade level (${gradeBand}).

ASSESSMENT TYPE: ${assessmentType}
TOTAL QUESTIONS: ${questionCount}
${timeLimitMinutes ? `TIME LIMIT: ${timeLimitMinutes} minutes` : ''}

LEARNING STANDARDS:
${standards.map(s => `- ${s.description}`).join('\n')}

Create ${questionCount} assessment questions:
${includeMultipleChoice ? '- Include multiple choice questions' : ''}
${includeShortAnswer ? '- Include short answer questions' : ''}
- Include varying difficulty levels
- Align with learning standards
- Provide answer key with explanations

For each question, provide:
1. Question text
2. Question type (multiple_choice, short_answer)
3. Correct answer
4. Explanation
5. Points (out of 100 total)
6. Standards addressed`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: `Generate the assessment.` },
    ], {
      model: groqClient.models.smart,
      temperature: 0.3,
      maxTokens: 4000,
    });

    return this.parseAssessment(response.content);
  }

  /**
   * Generate curriculum content items (explanations, examples)
   */
  async generateContentItems(topic, gradeLevel, contentType, count = 5) {
    const gradeBand = this.getGradeBand(gradeLevel);

    const prompt = `You are a curriculum specialist creating ${contentType} content for ${topic} at ${gradeLevel}th grade level (${gradeBand}).

Generate ${count} high-quality ${contentType} items that:
- Are age-appropriate for ${gradeBand} level
- Use clear, engaging language
- Include visual descriptions when helpful
- Connect to real-world examples
- Are aligned with curriculum standards

Format as JSON array.`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: `Generate ${count} ${contentType} items.` },
    ], {
      model: groqClient.models.smart,
      temperature: 0.5,
      maxTokens: 3000,
    });

    return this.parseContentItems(response.content);
  }

  /**
   * Get learning standards for a topic and grade level
   * Now integrated with StandardsService
   */
  async getLearningStandards(topic, gradeLevel) {
    try {
      return await standardsService.getStandards(this.subjectId, gradeLevel, topic);
    } catch (error) {
      console.warn('Error fetching standards, using fallback:', error.message);
      // Fallback to basic standard
      return [
        {
          code: `${this.subjectId.toUpperCase()}.${gradeLevel}.1`,
          description: `Understand and apply ${topic} concepts appropriate for grade ${gradeLevel}`,
          gradeLevel,
          gradeBand: this.getGradeBand(gradeLevel),
          subject: this.subjectId,
        },
      ];
    }
  }

  /**
   * Parse lesson plan from AI response (IMPROVED with multiple strategies)
   */
  parseLessonPlan(content) {
    const strategies = [
      // Strategy 1: Markdown code block
      () => {
        const match = content.match(/```json\n([\s\S]*?)\n```/);
        if (match) return JSON.parse(match[1]);
        return null;
      },
      // Strategy 2: Plain JSON object
      () => {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            return JSON.parse(match[0]);
          } catch {
            return null;
          }
        }
        return null;
      },
      // Strategy 3: Extract JSON between markers
      () => {
        const lines = content.split('\n');
        const jsonStart = lines.findIndex(l => l.trim().startsWith('{'));
        if (jsonStart >= 0) {
          let braceCount = 0;
          let jsonEnd = jsonStart;
          for (let i = jsonStart; i < lines.length; i++) {
            const line = lines[i];
            braceCount += (line.match(/\{/g) || []).length;
            braceCount -= (line.match(/\}/g) || []).length;
            if (braceCount === 0 && i > jsonStart) {
              jsonEnd = i;
              break;
            }
          }
          if (jsonEnd > jsonStart) {
            try {
              return JSON.parse(lines.slice(jsonStart, jsonEnd + 1).join('\n'));
            } catch {
              return null;
            }
          }
        }
        return null;
      },
    ];

    // Try each strategy
    for (const strategy of strategies) {
      try {
        const result = strategy();
        if (result) return result;
      } catch (error) {
        continue;
      }
    }

    // Fallback: Structured text parsing
    try {
      return {
        raw: content,
        parsed: this.parseStructuredText(content),
        note: 'Parsed as structured text (JSON extraction failed)',
      };
    } catch (error) {
      console.error('Error parsing lesson plan:', error);
      return { raw: content, error: error.message };
    }
  }

  /**
   * Parse practice problems from AI response (IMPROVED)
   */
  parseProblems(content) {
    const strategies = [
      () => {
        const match = content.match(/```json\n([\s\S]*?)\n```/);
        if (match) return JSON.parse(match[1]);
        return null;
      },
      () => {
        const match = content.match(/\[[\s\S]*\]/);
        if (match) {
          try {
            return JSON.parse(match[0]);
          } catch {
            return null;
          }
        }
        return null;
      },
      () => {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            const parsed = JSON.parse(match[0]);
            // If single object, wrap in array
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            return null;
          }
        }
        return null;
      },
    ];

    for (const strategy of strategies) {
      try {
        const result = strategy();
        if (result && Array.isArray(result) && result.length > 0) {
          return result;
        }
      } catch (error) {
        continue;
      }
    }

    return { raw: content, error: 'Could not parse problems as JSON array' };
  }

  /**
   * Parse assessment from AI response
   */
  parseAssessment(content) {
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      return { raw: content, error: 'Could not parse JSON' };
    } catch (error) {
      console.error('Error parsing assessment:', error);
      return { raw: content, error: error.message };
    }
  }

  /**
   * Parse content items from AI response
   */
  parseContentItems(content) {
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      return { raw: content, error: 'Could not parse JSON' };
    } catch (error) {
      console.error('Error parsing content items:', error);
      return { raw: content, error: error.message };
    }
  }

  /**
   * Parse structured text into sections
   */
  parseStructuredText(text) {
    const sections = {};
    const lines = text.split('\n');
    let currentSection = null;

    for (const line of lines) {
      const sectionMatch = line.match(/^#+\s*(.+)$/);
      if (sectionMatch) {
        currentSection = sectionMatch[1].toLowerCase().replace(/\s+/g, '_');
        sections[currentSection] = [];
      } else if (currentSection && line.trim()) {
        sections[currentSection].push(line.trim());
      }
    }

    return sections;
  }

  /**
   * Save generated content to database
   */
  async saveContentItem(topicId, contentType, content, metadata = {}) {
    try {
      return await prisma.contentItem.create({
        data: {
          topicId,
          contentType,
          title: metadata.title || `Generated ${contentType}`,
          content: typeof content === 'string' ? { text: content } : content,
          difficulty: metadata.difficulty || 'MEDIUM',
          estimatedTime: metadata.estimatedTime || null,
          isAiGenerated: true,
          qualityScore: metadata.qualityScore || null,
          metadata: metadata,
        },
      });
    } catch (error) {
      console.error('Error saving content item:', error);
      throw error;
    }
  }

  /**
   * Generate formal lesson plan structure (for new formal curriculum system)
   * @param {string} unitName - Unit name
   * @param {number} gradeLevel - Grade level
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Formal lesson plan structure
   */
  async generateFormalLessonPlan(unitName, gradeLevel, options = {}) {
    const {
      durationMinutes = 30,
      difficulty = 'MEDIUM',
      includeAllComponents = true,
    } = options;

    // Generate base lesson plan
    const lessonPlan = await this.generateLessonPlan(unitName, gradeLevel, {
      ...options,
      difficultyLevel: difficulty,
      includeStandards: true,
      includeAssessments: includeAllComponents,
      includePracticeProblems: includeAllComponents,
    });

    // Structure it formally
    return {
      name: lessonPlan.name || `${unitName} - Lesson`,
      description: lessonPlan.description || `Lesson plan for ${unitName}`,
      durationMinutes,
      difficulty,
      learningObjectives: lessonPlan.objectives || lessonPlan.learningObjectives || [],
      prerequisites: lessonPlan.prerequisites || [],
      materials: lessonPlan.materials || [],
      standards: lessonPlan.standards || [],
      lessonStructure: {
        warmUp: {
          duration: Math.max(3, Math.round(durationMinutes * 0.1)),
          activity: lessonPlan.warmUp || 'Review previous concepts',
        },
        instruction: {
          duration: Math.round(durationMinutes * 0.4),
          content: lessonPlan.keyConcepts || lessonPlan.instruction || [],
        },
        practice: {
          duration: Math.round(durationMinutes * 0.35),
          activities: lessonPlan.practice || lessonPlan.activities || [],
          problems: lessonPlan.practiceProblems || [],
        },
        assessment: {
          duration: Math.max(3, Math.round(durationMinutes * 0.1)),
          quiz: lessonPlan.assessment || null,
        },
        closure: {
          duration: Math.max(2, Math.round(durationMinutes * 0.05)),
          activity: lessonPlan.closure || 'Review key concepts',
        },
      },
    };
  }
}

export default CurriculumAgent;

