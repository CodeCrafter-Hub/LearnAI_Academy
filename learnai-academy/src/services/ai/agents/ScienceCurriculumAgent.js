import { CurriculumAgent } from './CurriculumAgent.js';
import { groqClient } from '../groqClient.js';

/**
 * ScienceCurriculumAgent - Specialized curriculum agent for Science
 * 
 * Extends CurriculumAgent with science-specific curriculum generation
 */
export class ScienceCurriculumAgent extends CurriculumAgent {
  constructor() {
    super('Science Curriculum Specialist', 'science');
  }

  /**
   * Generate science-specific practice questions and experiments
   */
  async generateScienceActivities(topic, gradeLevel, count = 10, difficulty = 'MEDIUM') {
    const gradeBand = this.getGradeBand(gradeLevel);
    
    const scienceGuidelines = this.getScienceSpecificGuidelines(topic, gradeBand, difficulty);

    const prompt = `You are a science curriculum specialist creating activities and questions for ${topic} at ${gradeLevel}th grade level (${gradeBand}).

${scienceGuidelines}

Generate ${count} science activities/questions at ${difficulty} difficulty level.

For each activity, provide:
1. Activity/question description (clear, engaging, age-appropriate)
2. Scientific concept being explored
3. Expected observations or answer
4. Explanation of the science behind it
5. Safety considerations (if applicable)
6. Extension activities (if applicable)

Activity Types:
${this.getActivityTypesForGrade(gradeBand)}

Format as JSON array with these fields:
- activity: string (description)
- concept: string (scientific concept)
- answer: string (expected observation or answer)
- explanation: string (why this happens)
- safetyNotes: string (if applicable)
- materials: array of strings (if experiment)
- extension: string (optional extension activity)
- difficulty: "${difficulty}"
- gradeLevel: ${gradeLevel}
- activityType: string (experiment, observation, question, etc.)`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: `Generate ${count} science activities for ${topic}.` },
    ], {
      model: groqClient.models.smart,
      temperature: 0.4,
      maxTokens: 4000,
    });

    return this.parseActivities(response.content);
  }

  /**
   * Generate science lesson plan with experiments and observations
   */
  async generateScienceLessonPlan(topic, gradeLevel, options = {}) {
    const lessonPlan = await super.generateLessonPlan(topic, gradeLevel, options);
    
    // Enhance with science-specific elements
    const scienceEnhancements = {
      experiments: await this.generateExperiments(topic, gradeLevel),
      observations: await this.generateObservationActivities(topic, gradeLevel),
      realWorldConnections: await this.generateRealWorldConnections(topic, gradeLevel),
      safetyGuidelines: this.getSafetyGuidelines(topic, gradeLevel),
    };

    return {
      ...lessonPlan,
      scienceSpecific: scienceEnhancements,
    };
  }

  /**
   * Get science-specific guidelines for activity generation
   */
  getScienceSpecificGuidelines(topic, gradeBand, difficulty) {
    const guidelines = {
      'K-2': `
SCIENCE GUIDELINES FOR K-2:
- Use hands-on exploration and observation
- Focus on the five senses: what do they see, hear, feel, smell?
- Use simple experiments with everyday materials
- Make connections to their daily lives
- Use simple vocabulary and clear explanations
- Encourage questions and wonder
- Use visual aids and demonstrations
- Keep activities short and engaging
- Focus on observation and description`,
      '3-5': `
SCIENCE GUIDELINES FOR 3-5:
- Introduce scientific method (observation, hypothesis, experiment)
- Use concrete examples and experiments
- Connect to nature and everyday phenomena
- Build vocabulary: introduce scientific terms gradually
- Use models and diagrams
- Encourage prediction and testing
- Focus on cause and effect relationships
- Use engaging topics: animals, plants, weather, space
- Include simple experiments they can do`,
      '6-8': `
SCIENCE GUIDELINES FOR 6-8:
- Apply scientific method systematically
- Use controlled experiments
- Introduce abstract concepts with models
- Build on prior knowledge
- Connect to real-world applications
- Include data collection and analysis
- Introduce scientific notation and measurement
- Focus on systems and interactions
- Prepare for high school science`,
      '9-12': `
SCIENCE GUIDELINES FOR 9-12:
- Advanced scientific concepts and theories
- Complex experiments with data analysis
- Scientific writing and lab reports
- Critical thinking and analysis
- Prepare for college-level science
- Real-world applications and current research
- Connect to careers in science
- Develop scientific reasoning
- Independent research projects`,
    };

    return guidelines[gradeBand] || guidelines['3-5'];
  }

  /**
   * Get appropriate activity types for grade band
   */
  getActivityTypesForGrade(gradeBand) {
    const types = {
      'K-2': '- Observation activities\n- Simple experiments\n- Nature walks and exploration\n- Sorting and classifying\n- Pattern recognition\n- Simple measurements',
      '3-5': '- Guided experiments\n- Observation and recording\n- Model building\n- Data collection\n- Simple investigations\n- Field observations',
      '6-8': '- Controlled experiments\n- Data analysis\n- Model creation and testing\n- Research projects\n- Lab investigations\n- Scientific method application',
      '9-12': '- Complex experiments\n- Independent research\n- Data analysis and interpretation\n- Lab reports\n- Scientific investigations\n- Research projects',
    };

    return types[gradeBand] || types['3-5'];
  }

  /**
   * Generate science experiments for topic
   */
  async generateExperiments(topic, gradeLevel) {
    const prompt = `Generate hands-on science experiments for teaching ${topic} to ${gradeLevel}th grade students.

For each experiment, include:
1. Title and objective
2. Materials needed (common, safe materials)
3. Step-by-step procedure
4. Expected observations
5. Scientific explanation
6. Safety considerations

Format as JSON array with fields:
- title: string
- objective: string
- materials: array of strings
- procedure: array of strings (steps)
- observations: string (what to observe)
- explanation: string (why this happens)
- safetyNotes: string`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: `Generate experiments for ${topic}.` },
    ], {
      model: groqClient.models.smart,
      temperature: 0.5,
      maxTokens: 2500,
    });

    return this.parseJSONResponse(response.content);
  }

  /**
   * Generate observation activities
   */
  async generateObservationActivities(topic, gradeLevel) {
    const prompt = `Generate observation activities for ${topic} at ${gradeLevel}th grade level.

Include:
1. What to observe (specific details)
2. Questions to guide observation
3. Recording methods (drawing, writing, measuring)
4. Patterns to look for
5. Connections to scientific concepts

Format as JSON array.`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: `Generate observation activities.` },
    ], {
      model: groqClient.models.fast,
      temperature: 0.5,
      maxTokens: 1500,
    });

    return this.parseJSONResponse(response.content);
  }

  /**
   * Generate real-world connections
   */
  async generateRealWorldConnections(topic, gradeLevel) {
    const prompt = `Generate real-world connections for ${topic} that ${gradeLevel}th grade students can relate to.

Include:
1. Everyday examples where this concept appears
2. Careers that use this science
3. Current events or news related to this
4. Environmental connections
5. Health and safety connections

Format as JSON array with fields:
- example: string
- context: string (where this appears)
- connection: string (how it relates to the concept)`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: `Generate real-world connections.` },
    ], {
      model: groqClient.models.fast,
      temperature: 0.6,
      maxTokens: 1500,
    });

    return this.parseJSONResponse(response.content);
  }

  /**
   * Get safety guidelines for topic
   */
  getSafetyGuidelines(topic, gradeLevel) {
    const gradeBand = this.getGradeBand(gradeLevel);
    
    const safetyGuidelines = {
      'K-2': [
        'Always have adult supervision',
        'Use safe, non-toxic materials',
        'Wash hands before and after activities',
        'No eating during experiments',
      ],
      '3-5': [
        'Adult supervision recommended',
        'Wear safety goggles if needed',
        'Follow instructions carefully',
        'Report any spills or accidents',
        'No tasting or smelling unknown substances',
      ],
      '6-8': [
        'Follow safety protocols',
        'Wear appropriate safety equipment',
        'Handle materials carefully',
        'Know emergency procedures',
        'Clean up properly after experiments',
      ],
      '9-12': [
        'Follow all lab safety protocols',
        'Wear appropriate PPE',
        'Know MSDS for chemicals',
        'Follow disposal procedures',
        'Report safety concerns immediately',
      ],
    };

    return safetyGuidelines[gradeBand] || safetyGuidelines['3-5'];
  }

  /**
   * Parse activities from AI response
   */
  parseActivities(content) {
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      return JSON.parse(content);
    } catch (error) {
      console.error('Error parsing activities:', error);
      return { raw: content, error: 'Failed to parse activities' };
    }
  }

  /**
   * Parse JSON response (helper method)
   */
  parseJSONResponse(content) {
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      return JSON.parse(content);
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      return { raw: content };
    }
  }
}

export default ScienceCurriculumAgent;

