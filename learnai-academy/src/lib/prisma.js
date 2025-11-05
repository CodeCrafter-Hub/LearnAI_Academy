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
        // During build (when DATABASE_URL is not set), create a safe no-op mock
        // This prevents build errors while still allowing the route to be defined
        prisma = new Proxy({}, {
          get(target, prop) {
            // Return a no-op function that resolves to empty/null
            if (typeof prop === 'string') {
              return new Proxy({}, {
                get() {
                  return () => Promise.resolve(null);
                },
                apply() {
                  return Promise.resolve(null);
                },
              });
            }
            return undefined;
          },
        });
      }
    } catch (error) {
      // If Prisma fails to initialize (e.g., during build), create a safe no-op mock
      prisma = new Proxy({}, {
        get(target, prop) {
          if (typeof prop === 'string') {
            return new Proxy({}, {
              get() {
                return () => Promise.resolve(null);
              },
            });
          }
          return undefined;
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
