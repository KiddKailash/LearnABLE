/**
 * @fileoverview Configuration and common utilities for API services
 */

// Use environment variable for backend URL or fallback to localhost for development
export const API_BASE_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:8000';

/**
 * Creates headers with authentication token if available
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

// Flag to prevent infinite token refresh loops
let isRefreshing = false;

/**
 * Handles API responses with better error detection
 * @param {Response} response - Fetch API response
 * @returns {Promise} Parsed response data
 */
export const handleResponse = async (response) => {
  // Log the response status and content type
  const contentType = response.headers.get('content-type');
  console.log(`Response: ${response.status} ${response.statusText}`, 
              `Content-Type: ${contentType || 'none'}`);
  
  // Special case for 204 No Content
  if (response.status === 204) {
    return { success: true };
  }

  let data;
  
  try {
    // Handle JSON responses
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } 
    // Handle binary data (file downloads)
    else if (contentType && 
             (contentType.includes('application/octet-stream') || 
              contentType.includes('application/pdf') ||
              contentType.includes('application/vnd.openxmlformats'))) {
      data = await response.blob();
      return data; // Return the blob directly
    } 
    // Handle HTML responses (often error pages)
    else if (contentType && contentType.includes('text/html')) {
      const text = await response.text();
      
      // Log a shorter version of the HTML for debugging
      const shortText = text.substring(0, 500) + (text.length > 500 ? '...' : '');
      console.log(`Received HTML response (shortened): ${shortText}`);
      
      // Try to extract error message from HTML if it's an error page
      let errorMessage = "Received HTML response instead of JSON";
      if (text.includes('<title>') && text.includes('</title>')) {
        const titleMatch = text.match(/<title>(.*?)<\/title>/);
        if (titleMatch && titleMatch[1]) {
          errorMessage = titleMatch[1];
        }
      }
      
      data = { error: errorMessage, html: shortText };
    } 
    // Default to text for other content types
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
  
  // Handle error responses
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