import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

// Prevent Prisma from initializing during build time
let prisma;

if (typeof window === 'undefined') {
  // Server-side only
  if (globalForPrisma.prisma) {
    prisma = globalForPrisma.prisma;
  } else {
    try {
      // Only create Prisma client if DATABASE_URL is available
      if (process.env.DATABASE_URL) {
        prisma = new PrismaClient({
          log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        });
        globalForPrisma.prisma = prisma;
      } else {
        // During build, create a safe mock that won't throw
        prisma = new Proxy({}, {
          get() {
            // Return a function that throws only when called, not during property access
            return () => {
              throw new Error('Prisma client not initialized. DATABASE_URL is required.');
            };
          },
        });
      }
    } catch (error) {
      // If Prisma fails to initialize (e.g., during build), create a safe mock
      console.warn('Prisma initialization warning:', error.message);
      prisma = new Proxy({}, {
        get() {
          return () => {
            throw new Error('Prisma client not available during build.');
          };
        },
      });
    }
  }
} else {
  // Client-side - should never happen for API routes
  prisma = null;
}

export { prisma };
export default prisma;
