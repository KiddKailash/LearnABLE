/**
 * @fileoverview Learning Materials API service
 */

import httpClient from './httpClient';

const learningMaterialsApi = {
  getAll: async () => {
    return httpClient.get('/api/learning-materials/');
  },
  
  getByClass: async (classId) => {
    return httpClient.get(`/api/learning-materials/class/${classId}/`);
  },
  
  create: async (materialData) => {
    const formData = new FormData();
    
    // Handle file upload
    if (materialData.file && materialData.file instanceof File) {
      formData.append('file', materialData.file);
      delete materialData.file;
    }
    
    // Add the rest of the data
    Object.keys(materialData).forEach(key => {
      formData.append(key, materialData[key]);
    });
    
    return httpClient.post('/api/learning-materials/', formData, 'multipart/form-data');
  },
  
  delete: async (id) => {
    return httpClient.delete(`/api/learning-materials/${id}/`);
  },

  adapt: async (materialId) => {
    return httpClient.post(`/api/learning-materials/${materialId}/adapt/`);
  }
};

export default learningMaterialsApi; 