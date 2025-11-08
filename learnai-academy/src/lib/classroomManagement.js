/**
 * Classroom Management System
 *
 * Complete live classroom tools for synchronous learning:
 * - Live class session management
 * - Attendance tracking (automated and manual)
 * - Hand-raising and participation queue
 * - Breakout rooms with automatic grouping
 * - Screen sharing and presentation controls
 * - Live chat with moderation
 * - Real-time polling and quizzes
 * - Student engagement monitoring
 * - Recording management
 * - Whiteboard collaboration
 * - Behavior and participation tracking
 * - Virtual classroom settings
 *
 * Essential for live teaching and remote learning.
 */

import Anthropic from '@anthropic-ai/sdk';

// Session status
const SESSION_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  ENDED: 'ended',
  CANCELLED: 'cancelled',
};

// Participant roles
const PARTICIPANT_ROLES = {
  TEACHER: 'teacher',
  STUDENT: 'student',
  ASSISTANT: 'assistant',
  OBSERVER: 'observer',
};

// Participation actions
const PARTICIPATION_ACTIONS = {
  HAND_RAISED: 'hand_raised',
  ANSWERED: 'answered',
  ASKED_QUESTION: 'asked_question',
  SHARED_SCREEN: 'shared_screen',
  USED_CHAT: 'used_chat',
  POLL_RESPONSE: 'poll_response',
};

// Breakout room status
const BREAKOUT_STATUS = {
  FORMING: 'forming',
  ACTIVE: 'active',
  CLOSING: 'closing',
  CLOSED: 'closed',
};

/**
 * Live Classroom Manager
 */
export class LiveClassroomManager {
  constructor(storageKey = 'live_sessions') {
    this.storageKey = storageKey;
    this.sessions = this.loadSessions();
    this.activeSession = null;
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      dangerouslyAllowBrowser: true,
    });
    this.model = 'claude-sonnet-4-5-20250929';
  }

  /**
   * Load sessions
   */
  loadSessions() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading sessions:', error);
      return {};
    }
  }

  /**
   * Save sessions
   */
  saveSessions() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.sessions));
    } catch (error) {
      console.error('Error saving sessions:', error);
    }
  }

  /**
   * Schedule a live class
   */
  scheduleClass(classData) {
    const sessionId = `session_${Date.now()}`;

    const session = {
      id: sessionId,
      classId: classData.classId,
      title: classData.title,
      description: classData.description,
      teacherId: classData.teacherId,
      scheduledStart: classData.startTime,
      scheduledEnd: classData.endTime,
      status: SESSION_STATUS.SCHEDULED,
      settings: {
        allowChat: true,
        allowHandRaise: true,
        allowScreenShare: false, // Teacher only by default
        allowRecording: true,
        muteOnEntry: true,
        waitingRoom: false,
        breakoutRoomsEnabled: true,
        whiteboardEnabled: true,
        pollsEnabled: true,
      },
      participants: [],
      attendance: {},
      handRaises: [],
      chat: [],
      polls: [],
      breakoutRooms: [],
      recording: null,
      createdAt: new Date().toISOString(),
    };

    this.sessions[sessionId] = session;
    this.saveSessions();

    return session;
  }

  /**
   * Start a live class
   */
  async startClass(sessionId, teacherId) {
    const session = this.sessions[sessionId];
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.teacherId !== teacherId) {
      throw new Error('Unauthorized: Only the teacher can start the class');
    }

    session.status = SESSION_STATUS.LIVE;
    session.actualStart = new Date().toISOString();
    session.participants = [];
    session.engagement = {
      totalParticipations: 0,
      activeStudents: 0,
      averageEngagement: 0,
    };

    this.activeSession = sessionId;
    this.saveSessions();

    return session;
  }

  /**
   * Join a live class
   */
  joinClass(sessionId, userId, role = PARTICIPANT_ROLES.STUDENT) {
    const session = this.sessions[sessionId];
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status !== SESSION_STATUS.LIVE) {
      throw new Error('Session is not live');
    }

    const participant = {
      userId,
      role,
      joinedAt: new Date().toISOString(),
      leftAt: null,
      isMuted: session.settings.muteOnEntry,
      isVideoOn: false,
      isSharingScreen: false,
      participationCount: 0,
      handRaised: false,
    };

    session.participants.push(participant);

    // Mark attendance
    if (role === PARTICIPANT_ROLES.STUDENT) {
      session.attendance[userId] = {
        present: true,
        joinedAt: participant.joinedAt,
        duration: 0,
      };
    }

    this.saveSessions();

    return participant;
  }

  /**
   * Leave class
   */
  leaveClass(sessionId, userId) {
    const session = this.sessions[sessionId];
    if (!session) return;

    const participant = session.participants.find(p => p.userId === userId);
    if (participant) {
      participant.leftAt = new Date().toISOString();

      // Calculate duration
      const joinTime = new Date(participant.joinedAt);
      const leaveTime = new Date(participant.leftAt);
      const duration = Math.floor((leaveTime - joinTime) / 1000); // seconds

      if (session.attendance[userId]) {
        session.attendance[userId].duration = duration;
        session.attendance[userId].leftAt = participant.leftAt;
      }

      this.saveSessions();
    }
  }

  /**
   * End class
   */
  async endClass(sessionId, teacherId) {
    const session = this.sessions[sessionId];
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.teacherId !== teacherId) {
      throw new Error('Unauthorized');
    }

    session.status = SESSION_STATUS.ENDED;
    session.actualEnd = new Date().toISOString();

    // Mark all participants as left
    session.participants.forEach(p => {
      if (!p.leftAt) {
        this.leaveClass(sessionId, p.userId);
      }
    });

    // Generate session summary
    session.summary = await this.generateSessionSummary(session);

    if (this.activeSession === sessionId) {
      this.activeSession = null;
    }

    this.saveSessions();

    return session;
  }

  /**
   * Raise hand
   */
  raiseHand(sessionId, userId) {
    const session = this.sessions[sessionId];
    if (!session || session.status !== SESSION_STATUS.LIVE) {
      throw new Error('Cannot raise hand in this session');
    }

    const participant = session.participants.find(p => p.userId === userId);
    if (!participant) {
      throw new Error('Participant not found');
    }

    if (!participant.handRaised) {
      participant.handRaised = true;
      session.handRaises.push({
        userId,
        raisedAt: new Date().toISOString(),
        acknowledged: false,
      });

      this.recordParticipation(sessionId, userId, PARTICIPATION_ACTIONS.HAND_RAISED);
      this.saveSessions();
    }

    return session.handRaises;
  }

  /**
   * Lower hand
   */
  lowerHand(sessionId, userId) {
    const session = this.sessions[sessionId];
    if (!session) return;

    const participant = session.participants.find(p => p.userId === userId);
    if (participant) {
      participant.handRaised = false;
    }

    session.handRaises = session.handRaises.filter(h => h.userId !== userId);
    this.saveSessions();
  }

  /**
   * Acknowledge hand raise (teacher)
   */
  acknowledgeHandRaise(sessionId, teacherId, userId) {
    const session = this.sessions[sessionId];
    if (!session || session.teacherId !== teacherId) {
      throw new Error('Unauthorized');
    }

    const handRaise = session.handRaises.find(h => h.userId === userId);
    if (handRaise) {
      handRaise.acknowledged = true;
      handRaise.acknowledgedAt = new Date().toISOString();
      this.saveSessions();
    }
  }

  /**
   * Send chat message
   */
  sendChatMessage(sessionId, userId, message) {
    const session = this.sessions[sessionId];
    if (!session || !session.settings.allowChat) {
      throw new Error('Chat not available');
    }

    const chatMessage = {
      id: `msg_${Date.now()}`,
      userId,
      message,
      timestamp: new Date().toISOString(),
      deleted: false,
    };

    session.chat.push(chatMessage);
    this.recordParticipation(sessionId, userId, PARTICIPATION_ACTIONS.USED_CHAT);
    this.saveSessions();

    return chatMessage;
  }

  /**
   * Delete chat message (teacher only)
   */
  deleteChatMessage(sessionId, teacherId, messageId) {
    const session = this.sessions[sessionId];
    if (!session || session.teacherId !== teacherId) {
      throw new Error('Unauthorized');
    }

    const message = session.chat.find(m => m.id === messageId);
    if (message) {
      message.deleted = true;
      this.saveSessions();
    }
  }

  /**
   * Create poll
   */
  createPoll(sessionId, teacherId, pollData) {
    const session = this.sessions[sessionId];
    if (!session || session.teacherId !== teacherId) {
      throw new Error('Unauthorized');
    }

    const pollId = `poll_${Date.now()}`;

    const poll = {
      id: pollId,
      question: pollData.question,
      options: pollData.options.map((opt, idx) => ({
        id: idx,
        text: opt,
        votes: 0,
        voters: [],
      })),
      isOpen: true,
      createdAt: new Date().toISOString(),
      closedAt: null,
    };

    session.polls.push(poll);
    this.saveSessions();

    return poll;
  }

  /**
   * Vote in poll
   */
  votePoll(sessionId, userId, pollId, optionId) {
    const session = this.sessions[sessionId];
    if (!session) {
      throw new Error('Session not found');
    }

    const poll = session.polls.find(p => p.id === pollId);
    if (!poll || !poll.isOpen) {
      throw new Error('Poll not available');
    }

    // Check if already voted
    const alreadyVoted = poll.options.some(opt => opt.voters.includes(userId));
    if (alreadyVoted) {
      throw new Error('Already voted in this poll');
    }

    const option = poll.options.find(opt => opt.id === optionId);
    if (option) {
      option.votes++;
      option.voters.push(userId);
      this.recordParticipation(sessionId, userId, PARTICIPATION_ACTIONS.POLL_RESPONSE);
      this.saveSessions();
    }

    return poll;
  }

  /**
   * Close poll
   */
  closePoll(sessionId, teacherId, pollId) {
    const session = this.sessions[sessionId];
    if (!session || session.teacherId !== teacherId) {
      throw new Error('Unauthorized');
    }

    const poll = session.polls.find(p => p.id === pollId);
    if (poll) {
      poll.isOpen = false;
      poll.closedAt = new Date().toISOString();
      this.saveSessions();
    }

    return poll;
  }

  /**
   * Create breakout rooms
   */
  createBreakoutRooms(sessionId, teacherId, roomData) {
    const session = this.sessions[sessionId];
    if (!session || session.teacherId !== teacherId) {
      throw new Error('Unauthorized');
    }

    const { numberOfRooms, assignmentType, duration } = roomData;

    // Get students only
    const students = session.participants.filter(
      p => p.role === PARTICIPANT_ROLES.STUDENT && !p.leftAt
    );

    const rooms = [];

    if (assignmentType === 'automatic') {
      // Automatically assign students to rooms
      const studentsPerRoom = Math.ceil(students.length / numberOfRooms);

      for (let i = 0; i < numberOfRooms; i++) {
        const roomStudents = students.slice(
          i * studentsPerRoom,
          (i + 1) * studentsPerRoom
        );

        rooms.push({
          id: `room_${i + 1}`,
          name: `Room ${i + 1}`,
          participants: roomStudents.map(s => s.userId),
          status: BREAKOUT_STATUS.FORMING,
          createdAt: new Date().toISOString(),
          duration,
        });
      }
    } else if (assignmentType === 'manual') {
      // Teacher will manually assign
      for (let i = 0; i < numberOfRooms; i++) {
        rooms.push({
          id: `room_${i + 1}`,
          name: `Room ${i + 1}`,
          participants: [],
          status: BREAKOUT_STATUS.FORMING,
          createdAt: new Date().toISOString(),
          duration,
        });
      }
    }

    session.breakoutRooms = rooms;
    this.saveSessions();

    return rooms;
  }

  /**
   * Assign student to breakout room
   */
  assignToBreakoutRoom(sessionId, teacherId, userId, roomId) {
    const session = this.sessions[sessionId];
    if (!session || session.teacherId !== teacherId) {
      throw new Error('Unauthorized');
    }

    const room = session.breakoutRooms.find(r => r.id === roomId);
    if (room && !room.participants.includes(userId)) {
      room.participants.push(userId);
      this.saveSessions();
    }

    return room;
  }

  /**
   * Start breakout rooms
   */
  startBreakoutRooms(sessionId, teacherId) {
    const session = this.sessions[sessionId];
    if (!session || session.teacherId !== teacherId) {
      throw new Error('Unauthorized');
    }

    session.breakoutRooms.forEach(room => {
      room.status = BREAKOUT_STATUS.ACTIVE;
      room.startedAt = new Date().toISOString();
    });

    this.saveSessions();

    return session.breakoutRooms;
  }

  /**
   * Close breakout rooms
   */
  closeBreakoutRooms(sessionId, teacherId) {
    const session = this.sessions[sessionId];
    if (!session || session.teacherId !== teacherId) {
      throw new Error('Unauthorized');
    }

    session.breakoutRooms.forEach(room => {
      room.status = BREAKOUT_STATUS.CLOSED;
      room.closedAt = new Date().toISOString();
    });

    this.saveSessions();

    return session.breakoutRooms;
  }

  /**
   * Record participation
   */
  recordParticipation(sessionId, userId, action) {
    const session = this.sessions[sessionId];
    if (!session) return;

    const participant = session.participants.find(p => p.userId === userId);
    if (participant) {
      participant.participationCount++;

      if (!session.participationLog) {
        session.participationLog = [];
      }

      session.participationLog.push({
        userId,
        action,
        timestamp: new Date().toISOString(),
      });

      // Update engagement stats
      if (session.engagement) {
        session.engagement.totalParticipations++;
        const activeStudents = new Set(
          session.participationLog
            .filter(log => {
              const logTime = new Date(log.timestamp);
              const now = new Date();
              return now - logTime < 300000; // Active in last 5 minutes
            })
            .map(log => log.userId)
        );
        session.engagement.activeStudents = activeStudents.size;
      }

      this.saveSessions();
    }
  }

  /**
   * Get attendance report
   */
  getAttendanceReport(sessionId) {
    const session = this.sessions[sessionId];
    if (!session) {
      throw new Error('Session not found');
    }

    const report = {
      sessionId,
      title: session.title,
      scheduledStart: session.scheduledStart,
      actualStart: session.actualStart,
      totalStudents: Object.keys(session.attendance).length,
      present: 0,
      absent: 0,
      late: 0,
      students: [],
    };

    Object.entries(session.attendance).forEach(([userId, record]) => {
      if (record.present) {
        report.present++;

        const joinTime = new Date(record.joinedAt);
        const scheduledTime = new Date(session.scheduledStart);
        const isLate = joinTime - scheduledTime > 300000; // 5 minutes

        if (isLate) {
          report.late++;
        }

        report.students.push({
          userId,
          status: 'present',
          joinedAt: record.joinedAt,
          duration: record.duration,
          isLate,
        });
      } else {
        report.absent++;
        report.students.push({
          userId,
          status: 'absent',
        });
      }
    });

    return report;
  }

  /**
   * Get engagement metrics
   */
  getEngagementMetrics(sessionId) {
    const session = this.sessions[sessionId];
    if (!session) {
      throw new Error('Session not found');
    }

    const students = session.participants.filter(
      p => p.role === PARTICIPANT_ROLES.STUDENT
    );

    const metrics = {
      totalStudents: students.length,
      participationRate: 0,
      averageParticipations: 0,
      handRaises: session.handRaises?.length || 0,
      chatMessages: session.chat?.filter(m => !m.deleted).length || 0,
      pollResponses: 0,
      topParticipants: [],
      lowEngagement: [],
    };

    const participatingStudents = students.filter(s => s.participationCount > 0);
    metrics.participationRate = students.length > 0
      ? (participatingStudents.length / students.length) * 100
      : 0;

    const totalParticipations = students.reduce(
      (sum, s) => sum + s.participationCount,
      0
    );
    metrics.averageParticipations = students.length > 0
      ? totalParticipations / students.length
      : 0;

    // Count poll responses
    session.polls?.forEach(poll => {
      poll.options.forEach(opt => {
        metrics.pollResponses += opt.votes;
      });
    });

    // Top participants
    const sorted = [...students].sort(
      (a, b) => b.participationCount - a.participationCount
    );
    metrics.topParticipants = sorted.slice(0, 5).map(s => ({
      userId: s.userId,
      participations: s.participationCount,
    }));

    // Low engagement (no participation)
    metrics.lowEngagement = students
      .filter(s => s.participationCount === 0)
      .map(s => s.userId);

    return metrics;
  }

  /**
   * Generate session summary using AI
   */
  async generateSessionSummary(session) {
    try {
      const metrics = this.getEngagementMetrics(session.id);
      const attendance = this.getAttendanceReport(session.id);

      const systemPrompt = `You are an educational assistant analyzing a live class session. Provide a concise summary of the session including key highlights, engagement insights, and recommendations for the teacher.`;

      const userPrompt = `Analyze this class session and provide a summary:

Session: ${session.title}
Duration: ${session.actualStart} to ${session.actualEnd || 'ongoing'}
Attendance: ${attendance.present}/${attendance.totalStudents} students (${attendance.late} late)
Participation Rate: ${metrics.participationRate.toFixed(1)}%
Total Interactions: ${metrics.handRaises + metrics.chatMessages + metrics.pollResponses}
- Hand raises: ${metrics.handRaises}
- Chat messages: ${metrics.chatMessages}
- Poll responses: ${metrics.pollResponses}

Provide:
1. Brief summary
2. Engagement highlights
3. Areas for improvement
4. Recommendations for teacher`;

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      return {
        text: response.content[0].text,
        metrics,
        attendance,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating summary:', error);
      return {
        text: 'Summary generation failed',
        metrics: this.getEngagementMetrics(session.id),
        attendance: this.getAttendanceReport(session.id),
        error: error.message,
      };
    }
  }

  /**
   * Get session
   */
  getSession(sessionId) {
    return this.sessions[sessionId];
  }

  /**
   * Get all sessions for a class
   */
  getClassSessions(classId) {
    return Object.values(this.sessions).filter(s => s.classId === classId);
  }

  /**
   * Get active session
   */
  getActiveSession() {
    if (this.activeSession) {
      return this.sessions[this.activeSession];
    }
    return null;
  }
}

/**
 * Screen Sharing Manager
 */
export class ScreenSharingManager {
  constructor() {
    this.activeShares = {};
  }

  /**
   * Start screen share
   */
  async startScreenShare(sessionId, userId) {
    try {
      // In a real implementation, would use WebRTC
      const shareId = `share_${Date.now()}`;

      this.activeShares[shareId] = {
        id: shareId,
        sessionId,
        userId,
        startedAt: new Date().toISOString(),
        stoppedAt: null,
      };

      return this.activeShares[shareId];
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  }

  /**
   * Stop screen share
   */
  stopScreenShare(shareId) {
    const share = this.activeShares[shareId];
    if (share) {
      share.stoppedAt = new Date().toISOString();
    }
    return share;
  }

  /**
   * Get active shares for session
   */
  getActiveShares(sessionId) {
    return Object.values(this.activeShares).filter(
      s => s.sessionId === sessionId && !s.stoppedAt
    );
  }
}

/**
 * Recording Manager
 */
export class RecordingManager {
  constructor(storageKey = 'class_recordings') {
    this.storageKey = storageKey;
    this.recordings = this.loadRecordings();
  }

  loadRecordings() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading recordings:', error);
      return {};
    }
  }

  saveRecordings() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.recordings));
    } catch (error) {
      console.error('Error saving recordings:', error);
    }
  }

  /**
   * Start recording
   */
  startRecording(sessionId, teacherId) {
    const recordingId = `rec_${Date.now()}`;

    this.recordings[recordingId] = {
      id: recordingId,
      sessionId,
      startedBy: teacherId,
      startedAt: new Date().toISOString(),
      stoppedAt: null,
      duration: 0,
      fileUrl: null,
      status: 'recording',
    };

    this.saveRecordings();

    return this.recordings[recordingId];
  }

  /**
   * Stop recording
   */
  stopRecording(recordingId) {
    const recording = this.recordings[recordingId];
    if (recording) {
      recording.stoppedAt = new Date().toISOString();
      recording.status = 'processing';

      const start = new Date(recording.startedAt);
      const stop = new Date(recording.stoppedAt);
      recording.duration = Math.floor((stop - start) / 1000); // seconds

      this.saveRecordings();

      // In production, would process and upload video
      setTimeout(() => {
        recording.status = 'ready';
        recording.fileUrl = `/recordings/${recordingId}.mp4`;
        this.saveRecordings();
      }, 5000);
    }

    return recording;
  }

  /**
   * Get recording
   */
  getRecording(recordingId) {
    return this.recordings[recordingId];
  }

  /**
   * Get recordings for session
   */
  getSessionRecordings(sessionId) {
    return Object.values(this.recordings).filter(r => r.sessionId === sessionId);
  }
}

export {
  SESSION_STATUS,
  PARTICIPANT_ROLES,
  PARTICIPATION_ACTIONS,
  BREAKOUT_STATUS,
};

export default LiveClassroomManager;
