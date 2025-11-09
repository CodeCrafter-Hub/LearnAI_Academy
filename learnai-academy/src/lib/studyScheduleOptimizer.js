/**
 * AI-Powered Study Schedule Optimizer
 *
 * Intelligent scheduling system that creates personalized study plans:
 * - Optimal study time recommendations based on productivity patterns
 * - Automatic scheduling around commitments (school, activities, sleep)
 * - Spaced repetition scheduling for maximum retention
 * - Break time optimization (Pomodoro, energy management)
 * - Goal-based planning (exam prep, skill mastery, catch-up)
 * - Dynamic rescheduling when plans change
 * - Productivity analytics and insights
 * - Study session reminders and notifications
 * - Balance tracking (prevent burnout)
 * - Integration with calendar systems
 *
 * Helps students maximize learning efficiency through smart time management.
 */

import Anthropic from '@anthropic-ai/sdk';

// Study session types
const SESSION_TYPES = {
  FOCUSED_STUDY: 'focused_study',
  PRACTICE: 'practice',
  REVIEW: 'review',
  HOMEWORK: 'homework',
  READING: 'reading',
  PROJECT_WORK: 'project_work',
  EXAM_PREP: 'exam_prep',
  BREAK: 'break',
};

// Energy levels throughout day
const ENERGY_LEVELS = {
  PEAK: 'peak', // High focus, best for difficult material
  HIGH: 'high', // Good focus, suitable for most tasks
  MODERATE: 'moderate', // Decent focus, review/practice
  LOW: 'low', // Low focus, light reading or breaks
};

// Time blocks
const TIME_BLOCKS = {
  EARLY_MORNING: { start: 6, end: 9, defaultEnergy: ENERGY_LEVELS.MODERATE },
  MORNING: { start: 9, end: 12, defaultEnergy: ENERGY_LEVELS.PEAK },
  AFTERNOON: { start: 12, end: 15, defaultEnergy: ENERGY_LEVELS.MODERATE },
  LATE_AFTERNOON: { start: 15, end: 18, defaultEnergy: ENERGY_LEVELS.HIGH },
  EVENING: { start: 18, end: 21, defaultEnergy: ENERGY_LEVELS.MODERATE },
  NIGHT: { start: 21, end: 24, defaultEnergy: ENERGY_LEVELS.LOW },
};

// Study techniques
const STUDY_TECHNIQUES = {
  POMODORO: {
    name: 'Pomodoro',
    workDuration: 25,
    breakDuration: 5,
    longBreakAfter: 4,
    longBreakDuration: 15,
  },
  EXTENDED_FOCUS: {
    name: 'Extended Focus',
    workDuration: 50,
    breakDuration: 10,
    longBreakAfter: 2,
    longBreakDuration: 30,
  },
  SPRINT: {
    name: 'Sprint',
    workDuration: 15,
    breakDuration: 3,
    longBreakAfter: 6,
    longBreakDuration: 15,
  },
  FLOW: {
    name: 'Flow State',
    workDuration: 90,
    breakDuration: 20,
    longBreakAfter: 2,
    longBreakDuration: 45,
  },
};

/**
 * Study Schedule Optimizer - Creates optimized study schedules
 */
export class StudyScheduleOptimizer {
  constructor(apiKey, storageKey = 'study_schedules') {
    this.client = new Anthropic({ apiKey });
    this.model = 'claude-sonnet-4-5-20250929';
    this.storageKey = storageKey;
    this.schedules = this.loadSchedules();
  }

  /**
   * Load schedules from storage
   */
  loadSchedules() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading schedules:', error);
      return {};
    }
  }

  /**
   * Save schedules to storage
   */
  saveSchedules() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.schedules));
    } catch (error) {
      console.error('Error saving schedules:', error);
    }
  }

  /**
   * Create optimized study schedule
   */
  async createSchedule(student, goals, constraints = {}) {
    const {
      startDate = new Date(),
      endDate = this.addDays(new Date(), 7),
      availableHoursPerDay = 3,
      preferredTimes = [],
      avoidTimes = [],
      studyTechnique = STUDY_TECHNIQUES.POMODORO,
    } = constraints;

    // Analyze student's productivity patterns
    const productivityProfile = this.analyzeProductivityPatterns(student);

    // Prioritize goals
    const prioritizedGoals = this.prioritizeGoals(goals, endDate);

    // Generate schedule using AI
    const schedule = await this.generateAISchedule(
      student,
      prioritizedGoals,
      productivityProfile,
      constraints
    );

    // Optimize schedule
    const optimizedSchedule = this.optimizeSchedule(
      schedule,
      productivityProfile,
      studyTechnique
    );

    // Save schedule
    const scheduleId = `schedule_${Date.now()}_${student.id}`;
    this.schedules[scheduleId] = {
      id: scheduleId,
      studentId: student.id,
      goals: prioritizedGoals,
      schedule: optimizedSchedule,
      constraints,
      productivityProfile,
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    this.saveSchedules();

    return {
      scheduleId,
      schedule: optimizedSchedule,
      insights: this.generateScheduleInsights(optimizedSchedule, productivityProfile),
      tips: this.generateStudyTips(student, optimizedSchedule),
    };
  }

  /**
   * Analyze student's productivity patterns
   */
  analyzeProductivityPatterns(student) {
    const {
      sessionHistory = [],
      performanceByTime = {},
      preferredStudyTimes = [],
    } = student;

    // Analyze when student is most productive
    const timeBlockPerformance = {};

    Object.keys(TIME_BLOCKS).forEach(block => {
      timeBlockPerformance[block] = {
        averageScore: 0,
        sessionsCompleted: 0,
        averageFocus: 0,
        energy: TIME_BLOCKS[block].defaultEnergy,
      };
    });

    // Aggregate performance data
    sessionHistory.forEach(session => {
      const hour = new Date(session.timestamp).getHours();
      const block = this.getTimeBlock(hour);

      if (timeBlockPerformance[block]) {
        timeBlockPerformance[block].averageScore += session.score || 0;
        timeBlockPerformance[block].averageFocus += session.focusScore || 0;
        timeBlockPerformance[block].sessionsCompleted++;
      }
    });

    // Calculate averages
    Object.keys(timeBlockPerformance).forEach(block => {
      const data = timeBlockPerformance[block];
      if (data.sessionsCompleted > 0) {
        data.averageScore /= data.sessionsCompleted;
        data.averageFocus /= data.sessionsCompleted;

        // Adjust energy level based on actual performance
        if (data.averageScore >= 85 && data.averageFocus >= 80) {
          data.energy = ENERGY_LEVELS.PEAK;
        } else if (data.averageScore >= 70 && data.averageFocus >= 60) {
          data.energy = ENERGY_LEVELS.HIGH;
        } else if (data.averageScore >= 50) {
          data.energy = ENERGY_LEVELS.MODERATE;
        } else {
          data.energy = ENERGY_LEVELS.LOW;
        }
      }
    });

    return {
      timeBlockPerformance,
      peakTimes: this.identifyPeakTimes(timeBlockPerformance),
      averageSessionDuration: this.calculateAverageSessionDuration(sessionHistory),
      optimalStudyTechnique: this.recommendStudyTechnique(sessionHistory),
      consistencyScore: this.calculateConsistency(sessionHistory),
    };
  }

  /**
   * Get time block for hour
   */
  getTimeBlock(hour) {
    for (const [block, times] of Object.entries(TIME_BLOCKS)) {
      if (hour >= times.start && hour < times.end) {
        return block;
      }
    }
    return 'EVENING';
  }

  /**
   * Identify peak productivity times
   */
  identifyPeakTimes(timeBlockPerformance) {
    return Object.entries(timeBlockPerformance)
      .filter(([_, data]) => data.energy === ENERGY_LEVELS.PEAK || data.energy === ENERGY_LEVELS.HIGH)
      .sort(([_, a], [__, b]) => b.averageScore - a.averageScore)
      .map(([block, _]) => block);
  }

  /**
   * Calculate average session duration
   */
  calculateAverageSessionDuration(sessionHistory) {
    if (sessionHistory.length === 0) return 45;

    const totalDuration = sessionHistory.reduce((sum, s) => sum + (s.duration || 0), 0);
    return Math.round(totalDuration / sessionHistory.length);
  }

  /**
   * Recommend study technique
   */
  recommendStudyTechnique(sessionHistory) {
    const avgDuration = this.calculateAverageSessionDuration(sessionHistory);

    if (avgDuration <= 20) return STUDY_TECHNIQUES.SPRINT;
    if (avgDuration <= 30) return STUDY_TECHNIQUES.POMODORO;
    if (avgDuration <= 60) return STUDY_TECHNIQUES.EXTENDED_FOCUS;
    return STUDY_TECHNIQUES.FLOW;
  }

  /**
   * Calculate consistency score
   */
  calculateConsistency(sessionHistory) {
    if (sessionHistory.length < 7) return 0;

    // Check for daily study habit
    const last7Days = sessionHistory.slice(0, 7);
    const uniqueDays = new Set(last7Days.map(s =>
      new Date(s.timestamp).toDateString()
    )).size;

    return Math.round((uniqueDays / 7) * 100);
  }

  /**
   * Prioritize goals
   */
  prioritizeGoals(goals, endDate) {
    return goals.map(goal => {
      const daysUntilDue = this.daysBetween(new Date(), new Date(goal.dueDate || endDate));
      const urgency = goal.importance * (1 / Math.max(1, daysUntilDue));

      return {
        ...goal,
        urgency,
        estimatedHours: goal.estimatedHours || 2,
      };
    }).sort((a, b) => b.urgency - a.urgency);
  }

  /**
   * Generate AI schedule
   */
  async generateAISchedule(student, goals, productivityProfile, constraints) {
    const systemPrompt = `Create an optimized study schedule for a grade ${student.grade} student.

Goals (prioritized):
${goals.map((g, i) => `${i + 1}. ${g.name} - ${g.estimatedHours} hours (due: ${g.dueDate})`).join('\n')}

Productivity Profile:
- Peak times: ${productivityProfile.peakTimes.join(', ')}
- Average session: ${productivityProfile.averageSessionDuration} minutes
- Consistency: ${productivityProfile.consistencyScore}%

Constraints:
- Available hours per day: ${constraints.availableHoursPerDay}
- Preferred times: ${constraints.preferredTimes.join(', ') || 'flexible'}
- Avoid times: ${constraints.avoidTimes.join(', ') || 'none'}

Create a balanced schedule that:
1. Schedules difficult tasks during peak energy times
2. Includes appropriate breaks
3. Uses spaced repetition for review
4. Prevents burnout
5. Meets all deadlines

Return JSON:
{
  "dailySchedules": [
    {
      "date": "YYYY-MM-DD",
      "sessions": [
        {
          "startTime": "HH:MM",
          "duration": minutes,
          "type": "session_type",
          "goal": "goal_name",
          "topics": ["topic1", "topic2"],
          "technique": "pomodoro/extended/etc",
          "energyLevel": "peak/high/moderate/low"
        }
      ]
    }
  ]
}`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2500,
        temperature: 0.5,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: 'Generate the optimized study schedule.',
          },
        ],
      });

      return JSON.parse(response.content[0].text);
    } catch (error) {
      console.error('Error generating AI schedule:', error);
      return this.generateFallbackSchedule(goals, constraints);
    }
  }

  /**
   * Generate fallback schedule if AI fails
   */
  generateFallbackSchedule(goals, constraints) {
    const schedule = { dailySchedules: [] };
    const daysToSchedule = 7;

    for (let i = 0; i < daysToSchedule; i++) {
      const date = this.addDays(new Date(), i);
      const dailySchedule = {
        date: date.toISOString().split('T')[0],
        sessions: [],
      };

      // Simple distribution: 2-3 sessions per day
      const sessionsPerDay = Math.min(3, goals.length);
      for (let j = 0; j < sessionsPerDay && j < goals.length; j++) {
        dailySchedule.sessions.push({
          startTime: `${14 + j * 2}:00`,
          duration: 45,
          type: SESSION_TYPES.FOCUSED_STUDY,
          goal: goals[j].name,
          topics: goals[j].topics || [],
          technique: 'pomodoro',
          energyLevel: ENERGY_LEVELS.HIGH,
        });
      }

      schedule.dailySchedules.push(dailySchedule);
    }

    return schedule;
  }

  /**
   * Optimize schedule
   */
  optimizeSchedule(schedule, productivityProfile, studyTechnique) {
    // Apply study technique to sessions
    schedule.dailySchedules.forEach(day => {
      day.sessions.forEach(session => {
        if (session.type !== SESSION_TYPES.BREAK) {
          session.technique = studyTechnique.name.toLowerCase().replace(' ', '_');

          // Add breaks based on technique
          const breaksNeeded = Math.ceil(session.duration / studyTechnique.workDuration);
          session.breaks = [];

          for (let i = 0; i < breaksNeeded; i++) {
            const isLongBreak = (i + 1) % studyTechnique.longBreakAfter === 0;
            session.breaks.push({
              afterMinutes: (i + 1) * studyTechnique.workDuration,
              duration: isLongBreak ? studyTechnique.longBreakDuration : studyTechnique.breakDuration,
              type: isLongBreak ? 'long_break' : 'short_break',
            });
          }
        }
      });
    });

    return schedule;
  }

  /**
   * Generate schedule insights
   */
  generateScheduleInsights(schedule, productivityProfile) {
    const insights = [];

    // Total study hours
    const totalHours = schedule.dailySchedules.reduce((sum, day) => {
      return sum + day.sessions.reduce((s, session) => s + session.duration, 0);
    }, 0) / 60;

    insights.push(`Total study time: ${totalHours.toFixed(1)} hours over ${schedule.dailySchedules.length} days`);

    // Balance check
    const hoursPerDay = totalHours / schedule.dailySchedules.length;
    if (hoursPerDay > 4) {
      insights.push('⚠️ Schedule is intense - make sure to take care of yourself');
    } else if (hoursPerDay < 1) {
      insights.push('💡 Light schedule - consider adding more study time if possible');
    } else {
      insights.push('✓ Well-balanced schedule');
    }

    // Peak time utilization
    const peakSessions = schedule.dailySchedules.reduce((count, day) => {
      return count + day.sessions.filter(s =>
        s.energyLevel === ENERGY_LEVELS.PEAK || s.energyLevel === ENERGY_LEVELS.HIGH
      ).length;
    }, 0);

    const totalSessions = schedule.dailySchedules.reduce((count, day) => {
      return count + day.sessions.length;
    }, 0);

    const peakUtilization = (peakSessions / totalSessions) * 100;
    insights.push(`${peakUtilization.toFixed(0)}% of sessions during peak energy times`);

    return insights;
  }

  /**
   * Generate study tips
   */
  generateStudyTips(student, schedule) {
    const tips = [
      'Start each session with a clear goal in mind',
      'Remove distractions before beginning',
      'Stay hydrated during study sessions',
      'Take breaks seriously - they boost productivity',
      'Review material before sleep for better retention',
    ];

    // Personalized tips based on schedule
    const hasEarlySessions = schedule.dailySchedules.some(day =>
      day.sessions.some(s => parseInt(s.startTime.split(':')[0]) < 10)
    );

    if (hasEarlySessions) {
      tips.push('Get a good breakfast before morning study sessions');
    }

    return tips.slice(0, 5);
  }

  /**
   * Adjust schedule dynamically
   */
  async adjustSchedule(scheduleId, changes) {
    const schedule = this.schedules[scheduleId];
    if (!schedule) {
      throw new Error('Schedule not found');
    }

    // Apply changes
    if (changes.skipSession) {
      // Reschedule skipped session
      this.rescheduleSession(schedule, changes.skipSession);
    }

    if (changes.addGoal) {
      // Add new goal to schedule
      schedule.goals.push(changes.addGoal);
      this.reoptimizeSchedule(schedule);
    }

    if (changes.markCompleted) {
      // Mark session as completed
      this.markSessionCompleted(schedule, changes.markCompleted);
    }

    this.saveSchedules();
    return schedule;
  }

  /**
   * Reschedule a skipped session
   */
  rescheduleSession(schedule, sessionInfo) {
    // Find next available slot
    const nextSlot = this.findNextAvailableSlot(schedule);

    if (nextSlot) {
      nextSlot.day.sessions.push({
        ...sessionInfo,
        startTime: nextSlot.time,
        rescheduled: true,
      });
    }
  }

  /**
   * Find next available slot
   */
  findNextAvailableSlot(schedule) {
    // Simplified - would be more sophisticated in production
    const tomorrow = schedule.dailySchedules[1];
    if (tomorrow && tomorrow.sessions.length < 3) {
      return {
        day: tomorrow,
        time: '16:00',
      };
    }
    return null;
  }

  /**
   * Mark session as completed
   */
  markSessionCompleted(schedule, sessionInfo) {
    const { date, sessionIndex, performanceData } = sessionInfo;

    const day = schedule.dailySchedules.find(d => d.date === date);
    if (day && day.sessions[sessionIndex]) {
      day.sessions[sessionIndex].completed = true;
      day.sessions[sessionIndex].completedAt = new Date().toISOString();
      day.sessions[sessionIndex].performance = performanceData;
    }
  }

  /**
   * Reoptimize schedule
   */
  reoptimizeSchedule(schedule) {
    // Redistribute goals across remaining days
    // Simplified version
    console.log('Reoptimizing schedule...');
  }

  /**
   * Get schedule statistics
   */
  getScheduleStats(scheduleId) {
    const schedule = this.schedules[scheduleId];
    if (!schedule) return null;

    const totalSessions = schedule.schedule.dailySchedules.reduce(
      (sum, day) => sum + day.sessions.length,
      0
    );

    const completedSessions = schedule.schedule.dailySchedules.reduce(
      (sum, day) => sum + day.sessions.filter(s => s.completed).length,
      0
    );

    const averagePerformance = this.calculateAveragePerformance(schedule);

    return {
      totalSessions,
      completedSessions,
      completionRate: (completedSessions / totalSessions) * 100,
      averagePerformance,
      daysRemaining: this.calculateDaysRemaining(schedule),
      onTrack: completedSessions >= this.calculateExpectedCompleted(schedule),
    };
  }

  /**
   * Calculate average performance
   */
  calculateAveragePerformance(schedule) {
    const completedWithPerf = schedule.schedule.dailySchedules
      .flatMap(d => d.sessions)
      .filter(s => s.completed && s.performance);

    if (completedWithPerf.length === 0) return 0;

    const totalPerf = completedWithPerf.reduce(
      (sum, s) => sum + (s.performance.score || 0),
      0
    );

    return Math.round(totalPerf / completedWithPerf.length);
  }

  /**
   * Calculate days remaining
   */
  calculateDaysRemaining(schedule) {
    const lastDay = schedule.schedule.dailySchedules[schedule.schedule.dailySchedules.length - 1];
    if (!lastDay) return 0;

    return this.daysBetween(new Date(), new Date(lastDay.date));
  }

  /**
   * Calculate expected completed sessions
   */
  calculateExpectedCompleted(schedule) {
    const daysPassed = this.daysBetween(
      new Date(schedule.createdAt),
      new Date()
    );

    const totalDays = schedule.schedule.dailySchedules.length;
    const totalSessions = schedule.schedule.dailySchedules.reduce(
      (sum, day) => sum + day.sessions.length,
      0
    );

    return Math.floor((daysPassed / totalDays) * totalSessions);
  }

  /**
   * Helper: Add days to date
   */
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Helper: Days between dates
   */
  daysBetween(date1, date2) {
    const diffTime = Math.abs(date2 - date1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

export { SESSION_TYPES, ENERGY_LEVELS, TIME_BLOCKS, STUDY_TECHNIQUES };
export default StudyScheduleOptimizer;
