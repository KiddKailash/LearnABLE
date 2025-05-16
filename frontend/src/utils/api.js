/**
 * @file api.js
 * @description API client configuration and methods for making HTTP requests to the backend.
 * 
 */

import axios from 'axios';
import { getErrorInfo, logError } from './errorHandling';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Add authentication token to request headers if available
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token refresh on 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the access token
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/token/refresh/`,
          { refresh: refreshToken }
        );

        // Store new access token and retry original request
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Clear tokens and redirect to login on refresh failure
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Log error and enhance with user-friendly information
    logError(error, {
      url: originalRequest.url,
      method: originalRequest.method,
      data: originalRequest.data,
    });

    const errorInfo = getErrorInfo(error);
    error.userFriendlyInfo = errorInfo;

    return Promise.reject(error);
  }
);

/**
 * API client with methods for making HTTP requests
 * @namespace apiClient
 */
export const apiClient = {
  /**
   * Makes a GET request to the specified URL
   * @param {string} url - The endpoint URL
   * @param {Object} config - Additional axios configuration
   * @returns {Promise<any>} The response data
   */
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Makes a POST request to the specified URL
   * @param {string} url - The endpoint URL
   * @param {Object} data - The request body
   * @param {Object} config - Additional axios configuration
   * @returns {Promise<any>} The response data
   */
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Makes a PUT request to the specified URL
   * @param {string} url - The endpoint URL
   * @param {Object} data - The request body
   * @param {Object} config - Additional axios configuration
   * @returns {Promise<any>} The response data
   */
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Makes a PATCH request to the specified URL
   * @param {string} url - The endpoint URL
   * @param {Object} data - The request body
   * @param {Object} config - Additional axios configuration
   * @returns {Promise<any>} The response data
   */
  patch: async (url, data = {}, config = {}) => {
    try {
      const response = await api.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Makes a DELETE request to the specified URL
   * @param {string} url - The endpoint URL
   * @param {Object} config - Additional axios configuration
   * @returns {Promise<any>} The response data
   */
  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default apiClient; 