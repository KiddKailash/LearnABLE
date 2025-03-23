/**
 * @fileoverview This file defines the ThemeSwitcher component, which renders a toggle switch
 * that allows users to switch between light and dark theme modes. The component uses Material-UI
 * components to display the switch and label.
 *
 * @module ThemeSwitcher
 */

import React from "react";

// MUI imports
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Box from "@mui/material/Box";

/**
 * ThemeSwitcher component renders a toggle switch to change the application theme.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.mode - The current theme mode ("light" or "dark").
 * @param {Function} props.toggleTheme - Callback function to toggle the theme mode.
 * @returns {JSX.Element} The rendered ThemeSwitcher component.
 */
const ThemeSwitcher = ({ mode, toggleTheme }) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
      <FormControlLabel
        control={
          <Switch
            checked={mode === "dark"}
            onChange={toggleTheme}
            color="primary"
          />
        }
        label={mode === "dark" ? "Dark Mode" : "Light Mode"}
      />
    </Box>
  );
};

export default ThemeSwitcher;
