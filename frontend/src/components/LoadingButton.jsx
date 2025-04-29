/**
 * @fileoverview A reusable button component that shows a loading spinner when loading.
 */

import React from 'react';
import PropTypes from 'prop-types';

// MUI Components
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

/**
 * LoadingButton component that displays a loading indicator when isLoading is true.
 * 
 * @component
 * @example
 * <LoadingButton
 *   loading={isSubmitting}
 *   variant="contained"
 *   color="primary"
 *   onClick={handleSubmit}
 * >
 *   Submit
 * </LoadingButton>
 */
const LoadingButton = ({
  children,
  loading,
  disabled,
  startIcon,
  size = 'medium',
  ...props
}) => {
  // Calculate spinner size based on button size
  const spinnerSize = {
    small: 16,
    medium: 20,
    large: 24
  }[size] || 20;

  // When loading, override the startIcon with a spinner
  const buttonStartIcon = loading ? (
    <CircularProgress size={spinnerSize} color="inherit" />
  ) : (
    startIcon
  );

  return (
    <Button
      startIcon={buttonStartIcon}
      disabled={loading || disabled}
      {...props}
    >
      {children}
    </Button>
  );
};

LoadingButton.propTypes = {
  /** Content of the button */
  children: PropTypes.node.isRequired,
  
  /** Whether the button is in a loading state */
  loading: PropTypes.bool,
  
  /** Whether the button is disabled */
  disabled: PropTypes.bool,
  
  /** Icon to display before the button text */
  startIcon: PropTypes.node,
  
  /** Size of the button */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  
  /** Additional props are passed to the MUI Button component */
  // eslint-disable-next-line react/forbid-prop-types
  props: PropTypes.object,
};

LoadingButton.defaultProps = {
  loading: false,
  disabled: false,
  startIcon: null,
  size: 'medium',
};

export default LoadingButton; 