/**
 * Utility functions for safe API response handling
 */

/**
 * Safely parse JSON from a Response object
 * @param {Response} response - The fetch Response object
 * @returns {Promise<Object|Array|null>} - Parsed JSON data or null if empty/invalid
 */
export async function safeJsonParse(response) {
  try {
    // Check if response has content
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return null;
    }

    // Get text content
    const text = await response.text();
    
    // Return null if empty
    if (!text || text.trim().length === 0) {
      return null;
    }

    // Try to parse JSON
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError, 'Response text:', text.substring(0, 100));
      return null;
    }
  } catch (error) {
    console.error('Error reading response:', error);
    return null;
  }
}

/**
 * Safely fetch and parse JSON from an API endpoint
 * @param {string} url - The API endpoint URL
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<{data: any, error: string|null, ok: boolean}>}
 */
export async function safeFetch(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: options.credentials || 'include',
    });

    const data = await safeJsonParse(response);

    return {
      data,
      error: response.ok ? null : (data?.error || data?.message || `HTTP ${response.status}`),
      ok: response.ok,
      status: response.status,
    };
  } catch (error) {
    console.error('Fetch error:', error);
    return {
      data: null,
      error: error.message || 'Network error',
      ok: false,
      status: 0,
    };
  }
}

