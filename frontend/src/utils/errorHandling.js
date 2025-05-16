/**
 * @file errorHandling.js
 * @description Error handling utilities for the frontend application.
 * Features:
 * - Error type classification
 * - User-friendly error messages
 * - Error logging and monitoring
 * - Context-aware error information
 */

/**
 * Enum of possible error types in the application
 * @enum {string}
 */
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  AUTH: 'AUTH_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

/**
 * User-friendly error messages and suggestions for each error type
 * @type {Object}
 */
const errorMessages = {
  [ErrorTypes.NETWORK]: {
    title: 'Connection Error',
    message: 'Unable to connect to the server. Please check your internet connection.',
    suggestions: [
      'Check your internet connection',
      'Try refreshing the page',
      'If the problem persists, try again later'
    ]
  },
  [ErrorTypes.AUTH]: {
    title: 'Authentication Error',
    message: 'Your session may have expired. Please log in again.',
    suggestions: [
      'Try logging in again',
      'Clear your browser cache',
      'If the problem persists, contact support'
    ]
  },
  [ErrorTypes.VALIDATION]: {
    title: 'Invalid Input',
    message: 'Please check your input and try again.',
    suggestions: [
      'Review the highlighted fields',
      'Make sure all required fields are filled',
      'Check for any special characters or formatting requirements'
    ]
  },
  [ErrorTypes.SERVER]: {
    title: 'Server Error',
    message: 'Something went wrong on our end. We\'re working to fix it.',
    suggestions: [
      'Try again in a few minutes',
      'Clear your browser cache',
      'If the problem persists, contact support'
    ]
  },
  [ErrorTypes.UNKNOWN]: {
    title: 'Unexpected Error',
    message: 'An unexpected error occurred. Please try again.',
    suggestions: [
      'Try refreshing the page',
      'Clear your browser cache',
      'If the problem persists, contact support'
    ]
  }
};

/**
 * Classifies an error into a specific type based on its properties
 * @param {Error} error - The error object to classify
 * @returns {string} The classified error type from ErrorTypes enum
 */
export const classifyError = (error) => {
  if (!error) return ErrorTypes.UNKNOWN;

  // Check for network-related errors
  if (error.name === 'NetworkError' || error.message?.includes('Network Error')) {
    return ErrorTypes.NETWORK;
  }

  // Check for authentication errors (401, 403)
  if (error.response?.status === 401 || error.response?.status === 403) {
    return ErrorTypes.AUTH;
  }

  // Check for validation errors (400)
  if (error.response?.status === 400) {
    return ErrorTypes.VALIDATION;
  }

  // Check for server errors (500+)
  if (error.response?.status >= 500) {
    return ErrorTypes.SERVER;
  }

  return ErrorTypes.UNKNOWN;
};

/**
 * Gets user-friendly error information based on the error type and response
 * @param {Error} error - The error object
 * @returns {Object} Error information with title, message, and suggestions
 */
export const getErrorInfo = (error) => {
  const errorType = classifyError(error);
  const baseInfo = errorMessages[errorType];

  // Handle validation errors with specific field errors
  if (errorType === ErrorTypes.VALIDATION && error.response?.data?.errors) {
    return {
      ...baseInfo,
      fieldErrors: error.response.data.errors
    };
  }

  // Handle server errors with specific messages
  if (errorType === ErrorTypes.SERVER && error.response?.data?.message) {
    return {
      ...baseInfo,
      message: error.response.data.message
    };
  }

  return baseInfo;
};

/**
 * Logs an error to the console and any monitoring service
 * @param {Error} error - The error object to log
 * @param {Object} context - Additional context about where the error occurred
 */
export const logError = (error, context = {}) => {
  const errorType = classifyError(error);
  const errorInfo = getErrorInfo(error);

  // Log error details to console
  console.error('Error occurred:', {
    type: errorType,
    error,
    context,
    userFriendlyInfo: errorInfo
  });

  // TODO: Implement error tracking service integration
  // if (process.env.NODE_ENV === 'production') {
  //   sendToErrorTracking(error, context);
  // }
}; 