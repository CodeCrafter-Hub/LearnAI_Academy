import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth, AuthProvider } from '@/hooks/useAuth';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: '/',
  }),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('useAuth Hook', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

  describe('Initialization', () => {
    it('should initialize with loading state', () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
    });

    it('should check authentication on mount', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: mockUser }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should handle unauthenticated state on mount', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
    });
  });

  describe('login', () => {
    it('should successfully login user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      // Mock initial auth check (unauthenticated)
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock login success
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: mockUser }),
      });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      });
    });

    it('should handle login failure', async () => {
      // Mock initial auth check (unauthenticated)
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock login failure
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid credentials' }),
      });

      await expect(
        act(async () => {
          await result.current.login('test@example.com', 'wrongpassword');
        })
      ).rejects.toThrow('Invalid credentials');

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
    });

    it('should send credentials with login request', async () => {
      // Mock initial auth check
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock login
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: {} }),
      });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      const loginCall = global.fetch.mock.calls.find(call =>
        call[0] === '/api/auth/login'
      );

      expect(loginCall[1].credentials).toBe('include');
    });
  });

  describe('register', () => {
    it('should successfully register user', async () => {
      const mockUser = {
        id: '1',
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
      };

      // Mock initial auth check
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock register success
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: mockUser }),
      });

      let registerResult;
      await act(async () => {
        registerResult = await result.current.register(
          'newuser@example.com',
          'password123',
          'New',
          'User',
          'PARENT',
          5
        );
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(registerResult.user).toEqual(mockUser);
    });

    it('should handle registration failure', async () => {
      // Mock initial auth check
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock register failure
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Email already exists' }),
      });

      await expect(
        act(async () => {
          await result.current.register(
            'existing@example.com',
            'password123',
            'Test',
            'User',
            'PARENT',
            5
          );
        })
      ).rejects.toThrow('Email already exists');

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
      };

      // Mock initial auth check (authenticated)
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: mockUser }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Mock logout success
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    });

    it('should clear user state even if logout API fails', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
      };

      // Mock initial auth check (authenticated)
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: mockUser }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Mock logout failure
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        await result.current.logout();
      });

      // Should still clear state locally
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
    });
  });

  describe('refreshUser', () => {
    it('should refresh user data from server', async () => {
      const initialUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
      };

      const updatedUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Updated',
        lastName: 'Name',
      };

      // Mock initial auth check
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: initialUser }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user?.firstName).toBe('Test');
      });

      // Mock refresh with updated data
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: updatedUser }),
      });

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(result.current.user?.firstName).toBe('Updated');
      expect(result.current.user?.lastName).toBe('Name');
    });

    it('should handle refresh failure gracefully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
      };

      // Mock initial auth check
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: mockUser }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Mock refresh failure
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await act(async () => {
        await result.current.refreshUser();
      });

      // Should maintain current authenticated state if still has user
      expect(result.current.user).toEqual(mockUser);
    });
  });

  describe('checkAuth', () => {
    it('should verify authentication status', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
      };

      // Mock initial auth check (unauthenticated)
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);

      // Mock checkAuth success
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: mockUser }),
      });

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });
  });

  describe('Error handling', () => {
    it('should throw error when useAuth is used outside AuthProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      console.error = originalError;
    });

    it('should handle network errors gracefully', async () => {
      // Mock initial auth check failure
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
    });
  });

  describe('Security', () => {
    it('should use httpOnly cookies (credentials: include)', async () => {
      // Mock initial auth check
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // All fetch calls should include credentials
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/me', {
        credentials: 'include',
      });
    });

    it('should not store tokens in localStorage', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
      };

      // Mock login
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: mockUser }),
      });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      // Verify no localStorage usage
      expect(localStorage.getItem).not.toHaveBeenCalled();
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });
});
