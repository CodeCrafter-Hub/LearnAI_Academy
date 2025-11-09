import prisma from '../../lib/prisma.js';
import { logInfo, logError } from '../../lib/logger.js';

/**
 * InteractiveElementsService - Handles interactive elements in lessons
 * 
 * Features:
 * - Interactive questions
 * - Polls/surveys
 * - Drag-and-drop
 * - Matching exercises
 * - Interactive videos
 */

class InteractiveElementsService {
  /**
   * Submit interactive response
   * @param {string} lessonId - Lesson ID
   * @param {string} elementId - Element ID
   * @param {Object} response - Response data
   * @returns {Promise<Object>} Response result
   */
  async submitResponse(lessonId, elementId, response) {
    const {
      type,
      data,
      timestamp = null,
    } = response;

    // Verify lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new Error(`Lesson not found: ${lessonId}`);
    }

    // Store response in lesson metadata
    const metadata = lesson.metadata || {};
    const interactiveResponses = metadata.interactiveResponses || {};

    interactiveResponses[elementId] = {
      type,
      data,
      timestamp: timestamp || new Date().toISOString(),
      submittedAt: new Date().toISOString(),
    };

    // Update lesson metadata
    await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        metadata: {
          ...metadata,
          interactiveResponses,
        },
      },
    });

    logInfo('Interactive response submitted', { lessonId, elementId, type });

    return {
      success: true,
      elementId,
      response: interactiveResponses[elementId],
    };
  }

  /**
   * Get interactive responses
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object>} Responses
   */
  async getResponses(lessonId) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new Error(`Lesson not found: ${lessonId}`);
    }

    const metadata = lesson.metadata || {};
    return metadata.interactiveResponses || {};
  }

  /**
   * Process interactive question
   * @param {Object} question - Question data
   * @param {Object} answer - Student answer
   * @returns {Promise<Object>} Result
   */
  async processQuestion(question, answer) {
    const {
      type,
      correctAnswer,
      options = [],
    } = question;

    let isCorrect = false;
    let feedback = '';

    switch (type) {
      case 'multiple_choice':
        isCorrect = answer === correctAnswer;
        feedback = isCorrect
          ? 'Correct! Well done!'
          : `Incorrect. The correct answer is: ${options[correctAnswer] || correctAnswer}`;
        break;

      case 'true_false':
        isCorrect = answer === correctAnswer;
        feedback = isCorrect
          ? 'Correct!'
          : `Incorrect. The correct answer is: ${correctAnswer ? 'True' : 'False'}`;
        break;

      case 'short_answer':
        // Simple string comparison (case-insensitive)
        isCorrect = answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
        feedback = isCorrect
          ? 'Correct!'
          : `Incorrect. The correct answer is: ${correctAnswer}`;
        break;

      case 'fill_blank':
        // Compare arrays
        isCorrect = Array.isArray(answer) && Array.isArray(correctAnswer)
          ? answer.length === correctAnswer.length && answer.every((a, i) => a === correctAnswer[i])
          : false;
        feedback = isCorrect
          ? 'Correct!'
          : 'Incorrect. Please try again.';
        break;

      default:
        feedback = 'Response recorded.';
    }

    return {
      isCorrect,
      feedback,
      correctAnswer,
    };
  }

  /**
   * Process drag-and-drop
   * @param {Object} exercise - Exercise data
   * @param {Object} placement - Student placement
   * @returns {Promise<Object>} Result
   */
  async processDragAndDrop(exercise, placement) {
    const {
      correctPlacements = {},
    } = exercise;

    let correctCount = 0;
    let totalItems = 0;
    const results = {};

    for (const [itemId, correctTarget] of Object.entries(correctPlacements)) {
      totalItems++;
      const studentTarget = placement[itemId];
      const isCorrect = studentTarget === correctTarget;

      if (isCorrect) {
        correctCount++;
      }

      results[itemId] = {
        isCorrect,
        correctTarget,
        studentTarget,
      };
    }

    const score = totalItems > 0 ? correctCount / totalItems : 0;
    const passed = score >= 0.7;

    return {
      score,
      passed,
      correctCount,
      totalItems,
      results,
    };
  }

  /**
   * Process matching exercise
   * @param {Object} exercise - Exercise data
   * @param {Object} matches - Student matches
   * @returns {Promise<Object>} Result
   */
  async processMatching(exercise, matches) {
    const {
      correctMatches = {},
    } = exercise;

    let correctCount = 0;
    let totalPairs = 0;
    const results = {};

    for (const [left, correctRight] of Object.entries(correctMatches)) {
      totalPairs++;
      const studentRight = matches[left];
      const isCorrect = studentRight === correctRight;

      if (isCorrect) {
        correctCount++;
      }

      results[left] = {
        isCorrect,
        correctRight,
        studentRight,
      };
    }

    const score = totalPairs > 0 ? correctCount / totalPairs : 0;
    const passed = score >= 0.7;

    return {
      score,
      passed,
      correctCount,
      totalPairs,
      results,
    };
  }

  /**
   * Process interactive video
   * @param {string} videoId - Video ID
   * @param {Object} interactions - Video interactions
   * @returns {Promise<Object>} Result
   */
  async processVideoInteractions(videoId, interactions) {
    // Track video interactions (pauses, questions answered, etc.)
    const interactionData = {
      videoId,
      interactions: interactions.map(i => ({
        ...i,
        timestamp: i.timestamp || new Date().toISOString(),
      })),
      totalInteractions: interactions.length,
      processedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: interactionData,
    };
  }
}

export const interactiveElementsService = new InteractiveElementsService();
export default interactiveElementsService;

