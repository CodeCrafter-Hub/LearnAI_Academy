import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  role: z.enum(['STUDENT', 'PARENT']).default('PARENT'),
  gradeLevel: z.number().min(0).max(12).optional(),
  birthDate: z.string().optional(),
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Must be at least 12 characters with uppercase, lowercase, number, and special character
 *                 example: SecurePassword123!
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               role:
 *                 type: string
 *                 enum: [STUDENT, PARENT]
 *                 default: PARENT
 *               gradeLevel:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 12
 *                 example: 5
 *               birthDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or user already exists
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         description: Too many registration attempts
 *         $ref: '#/components/responses/RateLimitError'
 */

export async function POST(request) {
  try {
    // Rate limiting: 3 registration attempts per hour per IP
    const { rateLimitMiddleware } = await import('@/middleware/rateLimit');
    const rateLimitResponse = await rateLimitMiddleware(request, 3, 3600);
    if (rateLimitResponse) {
      return rateLimitResponse; // Return rate limit error
    }

    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash,
        role: validatedData.role,
      },
    });

    // Create student profile if registering as student
    if (validatedData.role === 'STUDENT' && validatedData.gradeLevel !== undefined) {
      await prisma.student.create({
        data: {
          userId: user.id,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          gradeLevel: validatedData.gradeLevel,
          birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : null,
        },
      });
    }
    // Note: For PARENT role, the User record itself is sufficient
    // Parent-student relationships are established through Student.parentId

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      token, // Still return token for backward compatibility during migration
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });

    // Set httpOnly cookie (secure method)
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: error.errors,
          message: error.errors[0]?.message || 'Validation failed'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
