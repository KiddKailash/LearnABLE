/**
 * @fileoverview Provides a UserContext for managing teacher authentication,
 * registration, and auto-login using React Context API.
 *
 * The context handles:
 *  - Logging in a teacher via POST /teachers/login/
 *  - Logging out by clearing tokens and user info from localStorage
 *  - Registering a teacher via POST /teachers/register/
 *  - (Placeholder) Refreshing tokens for future backend enhancements
 *  - Auto-login on mount by checking localStorage for existing tokens/user info
 *
 * The context is intended for teacher users only, with endpoints specific to teacher actions.
 */

import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

  // Import environment variables for backend URL
  const BACKEND = process.env.REACT_APP_SERVER_URL;
  
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
      const response = await fetch(`${BACKEND}/api/teachers/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
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
      } else {
        return {
          success: false,
          message: data.message || "Login failed",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "Something went wrong",
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
      const response = await fetch(`${BACKEND}/api/teachers/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name, last_name, email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        // 201 or 200 from backend => success
        return { success: true, data };
      } else {
        // e.g. 400 or 500 from backend
        return {
          success: false,
          message: data.error || data.message || "Error registering teacher",
        };
      }
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        message: "Something went wrong",
      };
    }
  };

  /**
   * Placeholder for refreshing tokens in the future
   */
  const refreshToken = async () => {
    return { success: false, message: "Not implemented" };
  };

  /**
   * Auto-login effect:
   * On mount, checks localStorage for an existing access token & user info.
   */
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const response = fetch(`${BACKEND}/classes/api/classes/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Response:", response.data);

    if (token) {
      // retrieve user data from localStorage
      const storedName = localStorage.getItem("user_name");
      const storedEmail = localStorage.getItem("user_email");

      if (storedName && storedEmail) {
        setUser({ first_name: storedName, email: storedEmail });
      }
      setIsLoggedIn(true);
    }
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    console.log("Updated User Data:", user);
  }, [user]);

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
