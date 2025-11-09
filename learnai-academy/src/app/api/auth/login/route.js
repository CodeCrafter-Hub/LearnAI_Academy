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
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    let email, password;
    
    try {
      const validated = loginSchema.parse(body);
      email = validated.email;
      password = validated.password;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return validationErrorResponse(error);
      }
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
      user = await prisma.user.findUnique({
        where: { email },
        include: {
          students: true,
        },
      });
    } catch (dbError) {
      logError('Database error during login', dbError);
      return errorResponse(dbError, request);
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
      return errorResponse(
        new Error('Account configuration error. Please contact support.'),
        request
      );
    }
    
    const isValidPassword = await bcrypt.compare(password, userPasswordHash);

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

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

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
    const response = successResponse({
      token, // Still return token for backward compatibility during migration
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        subscriptionTier: user.subscriptionTier || null, // Safe handling if field doesn't exist
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
    return errorResponse(error, request);
  }
}
