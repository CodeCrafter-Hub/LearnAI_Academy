import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { logAuth, logError } from '@/lib/logger';

/**
 * Get Current User Endpoint
 *
 * Returns the authenticated user's data based on httpOnly cookie.
 * Replaces the need to store user data in localStorage.
 */

// Force dynamic rendering - uses cookies() for authentication
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Verify authentication via httpOnly cookie
    const tokenData = verifyToken(request);

    if (!tokenData) {
      return NextResponse.json(
        { error: 'Not authenticated', message: 'No authentication token provided' },
        { status: 401 }
      );
    }

    // Fetch user with related data
    // Note: Student model might not exist in database, so we'll try to include it but handle gracefully
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: tokenData.userId },
        include: {
          students: {
            include: {
              progress: {
                select: {
                  id: true,
                  topicId: true,
                  masteryLevel: true,
                },
                take: 5, // Limit to recent progress
              },
            },
          },
        },
      });
    } catch (prismaError) {
      // If Student model doesn't exist, fetch user without students
      if (prismaError.message?.includes('students') || prismaError.message?.includes('Unknown field')) {
        user = await prisma.user.findUnique({
          where: { id: tokenData.userId },
        });
        // Add empty students array for consistency
        if (user) {
          user.students = [];
        }
      } else {
        throw prismaError;
      }
    }

    if (!user) {
      logAuth('me_endpoint', tokenData.userId, false, { reason: 'user_not_found' });
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove sensitive data - database uses password_hash field
    const { password_hash, passwordHash, ...userData } = user;

    logAuth('me_endpoint', user.id, true, { role: user.role });

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    logError('Get current user error', error);

    // Handle specific error cases
    if (error.message?.includes('jwt expired')) {
      return NextResponse.json(
        { error: 'Session expired. Please login again.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to get user data' },
      { status: 500 }
    );
  }
}
