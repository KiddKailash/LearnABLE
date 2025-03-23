import { createTheme } from "@mui/material/styles";

/**
 * Creates a Material-UI theme object to be used throughout the application.
 *
 * This theme object is used to style components and provide a consistent look and feel across
 * the application. It includes customizations for colors, typography, and other styling options.
 * The theme object is then passed to the ThemeProvider component to apply these styles globally.
 * The CssBaseline component is used to ensure consistent baseline styling across browsers.
 * Components can access this theme via the useTheme hook to apply theme-specific properties.
 *
 * @param {string} [mode="light"] - The color mode of the theme, either "light" or "dark".
 * @returns {object} A Material-UI theme object.
 */
export const getTheme = (mode = "light") =>
  createTheme({
    palette: {
      mode, // sets light or dark mode
      primary: {
        main: "#005E85",
        dark: "#063652",
      },
      secondary: {
        main: "#9AC02C",
        dark: "#8ba00",
      },
    },
    typography: {
      h4: {
        fontWeight: 600,
      },
    },
  });
