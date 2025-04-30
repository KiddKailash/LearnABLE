/**
 * @fileoverview Provides a UserContext for managing teacher authentication,
 * registration, and auto-login using React Context API.
 *
 * The context handles:
 *  - Logging in a teacher via POST /teachers/login/
 *  - Logging out by clearing tokens and user info from localStorage
 *  - Registering a teacher via POST /teachers/register/
 *  - Refreshing tokens for future backend enhancements
 *  - Auto-login on mount by checking localStorage for existing tokens/user info
 *
 * The context is intended for teacher users only, with endpoints specific to teacher actions.
 */

import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import authApi from "../services/authApi";

const UserContext = createContext({
  user: null, // Basic teacher info from the server
  isLoggedIn: false, // Whether user is authenticated
  authLoading: true, // While checking if user is auto-logged in
  login: async () => {},
  logout: () => {},
  registerTeacher: async () => {},
  refreshToken: async () => {}, // placeholder if you add a refresh route
  updateUserInfo: (info) => {}, // update user info including theme preference
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  const navigate = useNavigate();

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
   *  - Stores access and refresh tokens in localStorage.
   *  - Stores user info (name and email) in localStorage.
   *  - Updates context state to reflect logged-in status.
   *
   * @param {string} email - Teacher's email.
   * @param {string} password - Teacher's password.
   * @returns {Promise<Object>} Result object with success status and message/data.
   */
  const login = async (email, password) => {
    try {
      const data = await authApi.login(email, password);
      
      // Store tokens in localStorage
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      // Also store user info for auto-login
      localStorage.setItem("user_name", data.first_name);
      localStorage.setItem("user_email", data.email);
      
      // Store theme preference if available
      if (data.theme_preference) {
        localStorage.setItem("theme_preference", data.theme_preference);
      }

      // Update state
      setUser({
        first_name: data.first_name,
        email: data.email,
        theme_preference: data.theme_preference || 'light',
      });
      setIsLoggedIn(true);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Login failed",
      };
    }
  };

  /**
   * Logs out the teacher.
   *
   * Clears tokens and user info from localStorage and resets context state.
   */
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    localStorage.removeItem("theme_preference");
    setUser(null);
    setIsLoggedIn(false);
    navigate("/login");
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
      // Format error message properly for display
      let errorMessage = "Error registering teacher";
      
      if (error.data && typeof error.data === 'object') {
        // Handle structured error responses
        const messages = [];
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
        const storedName = localStorage.getItem("user_name");
        const storedEmail = localStorage.getItem("user_email");
        if (storedName && storedEmail) {
          setUser({ 
            first_name: storedName, 
            email: storedEmail,
            theme_preference: storedTheme
          });
          setIsLoggedIn(true);
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
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        isLoggedIn,
        authLoading,
        login,
        logout,
        registerTeacher,
        refreshToken,
        updateUserInfo,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
