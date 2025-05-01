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
    
    // Handle database constraint errors (often in the message when status is 500)
    if (response.status === 500 && error.message) {
      // Check for common database constraint errors
      if (error.message.includes('duplicate key value violates unique constraint')) {
        // Format: Check for 'teachers_teacher_user_id_key' format and extract info
        if (error.message.includes('teachers_teacher_user_id_key')) {
          error.message = 'Account creation failed: A teacher profile already exists for this user.';
          error.field = 'email'; // Indicate which field has the error
        } else if (error.message.includes('auth_user_email_key')) {
          error.message = 'A user with this email address already exists.';
          error.field = 'email';
        } else if (error.message.includes('auth_user_username_key')) {
          error.message = 'A user with this username already exists.';
          error.field = 'email'; // Since username is based on email
        }
      } else if (error.message.includes('ValidationError')) {
        // Handle Django ValidationError
        if (error.message.includes('already has a teacher profile')) {
          error.message = 'This user already has a teacher profile.';
          error.field = 'email';
        }
      }
    }
    
    // Handle Bad Request errors with teacher profile information
    if (response.status === 400 && error.data?.error) {
      if (error.data.error.includes('teacher profile')) {
        error.message = error.data.error;
        error.field = 'email';
      } else if (error.data.error.includes('email already exists')) {
        error.message = error.data.error;
        error.field = 'email';
      }
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