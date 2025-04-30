/**
 * @fileoverview Authentication API service
 */

import httpClient from './httpClient';
import { getHeaders, handleResponse } from './config';

// Token refresh functionality needs special handling outside httpClient
const _retryRequest = async (url, method, body) => {
  const options = {
    method,
    headers: getHeaders(),
  };
  
  if (body) options.body = body;
  
  const response = await fetch(url, options);
  return handleResponse(response);
};

const authApi = {
  login: async (email, password) => {
    return httpClient.post('/api/teachers/login/', { email, password });
  },
  
  verifyTwoFactor: async (email, twoFactorCode) => {
    return httpClient.post('/api/teachers/verify-login-2fa/', { 
      email, 
      code: twoFactorCode 
    });
  },
  
  register: async (userData) => {
    return httpClient.post('/api/teachers/register/', userData);
  },
  
  refreshToken: async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) throw new Error('No refresh token available');
    
    return httpClient.post('/api/token/refresh/', { refresh });
  },
  
  changePassword: async (data) => {
    return httpClient.post('/api/teachers/profile/password/change/', data);
  },
  
  setupTwoFactor: async () => {
    return httpClient.post('/api/teachers/profile/2fa/setup/');
  },
  
  verifyAndEnableTwoFactor: async (code) => {
    return httpClient.post('/api/teachers/profile/2fa/verify/', { token: code });
  },
  
  disableTwoFactor: async (code) => {
    return httpClient.post('/api/teachers/profile/2fa/disable/', { token: code });
  },
  
  // Handle token refresh when we get 401 errors
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
  
  logout: async () => {
    return httpClient.post('/api/teachers/logout/');
  }
};

export default authApi; 