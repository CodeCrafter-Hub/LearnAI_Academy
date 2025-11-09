import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getClientIdentifier, rateLimit, addRateLimitHeaders } from '@/middleware/rateLimit';
import { logAuth, logError } from '@/lib/logger';
import { checkAccountLockout, recordFailedAttempt, clearFailedAttempts } from '@/lib/accountLockout';
import { auditAuth, getRequestMetadata } from '@/lib/auditLogger';
import { errorResponse, successResponse, validationErrorResponse, rateLimitErrorResponse } from '@/lib/errorHandler';

// Force dynamic rendering - uses database, cookies, and authentication
export const dynamic = 'force-dynamic';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
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
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePassword123!
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   description: JWT token (for backward compatibility)
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials or account locked
 *       429:
 *         description: Too many login attempts
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  const { ipAddress, userAgent } = getRequestMetadata(request);

  try {
    // Apply rate limiting (5 requests per minute for auth endpoints)
    const identifier = getClientIdentifier(request);
    const rateLimitResult = await rateLimit(request, identifier, 'auth');

    if (!rateLimitResult.allowed) {
      await auditAuth.login(null, identifier, ipAddress, userAgent, false, 'rate_limit_exceeded');
      return rateLimitErrorResponse(
        Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)
      );
    }

    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      logError('JWT_SECRET is not set in environment variables');
      return NextResponse.json(
        { 
          error: 'Server configuration error. Please contact support.',
          message: 'JWT_SECRET is not configured'
        },
        { status: 500 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      logError('Failed to parse request body', parseError);
      return NextResponse.json(
        { 
          error: 'Invalid request format',
          message: 'Request body must be valid JSON'
        },
        { status: 400 }
      );
    }

    let email, password;
    
    try {
      const validated = loginSchema.parse(body);
      email = validated.email;
      password = validated.password;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return validationErrorResponse(error);
      }
      logError('Validation error', error);
      throw error;
    }

    // Check account lockout before attempting login
    const lockoutStatus = await checkAccountLockout(email);
    if (lockoutStatus.locked) {
      await auditAuth.accountLocked(null, email, ipAddress, 'too_many_failed_attempts');
      return errorResponse(
        new Error(`Account locked. Please try again after ${Math.ceil(lockoutStatus.lockoutDuration / 60)} minutes.`),
        request
      );
    }

    // Find user
    let user;
    try {
      // Try to include students, but don't fail if Student model doesn't exist
      const userQuery = {
        where: { email: email.toLowerCase().trim() }, // Normalize email
      };
      
      // Only include students if Student model exists
      try {
        user = await prisma.user.findUnique({
          ...userQuery,
          include: {
            students: true,
          },
        });
      } catch (includeError) {
        // If students include fails, try without it
        console.log('Note: Student model may not exist, fetching user without students');
        user = await prisma.user.findUnique(userQuery);
        if (user) {
          user.students = []; // Set empty array for consistency
        }
      }
    } catch (dbError) {
      logError('Database error during login', dbError);
      console.error('Database error details:', dbError);
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Unable to verify credentials. Please try again later.'
        },
        { status: 500 }
      );
    }

    if (!user) {
      // Record failed attempt even if user doesn't exist (prevents email enumeration)
      await recordFailedAttempt(email);
      await auditAuth.login(null, email, ipAddress, userAgent, false, 'user_not_found');
      logAuth('login_attempt', email, false, { reason: 'user_not_found' });
      return errorResponse(
        new Error('Invalid email or password'),
        request
      );
    }

    // Verify password
    // Check password - database uses password_hash field
    const userPasswordHash = user.password_hash || user.passwordHash;
    if (!userPasswordHash) {
      // Record failed attempt
      const lockoutResult = await recordFailedAttempt(email);
      await auditAuth.login(user.id, email, ipAddress, userAgent, false, 'no_password_set');
      logError('Login attempt with no password hash', { userId: user.id, email });
      return NextResponse.json(
        { 
          error: 'Account configuration error',
          message: 'Account configuration error. Please contact support.'
        },
        { status: 500 }
      );
    }
    
    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, userPasswordHash);
    } catch (compareError) {
      logError('Password comparison error', compareError);
      return NextResponse.json(
        { 
          error: 'Authentication error',
          message: 'Unable to verify password. Please try again.'
        },
        { status: 500 }
      );
    }

    if (!isValidPassword) {
      // Record failed attempt
      const lockoutResult = await recordFailedAttempt(email);
      
      if (lockoutResult.locked) {
        await auditAuth.accountLocked(user.id, email, ipAddress, 'too_many_failed_attempts');
      }
      
      await auditAuth.login(user.id, email, ipAddress, userAgent, false, 'invalid_password');
      logAuth('login_attempt', user.id, false, { reason: 'invalid_password' });
      
      return errorResponse(
        new Error(lockoutResult.locked 
          ? `Account locked due to too many failed attempts. Please try again after ${Math.ceil(lockoutResult.lockoutDuration / 60)} minutes.`
          : `Invalid email or password. ${lockoutResult.remainingAttempts} attempts remaining.`),
        request
      );
    }

    // Clear failed attempts on successful login
    await clearFailedAttempts(email);

    // Update last login (if field exists in schema)
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          // Try to update lastLogin if field exists, otherwise just update updated_at
          updated_at: new Date(),
        },
      });
    } catch (updateError) {
      // Ignore if lastLogin field doesn't exist - not critical for login
      console.log('Note: Could not update lastLogin field (may not exist in schema)');
    }

    // Log successful authentication
    await auditAuth.login(user.id, email, ipAddress, userAgent, true);
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
        subscriptionTier: user.subscriptionTier || null, // Safe handling if field doesn't exist
        students: user.students && Array.isArray(user.students) ? user.students.map(s => ({
          id: s.id,
          firstName: s.firstName,
          lastName: s.lastName,
          gradeLevel: s.gradeLevel,
        })) : [],
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
    logError('Unexpected login error', error);
    console.error('Login error details:', error);
    
    // Return user-friendly error
    return NextResponse.json(
      { 
        error: 'Login failed',
        message: error.message || 'An unexpected error occurred. Please try again.'
      },
      { status: 500 }
    );
  }
}
