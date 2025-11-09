import { NextResponse } from 'next/server';

// Force dynamic rendering - uses cookies
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    // Create success response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear the authentication cookie
    // CRITICAL: Must use same secure/sameSite settings as login
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
