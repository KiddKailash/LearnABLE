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
    try {
      console.log("Creating class with data:", classData);
      const response = await httpClient.post('/api/classes/create/', classData);
      console.log("Raw class creation response:", response);
      
      // Our backend returns a response with class_id and class_data
      if (response && response.class_id) {
        // Add an id property for consistency with other APIs
        return {
          ...response,
          id: response.class_id,
          // Extract the full class data if available
          ...(response.class_data || {})
        };
      }
      
      // Fallback handling for other response formats
      if (response && typeof response === 'object') {
        // If the response already has an id property, return it directly
        if (response.id) {
          return response;
        }
        
        // If the id is nested in a data property
        if (response.data && response.data.id) {
          return {
            ...response,
            id: response.data.id
          };
        }
        
        // If the id is under a different key
        const possibleIdKeys = ['classId', 'pk'];
        for (const key of possibleIdKeys) {
          if (response[key]) {
            return {
              ...response,
              id: response[key]
            };
          }
        }
      }
      
      // If we got here, we couldn't find an ID, but return the response anyway
      console.warn("Class created, but ID not found in response:", response);
      return response;
    } catch (error) {
      console.error("Error creating class:", error);
      throw error;
    }
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