/**
 * @fileoverview Unit Plans API service for managing educational unit plans and their documents
 * 
 * @module unitPlansApi
 */

import httpClient from './httpClient';

/**
 * Validates and prepares FormData for unit plan creation/update
 * 
 * @param {Object|FormData} data - The unit plan data
 * @param {boolean} [fromCreationFlow=false] - Whether this is part of class creation flow
 * @returns {FormData} Prepared FormData object
 * @throws {Error} If required fields are missing or invalid
 * @private
 */
const _prepareFormData = (data, fromCreationFlow = false) => {
  let formData;
  
  // Handle existing FormData
  if (data instanceof FormData) {
    formData = data;
    console.log('Using existing FormData for unit plan');
    
    // Log form contents for debugging (except file content)
    const formContents = {};
    for (const [key, value] of formData.entries()) {
      if (key === 'document' && value instanceof File) {
        formContents[key] = `File: ${value.name}, type: ${value.type}, size: ${value.size}`;
      } else {
        formContents[key] = value;
      }
    }
    console.log('FormData contents:', formContents);
  } else {
    // Create new FormData from object
    console.log('Creating new FormData from object', data);
    formData = new FormData();
    
    // Add document first
    if (data.document) {
      formData.append('document', data.document);
      console.log('Added document to FormData:', data.document.name);
      delete data.document;
    }
    
    // Add the rest of the data
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
        console.log(`Added ${key}:${value} to FormData`);
      }
    });
  }
  
  // Validate required fields
  const document = formData.get('document');
  const classInstance = formData.get('class_instance');
  
  if (!document || !(document instanceof File)) {
    throw new Error('Missing or invalid document in form data');
  }
  
  if (!classInstance || classInstance === 'undefined' || classInstance === 'null') {
    throw new Error('Class ID is missing or invalid. Please ensure a class is created first.');
  }
  
  // Handle fromCreationFlow flag
  if (fromCreationFlow) {
    formData.delete('from_creation_flow');
    formData.append('from_creation_flow', 'true');
    console.log('Added from_creation_flow to FormData');
  } else if (formData.has('from_creation_flow')) {
    const currentValue = formData.get('from_creation_flow');
    formData.delete('from_creation_flow');
    formData.append('from_creation_flow', 
      (currentValue === true || currentValue === 'true') ? 'true' : 'false');
    console.log('Normalized from_creation_flow value');
  }
  
  return formData;
};

/**
 * Unit Plans API service
 * @type {Object}
 */
const unitPlansApi = {
  /**
   * Retrieves all unit plans for the authenticated teacher
   * 
   * @returns {Promise<Array>} List of unit plans
   */
  getAll: async () => {
    return httpClient.get('/api/unit-plans/unitplans/');
  },
  
  /**
   * Retrieves a unit plan by ID
   * 
   * @param {string|number} id - The unit plan ID
   * @returns {Promise<Object>} Unit plan data
   */
  getById: async (id) => {
    return httpClient.get(`/api/unit-plans/unitplans/${id}/`);
  },
  
  /**
   * Retrieves a unit plan for a specific class
   * 
   * @param {string|number} classId - The class ID
   * @returns {Promise<Object>} Unit plan data
   */
  getByClass: async (classId) => {
    return httpClient.get(`/api/unit-plans/unitplans/for_class/?class_id=${classId}`);
  },
  
  /**
   * Creates a new unit plan
   * 
   * @param {Object|FormData} unitPlanData - Unit plan data with file
   * @param {boolean} [fromCreationFlow=false] - Whether this is part of class creation flow
   * @returns {Promise<Object>} Created unit plan data
   * @throws {Error} If creation fails or required fields are missing
   */
  create: async (unitPlanData, fromCreationFlow = false) => {
    try {
      console.log('Preparing unit plan creation request');
      const formData = _prepareFormData(unitPlanData, fromCreationFlow);
      
      console.log('Sending unit plan create request to API');
      const response = await httpClient.post(
        '/api/unit-plans/unitplans/', 
        formData, 
        'multipart/form-data'
      );
      
      console.log('Unit plan create API response:', response);
      return response;
    } catch (error) {
      console.error('Unit plan creation failed:', error);
      
      if (error.status === 500) {
        const enhancedError = new Error(
          `Server error (${error.status}): ${error.message || 'Unknown error'}`
        );
        enhancedError.originalError = error;
        throw enhancedError;
      }
      
      throw error;
    }
  },
  
  /**
   * Updates an existing unit plan
   * 
   * @param {string|number} id - The unit plan ID
   * @param {Object} unitPlanData - Updated unit plan data with optional file
   * @returns {Promise<Object>} Updated unit plan data
   */
  update: async (id, unitPlanData) => {
    const formData = new FormData();
    
    // Handle document upload if a new file is provided
    if (unitPlanData.document && unitPlanData.document instanceof File) {
      formData.append('document', unitPlanData.document);
      delete unitPlanData.document;
    }
    
    // Add the rest of the data
    Object.keys(unitPlanData).forEach(key => {
      formData.append(key, unitPlanData[key]);
    });
    
    return httpClient.put(
      `/api/unit-plans/unitplans/${id}/`, 
      formData, 
      'multipart/form-data'
    );
  },
  
  /**
   * Replaces just the document of an existing unit plan
   * 
   * @param {string|number} classId - The class ID
   * @param {File} document - New document file
   * @returns {Promise<Object>} Updated unit plan data
   */
  replaceDocument: async (classId, document) => {
    const formData = new FormData();
    formData.append('class_instance', classId);
    formData.append('document', document);
    
    return httpClient.post(
      '/api/unit-plans/unitplans/replace_document/', 
      formData, 
      'multipart/form-data'
    );
  },
  
  /**
   * Deletes a unit plan
   * 
   * @param {string|number} id - The unit plan ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  delete: async (id) => {
    return httpClient.delete(`/api/unit-plans/unitplans/${id}/`);
  },

  /**
   * Downloads a unit plan document
   * 
   * @param {string|number} id - The unit plan ID
   * @returns {Promise<Blob>} Document blob for download
   * @throws {Error} If download fails
   */
  download: async (id) => {
    try {
      console.log(`Downloading unit plan document with ID: ${id}`);
      const response = await httpClient.get(
        `/api/unit-plans/unitplans/${id}/download/`, 
        null, 
        'blob'
      );
      console.log('Unit plan document downloaded successfully');
      return response;
    } catch (error) {
      console.error('Error downloading unit plan document:', error);
      throw new Error('Failed to download unit plan: ' + (error.message || 'Unknown error'));
    }
  }
};

export default unitPlansApi; 