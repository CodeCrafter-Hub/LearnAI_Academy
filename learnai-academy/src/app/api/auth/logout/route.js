import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth';

/**
 * Logout endpoint - clears authentication cookies
 */
export async function POST(request) {
  try {
    // Clear authentication cookies
    clearAuthCookies();

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
