/**
 * Client-side authentication utilities
 * Handles CSRF tokens and secure API requests
 */

/**
 * Get CSRF token from cookies
 */
export function getCSRFToken() {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf_token') {
      return value;
    }
  }
  return null;
}

/**
 * Store user data in sessionStorage (safer than localStorage for sensitive data)
 */
export function setUserData(user) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('user', JSON.stringify(user));
}

/**
 * Get user data from sessionStorage
 */
export function getUserData() {
  if (typeof window === 'undefined') return null;
  const userData = sessionStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
}

/**
 * Clear user data
 */
export function clearUserData() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('user');
}

/**
 * Make an authenticated API request with CSRF protection
 */
export async function authFetch(url, options = {}) {
  const csrfToken = getCSRFToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add CSRF token to headers for non-GET requests
  if (csrfToken && options.method && options.method !== 'GET') {
    headers['x-csrf-token'] = csrfToken;
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Important: send cookies with request
  });
}

/**
 * Login helper
 */
export async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (data.success) {
    // Store user data in sessionStorage
    setUserData(data.user);
  }

  return data;
}

/**
 * Register helper
 */
export async function register(userData) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (data.success) {
    // Store user data in sessionStorage
    setUserData(data.user);
  }

  return data;
}

/**
 * Logout helper
 */
export async function logout() {
  const csrfToken = getCSRFToken();

  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken && { 'x-csrf-token': csrfToken }),
    },
    credentials: 'include',
  });

  // Clear user data
  clearUserData();
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return getUserData() !== null;
}
