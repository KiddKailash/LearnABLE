/**
 * @fileoverview Configuration and common utilities for API services
 * 
 * @module config
 */

// Use environment variable for backend URL or fallback to localhost for development
export const API_BASE_URL = process.env.REACT_APP_SERVER_URL;

/**
 * Creates headers with authentication token if available
 * 
 * @param {string} [contentType='application/json'] - The content type for the request
 * @returns {Object} Headers object with content type and auth token if available
 */
export const getHeaders = (contentType = 'application/json') => {
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
 * Handles API responses with better error detection and parsing
 * 
 * @param {Response} response - Fetch API response
 * @returns {Promise<any>} Parsed response data
 * @throws {Error} If the response indicates an error
 */
export const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  console.log(`Response: ${response.status} ${response.statusText}`, 
              `Content-Type: ${contentType || 'none'}`);
  
  if (response.status === 204) {
    return { success: true };
  }

  let data;
  
  try {
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } 
    else if (contentType && 
             (contentType.includes('application/octet-stream') || 
              contentType.includes('application/pdf') ||
              contentType.includes('application/vnd.openxmlformats'))) {
      data = await response.blob();
      return data;
    } 
    else if (contentType?.includes('text/html')) {
      const text = await response.text();
      const shortText = text.substring(0, 500) + (text.length > 500 ? '...' : '');
      console.log(`Received HTML response (shortened): ${shortText}`);
      
      let errorMessage = "Received HTML response instead of JSON";
      if (text.includes('<title>') && text.includes('</title>')) {
        const titleMatch = text.match(/<title>(.*?)<\/title>/);
        if (titleMatch?.[1]) {
          errorMessage = titleMatch[1];
        }
      }
      
      data = { error: errorMessage, html: shortText };
    } 
    else {
      data = await response.text();
    }
  } catch (error) {
    console.error('Error parsing response:', error);
    data = {
      error: "Failed to parse response from server",
      parseError: error.message
    };
  }
  
  if (!response.ok) {
    const error = {
      status: response.status,
      statusText: response.statusText,
      data: data,
      message: data?.error || data?.message || data?.detail || 'An error occurred'
    };
    
    console.error('Response error:', error);
    throw error;
  }
  
  return data;
}; 