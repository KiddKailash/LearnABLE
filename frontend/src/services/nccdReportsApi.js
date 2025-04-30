/**
 * @fileoverview NCCD Reports API service
 */

import httpClient from './httpClient';

const nccdReportsApi = {
  getAll: async () => {
    return httpClient.get('/api/nccdreports/');
  },
  
  getByStudent: async (studentId) => {
    return httpClient.get(`/api/nccdreports/student/${studentId}/`);
  },
  
  create: async (reportData) => {
    const formData = new FormData();
    
    // Handle file upload if evidence is provided
    if (reportData.evidence && reportData.evidence instanceof File) {
      formData.append('evidence', reportData.evidence);
      delete reportData.evidence;
    }
    
    // Add the rest of the data
    Object.keys(reportData).forEach(key => {
      formData.append(key, reportData[key]);
    });
    
    return httpClient.post('/api/nccdreports/create/', formData, 'multipart/form-data');
  },
  
  update: async (id, reportData) => {
    const formData = new FormData();
    
    // Handle file upload if evidence is provided
    if (reportData.evidence && reportData.evidence instanceof File) {
      formData.append('evidence', reportData.evidence);
      delete reportData.evidence;
    }
    
    // Add the rest of the data
    Object.keys(reportData).forEach(key => {
      formData.append(key, reportData[key]);
    });
    
    return httpClient.put(`/api/nccdreports/${id}/`, formData, 'multipart/form-data');
  },
  
  delete: async (id) => {
    return httpClient.delete(`/api/nccdreports/${id}/`);
  }
};

export default nccdReportsApi; 