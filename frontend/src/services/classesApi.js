/**
 * @fileoverview Classes API service for class management
 */

import httpClient from './httpClient';

const classesApi = {
  getAll: async () => {
    return httpClient.get('/api/classes/');
  },
  
  getById: async (id) => {
    return httpClient.get(`/api/classes/${id}/`);
  },
  
  create: async (classData) => {
    return httpClient.post('/api/classes/create/', classData);
  },
  
  update: async (id, classData) => {
    return httpClient.put(`/api/classes/${id}/`, classData);
  },
  
  delete: async (id) => {
    return httpClient.delete(`/api/classes/${id}/`);
  },
  
  addStudent: async (classId, studentId) => {
    return httpClient.post(`/api/classes/${classId}/add-student/`, { student_id: studentId });
  },
  
  removeStudent: async (classId, studentId) => {
    return httpClient.post(`/api/classes/${classId}/remove-student/`, { student_id: studentId });
  },
  
  uploadStudentCSV: async (formData) => {
    return httpClient.post('/api/classes/upload-csv/', formData, 'multipart/form-data');
  }
};

export default classesApi; 