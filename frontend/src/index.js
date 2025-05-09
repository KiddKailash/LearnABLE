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
import reportWebVitals from "./tests/reportWebVitals";

// Context/Providers
import { SnackbarProvider } from "./contexts/SnackbarContext";
import { UserProvider, default as UserContext } from "./contexts/UserObject";
import { TutorialProvider } from "./contexts/TutorialContext";

// MUI imports
import { 
  ThemeProvider, 
  useColorScheme,
  getInitColorSchemeScript
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { getTheme } from "./styles/global-styling";

const ThemeWrapper = () => {
  const { user } = useContext(UserContext);
  const { setMode, mode } = useColorScheme();

  // Update color scheme when user preferences change
  useEffect(() => {
    if (user?.theme_preference) {
      // Save the preference to localStorage for persistence between sessions
      localStorage.setItem('theme_preference', user.theme_preference);
      
      // Update the theme mode
      setMode(user.theme_preference);
    }
  }, [user, setMode]);

  return (
    <SnackbarProvider>
      <App mode={mode} />
    </SnackbarProvider>
  );
};

const Root = () => {
  const theme = getTheme();
  
  return (
      <Router>
        <ThemeProvider 
          theme={theme}
          defaultMode="system"
          colorSchemeSelector=".mode-$mode" 
          modeStorageKey="theme_preference"
        >
          <CssBaseline />
          <TutorialProvider>
            <UserProvider>
              {getInitColorSchemeScript({ defaultMode: "system" })}
              <ThemeWrapper />
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

reportWebVitals();
