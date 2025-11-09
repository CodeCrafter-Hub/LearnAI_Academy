import prisma from '../../lib/prisma.js';
import { logInfo, logError } from '../../lib/logger.js';

/**
 * FormativeAssessmentService - Real-time embedded questions
 * 
 * Features:
 * - Embedded questions in lessons
 * - Instant feedback
 * - Hints and scaffolding
 * - Multiple attempts
 * - Explanation after answers
 * - Concept reinforcement
 */
class FormativeAssessmentService {
  /**
   * Generate embedded question for lesson
   * @param {string} lessonId - Lesson ID
   * @param {string} concept - Concept being taught
   * @param {number} gradeLevel - Grade level
   * @param {Object} options - Question options
   * @returns {Promise<Object>} Generated question
   */
  async generateEmbeddedQuestion(lessonId, concept, gradeLevel, options = {}) {
    try {
      const {
        questionType = 'multiple-choice', // multiple-choice, short-answer, true-false, fill-blank
        difficulty = 'medium',
        includeHints = true,
        includeExplanation = true,
      } = options;

      // Get lesson context
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
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
      });

      if (!lesson) {
        throw new Error('Lesson not found');
      }

      // Generate question based on type
      const question = await this.generateQuestionByType(
        questionType,
        concept,
        gradeLevel,
        lesson.lessonPlan.unit.curriculum.subject.name,
        {
          difficulty,
          includeHints,
          includeExplanation,
        }
      );

      // Save question to database
      const savedQuestion = await prisma.formativeQuestion.create({
        data: {
          lessonId,
          questionType,
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          hints: question.hints,
          difficulty,
          concept,
          metadata: {
            gradeLevel,
            subject: lesson.lessonPlan.unit.curriculum.subject.name,
          },
        },
      });

      return {
        id: savedQuestion.id,
        ...question,
        questionType,
      };
    } catch (error) {
      logError('Error generating embedded question', error);
      throw error;
    }
  }

  /**
   * Generate question by type
   */
  async generateQuestionByType(type, concept, gradeLevel, subject, options) {
    // This would typically use AI to generate questions
    // For now, return template structure

    const templates = {
      'multiple-choice': {
        question: `What is the main concept of ${concept}?`,
        options: [
          'Option A (correct)',
          'Option B',
          'Option C',
          'Option D',
        ],
        correctAnswer: 0,
        explanation: `The correct answer is Option A because...`,
        hints: options.includeHints ? [
          'Think about what you just learned',
          'Consider the key characteristics',
          'Remember the definition',
        ] : [],
      },
      'short-answer': {
        question: `Explain ${concept} in your own words.`,
        options: null,
        correctAnswer: null, // Will be evaluated by AI or keyword matching
        explanation: `A good answer should include...`,
        hints: options.includeHints ? [
          'Think about the main points',
          'Use examples if helpful',
        ] : [],
      },
      'true-false': {
        question: `${concept} is always true.`,
        options: ['True', 'False'],
        correctAnswer: 1,
        explanation: `This statement is false because...`,
        hints: options.includeHints ? [
          'Think carefully about exceptions',
        ] : [],
      },
      'fill-blank': {
        question: `The main idea of ${concept} is _____.`,
        options: null,
        correctAnswer: 'expected answer',
        explanation: `The blank should be filled with...`,
        hints: options.includeHints ? [
          'Think about the key term',
        ] : [],
      },
    };

    return templates[type] || templates['multiple-choice'];
  }

  /**
   * Submit answer and get feedback
   * @param {string} questionId - Question ID
   * @param {string} studentId - Student ID
   * @param {any} answer - Student's answer
   * @returns {Promise<Object>} Feedback and result
   */
  async submitAnswer(questionId, studentId, answer) {
    try {
      const question = await prisma.formativeQuestion.findUnique({
        where: { id: questionId },
      });

      if (!question) {
        throw new Error('Question not found');
      }

      // Check answer
      const isCorrect = this.checkAnswer(question, answer);
      const attempt = await this.recordAttempt(questionId, studentId, answer, isCorrect);

      // Generate feedback
      const feedback = this.generateFeedback(question, answer, isCorrect, attempt.attemptNumber);

      // Check if mastery achieved
      const attempts = await prisma.formativeAttempt.findMany({
        where: {
          questionId,
          studentId,
        },
      });

      const correctAttempts = attempts.filter(a => a.isCorrect).length;
      const masteryAchieved = correctAttempts >= 2; // 2 correct answers = mastery

      return {
        isCorrect,
        feedback,
        explanation: question.explanation,
        masteryAchieved,
        attemptsRemaining: Math.max(0, 3 - attempts.length),
        nextHint: attempt.attemptNumber < 3 && !isCorrect ? question.hints[attempt.attemptNumber - 1] : null,
      };
    } catch (error) {
      logError('Error submitting answer', error);
      throw error;
    }
  }

  /**
   * Check answer
   */
  checkAnswer(question, answer) {
    if (question.questionType === 'multiple-choice' || question.questionType === 'true-false') {
      return answer === question.correctAnswer;
    } else if (question.questionType === 'short-answer' || question.questionType === 'fill-blank') {
      // For text answers, use fuzzy matching or AI evaluation
      const correctAnswer = question.correctAnswer?.toLowerCase() || '';
      const studentAnswer = String(answer).toLowerCase();
      
      // Simple keyword matching (in production, use AI)
      const keywords = correctAnswer.split(' ').filter(w => w.length > 3);
      const matches = keywords.filter(keyword => studentAnswer.includes(keyword));
      
      return matches.length >= keywords.length * 0.7; // 70% keyword match
    }
    
    return false;
  }

  /**
   * Generate feedback
   */
  generateFeedback(question, answer, isCorrect, attemptNumber) {
    if (isCorrect) {
      return {
        type: 'correct',
        message: attemptNumber === 1 
          ? 'Excellent! You got it right on the first try! 🎉'
          : 'Great job! You figured it out! 👍',
        tone: 'encouraging',
      };
    } else {
      const messages = [
        'Not quite right. Try again! 💪',
        'Close! Think about it one more time. 🤔',
        'Let me give you a hint...',
      ];

      return {
        type: 'incorrect',
        message: messages[Math.min(attemptNumber - 1, messages.length - 1)],
        tone: 'supportive',
        showHint: attemptNumber >= 2,
      };
    }
  }

  /**
   * Record attempt
   */
  async recordAttempt(questionId, studentId, answer, isCorrect) {
    const attempts = await prisma.formativeAttempt.findMany({
      where: { questionId, studentId },
    });

    const attempt = await prisma.formativeAttempt.create({
      data: {
        questionId,
        studentId,
        answer: JSON.stringify(answer),
        isCorrect,
        attemptNumber: attempts.length + 1,
      },
    });

    return attempt;
  }

  /**
   * Get questions for lesson
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Array>} Questions
   */
  async getLessonQuestions(lessonId) {
    try {
      const questions = await prisma.formativeQuestion.findMany({
        where: {
          lessonId,
          isActive: true,
        },
        orderBy: { orderIndex: 'asc' },
      });

      return questions;
    } catch (error) {
      logError('Error getting lesson questions', error);
      throw error;
    }
  }

  /**
   * Get student progress on questions
   * @param {string} studentId - Student ID
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object>} Progress summary
   */
  async getQuestionProgress(studentId, lessonId) {
    try {
      const questions = await this.getLessonQuestions(lessonId);
      const attempts = await prisma.formativeAttempt.findMany({
        where: {
          studentId,
          questionId: {
            in: questions.map(q => q.id),
          },
        },
      });

      const progress = questions.map(question => {
        const questionAttempts = attempts.filter(a => a.questionId === question.id);
        const correctAttempts = questionAttempts.filter(a => a.isCorrect);
        const isMastered = correctAttempts.length >= 2;

        return {
          questionId: question.id,
          concept: question.concept,
          attempts: questionAttempts.length,
          correctAttempts: correctAttempts.length,
          isMastered,
          lastAttempt: questionAttempts[questionAttempts.length - 1],
        };
      });

      const totalQuestions = questions.length;
      const masteredQuestions = progress.filter(p => p.isMastered).length;
      const masteryRate = totalQuestions > 0 ? masteredQuestions / totalQuestions : 0;

      return {
        totalQuestions,
        masteredQuestions,
        masteryRate,
        progress,
      };
    } catch (error) {
      logError('Error getting question progress', error);
      throw error;
    }
  }
}

export const formativeAssessmentService = new FormativeAssessmentService();
export default formativeAssessmentService;

