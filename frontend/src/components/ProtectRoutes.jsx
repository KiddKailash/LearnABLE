/**
 * @fileoverview ProtectRoute component that restricts access to authenticated users only.
 */

import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import UserContext from "../contexts/UserObject";

// MUI Components
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

/**
 * @typedef {Object} ProtectRouteProps
 * @property {React.ReactNode} children - Content to render if authenticated
 */

/**
 * ProtectRoute component that restricts access to authenticated users only.
 * Shows a loading spinner while authentication status is being determined.
 * Redirects to login if not authenticated.
 *
 * @component
 * @example
 * <ProtectRoute>
 *   <Dashboard />
 * </ProtectRoute>
 */
const ProtectRoute = ({ children }) => {
  const { isLoggedIn, authLoading } = useContext(UserContext);

  // Wait until we finish checking login status
  if (authLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If we are not logged in, redirect
  if (!isLoggedIn) {
    return <Navigate to="/login?mode=login" replace />;
  }

  return children;
};

ProtectRoute.propTypes = {
  /** Content to render if authenticated */
  children: PropTypes.node.isRequired,
};

export default ProtectRoute;
