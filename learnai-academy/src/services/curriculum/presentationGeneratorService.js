import prisma from '../../lib/prisma.js';
import { agentOrchestrator } from '../ai/agentOrchestrator.js';
import { groqClient } from '../ai/groqClient.js';

/**
 * PresentationGeneratorService - Generates presentations for lesson plans
 * 
 * Creates slides, videos, and interactive presentations
 */

class PresentationGeneratorService {
  /**
   * Generate presentation for a lesson plan
   * @param {string} lessonPlanId - Lesson plan ID
   * @param {string} type - Presentation type (SLIDES, VIDEO, INTERACTIVE, etc.)
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated presentation
   */
  async generatePresentation(lessonPlanId, type = 'SLIDES', options = {}) {
    const {
      name = null,
      voiceScript = null,
      slideCount = null,
    } = options;

    // Get lesson plan
    const lessonPlan = await prisma.lessonPlan.findUnique({
      where: { id: lessonPlanId },
      include: {
        unit: {
          include: {
            curriculum: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    });

    if (!lessonPlan) {
      throw new Error(`Lesson plan not found: ${lessonPlanId}`);
    }

    const { unit } = lessonPlan;
    const { curriculum } = unit;
    const subjectSlug = curriculum.subject.slug;
    const gradeLevel = curriculum.gradeLevel;

    // Generate presentation based on type
    let presentationData;
    switch (type) {
      case 'SLIDES':
        presentationData = await this.generateSlides(lessonPlan, subjectSlug, gradeLevel, slideCount);
        break;
      case 'VIDEO':
        presentationData = await this.generateVideoScript(lessonPlan, subjectSlug, gradeLevel);
        break;
      case 'INTERACTIVE':
        presentationData = await this.generateInteractive(lessonPlan, subjectSlug, gradeLevel);
        break;
      case 'AUDIO_ONLY':
        presentationData = await this.generateAudioScript(lessonPlan, subjectSlug, gradeLevel);
        break;
      default:
        presentationData = await this.generateSlides(lessonPlan, subjectSlug, gradeLevel, slideCount);
    }

    // Create presentation
    const presentation = await prisma.presentation.create({
      data: {
        lessonPlanId,
        name: name || `${lessonPlan.name} - ${type}`,
        contentType: type,
        slides: presentationData.slides || [],
        voiceScript: voiceScript || presentationData.script || null,
        audioUrl: presentationData.audioUrl || null,
        videoUrl: presentationData.videoUrl || null,
        orderIndex: await this.getNextOrderIndex(lessonPlanId),
        durationSeconds: presentationData.durationSeconds || null,
        isActive: true,
      },
    });

    return presentation;
  }

  /**
   * Generate slides for a lesson
   * @param {Object} lessonPlan - Lesson plan
   * @param {string} subjectSlug - Subject slug
   * @param {number} gradeLevel - Grade level
   * @param {number} slideCount - Number of slides
   * @returns {Promise<Object>} Slides data
   */
  async generateSlides(lessonPlan, subjectSlug, gradeLevel, slideCount = null) {
    const gradeBand = this.getGradeBand(gradeLevel);
    const structure = lessonPlan.lessonStructure || {};
    const objectives = lessonPlan.learningObjectives || [];

    // Calculate slide count if not provided
    const totalSlides = slideCount || this.calculateSlideCount(lessonPlan.durationMinutes);

    const prompt = `You are creating a slide presentation for a ${gradeLevel}th grade (${gradeBand}) ${subjectSlug} lesson.

LESSON: ${lessonPlan.name}
OBJECTIVES: ${JSON.stringify(objectives)}

Create ${totalSlides} slides that cover:
1. Title slide with lesson name
2. Learning objectives
3. Key concepts (from lesson structure)
4. Examples and illustrations
5. Practice problems or activities
6. Summary and review

For each slide, provide:
- title: string
- content: string (main text)
- visualDescription: string (what visual should be shown)
- notes: string (speaker notes)

Format as JSON array.`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: `Generate ${totalSlides} slides as a JSON array.` },
    ], {
      model: groqClient.models.smart,
      temperature: 0.4,
      maxTokens: 4000,
    });

    const slides = this.parseSlides(response.content);

    return {
      slides,
      durationSeconds: lessonPlan.durationMinutes * 60,
    };
  }

  /**
   * Generate video script
   * @param {Object} lessonPlan - Lesson plan
   * @param {string} subjectSlug - Subject slug
   * @param {number} gradeLevel - Grade level
   * @returns {Promise<Object>} Video script data
   */
  async generateVideoScript(lessonPlan, subjectSlug, gradeLevel) {
    const gradeBand = this.getGradeBand(gradeLevel);
    const structure = lessonPlan.lessonStructure || {};

    const prompt = `You are creating a video script for a ${gradeLevel}th grade (${gradeBand}) ${subjectSlug} instructional video.

LESSON: ${lessonPlan.name}
DURATION: ${lessonPlan.durationMinutes} minutes

Create a video script with:
1. Introduction (engaging hook)
2. Main instruction (clear explanations)
3. Examples and demonstrations
4. Practice problems (with solutions)
5. Summary and next steps

Include:
- Spoken dialogue (natural, age-appropriate)
- Visual cues (what should be shown on screen)
- Timing markers (when to show visuals)
- Pause points (where students should pause and practice)

Format as JSON with sections and timing.`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: 'Generate the video script as JSON.' },
    ], {
      model: groqClient.models.smart,
      temperature: 0.5,
      maxTokens: 3000,
    });

    const script = this.parseScript(response.content);

    return {
      script,
      durationSeconds: lessonPlan.durationMinutes * 60,
    };
  }

  /**
   * Generate interactive presentation
   * @param {Object} lessonPlan - Lesson plan
   * @param {string} subjectSlug - Subject slug
   * @param {number} gradeLevel - Grade level
   * @returns {Promise<Object>} Interactive presentation data
   */
  async generateInteractive(lessonPlan, subjectSlug, gradeLevel) {
    // Similar to slides but with interactive elements
    const slidesData = await this.generateSlides(lessonPlan, subjectSlug, gradeLevel);
    
    // Add interactive elements to slides
    const interactiveSlides = slidesData.slides.map((slide, index) => ({
      ...slide,
      interactiveElements: [
        {
          type: 'quiz',
          question: `Quick check: ${slide.title}`,
          options: ['Option A', 'Option B', 'Option C'],
          correctAnswer: 0,
        },
      ],
    }));

    return {
      slides: interactiveSlides,
      durationSeconds: lessonPlan.durationMinutes * 60,
    };
  }

  /**
   * Generate audio-only script
   * @param {Object} lessonPlan - Lesson plan
   * @param {string} subjectSlug - Subject slug
   * @param {number} gradeLevel - Grade level
   * @returns {Promise<Object>} Audio script
   */
  async generateAudioScript(lessonPlan, subjectSlug, gradeLevel) {
    const gradeBand = this.getGradeBand(gradeLevel);

    const prompt = `You are creating an audio-only lesson script (podcast style) for ${gradeLevel}th grade (${gradeBand}) ${subjectSlug}.

LESSON: ${lessonPlan.name}
DURATION: ${lessonPlan.durationMinutes} minutes

Create a conversational, engaging script that:
1. Introduces the topic clearly
2. Explains concepts in simple terms
3. Uses examples and analogies
4. Includes pauses for reflection
5. Summarizes key points

Make it natural and age-appropriate. Format as plain text with clear sections.`;

    const response = await groqClient.chat([
      { role: 'system', content: prompt },
      { role: 'user', content: 'Generate the audio script.' },
    ], {
      model: groqClient.models.smart,
      temperature: 0.6,
      maxTokens: 2000,
    });

    return {
      script: response.content,
      durationSeconds: lessonPlan.durationMinutes * 60,
    };
  }

  /**
   * Calculate slide count based on duration
   */
  calculateSlideCount(durationMinutes) {
    // Roughly 1-2 minutes per slide
    return Math.max(5, Math.min(20, Math.round(durationMinutes / 1.5)));
  }

  /**
   * Parse slides from AI response
   */
  parseSlides(content) {
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: create slides from structured text
      const lines = content.split('\n').filter(l => l.trim());
      const slides = [];
      let currentSlide = null;

      for (const line of lines) {
        if (line.match(/^#+\s*(.+)$/)) {
          if (currentSlide) slides.push(currentSlide);
          currentSlide = {
            title: line.replace(/^#+\s*/, ''),
            content: '',
            visualDescription: '',
            notes: '',
          };
        } else if (currentSlide) {
          currentSlide.content += line + '\n';
        }
      }

      if (currentSlide) slides.push(currentSlide);
      return slides.length > 0 ? slides : [{ title: 'Introduction', content: content }];
    } catch (error) {
      console.error('Error parsing slides:', error);
      return [{ title: 'Introduction', content: content }];
    }
  }

  /**
   * Parse script from AI response
   */
  parseScript(content) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { text: content, sections: [] };
    } catch (error) {
      return { text: content, sections: [] };
    }
  }

  /**
   * Get next order index
   */
  async getNextOrderIndex(lessonPlanId) {
    const lastPresentation = await prisma.presentation.findFirst({
      where: { lessonPlanId },
      orderBy: { orderIndex: 'desc' },
    });

    return (lastPresentation?.orderIndex || 0) + 1;
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

export const presentationGeneratorService = new PresentationGeneratorService();
export default presentationGeneratorService;

