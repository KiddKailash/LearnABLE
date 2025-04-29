/**
 * @fileoverview Common validation rules used across the application.
 * This file centralizes validation logic for reuse in different forms.
 */

/**
 * Validates an email address.
 * 
 * @param {string} email - The email to validate.
 * @returns {string|null} Error message or null if valid.
 */
export const validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }
  
  return null;
};

/**
 * Validates a password.
 * 
 * @param {string} password - The password to validate.
 * @param {Object} options - Validation options.
 * @returns {string|null} Error message or null if valid.
 */
export const validatePassword = (password, options = {}) => {
  const { minLength = 8, requireSpecialChar = true } = options;
  
  if (!password) {
    return 'Password is required';
  }
  
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters`;
  }
  
  if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  
  return null;
};

/**
 * Validates that a field is not empty.
 * 
 * @param {string} value - The value to check.
 * @param {string} fieldName - Field name for the error message.
 * @returns {string|null} Error message or null if valid.
 */
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  
  return null;
};

/**
 * Validates that a field meets a minimum length.
 * 
 * @param {string} value - The value to check.
 * @param {number} minLength - The minimum length required.
 * @param {string} fieldName - Field name for the error message.
 * @returns {string|null} Error message or null if valid.
 */
export const validateMinLength = (value, minLength, fieldName) => {
  if (!value) {
    return null; // Let validateRequired handle this case
  }
  
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  
  return null;
};

/**
 * Validates that a value is a number within a range.
 * 
 * @param {string|number} value - The value to check.
 * @param {Object} options - Validation options.
 * @returns {string|null} Error message or null if valid.
 */
export const validateNumber = (value, options = {}) => {
  const { min, max, fieldName = 'Value' } = options;
  
  if (value === '' || value === null || value === undefined) {
    return null; // Let validateRequired handle this case
  }
  
  const numValue = Number(value);
  
  if (isNaN(numValue)) {
    return `${fieldName} must be a number`;
  }
  
  if (min !== undefined && numValue < min) {
    return `${fieldName} must be at least ${min}`;
  }
  
  if (max !== undefined && numValue > max) {
    return `${fieldName} must be no more than ${max}`;
  }
  
  return null;
};

/**
 * Validates a file upload.
 * 
 * @param {File} file - The file to validate.
 * @param {Object} options - Validation options.
 * @returns {string|null} Error message or null if valid.
 */
export const validateFile = (file, options = {}) => {
  const { 
    maxSizeInBytes = 5 * 1024 * 1024, // 5MB default
    allowedTypes = [], 
    fieldName = 'File' 
  } = options;
  
  if (!file) {
    return null; // Let validateRequired handle this case
  }
  
  if (file.size > maxSizeInBytes) {
    const maxSizeInMB = maxSizeInBytes / (1024 * 1024);
    return `${fieldName} size must be less than ${maxSizeInMB}MB`;
  }
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return `${fieldName} must be one of the following types: ${allowedTypes.join(', ')}`;
  }
  
  return null;
}; 