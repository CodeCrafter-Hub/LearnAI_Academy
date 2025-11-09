import { NextResponse } from 'next/server';
import { getCSRFToken } from '@/middleware/csrf';
import { successResponse } from '@/lib/errorHandler';

/**
 * GET /api/csrf-token
 * 
 * Returns CSRF token for client-side use
 * This endpoint is safe because it only returns the token,
 * which must still be validated on subsequent requests
 */
export async function GET() {
  try {
    const token = await getCSRFToken();
    
    return successResponse({
      token,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}

