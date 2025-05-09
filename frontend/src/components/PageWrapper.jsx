import React from "react";

// MUI Components
import Container from "@mui/material/Container";

const PageWrapper = ({ children }) => {
  return (
    <Container maxWidth="lg" sx={{p: 3, mb:4 }}>
      {children}
    </Container>
  );
};

export default PageWrapper;
