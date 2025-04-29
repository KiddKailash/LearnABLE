/**
 * @fileoverview Centralized API service for handling all API requests.
 * This service uses environment variables for base URLs and ensures consistent
 * request handling, authentication, and error management across the application.
 */

// Use environment variable for backend URL or fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:8000';

/**
 * Creates headers with authentication token if available
 * @returns {Object} Headers object with content type and auth token if available
 */
const getHeaders = (contentType = 'application/json') => {
  const headers = {
    'Content-Type': contentType,
  };
  
  const token = localStorage.getItem('access_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Handles API responses consistently
 * @param {Response} response - Fetch API response
 * @returns {Promise} Parsed response data or error
 */
const handleResponse = async (response) => {
  // Special case for 204 No Content
  if (response.status === 204) {
    return { success: true };
  }

  // For responses with content
  const contentType = response.headers.get('content-type');
  let data;
  
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    // Handle non-JSON responses
    data = await response.text();
  }
  
  if (!response.ok) {
    // Create standardized error object
    const error = {
      status: response.status,
      message: data.message || data.error || data.detail || 'Something went wrong',
      data: data
    };
    
    // Handle token expiration (401 Unauthorized)
    if (response.status === 401 && !window.location.pathname.includes('/login')) {
      // Attempt token refresh before redirecting
      try {
        await api.auth.refreshToken();
        // If refresh succeeds, retry the original request
        return api._retryRequest(response.url, response.method, response.body);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    throw error;
  }
  
  return data;
};

/**
 * API service object with methods for different HTTP requests
 */
const api = {
  // Retry a failed request after token refresh
  _retryRequest: async (url, method, body) => {
    const options = {
      method,
      headers: getHeaders(),
    };
    
    if (body) options.body = body;
    
    const response = await fetch(url, options);
    return handleResponse(response);
  },

  // Authentication endpoints
  auth: {
    login: async (email, password) => {
      return api.post('/api/teachers/login/', { email, password });
    },
    
    register: async (userData) => {
      return api.post('/api/teachers/register/', userData);
    },
    
    refreshToken: async () => {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) throw new Error('No refresh token available');
      
      return api.post('/api/token/refresh/', { refresh });
    },
    
    changePassword: async (data) => {
      return api.post('/api/teachers/change-password/', data);
    },
  },

  // Class management endpoints
  classes: {
    getAll: async () => {
      return api.get('/api/classes/');
    },
    
    getById: async (id) => {
      return api.get(`/api/classes/${id}/`);
    },
    
    create: async (classData) => {
      return api.post('/api/classes/create/', classData);
    },
    
    update: async (id, classData) => {
      return api.put(`/api/classes/${id}/`, classData);
    },
    
    delete: async (id) => {
      return api.delete(`/api/classes/${id}/`);
    },
    
    addStudent: async (classId, studentId) => {
      return api.post(`/api/classes/${classId}/add-student/`, { student_id: studentId });
    },
    
    removeStudent: async (classId, studentId) => {
      return api.post(`/api/classes/${classId}/remove-student/`, { student_id: studentId });
    },
    
    uploadStudentCSV: async (formData) => {
      return api.post('/api/classes/upload-csv/', formData, 'multipart/form-data');
    }
  },

  // Student management endpoints
  students: {
    getAll: async () => {
      return api.get('/api/students/');
    },
    
    getById: async (id) => {
      return api.get(`/api/students/${id}/`);
    },
    
    create: async (studentData) => {
      return api.post('/api/students/create/', studentData);
    },
    
    update: async (id, studentData) => {
      return api.patch(`/api/students/${id}/patch/`, studentData);
    },
    
    delete: async (id) => {
      return api.delete(`/api/students/${id}/delete/`);
    },
    
    findByEmail: async (email) => {
      return api.post('/api/students/by-email/', { email });
    }
  },

  // NCCD reports endpoints
  nccdReports: {
    getAll: async () => {
      return api.get('/api/nccdreports/');
    },
    
    getByStudent: async (studentId) => {
      return api.get(`/api/nccdreports/student/${studentId}/`);
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
      
      return api.post('/api/nccdreports/create/', formData, 'multipart/form-data');
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
      
      return api.put(`/api/nccdreports/${id}/`, formData, 'multipart/form-data');
    },
    
    delete: async (id) => {
      return api.delete(`/api/nccdreports/${id}/`);
    }
  },

  // Assessment endpoints
  assessments: {
    getAll: async () => {
      return api.get('/api/assessments/');
    },
    
    getByClass: async (classId) => {
      return api.get(`/api/assessments/class/${classId}/`);
    },
    
    create: async (assessmentData) => {
      return api.post('/api/assessments/create/', assessmentData);
    },
    
    update: async (id, assessmentData) => {
      return api.put(`/api/assessments/${id}/`, assessmentData);
    },
    
    delete: async (id) => {
      return api.delete(`/api/assessments/${id}/`);
    }
  },

  // Student grades endpoints
  studentGrades: {
    getByAssessment: async (assessmentId) => {
      return api.get(`/api/studentgrades/assessment/${assessmentId}/`);
    },
    
    getByStudent: async (studentId) => {
      return api.get(`/api/studentgrades/student/${studentId}/`);
    },
    
    create: async (gradeData) => {
      return api.post('/api/studentgrades/create/', gradeData);
    },
    
    update: async (id, gradeData) => {
      return api.put(`/api/studentgrades/${id}/`, gradeData);
    }
  },

  // Attendance endpoints
  attendance: {
    getSessions: async (classId) => {
      return api.get(`/api/attendancesessions/class/${classId}/`);
    },
    
    createSession: async (sessionData) => {
      return api.post('/api/attendancesessions/create/', sessionData);
    },
    
    recordAttendance: async (attendanceData) => {
      return api.post('/api/studentattendance/create/', attendanceData);
    },
    
    getStudentAttendance: async (studentId) => {
      return api.get(`/api/studentattendance/student/${studentId}/`);
    }
  },

  // Learning materials endpoints
  learningMaterials: {
    getAll: async () => {
      return api.get('/api/learning-materials/');
    },
    
    getByClass: async (classId) => {
      return api.get(`/api/learning-materials/class/${classId}/`);
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
      
      return api.post('/api/learning-materials/create/', formData, 'multipart/form-data');
    },
    
    delete: async (id) => {
      return api.delete(`/api/learning-materials/${id}/`);
    }
  },

  // AI Assistant endpoint
  ai: {
    askOpenAI: async (message) => {
      return api.post('/api/ask-openai/', { message });
    }
  },

  // GET request
  get: async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`GET ${endpoint} error:`, error);
      throw error;
    }
  },
  
  // POST request
  post: async (endpoint, data, contentType = 'application/json') => {
    try {
      const options = {
        method: 'POST',
        headers: getHeaders(contentType),
      };
      
      // Handle different content types
      if (contentType.includes('application/json')) {
        options.body = JSON.stringify(data);
      } else if (data instanceof FormData) {
        // Don't set Content-Type for FormData (browser will set it with boundary)
        delete options.headers['Content-Type'];
        options.body = data;
      } else {
        options.body = data;
      }
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      return await handleResponse(response);
    } catch (error) {
      console.error(`POST ${endpoint} error:`, error);
      throw error;
    }
  },
  
  // PUT request
  put: async (endpoint, data, contentType = 'application/json') => {
    try {
      const options = {
        method: 'PUT',
        headers: getHeaders(contentType),
      };
      
      // Handle different content types
      if (contentType.includes('application/json')) {
        options.body = JSON.stringify(data);
      } else if (data instanceof FormData) {
        // Don't set Content-Type for FormData (browser will set it with boundary)
        delete options.headers['Content-Type'];
        options.body = data;
      } else {
        options.body = data;
      }
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      return await handleResponse(response);
    } catch (error) {
      console.error(`PUT ${endpoint} error:`, error);
      throw error;
    }
  },
  
  // PATCH request
  patch: async (endpoint, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`PATCH ${endpoint} error:`, error);
      throw error;
    }
  },
  
  // DELETE request
  delete: async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`DELETE ${endpoint} error:`, error);
      throw error;
    }
  }
};

export default api; 