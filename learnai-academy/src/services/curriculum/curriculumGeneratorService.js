import prisma from '../../lib/prisma.js';
import { agentOrchestrator } from '../ai/agentOrchestrator.js';
import { standardsService } from './standardsService.js';

/**
 * CurriculumGeneratorService - Generates formal curriculum structure
 * 
 * Creates full-year curricula with units, lesson plans, and all components
 */

class CurriculumGeneratorService {
  /**
   * Generate a full-year curriculum for a subject and grade level
   * @param {string} subjectId - Subject ID
   * @param {number} gradeLevel - Grade level (-1 = Preschool, 0 = Pre-K, 1-12 = Grades)
   * @param {string} academicYear - Academic year (e.g., "2024-2025")
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated curriculum
   */
  async generateCurriculum(subjectId, gradeLevel, academicYear, options = {}) {
    const {
      name = null,
      description = null,
      standards = null,
      unitCount = null,
      includeScopeSequence = true,
    } = options;

    // Check if curriculum already exists
    const existing = await prisma.curriculum.findUnique({
      where: {
        subjectId_gradeLevel_academicYear: {
          subjectId,
          gradeLevel,
          academicYear,
        },
      },
    });

    if (existing && !options.force) {
      return existing;
    }

    // Get subject
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      throw new Error(`Subject not found: ${subjectId}`);
    }

    // Generate curriculum name if not provided
    const curriculumName = name || `${subject.name} Grade ${this.getGradeName(gradeLevel)} - ${academicYear}`;

    // Get standards for this grade level
    const curriculumStandards = standards || await this.getStandardsForGrade(subject.slug, gradeLevel);

    // Generate scope and sequence
    const scopeSequence = includeScopeSequence
      ? await this.generateScopeSequence(subject.slug, gradeLevel, unitCount)
      : null;

    // Create curriculum
    const curriculum = await prisma.curriculum.create({
      data: {
        name: curriculumName,
        subjectId,
        gradeLevel,
        academicYear,
        description: description || `Full-year ${subject.name} curriculum for ${this.getGradeName(gradeLevel)}`,
        standards: curriculumStandards,
        scopeSequence,
        isActive: true,
      },
    });

    // Generate units if unitCount is specified
    if (unitCount && unitCount > 0) {
      await this.generateUnitsForCurriculum(curriculum.id, subject.slug, gradeLevel, unitCount);
    }

    return curriculum;
  }

  /**
   * Generate units for a curriculum
   * @param {string} curriculumId - Curriculum ID
   * @param {string} subjectSlug - Subject slug
   * @param {number} gradeLevel - Grade level
   * @param {number} unitCount - Number of units to generate
   * @returns {Promise<Array>} Generated units
   */
  async generateUnitsForCurriculum(curriculumId, subjectSlug, gradeLevel, unitCount) {
    const units = [];
    const unitTopics = this.getUnitTopicsForGrade(subjectSlug, gradeLevel);

    // Limit to available topics or requested count
    const topicsToUse = unitTopics.slice(0, Math.min(unitCount, unitTopics.length));

    for (let i = 0; i < topicsToUse.length; i++) {
      const topic = topicsToUse[i];
      
      const unit = await prisma.unit.create({
        data: {
          curriculumId,
          name: topic.name,
          description: topic.description,
          orderIndex: i + 1,
          durationWeeks: topic.durationWeeks || 2,
          prerequisites: topic.prerequisites || null,
          learningGoals: topic.learningGoals || null,
          standards: topic.standards || null,
          isActive: true,
        },
      });

      units.push(unit);
    }

    return units;
  }

  /**
   * Generate a lesson plan for a unit
   * @param {string} unitId - Unit ID
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated lesson plan
   */
  async generateLessonPlanForUnit(unitId, options = {}) {
    const {
      name = null,
      description = null,
      durationMinutes = 30,
      difficulty = 'MEDIUM',
      includeAllComponents = true,
    } = options;

    // Get unit and curriculum info
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

    const { curriculum } = unit;
    const subjectSlug = curriculum.subject.slug;
    const gradeLevel = curriculum.gradeLevel;

    // Get standards for this unit
    const standards = unit.standards || await standardsService.getStandards(
      subjectSlug,
      gradeLevel,
      unit.name
    );

    // Generate lesson plan using CurriculumAgent
    const lessonPlanData = await agentOrchestrator.generateCurriculum(
      'lessonPlan',
      subjectSlug,
      unit.name,
      gradeLevel,
      {
        topicId: null, // Unit-level, not topic-level
        includeStandards: true,
        includeAssessments: includeAllComponents,
        includePracticeProblems: includeAllComponents,
        difficultyLevel: difficulty,
        standards: standards,
      }
    );

    // Structure lesson plan according to formal format
    const lessonStructure = this.createLessonStructure(lessonPlanData, durationMinutes);

    // Create lesson plan
    const lessonPlan = await prisma.lessonPlan.create({
      data: {
        unitId,
        name: name || lessonPlanData.objectives?.[0] || `${unit.name} - Lesson`,
        description: description || lessonPlanData.description || `Lesson plan for ${unit.name}`,
        orderIndex: await this.getNextOrderIndex(unitId),
        durationMinutes,
        difficulty,
        learningObjectives: lessonPlanData.objectives || lessonPlanData.learningObjectives || [],
        prerequisites: lessonPlanData.prerequisites || [],
        materials: lessonPlanData.materials || [],
        standards: standards,
        lessonStructure,
        isActive: true,
      },
    });

    return lessonPlan;
  }

  /**
   * Generate multiple lesson plans for a unit
   * @param {string} unitId - Unit ID
   * @param {number} count - Number of lesson plans to generate
   * @param {Object} options - Generation options
   * @returns {Promise<Array>} Generated lesson plans
   */
  async generateLessonPlansForUnit(unitId, count, options = {}) {
    const lessonPlans = [];

    for (let i = 0; i < count; i++) {
      const lessonPlan = await this.generateLessonPlanForUnit(unitId, {
        ...options,
        name: options.name ? `${options.name} - Lesson ${i + 1}` : null,
      });
      lessonPlans.push(lessonPlan);
    }

    return lessonPlans;
  }

  /**
   * Generate scope and sequence for a curriculum
   * @param {string} subjectSlug - Subject slug
   * @param {number} gradeLevel - Grade level
   * @param {number} unitCount - Number of units
   * @returns {Promise<Object>} Scope and sequence
   */
  async generateScopeSequence(subjectSlug, gradeLevel, unitCount = null) {
    const gradeBand = this.getGradeBand(gradeLevel);
    const topics = this.getUnitTopicsForGrade(subjectSlug, gradeLevel);
    
    const actualUnitCount = unitCount || topics.length;
    const unitsToPlan = topics.slice(0, actualUnitCount);

    // Calculate pacing
    const totalWeeks = unitsToPlan.reduce((sum, topic) => sum + (topic.durationWeeks || 2), 0);
    const weeksPerUnit = totalWeeks / actualUnitCount;

    // Create quarterly breakdown
    const quarters = [];
    let currentQuarter = 1;
    let currentWeek = 1;
    const weeksPerQuarter = 9; // Standard quarter length

    for (let i = 0; i < unitsToPlan.length; i++) {
      const unit = unitsToPlan[i];
      const duration = unit.durationWeeks || weeksPerUnit;

      if (currentWeek + duration > weeksPerQuarter && currentQuarter < 4) {
        currentQuarter++;
        currentWeek = 1;
      }

      if (!quarters[currentQuarter - 1]) {
        quarters[currentQuarter - 1] = {
          quarter: currentQuarter,
          weeks: weeksPerQuarter,
          units: [],
        };
      }

      quarters[currentQuarter - 1].units.push({
        name: unit.name,
        durationWeeks: duration,
        startWeek: currentWeek,
        endWeek: currentWeek + duration - 1,
      });

      currentWeek += duration;
    }

    return {
      totalWeeks,
      weeksPerUnit: Math.round(weeksPerUnit * 10) / 10,
      quarters,
      pacing: {
        lessonsPerWeek: 5,
        minutesPerLesson: 30,
        reviewDays: ['Friday'],
        assessmentDays: ['End of unit'],
      },
    };
  }

  /**
   * Create formal lesson structure
   * @param {Object} lessonPlanData - Generated lesson plan data
   * @param {number} durationMinutes - Total duration
   * @returns {Object} Structured lesson format
   */
  createLessonStructure(lessonPlanData, durationMinutes) {
    // Calculate time allocation (standard percentages)
    const warmUpMinutes = Math.max(3, Math.round(durationMinutes * 0.1));
    const instructionMinutes = Math.round(durationMinutes * 0.4);
    const practiceMinutes = Math.round(durationMinutes * 0.35);
    const assessmentMinutes = Math.max(3, Math.round(durationMinutes * 0.1));
    const closureMinutes = Math.max(2, durationMinutes - warmUpMinutes - instructionMinutes - practiceMinutes - assessmentMinutes);

    return {
      warmUp: {
        duration: warmUpMinutes,
        activity: lessonPlanData.warmUp || 'Review previous concepts and engage students',
        content: lessonPlanData.warmUpContent || null,
      },
      instruction: {
        duration: instructionMinutes,
        presentation: lessonPlanData.instruction || 'Main concept explanation',
        content: lessonPlanData.keyConcepts || lessonPlanData.instructionContent || null,
        teachingAids: lessonPlanData.materials || [],
      },
      practice: {
        duration: practiceMinutes,
        activities: lessonPlanData.practice || lessonPlanData.activities || [],
        problems: lessonPlanData.practiceProblems || [],
      },
      assessment: {
        duration: assessmentMinutes,
        quiz: lessonPlanData.assessment || lessonPlanData.quiz || null,
        questions: lessonPlanData.assessmentQuestions || [],
      },
      closure: {
        duration: closureMinutes,
        activity: lessonPlanData.closure || 'Review key concepts and preview next lesson',
        summary: lessonPlanData.summary || null,
      },
    };
  }

  /**
   * Get unit topics for a grade level
   * @param {string} subjectSlug - Subject slug
   * @param {number} gradeLevel - Grade level
   * @returns {Array} Unit topics
   */
  getUnitTopicsForGrade(subjectSlug, gradeLevel) {
    const gradeBand = this.getGradeBand(gradeLevel);
    const topicsMap = this.getTopicsBySubjectAndGrade();

    return topicsMap[subjectSlug]?.[gradeBand] || topicsMap[subjectSlug]?.['default'] || [];
  }

  /**
   * Get topics organized by subject and grade band
   * @returns {Object} Topics map
   */
  getTopicsBySubjectAndGrade() {
    return {
      math: {
        'K-2': [
          { name: 'Counting and Numbers', description: 'Learn to count and recognize numbers', durationWeeks: 2 },
          { name: 'Addition and Subtraction', description: 'Basic addition and subtraction', durationWeeks: 3 },
          { name: 'Shapes and Patterns', description: 'Identify shapes and create patterns', durationWeeks: 2 },
          { name: 'Measurement', description: 'Compare sizes and measure objects', durationWeeks: 2 },
        ],
        '3-5': [
          { name: 'Multiplication and Division', description: 'Learn multiplication and division facts', durationWeeks: 4 },
          { name: 'Fractions', description: 'Understand and work with fractions', durationWeeks: 3 },
          { name: 'Decimals', description: 'Decimal numbers and operations', durationWeeks: 2 },
          { name: 'Geometry', description: 'Shapes, angles, and area', durationWeeks: 3 },
          { name: 'Measurement and Data', description: 'Units of measurement and data analysis', durationWeeks: 2 },
        ],
        '6-8': [
          { name: 'Ratios and Proportions', description: 'Understanding ratios and proportional relationships', durationWeeks: 3 },
          { name: 'Algebra Basics', description: 'Introduction to algebraic thinking', durationWeeks: 4 },
          { name: 'Geometry and Measurement', description: 'Advanced geometry concepts', durationWeeks: 3 },
          { name: 'Statistics and Probability', description: 'Data analysis and probability', durationWeeks: 3 },
        ],
        '9-12': [
          { name: 'Algebra I', description: 'Linear equations and functions', durationWeeks: 6 },
          { name: 'Geometry', description: 'Proofs and geometric relationships', durationWeeks: 5 },
          { name: 'Algebra II', description: 'Advanced algebra and functions', durationWeeks: 6 },
          { name: 'Pre-Calculus', description: 'Trigonometry and advanced functions', durationWeeks: 5 },
        ],
        default: [
          { name: 'Number Operations', description: 'Basic number operations', durationWeeks: 2 },
          { name: 'Problem Solving', description: 'Mathematical problem solving', durationWeeks: 2 },
        ],
      },
      english: {
        'K-2': [
          { name: 'Phonics and Reading', description: 'Learn letter sounds and reading basics', durationWeeks: 4 },
          { name: 'Vocabulary Building', description: 'Expand vocabulary through reading', durationWeeks: 2 },
          { name: 'Writing Basics', description: 'Learn to write sentences and stories', durationWeeks: 3 },
        ],
        '3-5': [
          { name: 'Reading Comprehension', description: 'Understand and analyze texts', durationWeeks: 4 },
          { name: 'Grammar and Writing', description: 'Grammar rules and writing skills', durationWeeks: 4 },
          { name: 'Vocabulary and Spelling', description: 'Expand vocabulary and spelling', durationWeeks: 2 },
        ],
        '6-8': [
          { name: 'Literary Analysis', description: 'Analyze literature and texts', durationWeeks: 4 },
          { name: 'Writing Skills', description: 'Essay writing and composition', durationWeeks: 4 },
          { name: 'Grammar and Language', description: 'Advanced grammar and language use', durationWeeks: 3 },
        ],
        '9-12': [
          { name: 'Advanced Literature', description: 'Study of classic and modern literature', durationWeeks: 5 },
          { name: 'Advanced Writing', description: 'Research papers and analytical writing', durationWeeks: 5 },
          { name: 'Language and Rhetoric', description: 'Rhetorical analysis and persuasive writing', durationWeeks: 4 },
        ],
        default: [
          { name: 'Reading', description: 'Reading skills', durationWeeks: 2 },
          { name: 'Writing', description: 'Writing skills', durationWeeks: 2 },
        ],
      },
      science: {
        'K-2': [
          { name: 'Living Things', description: 'Plants and animals', durationWeeks: 2 },
          { name: 'Earth and Space', description: 'Weather and seasons', durationWeeks: 2 },
          { name: 'Matter and Energy', description: 'Basic properties of matter', durationWeeks: 2 },
        ],
        '3-5': [
          { name: 'Life Science', description: 'Ecosystems and life cycles', durationWeeks: 3 },
          { name: 'Physical Science', description: 'Forces, motion, and energy', durationWeeks: 3 },
          { name: 'Earth Science', description: 'Earth processes and space', durationWeeks: 3 },
        ],
        '6-8': [
          { name: 'Life Science', description: 'Cells, genetics, and evolution', durationWeeks: 4 },
          { name: 'Physical Science', description: 'Chemistry and physics basics', durationWeeks: 4 },
          { name: 'Earth and Space Science', description: 'Earth systems and astronomy', durationWeeks: 3 },
        ],
        '9-12': [
          { name: 'Biology', description: 'Advanced life sciences', durationWeeks: 6 },
          { name: 'Chemistry', description: 'Chemical reactions and properties', durationWeeks: 5 },
          { name: 'Physics', description: 'Forces, energy, and motion', durationWeeks: 5 },
        ],
        default: [
          { name: 'Scientific Inquiry', description: 'Scientific method and inquiry', durationWeeks: 2 },
        ],
      },
    };
  }

  /**
   * Get standards for a grade level
   * @param {string} subjectSlug - Subject slug
   * @param {number} gradeLevel - Grade level
   * @returns {Promise<Array>} Standards
   */
  async getStandardsForGrade(subjectSlug, gradeLevel) {
    try {
      const standards = await standardsService.getStandards(subjectSlug, gradeLevel, 'general');
      return standards;
    } catch (error) {
      console.warn('Error fetching standards:', error);
      return [];
    }
  }

  /**
   * Get next order index for lesson plan in unit
   * @param {string} unitId - Unit ID
   * @returns {Promise<number>} Next order index
   */
  async getNextOrderIndex(unitId) {
    const lastLessonPlan = await prisma.lessonPlan.findFirst({
      where: { unitId },
      orderBy: { orderIndex: 'desc' },
    });

    return (lastLessonPlan?.orderIndex || 0) + 1;
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

  /**
   * Get grade name
   */
  getGradeName(grade) {
    if (grade === -1) return 'Preschool';
    if (grade === 0) return 'Pre-K';
    if (grade === 1) return '1st Grade';
    if (grade === 2) return '2nd Grade';
    if (grade === 3) return '3rd Grade';
    return `${grade}th Grade`;
  }
}

export const curriculumGeneratorService = new CurriculumGeneratorService();
export default curriculumGeneratorService;

