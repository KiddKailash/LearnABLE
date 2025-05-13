/**
 * @fileoverview Assessments API service for managing educational assessments and evaluations
 * 
 * @module assessmentsApi
 */

import httpClient from './httpClient';

/**
 * Assessments API service
 * @type {Object}
 */
const assessmentsApi = {
  /**
   * Retrieves all assessments
   * 
   * @returns {Promise<Array>} List of assessments
   */
  getAll: async () => {
    return httpClient.get('/api/assessments/');
  },

  /**
   * Retrieves assessments for a specific class
   * 
   * @param {string|number} classId - The class ID
   * @returns {Promise<Array>} List of class assessments
   */
  getByClass: async (classId) => {
    return httpClient.get(`/api/assessments/class/${classId}/`);
  },

  /**
   * Creates a new assessment
   * 
   * @param {Object} assessmentData - The assessment data to create
   * @returns {Promise<Object>} Created assessment data
   */
  create: async (assessmentData) => {
    return httpClient.post('/api/assessments/create/', assessmentData);
  },
  
  update: async (id, assessmentData) => {
    return httpClient.put(`/api/assessments/${id}/`, assessmentData);
  },
  
  delete: async (id) => {
    return httpClient.delete(`/api/assessments/${id}/`);
  }
};

export default assessmentsApi; 