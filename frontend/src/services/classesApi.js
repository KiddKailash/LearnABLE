/**
 * @fileoverview Classes API service for managing classes and student enrollments
 * 
 * @module classesApi
 */

import httpClient from './httpClient';

/**
 * Normalizes class creation response to ensure consistent ID format
 * 
 * @param {Object} response - The raw API response
 * @returns {Object} Normalized response with consistent ID format
 * @private
 */
const _normalizeClassResponse = (response) => {
  if (!response || typeof response !== 'object') {
    return response;
  }

  // If response already has class_id, use that
  if (response.class_id) {
    return {
      ...response,
      id: response.class_id,
      ...(response.class_data || {})
    };
  }

  // If response already has id, return as is
  if (response.id) {
    return response;
  }

  // If id is nested in data property
  if (response.data?.id) {
    return {
      ...response,
      id: response.data.id
    };
  }

  // Check for alternative ID keys
  const possibleIdKeys = ['classId', 'pk'];
  for (const key of possibleIdKeys) {
    if (response[key]) {
      return {
        ...response,
        id: response[key]
      };
    }
  }

  // If no ID found, return original response
  console.warn("Class created, but ID not found in response:", response);
  return response;
};

/**
 * Classes API service
 * @type {Object}
 */
const classesApi = {
  /**
   * Retrieves all classes
   * 
   * @returns {Promise<Array>} List of classes
   */
  getAll: async () => {
    return httpClient.get('/api/classes/');
  },
  
  /**
   * Retrieves a class by ID
   * 
   * @param {string|number} id - The class ID
   * @returns {Promise<Object>} Class data
   */
  getById: async (id) => {
    return httpClient.get(`/api/classes/${id}/`);
  },
  
  /**
   * Creates a new class
   * 
   * @param {Object} classData - The class data to create
   * @returns {Promise<Object>} Created class data with normalized ID
   * @throws {Error} If class creation fails
   */
  create: async (classData) => {
    try {
      console.log("Creating class with data:", classData);
      const response = await httpClient.post('/api/classes/create/', classData);
      console.log("Raw class creation response:", response);
      return _normalizeClassResponse(response);
    } catch (error) {
      console.error("Error creating class:", error);
      throw error;
    }
  },
  
  /**
   * Updates an existing class
   * 
   * @param {string|number} id - The class ID
   * @param {Object} classData - The updated class data
   * @returns {Promise<Object>} Updated class data
   */
  update: async (id, classData) => {
    return httpClient.put(`/api/classes/${id}/`, classData);
  },
  
  /**
   * Deletes a class
   * 
   * @param {string|number} id - The class ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  delete: async (id) => {
    return httpClient.delete(`/api/classes/${id}/`);
  },
  
  /**
   * Adds a student to a class
   * 
   * @param {string|number} classId - The class ID
   * @param {string|number} studentId - The student ID
   * @returns {Promise<Object>} Enrollment confirmation
   */
  addStudent: async (classId, studentId) => {
    return httpClient.post(`/api/classes/${classId}/add-student/`, { student_id: studentId });
  },
  
  /**
   * Removes a student from a class
   * 
   * @param {string|number} classId - The class ID
   * @param {string|number} studentId - The student ID
   * @returns {Promise<Object>} Removal confirmation
   */
  removeStudent: async (classId, studentId) => {
    return httpClient.post(`/api/classes/${classId}/remove-student/`, { student_id: studentId });
  },
  
  /**
   * Uploads a CSV file to add multiple students to a class
   * 
   * @param {FormData} formData - Form data containing the CSV file
   * @returns {Promise<Object>} Upload and processing results
   */
  uploadStudentCSV: async (formData) => {
    return httpClient.post('/api/classes/upload-csv/', formData, 'multipart/form-data');
  }
};

export default classesApi; 