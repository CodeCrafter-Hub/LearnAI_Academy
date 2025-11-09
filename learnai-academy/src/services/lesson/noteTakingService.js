import prisma from '../../lib/prisma.js';
import { logInfo, logError } from '../../lib/logger.js';

/**
 * NoteTakingService - Handles student note-taking during lessons
 * 
 * Features:
 * - Create notes
 * - Update notes
 * - Delete notes
 * - Organize notes
 * - Search notes
 */

class NoteTakingService {
  /**
   * Create note
   * @param {string} lessonId - Lesson ID
   * @param {Object} noteData - Note data
   * @returns {Promise<Object>} Created note
   */
  async createNote(lessonId, noteData) {
    const {
      content,
      section = null,
      timestamp = null,
      tags = [],
    } = noteData;

    if (!content || content.trim().length === 0) {
      throw new Error('Note content is required');
    }

    // Verify lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new Error(`Lesson not found: ${lessonId}`);
    }

    // Create note
    const note = await prisma.lessonNote.create({
      data: {
        lessonId,
        content: content.trim(),
        section,
        timestamp: timestamp || new Date().toISOString(),
        tags,
        isActive: true,
      },
    });

    logInfo('Note created', { noteId: note.id, lessonId });

    return note;
  }

  /**
   * Update note
   * @param {string} noteId - Note ID
   * @param {Object} updates - Updates
   * @returns {Promise<Object>} Updated note
   */
  async updateNote(noteId, updates) {
    const {
      content,
      section,
      tags,
    } = updates;

    const note = await prisma.lessonNote.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new Error(`Note not found: ${noteId}`);
    }

    const updateData = {};

    if (content !== undefined) {
      if (!content || content.trim().length === 0) {
        throw new Error('Note content cannot be empty');
      }
      updateData.content = content.trim();
    }

    if (section !== undefined) {
      updateData.section = section;
    }

    if (tags !== undefined) {
      updateData.tags = tags;
    }

    updateData.updatedAt = new Date();

    const updatedNote = await prisma.lessonNote.update({
      where: { id: noteId },
      data: updateData,
    });

    logInfo('Note updated', { noteId });

    return updatedNote;
  }

  /**
   * Delete note
   * @param {string} noteId - Note ID
   * @returns {Promise<boolean>} Success
   */
  async deleteNote(noteId) {
    const note = await prisma.lessonNote.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new Error(`Note not found: ${noteId}`);
    }

    // Soft delete
    await prisma.lessonNote.update({
      where: { id: noteId },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    logInfo('Note deleted', { noteId });

    return true;
  }

  /**
   * Get notes for lesson
   * @param {string} lessonId - Lesson ID
   * @param {Object} options - Options
   * @returns {Promise<Array>} Notes
   */
  async getNotes(lessonId, options = {}) {
    const {
      section = null,
      tags = null,
      search = null,
    } = options;

    const where = {
      lessonId,
      isActive: true,
    };

    if (section) {
      where.section = section;
    }

    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    if (search) {
      where.content = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const notes = await prisma.lessonNote.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    return notes;
  }

  /**
   * Get note by ID
   * @param {string} noteId - Note ID
   * @returns {Promise<Object>} Note
   */
  async getNote(noteId) {
    const note = await prisma.lessonNote.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new Error(`Note not found: ${noteId}`);
    }

    return note;
  }

  /**
   * Get notes by section
   * @param {string} lessonId - Lesson ID
   * @param {string} section - Section name
   * @returns {Promise<Array>} Notes
   */
  async getNotesBySection(lessonId, section) {
    return await this.getNotes(lessonId, { section });
  }

  /**
   * Search notes
   * @param {string} lessonId - Lesson ID
   * @param {string} query - Search query
   * @returns {Promise<Array>} Matching notes
   */
  async searchNotes(lessonId, query) {
    return await this.getNotes(lessonId, { search: query });
  }

  /**
   * Get all notes for student
   * @param {string} studentId - Student ID
   * @param {Object} options - Options
   * @returns {Promise<Array>} Notes
   */
  async getStudentNotes(studentId, options = {}) {
    const {
      subject = null,
      timeRange = 'all',
    } = options;

    const dateFilter = this.getDateFilter(timeRange);

    const notes = await prisma.lessonNote.findMany({
      where: {
        lesson: {
          studentId,
          ...(dateFilter ? { startedAt: dateFilter } : {}),
        },
        isActive: true,
        ...(subject ? {
          lesson: {
            lessonPlan: {
              unit: {
                curriculum: {
                  subject: {
                    slug: subject,
                  },
                },
              },
            },
          },
        } : {}),
      },
      include: {
        lesson: {
          include: {
            lessonPlan: {
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
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return notes;
  }

  /**
   * Get date filter
   */
  getDateFilter(timeRange) {
    if (timeRange === 'all') {
      return null;
    }

    const now = new Date();
    let startDate;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        return null;
    }

    return {
      gte: startDate,
    };
  }
}

export const noteTakingService = new NoteTakingService();
export default noteTakingService;

