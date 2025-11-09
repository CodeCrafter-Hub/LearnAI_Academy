import prisma from '../../lib/prisma.js';
import { curriculumGeneratorService } from './curriculumGeneratorService.js';
import { groqClient } from '../ai/groqClient.js';
import { logInfo, logError } from '../../lib/logger.js';

/**
 * PreschoolCurriculumService - Specialized curriculum for Preschool and Pre-K
 * 
 * Features:
 * - Play-based learning
 * - Age-appropriate activities (3-5 years)
 * - Parent involvement
 * - Development-focused content
 * - Shorter lesson durations (15-20 minutes)
 */

class PreschoolCurriculumService {
  /**
   * Generate Preschool curriculum (Age 3-4, Grade -1)
   * @param {string} subjectId - Subject ID
   * @param {string} academicYear - Academic year
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated curriculum
   */
  async generatePreschoolCurriculum(subjectId, academicYear, options = {}) {
    const {
      unitCount = 6,
      name = null,
    } = options;

    // Generate base curriculum
    const curriculum = await curriculumGeneratorService.generateCurriculum(
      subjectId,
      -1, // Preschool grade level
      academicYear,
      {
        name: name || `Preschool Curriculum - ${academicYear}`,
        unitCount,
        includeScopeSequence: true,
      }
    );

    // Enhance with preschool-specific features
    await this.enhancePreschoolCurriculum(curriculum.id);

    return curriculum;
  }

  /**
   * Generate Pre-K curriculum (Age 4-5, Grade 0)
   * @param {string} subjectId - Subject ID
   * @param {string} academicYear - Academic year
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated curriculum
   */
  async generatePreKCurriculum(subjectId, academicYear, options = {}) {
    const {
      unitCount = 8,
      name = null,
    } = options;

    // Generate base curriculum
    const curriculum = await curriculumGeneratorService.generateCurriculum(
      subjectId,
      0, // Pre-K grade level
      academicYear,
      {
        name: name || `Pre-K Curriculum - ${academicYear}`,
        unitCount,
        includeScopeSequence: true,
      }
    );

    // Enhance with Pre-K specific features
    await this.enhancePreKCurriculum(curriculum.id);

    return curriculum;
  }

  /**
   * Enhance curriculum with preschool-specific features
   * @param {string} curriculumId - Curriculum ID
   */
  async enhancePreschoolCurriculum(curriculumId) {
    const curriculum = await prisma.curriculum.findUnique({
      where: { id: curriculumId },
      include: {
        units: true,
      },
    });

    // Update curriculum with preschool-specific settings
    await prisma.curriculum.update({
      where: { id: curriculumId },
      data: {
        scopeSequence: {
          ...curriculum.scopeSequence,
          preschool: {
            lessonDuration: 15, // Shorter lessons
            activitiesPerLesson: 3, // More activities
            playBased: true,
            parentInvolvement: true,
            focusAreas: ['social', 'emotional', 'cognitive', 'physical'],
          },
        },
      },
    });

    // Enhance each unit
    for (const unit of curriculum.units) {
      await this.enhancePreschoolUnit(unit.id);
    }
  }

  /**
   * Enhance curriculum with Pre-K specific features
   * @param {string} curriculumId - Curriculum ID
   */
  async enhancePreKCurriculum(curriculumId) {
    const curriculum = await prisma.curriculum.findUnique({
      where: { id: curriculumId },
      include: {
        units: true,
      },
    });

    // Update curriculum with Pre-K specific settings
    await prisma.curriculum.update({
      where: { id: curriculumId },
      data: {
        scopeSequence: {
          ...curriculum.scopeSequence,
          preK: {
            lessonDuration: 20, // Slightly longer
            activitiesPerLesson: 4,
            playBased: true,
            parentInvolvement: true,
            schoolReadiness: true,
            focusAreas: ['literacy', 'numeracy', 'social', 'emotional'],
          },
        },
      },
    });

    // Enhance each unit
    for (const unit of curriculum.units) {
      await this.enhancePreKUnit(unit.id);
    }
  }

  /**
   * Enhance unit with preschool-specific content
   * @param {string} unitId - Unit ID
   */
  async enhancePreschoolUnit(unitId) {
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
    });

    // Update unit with preschool-specific learning goals
    await prisma.unit.update({
      where: { id: unitId },
      data: {
        learningGoals: {
          ...(unit.learningGoals || {}),
          preschool: {
            socialEmotional: 'Develop social skills and emotional regulation',
            cognitive: 'Build foundational thinking skills',
            physical: 'Develop fine and gross motor skills',
            language: 'Expand vocabulary and communication',
          },
        },
        prerequisites: {
          ...(unit.prerequisites || {}),
          age: '3-4 years',
          developmental: 'Basic motor skills, simple vocabulary',
        },
      },
    });
  }

  /**
   * Enhance unit with Pre-K specific content
   * @param {string} unitId - Unit ID
   */
  async enhancePreKUnit(unitId) {
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
    });

    // Update unit with Pre-K specific learning goals
    await prisma.unit.update({
      where: { id: unitId },
      data: {
        learningGoals: {
          ...(unit.learningGoals || {}),
          preK: {
            literacy: 'Letter recognition, phonics basics',
            numeracy: 'Counting, number recognition',
            social: 'Cooperation, sharing, following directions',
            emotional: 'Self-regulation, empathy',
            schoolReadiness: 'Prepare for kindergarten',
          },
        },
        prerequisites: {
          ...(unit.prerequisites || {}),
          age: '4-5 years',
          developmental: 'Basic counting, letter awareness, social skills',
        },
      },
    });
  }

  /**
   * Generate preschool lesson plan
   * @param {string} unitId - Unit ID
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated lesson plan
   */
  async generatePreschoolLessonPlan(unitId, options = {}) {
    const {
      durationMinutes = 15,
      includeParentGuide = true,
    } = options;

    // Get unit
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: {
        curriculum: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!unit) {
      throw new Error(`Unit not found: ${unitId}`);
    }

    const gradeLevel = unit.curriculum.gradeLevel;
    const subjectSlug = unit.curriculum.subject.slug;

    // Generate age-appropriate lesson plan
    const lessonPlanData = await this.generateAgeAppropriateLessonPlan(
      unit.name,
      gradeLevel,
      subjectSlug,
      durationMinutes
    );

    // Create lesson plan with preschool structure
    const lessonPlan = await prisma.lessonPlan.create({
      data: {
        unitId,
        name: lessonPlanData.name,
        description: lessonPlanData.description,
        orderIndex: await this.getNextOrderIndex(unitId),
        durationMinutes,
        difficulty: 'EASY', // Always easy for preschool
        learningObjectives: lessonPlanData.objectives,
        prerequisites: lessonPlanData.prerequisites,
        materials: lessonPlanData.materials,
        standards: lessonPlanData.standards,
        lessonStructure: this.createPreschoolLessonStructure(lessonPlanData, durationMinutes),
        isActive: true,
      },
    });

    // Generate parent guide if requested
    if (includeParentGuide) {
      await this.generateParentGuide(lessonPlan.id);
    }

    return lessonPlan;
  }

  /**
   * Generate age-appropriate lesson plan for preschool/Pre-K
   * @param {string} unitName - Unit name
   * @param {number} gradeLevel - Grade level (-1 or 0)
   * @param {string} subjectSlug - Subject slug
   * @param {number} durationMinutes - Duration
   * @returns {Promise<Object>} Lesson plan data
   */
  async generateAgeAppropriateLessonPlan(unitName, gradeLevel, subjectSlug, durationMinutes) {
    const ageGroup = gradeLevel === -1 ? 'Preschool (3-4 years)' : 'Pre-K (4-5 years)';
    const gradeBand = gradeLevel === -1 ? 'Preschool' : 'Pre-K';

    const prompt = `You are creating a lesson plan for ${ageGroup} students.

UNIT: ${unitName}
SUBJECT: ${subjectSlug}
DURATION: ${durationMinutes} minutes

Create a play-based, age-appropriate lesson plan that:
- Uses hands-on activities and games
- Includes songs, rhymes, or movement
- Uses simple, clear language
- Focuses on exploration and discovery
- Includes parent involvement suggestions
- Is developmentally appropriate

For ${gradeBand}:
${this.getPreschoolGuidelines(gradeLevel)}

Provide:
- name: Lesson name
- description: Brief description
- objectives: 2-3 simple learning objectives
- prerequisites: What children should know
- materials: Simple materials (toys, paper, crayons, etc.)
- activities: 3-4 play-based activities
- songs: Optional songs or rhymes
- parentTips: Tips for parents to support learning

Format as JSON.`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: `Generate the ${gradeBand} lesson plan as JSON.` },
    ], {
      model: groqClient.models.smart,
      temperature: 0.5,
      maxTokens: 2500,
    });

    return this.parseLessonPlan(response.content);
  }

  /**
   * Create preschool lesson structure
   * @param {Object} lessonPlanData - Lesson plan data
   * @param {number} durationMinutes - Duration
   * @returns {Object} Structured lesson
   */
  createPreschoolLessonStructure(lessonPlanData, durationMinutes) {
    // Preschool lessons are shorter and more activity-focused
    const warmUpMinutes = 2;
    const instructionMinutes = Math.round(durationMinutes * 0.3); // Less instruction
    const activityMinutes = Math.round(durationMinutes * 0.5); // More activities
    const closureMinutes = Math.max(1, durationMinutes - warmUpMinutes - instructionMinutes - activityMinutes);

    return {
      warmUp: {
        duration: warmUpMinutes,
        activity: lessonPlanData.warmUp || 'Greeting song and movement',
        content: lessonPlanData.songs?.[0] || null,
      },
      instruction: {
        duration: instructionMinutes,
        presentation: 'Simple explanation with visuals',
        content: lessonPlanData.keyConcepts || [],
        teachingAids: lessonPlanData.materials || [],
        interactive: true, // Always interactive for preschool
      },
      practice: {
        duration: activityMinutes,
        activities: lessonPlanData.activities || [],
        games: lessonPlanData.games || [],
        songs: lessonPlanData.songs || [],
        playBased: true,
      },
      assessment: {
        duration: 0, // No formal assessment for preschool
        observation: 'Observe child engagement and participation',
      },
      closure: {
        duration: closureMinutes,
        activity: lessonPlanData.closure || 'Clean-up song and goodbye',
        parentTips: lessonPlanData.parentTips || [],
      },
    };
  }

  /**
   * Generate parent guide for lesson
   * @param {string} lessonPlanId - Lesson plan ID
   * @returns {Promise<Object>} Parent guide
   */
  async generateParentGuide(lessonPlanId) {
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

    const gradeLevel = lessonPlan.unit.curriculum.gradeLevel;
    const ageGroup = gradeLevel === -1 ? '3-4 years' : '4-5 years';

    const prompt = `Create a parent guide for a ${ageGroup} child learning ${lessonPlan.unit.curriculum.subject.name}.

LESSON: ${lessonPlan.name}

Create a guide that helps parents:
1. Understand what their child is learning
2. Support learning at home
3. Engage in activities together
4. Recognize progress
5. Ask appropriate questions

Include:
- What your child is learning (simple explanation)
- How to support at home (3-5 activities)
- Questions to ask your child
- Signs of progress
- When to celebrate

Format as JSON.`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: 'Generate the parent guide as JSON.' },
    ], {
      model: groqClient.models.smart,
      temperature: 0.6,
      maxTokens: 2000,
    });

    const parentGuide = this.parseJSON(response.content);

    // Store parent guide in lesson plan metadata
    await prisma.lessonPlan.update({
      where: { id: lessonPlanId },
      data: {
        metadata: {
          parentGuide,
        },
      },
    });

    return parentGuide;
  }

  /**
   * Get preschool guidelines
   */
  getPreschoolGuidelines(gradeLevel) {
    if (gradeLevel === -1) {
      return `
PRESCHOOL GUIDELINES (Age 3-4):
- Keep activities 5-10 minutes each
- Use lots of movement and play
- Simple vocabulary (2-3 word phrases)
- Focus on exploration, not mastery
- Use songs, rhymes, and games
- Include sensory activities
- Parent involvement encouraged
- No formal assessment
- Celebrate effort, not perfection`;
    } else {
      return `
PRE-K GUIDELINES (Age 4-5):
- Keep activities 10-15 minutes each
- Mix play with structured learning
- Clear, simple language
- Focus on school readiness
- Include letter and number recognition
- Use games and hands-on activities
- Parent involvement important
- Informal observation
- Celebrate progress and effort`;
    }
  }

  /**
   * Parse lesson plan from AI response
   */
  parseLessonPlan(content) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { raw: content };
    } catch (error) {
      return { raw: content };
    }
  }

  /**
   * Parse JSON from AI response
   */
  parseJSON(content) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { raw: content };
    } catch (error) {
      return { raw: content };
    }
  }

  /**
   * Get next order index
   */
  async getNextOrderIndex(unitId) {
    const lastLessonPlan = await prisma.lessonPlan.findFirst({
      where: { unitId },
      orderBy: { orderIndex: 'desc' },
    });

    return (lastLessonPlan?.orderIndex || 0) + 1;
  }
}

export const preschoolCurriculumService = new PreschoolCurriculumService();
export default preschoolCurriculumService;

