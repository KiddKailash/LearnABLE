/**
 * @fileoverview Learning Materials API service for managing educational resources and materials
 * 
 * @module learningMaterialsApi
 */

import httpClient from './httpClient';

/**
 * Prepares FormData for material creation
 * 
 * @param {Object} data - The material data
 * @returns {FormData} Prepared FormData object
 * @private
 */
const _prepareFormData = (data) => {
  const formData = new FormData();
  
  // Handle file upload
  if (data.file && data.file instanceof File) {
    formData.append('file', data.file);
    delete data.file;
  }
  
  // Add remaining data
  Object.keys(data).forEach(key => {
    formData.append(key, data[key]);
  });
  
  return formData;
};

/**
 * Learning Materials API service
 * @type {Object}
 */
const learningMaterialsApi = {
  /**
   * Retrieves all learning materials
   * 
   * @returns {Promise<Array>} List of learning materials
   */
  getAll: async () => {
    return httpClient.get('/api/learning-materials/');
  },
  
  /**
   * Retrieves learning materials for a specific class
   * 
   * @param {string|number} classId - The class ID
   * @returns {Promise<Array>} List of class learning materials
   */
  getByClass: async (classId) => {
    return httpClient.get(`/api/learning-materials/class/${classId}/`);
  },
  
  /**
   * Creates a new learning material
   * 
   * @param {Object} materialData - The material data with optional file
   * @returns {Promise<Object>} Created material data
   */
  create: async (materialData) => {
    const formData = _prepareFormData(materialData);
    return httpClient.post('/api/learning-materials/', formData, 'multipart/form-data');
  },
  
  /**
   * Deletes a learning material
   * 
   * @param {string|number} id - The material ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  delete: async (id) => {
    return httpClient.delete(`/api/learning-materials/${id}/`);
  },

  /**
   * Requests adaptation of a learning material
   * 
   * @param {string|number} materialId - The material ID
   * @returns {Promise<Object>} Adaptation request confirmation
   */
  adapt: async (materialId) => {
    return httpClient.post(`/api/learning-materials/${materialId}/adapt/`);
  }
};

export default learningMaterialsApi; 