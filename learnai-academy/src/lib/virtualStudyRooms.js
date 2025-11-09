/**
 * Virtual Study Rooms with AI Moderator
 *
 * Collaborative learning spaces powered by AI moderation:
 * - Real-time virtual study sessions with peers
 * - AI moderator to keep discussions productive
 * - Automatic topic guidance and focus maintenance
 * - Breakout rooms for group work
 * - Shared resources and note-taking
 * - Study buddy matching based on compatibility
 * - Session recording and summarization
 * - Productivity tracking for participants
 * - Gentle interventions when off-track
 * - Celebration of group achievements
 *
 * Creates safe, productive collaborative learning environments.
 */

import Anthropic from '@anthropic-ai/sdk';

// Room types
const ROOM_TYPES = {
  GENERAL_STUDY: 'general_study',
  HOMEWORK_HELP: 'homework_help',
  EXAM_PREP: 'exam_prep',
  PROJECT_COLLABORATION: 'project_collaboration',
  SUBJECT_SPECIFIC: 'subject_specific',
  QUIET_COWORKING: 'quiet_coworking',
  DISCUSSION: 'discussion',
};

// Room states
const ROOM_STATES = {
  ACTIVE: 'active',
  BREAK: 'break',
  WRAPPING_UP: 'wrapping_up',
  ENDED: 'ended',
};

// Participant roles
const PARTICIPANT_ROLES = {
  HOST: 'host',
  CO_HOST: 'co_host',
  PARTICIPANT: 'participant',
  OBSERVER: 'observer',
};

// AI Moderator intervention types
const INTERVENTION_TYPES = {
  OFF_TOPIC: 'off_topic',
  UNPRODUCTIVE: 'unproductive',
  NEED_BREAK: 'need_break',
  CELEBRATION: 'celebration',
  ENCOURAGEMENT: 'encouragement',
  CONFLICT: 'conflict',
  TECHNICAL_HELP: 'technical_help',
};

/**
 * Virtual Study Room - Represents a study session
 */
export class VirtualStudyRoom {
  constructor(roomData) {
    this.id = roomData.id || `room_${Date.now()}`;
    this.name = roomData.name;
    this.type = roomData.type || ROOM_TYPES.GENERAL_STUDY;
    this.subject = roomData.subject;
    this.topic = roomData.topic;
    this.maxParticipants = roomData.maxParticipants || 6;
    this.state = ROOM_STATES.ACTIVE;

    this.participants = new Map();
    this.messages = [];
    this.sharedResources = [];
    this.sessionNotes = '';

    this.createdAt = new Date().toISOString();
    this.startedAt = null;
    this.endedAt = null;

    this.settings = {
      allowChat: roomData.allowChat ?? true,
      allowVoice: roomData.allowVoice ?? true,
      allowVideo: roomData.allowVideo ?? false,
      allowScreenShare: roomData.allowScreenShare ?? true,
      aiModeration: roomData.aiModeration ?? true,
      requireApproval: roomData.requireApproval ?? false,
    };

    this.moderatorActivity = [];
    this.productivity = {
      focusScore: 100,
      offTopicCount: 0,
      questionsAsked: 0,
      questionsAnswered: 0,
      resourcesShared: 0,
    };
  }

  /**
   * Add participant to room
   */
  addParticipant(userId, userData) {
    if (this.participants.size >= this.maxParticipants) {
      throw new Error('Room is full');
    }

    const participant = {
      userId,
      name: userData.name,
      avatar: userData.avatar,
      role: this.participants.size === 0 ? PARTICIPANT_ROLES.HOST : PARTICIPANT_ROLES.PARTICIPANT,
      joinedAt: new Date().toISOString(),
      isActive: true,
      focusScore: 100,
      contributions: 0,
    };

    this.participants.set(userId, participant);

    if (!this.startedAt) {
      this.startedAt = new Date().toISOString();
    }

    return participant;
  }

  /**
   * Remove participant from room
   */
  removeParticipant(userId) {
    const participant = this.participants.get(userId);
    if (participant) {
      participant.isActive = false;
      participant.leftAt = new Date().toISOString();

      // If host leaves, promote someone else
      if (participant.role === PARTICIPANT_ROLES.HOST) {
        this.promoteNewHost();
      }
    }

    // End room if no active participants
    const activeCount = Array.from(this.participants.values()).filter(
      p => p.isActive
    ).length;

    if (activeCount === 0) {
      this.endSession();
    }
  }

  /**
   * Promote new host
   */
  promoteNewHost() {
    const activeParticipants = Array.from(this.participants.values()).filter(
      p => p.isActive
    );

    if (activeParticipants.length > 0) {
      activeParticipants[0].role = PARTICIPANT_ROLES.HOST;
    }
  }

  /**
   * Post message
   */
  postMessage(userId, message) {
    const participant = this.participants.get(userId);
    if (!participant || !participant.isActive) {
      throw new Error('Participant not found or inactive');
    }

    const messageData = {
      id: `msg_${Date.now()}`,
      userId,
      userName: participant.name,
      content: message.content,
      type: message.type || 'text',
      timestamp: new Date().toISOString(),
      reactions: [],
    };

    this.messages.push(messageData);

    // Update participant contributions
    participant.contributions++;

    // Track productivity metrics
    if (message.type === 'question') {
      this.productivity.questionsAsked++;
    }

    return messageData;
  }

  /**
   * Share resource
   */
  shareResource(userId, resource) {
    const participant = this.participants.get(userId);
    if (!participant || !participant.isActive) {
      throw new Error('Participant not found or inactive');
    }

    const resourceData = {
      id: `res_${Date.now()}`,
      sharedBy: userId,
      sharedByName: participant.name,
      type: resource.type, // 'link', 'file', 'note', 'image'
      title: resource.title,
      content: resource.content,
      url: resource.url,
      timestamp: new Date().toISOString(),
    };

    this.sharedResources.push(resourceData);
    this.productivity.resourcesShared++;

    return resourceData;
  }

  /**
   * Update session notes
   */
  updateNotes(userId, notes) {
    const participant = this.participants.get(userId);
    if (!participant) {
      throw new Error('Participant not found');
    }

    this.sessionNotes = notes;
    this.notesLastUpdatedBy = userId;
    this.notesLastUpdatedAt = new Date().toISOString();
  }

  /**
   * Set room state
   */
  setState(newState) {
    this.state = newState;

    if (newState === ROOM_STATES.ENDED) {
      this.endSession();
    }
  }

  /**
   * End session
   */
  endSession() {
    this.state = ROOM_STATES.ENDED;
    this.endedAt = new Date().toISOString();

    // Calculate session duration
    const duration = (new Date(this.endedAt) - new Date(this.startedAt)) / (1000 * 60);
    this.sessionDuration = Math.round(duration);

    // Calculate final productivity
    this.calculateFinalProductivity();
  }

  /**
   * Calculate final productivity metrics
   */
  calculateFinalProductivity() {
    const participants = Array.from(this.participants.values());
    const activeTime = this.sessionDuration;

    // Average focus score
    const avgFocus = participants.reduce((sum, p) => sum + p.focusScore, 0) / participants.length;

    // Engagement rate
    const engagementRate = (this.messages.length / activeTime) * 10; // Messages per 10 minutes

    this.productivity.finalScore = Math.round(
      avgFocus * 0.5 + Math.min(100, engagementRate * 10) * 0.5
    );
  }

  /**
   * Get room summary
   */
  getSummary() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      subject: this.subject,
      topic: this.topic,
      state: this.state,
      participants: Array.from(this.participants.values()),
      activeParticipants: Array.from(this.participants.values()).filter(p => p.isActive).length,
      messageCount: this.messages.length,
      resourceCount: this.sharedResources.length,
      productivity: this.productivity,
      duration: this.sessionDuration,
      createdAt: this.createdAt,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
    };
  }
}

/**
 * AI Moderator - Intelligent session moderation
 */
export class AIModerator {
  constructor(apiKey) {
    this.client = new Anthropic({ apiKey });
    this.model = 'claude-sonnet-4-5-20250929';
    this.interventionCooldown = 5 * 60 * 1000; // 5 minutes
    this.lastIntervention = {};
  }

  /**
   * Monitor conversation and intervene if needed
   */
  async monitorConversation(room, recentMessages) {
    const roomId = room.id;

    // Check if we're in cooldown
    if (this.isInCooldown(roomId)) {
      return null;
    }

    // Analyze conversation
    const analysis = await this.analyzeConversation(room, recentMessages);

    // Determine if intervention is needed
    if (analysis.needsIntervention) {
      const intervention = await this.generateIntervention(room, analysis);
      this.recordIntervention(roomId, intervention);

      // Update room productivity
      this.updateProductivity(room, analysis);

      return intervention;
    }

    return null;
  }

  /**
   * Check if in cooldown period
   */
  isInCooldown(roomId) {
    const lastTime = this.lastIntervention[roomId];
    if (!lastTime) return false;

    return Date.now() - lastTime < this.interventionCooldown;
  }

  /**
   * Analyze conversation
   */
  async analyzeConversation(room, recentMessages) {
    const conversationText = recentMessages
      .map(m => `${m.userName}: ${m.content}`)
      .join('\n');

    const systemPrompt = `You are an AI moderator for a virtual study room focused on: ${room.subject} - ${room.topic}

Analyze this recent conversation and determine:
1. Is the conversation on-topic?
2. Is the conversation productive?
3. Are participants helping each other?
4. Is there any conflict or negativity?
5. Should we celebrate any achievements?
6. Do participants need encouragement?
7. Should we suggest a break?

Return JSON:
{
  "onTopic": true/false,
  "productive": true/false,
  "collaborative": true/false,
  "hasConflict": true/false,
  "achievements": ["achievement1", ...],
  "needsIntervention": true/false,
  "interventionType": "off_topic" | "encouragement" | "celebration" | etc,
  "reason": "explanation"
}`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 500,
        temperature: 0.3,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Recent conversation:\n\n${conversationText}`,
          },
        ],
      });

      return JSON.parse(response.content[0].text);
    } catch (error) {
      console.error('Error analyzing conversation:', error);
      return {
        needsIntervention: false,
        productive: true,
        onTopic: true,
      };
    }
  }

  /**
   * Generate intervention message
   */
  async generateIntervention(room, analysis) {
    const systemPrompt = `You are a friendly AI study moderator. The group is studying ${room.subject} - ${room.topic}.

Situation: ${analysis.reason}
Intervention needed: ${analysis.interventionType}

Generate a brief, friendly message to help the group. Be:
- Encouraging and positive
- Specific to their situation
- Helpful without being pushy
- Brief (2-3 sentences)

Return just the message text.`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 200,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: 'Generate the intervention message.',
          },
        ],
      });

      return {
        type: analysis.interventionType,
        message: response.content[0].text,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating intervention:', error);
      return this.getFallbackIntervention(analysis.interventionType);
    }
  }

  /**
   * Get fallback intervention
   */
  getFallbackIntervention(type) {
    const fallbacks = {
      [INTERVENTION_TYPES.OFF_TOPIC]: {
        type,
        message: "Great conversation! Let's make sure we're still on track with our study goals.",
        timestamp: new Date().toISOString(),
      },
      [INTERVENTION_TYPES.ENCOURAGEMENT]: {
        type,
        message: "You're all doing great! Keep up the focused work!",
        timestamp: new Date().toISOString(),
      },
      [INTERVENTION_TYPES.CELEBRATION]: {
        type,
        message: "Awesome! Great progress on understanding this concept!",
        timestamp: new Date().toISOString(),
      },
      [INTERVENTION_TYPES.NEED_BREAK]: {
        type,
        message: "You've been working hard for a while! Consider taking a 5-minute break.",
        timestamp: new Date().toISOString(),
      },
    };

    return fallbacks[type] || fallbacks[INTERVENTION_TYPES.ENCOURAGEMENT];
  }

  /**
   * Record intervention
   */
  recordIntervention(roomId, intervention) {
    this.lastIntervention[roomId] = Date.now();
  }

  /**
   * Update productivity metrics
   */
  updateProductivity(room, analysis) {
    if (!analysis.onTopic) {
      room.productivity.offTopicCount++;
      room.productivity.focusScore = Math.max(0, room.productivity.focusScore - 10);
    } else if (analysis.productive) {
      room.productivity.focusScore = Math.min(100, room.productivity.focusScore + 5);
    }
  }

  /**
   * Generate session summary
   */
  async generateSessionSummary(room) {
    const participants = Array.from(room.participants.values());
    const duration = room.sessionDuration;

    const systemPrompt = `Generate a summary of this study session:

Subject: ${room.subject} - ${room.topic}
Duration: ${duration} minutes
Participants: ${participants.map(p => p.name).join(', ')}
Messages exchanged: ${room.messages.length}
Resources shared: ${room.sharedResources.length}
Focus score: ${room.productivity.focusScore}/100

Create a brief, positive summary highlighting:
- What was accomplished
- Key discussions or breakthroughs
- Collaborative moments
- Suggestions for next session

Keep it encouraging and specific.`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 400,
        temperature: 0.6,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: 'Generate the session summary.',
          },
        ],
      });

      return {
        summary: response.content[0].text,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating summary:', error);
      return {
        summary: `Great study session! The group worked on ${room.topic} for ${duration} minutes with ${participants.length} participants. Keep up the great work!`,
        generatedAt: new Date().toISOString(),
      };
    }
  }
}

/**
 * Study Room Manager - Manages all study rooms
 */
export class StudyRoomManager {
  constructor(apiKey, storageKey = 'study_rooms') {
    this.storageKey = storageKey;
    this.rooms = new Map();
    this.moderator = new AIModerator(apiKey);
    this.loadRooms();
  }

  /**
   * Load rooms from storage
   */
  loadRooms() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        Object.values(data).forEach(roomData => {
          const room = new VirtualStudyRoom(roomData);
          // Restore room state
          Object.assign(room, roomData);
          this.rooms.set(room.id, room);
        });
      }
    } catch (error) {
      console.error('Error loading study rooms:', error);
    }
  }

  /**
   * Save rooms to storage
   */
  saveRooms() {
    try {
      const data = {};
      this.rooms.forEach((room, id) => {
        data[id] = room;
      });
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving study rooms:', error);
    }
  }

  /**
   * Create new study room
   */
  createRoom(roomData) {
    const room = new VirtualStudyRoom(roomData);
    this.rooms.set(room.id, room);
    this.saveRooms();

    return room;
  }

  /**
   * Find matching study buddy
   */
  findStudyBuddy(student, preferences = {}) {
    // Match based on:
    // - Subject/topic interest
    // - Grade level
    // - Learning style compatibility
    // - Schedule compatibility

    const compatibilityScores = [];

    // In production, would query active users
    // For now, return compatibility criteria

    return {
      matchCriteria: {
        subject: preferences.subject,
        gradeLevel: student.grade,
        learningStyle: student.learningStyle,
        availableTimes: preferences.availableTimes,
      },
      recommendedActions: [
        'Post in study group finder',
        'Join existing study sessions',
        'Invite classmates',
      ],
    };
  }

  /**
   * Get active rooms
   */
  getActiveRooms(filters = {}) {
    let rooms = Array.from(this.rooms.values()).filter(
      r => r.state === ROOM_STATES.ACTIVE
    );

    if (filters.subject) {
      rooms = rooms.filter(r => r.subject === filters.subject);
    }

    if (filters.type) {
      rooms = rooms.filter(r => r.type === filters.type);
    }

    return rooms.map(r => r.getSummary());
  }

  /**
   * Join room
   */
  joinRoom(roomId, userId, userData) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const participant = room.addParticipant(userId, userData);
    this.saveRooms();

    return {
      room: room.getSummary(),
      participant,
    };
  }

  /**
   * Leave room
   */
  leaveRoom(roomId, userId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    room.removeParticipant(userId);
    this.saveRooms();
  }

  /**
   * Get room
   */
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }
}

export {
  ROOM_TYPES,
  ROOM_STATES,
  PARTICIPANT_ROLES,
  INTERVENTION_TYPES,
  VirtualStudyRoom,
  AIModerator,
};

export default StudyRoomManager;
