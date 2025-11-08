import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Create success response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear the authentication cookie
    response.cookies.delete('auth_token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
