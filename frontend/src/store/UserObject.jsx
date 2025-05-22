/**
 * @fileoverview Provides a UserContext for managing teacher authentication,
 * registration, and auto-login using React Context API.
 *
 * The context handles:
 *  - Logging in a teacher via POST /teachers/login/
 *  - Two-factor authentication during login
 *  - Logging out by clearing tokens and user info from localStorage
 *  - Registering a teacher via POST /teachers/register/
 *  - Refreshing tokens for future backend enhancements
 *  - Auto-login on mount by checking localStorage for existing tokens/user info
 *
 * The context is intended for teacher users only, with endpoints specific to teacher actions.
 */

import React, { createContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import authApi from "../services/authApi";
import { useTutorial } from "../contexts/TutorialContext";

const UserContext = createContext({
  user: null, // Complete teacher profile info from the server
  isLoggedIn: false, // Whether user is authenticated
  authLoading: true, // While checking if user is auto-logged in
  requires2FA: false, // Whether 2FA verification is required
  tempLoginData: null, // Temporary data during 2FA login
  login: async () => {},
  verify2FA: async () => {}, // Verify 2FA during login
  logout: () => {},
  registerTeacher: async () => {},
  refreshToken: async () => {}, // placeholder if you add a refresh route
  updateUserInfo: (info) => {}, // update user info including theme preference
  setupTwoFactor: async () => {}, // setup 2FA
  verifyAndEnableTwoFactor: async () => {}, // verify and enable 2FA
  disableTwoFactor: async () => {}, // disable 2FA
  get2FAStatus: async () => {}, // get current 2FA status from the server
  twoFactorData: null, // Store 2FA setup data (QR code, secret)
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempLoginData, setTempLoginData] = useState(null);
  const [twoFactorData, setTwoFactorData] = useState(null);
  
  const navigate = useNavigate();
  const tutorialContext = useTutorial();
  const location = useLocation();
  /**
   * Updates user information in context
   * @param {Object} info - User information to update
   */
  const updateUserInfo = (info) => {
    // If theme preference is being updated, save it to localStorage
    if (info.theme_preference) {
      localStorage.setItem("theme_preference", info.theme_preference);
    }
    
    setUser(prevUser => ({
      ...prevUser,
      ...info
    }));
  };

  /**
   * Logs in a teacher.
   *
   * Sends a POST request to /api/teachers/login/ with email and password.
   * On success:
   *  - If 2FA is enabled, sets requires2FA flag and stores email temporarily
   *  - If 2FA is not enabled, completes login process
   *
   * @param {string} email - Teacher's email.
   * @param {string} password - Teacher's password.
   * @returns {Promise<Object>} Result object with success status and message/data.
   */
  const login = async (email, password) => {
    try {
      const data = await authApi.login(email, password);
      
      // Check if 2FA is required
      if (data.two_factor_required) {
        // Store email temporarily for 2FA verification
        setRequires2FA(true);
        setTempLoginData({
          email,
          user_id: data.user_id
        });
        return { 
          success: true, 
          requiresTwoFactor: true 
        };
      }
      
      // No 2FA required - complete login process
      completeLogin(data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Login failed",
      };
    }
  };
  
  /**
   * Verifies 2FA code during login
   * 
   * @param {string} code - Six-digit 2FA code
   * @returns {Promise<Object>} Result object with success status
   */
  const verify2FA = async (code) => {
    try {
      if (!tempLoginData || !tempLoginData.email) {
        throw new Error("Login session expired");
      }
      
      const data = await authApi.verifyTwoFactor(tempLoginData.email, code);
      
      // Complete login process with returned data
      completeLogin(data);
      
      // Reset 2FA state
      setRequires2FA(false);
      setTempLoginData(null);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Two-factor verification failed"
      };
    }
  };
  
  /**
   * Completes login process by storing tokens and user data
   * @param {Object} data - Login response data
   */
  const completeLogin = (data) => {
    // Store tokens in localStorage
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);

    // Store user info for auto-login
    localStorage.setItem("user_id", data.id);
    localStorage.setItem("user_email", data.email);
    
    // Store theme preference if available
    if (data.theme_preference) {
      localStorage.setItem("theme_preference", data.theme_preference);
    }

    // Update state with full profile data
    setUser({
      id: data.id,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      theme_preference: data.theme_preference || 'light',
      two_factor_enabled: data.two_factor_enabled || false,
      last_password_change: data.last_password_change,
      is_first_login: data.is_first_login,
      ...data
    });
    setIsLoggedIn(true);

    // Start tutorial if this is the first login
    if (data.is_first_login && tutorialContext?.startTutorial) {
      tutorialContext.startTutorial();
    }
  };

  /**
   * Logs out the teacher.
   *
   * Clears tokens and user info from localStorage and resets context state.
   */
  const logout = async () => {
    try {
      // Call the backend API to terminate the current session
      await authApi.logout();
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      // Clear localStorage regardless of API success/failure
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("user_email");
      localStorage.removeItem("theme_preference");
      setUser(null);
      setIsLoggedIn(false);
      setRequires2FA(false);
      setTempLoginData(null);
      setTwoFactorData(null);
      navigate("/login");
    }
  };

  /**
   * Registers a new teacher.
   *
   * Sends a POST request to /api/teachers/register/ with { first_name, last_name, email, password }.
   * On success, returns { success: true, data }, else { success: false, message }.
   *
   * @param {string} first_name - Teacher's first name.
   * @param {string} last_name - Teacher's last name.
   * @param {string} email - Teacher's email.
   * @param {string} password - Teacher's password.
   * @returns {Promise<Object>} A result object with success and possible data/message.
   */
  const registerTeacher = async (first_name, last_name, email, password) => {
    try {
      const data = await authApi.register({ 
        first_name, 
        last_name, 
        email, 
        password 
      });
      
      return { success: true, data };
    } catch (error) {
      console.error("Registration error details:", error);
      
      // Format error message properly for display
      let errorMessage = "Error registering teacher";
      
      if (error.data && typeof error.data === 'object') {
        // Handle structured error responses
        const messages = [];
        if (error.data.error) {
          // Simple error object with a single error message
          errorMessage = error.data.error;
        } else {
          // Complex validation errors with multiple fields
          Object.entries(error.data).forEach(([field, fieldErrors]) => {
            if (Array.isArray(fieldErrors)) {
              messages.push(`${field}: ${fieldErrors.join(', ')}`);
            } else if (typeof fieldErrors === 'string') {
              messages.push(`${field}: ${fieldErrors}`);
            }
          });
          
          if (messages.length > 0) {
            errorMessage = messages.join('. ');
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  /**
   * Refreshes JWT access token using refresh token
   * @returns {Promise<Object>} Result object with success status and message/data
   */
  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (!refresh) {
        throw new Error("No refresh token available");
      }
      
      const data = await authApi.refreshToken();
      
      // Update access token in localStorage
      localStorage.setItem("access_token", data.access);
      
      return { success: true, data };
    } catch (error) {
      // If refresh fails, log the user out
      logout();
      return { 
        success: false, 
        message: error.message || "Could not refresh authentication" 
      };
    }
  };
  
  /**
   * Gets the current 2FA status from the server
   * @returns {Promise<Object>} Result object with 2FA status
   */
  const get2FAStatus = async () => {
    try {
      // If we already have 2FA status in the user object, return it
      if (user && typeof user?.two_factor_enabled === 'boolean') {
        return { 
          success: true, 
          two_factor_enabled: user?.two_factor_enabled 
        };
      }
      
      // Otherwise fetch the profile to get the latest 2FA status
      const profileData = await api.account.getProfile();
      
      // Update user with the fresh data
      setUser(prevUser => ({
        ...prevUser,
        ...profileData
      }));
      
      return { 
        success: true, 
        two_factor_enabled: profileData.two_factor_enabled || false 
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to get 2FA status",
        two_factor_enabled: false
      };
    }
  };
  
  /**
   * Sets up two-factor authentication
   * @returns {Promise<Object>} Result object with QR code data
   */
  const setupTwoFactor = async () => {
    try {
      // Use account API instead of auth API for 2FA setup
      const data = await api.account.setupTwoFactor();
      
      // Store the 2FA setup data in context
      setTwoFactorData(data);
      
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to set up two-factor authentication"
      };
    }
  };
  
  /**
   * Verifies and enables two-factor authentication
   * @param {string} code - Six-digit verification code
   * @returns {Promise<Object>} Result object with success status
   */
  const verifyAndEnableTwoFactor = async (code) => {
    try {
      // Use account API instead of auth API for 2FA verification
      await api.account.verifyTwoFactor(code);
      
      // Update user object to show 2FA is enabled
      setUser(prevUser => ({
        ...prevUser,
        two_factor_enabled: true
      }));
      
      // Clear the 2FA setup data as it's no longer needed
      setTwoFactorData(null);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to verify and enable two-factor authentication"
      };
    }
  };
  
  /**
   * Disables two-factor authentication
   * @param {string} code - Six-digit verification code
   * @returns {Promise<Object>} Result object with success status
   */
  const disableTwoFactor = async (code) => {
    try {
      // Use account API instead of auth API for 2FA disable
      await api.account.disableTwoFactor(code);
      
      // Update user object to show 2FA is disabled
      setUser(prevUser => ({
        ...prevUser,
        two_factor_enabled: false
      }));
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to disable two-factor authentication"
      };
    }
  };

  /**
   * Auto-login effect:
   * On mount, checks localStorage for an existing access token & user info.
   */
  useEffect(() => {
    const autoLogin = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setAuthLoading(false);
          return;
        }
        
        // Initialize default theme from localStorage
        const storedTheme = localStorage.getItem("theme_preference") || 'light';
        
        // Set initial user state with minimal data
        const storedUserId = localStorage.getItem("user_id");
        const storedEmail = localStorage.getItem("user_email");
        
        if (storedUserId && storedEmail) {
          // Set minimal user data from localStorage
          setUser({ 
            id: storedUserId,
            email: storedEmail,
            theme_preference: storedTheme
          });
          setIsLoggedIn(true);
          
          // Fetch full profile data to update the user object
          try {
            const profileData = await api.account.getProfile();
            setUser(prevUser => ({
              ...prevUser,
              ...profileData
            }));
          } catch (profileError) {
            console.warn("Error fetching full profile data:", profileError);
          }
        }
        
        // Verify token is valid by making a test API call
        try {
          await api.classes.getAll();
          // If the above API call succeeds, we're authenticated
        } catch (error) {
          // If API call fails with 401, token is invalid
          if (error.status === 401) {
            // Try to refresh the token
            const refreshResult = await refreshToken();
            if (!refreshResult.success) {
              logout();
            }
          } else if (error.status >= 500) {
            // Server error, but we can still consider user logged in
            // if we have the basic user info from localStorage
            console.warn("Server error during auto-login verification:", error);
          } else {
            // Other errors might indicate an invalid session
            logout();
          }
        }
      } finally {
        setAuthLoading(false);
      }
    };
    
    autoLogin();
    //eslint-disable-next-line
  }, [isLoggedIn, location.pathname]); // Reload whenever Logged In state changes

  return (
    <UserContext.Provider
      value={{
        user,
        isLoggedIn,
        authLoading,
        requires2FA,
        tempLoginData,
        login,
        verify2FA,
        logout,
        registerTeacher,
        refreshToken,
        updateUserInfo,
        setupTwoFactor,
        verifyAndEnableTwoFactor,
        disableTwoFactor,
        get2FAStatus,
        twoFactorData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
