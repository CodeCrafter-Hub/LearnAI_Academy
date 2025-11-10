/**
 * VideoGenerationService - Handles AI avatar video generation
 * 
 * Integrates with video generation APIs (HeyGen, D-ID, etc.)
 * Manages video generation, storage, and delivery
 */

class VideoGenerationService {
  constructor() {
    // API configuration - set via environment variables
    this.provider = process.env.VIDEO_GENERATION_PROVIDER || 'heygen'; // 'heygen' | 'd-id' | 'synthesia'
    this.apiKey = process.env.VIDEO_GENERATION_API_KEY;
    this.baseUrl = this.getBaseUrl();
  }

  getBaseUrl() {
    switch (this.provider) {
      case 'heygen':
        return 'https://api.heygen.com/v1';
      case 'd-id':
        return 'https://api.d-id.com';
      case 'synthesia':
        return 'https://api.synthesia.io/v2';
      default:
        return 'https://api.heygen.com/v1';
    }
  }

  /**
   * Generate video from script
   * @param {Object} scriptData - Script with timestamps
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Video generation result
   */
  async generateVideo(scriptData, options = {}) {
    const {
      avatarId = null,
      voiceId = null,
      language = 'en',
      quality = 'high',
    } = options;

    if (!this.apiKey) {
      throw new Error('Video generation API key not configured');
    }

    try {
      switch (this.provider) {
        case 'heygen':
          return await this.generateWithHeyGen(scriptData, { avatarId, voiceId, language, quality });
        case 'd-id':
          return await this.generateWithDID(scriptData, { avatarId, voiceId, language, quality });
        default:
          throw new Error(`Unsupported provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Video generation error:', error);
      throw new Error(`Failed to generate video: ${error.message}`);
    }
  }

  /**
   * Generate video using HeyGen API
   */
  async generateWithHeyGen(scriptData, options) {
    // Convert script to text
    const scriptText = this.scriptToText(scriptData);
    
    // HeyGen API call (example - adjust based on actual API)
    const response = await fetch(`${this.baseUrl}/video/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        avatar_id: options.avatarId || process.env.VIDEO_AVATAR_ID || 'default',
        voice_id: options.voiceId || process.env.VIDEO_VOICE_ID || 'default',
        text: scriptText,
        language: options.language,
        quality: options.quality,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`HeyGen API error: ${error.message || response.statusText}`);
    }

    const result = await response.json();
    
    return {
      videoId: result.video_id || result.id,
      status: result.status || 'processing',
      videoUrl: result.video_url || result.result_url,
      thumbnailUrl: result.thumbnail_url,
      duration: result.duration || scriptData.totalDuration || 600,
      provider: 'heygen',
    };
  }

  /**
   * Generate video using D-ID API
   */
  async generateWithDID(scriptData, options) {
    const scriptText = this.scriptToText(scriptData);
    
    const response = await fetch(`${this.baseUrl}/talks`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_url: options.avatarId || process.env.VIDEO_AVATAR_ID || 'default_avatar_url',
        script: {
          type: 'text',
          input: scriptText,
          provider: {
            type: 'microsoft',
            voice_id: options.voiceId || process.env.VIDEO_VOICE_ID || 'en-US-JennyNeural',
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`D-ID API error: ${error.message || response.statusText}`);
    }

    const result = await response.json();
    
    return {
      videoId: result.id,
      status: result.status || 'processing',
      videoUrl: result.result_url,
      thumbnailUrl: null,
      duration: scriptData.totalDuration || 600,
      provider: 'd-id',
    };
  }

  /**
   * Convert script structure to plain text
   */
  scriptToText(scriptData) {
    if (typeof scriptData === 'string') {
      return scriptData;
    }

    let text = '';
    
    if (scriptData.sections) {
      scriptData.sections.forEach(section => {
        if (section.content) {
          if (typeof section.content === 'string') {
            text += section.content + ' ';
          } else if (Array.isArray(section.content)) {
            section.content.forEach(item => {
              if (typeof item === 'string') {
                text += item + ' ';
              } else if (item.text) {
                text += item.text + ' ';
              } else if (item.problem) {
                text += item.problem + ' ';
              }
            });
          } else if (section.content.mainConcept) {
            text += section.content.mainConcept + ' ';
            if (section.content.examples) {
              section.content.examples.forEach(example => {
                if (example.text) {
                  text += example.text + ' ';
                }
              });
            }
          }
        }
      });
    }

    return text.trim();
  }

  /**
   * Check video generation status
   * @param {string} videoId - Video ID from provider
   * @returns {Promise<Object>} Status information
   */
  async checkVideoStatus(videoId) {
    if (!this.apiKey) {
      throw new Error('Video generation API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/video/${videoId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking video status:', error);
      throw error;
    }
  }
}

export const videoGenerationService = new VideoGenerationService();
export default videoGenerationService;

