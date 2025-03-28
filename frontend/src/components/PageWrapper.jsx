import React from "react";

// MUI Components
import Container from "@mui/material/Container";

const PageWrapper = ({ children }) => {
  return (
    <Container maxWidth="lg" sx={{ my: 2 }}>
      {children}
    </Container>
  );
};

export default PageWrapper;
