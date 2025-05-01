/**
 * @fileoverview Custom hook for form validation that provides a reusable
 * pattern for validating form fields across the application.
 */

import { useState } from 'react';

/**
 * Custom hook to manage form validation state and validation logic.
 *
 * @param {Object} initialValues - Initial form values.
 * @param {Function} validate - Validation function that returns error object.
 * @returns {Object} Validation state and helper functions.
 */
const useFormValidation = (initialValues = {}, validate = () => ({})) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  /**
   * Handles input change and updates form values.
   *
   * @param {Event} e - The input change event.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  /**
   * Sets a specific field value programmatically.
   *
   * @param {string} field - The field name.
   * @param {*} value - The field value.
   */
  const setFieldValue = (field, value) => {
    setValues({
      ...values,
      [field]: value,
    });
  };

  /**
   * Marks a field as touched when it loses focus.
   *
   * @param {Event} e - The blur event.
   */
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });
    
    // Validate field on blur
    const validationErrors = validate(values);
    setErrors({
      ...errors,
      [name]: validationErrors[name] || '',
    });
  };

  /**
   * Validates the entire form and returns whether it's valid.
   *
   * @returns {boolean} Whether the form is valid.
   */
  const validateForm = () => {
    const validationErrors = validate(values);
    setErrors(validationErrors);
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    return Object.keys(validationErrors).length === 0;
  };

  /**
   * Resets form state to initial values.
   */
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  /**
   * Manually set errors on the form
   * @param {Object} errorObject - Object with field names as keys and error messages as values
   */
  const setFormErrors = (errorObject) => {
    setErrors({
      ...errors,
      ...errorObject
    });
  };

  /**
   * Manually set touch state for form fields
   * @param {Object} touchedObject - Object with field names as keys and boolean touch state as values
   */
  const setFormTouched = (touchedObject) => {
    setTouched({
      ...touched,
      ...touchedObject
    });
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    validateForm,
    resetForm,
    setErrors: setFormErrors, // Export the function to set errors manually
    setTouched: setFormTouched, // Export the function to set touched state manually
  };
};

export default useFormValidation; 