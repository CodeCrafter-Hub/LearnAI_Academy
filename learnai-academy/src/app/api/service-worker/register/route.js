import { NextResponse } from 'next/server';

/**
 * GET /api/service-worker/register
 * Endpoint to trigger service worker registration
 * Can be called from client to ensure SW is registered
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Service Worker registration endpoint',
    swPath: '/sw.js',
  });
}

