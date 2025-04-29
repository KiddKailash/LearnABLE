/**
 * @fileoverview Error Boundary component that catches JavaScript errors in its child component tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

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
      errorInfo: null
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
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
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
      errorInfo: null
    });
  }

  /**
   * Fully reload the page
   */
  handleReload = () => {
    window.location.reload();
  }

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    // No error occurred, render children normally
    if (!hasError) {
      return children;
    }

    // Custom fallback provided
    if (fallback) {
      return typeof fallback === 'function'
        ? fallback(error, this.handleReset)
        : fallback;
    }

    // Default error UI
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          p: 3
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            maxWidth: 500,
            textAlign: 'center',
            borderRadius: 2
          }}
        >
          <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
          
          <Typography variant="h5" gutterBottom>
            Something went wrong
          </Typography>
          
          <Typography color="text.secondary" paragraph>
            {error?.message || 'An unexpected error occurred'}
          </Typography>
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={this.handleReset}
            >
              Try Again
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleReload}
            >
              Reload Page
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }
}

ErrorBoundary.propTypes = {
  /** Content to be rendered within the error boundary */
  children: PropTypes.node.isRequired,
  
  /** Custom fallback UI to display when an error occurs */
  fallback: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func
  ])
};

export default ErrorBoundary; 