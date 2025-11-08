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

  // External APIs (Optional in development)
  GROQ_API_KEY: z.string().optional().describe('Groq AI API key'),

  // Application Settings
  PORT: z.string().default('3000').transform(Number).pipe(z.number().int().positive()),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),

  // Security (Production only)
  ...(process.env.NODE_ENV === 'production' && {
    GROQ_API_KEY: z.string().min(1, 'GROQ_API_KEY is required in production'),
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

  // Check for production-recommended variables
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.SENTRY_DSN) {
      warnings.push('SENTRY_DSN is not set (recommended for error tracking in production)');
    }

    if (!process.env.RATE_LIMIT_MAX_REQUESTS) {
      warnings.push('RATE_LIMIT_MAX_REQUESTS is not set (using default rate limits)');
    }
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
    groqApiKey: process.env.GROQ_API_KEY,
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
  console.log(`  Groq API: ${config.groqApiKey ? '✅ Configured' : '⚠️  Not configured'}`);
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
