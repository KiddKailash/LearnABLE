/**
 * @file PageNotFound.jsx
 * @description Renders a 404 Page Not Found component that informs the user that the requested page does not exist
 * and provides a button to navigate back to the login page.
 *
 * Features:
 * - Displays a 404 error message
 * - Button to navigate back to the login page
 * - Uses Material-UI for layout and styling
 */

import React from "react";
import { useNavigate } from "react-router-dom";

// MUI
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";

/**
 * PageNotFound component renders a 404 error message along with a button for navigation back to the login page.
 *
 * @component
 * @returns {JSX.Element} The rendered 404 Page Not Found component.
 */
const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="xs" sx={{ textAlign: "center", p:2, borderRadius: 4, mt: "30vh"}}>
      {/* Stack for vertical alignment of error message and button */}
      <Stack direction="column">
      <Typography variant="caption" color="error">
        ERROR 404
      </Typography>
      <Typography variant="h5" gutterBottom>
        Page Not Found
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/")}
      >
        Back to Login
      </Button>
      </Stack>
    </Container>
  );
};

export default PageNotFound;
