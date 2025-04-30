/**
 * @fileoverview AI Assistant API service
 */

import httpClient from './httpClient';

const aiApi = {
  askOpenAI: async (message) => {
    return httpClient.post('/api/ask-openai/', { message });
  }
};

export default aiApi; 