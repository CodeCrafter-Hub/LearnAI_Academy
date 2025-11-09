import { groqClient } from '../ai/groqClient.js';
import { logInfo } from '../../lib/logger.js';

/**
 * PreschoolActivityGenerator - Generates age-appropriate activities for Preschool/Pre-K
 * 
 * Focuses on:
 * - Play-based learning
 * - Hands-on activities
 * - Sensory experiences
 * - Movement and games
 * - Simple, engaging tasks
 */

class PreschoolActivityGenerator {
  /**
   * Generate preschool activity
   * @param {string} topic - Activity topic
   * @param {number} gradeLevel - Grade level (-1 = Preschool, 0 = Pre-K)
   * @param {string} activityType - Type of activity
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated activity
   */
  async generateActivity(topic, gradeLevel, activityType, options = {}) {
    const {
      durationMinutes = 10,
      materials = [],
    } = options;

    const ageGroup = gradeLevel === -1 ? 'Preschool (3-4 years)' : 'Pre-K (4-5 years)';
    const guidelines = this.getActivityGuidelines(gradeLevel);

    const prompt = `Create a ${activityType} activity for ${ageGroup} children.

TOPIC: ${topic}
DURATION: ${durationMinutes} minutes
${materials.length > 0 ? `MATERIALS: ${materials.join(', ')}` : ''}

${guidelines}

Create an activity that:
- Is fun and engaging
- Uses simple materials
- Can be done with parent help
- Teaches the concept through play
- Is developmentally appropriate

Provide:
- name: Activity name
- description: What children will do
- materials: List of materials needed
- instructions: Step-by-step instructions (simple)
- learningOutcome: What children learn
- variations: 2-3 variations of the activity
- parentTips: Tips for parents

Format as JSON.`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: `Generate the ${activityType} activity as JSON.` },
    ], {
      model: groqClient.models.smart,
      temperature: 0.6,
      maxTokens: 2000,
    });

    return this.parseActivity(response.content);
  }

  /**
   * Generate play-based learning activity
   * @param {string} topic - Topic
   * @param {number} gradeLevel - Grade level
   * @returns {Promise<Object>} Activity
   */
  async generatePlayActivity(topic, gradeLevel) {
    return await this.generateActivity(topic, gradeLevel, 'play-based learning', {
      durationMinutes: 15,
    });
  }

  /**
   * Generate sensory activity
   * @param {string} topic - Topic
   * @param {number} gradeLevel - Grade level
   * @returns {Promise<Object>} Activity
   */
  async generateSensoryActivity(topic, gradeLevel) {
    return await this.generateActivity(topic, gradeLevel, 'sensory exploration', {
      durationMinutes: 10,
      materials: ['sensory materials', 'containers', 'tools'],
    });
  }

  /**
   * Generate movement activity
   * @param {string} topic - Topic
   * @param {number} gradeLevel - Grade level
   * @returns {Promise<Object>} Activity
   */
  async generateMovementActivity(topic, gradeLevel) {
    return await this.generateActivity(topic, gradeLevel, 'movement and physical play', {
      durationMinutes: 10,
    });
  }

  /**
   * Generate art/craft activity
   * @param {string} topic - Topic
   * @param {number} gradeLevel - Grade level
   * @returns {Promise<Object>} Activity
   */
  async generateArtActivity(topic, gradeLevel) {
    return await this.generateActivity(topic, gradeLevel, 'art and craft', {
      durationMinutes: 15,
      materials: ['paper', 'crayons', 'markers', 'glue', 'scissors'],
    });
  }

  /**
   * Generate music/song activity
   * @param {string} topic - Topic
   * @param {number} gradeLevel - Grade level
   * @returns {Promise<Object>} Activity
   */
  async generateMusicActivity(topic, gradeLevel) {
    return await this.generateActivity(topic, gradeLevel, 'music and song', {
      durationMinutes: 5,
    });
  }

  /**
   * Get activity guidelines by grade level
   */
  getActivityGuidelines(gradeLevel) {
    if (gradeLevel === -1) {
      return `
PRESCHOOL ACTIVITY GUIDELINES (Age 3-4):
- Keep it simple (2-3 steps max)
- Use familiar objects (toys, food, household items)
- Include movement and play
- Short duration (5-10 minutes)
- Focus on exploration, not perfection
- Use simple language
- Include parent participation
- Make it fun and engaging
- No right or wrong answers
- Celebrate participation`;
    } else {
      return `
PRE-K ACTIVITY GUIDELINES (Age 4-5):
- Simple but structured (3-4 steps)
- Use educational materials (blocks, puzzles, books)
- Mix play with learning
- Moderate duration (10-15 minutes)
- Focus on skill building
- Clear instructions
- Parent support encouraged
- Fun with learning goals
- Gentle guidance on correctness
- Celebrate effort and progress`;
    }
  }

  /**
   * Parse activity from AI response
   */
  parseActivity(content) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { raw: content };
    } catch (error) {
      return { raw: content };
    }
  }

  /**
   * Get recommended activities for topic
   * @param {string} topic - Topic
   * @param {number} gradeLevel - Grade level
   * @returns {Promise<Array>} Recommended activities
   */
  async getRecommendedActivities(topic, gradeLevel) {
    const activities = [];

    // Generate mix of activity types
    activities.push(await this.generatePlayActivity(topic, gradeLevel));
    activities.push(await this.generateSensoryActivity(topic, gradeLevel));
    activities.push(await this.generateMovementActivity(topic, gradeLevel));
    activities.push(await this.generateArtActivity(topic, gradeLevel));

    return activities;
  }
}

export const preschoolActivityGenerator = new PreschoolActivityGenerator();
export default preschoolActivityGenerator;

