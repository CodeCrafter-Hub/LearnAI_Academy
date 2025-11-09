/**
 * Collaborative Learning and Peer Interaction System
 * Enables students to learn together, compete healthily, and support each other
 */

/**
 * Study Group Manager
 * Creates and manages virtual study groups
 */
export class StudyGroupManager {
  constructor(storage = 'localStorage') {
    this.storage = storage;
    this.groups = new Map();
    this.loadData();
  }

  /**
   * Create a study group
   */
  createGroup(groupData) {
    const {
      name,
      subject,
      gradeLevel,
      maxMembers = 6,
      createdBy,
      isPrivate = false,
      description = '',
    } = groupData;

    const group = {
      id: this.generateGroupId(),
      name,
      subject,
      gradeLevel,
      maxMembers,
      createdBy,
      isPrivate,
      description,
      members: [createdBy],
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      sessions: [],
      challenges: [],
      discussions: [],
      sharedResources: [],
      achievements: [],
      stats: {
        totalSessions: 0,
        totalQuestions: 0,
        averageAccuracy: 0,
        topicsCovered: [],
      },
    };

    this.groups.set(group.id, group);
    this.saveData();

    return group;
  }

  /**
   * Join a study group
   */
  joinGroup(groupId, studentId) {
    const group = this.groups.get(groupId);

    if (!group) {
      throw new Error('Group not found');
    }

    if (group.members.length >= group.maxMembers) {
      throw new Error('Group is full');
    }

    if (group.members.includes(studentId)) {
      throw new Error('Already a member');
    }

    group.members.push(studentId);
    group.lastActivity = new Date().toISOString();

    this.saveData();

    return group;
  }

  /**
   * Leave a study group
   */
  leaveGroup(groupId, studentId) {
    const group = this.groups.get(groupId);

    if (!group) {
      throw new Error('Group not found');
    }

    group.members = group.members.filter((id) => id !== studentId);

    // Delete group if empty
    if (group.members.length === 0) {
      this.groups.delete(groupId);
    }

    this.saveData();

    return { success: true };
  }

  /**
   * Start group study session
   */
  startGroupSession(groupId, sessionData) {
    const group = this.groups.get(groupId);

    if (!group) {
      throw new Error('Group not found');
    }

    const session = {
      id: this.generateSessionId(),
      groupId,
      topic: sessionData.topic,
      startTime: new Date().toISOString(),
      endTime: null,
      participants: [sessionData.startedBy],
      activities: [],
      completed: false,
    };

    group.sessions.push(session);
    group.stats.totalSessions++;
    group.lastActivity = new Date().toISOString();

    this.saveData();

    return session;
  }

  /**
   * Post discussion message
   */
  postDiscussion(groupId, studentId, message) {
    const group = this.groups.get(groupId);

    if (!group) {
      throw new Error('Group not found');
    }

    const discussion = {
      id: this.generateDiscussionId(),
      studentId,
      message,
      timestamp: new Date().toISOString(),
      replies: [],
      reactions: [],
    };

    group.discussions.push(discussion);
    group.lastActivity = new Date().toISOString();

    // Keep only last 100 discussions
    if (group.discussions.length > 100) {
      group.discussions = group.discussions.slice(-100);
    }

    this.saveData();

    return discussion;
  }

  /**
   * Reply to discussion
   */
  replyToDiscussion(groupId, discussionId, studentId, reply) {
    const group = this.groups.get(groupId);

    if (!group) {
      throw new Error('Group not found');
    }

    const discussion = group.discussions.find((d) => d.id === discussionId);

    if (!discussion) {
      throw new Error('Discussion not found');
    }

    const replyObj = {
      id: this.generateDiscussionId(),
      studentId,
      message: reply,
      timestamp: new Date().toISOString(),
    };

    discussion.replies.push(replyObj);

    this.saveData();

    return replyObj;
  }

  /**
   * Share resource with group
   */
  shareResource(groupId, studentId, resource) {
    const group = this.groups.get(groupId);

    if (!group) {
      throw new Error('Group not found');
    }

    const sharedResource = {
      id: this.generateResourceId(),
      studentId,
      ...resource,
      sharedAt: new Date().toISOString(),
      views: 0,
      likes: 0,
    };

    group.sharedResources.push(sharedResource);
    group.lastActivity = new Date().toISOString();

    this.saveData();

    return sharedResource;
  }

  /**
   * Get groups for student
   */
  getStudentGroups(studentId) {
    return Array.from(this.groups.values()).filter((group) =>
      group.members.includes(studentId)
    );
  }

  /**
   * Find available groups
   */
  findGroups(filters = {}) {
    let groups = Array.from(this.groups.values()).filter((g) => !g.isPrivate);

    if (filters.subject) {
      groups = groups.filter((g) => g.subject === filters.subject);
    }

    if (filters.gradeLevel) {
      groups = groups.filter((g) => g.gradeLevel === filters.gradeLevel);
    }

    if (filters.notFull) {
      groups = groups.filter((g) => g.members.length < g.maxMembers);
    }

    return groups;
  }

  /**
   * Helper methods
   */
  generateGroupId() {
    return `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateDiscussionId() {
    return `disc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateResourceId() {
    return `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  loadData() {
    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const data = localStorage.getItem('learnai_study_groups');
        if (data) {
          const parsed = JSON.parse(data);
          this.groups = new Map(Object.entries(parsed.groups || {}));
        }
      }
    } catch (error) {
      console.error('Error loading study group data:', error);
    }
  }

  saveData() {
    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const data = {
          groups: Object.fromEntries(this.groups),
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem('learnai_study_groups', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error saving study group data:', error);
    }
  }

  clearData() {
    this.groups.clear();
    if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('learnai_study_groups');
    }
  }
}

/**
 * PeerChallengeSystem
 * Enables healthy competition and challenges between students
 */
export class PeerChallengeSystem {
  constructor(storage = 'localStorage') {
    this.storage = storage;
    this.challenges = new Map();
    this.leaderboards = new Map();
    this.loadData();
  }

  /**
   * Create a challenge
   */
  createChallenge(challengeData) {
    const {
      name,
      description,
      subject,
      topicId,
      createdBy,
      challengeType = 'quiz', // quiz, speed, accuracy, streak
      targetScore = 100,
      duration = 30, // minutes
      participants = [],
      isPublic = true,
      startDate = new Date().toISOString(),
      endDate = null,
    } = challengeData;

    const challenge = {
      id: this.generateChallengeId(),
      name,
      description,
      subject,
      topicId,
      createdBy,
      challengeType,
      targetScore,
      duration,
      participants: [createdBy, ...participants],
      isPublic,
      startDate,
      endDate,
      createdAt: new Date().toISOString(),
      status: 'active', // active, completed, expired
      results: [],
      leaderboard: [],
    };

    this.challenges.set(challenge.id, challenge);
    this.saveData();

    return challenge;
  }

  /**
   * Join a challenge
   */
  joinChallenge(challengeId, studentId) {
    const challenge = this.challenges.get(challengeId);

    if (!challenge) {
      throw new Error('Challenge not found');
    }

    if (challenge.status !== 'active') {
      throw new Error('Challenge is not active');
    }

    if (challenge.participants.includes(studentId)) {
      throw new Error('Already participating');
    }

    challenge.participants.push(studentId);
    this.saveData();

    return challenge;
  }

  /**
   * Submit challenge result
   */
  submitResult(challengeId, studentId, resultData) {
    const challenge = this.challenges.get(challengeId);

    if (!challenge) {
      throw new Error('Challenge not found');
    }

    if (!challenge.participants.includes(studentId)) {
      throw new Error('Not a participant');
    }

    const result = {
      studentId,
      score: resultData.score,
      accuracy: resultData.accuracy,
      timeSpent: resultData.timeSpent,
      questionsCompleted: resultData.questionsCompleted,
      submittedAt: new Date().toISOString(),
    };

    // Remove previous result if exists
    challenge.results = challenge.results.filter((r) => r.studentId !== studentId);
    challenge.results.push(result);

    // Update leaderboard
    this.updateLeaderboard(challenge);

    this.saveData();

    return {
      result,
      rank: this.getStudentRank(challenge, studentId),
      leaderboard: challenge.leaderboard,
    };
  }

  /**
   * Update leaderboard
   */
  updateLeaderboard(challenge) {
    const sorted = [...challenge.results].sort((a, b) => {
      // Primary: score
      if (b.score !== a.score) return b.score - a.score;

      // Secondary: accuracy
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;

      // Tertiary: time (faster is better)
      return a.timeSpent - b.timeSpent;
    });

    challenge.leaderboard = sorted.map((result, index) => ({
      rank: index + 1,
      studentId: result.studentId,
      score: result.score,
      accuracy: result.accuracy,
      timeSpent: result.timeSpent,
    }));
  }

  /**
   * Get student rank in challenge
   */
  getStudentRank(challenge, studentId) {
    const entry = challenge.leaderboard.find((e) => e.studentId === studentId);
    return entry ? entry.rank : null;
  }

  /**
   * Get active challenges for student
   */
  getActiveChallenges(studentId, subject = null) {
    let challenges = Array.from(this.challenges.values()).filter(
      (c) => c.status === 'active' && (c.isPublic || c.participants.includes(studentId))
    );

    if (subject) {
      challenges = challenges.filter((c) => c.subject === subject);
    }

    return challenges;
  }

  /**
   * Get challenge results
   */
  getChallengeResults(challengeId) {
    const challenge = this.challenges.get(challengeId);

    if (!challenge) {
      throw new Error('Challenge not found');
    }

    return {
      challenge,
      leaderboard: challenge.leaderboard,
      totalParticipants: challenge.participants.length,
      completed: challenge.results.length,
      averageScore:
        challenge.results.reduce((sum, r) => sum + r.score, 0) / challenge.results.length || 0,
    };
  }

  /**
   * Create global leaderboard
   */
  createGlobalLeaderboard(subject, timeRange = 'week') {
    const leaderboardId = `${subject}_${timeRange}`;

    const leaderboard = {
      id: leaderboardId,
      subject,
      timeRange,
      entries: [],
      lastUpdated: new Date().toISOString(),
    };

    this.leaderboards.set(leaderboardId, leaderboard);
    this.saveData();

    return leaderboard;
  }

  /**
   * Update global leaderboard entry
   */
  updateLeaderboardEntry(leaderboardId, studentId, stats) {
    const leaderboard = this.leaderboards.get(leaderboardId);

    if (!leaderboard) {
      throw new Error('Leaderboard not found');
    }

    // Remove existing entry
    leaderboard.entries = leaderboard.entries.filter((e) => e.studentId !== studentId);

    // Add new entry
    leaderboard.entries.push({
      studentId,
      ...stats,
      updatedAt: new Date().toISOString(),
    });

    // Sort by points
    leaderboard.entries.sort((a, b) => b.points - a.points);

    // Add ranks
    leaderboard.entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Keep top 100
    if (leaderboard.entries.length > 100) {
      leaderboard.entries = leaderboard.entries.slice(0, 100);
    }

    leaderboard.lastUpdated = new Date().toISOString();

    this.saveData();

    return leaderboard;
  }

  /**
   * Get global leaderboard
   */
  getGlobalLeaderboard(subject, timeRange = 'week') {
    const leaderboardId = `${subject}_${timeRange}`;
    return this.leaderboards.get(leaderboardId);
  }

  /**
   * Helper methods
   */
  generateChallengeId() {
    return `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  loadData() {
    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const data = localStorage.getItem('learnai_challenges');
        if (data) {
          const parsed = JSON.parse(data);
          this.challenges = new Map(Object.entries(parsed.challenges || {}));
          this.leaderboards = new Map(Object.entries(parsed.leaderboards || {}));
        }
      }
    } catch (error) {
      console.error('Error loading challenge data:', error);
    }
  }

  saveData() {
    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const data = {
          challenges: Object.fromEntries(this.challenges),
          leaderboards: Object.fromEntries(this.leaderboards),
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem('learnai_challenges', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error saving challenge data:', error);
    }
  }

  clearData() {
    this.challenges.clear();
    this.leaderboards.clear();
    if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('learnai_challenges');
    }
  }
}

/**
 * PeerTutoringSystem
 * Enables students to help each other
 */
export class PeerTutoringSystem {
  constructor(storage = 'localStorage') {
    this.storage = storage;
    this.tutorProfiles = new Map();
    this.helpRequests = new Map();
    this.sessions = new Map();
    this.loadData();
  }

  /**
   * Register as a peer tutor
   */
  registerTutor(studentId, tutorData) {
    const {
      subjects = [],
      topics = [],
      availability = [],
      bio = '',
      gradeLevel,
    } = tutorData;

    const profile = {
      studentId,
      subjects,
      topics,
      availability,
      bio,
      gradeLevel,
      registeredAt: new Date().toISOString(),
      stats: {
        totalSessions: 0,
        rating: 0,
        reviews: [],
        studentsHelped: 0,
      },
      isActive: true,
    };

    this.tutorProfiles.set(studentId, profile);
    this.saveData();

    return profile;
  }

  /**
   * Request help
   */
  requestHelp(studentId, requestData) {
    const {
      subject,
      topic,
      question,
      urgency = 'normal', // low, normal, high
    } = requestData;

    const request = {
      id: this.generateRequestId(),
      studentId,
      subject,
      topic,
      question,
      urgency,
      createdAt: new Date().toISOString(),
      status: 'pending', // pending, accepted, completed, cancelled
      assignedTutor: null,
      responses: [],
    };

    this.helpRequests.set(request.id, request);
    this.saveData();

    // Match with tutors
    const matchedTutors = this.findMatchingTutors(subject, topic);

    return {
      request,
      matchedTutors,
    };
  }

  /**
   * Accept help request
   */
  acceptHelpRequest(requestId, tutorId) {
    const request = this.helpRequests.get(requestId);

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Request is not available');
    }

    request.status = 'accepted';
    request.assignedTutor = tutorId;
    request.acceptedAt = new Date().toISOString();

    this.saveData();

    return request;
  }

  /**
   * Provide help response
   */
  provideHelp(requestId, tutorId, response) {
    const request = this.helpRequests.get(requestId);

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.assignedTutor !== tutorId) {
      throw new Error('Not assigned to this request');
    }

    request.responses.push({
      tutorId,
      message: response,
      timestamp: new Date().toISOString(),
    });

    this.saveData();

    return request;
  }

  /**
   * Complete help session
   */
  completeSession(requestId, rating, feedback) {
    const request = this.helpRequests.get(requestId);

    if (!request) {
      throw new Error('Request not found');
    }

    request.status = 'completed';
    request.completedAt = new Date().toISOString();
    request.rating = rating;
    request.feedback = feedback;

    // Update tutor stats
    if (request.assignedTutor) {
      const tutor = this.tutorProfiles.get(request.assignedTutor);
      if (tutor) {
        tutor.stats.totalSessions++;
        tutor.stats.reviews.push({ rating, feedback, date: new Date().toISOString() });

        // Recalculate rating
        const totalRating = tutor.stats.reviews.reduce((sum, r) => sum + r.rating, 0);
        tutor.stats.rating = totalRating / tutor.stats.reviews.length;

        tutor.stats.studentsHelped++;
      }
    }

    this.saveData();

    return request;
  }

  /**
   * Find matching tutors
   */
  findMatchingTutors(subject, topic) {
    return Array.from(this.tutorProfiles.values()).filter(
      (tutor) =>
        tutor.isActive &&
        tutor.subjects.includes(subject) &&
        (tutor.topics.length === 0 || tutor.topics.includes(topic))
    );
  }

  /**
   * Get tutor profile
   */
  getTutorProfile(studentId) {
    return this.tutorProfiles.get(studentId);
  }

  /**
   * Get help requests for student
   */
  getStudentRequests(studentId) {
    return Array.from(this.helpRequests.values()).filter(
      (req) => req.studentId === studentId
    );
  }

  /**
   * Get available requests for tutor
   */
  getAvailableRequests(tutorId) {
    const tutor = this.tutorProfiles.get(tutorId);

    if (!tutor) {
      return [];
    }

    return Array.from(this.helpRequests.values()).filter(
      (req) =>
        req.status === 'pending' &&
        tutor.subjects.includes(req.subject) &&
        (tutor.topics.length === 0 || tutor.topics.includes(req.topic))
    );
  }

  /**
   * Helper methods
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  loadData() {
    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const data = localStorage.getItem('learnai_peer_tutoring');
        if (data) {
          const parsed = JSON.parse(data);
          this.tutorProfiles = new Map(Object.entries(parsed.tutorProfiles || {}));
          this.helpRequests = new Map(Object.entries(parsed.helpRequests || {}));
        }
      }
    } catch (error) {
      console.error('Error loading peer tutoring data:', error);
    }
  }

  saveData() {
    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const data = {
          tutorProfiles: Object.fromEntries(this.tutorProfiles),
          helpRequests: Object.fromEntries(this.helpRequests),
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem('learnai_peer_tutoring', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error saving peer tutoring data:', error);
    }
  }

  clearData() {
    this.tutorProfiles.clear();
    this.helpRequests.clear();
    if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('learnai_peer_tutoring');
    }
  }
}

/**
 * Example Usage
 */

/*
// Initialize systems
const studyGroups = new StudyGroupManager();
const challenges = new PeerChallengeSystem();
const peerTutoring = new PeerTutoringSystem();

// Create a study group
const group = studyGroups.createGroup({
  name: 'Math Masters',
  subject: 'math',
  gradeLevel: 5,
  createdBy: 'student123',
  description: 'Let\'s master multiplication together!',
});

console.log('Group created:', group.id);

// Join group
studyGroups.joinGroup(group.id, 'student456');

// Post discussion
studyGroups.postDiscussion(group.id, 'student123', 'Anyone want to practice fractions?');

// Create a challenge
const challenge = challenges.createChallenge({
  name: 'Multiplication Speed Challenge',
  subject: 'math',
  topicId: 'multiplication',
  createdBy: 'student123',
  challengeType: 'speed',
  targetScore: 100,
  duration: 10,
});

console.log('Challenge created:', challenge.id);

// Join challenge
challenges.joinChallenge(challenge.id, 'student456');

// Submit result
challenges.submitResult(challenge.id, 'student123', {
  score: 95,
  accuracy: 95,
  timeSpent: 8,
  questionsCompleted: 20,
});

// Register as peer tutor
peerTutoring.registerTutor('student789', {
  subjects: ['math', 'reading'],
  topics: ['fractions', 'multiplication'],
  gradeLevel: 6,
  bio: 'I love helping others with math!',
});

// Request help
const helpRequest = peerTutoring.requestHelp('student123', {
  subject: 'math',
  topic: 'fractions',
  question: 'How do I add fractions with different denominators?',
  urgency: 'normal',
});

console.log('Help requested:', helpRequest.request.id);
console.log('Matched tutors:', helpRequest.matchedTutors.length);
*/

export { StudyGroupManager, PeerChallengeSystem, PeerTutoringSystem };
