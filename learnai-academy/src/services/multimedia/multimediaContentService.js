import prisma from '../../lib/prisma.js';
import { videoGenerationService } from './videoGenerationService.js';
import { voiceNarrationService } from './voiceNarrationService.js';
import { multimediaStorageService } from './multimediaStorageService.js';
import { captionService } from './captionService.js';
import { logError, logInfo } from '../../lib/logger.js';

/**
 * MultimediaContentService - Orchestrates all multimedia content generation
 * 
 * Coordinates:
 * - Video generation
 * - Voice narration
 * - Storage and delivery
 * - Caption generation
 * - Database persistence
 */

class MultimediaContentService {
  /**
   * Generate complete multimedia content for a lesson plan
   * @param {string} lessonPlanId - Lesson plan ID
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated multimedia content
   */
  async generateMultimediaContent(lessonPlanId, options = {}) {
    const {
      includeVideo = true,
      includeAudio = true,
      includeCaptions = true,
      videoProvider = 'did',
      voiceProvider = 'elevenlabs',
      storageProvider = 'r2',
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

    const results = {
      video: null,
      audio: null,
      captions: null,
    };

    // Generate video if requested
    if (includeVideo) {
      try {
        const videoData = await videoGenerationService.generateVideo(lessonPlan, {
          provider: videoProvider,
          includeCaptions: includeCaptions,
        });

        // Store video (placeholder - would upload actual file)
        const storedVideo = await this.storeVideo(videoData, lessonPlan, storageProvider);

        // Save to database
        const multimediaContent = await prisma.multimediaContent.create({
          data: {
            lessonPlanId,
            contentType: 'VIDEO',
            title: `${lessonPlan.name} - Video`,
            description: `Instructional video for ${lessonPlan.name}`,
            url: storedVideo.url,
            thumbnailUrl: storedVideo.thumbnailUrl,
            durationSeconds: videoData.durationSeconds,
            transcript: videoData.transcript || null,
            captions: videoData.captions ? { format: 'srt', data: videoData.captions } : null,
            interactive: false,
            metadata: {
              provider: videoProvider,
              generatedAt: new Date().toISOString(),
            },
            isActive: true,
          },
        });

        results.video = multimediaContent;
        logInfo('Video generated and stored', { lessonPlanId, videoId: multimediaContent.id });
      } catch (error) {
        logError('Video generation error', error);
        // Continue with other content
      }
    }

    // Generate audio narration if requested
    if (includeAudio) {
      try {
        // Get script from lesson plan or presentation
        const script = await this.getScriptForLessonPlan(lessonPlan);

        const audioData = await voiceNarrationService.generateNarration(script, {
          provider: voiceProvider,
          gradeLevel: lessonPlan.unit?.curriculum?.gradeLevel || 5,
        });

        // Store audio (placeholder)
        const storedAudio = await this.storeAudio(audioData, lessonPlan, storageProvider);

        // Save to database
        const audioContent = await prisma.multimediaContent.create({
          data: {
            lessonPlanId,
            contentType: 'AUDIO',
            title: `${lessonPlan.name} - Narration`,
            description: `Voice narration for ${lessonPlan.name}`,
            url: storedAudio.url,
            durationSeconds: audioData.durationSeconds,
            transcript: script,
            metadata: {
              provider: voiceProvider,
              voice: audioData.voice,
              generatedAt: new Date().toISOString(),
            },
            isActive: true,
          },
        });

        results.audio = audioContent;
        logInfo('Audio generated and stored', { lessonPlanId, audioId: audioContent.id });
      } catch (error) {
        logError('Audio generation error', error);
      }
    }

    // Generate captions if requested and not already included
    if (includeCaptions && results.video && !results.video.captions) {
      try {
        const script = await this.getScriptForLessonPlan(lessonPlan);
        const captions = await captionService.generateCaptionsFromScript(script, {
          format: 'srt',
        });

        // Update video with captions
        await prisma.multimediaContent.update({
          where: { id: results.video.id },
          data: {
            captions: {
              format: 'srt',
              data: captions.segments,
            },
            transcript: script,
          },
        });

        results.captions = captions;
      } catch (error) {
        logError('Caption generation error', error);
      }
    }

    return results;
  }

  /**
   * Get script for lesson plan
   * @param {Object} lessonPlan - Lesson plan
   * @returns {Promise<string>} Script text
   */
  async getScriptForLessonPlan(lessonPlan) {
    // Try to get from presentation first
    const presentation = await prisma.presentation.findFirst({
      where: {
        lessonPlanId: lessonPlan.id,
        contentType: { in: ['VIDEO', 'AUDIO_ONLY', 'HYBRID'] },
      },
      orderBy: { orderIndex: 'asc' },
    });

    if (presentation?.voiceScript) {
      return presentation.voiceScript;
    }

    // Fallback: Generate script from lesson plan
    const structure = lessonPlan.lessonStructure || {};
    const objectives = lessonPlan.learningObjectives || [];

    return `Lesson: ${lessonPlan.name}\n\nObjectives:\n${objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}\n\nContent:\n${JSON.stringify(structure, null, 2)}`;
  }

  /**
   * Store video file
   * @param {Object} videoData - Video data
   * @param {Object} lessonPlan - Lesson plan
   * @param {string} provider - Storage provider
   * @returns {Promise<Object>} Stored video info
   */
  async storeVideo(videoData, lessonPlan, provider) {
    // In production, would:
    // 1. Download video from generation service
    // 2. Upload to storage
    // 3. Generate thumbnail
    // 4. Return URLs

    const filename = `lesson-${lessonPlan.id}-${Date.now()}.mp4`;

    logInfo('Video storage (placeholder)', {
      lessonPlanId: lessonPlan.id,
      provider,
      filename,
    });

    return {
      url: multimediaStorageService.getCDNUrl(`videos/${filename}`, provider),
      thumbnailUrl: multimediaStorageService.getCDNUrl(`thumbnails/${filename.replace('.mp4', '.jpg')}`, provider),
      path: `videos/${filename}`,
    };
  }

  /**
   * Store audio file
   * @param {Object} audioData - Audio data
   * @param {Object} lessonPlan - Lesson plan
   * @param {string} provider - Storage provider
   * @returns {Promise<Object>} Stored audio info
   */
  async storeAudio(audioData, lessonPlan, provider) {
    const filename = `lesson-${lessonPlan.id}-narration-${Date.now()}.mp3`;

    logInfo('Audio storage (placeholder)', {
      lessonPlanId: lessonPlan.id,
      provider,
      filename,
    });

    return {
      url: multimediaStorageService.getCDNUrl(`audio/${filename}`, provider),
      path: `audio/${filename}`,
    };
  }

  /**
   * Get multimedia content for lesson plan
   * @param {string} lessonPlanId - Lesson plan ID
   * @returns {Promise<Array>} Multimedia content
   */
  async getMultimediaContent(lessonPlanId) {
    return await prisma.multimediaContent.findMany({
      where: {
        lessonPlanId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Delete multimedia content
   * @param {string} contentId - Content ID
   * @returns {Promise<boolean>} Success
   */
  async deleteMultimediaContent(contentId) {
    try {
      const content = await prisma.multimediaContent.findUnique({
        where: { id: contentId },
      });

      if (!content) {
        return false;
      }

      // Delete from storage
      await multimediaStorageService.deleteFile(content.url, content.metadata?.provider);

      // Delete from database
      await prisma.multimediaContent.delete({
        where: { id: contentId },
      });

      return true;
    } catch (error) {
      logError('Multimedia deletion error', error);
      return false;
    }
  }
}

export const multimediaContentService = new MultimediaContentService();
export default multimediaContentService;

