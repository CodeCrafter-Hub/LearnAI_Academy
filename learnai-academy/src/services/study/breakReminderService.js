import { logInfo, logError } from '../../lib/logger.js';

/**
 * BreakReminderService - Timer-based study breaks
 * 
 * Based on Pomodoro Technique and attention span research:
 * - Preschool: 5 min sessions, 2 min breaks
 * - Pre-K: 7 min sessions, 3 min breaks
 * - K-2: 10-12 min sessions, 5 min breaks
 * - 3-5: 15-20 min sessions, 5 min breaks
 * - 6-8: 25-35 min sessions, 10 min breaks
 * - 9-12: 40-55 min sessions, 10-15 min breaks
 */
class BreakReminderService {
  /**
   * Get recommended session and break durations for grade level
   * @param {number} gradeLevel - Grade level (-1 to 12)
   * @returns {Object} Session and break durations in minutes
   */
  getBreakSchedule(gradeLevel) {
    const gradeBand = this.getGradeBand(gradeLevel);
    
    const schedules = {
      'Preschool': {
        sessionDuration: 5, // minutes
        breakDuration: 2,
        longBreakDuration: 5, // after 3 sessions
        sessionsBeforeLongBreak: 3,
      },
      'Pre-K': {
        sessionDuration: 7,
        breakDuration: 3,
        longBreakDuration: 5,
        sessionsBeforeLongBreak: 3,
      },
      'K-2': {
        sessionDuration: 12,
        breakDuration: 5,
        longBreakDuration: 10,
        sessionsBeforeLongBreak: 4,
      },
      '3-5': {
        sessionDuration: 20,
        breakDuration: 5,
        longBreakDuration: 10,
        sessionsBeforeLongBreak: 4,
      },
      '6-8': {
        sessionDuration: 30,
        breakDuration: 10,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4,
      },
      '9-12': {
        sessionDuration: 45,
        breakDuration: 10,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4,
      },
    };

    return schedules[gradeBand] || schedules['3-5'];
  }

  /**
   * Calculate break time based on session duration
   * @param {number} sessionDurationMinutes - Duration of study session
   * @param {number} gradeLevel - Grade level
   * @returns {Object} Break recommendation
   */
  calculateBreakTime(sessionDurationMinutes, gradeLevel) {
    const schedule = this.getBreakSchedule(gradeLevel);
    const sessionCount = Math.floor(sessionDurationMinutes / schedule.sessionDuration);
    
    return {
      shouldTakeBreak: sessionDurationMinutes >= schedule.sessionDuration,
      breakDuration: sessionCount >= schedule.sessionsBeforeLongBreak 
        ? schedule.longBreakDuration 
        : schedule.breakDuration,
      breakType: sessionCount >= schedule.sessionsBeforeLongBreak ? 'long' : 'short',
      nextBreakIn: schedule.sessionDuration - (sessionDurationMinutes % schedule.sessionDuration),
      message: this.getBreakMessage(sessionCount, schedule),
    };
  }

  /**
   * Get break message
   */
  getBreakMessage(sessionCount, schedule) {
    if (sessionCount === 0) {
      return `Great start! Take a ${schedule.breakDuration}-minute break after ${schedule.sessionDuration} minutes.`;
    } else if (sessionCount < schedule.sessionsBeforeLongBreak) {
      return `You've been studying for ${sessionCount * schedule.sessionDuration} minutes! Time for a ${schedule.breakDuration}-minute break.`;
    } else {
      return `Excellent work! You've completed ${sessionCount} sessions. Take a longer ${schedule.longBreakDuration}-minute break to recharge!`;
    }
  }

  /**
   * Get break activity suggestions
   * @param {number} gradeLevel - Grade level
   * @param {string} breakType - 'short' or 'long'
   * @returns {Array} Break activity suggestions
   */
  getBreakActivities(gradeLevel, breakType = 'short') {
    const gradeBand = this.getGradeBand(gradeLevel);
    
    const activities = {
      'Preschool': {
        short: [
          'Do 5 jumping jacks',
          'Stretch your arms up high',
          'Take 3 deep breaths',
          'Look out the window',
          'Dance to a fun song',
        ],
        long: [
          'Play with toys for 5 minutes',
          'Have a healthy snack',
          'Go outside and play',
          'Read a favorite book',
          'Do a simple craft',
        ],
      },
      'Pre-K': {
        short: [
          'Do 5 jumping jacks',
          'Stretch like a cat',
          'Take deep breaths',
          'Look around the room',
          'Sing a song',
        ],
        long: [
          'Play for 5 minutes',
          'Have a snack',
          'Go outside',
          'Read a book',
          'Draw a picture',
        ],
      },
      'K-2': {
        short: [
          'Do 10 jumping jacks',
          'Stretch your whole body',
          'Take 5 deep breaths',
          'Walk around the room',
          'Do some simple exercises',
        ],
        long: [
          'Play outside for 10 minutes',
          'Have a healthy snack',
          'Read a book',
          'Do a craft or drawing',
          'Play a quick game',
        ],
      },
      '3-5': {
        short: [
          'Stand up and stretch',
          'Take a short walk',
          'Do some jumping jacks',
          'Look away from the screen',
          'Drink some water',
        ],
        long: [
          'Take a 10-minute walk',
          'Have a healthy snack',
          'Read a book',
          'Do a quick activity',
          'Play outside',
        ],
      },
      '6-8': {
        short: [
          'Stand and stretch',
          'Walk around',
          'Get some fresh air',
          'Drink water',
          'Look away from screen',
        ],
        long: [
          'Take a 15-minute walk',
          'Have a healthy snack',
          'Read or listen to music',
          'Do a physical activity',
          'Relax and recharge',
        ],
      },
      '9-12': {
        short: [
          'Stand and stretch',
          'Take a short walk',
          'Get fresh air',
          'Hydrate',
          'Rest your eyes',
        ],
        long: [
          'Take a 15-minute break',
          'Have a healthy snack',
          'Exercise or walk',
          'Read or listen to music',
          'Relax and recharge',
        ],
      },
    };

    return activities[gradeBand]?.[breakType] || activities['3-5'][breakType];
  }

  /**
   * Get grade band
   */
  getGradeBand(grade) {
    if (grade <= -1) return 'Preschool';
    if (grade === 0) return 'Pre-K';
    if (grade <= 2) return 'K-2';
    if (grade <= 5) return '3-5';
    if (grade <= 8) return '6-8';
    return '9-12';
  }
}

export const breakReminderService = new BreakReminderService();
export default breakReminderService;

