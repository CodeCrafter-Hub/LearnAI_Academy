import prisma from '../../lib/prisma.js';
import { videoScriptGeneratorService } from './videoScriptGeneratorService.js';
import { videoGenerationService } from './videoGenerationService.js';
import { videoStorageService } from './videoStorageService.js';

/**
 * VideoLessonService - Main service for video lesson management
 * 
 * Handles creation, retrieval, and management of video lessons
 */
class VideoLessonService {
  /**
   * Create a new video lesson
   * @param {Object} data - Video lesson data
   * @returns {Promise<Object>} Created video lesson
   */
  async createVideoLesson(data) {
    const {
      subjectId,
      topic,
      gradeLevelMin,
      gradeLevelMax,
      title,
      description,
      difficulty = 'MEDIUM',
      generateScript = false,
      generateVideo = false,
      studentContext = null,
      durationMinutes = 10,
    } = data;

    // Generate script if requested
    let scriptData = null;
    if (generateScript) {
      const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
      if (!subject) {
        throw new Error('Subject not found');
      }
      scriptData = await videoScriptGeneratorService.generateScript(
        topic || title,
        Math.floor((gradeLevelMin + gradeLevelMax) / 2),
        subject.slug,
        studentContext,
        durationMinutes
      );
    }

    // Generate video if requested (requires script)
    let videoUrl = null;
    let thumbnailUrl = null;
    if (generateVideo && scriptData) {
      try {
        const videoResult = await videoGenerationService.generateVideo(scriptData.script, {
          avatarId: process.env.VIDEO_AVATAR_ID,
          voiceId: process.env.VIDEO_VOICE_ID,
        });

        // Upload to R2 if video URL is from external provider
        if (videoResult.videoUrl && videoResult.videoUrl.includes('http')) {
          const fileName = `video_${Date.now()}.mp4`;
          try {
            videoUrl = await videoStorageService.uploadVideoFromUrl(videoResult.videoUrl, fileName);
            thumbnailUrl = videoStorageService.getThumbnailUrl(fileName);
          } catch (uploadError) {
            console.error('Error uploading video to R2:', uploadError);
            // Fallback to original URL if R2 upload fails
            videoUrl = videoResult.videoUrl;
            thumbnailUrl = videoResult.thumbnailUrl;
          }
        } else {
          videoUrl = videoResult.videoUrl;
          thumbnailUrl = videoResult.thumbnailUrl;
        }
      } catch (videoError) {
        console.error('Error generating video:', videoError);
        // Continue without video - can be generated later
      }
    }

    // Create video lesson record
    const videoLesson = await prisma.videoLesson.create({
      data: {
        subjectId,
        topic: topic || title,
        gradeLevelMin,
        gradeLevelMax,
        title,
        description,
        durationSeconds: scriptData?.metadata?.estimatedDuration || durationMinutes * 60,
        thumbnailUrl,
        videoUrl: videoUrl || '', // Will be set when video is generated
        transcript: scriptData ? this.extractTranscript(scriptData) : null,
        difficulty,
        script: scriptData?.script || null,
        visualCues: scriptData?.visualCues || null,
        practiceProblems: scriptData?.practiceProblems || null,
        isActive: true,
      },
      include: {
        subject: true,
      },
    });

    return videoLesson;
  }

  /**
   * Get video lesson by ID
   */
  async getVideoLesson(id, studentId = null) {
    const videoLesson = await prisma.videoLesson.findUnique({
      where: { id },
      include: {
        subject: true,
        views: studentId ? {
          where: { studentId },
          take: 1,
        } : false,
      },
    });

    if (!videoLesson) {
      throw new Error('Video lesson not found');
    }

    return videoLesson;
  }

  /**
   * Search video lessons
   */
  async searchVideoLessons(query, filters = {}) {
    const {
      subjectId,
      gradeLevel,
      difficulty,
      limit = 20,
      offset = 0,
    } = filters;

    const where = {
      isActive: true,
      ...(subjectId && { subjectId }),
      ...(gradeLevel && {
        gradeLevelMin: { lte: gradeLevel },
        gradeLevelMax: { gte: gradeLevel },
      }),
      ...(difficulty && { difficulty }),
      ...(query && {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { topic: { contains: query, mode: 'insensitive' } },
        ],
      }),
    };

    const [videoLessons, total] = await Promise.all([
      prisma.videoLesson.findMany({
        where,
        include: {
          subject: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.videoLesson.count({ where }),
    ]);

    return {
      videoLessons,
      total,
      limit,
      offset,
    };
  }

  /**
   * Record video view/playback
   */
  async recordView(videoLessonId, studentId, data) {
    const {
      watchedDurationSeconds = 0,
      lastPositionSeconds = 0,
      completed = false,
    } = data;

    // Update or create view record
    const view = await prisma.videoLessonView.upsert({
      where: {
        videoLessonId_studentId: {
          videoLessonId,
          studentId,
        },
      },
      update: {
        watchedDurationSeconds,
        lastPositionSeconds,
        completed,
        ...(completed && !data.completedAt ? { completedAt: new Date() } : {}),
        updatedAt: new Date(),
      },
      create: {
        videoLessonId,
        studentId,
        watchedDurationSeconds,
        lastPositionSeconds,
        completed,
        ...(completed ? { completedAt: new Date() } : {}),
      },
    });

    // Update video lesson view count (only increment once per unique view)
    if (watchedDurationSeconds > 0 && lastPositionSeconds === watchedDurationSeconds) {
      // Only increment if this is a new view (first time watching)
      const existingView = await prisma.videoLessonView.findUnique({
        where: {
          videoLessonId_studentId: {
            videoLessonId,
            studentId,
          },
        },
      });

      if (!existingView || existingView.watchedDurationSeconds === 0) {
        await prisma.videoLesson.update({
          where: { id: videoLessonId },
          data: {
            viewCount: { increment: 1 },
          },
        });
      }
    }

    return view;
  }

  /**
   * Rate video lesson
   */
  async rateVideo(videoLessonId, studentId, rating, review = null) {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Update view with rating
    await prisma.videoLessonView.updateMany({
      where: {
        videoLessonId,
        studentId,
      },
      data: {
        rating,
        review,
      },
    });

    // Recalculate average rating
    const ratings = await prisma.videoLessonView.findMany({
      where: {
        videoLessonId,
        rating: { not: null },
      },
      select: { rating: true },
    });

    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    await prisma.videoLesson.update({
      where: { id: videoLessonId },
      data: {
        averageRating,
        totalRatings: ratings.length,
      },
    });

    return { rating, averageRating };
  }

  /**
   * Extract transcript from script data
   */
  extractTranscript(scriptData) {
    if (!scriptData || !scriptData.script) return null;
    
    let transcript = '';
    if (scriptData.script.sections) {
      scriptData.script.sections.forEach(section => {
        if (section.content) {
          if (typeof section.content === 'string') {
            transcript += section.content + '\n';
          } else if (Array.isArray(section.content)) {
            section.content.forEach(item => {
              if (typeof item === 'string') {
                transcript += item + '\n';
              } else if (item.text) {
                transcript += item.text + '\n';
              }
            });
          } else if (section.content.mainConcept) {
            transcript += section.content.mainConcept + '\n';
          }
        }
      });
    }
    
    return transcript.trim();
  }

  /**
   * Get recommended videos for student
   */
  async getRecommendedVideos(studentId, limit = 10) {
    // Get student's watched videos
    const watchedVideos = await prisma.videoLessonView.findMany({
      where: { studentId },
      select: { videoLessonId: true },
    });

    const watchedIds = watchedVideos.map(v => v.videoLessonId);

    // Get student's grade level (assuming it's stored somewhere)
    // For now, return popular videos not yet watched
    const recommendations = await prisma.videoLesson.findMany({
      where: {
        isActive: true,
        id: { notIn: watchedIds },
      },
      include: {
        subject: true,
      },
      orderBy: [
        { viewCount: 'desc' },
        { averageRating: 'desc' },
      ],
      take: limit,
    });

    return recommendations;
  }
}

export const videoLessonService = new VideoLessonService();
export default videoLessonService;

