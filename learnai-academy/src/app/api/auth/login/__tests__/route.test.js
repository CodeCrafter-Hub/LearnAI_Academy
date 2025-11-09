import { POST } from '../route.js';
import prisma from '@/lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getClientIdentifier, rateLimit } from '@/middleware/rateLimit.js';
import { logAuth, logError } from '@/lib/logger.js';

jest.mock('@/lib/prisma.js');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('@/middleware/rateLimit.js');
jest.mock('@/lib/logger.js');

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-key-minimum-32-characters-long';
    process.env.JWT_EXPIRES_IN = '7d';
    rateLimit.mockResolvedValue({ allowed: true });
    getClientIdentifier.mockReturnValue('ip:127.0.0.1');
  });

  it('should login successfully with valid credentials', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      role: 'STUDENT',
      students: [{ id: 'student-1' }],
    };

    prisma.user.findUnique.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    prisma.user.update.mockResolvedValue(mockUser);
    jwt.sign.mockReturnValue('mock-jwt-token');

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user).toBeDefined();
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
    expect(jwt.sign).toHaveBeenCalled();
  });

  it('should reject invalid email', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'wrong@example.com',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBeDefined();
    expect(logAuth).toHaveBeenCalledWith(
      'login_attempt',
      'wrong@example.com',
      false,
      expect.objectContaining({ reason: 'user_not_found' })
    );
  });

  it('should reject invalid password', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
    };

    prisma.user.findUnique.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(false);

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBeDefined();
    expect(logAuth).toHaveBeenCalledWith(
      'login_attempt',
      'user-1',
      false,
      expect.objectContaining({ reason: 'invalid_password' })
    );
  });

  it('should enforce rate limiting', async () => {
    rateLimit.mockResolvedValue({
      allowed: false,
      resetAt: Date.now() + 60000,
      limit: 5,
      current: 5,
      remaining: 0,
    });

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toContain('Too many login attempts');
  });

  it('should validate email format', async () => {
    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should handle missing JWT_SECRET', async () => {
    delete process.env.JWT_SECRET;

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
    expect(logError).toHaveBeenCalled();
  });

  it('should handle database errors', async () => {
    prisma.user.findUnique.mockRejectedValue(new Error('Database connection error'));

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toContain('Database connection error');
  });
});

