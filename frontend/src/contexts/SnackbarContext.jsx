import React, { createContext, useState, useCallback } from "react";
import PropTypes from "prop-types";

// MUIs
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

//eslint-disable-next-line
export const SnackbarContext = createContext();

export const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info", // 'error', 'warning', 'info', 'success'
  });

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

// PropTypes Validation
SnackbarProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
