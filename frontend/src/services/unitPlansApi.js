/**
 * @fileoverview Unit Plans API service
 */

import httpClient from './httpClient';

const unitPlansApi = {
  /**
   * Get all unit plans for the authenticated teacher
   * @returns {Promise<Array>} Array of unit plans
   */
  getAll: async () => {
    return httpClient.get('/api/unit-plans/unitplans/');
  },
  
  /**
   * Get unit plan by ID
   * @param {number} id - Unit plan ID
   * @returns {Promise<Object>} Unit plan object
   */
  getById: async (id) => {
    return httpClient.get(`/api/unit-plans/unitplans/${id}/`);
  },
  
  /**
   * Get unit plan for a specific class
   * @param {number} classId - Class ID
   * @returns {Promise<Object>} Unit plan object
   */
  getByClass: async (classId) => {
    return httpClient.get(`/api/unit-plans/unitplans/for_class/?class_id=${classId}`);
  },
  
  /**
   * Create a new unit plan
   * @param {Object|FormData} unitPlanData - Unit plan data with file
   * @param {boolean} fromCreationFlow - Whether this is part of class creation flow
   * @returns {Promise<Object>} Created unit plan
   */
  create: async (unitPlanData, fromCreationFlow = false) => {
    let formData;
    
    // Check if unitPlanData is already FormData
    if (unitPlanData instanceof FormData) {
      formData = unitPlanData;
      console.log('Using existing FormData for unit plan creation');
      
      // Log all keys and values for debugging (except the file content)
      const formContents = {};
      for (const [key, value] of formData.entries()) {
        if (key === 'document' && value instanceof File) {
          formContents[key] = `File: ${value.name}, type: ${value.type}, size: ${value.size}`;
        } else {
          formContents[key] = value;
        }
      }
      console.log('FormData contents:', formContents);
      
      // Validate required fields
      const document = formData.get('document');
      const classInstance = formData.get('class_instance');
      
      if (!document || !(document instanceof File)) {
        const error = new Error('Missing or invalid document in form data');
        console.error(error);
        throw error;
      }
      
      // Validate class_instance is present and valid
      if (!classInstance || classInstance === 'undefined' || classInstance === 'null') {
        const error = new Error('Class ID is missing or invalid. Please ensure a class is created first.');
        console.error(error);
        throw error;
      }
      
      // Add fromCreationFlow flag if it's not already in the formData and needed
      if (fromCreationFlow && !formData.has('from_creation_flow')) {
        formData.append('from_creation_flow', 'true');
        console.log('Added from_creation_flow to FormData');
      } else if (formData.has('from_creation_flow')) {
        // Ensure from_creation_flow is a string 'true' or 'false', not a boolean
        const currentValue = formData.get('from_creation_flow');
        if (currentValue === true || currentValue === 'true') {
          // Replace with string version to avoid serialization issues
          formData.delete('from_creation_flow');
          formData.append('from_creation_flow', 'true');
          console.log('Converted from_creation_flow to string "true"');
        } else if (currentValue === false || currentValue === 'false') {
          formData.delete('from_creation_flow');
          formData.append('from_creation_flow', 'false');
          console.log('Converted from_creation_flow to string "false"');
        }
      }
    } else {
      // Create new FormData if not already FormData
      console.log('Creating new FormData from object', unitPlanData);
      
      // Validate class_instance exists
      if (!unitPlanData.class_instance || 
          unitPlanData.class_instance === undefined || 
          unitPlanData.class_instance === null) {
        const error = new Error('Class ID is missing or invalid. Please ensure a class is created first.');
        console.error(error);
        throw error;
      }
      
      // Validate document exists
      if (!unitPlanData.document || !(unitPlanData.document instanceof File)) {
        const error = new Error('Missing or invalid document file');
        console.error(error);
        throw error;
      }
      
      formData = new FormData();
      
      // Add document first
      formData.append('document', unitPlanData.document);
      console.log('Added document to FormData:', unitPlanData.document.name);
      delete unitPlanData.document;
      
      // Mark as from creation flow if needed
      if (fromCreationFlow) {
        formData.append('from_creation_flow', 'true');
        console.log('Added from_creation_flow to FormData');
      } else if (unitPlanData.from_creation_flow) {
        // Ensure it's passed as a string, not a boolean
        formData.append('from_creation_flow', 'true');
        console.log('Converted existing from_creation_flow to string "true"');
      }
      
      // Add the rest of the data
      Object.keys(unitPlanData).forEach(key => {
        const value = unitPlanData[key];
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
          console.log(`Added ${key}:${value} to FormData`);
        }
      });
    }
    
    try {
      console.log('Sending unit plan create request to API');
      
      // Extra validation before sending
      if (!formData.has('document')) {
        throw new Error('Document is missing from form data before sending');
      }
      
      if (!formData.has('class_instance')) {
        throw new Error('Class ID is missing from form data before sending');
      }
      
      const response = await httpClient.post('/api/unit-plans/unitplans/', formData, 'multipart/form-data');
      console.log('Unit plan create API response:', response);
      return response;
    } catch (error) {
      console.error('Unit plan creation failed:', error);
      
      // Enhance error message with more details
      if (error.status === 500) {
        // Try to extract more information from the error
        const enhancedError = new Error(`Server error (${error.status}): ${error.message || 'Unknown error'}`);
        enhancedError.originalError = error;
        throw enhancedError;
      }
      
      throw error;
    }
  },
  
  /**
   * Update an existing unit plan
   * @param {number} id - Unit plan ID
   * @param {Object} unitPlanData - Unit plan data with optional file
   * @returns {Promise<Object>} Updated unit plan
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
    
    return httpClient.put(`/api/unit-plans/unitplans/${id}/`, formData, 'multipart/form-data');
  },
  
  /**
   * Replace just the document of an existing unit plan
   * @param {number} classId - Class ID
   * @param {File} document - New document file
   * @returns {Promise<Object>} Updated unit plan
   */
  replaceDocument: async (classId, document) => {
    const formData = new FormData();
    formData.append('class_instance', classId);
    formData.append('document', document);
    
    return httpClient.post('/api/unit-plans/unitplans/replace_document/', formData, 'multipart/form-data');
  },
  
  /**
   * Delete a unit plan
   * @param {number} id - Unit plan ID
   * @returns {Promise<Object>} Response object
   */
  delete: async (id) => {
    return httpClient.delete(`/api/unit-plans/unitplans/${id}/`);
  },

  /**
   * Download a unit plan document
   * @param {number} id - Unit plan ID
   * @returns {Promise<Blob>} Document blob for download
   */
  download: async (id) => {
    try {
      console.log(`Downloading unit plan document with ID: ${id}`);
      // Use httpClient instead of direct fetch with API_BASE_URL
      const response = await httpClient.get(`/api/unit-plans/unitplans/${id}/download/`, null, 'blob');
      console.log('Unit plan document downloaded successfully');
      return response;
    } catch (error) {
      console.error('Error downloading unit plan document:', error);
      throw new Error('Failed to download unit plan: ' + (error.message || 'Unknown error'));
    }
  }
};

export default unitPlansApi; 