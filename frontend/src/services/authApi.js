/**
 * @fileoverview Authentication API service for handling user authentication and authorization
 * 
 * @module authApi
 */

import httpClient from './httpClient';
import { getHeaders, handleResponse } from './config';

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
 * Stores user data and tokens in localStorage
 * 
 * @param {Object} response - The API response containing user data and tokens
 * @private
 */
const _storeUserData = (response) => {
  if (response.access && response.refresh) {
    localStorage.setItem('access_token', response.access);
    localStorage.setItem('refresh_token', response.refresh);
    
    // Store session ID for WebSocket monitoring
    if (response.session_id) {
      localStorage.setItem('session_id', response.session_id);
    }
    
    // Store user data
    const userData = {
      id: response.id,
      email: response.email,
      firstName: response.first_name,
      lastName: response.last_name,
      twoFactorEnabled: response.two_factor_enabled
    };
    localStorage.setItem('user', JSON.stringify(userData));
  }
};

/**
 * Authentication API service
 * @type {Object}
 */
const authApi = {
  /**
   * Authenticates a user with email and password
   * 
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<Object>} Authentication response with tokens and user data
   */
  login: async (email, password) => {
    const response = await httpClient.post('/api/teachers/login/', { email, password });
    _storeUserData(response);
    return response;
  },
  
  /**
   * Verifies two-factor authentication code
   * 
   * @param {string} email - User's email address
   * @param {string} twoFactorCode - The 2FA code to verify
   * @returns {Promise<Object>} Authentication response with tokens and user data
   */
  verifyTwoFactor: async (email, twoFactorCode) => {
    const response = await httpClient.post('/api/teachers/verify-login-2fa/', { 
      email, 
      code: twoFactorCode 
    });
    _storeUserData(response);
    return response;
  },
  
  /**
   * Registers a new user
   * 
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  register: async (userData) => {
    return httpClient.post('/api/teachers/register/', userData);
  },
  
  /**
   * Refreshes the authentication token
   * 
   * @returns {Promise<Object>} New token data
   * @throws {Error} If no refresh token is available
   */
  refreshToken: async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) throw new Error('No refresh token available');
    
    return httpClient.post('/api/token/refresh/', { refresh });
  },
  
  /**
   * Changes user's password
   * 
   * @param {Object} data - Password change data
   * @returns {Promise<Object>} Password change response
   */
  changePassword: async (data) => {
    return httpClient.post('/api/teachers/profile/password/change/', data);
  },
  
  /**
   * Initiates two-factor authentication setup
   * 
   * @returns {Promise<Object>} 2FA setup response
   */
  setupTwoFactor: async () => {
    return httpClient.post('/api/teachers/profile/2fa/setup/');
  },
  
  /**
   * Verifies and enables two-factor authentication
   * 
   * @param {string} code - The 2FA verification code
   * @returns {Promise<Object>} 2FA verification response
   */
  verifyAndEnableTwoFactor: async (code) => {
    return httpClient.post('/api/teachers/profile/2fa/verify/', { token: code });
  },
  
  /**
   * Disables two-factor authentication
   * 
   * @param {string} code - The 2FA verification code
   * @returns {Promise<Object>} 2FA disable response
   */
  disableTwoFactor: async (code) => {
    return httpClient.post('/api/teachers/profile/2fa/disable/', { token: code });
  },
  
  /**
   * Handles token refresh when receiving 401 errors
   * 
   * @param {Error} error - The error containing original request details
   * @returns {Promise<any>} Retried request response
   * @throws {Error} If token refresh fails
   */
  handleTokenRefresh: async (error) => {
    try {
      if (!error.needsTokenRefresh) {
        throw error;
      }
      
      // Get original request details
      const { originalUrl, originalMethod, originalBody } = error;
      
      // Try to refresh the token
      await authApi.refreshToken();
      
      // If refresh succeeds, retry the original request
      return _retryRequest(originalUrl, originalMethod, originalBody);
    } catch (refreshError) {
      // If refresh fails, redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
      throw refreshError;
    }
  },
  
  /**
   * Logs out the current user
   * 
   * @returns {Promise<Object>} Logout response
   */
  logout: async () => {
    const response = await httpClient.post('/api/teachers/logout/');
    
    // Clear all stored data regardless of response
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('session_id');
    
    return response;
  }
};

export default authApi; 