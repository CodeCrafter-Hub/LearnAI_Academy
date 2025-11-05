import { BaseAgent } from './BaseAgent.js';
import { groqClient } from '../groqClient.js';
import prisma from '../../../lib/prisma.js';

/**
 * AssessmentAgent - Evaluator Role
 * 
 * Purpose: Creates and evaluates assessments
 * Mode: Batch for creation, Real-time for evaluation
 * Output: Assessment questions, grading results, feedback
 * 
 * Used for:
 * - Generating diagnostic tests
 * - Creating quizzes
 * - Grading assessments
 * - Identifying learning gaps
 */
export class AssessmentAgent extends BaseAgent {
  constructor(name, subjectId) {
    super(name, subjectId);
    this.role = 'assessment';
  }

  /**
   * Generate a diagnostic assessment to identify learning gaps
   */
  async generateDiagnosticAssessment(topic, gradeLevel, options = {}) {
    const {
      questionCount = 15,
      includeMultipleChoice = true,
      includeShortAnswer = true,
      includeProblemSolving = true,
    } = options;

    const gradeBand = this.getGradeBand(gradeLevel);
    const standards = await this.getLearningStandards(topic, gradeLevel);

    const prompt = `You are an assessment specialist creating a diagnostic assessment for ${topic} at ${gradeLevel}th grade level (${gradeBand}).

DIAGNOSTIC ASSESSMENT PURPOSE:
- Identify what the student already knows
- Identify learning gaps
- Determine appropriate starting point
- Assess prerequisite knowledge

LEARNING STANDARDS:
${standards.map(s => `- ${s.description}`).join('\n')}

Create ${questionCount} diagnostic questions:
${includeMultipleChoice ? '- Multiple choice questions' : ''}
${includeShortAnswer ? '- Short answer questions' : ''}
${includeProblemSolving ? '- Problem-solving questions' : ''}

Questions should:
- Cover prerequisite concepts
- Assess current knowledge level
- Identify common misconceptions
- Range from basic to advanced
- Include answer key with explanations

For each question, provide:
1. Question text
2. Question type
3. Correct answer
4. Explanation
5. Prerequisite knowledge being assessed
6. Common misconceptions to watch for`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: `Generate the diagnostic assessment.` },
    ], {
      model: groqClient.models.smart,
      temperature: 0.3,
      maxTokens: 4000,
    });

    return this.parseAssessment(response.content);
  }

  /**
   * Grade a student's assessment submission
   */
  async gradeAssessment(assessmentId, studentAnswers, context) {
    try {
      // Get the assessment with questions
      const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
        include: {
          results: {
            where: { studentId: context.studentId },
          },
        },
      });

      if (!assessment) {
        throw new Error('Assessment not found');
      }

      const questions = assessment.metadata?.questions || [];
      const gradedResults = [];

      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const studentAnswer = studentAnswers[i]?.answer || '';
        const isCorrect = await this.checkAnswer(question, studentAnswer, context);

        gradedResults.push({
          questionId: question.id || i,
          question: question.text,
          studentAnswer,
          correctAnswer: question.answer,
          isCorrect,
          points: isCorrect ? question.points : 0,
          feedback: await this.generateFeedback(question, studentAnswer, isCorrect, context),
        });
      }

      // Calculate score
      const totalPoints = gradedResults.reduce((sum, r) => sum + r.points, 0);
      const maxPoints = questions.reduce((sum, q) => sum + (q.points || 10), 0);
      const score = (totalPoints / maxPoints) * 100;

      // Identify learning gaps
      const learningGaps = this.identifyLearningGaps(gradedResults, questions);

      // Generate recommendations
      const recommendations = await this.generateRecommendations(
        score,
        learningGaps,
        context
      );

      return {
        score,
        totalCorrect: gradedResults.filter(r => r.isCorrect).length,
        totalQuestions: questions.length,
        questionResults: gradedResults,
        learningGaps,
        recommendations,
      };
    } catch (error) {
      console.error('Error grading assessment:', error);
      throw error;
    }
  }

  /**
   * Check if a student's answer is correct
   */
  async checkAnswer(question, studentAnswer, context) {
    const correctAnswer = question.answer;

    // For multiple choice, exact match
    if (question.type === 'multiple_choice') {
      return studentAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    }

    // For short answer, use AI to check semantic similarity
    if (question.type === 'short_answer') {
      return await this.checkShortAnswer(correctAnswer, studentAnswer, context);
    }

    // For numeric, check if close enough
    if (question.type === 'numeric') {
      const studentNum = parseFloat(studentAnswer);
      const correctNum = parseFloat(correctAnswer);
      if (isNaN(studentNum) || isNaN(correctNum)) return false;
      
      // Allow 1% tolerance for rounding
      return Math.abs(studentNum - correctNum) / Math.abs(correctNum) < 0.01;
    }

    return false;
  }

  /**
   * Check short answer using AI for semantic similarity
   */
  async checkShortAnswer(correctAnswer, studentAnswer, context) {
    const prompt = `You are grading a ${context.gradeLevel}th grade ${context.subject} assessment.

CORRECT ANSWER: ${correctAnswer}
STUDENT ANSWER: ${studentAnswer}

Grade Level: ${context.gradeLevel} (${this.getGradeBand(context.gradeLevel)})

Determine if the student's answer is correct. Consider:
- Semantic similarity (same meaning, different wording is OK)
- Age-appropriate expectations
- Partial credit for partially correct answers
- Common spelling mistakes should not penalize

Respond with ONLY "CORRECT", "INCORRECT", or "PARTIAL" (if partially correct).`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: 'Is the student answer correct?' },
    ], {
      model: groqClient.models.smart,
      temperature: 0.1,
      maxTokens: 10,
    });

    const result = response.content.trim().toUpperCase();
    return result.includes('CORRECT') || result.includes('PARTIAL');
  }

  /**
   * Generate feedback for a question
   */
  async generateFeedback(question, studentAnswer, isCorrect, context) {
    if (isCorrect) {
      return `Great job! ${question.explanation || 'You got it right!'}`;
    }

    const prompt = `You are providing feedback to a ${context.gradeLevel}th grade student who answered incorrectly.

QUESTION: ${question.text}
STUDENT ANSWER: ${studentAnswer}
CORRECT ANSWER: ${question.answer}

Provide encouraging, constructive feedback that:
- Explains why the answer was incorrect
- Guides them toward the correct answer
- Uses age-appropriate language
- Is encouraging, not discouraging
- Helps them understand the concept

Keep feedback under 50 words.`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: 'Provide feedback.' },
    ], {
      model: groqClient.models.smart,
      temperature: 0.7,
      maxTokens: 100,
    });

    return response.content.trim();
  }

  /**
   * Identify learning gaps from assessment results
   */
  identifyLearningGaps(gradedResults, questions) {
    const gaps = [];

    for (let i = 0; i < gradedResults.length; i++) {
      const result = gradedResults[i];
      const question = questions[i];

      if (!result.isCorrect) {
        gaps.push({
          topic: question.topic || 'Unknown',
          concept: question.concept || question.text.substring(0, 50),
          questionIndex: i,
          standard: question.standard || null,
        });
      }
    }

    return gaps;
  }

  /**
   * Generate recommendations based on assessment results
   */
  async generateRecommendations(score, learningGaps, context) {
    const prompt = `You are an assessment specialist providing recommendations for a ${context.gradeLevel}th grade student.

ASSESSMENT SCORE: ${score.toFixed(1)}%
LEARNING GAPS IDENTIFIED: ${learningGaps.length}

${learningGaps.length > 0 ? `TOPICS TO REVIEW:\n${learningGaps.map((g, i) => `${i + 1}. ${g.concept}`).join('\n')}` : ''}

Provide specific, actionable recommendations:
1. What topics to review
2. What practice to do
3. What prerequisite knowledge to strengthen
4. Suggested next steps

Keep recommendations age-appropriate and encouraging.`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: 'Generate recommendations.' },
    ], {
      model: groqClient.models.smart,
      temperature: 0.5,
      maxTokens: 300,
    });

    return {
      text: response.content.trim(),
      learningGaps,
      score,
      nextSteps: this.parseRecommendations(response.content),
    };
  }

  /**
   * Parse recommendations into structured format
   */
  parseRecommendations(text) {
    const steps = [];
    const lines = text.split('\n');

    for (const line of lines) {
      const stepMatch = line.match(/^\d+\.\s*(.+)$/);
      if (stepMatch) {
        steps.push(stepMatch[1].trim());
      }
    }

    return steps;
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
   * Get learning standards (placeholder - should integrate with standards database)
   */
  async getLearningStandards(topic, gradeLevel) {
    return [
      {
        code: `${this.subjectId.toUpperCase()}.${gradeLevel}.1`,
        description: `Understand and apply ${topic} concepts appropriate for grade ${gradeLevel}`,
      },
    ];
  }
}

export default AssessmentAgent;

