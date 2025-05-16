/**
 * @file ProfileAvatar.jsx
 * @description A styled avatar component for displaying user profile pictures.
 * This component extends the Material-UI Avatar with custom styling and hover effects.
 */

import React from "react";

// MUI Components
import { Avatar } from "@mui/material";
import { styled } from "@mui/material/styles";

/**
 * Styled avatar component with custom styling and hover effects
 */
const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.primary.main}`,
  boxShadow: theme.shadows[3],
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.05)",
    cursor: "pointer",
  },
}));

/**
 * ProfileAvatar component that renders a styled avatar for user profiles
 * @param {Object} props - Component props
 * @param {string} props.src - Source URL for the avatar image
 * @param {string} props.alt - Alt text for the avatar image
 * @param {React.ReactNode} props.children - Fallback content when no image is provided
 * @param {Object} props.props - Additional props to be spread to the StyledAvatar component
 * @returns {JSX.Element} A styled avatar component
 */
const ProfileAvatar = ({ src, alt, children, ...props }) => {
  return (
    <StyledAvatar src={src} alt={alt} {...props}>
      {children}
    </StyledAvatar>
  );
};

export default ProfileAvatar; 