/**
 * @fileoverview Error Boundary component that catches JavaScript errors in its child component tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button, Paper, Alert, AlertTitle, Divider } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

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
      showDetails: false
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
      errorInfo: null,
      showDetails: false
    });
  }

  /**
   * Fully reload the page
   */
  handleReload = () => {
    window.location.reload();
  }

  handleGoHome = () => {
    window.location.href = '/';
  }

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  }

  getErrorMessage = (error) => {
    // Map common error types to user-friendly messages
    const errorMessages = {
      'Network Error': 'Unable to connect to the server. Please check your internet connection.',
      'Failed to fetch': 'Unable to connect to the server. Please check your internet connection.',
      'TypeError': 'Something went wrong while processing your request.',
      'SyntaxError': 'There was a problem with the application code.',
      'ReferenceError': 'There was a problem with the application code.',
    };

    return errorMessages[error.name] || error.message || 'An unexpected error occurred';
  }

  getSuggestions = (error) => {
    const suggestions = {
      'Network Error': [
        'Check your internet connection',
        'Try refreshing the page',
        'If the problem persists, try again later'
      ],
      'Failed to fetch': [
        'Check your internet connection',
        'Try refreshing the page',
        'If the problem persists, try again later'
      ],
      'TypeError': [
        'Try refreshing the page',
        'Clear your browser cache',
        'If the problem persists, contact support'
      ],
      'SyntaxError': [
        'Try refreshing the page',
        'Clear your browser cache',
        'If the problem persists, contact support'
      ],
      'ReferenceError': [
        'Try refreshing the page',
        'Clear your browser cache',
        'If the problem persists, contact support'
      ],
    };

    return suggestions[error.name] || [
      'Try refreshing the page',
      'Clear your browser cache',
      'If the problem persists, contact support'
    ];
  }

  render() {
    const { hasError, error, errorInfo, showDetails } = this.state;
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

    const errorMessage = this.getErrorMessage(error);
    const suggestions = this.getSuggestions(error);

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          p: 3,
          bgcolor: 'background.default'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            maxWidth: 600,
            width: '100%',
            borderRadius: 2
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h4" gutterBottom color="error">
              Oops! Something went wrong
            </Typography>
          </Box>

          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Error Details</AlertTitle>
            {errorMessage}
          </Alert>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Here's what you can try:
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              {suggestions.map((suggestion, index) => (
                <Typography component="li" key={index} color="text.secondary" sx={{ mb: 1 }}>
                  {suggestion}
                </Typography>
              ))}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
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

            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={this.handleGoHome}
            >
              Go to Home
            </Button>

            <Button
              variant="text"
              startIcon={<HelpOutlineIcon />}
              onClick={this.toggleDetails}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </Box>

          {showDetails && errorInfo && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Technical Details:
              </Typography>
              <Typography variant="body2" component="pre" sx={{ 
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontSize: '0.8rem',
                color: 'text.secondary'
              }}>
                {errorInfo.componentStack}
              </Typography>
            </Box>
          )}
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