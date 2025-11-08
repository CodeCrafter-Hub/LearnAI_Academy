import { rateLimit, getClientIdentifier, RATE_LIMITS } from '../rateLimit';

// Mock the cache service
jest.mock('../../services/cache/cacheService.js', () => ({
  cacheService: {
    checkRateLimit: jest.fn(),
  },
}));

import { cacheService } from '../../services/cache/cacheService.js';

describe('Rate Limiting Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getClientIdentifier', () => {
    it('should return user ID for authenticated users', () => {
      const mockRequest = {
        headers: {
          get: jest.fn(() => null),
        },
      };
      const user = { userId: '123' };

      const identifier = getClientIdentifier(mockRequest, user);
      expect(identifier).toBe('user:123');
    });

    it('should return IP from x-forwarded-for header', () => {
      const mockRequest = {
        headers: {
          get: jest.fn((header) => {
            if (header === 'x-forwarded-for') {
              return '192.168.1.1, 10.0.0.1';
            }
            return null;
          }),
        },
      };

      const identifier = getClientIdentifier(mockRequest);
      expect(identifier).toBe('ip:192.168.1.1');
    });

    it('should return IP from x-real-ip header if x-forwarded-for is not present', () => {
      const mockRequest = {
        headers: {
          get: jest.fn((header) => {
            if (header === 'x-real-ip') {
              return '192.168.1.2';
            }
            return null;
          }),
        },
      };

      const identifier = getClientIdentifier(mockRequest);
      expect(identifier).toBe('ip:192.168.1.2');
    });

    it('should return IP from cf-connecting-ip header', () => {
      const mockRequest = {
        headers: {
          get: jest.fn((header) => {
            if (header === 'cf-connecting-ip') {
              return '192.168.1.3';
            }
            return null;
          }),
        },
      };

      const identifier = getClientIdentifier(mockRequest);
      expect(identifier).toBe('ip:192.168.1.3');
    });

    it('should return "ip:unknown" if no IP headers are present', () => {
      const mockRequest = {
        headers: {
          get: jest.fn(() => null),
        },
      };

      const identifier = getClientIdentifier(mockRequest);
      expect(identifier).toBe('ip:unknown');
    });
  });

  describe('rateLimit', () => {
    it('should allow request within rate limit', async () => {
      cacheService.checkRateLimit.mockResolvedValue({
        allowed: true,
        current: 3,
        limit: 5,
      });

      const mockRequest = {
        headers: {
          get: jest.fn(() => null),
        },
      };

      const result = await rateLimit(mockRequest, 'user:123', 'auth');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
      expect(result.limit).toBe(5);
      expect(cacheService.checkRateLimit).toHaveBeenCalledWith(
        'ratelimit:auth:user:123',
        RATE_LIMITS.auth.maxRequests,
        RATE_LIMITS.auth.windowSeconds
      );
    });

    it('should block request exceeding rate limit', async () => {
      cacheService.checkRateLimit.mockResolvedValue({
        allowed: false,
        current: 6,
        limit: 5,
      });

      const mockRequest = {
        headers: {
          get: jest.fn(() => null),
        },
      };

      const result = await rateLimit(mockRequest, 'user:123', 'auth');

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.current).toBe(6);
    });

    it('should use correct limits for different endpoint types', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn(() => null),
        },
      };

      // Auth endpoints
      await rateLimit(mockRequest, 'user:123', 'auth');
      expect(cacheService.checkRateLimit).toHaveBeenCalledWith(
        expect.any(String),
        5, // auth limit
        60
      );

      // AI endpoints
      await rateLimit(mockRequest, 'user:123', 'ai');
      expect(cacheService.checkRateLimit).toHaveBeenCalledWith(
        expect.any(String),
        20, // ai limit
        60
      );

      // General API
      await rateLimit(mockRequest, 'user:123', 'api');
      expect(cacheService.checkRateLimit).toHaveBeenCalledWith(
        expect.any(String),
        100, // api limit
        60
      );
    });

    it('should fail open if cache service errors', async () => {
      cacheService.checkRateLimit.mockRejectedValue(new Error('Redis connection failed'));

      const mockRequest = {
        headers: {
          get: jest.fn(() => null),
        },
      };

      const result = await rateLimit(mockRequest, 'user:123', 'auth');

      expect(result.allowed).toBe(true); // Graceful degradation
      expect(result.remaining).toBe(100);
    });

    it('should set correct resetAt timestamp', async () => {
      cacheService.checkRateLimit.mockResolvedValue({
        allowed: true,
        current: 1,
        limit: 5,
      });

      const mockRequest = {
        headers: {
          get: jest.fn(() => null),
        },
      };

      const before = Date.now();
      const result = await rateLimit(mockRequest, 'user:123', 'auth');
      const after = Date.now();

      expect(result.resetAt).toBeGreaterThan(before);
      expect(result.resetAt).toBeLessThan(after + 61000); // 60 seconds window + 1 sec buffer
    });
  });

  describe('RATE_LIMITS configuration', () => {
    it('should have correct auth endpoint limits', () => {
      expect(RATE_LIMITS.auth).toEqual({
        maxRequests: 5,
        windowSeconds: 60,
      });
    });

    it('should have correct AI endpoint limits', () => {
      expect(RATE_LIMITS.ai).toEqual({
        maxRequests: 20,
        windowSeconds: 60,
      });
    });

    it('should have correct API endpoint limits', () => {
      expect(RATE_LIMITS.api).toEqual({
        maxRequests: 100,
        windowSeconds: 60,
      });
    });

    it('should have correct assessment endpoint limits', () => {
      expect(RATE_LIMITS.assessment).toEqual({
        maxRequests: 10,
        windowSeconds: 60,
      });
    });
  });
});
