/**
 * @fileoverview Configuration and common utilities for API services
 */

// Use environment variable for backend URL or fallback to localhost for development
export const API_BASE_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:8000';

/**
 * Creates headers with authentication token if available
 * @returns {Object} Headers object with content type and auth token if available
 */
export const getHeaders = (contentType = 'application/json') => {
  const headers = {
    'Content-Type': contentType,
  };
  
  const token = localStorage.getItem('access_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Flag to prevent infinite token refresh loops
let isRefreshing = false;

/**
 * Handles API responses consistently
 * @param {Response} response - Fetch API response
 * @returns {Promise} Parsed response data or error
 */
export const handleResponse = async (response) => {
  // Special case for 204 No Content
  if (response.status === 204) {
    return { success: true };
  }

  // For responses with content
  const contentType = response.headers.get('content-type');
  let data;
  
  try {
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Handle non-JSON responses
      data = await response.text();
    }
  } catch (error) {
    // Handle parsing errors
    data = {
      message: "Failed to parse response from server",
      parseError: error.message
    };
  }
  
  if (!response.ok) {
    // Create standardized error object
    const error = {
      status: response.status,
      data: data
    };
    
    // Set message with priority chain
    if (data?.message) {
      error.message = data.message;
    } else if (data?.error) {
      error.message = data.error;
    } else if (data?.detail) {
      error.message = data.detail;
    } else if (typeof data === 'string') {
      error.message = data;
    } else {
      error.message = 'Something went wrong';
    }
    
    // Handle token expiration (401 Unauthorized)
    if (response.status === 401 && !window.location.pathname.includes('/login') && !isRefreshing) {
      // Mark for token refresh
      error.needsTokenRefresh = true;
      error.originalUrl = response.url;
      error.originalMethod = response.method;
      error.originalBody = response.body;
    }
    
    throw error;
  }
  
  return data;
}; 