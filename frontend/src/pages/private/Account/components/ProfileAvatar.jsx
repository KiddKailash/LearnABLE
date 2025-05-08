import React from "react";

// MUI Components
import { Avatar } from "@mui/material";
import { styled } from "@mui/material/styles";

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

const ProfileAvatar = ({ src, alt, children, ...props }) => {
  return (
    <StyledAvatar src={src} alt={alt} {...props}>
      {children}
    </StyledAvatar>
  );
};

export default ProfileAvatar; 