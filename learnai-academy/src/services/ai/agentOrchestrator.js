import { MathAgent } from './agents/MathAgent.js';
import { EnglishAgent } from './agents/EnglishAgent.js';
import { ReadingAgent } from './agents/ReadingAgent.js';
import { ScienceAgent } from './agents/ScienceAgent.js';
import { WritingAgent } from './agents/WritingAgent.js';
import { CodingAgent } from './agents/CodingAgent.js';
import { MathCurriculumAgent } from './agents/MathCurriculumAgent.js';
import { EnglishCurriculumAgent } from './agents/EnglishCurriculumAgent.js';
import { ScienceCurriculumAgent } from './agents/ScienceCurriculumAgent.js';
import { AssessmentAgent } from './agents/AssessmentAgent.js';
import { groqClient } from './groqClient.js';
import { redis } from '../../lib/redis.js';
import prisma from '../../lib/prisma.js';

class AgentOrchestrator {
  constructor() {
    // Tutoring Agents (real-time interactive tutoring)
    this.tutoringAgents = {
      math: new MathAgent(),
      english: new EnglishAgent(),
      reading: new ReadingAgent(),
      science: new ScienceAgent(),
      writing: new WritingAgent(),
      coding: new CodingAgent(),
    };

    // Curriculum Agents (formal teacher role - content generation)
    this.curriculumAgents = {
      math: new MathCurriculumAgent(),
      english: new EnglishCurriculumAgent(),
      science: new ScienceCurriculumAgent(),
      // Reading and Writing can use English curriculum agent
      reading: new EnglishCurriculumAgent(),
      writing: new EnglishCurriculumAgent(),
    };

    // Assessment Agents (evaluator role)
    this.assessmentAgents = {
      math: new AssessmentAgent('Math Assessment Specialist', 'math'),
      english: new AssessmentAgent('English Assessment Specialist', 'english'),
      science: new AssessmentAgent('Science Assessment Specialist', 'science'),
      reading: new AssessmentAgent('Reading Assessment Specialist', 'reading'),
      writing: new AssessmentAgent('Writing Assessment Specialist', 'writing'),
      coding: new AssessmentAgent('Coding Assessment Specialist', 'coding'),
    };

    // Legacy: Keep agents map for backward compatibility
    this.agents = this.tutoringAgents;
  }

  /**
   * Select the most appropriate agent based on context and role
   * @param {Object} context - Session context
   * @param {String} role - Agent role: 'tutoring' (default), 'curriculum', 'assessment'
   */
  selectAgent(context, role = 'tutoring') {
    const { subject } = context;

    if (role === 'curriculum') {
      // Use curriculum agents for content generation
      // Reading and writing use English curriculum agent
      const curriculumSubject = (subject === 'reading' || subject === 'writing') ? 'english' : subject;
      return this.curriculumAgents[curriculumSubject] || this.curriculumAgents.math;
    }

    if (role === 'assessment') {
      // Use assessment agents for evaluation
      return this.assessmentAgents[subject] || this.assessmentAgents.math;
    }

    // Default: Use tutoring agents for interactive sessions
    const agentMap = {
      'math': this.tutoringAgents.math,
      'english': this.tutoringAgents.english,
      'reading': this.tutoringAgents.reading,
      'science': this.tutoringAgents.science,
      'writing': this.tutoringAgents.writing,
      'coding': this.tutoringAgents.coding,
    };

    return agentMap[subject] || this.tutoringAgents.math;
  }

  /**
   * Route message to appropriate agent (with role support)
   */
  async routeMessage(sessionId, message, metadata = {}) {
    try {
      // Get session context
      const context = await this.getSessionContext(sessionId);
      
      // Determine agent role from metadata or context
      const role = metadata.role || context.agentRole || 'tutoring';
      
      // Select appropriate agent
      const agent = this.selectAgent(context, role);
      
      // Add message to context
      context.messages.push({
        role: 'user',
        content: message,
        timestamp: Date.now(),
      });

      // Get agent response
      const response = await agent.process(context, message, metadata);
      
      // Add response to context
      context.messages.push({
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
        agentUsed: agent.name,
        agentRole: role,
      });

      // Update session in cache and database
      await this.updateSessionContext(sessionId, context);
      await this.saveMessageToDb(sessionId, 'user', message);
      await this.saveMessageToDb(sessionId, 'assistant', response.content);
      
      // Log agent interaction for analytics
      await this.logAgentInteraction(sessionId, agent.name, response, role);
      
      return response;
    } catch (error) {
      console.error('Error in AgentOrchestrator:', error);
      throw error;
    }
  }

  /**
   * Generate curriculum content (lesson plans, practice problems, etc.)
   */
  async generateCurriculum(task, subject, topic, gradeLevel, options = {}) {
    try {
      const curriculumAgent = this.curriculumAgents[subject] || this.curriculumAgents.math;

      switch (task) {
        case 'lessonPlan':
          return await curriculumAgent.generateLessonPlan(topic, gradeLevel, options);
        
        case 'practiceProblems':
          return await curriculumAgent.generatePracticeProblems(
            topic,
            gradeLevel,
            options.count || 10,
            options.difficulty || 'MEDIUM',
            options // Pass all options including topicId
          );
        
        case 'contentItems':
          return await curriculumAgent.generateContentItems(
            topic,
            gradeLevel,
            options.contentType || 'EXPLANATION',
            options.count || 5,
            options // Pass all options including topicId
          );
        
        default:
          throw new Error(`Unknown curriculum task: ${task}`);
      }
    } catch (error) {
      console.error('Error generating curriculum:', error);
      throw error;
    }
  }

  /**
   * Generate assessment
   */
  async generateAssessment(subject, topic, gradeLevel, options = {}) {
    try {
      const assessmentAgent = this.assessmentAgents[subject] || this.assessmentAgents.math;
      return await assessmentAgent.generateDiagnosticAssessment(topic, gradeLevel, options);
    } catch (error) {
      console.error('Error generating assessment:', error);
      throw error;
    }
  }

  /**
   * Grade assessment
   */
  async gradeAssessment(assessmentId, studentAnswers, context) {
    try {
      const { subject } = context;
      const assessmentAgent = this.assessmentAgents[subject] || this.assessmentAgents.math;
      return await assessmentAgent.gradeAssessment(assessmentId, studentAnswers, context);
    } catch (error) {
      console.error('Error grading assessment:', error);
      throw error;
    }
  }

  /**
   * Get or create session context
   */
  async getSessionContext(sessionId) {
    try {
      // Try cache first
      const cached = await redis.get(`session:${sessionId}`);
      if (cached) {
        return JSON.parse(cached);
      }
      
      // Load from database
      const session = await prisma.learningSession.findUnique({
        where: { id: sessionId },
        include: {
          student: true,
          subject: true,
          topic: true,
          messages: {
            orderBy: { sequenceNumber: 'asc' },
          },
        },
      });

      if (!session) {
        throw new Error('Session not found');
      }

      // Get student progress for this topic
      const progress = await prisma.studentProgress.findUnique({
        where: {
          studentId_topicId: {
            studentId: session.studentId,
            topicId: session.topicId,
          },
        },
      });

      const context = {
        sessionId: session.id,
        studentId: session.student.id,
        studentName: session.student.firstName,
        gradeLevel: session.student.gradeLevel,
        subject: session.subject.slug,
        subjectName: session.subject.name,
        topic: session.topic.name,
        topicId: session.topic.id,
        mode: session.sessionMode.toLowerCase(),
        difficulty: session.difficultyLevel.toLowerCase(),
        messages: session.messages.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.createdAt.getTime(),
        })),
        strengths: progress?.strengths || [],
        weaknesses: progress?.weaknesses || [],
        masteryLevel: progress?.masteryLevel || 0,
        startTime: session.startedAt.getTime(),
        isVoiceMode: session.sessionData?.isVoiceMode || false,
        agentRole: session.sessionData?.agentRole || 'tutoring',
      };
      
      // Cache for 1 hour
      await redis.setex(`session:${sessionId}`, 3600, JSON.stringify(context));
      
      return context;
    } catch (error) {
      console.error('Error getting session context:', error);
      throw error;
    }
  }

  /**
   * Update session context in cache
   */
  async updateSessionContext(sessionId, context) {
    try {
      await redis.setex(`session:${sessionId}`, 3600, JSON.stringify(context));
    } catch (error) {
      console.error('Error updating session context:', error);
    }
  }

  /**
   * Save message to database
   */
  async saveMessageToDb(sessionId, role, content) {
    try {
      const messageCount = await prisma.sessionMessage.count({
        where: { sessionId },
      });

      await prisma.sessionMessage.create({
        data: {
          sessionId,
          role,
          content,
          sequenceNumber: messageCount + 1,
        },
      });

      // Update session message count
      await prisma.learningSession.update({
        where: { id: sessionId },
        data: {
          messagesCount: { increment: 1 },
        },
      });
    } catch (error) {
      console.error('Error saving message to database:', error);
    }
  }

  /**
   * Log agent interaction for analytics and cost tracking
   */
  async logAgentInteraction(sessionId, agentName, response, role = 'tutoring') {
    try {
      // Calculate cost (Groq is very cheap, but track anyway)
      const inputCost = (response.usage?.promptTokens || 0) / 1_000_000 * 0.05;
      const outputCost = (response.usage?.completionTokens || 0) / 1_000_000 * 0.10;
      const totalCost = inputCost + outputCost;

      await prisma.agentLog.create({
        data: {
          sessionId,
          agentType: `${role}:${agentName}`,
          promptTokens: response.usage?.promptTokens || 0,
          completionTokens: response.usage?.completionTokens || 0,
          totalCost,
          responseTimeMs: response.responseTime || 0,
          modelUsed: response.model || 'unknown',
          errorMessage: response.error || null,
        },
      });
    } catch (error) {
      console.error('Error logging agent interaction:', error);
    }
  }

  /**
   * Clear session cache
   */
  async clearSessionCache(sessionId) {
    try {
      await redis.del(`session:${sessionId}`);
    } catch (error) {
      console.error('Error clearing session cache:', error);
    }
  }
}

export const agentOrchestrator = new AgentOrchestrator();
export default agentOrchestrator;
