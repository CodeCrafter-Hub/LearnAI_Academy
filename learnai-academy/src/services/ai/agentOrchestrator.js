import { MathAgent } from './agents/MathAgent.js';
import { EnglishAgent } from './agents/EnglishAgent.js';
import { ReadingAgent } from './agents/ReadingAgent.js';
import { ScienceAgent } from './agents/ScienceAgent.js';
import { WritingAgent } from './agents/WritingAgent.js';
import { CodingAgent } from './agents/CodingAgent.js';
import { redis } from '../../lib/redis.js';
import prisma from '../../lib/prisma.js';

class AgentOrchestrator {
  constructor() {
    this.agents = {
      math: new MathAgent(),
      english: new EnglishAgent(),
      reading: new ReadingAgent(),
      science: new ScienceAgent(),
      writing: new WritingAgent(),
      coding: new CodingAgent(),
    };
  }

  /**
   * Route incoming message to appropriate agent
   */
  async routeMessage(sessionId, message, metadata = {}) {
    try {
      // Get session context
      const context = await this.getSessionContext(sessionId);
      
      // Select appropriate agent
      const agent = this.selectAgent(context);
      
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
      });

      // Update session in cache and database
      await this.updateSessionContext(sessionId, context);
      await this.saveMessageToDb(sessionId, 'user', message);
      await this.saveMessageToDb(sessionId, 'assistant', response.content);
      
      // Log agent interaction for analytics
      await this.logAgentInteraction(sessionId, agent.name, response);
      
      return response;
    } catch (error) {
      console.error('Error in AgentOrchestrator:', error);
      throw error;
    }
  }

  /**
   * Select the most appropriate agent based on context
   */
  selectAgent(context) {
    const { subject } = context;
    
    const agentMap = {
      'math': this.agents.math,
      'english': this.agents.english,
      'reading': this.agents.reading,
      'science': this.agents.science,
      'writing': this.agents.writing,
      'coding': this.agents.coding,
    };
    
    return agentMap[subject] || this.agents.math;
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
  async logAgentInteraction(sessionId, agentName, response) {
    try {
      // Calculate cost (Groq is very cheap, but track anyway)
      const inputCost = (response.usage?.promptTokens || 0) / 1_000_000 * 0.05;
      const outputCost = (response.usage?.completionTokens || 0) / 1_000_000 * 0.10;
      const totalCost = inputCost + outputCost;

      await prisma.agentLog.create({
        data: {
          sessionId,
          agentType: agentName,
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
