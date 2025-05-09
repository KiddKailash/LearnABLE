/**
 * @fileoverview HTTP client with methods for making API requests
 */

import { API_BASE_URL, getHeaders, handleResponse } from './config';

/**
 * HTTP client for making API requests
 */
const httpClient = {
  // GET request
  get: async (endpoint, params, responseType) => {
    try {
      let url = `${API_BASE_URL}${endpoint}`;
      
      // Add query params if provided
      if (params) {
        const queryString = new URLSearchParams(params).toString();
        url = `${url}?${queryString}`;
      }
      
      const options = {
        method: 'GET',
        headers: getHeaders()
      };
      
      // For blob responses, we need to handle them differently
      if (responseType === 'blob') {
        console.log(`GET ${endpoint} with blob response type`);
        const response = await fetch(url, options);
        
        if (!response.ok) {
          const error = new Error(`HTTP error ${response.status}`);
          error.status = response.status;
          throw error;
        }
        
        return await response.blob();
      }
      
      const response = await fetch(url, options);
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
        
        // If Authorization header exists, keep it
        const token = localStorage.getItem('access_token');
        if (token) {
          options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        options.body = data;
        
        // Log FormData contents for debugging (except file contents)
        console.log(`POST ${endpoint} FormData info:`, {
          keys: [...data.keys()],
          fileInfo: Array.from(data.entries())
            .filter(entry => entry[1] instanceof File)
            .map(entry => ({
              key: entry[0],
              filename: entry[1].name,
              type: entry[1].type,
              size: `${(entry[1].size / 1024).toFixed(2)} KB`
            })),
          otherValues: Array.from(data.entries())
            .filter(entry => !(entry[1] instanceof File))
            .map(entry => `${entry[0]}: ${entry[1]}`)
        });
      } else {
        options.body = data;
      }
      
      console.log(`Making POST request to ${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      
      // Log response status before parsing
      console.log(`POST ${endpoint} response status:`, response.status);
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`POST ${endpoint} error:`, error);
      
      // Enhance error message for FormData submissions
      if (data instanceof FormData) {
        const enhancedError = { ...error };
        if (error.status === 500) {
          enhancedError.message = `Server error (500) processing form submission. Check if all required fields are present: ${[...data.keys()].join(', ')}`;
        }
        throw enhancedError;
      }
      
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