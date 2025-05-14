/**
 * @fileoverview Account API service for managing user profiles, preferences, and security settings
 * 
 * @module accountApi
 */

import httpClient from './httpClient';

/**
 * Account API service
 * @type {Object}
 */
const accountApi = {
  /**
   * Retrieves the current user's profile
   * 
   * @returns {Promise<Object>} User profile data
   */
  getProfile: async () => {
    return httpClient.get('/api/teachers/profile/');
  },
  
  /**
   * Updates the current user's profile
   * 
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} Updated profile data
   */
  updateProfile: async (profileData) => {
    return httpClient.put('/api/teachers/profile/update/', profileData);
  },
  
  /**
   * Changes the user's password
   * 
   * @param {Object} passwordData - Password change data
   * @returns {Promise<Object>} Password change confirmation
   */
  changePassword: async (passwordData) => {
    return httpClient.post('/api/teachers/profile/password/change/', passwordData);
  },
  
  /**
   * Updates the user's theme preference
   * 
   * @param {string} theme - The theme to set
   * @returns {Promise<Object>} Theme update confirmation
   */
  updateTheme: async (theme) => {
    return httpClient.post('/api/teachers/profile/theme/', { theme });
  },
  
  /**
   * Updates the user's notification preferences
   * 
   * @param {Object} notificationPreferences - Updated notification settings
   * @returns {Promise<Object>} Notification preferences update confirmation
   */
  updateNotifications: async (notificationPreferences) => {
    return httpClient.post('/api/teachers/profile/notifications/', { 
      notification_preferences: notificationPreferences 
    });
  },
  
  /**
   * Initiates two-factor authentication setup
   * 
   * @returns {Promise<Object>} 2FA setup data
   */
  setupTwoFactor: async () => {
    return httpClient.post('/api/teachers/profile/2fa/setup/');
  },
  
  /**
   * Verifies and enables two-factor authentication
   * 
   * @param {string} token - The 2FA verification token
   * @returns {Promise<Object>} 2FA verification confirmation
   */
  verifyTwoFactor: async (token) => {
    return httpClient.post('/api/teachers/profile/2fa/verify/', { token });
  },
  
  /**
   * Disables two-factor authentication
   * 
   * @param {string} token - The 2FA verification token
   * @returns {Promise<Object>} 2FA disable confirmation
   */
  disableTwoFactor: async (token) => {
    return httpClient.post('/api/teachers/profile/2fa/disable/', { token });
  },
  
  /**
   * Uploads a new profile picture
   * 
   * @param {FormData} formData - Form data containing the image file
   * @returns {Promise<Object>} Profile picture update confirmation
   */
  uploadProfilePicture: async (formData) => {
    return httpClient.post(
      '/api/teachers/upload-profile-pic/', 
      formData, 
      'multipart/form-data'
    );
  },
  
  /**
   * Retrieves the user's active sessions
   * 
   * @returns {Promise<Array>} List of active sessions
   */
  getActiveSessions: async () => {
    return httpClient.get('/api/teachers/profile/sessions/');
  },
  
  /**
   * Terminates a specific session
   * 
   * @param {string} sessionId - The session ID to terminate
   * @returns {Promise<Object>} Session termination confirmation
   */
  terminateSession: async (sessionId) => {
    return httpClient.post('/api/teachers/profile/sessions/terminate/', { 
      session_id: sessionId 
    });
  },
  
  /**
   * Terminates all active sessions except the current one
   * 
   * @returns {Promise<Object>} Sessions termination confirmation
   */
  terminateAllSessions: async () => {
    return httpClient.post('/api/teachers/profile/sessions/terminate-all/');
  },
  
  /**
   * Exports the user's account data
   * 
   * @param {Object} [exportOptions={}] - Options for data export
   * @returns {Promise<Object>} Export data or confirmation
   */
  exportAccountData: async (exportOptions) => {
    return httpClient.post('/api/teachers/profile/export-data/', exportOptions || {});
  },
  
  /**
   * Deletes the user's account
   * 
   * @param {string} password - User's password for verification
   * @returns {Promise<Object>} Account deletion confirmation
   */
  deleteAccount: async (password) => {
    return httpClient.delete('/api/teachers/profile/delete-account/', { password });
  },
  
  /**
   * Connects a Google account to the user's profile
   * 
   * @param {string} googleToken - Google authentication token
   * @returns {Promise<Object>} Google account connection confirmation
   */
  connectGoogleAccount: async (googleToken) => {
    return httpClient.post('/api/teachers/profile/connect-google/', { 
      google_token: googleToken 
    });
  },
  
  /**
   * Disconnects the Google account from the user's profile
   * 
   * @returns {Promise<Object>} Google account disconnection confirmation
   */
  disconnectGoogleAccount: async () => {
    return httpClient.post('/api/teachers/profile/disconnect-google/');
  },

  /**
   * Updates the user's first login status
   * 
   * @returns {Promise<Object>} Status update confirmation
   */
  updateFirstLoginStatus: async () => {
    return httpClient.post('/api/teachers/profile/first-login/');
  }
};

export default accountApi; 