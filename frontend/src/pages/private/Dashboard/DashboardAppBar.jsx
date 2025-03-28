import React from "react";

// Components
import ThemeSwitcher from "../../../components/ThemeSwitcher";

// MUI
import AppBar from "@mui/material/AppBar";
import InputBase from "@mui/material/InputBase";
import Box from "@mui/material/Box";

// MUI Icons
import SearchIcon from "@mui/icons-material/Search";

const DashboardAppBar = () => {
  return (
    <AppBar
      position="static"
      color="inherit"
      sx={(theme) => ({ borderRadius: theme.shape.border, boxShadow: 0 })}
    >
      {/* Search Box */}
      <Box
        fullWidth
        sx={(theme) => ({
          position: "relative",
          borderRadius: theme.shape.border,
          backgroundColor: "background.paper",
          width: "100%",
          display: "flex",
          alignItems: "center",
        })}
      >
        <SearchIcon
          color="action"
          sx={{
            "&:hover": {
              color: "primary.main",
            },
          }}
        />
        <InputBase
          fullWidth
          placeholder="Search here..."
          inputProps={{ "aria-label": "search" }}
          sx={{
            ml: 1,
            flex: 1,
          }}
        />
        <ThemeSwitcher />
      </Box>

      {/* Right Side Icons or Profile */}
      <Box sx={{ flexGrow: 1 }} />
      {/* Add user avatar or other icons here */}
    </AppBar>
  );
};

export default DashboardAppBar;
