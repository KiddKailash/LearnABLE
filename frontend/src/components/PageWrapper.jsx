import React from "react";

// MUI Components
import Container from "@mui/material/Container";

const PageWrapper = ({ children }) => {
  return (
    <Container maxWidth="lg" sx={{ mx: 2, my: 3 }}>
      {children}
    </Container>
  );
};

export default PageWrapper;
