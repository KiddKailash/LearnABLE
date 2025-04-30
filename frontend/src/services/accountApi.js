/**
 * @fileoverview Account API service for user account management
 */

import httpClient from './httpClient';

const accountApi = {
  getProfile: async () => {
    return httpClient.get('/api/teachers/profile/');
  },
  
  updateProfile: async (profileData) => {
    return httpClient.put('/api/teachers/profile/update/', profileData);
  },
  
  changePassword: async (passwordData) => {
    return httpClient.post('/api/teachers/profile/password/change/', passwordData);
  },
  
  updateTheme: async (theme) => {
    return httpClient.post('/api/teachers/profile/theme/', { theme });
  },
  
  updateNotifications: async (notificationPreferences) => {
    return httpClient.post('/api/teachers/profile/notifications/', { notification_preferences: notificationPreferences });
  },
  
  setupTwoFactor: async () => {
    return httpClient.post('/api/teachers/profile/2fa/setup/');
  },
  
  verifyTwoFactor: async (token) => {
    return httpClient.post('/api/teachers/profile/2fa/verify/', { token });
  },
  
  disableTwoFactor: async (token) => {
    return httpClient.post('/api/teachers/profile/2fa/disable/', { token });
  },
  
  uploadProfilePicture: async (formData) => {
    return httpClient.post('/api/teachers/upload-profile-pic/', formData, 'multipart/form-data');
  },
  
  getActiveSessions: async () => {
    return httpClient.get('/api/teachers/profile/sessions/');
  },
  
  terminateSession: async (sessionId) => {
    return httpClient.post('/api/teachers/profile/sessions/terminate/', { session_id: sessionId });
  },
  
  terminateAllSessions: async () => {
    return httpClient.post('/api/teachers/profile/sessions/terminate-all/');
  },
  
  exportAccountData: async () => {
    return httpClient.post('/api/teachers/profile/export-data/');
  },
  
  deleteAccount: async (password) => {
    return httpClient.delete('/api/teachers/profile/delete-account/', { password });
  },
  
  connectGoogleAccount: async (googleToken) => {
    return httpClient.post('/api/teachers/profile/connect-google/', { google_token: googleToken });
  },
  
  disconnectGoogleAccount: async () => {
    return httpClient.post('/api/teachers/profile/disconnect-google/');
  }
};

export default accountApi; 