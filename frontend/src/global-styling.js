import { createTheme } from "@mui/material/styles";

/**
 * Creates a Material-UI theme object to be used throughout the application.
 *
 * This theme object is used to style components and provide a consistent look and feel across
 * the application. It includes customizations for colours, typography, and other styling options.
 * The theme is passed to the ThemeProvider component to apply these styles globally. The CssBaseline
 * component is used to ensure consistent baseline styling across browsers. Components can access this
 * theme via the useTheme hook to apply theme-specific properties.
 *
 *
 * QLD Education Department Colour Scheme:
 *  - Brand (Queensland Government Colours):
 *      Blue (Primary):            #005E85 ($qg-global-primary)
 *      Dark Blue (Primary dark):  #063652 ($qg-global-primary-dark)
 *      Light Green (Secondary):   #9AC02C ($qg-light-green)
 *      Green (Additional):        #78ba00 ($qg-green)
 *
 *  - Text:
 *      Primary Text:              #212529 ($qg-dark-grey-darker)
 *      Secondary/Muted Text:      #585e62 ($qg-dark-grey)
 *      Light Text (Disabled):     #EFF2F4 ($qg-global-primary-light)
 *      Link:                      #13578b ($qg-blue-dark)
 *      Visited Link:              #8800BB
 *
 *  - Alerts (mapped to palette values):
 *      Info:                      #1E77AA ($brand-info)
 *      Success:                   #9EBF6D ($brand-success)
 *      Warning:                   #F9AF71 ($brand-warning)
 *      Critical/Error:            #B90824 ($brand-danger)
 *
 * @returns {object} A Material-UI theme object.
 */
export const getTheme = () => {
  // Define common theme options used across all modes
  const themeOptions = {
    // In MUI v6, we specify light and dark color schemes
    colorSchemes: {
      light: {
        palette: {
          primary: {
            main: "#005E85", // $qg-global-primary
            dark: "#063652", // $qg-global-primary-dark
          },
          secondary: {
            main: "#9AC02C", // $qg-light-green
            dark: "#78ba00",
          },
          link: {
            main: "#13578b", // $qg-blue-dark
            visited: "#8800BB",
          },
          background: {
            paper: "#ffffff", // $qg-global-primary-lightest
            default: "#f5f5f5", // $qg-white
          },
          text: {
            primary: "#212529", // $qg-dark-grey-darker
            secondary: "#585e62", // $qg-dark-grey
            disabled: "#EFF2F4", // $qg-global-primary-light
          },
          // Alert colours mapped to Material-UI palette properties:
          info: {
            main: "#1E77AA", // $brand-info
          },
          success: {
            main: "#9EBF6D", // $brand-success
          },
          warning: {
            main: "#F9AF71", // $brand-warning
          },
          error: {
            main: "#B90824", // $brand-danger (critical)
          },
        },
      },
      dark: {
        palette: {
          primary: {
            main: "#005E85", // $qg-global-primary
            dark: "#063652", // $qg-global-primary-dark
          },
          secondary: {
            main: "#9AC02C", // $qg-light-green
            dark: "#78ba00",
          },
          link: {
            main: "#13578b", // $qg-blue-dark
            visited: "#8800BB",
          },
          background: {
            paper: "#1F1F1F", 
            default: "#121212",
          },
          // Set appropriate text colors for dark mode
          text: {
            primary: "#ffffff",
            secondary: "rgba(255, 255, 255, 0.7)",
            disabled: "rgba(255, 255, 255, 0.5)",
          },
          // Alert colours mapped to Material-UI palette properties:
          info: {
            main: "#1E77AA", // $brand-info
          },
          success: {
            main: "#9EBF6D", // $brand-success
          },
          warning: {
            main: "#F9AF71", // $brand-warning
          },
          error: {
            main: "#B90824", // $brand-danger (critical)
          },
        },
      },
    },
    typography: {
      h4: {
        fontWeight: 600,
      },
    },
    shape: {
      border: 3,
    },
    // Enable CSS variables with class-based selectors
    cssVarPrefix: 'mui',
  };

  return createTheme(themeOptions);
};
