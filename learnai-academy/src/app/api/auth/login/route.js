import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getClientIdentifier, rateLimit, addRateLimitHeaders } from '@/middleware/rateLimit';
import { logAuth, logError } from '@/lib/logger';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request) {
  try {
    // Apply rate limiting (5 requests per minute for auth endpoints)
    const identifier = getClientIdentifier(request);
    const rateLimitResult = await rateLimit(request, identifier, 'auth');

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Too many login attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toString(),
            'Retry-After': Math.ceil(
              (rateLimitResult.resetAt - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      logError('JWT_SECRET is not set in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Find user
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email },
        include: {
          students: true,
        },
      });
    } catch (dbError) {
      logError('Database error during login', dbError);
      // Check if it's a connection error
      if (dbError.message?.includes('connection') || dbError.message?.includes('timeout')) {
        return NextResponse.json(
          { error: 'Database connection error. Please try again later.' },
          { status: 503 }
        );
      }
      // Check if tables don't exist
      if (dbError.message?.includes('does not exist') || dbError.message?.includes('relation')) {
        return NextResponse.json(
          { error: 'Database not initialized. Please run migrations first.' },
          { status: 500 }
        );
      }
      throw dbError;
    }

    if (!user) {
      logAuth('login_attempt', email, false, { reason: 'user_not_found' });
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      logAuth('login_attempt', user.id, false, { reason: 'invalid_password' });
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Log successful authentication
    logAuth('login_success', user.id, true, { role: user.role });

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
        subscriptionTier: user.subscriptionTier,
        students: user.students.map(s => ({
          id: s.id,
          firstName: s.firstName,
          lastName: s.lastName,
          gradeLevel: s.gradeLevel,
        })),
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

    // Add rate limit headers
    return addRateLimitHeaders(response, {
      'X-RateLimit-Limit': rateLimitResult.limit.toString(),
      'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      'X-RateLimit-Reset': rateLimitResult.resetAt.toString(),
    });
  } catch (error) {
    logError('Login error', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
