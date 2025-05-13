/**
 * @fileoverview Centralized API service that combines all individual API services
 * 
 * @module api
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
import unitPlansApi from './unitPlansApi';
import aiApi from './aiApi';
import accountApi from './accountApi';

/**
 * Creates headers with authentication token if available
 * 
 * @param {string} [contentType='application/json'] - The content type for the request
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
 * Retries a request with fresh authentication
 * 
 * @param {string} url - The original request URL
 * @param {string} method - The HTTP method
 * @param {Object|FormData} [body] - The request body
 * @returns {Promise<any>} Parsed response data
 */
const _retryRequest = async (url, method, body) => {
  const options = {
    method,
    headers: getHeaders(),
  };
  
  if (body) options.body = body;
  
  const response = await fetch(url, options);
  return handleResponse(response);
};

/**
 * Handles API responses consistently
 * 
 * @param {Response} response - Fetch API response
 * @returns {Promise<any>} Parsed response data
 * @throws {Error} If the response indicates an error
 */
const handleResponse = async (response) => {
  if (response.status === 204) {
    return { success: true };
  }

  const contentType = response.headers.get('content-type');
  let data;
  
  try {
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
  } catch (error) {
    data = {
      message: "Failed to parse response from server",
      parseError: error.message
    };
  }
  
  if (!response.ok) {
    const error = {
      status: response.status,
      data: data
    };
    
    error.message = data?.message || data?.error || data?.detail || 
                   (typeof data === 'string' ? data : 'Something went wrong');
    
    if (response.status === 401 && !window.location.pathname.includes('/login')) {
      try {
        await api.auth.refreshToken();
        return api._retryRequest(response.url, response.method, response.body);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    throw error;
  }
  
  return data;
};

/**
 * Wraps an HTTP method with token refresh capability
 * 
 * @param {Function} method - The HTTP method to wrap
 * @returns {Function} Wrapped method with token refresh handling
 */
const wrapWithTokenRefresh = (method) => {
  return async (...args) => {
    try {
      return await method(...args);
    } catch (error) {
      if (error?.needsTokenRefresh) {
        return await authApi.handleTokenRefresh(error);
      }
      throw error;
    }
  };
};

/**
 * Centralized API service combining all domain-specific APIs
 * @type {Object}
 */
const api = {
  // Base HTTP methods with token refresh capability
  get: wrapWithTokenRefresh(httpClient.get),
  post: wrapWithTokenRefresh(httpClient.post),
  put: wrapWithTokenRefresh(httpClient.put),
  patch: wrapWithTokenRefresh(httpClient.patch),
  delete: wrapWithTokenRefresh(httpClient.delete),
  
  // Internal retry method
  _retryRequest,

  // Domain-specific APIs
  auth: authApi,
  classes: classesApi,
  students: studentsApi,
  nccdReports: nccdReportsApi,
  assessments: assessmentsApi,
  studentGrades: studentGradesApi,
  attendance: attendanceApi,
  learningMaterials: learningMaterialsApi,
  unitPlans: unitPlansApi,
  ai: aiApi,
  account: accountApi
};

export default api; 