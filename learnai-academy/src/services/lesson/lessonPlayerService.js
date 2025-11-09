import prisma from '../../lib/prisma.js';
import { logInfo, logError } from '../../lib/logger.js';

/**
 * LessonPlayerService - Core service for delivering lessons to students
 * 
 * Features:
 * - Lesson initialization
 * - Content delivery
 * - Progress tracking
 * - Activity management
 * - Completion handling
 */

class LessonPlayerService {
  /**
   * Initialize lesson session
   * @param {string} lessonPlanId - Lesson plan ID
   * @param {string} studentId - Student ID
   * @param {Object} options - Initialization options
   * @returns {Promise<Object>} Lesson session
   */
  async initializeLesson(lessonPlanId, studentId, options = {}) {
    const {
      resume = false, // Resume previous session
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
        presentations: {
          where: { isActive: true },
          orderBy: { orderIndex: 'asc' },
        },
        teachingAids: {
          where: { isActive: true },
          orderBy: { orderIndex: 'asc' },
        },
        multimediaContent: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!lessonPlan) {
      throw new Error(`Lesson plan not found: ${lessonPlanId}`);
    }

    // Check for existing lesson session
    let lesson = await prisma.lesson.findFirst({
      where: {
        lessonPlanId,
        studentId,
        status: { in: ['IN_PROGRESS', 'PAUSED'] },
      },
      include: {
        activities: {
          where: { isActive: true },
          orderBy: { orderIndex: 'asc' },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    // Resume existing session or create new
    if (lesson && resume) {
      // Resume existing session
      lesson = await prisma.lesson.update({
        where: { id: lesson.id },
        data: {
          status: 'IN_PROGRESS',
          lastAccessedAt: new Date(),
        },
        include: {
          activities: {
            where: { isActive: true },
            orderBy: { orderIndex: 'asc' },
          },
          notes: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      logInfo('Lesson resumed', { lessonId: lesson.id, studentId });
    } else {
      // Create new lesson session
      lesson = await prisma.lesson.create({
        data: {
          lessonPlanId,
          studentId,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
          lastAccessedAt: new Date(),
        },
        include: {
          activities: {
            where: { isActive: true },
            orderBy: { orderIndex: 'asc' },
          },
          notes: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      // Create lesson activities from lesson plan structure
      await this.createLessonActivities(lesson.id, lessonPlan);

      logInfo('Lesson initialized', { lessonId: lesson.id, studentId });
    }

    // Prepare lesson content
    const lessonContent = await this.prepareLessonContent(lessonPlan, lesson);

    return {
      lesson: {
        id: lesson.id,
        status: lesson.status,
        startedAt: lesson.startedAt,
        lastAccessedAt: lesson.lastAccessedAt,
        progress: this.calculateProgress(lesson),
      },
      lessonPlan: {
        id: lessonPlan.id,
        name: lessonPlan.name,
        description: lessonPlan.description,
        durationMinutes: lessonPlan.durationMinutes,
        difficulty: lessonPlan.difficulty,
        learningObjectives: lessonPlan.learningObjectives,
      },
      content: lessonContent,
      activities: lesson.activities,
      notes: lesson.notes,
    };
  }

  /**
   * Get lesson content
   * @param {string} lessonId - Lesson ID
   * @param {string} section - Section to get (warmUp, instruction, practice, assessment, closure)
   * @returns {Promise<Object>} Lesson content
   */
  async getLessonContent(lessonId, section = null) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        lessonPlan: {
          include: {
            presentations: {
              where: { isActive: true },
              orderBy: { orderIndex: 'asc' },
            },
            teachingAids: {
              where: { isActive: true },
              orderBy: { orderIndex: 'asc' },
            },
            multimediaContent: {
              where: { isActive: true },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        activities: {
          where: { isActive: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!lesson) {
      throw new Error(`Lesson not found: ${lessonId}`);
    }

    const structure = lesson.lessonPlan.lessonStructure || {};

    if (section) {
      // Return specific section
      return {
        section,
        content: structure[section] || null,
        presentations: this.filterPresentationsBySection(lesson.lessonPlan.presentations, section),
        teachingAids: this.filterTeachingAidsBySection(lesson.lessonPlan.teachingAids, section),
        multimedia: this.filterMultimediaBySection(lesson.lessonPlan.multimediaContent, section),
        activities: this.filterActivitiesBySection(lesson.activities, section),
      };
    }

    // Return all sections
    return {
      warmUp: {
        content: structure.warmUp || null,
        presentations: this.filterPresentationsBySection(lesson.lessonPlan.presentations, 'warmUp'),
        teachingAids: this.filterTeachingAidsBySection(lesson.lessonPlan.teachingAids, 'warmUp'),
        multimedia: this.filterMultimediaBySection(lesson.lessonPlan.multimediaContent, 'warmUp'),
        activities: this.filterActivitiesBySection(lesson.activities, 'warmUp'),
      },
      instruction: {
        content: structure.instruction || null,
        presentations: this.filterPresentationsBySection(lesson.lessonPlan.presentations, 'instruction'),
        teachingAids: this.filterTeachingAidsBySection(lesson.lessonPlan.teachingAids, 'instruction'),
        multimedia: this.filterMultimediaBySection(lesson.lessonPlan.multimediaContent, 'instruction'),
        activities: this.filterActivitiesBySection(lesson.activities, 'instruction'),
      },
      practice: {
        content: structure.practice || null,
        presentations: this.filterPresentationsBySection(lesson.lessonPlan.presentations, 'practice'),
        teachingAids: this.filterTeachingAidsBySection(lesson.lessonPlan.teachingAids, 'practice'),
        multimedia: this.filterMultimediaBySection(lesson.lessonPlan.multimediaContent, 'practice'),
        activities: this.filterActivitiesBySection(lesson.activities, 'practice'),
      },
      assessment: {
        content: structure.assessment || null,
        presentations: this.filterPresentationsBySection(lesson.lessonPlan.presentations, 'assessment'),
        teachingAids: this.filterTeachingAidsBySection(lesson.lessonPlan.teachingAids, 'assessment'),
        multimedia: this.filterMultimediaBySection(lesson.lessonPlan.multimediaContent, 'assessment'),
        activities: this.filterActivitiesBySection(lesson.activities, 'assessment'),
      },
      closure: {
        content: structure.closure || null,
        presentations: this.filterPresentationsBySection(lesson.lessonPlan.presentations, 'closure'),
        teachingAids: this.filterTeachingAidsBySection(lesson.lessonPlan.teachingAids, 'closure'),
        multimedia: this.filterMultimediaBySection(lesson.lessonPlan.multimediaContent, 'closure'),
        activities: this.filterActivitiesBySection(lesson.activities, 'closure'),
      },
    };
  }

  /**
   * Prepare lesson content
   */
  async prepareLessonContent(lessonPlan, lesson) {
    const structure = lessonPlan.lessonStructure || {};

    return {
      structure,
      presentations: lessonPlan.presentations,
      teachingAids: lessonPlan.teachingAids,
      multimedia: lessonPlan.multimediaContent,
      activities: lesson.activities,
    };
  }

  /**
   * Create lesson activities from lesson plan
   */
  async createLessonActivities(lessonId, lessonPlan) {
    const structure = lessonPlan.lessonStructure || {};
    const practiceActivities = structure.practice?.activities || [];
    const assessmentActivities = structure.assessment?.activities || [];

    let orderIndex = 1;

    // Create practice activities
    for (const activity of practiceActivities) {
      await prisma.lessonActivity.create({
        data: {
          lessonId,
          activityTemplateId: null, // Will be linked if template exists
          orderIndex: orderIndex++,
          section: 'practice',
          activityData: activity,
          status: 'NOT_STARTED',
          isActive: true,
        },
      });
    }

    // Create assessment activities
    for (const activity of assessmentActivities) {
      await prisma.lessonActivity.create({
        data: {
          lessonId,
          activityTemplateId: null,
          orderIndex: orderIndex++,
          section: 'assessment',
          activityData: activity,
          status: 'NOT_STARTED',
          isActive: true,
        },
      });
    }
  }

  /**
   * Calculate lesson progress
   */
  calculateProgress(lesson) {
    const activities = lesson.activities || [];
    const totalActivities = activities.length;
    const completedActivities = activities.filter(a => a.status === 'COMPLETED').length;

    if (totalActivities === 0) {
      return {
        percentage: 0,
        completed: 0,
        total: 0,
      };
    }

    return {
      percentage: Math.round((completedActivities / totalActivities) * 100),
      completed: completedActivities,
      total: totalActivities,
    };
  }

  /**
   * Filter presentations by section
   */
  filterPresentationsBySection(presentations, section) {
    return presentations.filter(p => {
      const metadata = p.metadata || {};
      return metadata.section === section || !metadata.section;
    });
  }

  /**
   * Filter teaching aids by section
   */
  filterTeachingAidsBySection(teachingAids, section) {
    return teachingAids.filter(ta => {
      const metadata = ta.metadata || {};
      return metadata.section === section || !metadata.section;
    });
  }

  /**
   * Filter multimedia by section
   */
  filterMultimediaBySection(multimedia, section) {
    return multimedia.filter(m => {
      const metadata = m.metadata || {};
      return metadata.section === section || !metadata.section;
    });
  }

  /**
   * Filter activities by section
   */
  filterActivitiesBySection(activities, section) {
    return activities.filter(a => a.section === section);
  }

  /**
   * Update lesson access time
   * @param {string} lessonId - Lesson ID
   */
  async updateAccessTime(lessonId) {
    await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        lastAccessedAt: new Date(),
      },
    });
  }

  /**
   * Pause lesson
   * @param {string} lessonId - Lesson ID
   */
  async pauseLesson(lessonId) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new Error(`Lesson not found: ${lessonId}`);
    }

    if (lesson.status === 'COMPLETED') {
      throw new Error('Cannot pause completed lesson');
    }

    return await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        status: 'PAUSED',
        lastAccessedAt: new Date(),
      },
    });
  }

  /**
   * Complete lesson
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object>} Completed lesson
   */
  async completeLesson(lessonId) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        activities: true,
      },
    });

    if (!lesson) {
      throw new Error(`Lesson not found: ${lessonId}`);
    }

    // Calculate completion metrics
    const totalActivities = lesson.activities.length;
    const completedActivities = lesson.activities.filter(a => a.status === 'COMPLETED').length;
    const completionRate = totalActivities > 0 ? completedActivities / totalActivities : 0;

    // Calculate duration
    const startedAt = lesson.startedAt;
    const completedAt = new Date();
    const durationMinutes = Math.round((completedAt - startedAt) / (1000 * 60));

    // Update lesson
    const completedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        status: 'COMPLETED',
        completedAt,
        durationMinutes,
        completionRate,
        lastAccessedAt: completedAt,
      },
    });

    logInfo('Lesson completed', {
      lessonId,
      durationMinutes,
      completionRate,
    });

    return completedLesson;
  }
}

export const lessonPlayerService = new LessonPlayerService();
export default lessonPlayerService;

