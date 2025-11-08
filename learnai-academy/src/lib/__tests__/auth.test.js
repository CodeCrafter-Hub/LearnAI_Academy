import { generateToken, verifyToken, requireAuth } from '../auth';
import jwt from 'jsonwebtoken';

describe('Auth Library', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = { userId: '123', email: 'test@example.com', role: 'STUDENT' };
      const token = generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    it('should include correct payload in token', () => {
      const payload = { userId: '123', email: 'test@example.com', role: 'PARENT' };
      const token = generateToken(payload);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe('123');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('PARENT');
    });

    it('should set expiration time', () => {
      const payload = { userId: '123', email: 'test@example.com' };
      const token = generateToken(payload);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
    });

    it('should throw error if JWT_SECRET is too short', () => {
      const originalSecret = process.env.JWT_SECRET;
      process.env.JWT_SECRET = 'short';

      expect(() => {
        generateToken({ userId: '123' });
      }).toThrow('JWT_SECRET must be at least 32 characters');

      process.env.JWT_SECRET = originalSecret;
    });

    it('should throw error if JWT_SECRET is missing', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      expect(() => {
        generateToken({ userId: '123' });
      }).toThrow('JWT_SECRET must be at least 32 characters');

      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token from Authorization header', () => {
      const payload = { userId: '123', email: 'test@example.com', role: 'STUDENT' };
      const token = generateToken(payload);

      const mockRequest = {
        headers: {
          get: jest.fn((name) => {
            if (name === 'authorization') {
              return `Bearer ${token}`;
            }
            return null;
          }),
        },
      };

      const decoded = verifyToken(mockRequest);
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe('123');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('STUDENT');
    });

    it('should return null for invalid token', () => {
      const mockRequest = {
        headers: {
          get: jest.fn(() => 'Bearer invalid-token'),
        },
      };

      const decoded = verifyToken(mockRequest);
      expect(decoded).toBeNull();
    });

    it('should return null for expired token', () => {
      const payload = { userId: '123', email: 'test@example.com' };
      const expiredToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '-1s' });

      const mockRequest = {
        headers: {
          get: jest.fn(() => `Bearer ${expiredToken}`),
        },
      };

      const decoded = verifyToken(mockRequest);
      expect(decoded).toBeNull();
    });

    it('should return null when Authorization header is missing', () => {
      const mockRequest = {
        headers: {
          get: jest.fn(() => null),
        },
      };

      const decoded = verifyToken(mockRequest);
      expect(decoded).toBeNull();
    });

    it('should return null when Authorization header does not start with Bearer', () => {
      const mockRequest = {
        headers: {
          get: jest.fn(() => 'Basic sometoken'),
        },
      };

      const decoded = verifyToken(mockRequest);
      expect(decoded).toBeNull();
    });

    it('should verify token with different payload types', () => {
      const payload = { 
        userId: '456', 
        email: 'admin@example.com', 
        role: 'ADMIN',
        customField: 'custom-value'
      };
      const token = generateToken(payload);

      const mockRequest = {
        headers: {
          get: jest.fn(() => `Bearer ${token}`),
        },
      };

      const decoded = verifyToken(mockRequest);
      expect(decoded.userId).toBe('456');
      expect(decoded.role).toBe('ADMIN');
      expect(decoded.customField).toBe('custom-value');
    });
  });

  describe('requireAuth', () => {
    it('should return user data for valid token', async () => {
      const payload = { userId: '123', email: 'test@example.com', role: 'STUDENT' };
      const token = generateToken(payload);

      const mockRequest = {
        headers: {
          get: jest.fn(() => `Bearer ${token}`),
        },
      };

      const user = await requireAuth(mockRequest);
      expect(user).toBeDefined();
      expect(user.userId).toBe('123');
      expect(user.email).toBe('test@example.com');
    });

    it('should throw error for missing token', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn(() => null),
        },
      };

      await expect(requireAuth(mockRequest)).rejects.toThrow('Authentication required');
    });

    it('should throw error for invalid token', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn(() => 'Bearer invalid-token'),
        },
      };

      await expect(requireAuth(mockRequest)).rejects.toThrow('Authentication required');
    });

    it('should throw error for expired token', async () => {
      const payload = { userId: '123', email: 'test@example.com' };
      const expiredToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '-1s' });

      const mockRequest = {
        headers: {
          get: jest.fn(() => `Bearer ${expiredToken}`),
        },
      };

      await expect(requireAuth(mockRequest)).rejects.toThrow('Authentication required');
    });
  });

  describe('Token Security', () => {
    it('should not be vulnerable to token tampering', () => {
      const payload = { userId: '123', email: 'test@example.com', role: 'STUDENT' };
      const token = generateToken(payload);

      // Try to tamper with the token
      const parts = token.split('.');
      const tamperedPayload = Buffer.from(
        JSON.stringify({ userId: '999', email: 'hacker@example.com', role: 'ADMIN' })
      ).toString('base64');
      const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

      const mockRequest = {
        headers: {
          get: jest.fn(() => `Bearer ${tamperedToken}`),
        },
      };

      const decoded = verifyToken(mockRequest);
      expect(decoded).toBeNull(); // Should reject tampered token
    });

    it('should use different signatures for different payloads', () => {
      const payload1 = { userId: '123', email: 'test1@example.com' };
      const payload2 = { userId: '456', email: 'test2@example.com' };

      const token1 = generateToken(payload1);
      const token2 = generateToken(payload2);

      expect(token1).not.toBe(token2);

      const signature1 = token1.split('.')[2];
      const signature2 = token2.split('.')[2];

      expect(signature1).not.toBe(signature2);
    });
  });
});
