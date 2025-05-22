/**
 * @fileoverview HTTP client with methods for making API requests
 *
 * @module httpClient
 */

import { API_BASE_URL, getHeaders, handleResponse } from "./config";

/**
 * HTTP client for making API requests
 * @type {Object}
 */
const httpClient = {
  /**
   * Makes a GET request to the specified endpoint
   *
   * @param {string} endpoint - The API endpoint to request
   * @param {Object} [params] - Query parameters to include in the request
   * @param {string} [responseType] - Type of response expected ('blob' for file downloads)
   * @returns {Promise<any>} The response data
   * @throws {Error} If the request fails
   */
  get: async (endpoint, params, responseType) => {
    try {
      let url = `${API_BASE_URL}${endpoint}`;

      // Add query params if provided
      if (params) {
        const queryString = new URLSearchParams(params).toString();
        url = `${url}?${queryString}`;
      }

      const options = {
        method: "GET",
        headers: getHeaders(),
      };

      // For blob responses, we need to handle them differently
      if (responseType === "blob") {
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

  /**
   * Makes a POST request to the specified endpoint
   *
   * @param {string} endpoint - The API endpoint to request
   * @param {Object|FormData} data - The data to send
   * @param {string} [contentType='application/json'] - The content type of the request
   * @returns {Promise<any>} The response data
   * @throws {Error} If the request fails
   */
  post: async (endpoint, data, contentType = "application/json") => {
    try {
      const options = {
        method: "POST",
        headers: getHeaders(contentType),
      };

      // Handle different content types
      if (contentType.includes("application/json")) {
        options.body = JSON.stringify(data);
      } else if (data instanceof FormData) {
        // Don't set Content-Type for FormData (browser will set it with boundary)
        delete options.headers["Content-Type"];

        // If Authorization header exists, keep it
        const token = localStorage.getItem("access_token");
        if (token) {
          options.headers["Authorization"] = `Bearer ${token}`;
        }

        options.body = data;
      } else {
        options.body = data;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`POST ${endpoint} error:`, error);

      // Enhance error message for FormData submissions
      if (data instanceof FormData) {
        const enhancedError = { ...error };
        if (error.status === 500) {
          enhancedError.message = `Server error (500) processing form submission. Check if all required fields are present: ${[
            ...data.keys(),
          ].join(", ")}`;
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

  /**
   * Makes a PUT request to the specified endpoint
   *
   * @param {string} endpoint - The API endpoint to request
   * @param {Object|FormData} data - The data to send
   * @param {string} [contentType='application/json'] - The content type of the request
   * @returns {Promise<any>} The response data
   * @throws {Error} If the request fails
   */
  put: async (endpoint, data, contentType = "application/json") => {
    try {
      const options = {
        method: "PUT",
        headers: getHeaders(contentType),
      };

      // Handle different content types
      if (contentType.includes("application/json")) {
        options.body = JSON.stringify(data);
      } else if (data instanceof FormData) {
        // Don't set Content-Type for FormData (browser will set it with boundary)
        delete options.headers["Content-Type"];
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

  /**
   * Makes a PATCH request to the specified endpoint
   *
   * @param {string} endpoint - The API endpoint to request
   * @param {Object} data - The data to send
   * @returns {Promise<any>} The response data
   * @throws {Error} If the request fails
   */
  patch: async (endpoint, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(data),
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

  /**
   * Makes a DELETE request to the specified endpoint
   *
   * @param {string} endpoint - The API endpoint to request
   * @param {Object} [data] - Optional data to send with the request
   * @returns {Promise<any>} The response data
   * @throws {Error} If the request fails
   */
  delete: async (endpoint, data) => {
    try {
      const options = {
        method: "DELETE",
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
  },
};

export default httpClient;
