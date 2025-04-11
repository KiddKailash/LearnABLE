/**
 * DashboardAppBar Component
 *
 * This component renders the top app bar for the dashboard interface.
 * It includes a search bar, a notifications icon, and a theme switcher.
 * The component is designed to be responsive and themable using Material UI (MUI).
 *
 * Props:
 * - mode: string — current theme mode ('light' or 'dark')
 * - toggleTheme: function — function to toggle between light and dark themes
 */

import React from "react";

// Local Components
import ThemeSwitcher from "./ThemeSwitcher"; // Theme toggle component
import Notifications from "./Notifications"; // Notification bell component

// MUI Components
import AppBar from "@mui/material/AppBar";
import InputBase from "@mui/material/InputBase";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

// MUI Icons
import SearchIcon from "@mui/icons-material/Search";

const DashboardAppBar = ({ mode, toggleTheme }) => {
  return (
    <AppBar
      position="static"
      color="inherit"
      sx={(theme) => ({
        // Use theme shape to apply consistent border radius
        borderRadius: theme.shape.border,
        boxShadow: 0, // Remove default AppBar shadow
      })}
    >
      {/* Search Bar Container */}
      <Box
        sx={(theme) => ({
          position: "relative",
          borderRadius: theme.shape.border,
          backgroundColor: "background.paper", // Adapts to theme background
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between", // Spreads search input and top-right actions
        })}
      >
        {/* Search Icon */}
        <SearchIcon
          color="action"
          sx={{
            "&:hover": {
              color: "primary.main", // Highlight on hover
            },
          }}
        />

        {/* Text input for search */}
        <InputBase
          fullWidth
          placeholder="Search here..."
          inputProps={{ "aria-label": "search" }}
          sx={{
            ml: 1, // Margin left from icon
            flex: 1, // Allow input to fill space
          }}
        />

        {/* Top-right components: Notifications and Theme Toggle */}
        <Stack
          direction="row"
          spacing={2}
          sx={{ display: "flex", alignItems: "center" }}
        >
          <Notifications />
          <ThemeSwitcher mode={mode} toggleTheme={toggleTheme} />
        </Stack>
      </Box>
    </AppBar>
  );
};

export default DashboardAppBar;
