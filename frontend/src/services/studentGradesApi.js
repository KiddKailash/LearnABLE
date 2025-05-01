/**
 * @fileoverview Student Grades API service
 */

import httpClient from './httpClient';

const studentGradesApi = {
  getByAssessment: async (assessmentId) => {
    return httpClient.get(`/api/studentgrades/assessment/${assessmentId}/`);
  },
  
  getByStudent: async (studentId) => {
    return httpClient.get(`/api/studentgrades/student/${studentId}/`);
  },
  
  create: async (gradeData) => {
    return httpClient.post('/api/studentgrades/create/', gradeData);
  },
  
  update: async (id, gradeData) => {
    return httpClient.put(`/api/studentgrades/${id}/`, gradeData);
  }
};

export default studentGradesApi; 