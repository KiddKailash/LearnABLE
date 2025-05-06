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

    if (reportData.evidence && reportData.evidence instanceof File) {
      formData.append('evidence', reportData.evidence);
      delete reportData.evidence;
    }

    Object.keys(reportData).forEach(key => {
      formData.append(key, reportData[key]);
    });

    return httpClient.post('/api/nccdreports/create/', formData, 'multipart/form-data');
  },

  update: async (id, reportData) => {
    const formData = new FormData();

    if (reportData.evidence && reportData.evidence instanceof File) {
      formData.append('evidence', reportData.evidence);
      delete reportData.evidence;
    }

    Object.keys(reportData).forEach(key => {
      formData.append(key, reportData[key]);
    });

    return httpClient.put(`/api/nccdreports/${id}/`, formData, 'multipart/form-data');
  },

  delete: async (id) => {
    return httpClient.delete(`/api/nccdreports/${id}/`);
  },

  /**
   * Ensure reports exist for a class.
   * @param {number} classId
   */
  ensureReportsForClass: async (classId) => {
    return httpClient.post(`/api/nccdreports/class/${classId}/check-report/`);
  },

  /**
   * Record lesson effectiveness for a report.
   * @param {number} reportId
   * @param {Object} data - { was_effective: 'true' or 'false' }
   */
  createLessonEffectiveness: async (reportId, data) => {
    return httpClient.post(`/api/nccdreports/create-lesson-effectiveness/${reportId}/`, data);
  }
};

export default nccdReportsApi;
