import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { multimediaContentService } from '@/services/multimedia/multimediaContentService.js';
import { videoGenerationService } from '@/services/multimedia/videoGenerationService.js';
import { voiceNarrationService } from '@/services/multimedia/voiceNarrationService.js';
import { captionService } from '@/services/multimedia/captionService.js';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const generateMultimediaSchema = z.object({
  action: z.enum(['video', 'audio', 'captions', 'all']),
  lessonPlanId: z.string().uuid(),
  // Video options
  videoProvider: z.enum(['did', 'heygen', 'synthesia']).optional(),
  avatar: z.string().optional(),
  voice: z.string().optional(),
  // Audio options
  audioProvider: z.enum(['elevenlabs', 'google', 'aws', 'browser']).optional(),
  // Storage options
  storageProvider: z.enum(['r2', 's3', 'vercel']).optional(),
  // General options
  includeCaptions: z.boolean().optional(),
  gradeLevel: z.number().int().min(-1).max(12).optional(),
});

/**
 * POST /api/multimedia/generate
 * Generate multimedia content (videos, audio, captions)
 */
export async function POST(request) {
  try {
    // Verify authentication
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = generateMultimediaSchema.parse(body);

    // Get lesson plan
    const lessonPlan = await prisma.lessonPlan.findUnique({
      where: { id: data.lessonPlanId },
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
      return NextResponse.json(
        { error: 'Lesson plan not found' },
        { status: 404 }
      );
    }

    let result;

    switch (data.action) {
      case 'video':
        // Generate video only
        const videoData = await videoGenerationService.generateVideo(lessonPlan, {
          provider: data.videoProvider || 'did',
          avatar: data.avatar,
          voice: data.voice,
          includeCaptions: data.includeCaptions !== false,
        });

        // Store and save
        const storedVideo = await multimediaContentService.storeVideo(
          videoData,
          lessonPlan,
          data.storageProvider || 'r2'
        );

        result = await prisma.multimediaContent.create({
          data: {
            lessonPlanId: data.lessonPlanId,
            contentType: 'VIDEO',
            title: `${lessonPlan.name} - Video`,
            description: `Instructional video`,
            url: storedVideo.url,
            thumbnailUrl: storedVideo.thumbnailUrl,
            durationSeconds: videoData.durationSeconds,
            transcript: videoData.transcript || null,
            captions: videoData.captions ? { format: 'srt', data: videoData.captions } : null,
            metadata: {
              provider: data.videoProvider || 'did',
              generatedAt: new Date().toISOString(),
            },
            isActive: true,
          },
        });
        break;

      case 'audio':
        // Generate audio narration
        const script = await multimediaContentService.getScriptForLessonPlan(lessonPlan);
        const gradeLevel = data.gradeLevel || lessonPlan.unit?.curriculum?.gradeLevel || 5;

        const audioData = await voiceNarrationService.generateNarration(script, {
          provider: data.audioProvider || 'elevenlabs',
          gradeLevel,
        });

        // Store and save
        const storedAudio = await multimediaContentService.storeAudio(
          audioData,
          lessonPlan,
          data.storageProvider || 'r2'
        );

        result = await prisma.multimediaContent.create({
          data: {
            lessonPlanId: data.lessonPlanId,
            contentType: 'AUDIO',
            title: `${lessonPlan.name} - Narration`,
            description: `Voice narration`,
            url: storedAudio.url,
            durationSeconds: audioData.durationSeconds,
            transcript: script,
            metadata: {
              provider: data.audioProvider || 'elevenlabs',
              voice: audioData.voice,
              generatedAt: new Date().toISOString(),
            },
            isActive: true,
          },
        });
        break;

      case 'captions':
        // Generate captions only
        const lessonScript = await multimediaContentService.getScriptForLessonPlan(lessonPlan);
        const captions = await captionService.generateCaptionsFromScript(lessonScript, {
          format: 'srt',
        });

        result = {
          captions,
          script: lessonScript,
        };
        break;

      case 'all':
        // Generate all multimedia content
        result = await multimediaContentService.generateMultimediaContent(data.lessonPlanId, {
          includeVideo: true,
          includeAudio: true,
          includeCaptions: data.includeCaptions !== false,
          videoProvider: data.videoProvider || 'did',
          voiceProvider: data.audioProvider || 'elevenlabs',
          storageProvider: data.storageProvider || 'r2',
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action: data.action,
      result,
    });
  } catch (error) {
    console.error('Error generating multimedia:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate multimedia', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/multimedia
 * Get multimedia content for a lesson plan
 */
export async function GET(request) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const lessonPlanId = searchParams.get('lessonPlanId');

    if (!lessonPlanId) {
      return NextResponse.json(
        { error: 'lessonPlanId is required' },
        { status: 400 }
      );
    }

    const content = await multimediaContentService.getMultimediaContent(lessonPlanId);

    return NextResponse.json({
      success: true,
      content,
    });
  } catch (error) {
    console.error('Error fetching multimedia:', error);
    return NextResponse.json(
      { error: 'Failed to fetch multimedia' },
      { status: 500 }
    );
  }
}

