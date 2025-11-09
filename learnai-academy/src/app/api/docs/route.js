import swaggerJsdoc from 'swagger-jsdoc';
import { NextResponse } from 'next/server';

/**
 * OpenAPI/Swagger Documentation
 * 
 * Generates API documentation from JSDoc comments
 */

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LearnAI Academy API',
      version: '1.0.0',
      description: 'API documentation for LearnAI Academy - AI-powered K-12 tutoring platform',
      contact: {
        name: 'API Support',
        email: 'support@learnai.academy',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://learnai.academy',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'auth_token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['STUDENT', 'PARENT', 'TEACHER', 'ADMIN'] },
            subscriptionTier: { type: 'string', enum: ['FREE', 'PREMIUM', 'FAMILY', 'SCHOOL'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Student: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            gradeLevel: { type: 'integer', minimum: 0, maximum: 12 },
            birthDate: { type: 'string', format: 'date' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
          },
        },
      },
    },
    security: [
      { bearerAuth: [] },
      { cookieAuth: [] },
    ],
  },
  apis: [
    './src/app/api/**/*.js', // Path to API route files
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export async function GET() {
  return NextResponse.json(swaggerSpec, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

