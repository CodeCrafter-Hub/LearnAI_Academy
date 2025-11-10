import { agentOrchestrator } from '../ai/agentOrchestrator.js';
import prisma from '../../lib/prisma.js';

/**
 * VideoScriptGeneratorService - Generates video lesson scripts
 * 
 * Creates structured scripts for AI avatar video generation with:
 * - Introduction hooks
 * - Concept explanations
 * - Practice problems
 * - Summary and next steps
 * - Timing markers for scene transitions
 */
class VideoScriptGeneratorService {
  /**
   * Generate video script for a topic
   * @param {string} topic - Topic name (e.g., "Adding Fractions")
   * @param {number} gradeLevel - Grade level (K-2, 3-5, 6-8, 9-12)
   * @param {string} subjectSlug - Subject slug
   * @param {Object} studentContext - Student context (optional)
   * @param {number} durationMinutes - Target duration (5, 10, 15)
   * @returns {Promise<Object>} Generated script with timestamps
   */
  async generateScript(topic, gradeLevel, subjectSlug, studentContext = null, durationMinutes = 10) {
    const agent = agentOrchestrator.getAgent(subjectSlug);
    
    // Build prompt for script generation
    const prompt = this.buildScriptPrompt(topic, gradeLevel, subjectSlug, studentContext, durationMinutes);
    
    try {
      const response = await agent.generateContent(prompt);
      const scriptData = this.parseScriptResponse(response);
      
      // Add timing markers
      const scriptWithTimings = this.addTimingMarkers(scriptData, durationMinutes);
      
      return {
        script: scriptWithTimings,
        visualCues: this.generateVisualCues(scriptWithTimings),
        practiceProblems: scriptData.practiceProblems || [],
        metadata: {
          topic,
          gradeLevel,
          subjectSlug,
          durationMinutes,
          estimatedDuration: this.calculateDuration(scriptWithTimings),
        },
      };
    } catch (error) {
      console.error('Error generating video script:', error);
      throw new Error(`Failed to generate video script: ${error.message}`);
    }
  }

  /**
   * Build prompt for script generation
   */
  buildScriptPrompt(topic, gradeLevel, subjectSlug, studentContext, durationMinutes) {
    const gradeName = this.getGradeName(gradeLevel);
    const studentName = studentContext?.name ? ` for ${studentContext.name}` : '';
    const interests = studentContext?.interests ? ` Use examples from: ${studentContext.interests.join(', ')}.` : '';
    
    return `Generate a ${durationMinutes}-minute educational video script${studentName} on "${topic}" for ${gradeName} students.

Subject: ${subjectSlug}

Script Structure:
1. Introduction Hook (30 seconds) - Engaging opening that captures attention
2. Learning Objectives (30 seconds) - What students will learn
3. Concept Explanation (${Math.round(durationMinutes * 0.4)} minutes) - Clear explanation with examples${interests}
4. Worked Examples (${Math.round(durationMinutes * 0.3)} minutes) - Step-by-step problem solving
5. Practice Problems (${Math.round(durationMinutes * 0.15)} minutes) - Interactive practice
6. Summary & Next Steps (30 seconds) - Recap and what's next

Requirements:
- Use age-appropriate language for ${gradeName}
- Include 2-3 concrete examples
- Add natural pauses for student reflection
- Include visual cue suggestions (diagrams, animations, text overlays)
- Make it engaging and conversational
- Include 2-3 practice problems with solutions

Return as JSON:
{
  "introduction": "text",
  "objectives": ["objective1", "objective2"],
  "explanation": {
    "mainConcept": "text",
    "examples": [
      {"text": "explanation", "visualCue": "suggestion"}
    ]
  },
  "workedExamples": [
    {"problem": "text", "solution": "step-by-step", "visualCue": "suggestion"}
  ],
  "practiceProblems": [
    {"problem": "text", "solution": "text", "hint": "text"}
  ],
  "summary": "text",
  "nextSteps": "text"
}`;
  }

  /**
   * Parse script response from AI
   */
  parseScriptResponse(response) {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      // Fallback: structure the text response
      return this.structureTextResponse(response);
    } catch (error) {
      console.error('Error parsing script response:', error);
      return this.structureTextResponse(response);
    }
  }

  /**
   * Structure plain text response
   */
  structureTextResponse(text) {
    return {
      introduction: text.substring(0, 200),
      objectives: ['Learn the concept', 'Practice with examples'],
      explanation: {
        mainConcept: text.substring(200, 800),
        examples: [{ text: text.substring(800, 1200), visualCue: 'Show diagram' }],
      },
      workedExamples: [{ problem: 'Example problem', solution: 'Step-by-step solution', visualCue: 'Show steps' }],
      practiceProblems: [{ problem: 'Practice problem', solution: 'Answer', hint: 'Hint' }],
      summary: text.substring(text.length - 200),
      nextSteps: 'Continue practicing',
    };
  }

  /**
   * Add timing markers to script
   */
  addTimingMarkers(scriptData, durationMinutes) {
    const totalSeconds = durationMinutes * 60;
    let currentTime = 0;
    
    const sections = [
      { name: 'introduction', duration: 30, content: scriptData.introduction },
      { name: 'objectives', duration: 30, content: scriptData.objectives },
      { name: 'explanation', duration: Math.round(totalSeconds * 0.4), content: scriptData.explanation },
      { name: 'workedExamples', duration: Math.round(totalSeconds * 0.3), content: scriptData.workedExamples },
      { name: 'practiceProblems', duration: Math.round(totalSeconds * 0.15), content: scriptData.practiceProblems },
      { name: 'summary', duration: 15, content: scriptData.summary },
      { name: 'nextSteps', duration: 15, content: scriptData.nextSteps },
    ];

    const scriptWithTimings = {
      sections: sections.map(section => ({
        name: section.name,
        startTime: currentTime,
        endTime: currentTime + section.duration,
        duration: section.duration,
        content: section.content,
      })),
      totalDuration: totalSeconds,
    };

    // Update currentTime for next section
    sections.forEach((section, index) => {
      if (index > 0) {
        scriptWithTimings.sections[index].startTime = scriptWithTimings.sections[index - 1].endTime;
        scriptWithTimings.sections[index].endTime = scriptWithTimings.sections[index].startTime + section.duration;
      }
    });

    return scriptWithTimings;
  }

  /**
   * Generate visual cues from script
   */
  generateVisualCues(script) {
    const cues = [];
    
    script.sections.forEach(section => {
      if (section.content && typeof section.content === 'object') {
        if (section.content.visualCue) {
          cues.push({
            timestamp: section.startTime,
            type: 'visual',
            suggestion: section.content.visualCue,
          });
        }
        if (Array.isArray(section.content.examples)) {
          section.content.examples.forEach(example => {
            if (example.visualCue) {
              cues.push({
                timestamp: section.startTime,
                type: 'visual',
                suggestion: example.visualCue,
              });
            }
          });
        }
      }
    });

    return cues;
  }

  /**
   * Calculate estimated duration
   */
  calculateDuration(script) {
    return script.totalDuration || 600; // Default 10 minutes
  }

  /**
   * Get grade name
   */
  getGradeName(gradeLevel) {
    if (gradeLevel <= 0) return 'Preschool';
    if (gradeLevel <= 2) return 'Grades K-2';
    if (gradeLevel <= 5) return 'Grades 3-5';
    if (gradeLevel <= 8) return 'Grades 6-8';
    return 'Grades 9-12';
  }
}

export const videoScriptGeneratorService = new VideoScriptGeneratorService();
export default videoScriptGeneratorService;

