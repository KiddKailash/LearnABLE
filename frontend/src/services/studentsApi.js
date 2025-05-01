/**
 * @fileoverview Students API service for student management
 */

import httpClient from './httpClient';

const studentsApi = {
  getAll: async () => {
    return httpClient.get('/api/students/');
  },
  
  getById: async (id) => {
    return httpClient.get(`/api/students/${id}/`);
  },
  
  create: async (studentData) => {
    return httpClient.post('/api/students/create/', studentData);
  },
  
  update: async (id, studentData) => {
    return httpClient.patch(`/api/students/${id}/patch/`, studentData);
  },
  
  delete: async (id) => {
    return httpClient.delete(`/api/students/${id}/delete/`);
  },
  
  findByEmail: async (email) => {
    return httpClient.post('/api/students/by-email/', { email });
  }
};

export default studentsApi; 