import { NextResponse } from 'next/server';
import { performHealthCheck } from '@/services/health/healthCheck';

/**
 * Health Check Endpoint
 *
 * Returns the health status of the application and all dependencies.
 * Used by monitoring tools and load balancers.
 */

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('detailed') === 'true';

    const health = await performHealthCheck(detailed);

    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: {
          message: 'Health check failed',
          details: error.message,
        },
      },
      { status: 503 }
    );
  }
}
