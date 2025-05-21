/**
 * @fileoverview NCCD Reports API service for managing Nationally Consistent Collection of Data reports
 * 
 * @module nccdReportsApi
 */

import httpClient from './httpClient';

/**
 * Prepares FormData for report creation/update
 * 
 * @param {Object} data - The report data
 * @returns {FormData} Prepared FormData object
 * @private
 */
const _prepareFormData = (data) => {
  const formData = new FormData();

  // Handle evidence file if present
  if (data.evidence && data.evidence instanceof File) {
    formData.append('evidence', data.evidence);
    delete data.evidence;
  }

  // Add remaining data
  Object.keys(data).forEach(key => {
    formData.append(key, data[key]);
  });

  return formData;
};

/**
 * NCCD Reports API service
 * @type {Object}
 */
const nccdReportsApi = {
  /**
   * Retrieves all NCCD reports
   * 
   * @returns {Promise<Array>} List of NCCD reports
   */
  getAll: async () => {
    return httpClient.get('/api/nccdreports/');
  },

  /**
   * Retrieves NCCD reports for a specific student
   * 
   * @param {string|number} studentId - The student ID
   * @returns {Promise<Array>} List of student's NCCD reports
   */
  getByStudent: async (studentId) => {
    const response = await httpClient.get(`/api/nccdreports/student/${studentId}/`);
    return response.data;  
  },

  /**
   * Creates a new NCCD report
   * 
   * @param {Object} reportData - The report data with optional evidence file
   * @returns {Promise<Object>} Created report data
   */
  create: async (reportData) => {
    const formData = _prepareFormData(reportData);
    return httpClient.post('/api/nccdreports/create/', formData, 'multipart/form-data');
  },

  /**
   * Updates an existing NCCD report
   * 
   * @param {string|number} id - The report ID
   * @param {Object} reportData - Updated report data with optional evidence file
   * @returns {Promise<Object>} Updated report data
   */
  update: async (id, reportData) => {
    const formData = _prepareFormData(reportData);
    return httpClient.put(`/api/nccdreports/${id}/`, formData, 'multipart/form-data');
  },

  /**
   * Deletes an NCCD report
   * 
   * @param {string|number} id - The report ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  delete: async (id) => {
    return httpClient.delete(`/api/nccdreports/${id}/`);
  },

  /**
   * Ensures NCCD reports exist for all students in a class
   * 
   * @param {string|number} classId - The class ID
   * @returns {Promise<Object>} Report creation/verification results
   */
  ensureReportsForClass: async (classId) => {
    return httpClient.post(`/api/nccdreports/class/${classId}/check-report/`);
  },

  /**
   * Records lesson effectiveness for a report
   * 
   * @param {string|number} reportId - The report ID
   * @param {Object} data - Effectiveness data
   * @param {string} data.was_effective - Whether the lesson was effective ('true' or 'false')
   * @returns {Promise<Object>} Effectiveness record data
   */
  createLessonEffectiveness: async (reportId, data) => {
    return httpClient.post(
      `/api/nccdreports/create-lesson-effectiveness/${reportId}/`, 
      data
    );
  },

  /**
   * Retrieves students who have a disability but do not yet have an NCCD report
   * 
   * @returns {Promise<Array>} List of eligible students
   */
  getEligibleStudents: async () => {
    const response = await httpClient.get('/api/nccdreports/students/no-nccd-report/');
    return response.data;
  },

};

export default nccdReportsApi;
