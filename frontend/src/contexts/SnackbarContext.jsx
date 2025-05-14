/**
 * @fileoverview Context provider for managing application-wide snackbar notifications
 * 
 * @module SnackbarContext
 */

import React, { createContext, useState, useCallback } from "react";
import PropTypes from "prop-types";

// MUI Components
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

/**
 * Context for managing snackbar notifications throughout the application
 * @type {React.Context}
 */
export const SnackbarContext = createContext();

/**
 * Provider component for snackbar notifications
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components that will have access to the snackbar context
 */
export const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info", // 'error', 'warning', 'info', 'success'
  });

  /**
   * Shows a snackbar notification with the specified message and severity
   * 
   * @param {string|Object} message - The message to display
   * @param {('error'|'warning'|'info'|'success')} severity - The severity level of the notification
   */
  const showSnackbar = useCallback((message, severity = "info") => {
    // Ensure message is a string
    const formattedMessage = typeof message === 'object' 
      ? JSON.stringify(message) 
      : String(message);
      
    setSnackbar({
      open: true,
      message: formattedMessage,
      severity,
    });
  }, []);

  /**
   * Handles closing the snackbar
   * 
   * @param {Event} event - The event that triggered the close
   * @param {string} reason - The reason for closing ('timeout'|'clickaway')
   */
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4500}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

SnackbarProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
