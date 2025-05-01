/**
 * @fileoverview Assessments API service
 */

import httpClient from './httpClient';

const assessmentsApi = {
  getAll: async () => {
    return httpClient.get('/api/assessments/');
  },
  
  getByClass: async (classId) => {
    return httpClient.get(`/api/assessments/class/${classId}/`);
  },
  
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