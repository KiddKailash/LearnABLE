/**
 * @fileoverview Error Boundary component that catches JavaScript errors in its child component tree.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  AlertTitle,
  Divider,
  Fade,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import HomeIcon from "@mui/icons-material/Home";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { getErrorInfo } from "../utils/errorHandling";

/**
 * Error Boundary component that catches errors in its child components
 * and displays a fallback UI instead of crashing the whole app.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  /**
   * Update state when an error occurs
   */
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  /**
   * Capture error information for logging
   */
  componentDidCatch(error, errorInfo) {
    // Log error information
    this.setState({ errorInfo });

    // Log to monitoring service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);

    // Here you could log to your error reporting service
    // if (process.env.NODE_ENV === 'production') {
    //   logErrorToService(error, errorInfo);
    // }
  }

  /**
   * Attempt to recover by resetting the error state and refreshing the component
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

  handleGoHome = () => {
    window.location.href = "/";
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    const {
      hasError,
      error,
      errorInfo: componentErrorInfo,
      showDetails,
    } = this.state;
    const { children, fallback } = this.props;

    // No error occurred, render children normally
    if (!hasError) {
      return children;
    }

    // Custom fallback provided
    if (fallback) {
      return typeof fallback === "function"
        ? fallback(error, this.handleReset)
        : fallback;
    }

    const errorInfo = getErrorInfo(error);

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
          <Paper
            elevation={0}
            sx={{
              p: 3,
              maxWidth: "sm",
              borderRadius: 2,
            }}
          >
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
              {errorInfo.title}
              <br />
              {errorInfo.message}
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
                {errorInfo.suggestions.map((suggestion, index) => (
                  <Typography component="li" key={index}>
                    {suggestion}
                  </Typography>
                ))}
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

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
                {showDetails ? "Hide Details" : "Show Details"}
              </Button>
            </Box>

            {showDetails && componentErrorInfo && (
              <Fade in={showDetails}>
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
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    color="text.secondary"
                  >
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
                    {componentErrorInfo.componentStack}
                  </Typography>
                </Box>
              </Fade>
            )}
          </Paper>
        </Box>
      </Fade>
    );
  }
}

ErrorBoundary.propTypes = {
  /** Content to be rendered within the error boundary */
  children: PropTypes.node.isRequired,

  /** Custom fallback UI to display when an error occurs */
  fallback: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export default ErrorBoundary;
