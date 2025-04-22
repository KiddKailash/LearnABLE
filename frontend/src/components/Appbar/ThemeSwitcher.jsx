import React from "react";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import WbSunnyRoundedIcon from "@mui/icons-material/WbSunnyRounded";

const ThemeSwitcher = ({ mode, toggleTheme }) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
      <IconButton onClick={toggleTheme} color="primary">
        {mode === "light" ? <DarkModeRoundedIcon /> : <WbSunnyRoundedIcon />}
      </IconButton>
    </Box>
  );
};

export default ThemeSwitcher;
