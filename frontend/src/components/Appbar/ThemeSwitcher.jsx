import React, { useContext } from "react";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import WbSunnyRoundedIcon from "@mui/icons-material/WbSunnyRounded";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";
import { useColorScheme } from "@mui/material/styles";
import UserContext from "../../contexts/UserObject";
import accountApi from "../../services/accountApi";

const ThemeSwitcher = () => {
  const { updateUserInfo } = useContext(UserContext);
  const { mode, setMode } = useColorScheme();
  
  const getNextThemeMode = () => {
    // Rotate through light -> dark -> system -> light
    if (mode === 'light') return 'dark';
    if (mode === 'dark') return 'system';
    return 'light'; // if system, go back to light
  };
  
  const handleThemeToggle = async () => {
    const newMode = getNextThemeMode();
    
    // Update the MUI color scheme immediately
    setMode(newMode);
    
    // Save to backend
    try {
      await accountApi.updateTheme(newMode);
    } catch (error) {
      console.error("Failed to save theme preference to backend:", error);
    }
    
    // Update user context with new theme preference
    updateUserInfo({ theme_preference: newMode });
    
    // Save directly to localStorage for persistence between sessions
    localStorage.setItem("theme_preference", newMode);
  };

  // Choose icon based on current mode
  const getThemeIcon = () => {
    if (mode === 'light') return <WbSunnyRoundedIcon />;
    if (mode === 'dark') return <DarkModeRoundedIcon />;
    return <SettingsBrightnessIcon />; // system mode
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
      <IconButton onClick={handleThemeToggle} color="primary">
        {getThemeIcon()}
      </IconButton>
    </Box>
  );
};

export default ThemeSwitcher;
