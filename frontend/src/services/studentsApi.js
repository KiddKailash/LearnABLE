/**
 * @fileoverview Students API service for managing student records and information
 *
 * @module studentsApi
 */

import httpClient from "./httpClient";

/**
 * Students API service
 * @type {Object}
 */
const studentsApi = {
  /**
   * Retrieves all students
   *
   * @returns {Promise<Array>} List of students
   */
  getAll: async () => {
    return httpClient.get("/api/students/");
  },

  /**
   * Retrieves a student by ID
   *
   * @param {string|number} id - The student ID
   * @returns {Promise<Object>} Student data
   */
  getById: async (id) => {
    return httpClient.get(`/api/students/${id}/`);
  },

  /**
   * Creates a new student
   *
   * @param {Object} studentData - The student data to create
   * @returns {Promise<Object>} Created student data
   */
  create: async (studentData) => {
    return httpClient.post("/api/students/create/", studentData);
  },

  /**
   * Updates an existing student
   *
   * @param {string|number} id - The student ID
   * @param {Object} studentData - The updated student data
   * @returns {Promise<Object>} Updated student data
   */
  update: async (id, studentData) => {
    return httpClient.patch(`/api/students/${id}/patch/`, studentData);
  },

  /**
   * Deletes a student
   *
   * @param {string|number} id - The student ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  delete: async (id) => {
    return httpClient.delete(`/api/students/${id}/delete/`);
  },

  /**
   * Finds a student by email address
   *
   * @param {string} email - The student's email address
   * @returns {Promise<Object>} Student data if found
   */
  findByEmail: async (email) => {
    return httpClient.post("/api/students/by-email/", { email });
  },
};

export default studentsApi;
