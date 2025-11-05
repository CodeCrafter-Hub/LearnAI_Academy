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
        const noOpQuery = () => Promise.resolve([]);
        const noOpFindUnique = () => Promise.resolve(null);
        const noOpFindMany = () => Promise.resolve([]);
        const noOpFindFirst = () => Promise.resolve(null);
        const noOpCreate = () => Promise.resolve({});
        const noOpUpdate = () => Promise.resolve({});
        const noOpDelete = () => Promise.resolve({});
        
        prisma = new Proxy({}, {
          get(target, prop) {
            // Return appropriate no-op methods based on the property accessed
            if (typeof prop === 'string') {
              // Return a model proxy that has all the common Prisma methods
              return new Proxy({}, {
                get(target, method) {
                  if (method === 'findUnique') return noOpFindUnique;
                  if (method === 'findMany') return noOpFindMany;
                  if (method === 'findFirst') return noOpFindFirst;
                  if (method === 'create') return noOpCreate;
                  if (method === 'update') return noOpUpdate;
                  if (method === 'delete') return noOpDelete;
                  if (method === 'count') return () => Promise.resolve(0);
                  if (method === 'upsert') return () => Promise.resolve({});
                  // For any other method, return a no-op
                  return () => Promise.resolve(null);
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
