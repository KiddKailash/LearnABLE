/**
 * @fileoverview Student Grades API service for managing student grades and assessments
 * 
 * @module studentGradesApi
 */

import httpClient from './httpClient';

/**
 * Student Grades API service
 * @type {Object}
 */
const studentGradesApi = {
  /**
   * Retrieves grades for a specific student
   * 
   * @param {string|number} studentId - The student ID
   * @returns {Promise<Array>} List of student grades
   */
  getByStudent: async (studentId) => {
    return httpClient.get(`/api/student-grades/${studentId}/`);
  },

  /**
   * Updates grades for a student
   * 
   * @param {string|number} studentId - The student ID
   * @param {Object} gradeData - The updated grade data
   * @returns {Promise<Object>} Updated grade data
   */
  update: async (studentId, gradeData) => {
    return httpClient.put(`/api/student-grades/${studentId}/`, gradeData);
  }
};

export default studentGradesApi; 