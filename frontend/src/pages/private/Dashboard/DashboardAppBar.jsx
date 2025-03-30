import React from "react";
// Components
import ThemeSwitcher from "../../../components/ThemeSwitcher";
import Notifications from "../../../components/Notifications.jsx";


// MUI
import AppBar from "@mui/material/AppBar";
import InputBase from "@mui/material/InputBase";
import Box from "@mui/material/Box";


// MUI Icons
import SearchIcon from "@mui/icons-material/Search";


const DashboardAppBar = ({ mode, toggleTheme }) => {


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
          justifyContent: "space-between", //!added
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

        {/*top right components */}
        <Box sx ={{display: "flex", alignItems:"center"}}>
          <Notifications />
          {/* Now we pass mode & toggleTheme into ThemeSwitcher */}
          <ThemeSwitcher mode={mode} toggleTheme={toggleTheme} />
          </Box>
      </Box>
      

      {/* Right side icons or profile */}
      <Box sx={{ flexGrow: 1 }} />
      {/* Add user avatar or other icons here */}
      
    </AppBar>
  );
};



export default DashboardAppBar;






