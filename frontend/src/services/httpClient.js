/**
 * @fileoverview HTTP client with methods for making API requests
 */

import { API_BASE_URL, getHeaders, handleResponse } from './config';

/**
 * HTTP client for making API requests
 */
const httpClient = {
  // GET request
  get: async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`GET ${endpoint} error:`, error);
      
      // Handle token refresh if needed
      if (error.needsTokenRefresh) {
        // This will be handled by the import in api.js
        // We just propagate the error with the necessary context
      }
      
      throw error;
    }
  },
  
  // POST request
  post: async (endpoint, data, contentType = 'application/json') => {
    try {
      const options = {
        method: 'POST',
        headers: getHeaders(contentType),
      };
      
      // Handle different content types
      if (contentType.includes('application/json')) {
        options.body = JSON.stringify(data);
      } else if (data instanceof FormData) {
        // Don't set Content-Type for FormData (browser will set it with boundary)
        delete options.headers['Content-Type'];
        options.body = data;
      } else {
        options.body = data;
      }
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      return await handleResponse(response);
    } catch (error) {
      console.error(`POST ${endpoint} error:`, error);
      
      // Handle token refresh if needed
      if (error.needsTokenRefresh) {
        // This will be handled by the import in api.js
        // We just propagate the error with the necessary context
      }
      
      throw error;
    }
  },
  
  // PUT request
  put: async (endpoint, data, contentType = 'application/json') => {
    try {
      const options = {
        method: 'PUT',
        headers: getHeaders(contentType),
      };
      
      // Handle different content types
      if (contentType.includes('application/json')) {
        options.body = JSON.stringify(data);
      } else if (data instanceof FormData) {
        // Don't set Content-Type for FormData (browser will set it with boundary)
        delete options.headers['Content-Type'];
        options.body = data;
      } else {
        options.body = data;
      }
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      return await handleResponse(response);
    } catch (error) {
      console.error(`PUT ${endpoint} error:`, error);
      
      // Handle token refresh if needed
      if (error.needsTokenRefresh) {
        // This will be handled by the import in api.js
        // We just propagate the error with the necessary context
      }
      
      throw error;
    }
  },
  
  // PATCH request
  patch: async (endpoint, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`PATCH ${endpoint} error:`, error);
      
      // Handle token refresh if needed
      if (error.needsTokenRefresh) {
        // This will be handled by the import in api.js
        // We just propagate the error with the necessary context
      }
      
      throw error;
    }
  },
  
  // DELETE request
  delete: async (endpoint, data) => {
    try {
      const options = {
        method: 'DELETE',
        headers: getHeaders(),
      };
      
      if (data) {
        options.body = JSON.stringify(data);
      }
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      return await handleResponse(response);
    } catch (error) {
      console.error(`DELETE ${endpoint} error:`, error);
      
      // Handle token refresh if needed
      if (error.needsTokenRefresh) {
        // This will be handled by the import in api.js
        // We just propagate the error with the necessary context
      }
      
      throw error;
    }
  }
};

export default httpClient; 