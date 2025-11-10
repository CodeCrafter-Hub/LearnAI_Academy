import { z } from 'zod';

/**
 * Environment Variable Validator
 *
 * Validates all required environment variables at application startup
 * to catch configuration errors early.
 */

/**
 * Environment variable schema
 */
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .refine((url) => url.startsWith('postgresql://') || url.startsWith('postgres://'), {
      message: 'DATABASE_URL must be a valid PostgreSQL connection string',
    }),

  // JWT Authentication
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters for security')
    .describe('Secret key for JWT token signing'),
  JWT_EXPIRES_IN: z.string().default('7d').describe('JWT token expiration time'),

  // Redis Cache
  REDIS_URL: z
    .string()
    .min(1, 'REDIS_URL is required')
    .refine((url) => url.startsWith('redis://') || url.startsWith('rediss://'), {
      message: 'REDIS_URL must be a valid Redis connection string',
    }),

  // AI Provider API Keys (At least one required in production)
  GROQ_API_KEY: z.string().optional().describe('Groq AI API key'),
  OPENAI_API_KEY: z.string().optional().describe('OpenAI API key'),
  GEMINI_API_KEY: z.string().optional().describe('Google Gemini API key'),
  KIMI_API_KEY: z.string().optional().describe('Kimi (Moonshot AI) API key'),

  // Video Generation API (Optional - for video lesson generation)
  VIDEO_GENERATION_PROVIDER: z.enum(['heygen', 'd-id', 'synthesia']).optional().describe('Video generation provider'),
  VIDEO_GENERATION_API_KEY: z.string().optional().describe('Video generation API key'),
  VIDEO_AVATAR_ID: z.string().optional().describe('Default avatar ID for video generation'),
  VIDEO_VOICE_ID: z.string().optional().describe('Default voice ID for video generation'),

  // Cloudflare R2 Storage (Optional - for video storage)
  CLOUDFLARE_ACCOUNT_ID: z.string().optional().describe('Cloudflare account ID'),
  CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().optional().describe('Cloudflare R2 access key ID'),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string().optional().describe('Cloudflare R2 secret access key'),
  CLOUDFLARE_R2_BUCKET_NAME: z.string().optional().describe('Cloudflare R2 bucket name'),
  CLOUDFLARE_R2_PUBLIC_URL: z.string().url().optional().describe('Cloudflare R2 public CDN URL'),

  // Application Settings
  PORT: z.string().default('3000').transform(Number).pipe(z.number().int().positive()),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),

  // Security (Production only - at least one AI provider required)
  ...(process.env.NODE_ENV === 'production' && {
    // At least one AI provider must be configured
    // Validation happens in checkOptionalEnv()
  }),
});

/**
 * Validate environment variables
 */
export function validateEnv() {
  try {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
      console.error('❌ Environment validation failed:');
      console.error('');

      const errors = parsed.error.format();

      // Display errors in a readable format
      Object.entries(errors).forEach(([key, value]) => {
        if (key !== '_errors' && value && typeof value === 'object' && '_errors' in value) {
          console.error(`  ${key}:`);
          value._errors.forEach((error) => {
            console.error(`    - ${error}`);
          });
        }
      });

      console.error('');
      throw new Error('Environment validation failed. Please check your .env file.');
    }

    console.log('✅ Environment variables validated successfully');
    return parsed.data;
  } catch (error) {
    console.error('Fatal error during environment validation:', error.message);
    process.exit(1);
  }
}

/**
 * Check for recommended optional environment variables
 */
export function checkOptionalEnv() {
  const warnings = [];
  const errors = [];

  // Check for AI providers (at least one required in production)
  const aiProviders = {
    'GROQ_API_KEY': 'Groq',
    'OPENAI_API_KEY': 'OpenAI',
    'GEMINI_API_KEY': 'Google Gemini',
    'KIMI_API_KEY': 'Kimi (Moonshot AI)',
  };

  const availableProviders = Object.entries(aiProviders)
    .filter(([key]) => process.env[key])
    .map(([_, name]) => name);

  // Check for video generation API
  if (process.env.VIDEO_GENERATION_API_KEY) {
    const provider = process.env.VIDEO_GENERATION_PROVIDER || 'heygen';
    console.log(`✅ Video Generation API configured: ${provider}`);
  } else {
    warnings.push('VIDEO_GENERATION_API_KEY is not set (video lesson generation will be disabled)');
  }

  // Check for Cloudflare R2
  const r2Required = ['CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_R2_ACCESS_KEY_ID', 'CLOUDFLARE_R2_SECRET_ACCESS_KEY', 'CLOUDFLARE_R2_BUCKET_NAME', 'CLOUDFLARE_R2_PUBLIC_URL'];
  const r2Configured = r2Required.filter(key => process.env[key]).length;
  if (r2Configured === r2Required.length) {
    console.log('✅ Cloudflare R2 storage configured');
  } else if (r2Configured > 0) {
    warnings.push('Cloudflare R2 partially configured. All R2 variables are required for video storage.');
  } else {
    warnings.push('Cloudflare R2 not configured (video storage will be disabled)');
  }

  if (process.env.NODE_ENV === 'production') {
    if (availableProviders.length === 0) {
      errors.push('At least one AI provider API key is required in production. Set one of: GROQ_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY, or KIMI_API_KEY');
    } else {
      console.log(`✅ AI Providers configured: ${availableProviders.join(', ')}`);
    }

    if (!process.env.SENTRY_DSN) {
      warnings.push('SENTRY_DSN is not set (recommended for error tracking in production)');
    }

    if (!process.env.RATE_LIMIT_MAX_REQUESTS) {
      warnings.push('RATE_LIMIT_MAX_REQUESTS is not set (using default rate limits)');
    }
  } else {
    // Development: warn if no providers configured
    if (availableProviders.length === 0) {
      warnings.push('No AI provider API keys configured. Set at least one: GROQ_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY, or KIMI_API_KEY');
    } else {
      console.log(`✅ AI Providers configured: ${availableProviders.join(', ')}`);
    }
  }

  // Throw errors if any
  if (errors.length > 0) {
    console.error('❌ Environment configuration errors:');
    errors.forEach((error) => {
      console.error(`  - ${error}`);
    });
    throw new Error('Environment configuration errors detected');
  }

  // Display warnings
  if (warnings.length > 0) {
    console.warn('⚠️  Optional environment variable warnings:');
    warnings.forEach((warning) => {
      console.warn(`  - ${warning}`);
    });
    console.warn('');
  }
}

/**
 * Get validated environment configuration
 */
export function getEnvConfig() {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    // AI Provider API Keys
    groqApiKey: process.env.GROQ_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
    kimiApiKey: process.env.KIMI_API_KEY,
    // Video Generation API
    videoGenerationProvider: process.env.VIDEO_GENERATION_PROVIDER,
    videoGenerationApiKey: process.env.VIDEO_GENERATION_API_KEY,
    videoAvatarId: process.env.VIDEO_AVATAR_ID,
    videoVoiceId: process.env.VIDEO_VOICE_ID,
    // Cloudflare R2
    cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    cloudflareR2AccessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    cloudflareR2SecretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    cloudflareR2BucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    cloudflareR2PublicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL,
    port: parseInt(process.env.PORT || '3000', 10),
    logLevel: process.env.LOG_LEVEL || 'info',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    isTest: process.env.NODE_ENV === 'test',
  };
}

/**
 * Display environment configuration (without secrets)
 */
export function displayEnvConfig() {
  const config = getEnvConfig();

  console.log('📋 Environment Configuration:');
  console.log(`  Environment: ${config.nodeEnv}`);
  console.log(`  Port: ${config.port}`);
  console.log(`  Log Level: ${config.logLevel}`);
  console.log(`  Database: ${config.databaseUrl ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`  Redis: ${config.redisUrl ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`  JWT Secret: ${config.jwtSecret ? `✅ Set (${config.jwtSecret.length} chars)` : '❌ Not set'}`);
  console.log(`  AI Providers:`);
  console.log(`    Groq: ${config.groqApiKey ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`    OpenAI: ${config.openaiApiKey ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`    Gemini: ${config.geminiApiKey ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`    Kimi: ${config.kimiApiKey ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`  Video Generation:`);
  console.log(`    Provider: ${config.videoGenerationProvider || 'Not set'}`);
  console.log(`    API Key: ${config.videoGenerationApiKey ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`  Cloudflare R2:`);
  console.log(`    Account ID: ${config.cloudflareAccountId ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`    Bucket: ${config.cloudflareR2BucketName || 'Not set'}`);
  console.log(`    Public URL: ${config.cloudflareR2PublicUrl ? '✅ Configured' : '❌ Not configured'}`);
  console.log('');
}

/**
 * Validate JWT secret strength
 */
export function validateJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not set in environment variables');
  }

  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long for security');
  }

  // Check for weak secrets in production
  if (process.env.NODE_ENV === 'production') {
    const weakSecrets = [
      'secret',
      'password',
      'test',
      'example',
      '12345',
      'changeme',
      'default',
    ];

    const lowerSecret = secret.toLowerCase();
    const isWeak = weakSecrets.some((weak) => lowerSecret.includes(weak));

    if (isWeak) {
      throw new Error(
        'JWT_SECRET appears to be a weak or default value. Use a strong, random secret in production.'
      );
    }
  }

  return true;
}

export default {
  validateEnv,
  checkOptionalEnv,
  getEnvConfig,
  displayEnvConfig,
  validateJwtSecret,
};
