import { NextResponse } from 'next/server';
import { readinessCheck } from '@/services/health/healthCheck';

/**
 * Readiness Probe Endpoint
 *
 * Kubernetes/Docker readiness probe.
 * Returns 200 if the application is ready to handle requests.
 */

export async function GET() {
  try {
    const result = await readinessCheck();

    if (result.status === 'ready') {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 503 });
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 503 }
    );
  }
}
