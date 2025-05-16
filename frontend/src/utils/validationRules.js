/**
 * @file validationRules.js
 * @description Common validation rules used across the application.
 * 
 */

/**
 * Validates an email address format
 * @param {string} email - The email address to validate
 * @returns {string|null} Error message if invalid, null if valid
 */
export const validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }
  
  // RFC 5322 compliant email regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }
  
  return null;
};

/**
 * Validates a password against configurable requirements
 * @param {string} password - The password to validate
 * @param {Object} options - Validation options
 * @param {number} [options.minLength=8] - Minimum password length
 * @param {boolean} [options.requireSpecialChar=true] - Whether to require special characters
 * @returns {string|null} Error message if invalid, null if valid
 */
export const validatePassword = (password, options = {}) => {
  const { minLength = 8, requireSpecialChar = true } = options;
  
  if (!password) {
    return 'Password is required';
  }
  
  // Check minimum length
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters`;
  }
  
  // Check for special characters if required
  if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  
  return null;
};

/**
 * Validates that a required field is not empty
 * @param {string} value - The value to check
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|null} Error message if invalid, null if valid
 */
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  
  return null;
};

/**
 * Validates that a field meets a minimum length requirement
 * @param {string} value - The value to check
 * @param {number} minLength - Minimum required length
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|null} Error message if invalid, null if valid
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
 * Validates that a value is a number within specified range
 * @param {string|number} value - The value to check
 * @param {Object} options - Validation options
 * @param {number} [options.min] - Minimum allowed value
 * @param {number} [options.max] - Maximum allowed value
 * @param {string} [options.fieldName='Value'] - Name of the field for error message
 * @returns {string|null} Error message if invalid, null if valid
 */
export const validateNumber = (value, options = {}) => {
  const { min, max, fieldName = 'Value' } = options;
  
  // Skip validation if value is empty (let validateRequired handle it)
  if (value === '' || value === null || value === undefined) {
    return null;
  }
  
  // Convert to number and check if valid
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return `${fieldName} must be a number`;
  }
  
  // Check range constraints if specified
  if (min !== undefined && numValue < min) {
    return `${fieldName} must be at least ${min}`;
  }
  
  if (max !== undefined && numValue > max) {
    return `${fieldName} must be no more than ${max}`;
  }
  
  return null;
};

/**
 * Validates a file upload against size and type constraints
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @param {number} [options.maxSizeInBytes=5*1024*1024] - Maximum file size in bytes (default 5MB)
 * @param {string[]} [options.allowedTypes=[]] - Array of allowed MIME types
 * @param {string} [options.fieldName='File'] - Name of the field for error message
 * @returns {string|null} Error message if invalid, null if valid
 */
export const validateFile = (file, options = {}) => {
  const { 
    maxSizeInBytes = 5 * 1024 * 1024, // 5MB default
    allowedTypes = [], 
    fieldName = 'File' 
  } = options;
  
  // Skip validation if no file (let validateRequired handle it)
  if (!file) {
    return null;
  }
  
  // Check file size
  if (file.size > maxSizeInBytes) {
    const maxSizeInMB = maxSizeInBytes / (1024 * 1024);
    return `${fieldName} size must be less than ${maxSizeInMB}MB`;
  }
  
  // Check file type if allowed types are specified
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return `${fieldName} must be one of the following types: ${allowedTypes.join(', ')}`;
  }
  
  return null;
}; 