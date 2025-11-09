import { logError, logInfo } from '../../lib/logger.js';

/**
 * VoiceNarrationService - Generates voice narration for content
 * 
 * Supports multiple TTS providers:
 * - ElevenLabs (High quality, $22/month)
 * - Google Cloud TTS (Free tier, then $4/1M chars)
 * - AWS Polly ($4/1M chars)
 * - Browser TTS (Free, but limited)
 */

class VoiceNarrationService {
  constructor() {
    // Provider configuration
    this.providers = {
      elevenlabs: {
        name: 'ElevenLabs',
        apiKey: process.env.ELEVENLABS_API_KEY,
        baseUrl: 'https://api.elevenlabs.io',
        costPerCharacter: 0, // Monthly subscription
        enabled: !!process.env.ELEVENLABS_API_KEY,
        voices: {
          'K-2': 'Rachel', // Friendly, warm
          '3-5': 'Adam', // Clear, engaging
          '6-8': 'Antoni', // Professional, clear
          '9-12': 'Bella', // Mature, articulate
        },
      },
      google: {
        name: 'Google Cloud TTS',
        apiKey: process.env.GOOGLE_TTS_API_KEY,
        baseUrl: 'https://texttospeech.googleapis.com',
        costPerCharacter: 0.000004, // $4 per 1M characters
        enabled: !!process.env.GOOGLE_TTS_API_KEY,
        voices: {
          'K-2': 'en-US-Neural2-A', // Child-friendly
          '3-5': 'en-US-Neural2-C', // Clear, friendly
          '6-8': 'en-US-Neural2-D', // Professional
          '9-12': 'en-US-Neural2-F', // Mature
        },
      },
      aws: {
        name: 'AWS Polly',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1',
        costPerCharacter: 0.000004, // $4 per 1M characters
        enabled: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
        voices: {
          'K-2': 'Joanna', // Friendly
          '3-5': 'Matthew', // Clear
          '6-8': 'Joey', // Professional
          '9-12': 'Salli', // Mature
        },
      },
      browser: {
        name: 'Browser TTS',
        enabled: true, // Always available
        costPerCharacter: 0,
        voices: {}, // Browser-dependent
      },
    };

    this.defaultProvider = this.getDefaultProvider();
  }

  /**
   * Generate voice narration
   * @param {string} script - Text to narrate
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Audio data
   */
  async generateNarration(script, options = {}) {
    const {
      provider = this.defaultProvider,
      gradeLevel = 5,
      voice = null,
      speed = 1.0,
      pitch = 1.0,
    } = options;

    if (!this.providers[provider]?.enabled) {
      throw new Error(`Voice provider ${provider} is not configured.`);
    }

    const gradeBand = this.getGradeBand(gradeLevel);
    const selectedVoice = voice || this.providers[provider].voices?.[gradeBand] || 'default';

    // Optimize script for speech
    const optimizedScript = this.optimizeScriptForSpeech(script, gradeBand);

    // Generate audio based on provider
    let audioData;
    switch (provider) {
      case 'elevenlabs':
        audioData = await this.generateWithElevenLabs(optimizedScript, selectedVoice, { speed, pitch });
        break;
      case 'google':
        audioData = await this.generateWithGoogle(optimizedScript, selectedVoice, { speed, pitch });
        break;
      case 'aws':
        audioData = await this.generateWithAWS(optimizedScript, selectedVoice, { speed, pitch });
        break;
      case 'browser':
        audioData = await this.generateWithBrowser(optimizedScript, { speed, pitch });
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    return {
      ...audioData,
      script: optimizedScript,
      provider,
      voice: selectedVoice,
      gradeBand,
    };
  }

  /**
   * Optimize script for speech
   * @param {string} script - Original script
   * @param {string} gradeBand - Grade band
   * @returns {string} Optimized script
   */
  optimizeScriptForSpeech(script, gradeBand) {
    let optimized = script;

    // Replace symbols with words
    optimized = optimized.replace(/\s*=\s*/g, ' equals ');
    optimized = optimized.replace(/\s*\+\s*/g, ' plus ');
    optimized = optimized.replace(/\s*-\s*/g, ' minus ');
    optimized = optimized.replace(/\s*\*\s*/g, ' times ');
    optimized = optimized.replace(/\s*\/\s*/g, ' divided by ');
    optimized = optimized.replace(/\s*%\s*/g, ' percent ');

    // Replace numbers with words for K-2
    if (gradeBand === 'K-2' || gradeBand === 'Pre-K' || gradeBand === 'Preschool') {
      optimized = optimized.replace(/\b(\d+)\b/g, (match, num) => {
        const number = parseInt(num);
        if (number <= 20) {
          return this.numberToWords(number);
        }
        return match;
      });
    }

    // Add pauses after periods
    optimized = optimized.replace(/\./g, '...');
    optimized = optimized.replace(/\?/g, '?');
    optimized = optimized.replace(/!/g, '!');

    // Break long sentences
    optimized = optimized.replace(/([^.!?]+[.!?])/g, (sentence) => {
      if (sentence.length > 100) {
        // Split very long sentences
        return sentence.replace(/,/g, '...');
      }
      return sentence;
    });

    return optimized;
  }

  /**
   * Convert number to words (1-20)
   */
  numberToWords(num) {
    const words = [
      'zero', 'one', 'two', 'three', 'four', 'five',
      'six', 'seven', 'eight', 'nine', 'ten',
      'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
      'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
    ];
    return words[num] || num.toString();
  }

  /**
   * Generate with ElevenLabs
   */
  async generateWithElevenLabs(script, voice, options = {}) {
    if (!this.providers.elevenlabs.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      // ElevenLabs API call (placeholder)
      /*
      const response = await fetch(`${this.providers.elevenlabs.baseUrl}/v1/text-to-speech/${voice}`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.providers.elevenlabs.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: script,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            speed: options.speed || 1.0,
          },
        }),
      });

      const audioBlob = await response.blob();
      // Upload to storage and get URL
      */

      logInfo('ElevenLabs narration generation (placeholder)', {
        voice,
        scriptLength: script.length,
      });

      return {
        audioUrl: null, // Would be actual audio URL
        durationSeconds: this.estimateDuration(script),
        format: 'mp3',
        bitrate: 128,
        note: 'ElevenLabs integration requires actual API implementation',
      };
    } catch (error) {
      logError('ElevenLabs narration error', error);
      throw error;
    }
  }

  /**
   * Generate with Google Cloud TTS
   */
  async generateWithGoogle(script, voice, options = {}) {
    if (!this.providers.google.apiKey) {
      throw new Error('Google TTS API key not configured');
    }

    // Placeholder
    logInfo('Google TTS narration generation (placeholder)', {
      voice,
      scriptLength: script.length,
    });

    return {
      audioUrl: null,
      durationSeconds: this.estimateDuration(script),
      format: 'mp3',
      bitrate: 128,
      note: 'Google TTS integration requires actual API implementation',
    };
  }

  /**
   * Generate with AWS Polly
   */
  async generateWithAWS(script, voice, options = {}) {
    if (!this.providers.aws.accessKeyId) {
      throw new Error('AWS credentials not configured');
    }

    // Placeholder
    logInfo('AWS Polly narration generation (placeholder)', {
      voice,
      scriptLength: script.length,
    });

    return {
      audioUrl: null,
      durationSeconds: this.estimateDuration(script),
      format: 'mp3',
      bitrate: 128,
      note: 'AWS Polly integration requires actual API implementation',
    };
  }

  /**
   * Generate with browser TTS (client-side)
   */
  async generateWithBrowser(script, options = {}) {
    // Browser TTS is client-side only
    // This returns instructions for client-side generation
    return {
      audioUrl: null, // Generated client-side
      durationSeconds: this.estimateDuration(script),
      format: 'wav', // Browser default
      clientSide: true,
      instructions: {
        text: script,
        rate: options.speed || 1.0,
        pitch: options.pitch || 1.0,
      },
    };
  }

  /**
   * Estimate audio duration (rough: 150 words per minute)
   */
  estimateDuration(script) {
    const words = script.split(/\s+/).length;
    const wordsPerMinute = 150;
    return Math.ceil((words / wordsPerMinute) * 60);
  }

  /**
   * Get default provider
   */
  getDefaultProvider() {
    for (const [key, provider] of Object.entries(this.providers)) {
      if (provider.enabled && key !== 'browser') {
        return key;
      }
    }
    return 'browser'; // Fallback to browser
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

export const voiceNarrationService = new VoiceNarrationService();
export default voiceNarrationService;

