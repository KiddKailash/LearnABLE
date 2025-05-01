/**
 * @fileoverview Attendance API service
 */

import httpClient from './httpClient';

const attendanceApi = {
  getSessions: async (classId) => {
    return httpClient.get(`/api/attendancesessions/class/${classId}/`);
  },
  
  createSession: async (sessionData) => {
    return httpClient.post('/api/attendancesessions/create/', sessionData);
  },
  
  recordAttendance: async (attendanceData) => {
    return httpClient.post('/api/studentattendance/create/', attendanceData);
  },
  
  getStudentAttendance: async (studentId) => {
    return httpClient.get(`/api/studentattendance/student/${studentId}/`);
  }
};

export default attendanceApi; 