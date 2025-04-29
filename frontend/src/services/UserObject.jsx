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
import api from "./api";

const UserContext = createContext({
  user: null, // Basic teacher info from the server
  isLoggedIn: false, // Whether user is authenticated
  authLoading: true, // While checking if user is auto-logged in
  login: async () => {},
  logout: () => {},
  registerTeacher: async () => {},
  refreshToken: async () => {}, // placeholder if you add a refresh route
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  const navigate = useNavigate();

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
      const data = await api.post('/api/teachers/login/', { email, password });
      
      // Store tokens in localStorage
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      // Also store user info for auto-login
      localStorage.setItem("user_name", data.first_name);
      localStorage.setItem("user_email", data.email);

      // Update state
      setUser({
        first_name: data.first_name,
        email: data.email,
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
      const data = await api.post('/api/teachers/register/', { 
        first_name, 
        last_name, 
        email, 
        password 
      });
      
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error registering teacher",
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
      
      const data = await api.post('/api/token/refresh/', { refresh });
      
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
        
        // Verify token is valid by making a test API call
        try {
          await api.get('/api/classes/');
          
          // If API call succeeds, retrieve user data from localStorage
          const storedName = localStorage.getItem("user_name");
          const storedEmail = localStorage.getItem("user_email");
          
          if (storedName && storedEmail) {
            setUser({ first_name: storedName, email: storedEmail });
            setIsLoggedIn(true);
          } else {
            // Missing user data, clear invalid session
            logout();
          }
        } catch (error) {
          // If API call fails with 401, token is invalid
          if (error.status === 401) {
            // Try to refresh the token
            const refreshResult = await refreshToken();
            if (!refreshResult.success) {
              logout();
            }
          } else {
            // Other error, but we can still consider user logged in
            // if we have the basic user info
            const storedName = localStorage.getItem("user_name");
            const storedEmail = localStorage.getItem("user_email");
            
            if (storedName && storedEmail) {
              setUser({ first_name: storedName, email: storedEmail });
              setIsLoggedIn(true);
            }
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
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
