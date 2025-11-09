import { groqClient } from '../ai/groqClient.js';

/**
 * EngagementService - Generates engaging lesson hooks and activities
 * 
 * Features:
 * - Engaging lesson hooks (stories, questions, visuals)
 * - Activity variety management
 * - Movement break suggestions
 * - Real-world connections
 */
class EngagementService {
  /**
   * Generate engaging lesson hook
   * @param {Object} lessonPlan - Lesson plan
   * @param {string} subjectSlug - Subject slug
   * @param {number} gradeLevel - Grade level
   * @returns {Promise<Object>} Hook data
   */
  async generateHook(lessonPlan, subjectSlug, gradeLevel) {
    const gradeBand = this.getGradeBand(gradeLevel);
    const objectives = lessonPlan.learningObjectives || [];

    const prompt = `Create an engaging lesson hook for a ${gradeLevel}th grade (${gradeBand}) ${subjectSlug} lesson.

LESSON: ${lessonPlan.name}
OBJECTIVES: ${JSON.stringify(objectives)}

A hook should:
1. Capture attention in the first 30 seconds
2. Connect to student interests or experiences
3. Create curiosity or wonder
4. Be age-appropriate

Generate ONE of the following hook types:
- STORY: A short, relatable story (2-3 sentences)
- QUESTION: A thought-provoking question
- VISUAL: A description of an engaging image or visual
- PROBLEM: A real-world problem to solve
- SURPRISE: An unexpected fact or statistic

Return JSON with:
{
  "type": "STORY|QUESTION|VISUAL|PROBLEM|SURPRISE",
  "content": "The hook content",
  "visualDescription": "If visual type, describe the visual",
  "followUp": "How to transition to the lesson"
}`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: 'Generate the lesson hook as JSON.' },
    ], {
      model: groqClient.models.smart,
      temperature: 0.7, // More creative for hooks
      maxTokens: 500,
    });

    return this.parseHook(response.content);
  }

  /**
   * Generate activity variety suggestions
   * @param {number} durationMinutes - Lesson duration
   * @param {number} gradeLevel - Grade level
   * @returns {Array} Activity variety plan
   */
  generateActivityVariety(durationMinutes, gradeLevel) {
    // Change activity type every 5-10 minutes
    const changeInterval = gradeLevel <= 5 ? 5 : 8; // Younger students need more frequent changes
    const activityTypes = ['visual', 'interactive', 'practice', 'game', 'discussion', 'project'];
    
    const plan = [];
    let currentTime = 0;
    let activityIndex = 0;

    while (currentTime < durationMinutes) {
      const nextChange = Math.min(currentTime + changeInterval, durationMinutes);
      plan.push({
        startTime: currentTime,
        endTime: nextChange,
        activityType: activityTypes[activityIndex % activityTypes.length],
        duration: nextChange - currentTime,
      });
      currentTime = nextChange;
      activityIndex++;
    }

    return plan;
  }

  /**
   * Generate movement break suggestions
   * @param {number} durationMinutes - Lesson duration
   * @param {number} gradeLevel - Grade level
   * @returns {Array} Movement break plan
   */
  generateMovementBreaks(durationMinutes, gradeLevel) {
    // K-5 students need movement breaks every 10-15 minutes
    if (gradeLevel > 5) {
      return []; // Older students don't need movement breaks
    }

    const breakInterval = gradeLevel <= 2 ? 10 : 15; // Younger = more frequent
    const breaks = [];
    let currentTime = breakInterval;

    while (currentTime < durationMinutes) {
      breaks.push({
        time: currentTime,
        duration: 1, // 1 minute break
        activity: this.getMovementActivity(gradeLevel),
      });
      currentTime += breakInterval;
    }

    return breaks;
  }

  /**
   * Get movement activity for grade level
   */
  getMovementActivity(gradeLevel) {
    const activities = {
      preschool: [
        'Stretch like a cat',
        'Jump like a frog',
        'Wiggle your fingers',
        'Stand up and sit down',
      ],
      elementary: [
        'Stand up and stretch',
        'Do 10 jumping jacks',
        'Touch your toes',
        'March in place',
        'Deep breathing exercise',
      ],
    };

    if (gradeLevel <= 0) {
      return activities.preschool[Math.floor(Math.random() * activities.preschool.length)];
    }
    return activities.elementary[Math.floor(Math.random() * activities.elementary.length)];
  }

  /**
   * Generate real-world connections
   * @param {Object} lessonPlan - Lesson plan
   * @param {string} subjectSlug - Subject slug
   * @param {number} gradeLevel - Grade level
   * @returns {Promise<Array>} Real-world connections
   */
  async generateRealWorldConnections(lessonPlan, subjectSlug, gradeLevel) {
    const gradeBand = this.getGradeBand(gradeLevel);
    const objectives = lessonPlan.learningObjectives || [];

    const prompt = `Generate 3-5 real-world connections for a ${gradeLevel}th grade (${gradeBand}) ${subjectSlug} lesson.

LESSON: ${lessonPlan.name}
OBJECTIVES: ${JSON.stringify(objectives)}

Connections should:
1. Relate to student interests (games, sports, hobbies, technology)
2. Show practical applications
3. Be age-appropriate
4. Be engaging and relevant

Return JSON array with:
{
  "connection": "How this relates to real life",
  "example": "Specific example",
  "relevance": "Why students should care"
}`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: 'Generate real-world connections as JSON array.' },
    ], {
      model: groqClient.models.smart,
      temperature: 0.6,
      maxTokens: 800,
    });

    return this.parseConnections(response.content);
  }

  /**
   * Parse hook from AI response
   */
  parseHook(content) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      // Fallback
      return {
        type: 'QUESTION',
        content: content.substring(0, 200),
        visualDescription: null,
        followUp: 'Let\'s explore this together!',
      };
    } catch (error) {
      console.error('Error parsing hook:', error);
      return {
        type: 'QUESTION',
        content: 'Have you ever wondered...?',
        visualDescription: null,
        followUp: 'Let\'s explore this together!',
      };
    }
  }

  /**
   * Parse connections from AI response
   */
  parseConnections(content) {
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch (error) {
      console.error('Error parsing connections:', error);
      return [];
    }
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

export const engagementService = new EngagementService();
export default engagementService;

