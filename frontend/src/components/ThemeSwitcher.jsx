/**
 * @fileoverview This file defines the ThemeSwitcher component, which renders an IconButton
 * that toggles the application theme. The button displays either a moon or sun icon based on the
 * current theme mode.
 *
 * @module ThemeSwitcher
 */

import React from "react";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded';
/**
 * ThemeSwitcher component renders an IconButton that toggles the application theme.
 *
 * If the current mode is "light", it shows a moon icon to indicate switching to dark mode.
 * If the current mode is "dark", it shows a sun icon to indicate switching to light mode.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.mode - The current theme mode ("light" or "dark").
 * @param {Function} props.toggleTheme - Callback function to toggle the theme mode.
 * @returns {JSX.Element} The rendered ThemeSwitcher component.
 */
const ThemeSwitcher = ({ mode, toggleTheme }) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-start", p: 2 }}>
      <IconButton onClick={toggleTheme} color="primary">
        {mode === "light" ? <DarkModeRoundedIcon /> : <WbSunnyRoundedIcon />}
      </IconButton>
    </Box>
  );
};

export default ThemeSwitcher;
