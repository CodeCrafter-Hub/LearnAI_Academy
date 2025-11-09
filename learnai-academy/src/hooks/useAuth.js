'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Authentication Hook
 *
 * Centralized authentication state management using httpOnly cookies.
 * Replaces localStorage-based authentication.
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Fetch current user on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include', // Important: include cookies
      });

      if (response.ok) {
        // Safe JSON parsing
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Invalid response format');
        }
        const text = await response.text();
        if (!text) {
          throw new Error('Empty response from server');
        }
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error('Invalid JSON response from server');
        }
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Important: include cookies
    });

    // Safe JSON parsing
    const contentType = response.headers.get('content-type');
    const text = await response.text();
    
    if (!response.ok) {
      // Handle error responses
      let errorData;
      if (contentType && contentType.includes('application/json') && text) {
        try {
          errorData = JSON.parse(text);
        } catch (e) {
          // Not JSON, use text as error message
          throw new Error(text || 'Login failed');
        }
      } else {
        throw new Error(text || 'Login failed');
      }
      
      const error = new Error(errorData.message || errorData.error || 'Login failed');
      if (errorData.details) {
        error.details = errorData.details;
      }
      throw error;
    }

    // Parse successful response
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Invalid response format from server');
    }
    
    if (!text) {
      throw new Error('Empty response from server');
    }
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error('Invalid JSON response from server');
    }

    // Handle successResponse wrapper (data.data) or direct response (data)
    const responseData = data.data || data;

    // Set user data from response
    setUser(responseData.user);
    setIsAuthenticated(true);

    return responseData;
  };

  const register = async (userData) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
      credentials: 'include', // Important: include cookies
    });

    // Safe JSON parsing
    const contentType = response.headers.get('content-type');
    const text = await response.text();
    
    if (!response.ok) {
      // Handle error responses
      let errorData;
      if (contentType && contentType.includes('application/json') && text) {
        try {
          errorData = JSON.parse(text);
        } catch (e) {
          // Not JSON, use text as error message
          throw new Error(text || 'Registration failed');
        }
      } else {
        throw new Error(text || 'Registration failed');
      }
      
      const error = new Error(errorData.message || errorData.error || 'Registration failed');
      if (errorData.details) {
        error.details = errorData.details;
      }
      throw error;
    }

    // Parse successful response
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Invalid response format from server');
    }
    
    if (!text) {
      throw new Error('Empty response from server');
    }
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error('Invalid JSON response from server');
    }

    // Handle successResponse wrapper (data.data) or direct response (data)
    const responseData = data.data || data;

    // Set user data from response
    setUser(responseData.user);
    setIsAuthenticated(true);

    return responseData;
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state regardless of API response
      setUser(null);
      setIsAuthenticated(false);
      router.push('/login');
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Higher-order component to protect routes
 */
export function withAuth(Component) {
  return function ProtectedRoute(props) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}
