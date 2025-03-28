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

/**
 * Creates a UserContext with default values.
 *
 * Default context object properties:
 *  - user: null (basic teacher info from the server)
 *  - isLoggedIn: false (whether the teacher is authenticated)
 *  - authLoading: true (loading state during auto-login check)
 *  - login: async function placeholder for logging in
 *  - logout: function placeholder for logging out
 *  - registerTeacher: async function placeholder for teacher registration
 *  - refreshToken: async function placeholder for refreshing tokens
 */
const UserContext = createContext({
  user: null, // Basic teacher info from the server
  isLoggedIn: false, // Whether user is authenticated
  authLoading: true, // While checking if user is auto-logged in
  login: async () => {},
  logout: () => {},
  registerTeacher: async () => {},
  refreshToken: async () => {}, // placeholder if you add a refresh route
});

/**
 * UserProvider component that wraps child components with UserContext.Provider.
 *
 * It manages authentication state and provides helper functions:
 *
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.children - Child components to be wrapped.
 *
 * @returns {JSX.Element} Provider component with authentication context.
 */
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const navigate = useNavigate();

  /**
   * Logs in a teacher.
   *
   * Sends a POST request to /teachers/login/ with email and password.
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
      const response = await fetch("http://localhost:8000/teachers/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        // Store tokens in localStorage
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        // Also store user info in localStorage for auto-login
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
   * Sends a POST request to /teachers/register/ with name, email, and password.
   * On success, returns the server response containing a message and teacher_id.
   *
   * @param {string} first_name - Teacher's name.
   * @param {string} email - Teacher's email.
   * @param {string} password - Teacher's password.
   * @returns {Promise<Object>} Result object with success status and message/data.
   */
  const registerTeacher = async (first_name, email, password) => {
    try {
      const response = await fetch("http://localhost:8000/teachers/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name, email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return {
          success: false,
          message: data.message || "Error registering teacher",
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
   * Refreshes the authentication token.
   *
   * This is a placeholder function for future expansion if a token refresh endpoint is added.
   *
   * @returns {Promise<Object>} Result object indicating the function is not implemented.
   */
  const refreshToken = async () => {
    // For future expansion if you add /token/refresh/ or similar
    return { success: false, message: "Not implemented" };
  };

  /**
   * Auto-login effect.
   *
   * Checks localStorage on component mount for an existing access token and user info.
   * If found, updates the state to mark the teacher as logged in.
   * This simulates auto-login; in a real scenario, you might validate the token.
   */
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      // retrieve user data from localStorage
      const storedName = localStorage.getItem("user_name");
      const storedEmail = localStorage.getItem("user_email");

      // If there is a name/email, set them in state
      if (storedName && storedEmail) {
        setUser({ first_name: storedName, email: storedEmail });
      } else {
        // If you had a /teachers/profile/ route, you'd fetch it here
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
