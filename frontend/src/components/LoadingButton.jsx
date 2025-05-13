/**
 * @fileoverview A reusable button component that shows a loading spinner when loading.
 */

import React from 'react';
import PropTypes from 'prop-types';

// MUI Components
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

/**
 * @typedef {Object} LoadingButtonProps
 * @property {React.ReactNode} children - Content of the button
 * @property {boolean} [loading=false] - Whether the button is in a loading state
 * @property {boolean} [disabled=false] - Whether the button is disabled
 * @property {React.ReactNode} [startIcon] - Icon to display before the button text
 * @property {'small'|'medium'|'large'} [size='medium'] - Size of the button
 */

/**
 * Map of button sizes to spinner sizes
 * @type {Object.<string, number>}
 */
const SPINNER_SIZES = {
  small: 16,
  medium: 20,
  large: 24
};

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
  loading = false,
  disabled = false,
  startIcon,
  size = 'medium',
  ...props
}) => {
  const spinnerSize = SPINNER_SIZES[size] || SPINNER_SIZES.medium;

  const buttonStartIcon = loading ? (
    <CircularProgress size={spinnerSize} color="inherit" />
  ) : startIcon;

  return (
    <Button
      startIcon={buttonStartIcon}
      disabled={loading || disabled}
      size={size}
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
};

export default LoadingButton; 