/**
 * @fileoverview Accessible link component that provides proper accessibility attributes.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';

/**
 * Styled link with appropriate color contrast
 */
const StyledLink = styled(Link)(({ theme, $visuallyHidden }) => ({
  color: theme.palette.primary.main,
  textDecoration: 'none',
  fontWeight: 500,
  position: $visuallyHidden ? 'absolute' : 'relative',
  height: $visuallyHidden ? '1px' : 'auto',
  width: $visuallyHidden ? '1px' : 'auto',
  overflow: $visuallyHidden ? 'hidden' : 'visible',
  clip: $visuallyHidden ? 'rect(0 0 0 0)' : 'auto',
  whiteSpace: $visuallyHidden ? 'nowrap' : 'normal',
  
  '&:hover': {
    textDecoration: 'underline',
  },
  
  '&:focus': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
  },
}));

/**
 * Accessible link component with proper aria attributes.
 * 
 * @component
 * @example
 * <AccessibleLink to="/dashboard" aria-label="Go to dashboard">
 *   Dashboard
 * </AccessibleLink>
 */
const AccessibleLink = ({
  children,
  to,
  external,
  visuallyHidden,
  ...props
}) => {
  // For external links, use an anchor tag with appropriate attributes
  if (external) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        style={
          visuallyHidden
            ? {
                position: 'absolute',
                height: '1px',
                width: '1px',
                overflow: 'hidden',
                clip: 'rect(0 0 0 0)',
                whiteSpace: 'nowrap',
              }
            : {}
        }
        {...props}
      >
        {children}
        <span className="visually-hidden">(opens in a new tab)</span>
      </a>
    );
  }

  // For internal links, use React Router's Link
  return (
    <StyledLink to={to} $visuallyHidden={visuallyHidden} {...props}>
      {children}
    </StyledLink>
  );
};

AccessibleLink.propTypes = {
  /** Content of the link */
  children: PropTypes.node.isRequired,
  
  /** URL the link points to */
  to: PropTypes.string.isRequired,
  
  /** Whether the link points to an external resource */
  external: PropTypes.bool,
  
  /** Whether the link should be visually hidden (for screen readers only) */
  visuallyHidden: PropTypes.bool,
};

AccessibleLink.defaultProps = {
  external: false,
  visuallyHidden: false,
};

export default AccessibleLink; 