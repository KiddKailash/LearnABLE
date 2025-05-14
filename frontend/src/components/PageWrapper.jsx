/**
 * @fileoverview A wrapper component that provides consistent page layout and spacing.
 */

import React from "react";
import PropTypes from "prop-types";

// MUI Components
import Container from "@mui/material/Container";

/**
 * @typedef {Object} PageWrapperProps
 * @property {React.ReactNode} children - Content to be wrapped
 * @property {string} [maxWidth='lg'] - Maximum width of the container
 * @property {Object} [sx] - Additional styles to apply to the container
 */

/**
 * PageWrapper component that provides consistent page layout and spacing.
 *
 * @component
 * @example
 * <PageWrapper>
 *   <h1>Page Content</h1>
 * </PageWrapper>
 */
const PageWrapper = ({ children, maxWidth = "lg", sx = {} }) => {
  return (
    <Container
      maxWidth={maxWidth}
      sx={{

        pb: 5,
        mb: 4,
        ...sx,
      }}
    >
      {children}
    </Container>
  );
};

PageWrapper.propTypes = {
  /** Content to be wrapped */
  children: PropTypes.node.isRequired,

  /** Maximum width of the container */
  maxWidth: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),

  /** Additional styles to apply to the container */
  sx: PropTypes.object,
};

export default PageWrapper;
