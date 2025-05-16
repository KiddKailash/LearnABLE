/**
 * @fileoverview Error Boundary component that catches JavaScript errors 
 * in its child component tree.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";

// MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Fade from "@mui/material/Fade";

// MUI Icons
import HomeIcon from "@mui/icons-material/Home";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

// Utils
import { getErrorInfo } from "../utils/errorHandling";

/**
 * @typedef {Object} ErrorBoundaryProps
 * @property {React.ReactNode} children - Child components to render
 * @property {React.ReactNode|Function} [fallback] - Custom fallback UI or function to render
 */

/**
 * @typedef {Object} ErrorBoundaryState
 * @property {boolean} hasError - Whether an error has occurred
 * @property {Error|null} error - The error that occurred
 * @property {Object|null} errorInfo - Additional error information
 * @property {boolean} showDetails - Whether to show error details
 */

/**
 * Error Boundary component that catches errors in its child components
 * and displays a fallback UI instead of crashing the whole app.
 */
class ErrorBoundary extends Component {
  /** @type {ErrorBoundaryState} */
  state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };

  /**
   * Update state when an error occurs
   * @param {Error} error - The error that occurred
   * @returns {ErrorBoundaryState} New state
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * Capture error information for logging
   * @param {Error} error - The error that occurred
   * @param {Object} errorInfo - Additional error information
   */
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  /**
   * Attempt to recover by resetting the error state
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  /**
   * Fully reload the page
   */
  handleReload = () => {
    window.location.reload();
  };

  /**
   * Navigate to home page
   */
  handleGoHome = () => {
    window.location.href = "/";
  };

  /**
   * Toggle error details visibility
   */
  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  /**
   * Render error details section
   * @param {Object} errorInfo - Error information to display
   * @returns {React.ReactNode}
   */
  renderErrorDetails(errorInfo) {
    if (!errorInfo) return null;

    return (
      <Fade in={true}>
        <Box
          sx={{
            mt: 3,
            p: 2,
            bgcolor: "grey.50",
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle2" gutterBottom color="text.secondary">
            Technical Details:
          </Typography>
          <Typography
            variant="body2"
            component="pre"
            sx={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: "0.8rem",
                    color: "text.secondary",
              m: 0,
              fontFamily: "monospace",
                }}
              >
            {errorInfo.componentStack}
                  </Typography>
              </Box>
      </Fade>
    );
  }

  /**
   * Render action buttons
   * @returns {React.ReactNode}
   */
  renderActions() {
    return (
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="outlined"
                color="primary"
                onClick={this.handleReload}
                size="small"
              >
                Reload Page
              </Button>

              <Button
                variant="text"
                color="primary"
                startIcon={<HomeIcon />}
                onClick={this.handleGoHome}
                size="small"
              >
                Go Home
              </Button>

              <Button
                variant="text"
                color="primary"
                startIcon={<HelpOutlineIcon />}
                onClick={this.toggleDetails}
                size="small"
              >
          {this.state.showDetails ? "Hide Details" : "Show Details"}
              </Button>
            </Box>
    );
  }

  render() {
    const { hasError, error, errorInfo: componentErrorInfo, showDetails } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) return children;

    if (fallback) {
      return typeof fallback === "function"
        ? fallback(error, this.handleReset)
        : fallback;
    }

    const errorDetails = getErrorInfo(error);

    return (
      <Fade in={true}>
                <Box
                  sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "95vh",
          }}
        >
          <Paper elevation={0} sx={{ p: 3, maxWidth: "sm", borderRadius: 2 }}>
            <Alert
              severity="error"
              sx={{
                mb: 3,
                    borderRadius: 1,
                "& .MuiAlert-message": {
                  color: "text.primary",
                },
                  }}
                >
              {errorDetails.title}
              <br />
              {errorDetails.message}
            </Alert>

            <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                sx={{ mb: 1.5 }}
                  >
                Try these steps:
                  </Typography>
              <Box
                component="ul"
                    sx={{
                  pl: 2,
                  m: 0,
                  "& li": {
                      color: "text.secondary",
                    mb: 1,
                    fontSize: "0.9rem",
                  },
                    }}
                  >
                {errorDetails.suggestions.map((suggestion, index) => (
                  <Typography component="li" key={index}>
                    {suggestion}
                  </Typography>
                ))}
              </Box>
                </Box>

            <Divider sx={{ my: 3 }} />
            {this.renderActions()}
            {showDetails && this.renderErrorDetails(componentErrorInfo)}
          </Paper>
        </Box>
      </Fade>
    );
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export default ErrorBoundary;
