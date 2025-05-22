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

import React, { useContext, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";

// Context/Providers
import { SnackbarProvider } from "./contexts/SnackbarContext";
import { UserProvider, default as UserContext } from "./store/UserObject";
import { TutorialProvider } from "./contexts/TutorialContext";

// MUI imports
import { ThemeProvider, useColorScheme } from "@mui/material/styles";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import CssBaseline from "@mui/material/CssBaseline";
import { getTheme } from "./styles/global-styling";

const Root = () => {
  const { user } = useContext(UserContext);
  const { mode, setMode } = useColorScheme();
  const theme = React.useMemo(() => getTheme(), []);

  // Update color scheme when user preferences change
  useEffect(() => {
    if (user?.preferences?.theme) {
      setMode(user?.preferences?.theme);
    }
  }, [user, setMode]);

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <TutorialProvider>
          <UserProvider>
            <InitColorSchemeScript />
            <SnackbarProvider>
              <App />
            </SnackbarProvider>
          </UserProvider>
        </TutorialProvider>
      </ThemeProvider>
    </Router>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
