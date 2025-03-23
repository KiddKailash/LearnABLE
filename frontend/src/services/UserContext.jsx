import React, { createContext, useState, useEffect } from "react";

/**
 * @fileoverview Provides a UserContext with dummy authentication logic for development.
 *
 * The UserContext supplies authentication state (isLoggedIn), a loading flag (authLoading) to indicate
 * when authentication is being checked, and simple login and logout functions. This is placeholder logic
 * until the backend is implemented.
 *
 * @module UserContext
 */

// Create a context with default values
const UserContext = createContext({
  isLoggedIn: false,
  authLoading: true,
  login: () => {},
  logout: () => {},
});

/**
 * UserProvider component that simulates an asynchronous authentication check.
 *
 * This provider wraps the application and makes authentication state available via the context.
 * For now, it simulates a 1-second delay before setting authLoading to false and defaults to not logged in.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Child components that will have access to UserContext.
 * @returns {JSX.Element} The UserContext provider.
 */
export const UserProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Simulate an asynchronous authentication check
  useEffect(() => {
    const timer = setTimeout(() => {
      // For now, we assume the user is not logged in.
      setIsLoggedIn(false);
      setAuthLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Dummy login function
  const login = () => {
    setIsLoggedIn(true);
  };

  // Dummy logout function
  const logout = () => {
    setIsLoggedIn(false);
  };

  return (
    <UserContext.Provider value={{ isLoggedIn, authLoading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
