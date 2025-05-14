/**
 * @fileoverview AI API service for managing AI-powered features and integrations
 * 
 * @module aiApi
 */

import httpClient from './httpClient';

/**
 * AI API service
 * @type {Object}
 */
const aiApi = {
  /**
   * Generates AI-powered content or suggestions
   * 
   * @param {Object} requestData - The request data for AI generation
   * @returns {Promise<Object>} Generated content or suggestions
   */
  generate: async (requestData) => {
    return httpClient.post('/api/ai/generate/', requestData);
  }
};

export default aiApi; 