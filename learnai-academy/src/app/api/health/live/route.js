import { NextResponse } from 'next/server';
import { livenessCheck } from '@/services/health/healthCheck';

/**
 * Liveness Probe Endpoint
 *
 * Kubernetes/Docker liveness probe.
 * Returns 200 if the application process is running.
 */

export async function GET() {
  try {
    const result = await livenessCheck();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'dead',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 503 }
    );
  }
}
