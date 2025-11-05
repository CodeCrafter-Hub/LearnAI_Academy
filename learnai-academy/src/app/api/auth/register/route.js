import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  role: z.enum(['STUDENT', 'PARENT']).default('PARENT'),
  gradeLevel: z.number().min(0).max(12).optional(),
  birthDate: z.string().optional(),
});

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

    // Generate JWT token and CSRF token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Import auth utilities
    const { setAuthCookies, generateCSRFToken } = await import('@/lib/auth');
    const csrfToken = generateCSRFToken();

    // Set secure httpOnly cookies
    setAuthCookies(token, csrfToken);

    return NextResponse.json({
      success: true,
      csrfToken, // Send CSRF token to client
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
