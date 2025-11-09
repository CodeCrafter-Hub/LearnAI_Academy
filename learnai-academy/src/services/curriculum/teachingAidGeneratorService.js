import prisma from '../../lib/prisma.js';
import { groqClient } from '../ai/groqClient.js';

/**
 * TeachingAidGeneratorService - Generates teaching aids for lesson plans
 * 
 * Creates visuals, manipulatives, worksheets, games, and other teaching aids
 */

class TeachingAidGeneratorService {
  /**
   * Generate teaching aid for a lesson plan
   * @param {string} lessonPlanId - Lesson plan ID
   * @param {string} type - Teaching aid type
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated teaching aid
   */
  async generateTeachingAid(lessonPlanId, type, options = {}) {
    const {
      name = null,
      description = null,
    } = options;

    // Get lesson plan
    const lessonPlan = await prisma.lessonPlan.findUnique({
      where: { id: lessonPlanId },
      include: {
        unit: {
          include: {
            curriculum: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    });

    if (!lessonPlan) {
      throw new Error(`Lesson plan not found: ${lessonPlanId}`);
    }

    const { unit } = lessonPlan;
    const { curriculum } = unit;
    const subjectSlug = curriculum.subject.slug;
    const gradeLevel = curriculum.gradeLevel;
    const gradeBand = this.getGradeBand(gradeLevel);

    // Generate teaching aid based on type
    let aidData;
    switch (type) {
      case 'VISUAL':
        aidData = await this.generateVisual(lessonPlan, subjectSlug, gradeLevel, gradeBand);
        break;
      case 'WORKSHEET':
        aidData = await this.generateWorksheet(lessonPlan, subjectSlug, gradeLevel, gradeBand);
        break;
      case 'MANIPULATIVE':
        aidData = await this.generateManipulative(lessonPlan, subjectSlug, gradeLevel, gradeBand);
        break;
      case 'GAME':
        aidData = await this.generateGame(lessonPlan, subjectSlug, gradeLevel, gradeBand);
        break;
      case 'POSTER':
        aidData = await this.generatePoster(lessonPlan, subjectSlug, gradeLevel, gradeBand);
        break;
      case 'FLASHCARD':
        aidData = await this.generateFlashcards(lessonPlan, subjectSlug, gradeLevel, gradeBand);
        break;
      default:
        aidData = await this.generateVisual(lessonPlan, subjectSlug, gradeLevel, gradeBand);
    }

    // Create teaching aid
    const teachingAid = await prisma.teachingAid.create({
      data: {
        lessonPlanId,
        name: name || `${lessonPlan.name} - ${type}`,
        type,
        content: aidData.content,
        imageUrl: aidData.imageUrl || null,
        pdfUrl: aidData.pdfUrl || null,
        interactiveUrl: aidData.interactiveUrl || null,
        description: description || aidData.description || null,
        usageInstructions: aidData.usageInstructions || null,
        isActive: true,
      },
    });

    return teachingAid;
  }

  /**
   * Generate visual aid (chart, diagram)
   */
  async generateVisual(lessonPlan, subjectSlug, gradeLevel, gradeBand) {
    const objectives = lessonPlan.learningObjectives || [];

    const prompt = `Create a visual aid (chart, diagram, or infographic) for a ${gradeLevel}th grade (${gradeBand}) ${subjectSlug} lesson.

LESSON: ${lessonPlan.name}
OBJECTIVES: ${JSON.stringify(objectives)}

Create a visual that:
- Clearly illustrates the main concept
- Is age-appropriate for ${gradeBand}
- Uses colors and shapes effectively
- Includes labels and explanations

Provide:
- description: Detailed description of what the visual should show
- elements: Array of visual elements (shapes, text, arrows, etc.)
- layout: How elements should be arranged
- colors: Suggested color scheme

Format as JSON.`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: 'Generate the visual aid description as JSON.' },
    ], {
      model: groqClient.models.smart,
      temperature: 0.4,
      maxTokens: 2000,
    });

    const visualData = this.parseJSON(response.content);

    return {
      content: visualData,
      description: visualData.description || 'Visual aid for lesson',
      usageInstructions: 'Display during instruction phase. Point out key elements as you explain.',
    };
  }

  /**
   * Generate worksheet
   */
  async generateWorksheet(lessonPlan, subjectSlug, gradeLevel, gradeBand) {
    const objectives = lessonPlan.learningObjectives || [];
    const structure = lessonPlan.lessonStructure || {};

    const prompt = `Create a printable worksheet for a ${gradeLevel}th grade (${gradeBand}) ${subjectSlug} lesson.

LESSON: ${lessonPlan.name}
OBJECTIVES: ${JSON.stringify(objectives)}

Create a worksheet with:
- Clear instructions
- Age-appropriate problems/exercises
- Space for student work
- Answer key (separate)

For ${gradeBand} level:
${this.getWorksheetGuidelines(gradeBand)}

Provide:
- title: Worksheet title
- instructions: Clear instructions for students
- problems: Array of problems/exercises
- answerKey: Answers and explanations

Format as JSON.`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: 'Generate the worksheet as JSON.' },
    ], {
      model: groqClient.models.smart,
      temperature: 0.3,
      maxTokens: 3000,
    });

    const worksheetData = this.parseJSON(response.content);

    return {
      content: worksheetData,
      description: worksheetData.title || 'Practice worksheet',
      usageInstructions: 'Print and distribute during practice phase. Review answers together.',
      pdfUrl: null, // Would be generated by PDF service
    };
  }

  /**
   * Generate virtual manipulative
   */
  async generateManipulative(lessonPlan, subjectSlug, gradeLevel, gradeBand) {
    const prompt = `Create a virtual manipulative (interactive tool) for a ${gradeLevel}th grade (${gradeBand}) ${subjectSlug} lesson.

LESSON: ${lessonPlan.name}

Create a manipulative that:
- Helps students visualize concepts
- Is interactive and engaging
- Matches the lesson objectives
- Is appropriate for ${gradeBand} level

Examples:
- Math: Number blocks, fraction circles, base-10 blocks
- Science: Molecule builder, ecosystem simulator
- Language: Word builder, sentence constructor

Provide:
- type: Type of manipulative
- description: What it does
- interactiveElements: Array of interactive features
- instructions: How to use it

Format as JSON.`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: 'Generate the manipulative description as JSON.' },
    ], {
      model: groqClient.models.smart,
      temperature: 0.5,
      maxTokens: 2000,
    });

    const manipulativeData = this.parseJSON(response.content);

    return {
      content: manipulativeData,
      description: manipulativeData.description || 'Interactive manipulative',
      usageInstructions: manipulativeData.instructions || 'Use during instruction to demonstrate concepts.',
      interactiveUrl: null, // Would be generated by interactive tool service
    };
  }

  /**
   * Generate educational game
   */
  async generateGame(lessonPlan, subjectSlug, gradeLevel, gradeBand) {
    const prompt = `Create an educational game for a ${gradeLevel}th grade (${gradeBand}) ${subjectSlug} lesson.

LESSON: ${lessonPlan.name}

Create a game that:
- Reinforces lesson concepts
- Is fun and engaging for ${gradeBand} level
- Has clear rules
- Provides learning value

Provide:
- name: Game name
- description: What the game teaches
- rules: How to play
- setup: What's needed
- gameplay: Step-by-step gameplay

Format as JSON.`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: 'Generate the game description as JSON.' },
    ], {
      model: groqClient.models.smart,
      temperature: 0.6,
      maxTokens: 2000,
    });

    const gameData = this.parseJSON(response.content);

    return {
      content: gameData,
      description: gameData.description || 'Educational game',
      usageInstructions: gameData.rules || 'Play during practice phase to reinforce learning.',
    };
  }

  /**
   * Generate poster
   */
  async generatePoster(lessonPlan, subjectSlug, gradeLevel, gradeBand) {
    const objectives = lessonPlan.learningObjectives || [];

    const prompt = `Create a visual poster for a ${gradeLevel}th grade (${gradeBand}) ${subjectSlug} lesson.

LESSON: ${lessonPlan.name}
OBJECTIVES: ${JSON.stringify(objectives)}

Create a poster that:
- Summarizes key concepts
- Is visually appealing
- Can be displayed in classroom
- Serves as a reference

Provide:
- title: Poster title
- keyPoints: Array of main points
- visualElements: What visuals to include
- layout: How to arrange elements

Format as JSON.`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: 'Generate the poster description as JSON.' },
    ], {
      model: groqClient.models.smart,
      temperature: 0.4,
      maxTokens: 1500,
    });

    const posterData = this.parseJSON(response.content);

    return {
      content: posterData,
      description: posterData.title || 'Reference poster',
      usageInstructions: 'Display in classroom as reference. Review key points regularly.',
    };
  }

  /**
   * Generate flashcards
   */
  async generateFlashcards(lessonPlan, subjectSlug, gradeLevel, gradeBand) {
    const objectives = lessonPlan.learningObjectives || [];

    const prompt = `Create flashcards for a ${gradeLevel}th grade (${gradeBand}) ${subjectSlug} lesson.

LESSON: ${lessonPlan.name}
OBJECTIVES: ${JSON.stringify(objectives)}

Create 10-15 flashcards that:
- Cover key concepts and vocabulary
- Have clear front (question/term) and back (answer/definition)
- Are age-appropriate for ${gradeBand}

Provide:
- cards: Array of flashcards
  - front: Question or term
  - back: Answer or definition
  - category: Category of card

Format as JSON.`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: 'Generate the flashcards as JSON.' },
    ], {
      model: groqClient.models.smart,
      temperature: 0.3,
      maxTokens: 2000,
    });

    const flashcardData = this.parseJSON(response.content);

    return {
      content: flashcardData,
      description: 'Digital flashcards for review',
      usageInstructions: 'Use for vocabulary practice and concept review. Can be used in practice or review phases.',
    };
  }

  /**
   * Get worksheet guidelines by grade band
   */
  getWorksheetGuidelines(gradeBand) {
    const guidelines = {
      'K-2': '- Use large fonts (18-24pt)\n- Include pictures and visuals\n- Keep problems simple (1-2 steps)\n- Use familiar contexts (toys, animals)\n- Provide lots of space for writing',
      '3-5': '- Use clear fonts (14-16pt)\n- Include some visuals\n- Multi-step problems OK\n- Use real-world contexts\n- Provide adequate space',
      '6-8': '- Standard fonts (12-14pt)\n- Minimal visuals\n- Complex problems OK\n- Abstract thinking\n- Standard spacing',
      '9-12': '- Standard fonts (11-12pt)\n- Minimal visuals\n- Complex, multi-step problems\n- Abstract and analytical\n- Compact layout',
    };

    return guidelines[gradeBand] || guidelines['3-5'];
  }

  /**
   * Parse JSON from AI response
   */
  parseJSON(content) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/) || content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { raw: content };
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return { raw: content };
    }
  }

  /**
   * Get grade band
   */
  getGradeBand(grade) {
    if (grade <= -1) return 'Preschool';
    if (grade === 0) return 'Pre-K';
    if (grade <= 2) return 'K-2';
    if (grade <= 5) return '3-5';
    if (grade <= 8) return '6-8';
    return '9-12';
  }
}

export const teachingAidGeneratorService = new TeachingAidGeneratorService();
export default teachingAidGeneratorService;

