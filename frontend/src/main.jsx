/**
 * The entry point for the React application.
 *
 * This file does the following:
 *  1. Creates a Material-UI theme using `createTheme`.
 *  2. Wraps the root app component in:
 *     - `<Router>` for routing,
 *     - `<ThemeProvider>` to supply the MUI theme,
 *     - `<CssBaseline>` to apply baseline styles.
 *  3. Renders the `<App />` component into the root DOM node.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App.jsx";

// MUI Imports
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

/**
 * A Material-UI theme configuration.
 * @see https://mui.com/material-ui/customization/theming/
 */
const theme = createTheme({
  // Example palette override – adjust or expand to your needs
  palette: {
    primary: {
      main: "#1976d2",
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Router>
  </React.StrictMode>
);
