/**
 * Error handling utilities for the frontend
 */

// Error types
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  AUTH: 'AUTH_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// User-friendly error messages
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
 * Classifies an error into a specific type
 * @param {Error} error - The error object
 * @returns {string} The error type
 */
export const classifyError = (error) => {
  if (!error) return ErrorTypes.UNKNOWN;

  // Network errors
  if (error.name === 'NetworkError' || error.message?.includes('Network Error')) {
    return ErrorTypes.NETWORK;
  }

  // Authentication errors
  if (error.response?.status === 401 || error.response?.status === 403) {
    return ErrorTypes.AUTH;
  }

  // Validation errors
  if (error.response?.status === 400) {
    return ErrorTypes.VALIDATION;
  }

  // Server errors
  if (error.response?.status >= 500) {
    return ErrorTypes.SERVER;
  }

  return ErrorTypes.UNKNOWN;
};

/**
 * Gets user-friendly error information
 * @param {Error} error - The error object
 * @returns {Object} Error information with title, message, and suggestions
 */
export const getErrorInfo = (error) => {
  const errorType = classifyError(error);
  const baseInfo = errorMessages[errorType];

  // If it's a validation error, try to get specific field errors
  if (errorType === ErrorTypes.VALIDATION && error.response?.data?.errors) {
    return {
      ...baseInfo,
      fieldErrors: error.response.data.errors
    };
  }

  // If it's a server error with a specific message, use it
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
 * @param {Error} error - The error object
 * @param {Object} context - Additional context about where the error occurred
 */
export const logError = (error, context = {}) => {
  const errorType = classifyError(error);
  const errorInfo = getErrorInfo(error);

  console.error('Error occurred:', {
    type: errorType,
    error,
    context,
    userFriendlyInfo: errorInfo
  });

  // Here you would typically send the error to your error tracking service
  // if (process.env.NODE_ENV === 'production') {
  //   sendToErrorTracking(error, context);
  // }
}; 