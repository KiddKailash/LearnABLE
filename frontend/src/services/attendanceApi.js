/**
 * @fileoverview Attendance API service for managing student attendance records
 * 
 * @module attendanceApi
 */

import httpClient from './httpClient';

/**
 * Attendance API service
 * @type {Object}
 */
const attendanceApi = {
  /**
   * Retrieves attendance sessions for a class
   * 
   * @param {string|number} classId - The class ID
   * @returns {Promise<Array>} List of attendance sessions
   */
  getSessions: async (classId) => {
    return httpClient.get(`/api/attendancesessions/class/${classId}/`);
  },
  
  /**
   * Creates a new attendance session for a class
   * 
   * @param {Object} sessionData - The session data to create
   * @returns {Promise<Object>} Created session data
   */
  createSession: async (sessionData) => {
    return httpClient.post('/api/attendancesessions/create/', sessionData);
  },
  
  /**
   * Records attendance for a student
   * 
   * @param {string|number} studentId - The student ID
   * @returns {Promise<Object>} Student attendance data
   */
  getStudentAttendance: async (studentId) => {
    return httpClient.get(`/api/studentattendance/student/${studentId}/`);
  },

  /**
   * Records attendance for a class
   * 
   * @param {string|number} classId - The class ID
   * @param {Object} attendanceData - The attendance data to record
   * @returns {Promise<Object>} Recorded attendance data
   */
  record: async (classId, attendanceData) => {
    return httpClient.post(`/api/attendance/class/${classId}/`, attendanceData);
  },

  /**
   * Retrieves attendance records for a class
   * 
   * @param {string|number} classId - The class ID
   * @returns {Promise<Array>} List of attendance records
   */
  getByClass: async (classId) => {
    return httpClient.get(`/api/attendance/class/${classId}/`);
  }
};

export default attendanceApi; 