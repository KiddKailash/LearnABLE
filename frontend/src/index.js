/**
 * @fileoverview Entry point for the application. This file sets up the React application with
 * React Router and Material-UI. It defines a Root component that maintains the current theme mode
 * (light or dark), memoizes the Material-UI theme using a custom getTheme function, and provides a
 * ThemeSwitcher component to allow users to toggle between light and dark modes.
 *
 * The application is wrapped with Material-UI's ThemeProvider and CssBaseline to ensure global styling
 * is applied consistently. The Router component wraps the App component to provide routing capabilities.
 * Finally, ReactDOM creates the root element and renders the application.
 *
 * @module index
 */

import React, { useState, useMemo } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import reportWebVitals from "./tests/reportWebVitals";

// MUI Theme Provider, CSS Baseline and a component which switches the theme
import { ThemeProvider, CssBaseline } from "@mui/material";
import { getTheme } from "./global-styling";
import ThemeSwitcher from "./components/ThemeSwitcher";

/**
 * Root component that sets up the global theme and routing for the application.
 *
 * @component
 * @returns {JSX.Element} The Root component wrapped with ThemeProvider and Router.
 */
const Root = () => {
  const [mode, setMode] = useState("light");

  // Memoize theme to avoid unnecessary recalculations on re-renders
  const theme = useMemo(() => getTheme(mode), [mode]);

  /**
   * Toggles the theme mode between light and dark.
   */
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {/* Include the ThemeSwitcher to toggle between modes */}
        <ThemeSwitcher mode={mode} toggleTheme={toggleTheme} />
        <App />
      </Router>
    </ThemeProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

reportWebVitals();
