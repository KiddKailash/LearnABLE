/**
 * @fileoverview Entry point for the application. This file sets up the React application with
 * React Router and Material-UI. It defines a Root component that maintains the current theme mode
 * (light or dark), memoizes the Material-UI theme using a custom getTheme function.
 *
 * The application is wrapped with Material-UI's ThemeProvider and CssBaseline to ensure global styling
 * is applied consistently. The Router component wraps the App component to provide routing capabilities.
 * Finally, ReactDOM creates the root element and renders the application.
 *
 * @module index
 */

import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import reportWebVitals from "./tests/reportWebVitals";

// Context/Providers
import { SnackbarProvider } from "./contexts/SnackbarContext";
import { UserProvider } from "./services/UserContext";

// MUI imports
import { ThemeProvider, CssBaseline } from "@mui/material";
import { getTheme } from "./global-styling";

const Root = () => {
  // Create a piece of state for theme mode
  const [mode, setMode] = useState("light");

  // Function to toggle the theme
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  // Memoize theme to avoid unnecessary recalculations on re-renders
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <Router>
      <UserProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider>
            <App mode={mode} toggleTheme={toggleTheme} />
          </SnackbarProvider>
        </ThemeProvider>
      </UserProvider>
    </Router>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

reportWebVitals();
