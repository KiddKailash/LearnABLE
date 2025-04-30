/**
 * @fileoverview Centralized API service that combines all individual API services.
 * This allows for backwards compatibility with existing code and provides a single import point.
 */

import httpClient from './httpClient';
import authApi from './authApi';
import classesApi from './classesApi';
import studentsApi from './studentsApi';
import nccdReportsApi from './nccdReportsApi';
import assessmentsApi from './assessmentsApi';
import studentGradesApi from './studentGradesApi';
import attendanceApi from './attendanceApi';
import learningMaterialsApi from './learningMaterialsApi';
import aiApi from './aiApi';
import accountApi from './accountApi';

/**
 * Creates headers with authentication token if available
 * @returns {Object} Headers object with content type and auth token if available
 */
const getHeaders = (contentType = 'application/json') => {
  const headers = {
    'Content-Type': contentType,
  };
  
  const token = localStorage.getItem('access_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Handles API responses consistently
 * @param {Response} response - Fetch API response
 * @returns {Promise} Parsed response data or error
 */
const handleResponse = async (response) => {
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
    if (response.status === 401 && !window.location.pathname.includes('/login')) {
      // Attempt token refresh before redirecting
      try {
        await api.auth.refreshToken();
        // If refresh succeeds, retry the original request
        return api._retryRequest(response.url, response.method, response.body);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    throw error;
  }
  
  return data;
};

// Create wrapper methods for httpClient methods with token refresh capability
const wrapWithTokenRefresh = (method) => {
  return async (...args) => {
    try {
      return await method(...args);
    } catch (error) {
      if (error?.needsTokenRefresh) {
        // If token refresh is needed, try to refresh and retry
        return await authApi.handleTokenRefresh(error);
      }
      throw error;
    }
  };
};

// Combine all API services into a single object for backwards compatibility
const api = {
  // Base HTTP methods with token refresh capability
  get: wrapWithTokenRefresh(httpClient.get),
  post: wrapWithTokenRefresh(httpClient.post),
  put: wrapWithTokenRefresh(httpClient.put),
  patch: wrapWithTokenRefresh(httpClient.patch),
  delete: wrapWithTokenRefresh(httpClient.delete),

  // Domain-specific APIs
  auth: authApi,
  classes: classesApi,
  students: studentsApi,
  nccdReports: nccdReportsApi,
  assessments: assessmentsApi,
  studentGrades: studentGradesApi,
  attendance: attendanceApi,
  learningMaterials: learningMaterialsApi,
  ai: aiApi,
  account: accountApi
};

export default api; 