/**
 * @file Sidebar.jsx
 * @description A responsive and collapsible sidebar component built with Material UI.
 * It displays navigation items with icons and tooltips. When collapsed, it shows only icons;
 * when expanded, it shows both icons and text. The sidebar includes a toggle button to expand/collapse,
 * and navigation items that use react-router's navigation. It also includes a settings section with
 * additional options (e.g., Account, Settings, Logout).
 *
 * @module Sidebar
 */

import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
// Contexts
import UserContext from "../store/UserObject";

// MUI Components
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";

// MUI Icons
import DashboardIcon from "@mui/icons-material/SpaceDashboardRounded";
import PeopleIcon from "@mui/icons-material/SchoolRounded";
import EventAvailableIcon from "@mui/icons-material/DocumentScannerRounded";
import AccountCircleIcon from "@mui/icons-material/SettingsSuggestRounded";
import LogoutIcon from "@mui/icons-material/LogoutRounded";
import MenuOpenIcon from "@mui/icons-material/MenuOpenRounded";

// Navigation items for main section of the sidebar
const navItems = [
  { text: "Dashboard", icon: <DashboardIcon />, tutorialId: "dashboard" },
  { text: "Classes", icon: <PeopleIcon />, tutorialId: "classes" },
  { text: "Reporting", icon: <EventAvailableIcon />, tutorialId: "reporting" },
];

// Navigation items for settings section of the sidebar
const settingsItems = [
  { text: "Account", icon: <AccountCircleIcon />, tutorialId: "account" },
  { text: "Logout", icon: <LogoutIcon color="error" />, isLogout: true },
];

/**
 * Sidebar component that renders a collapsible navigation sidebar.
 *
 * @component
 * @returns {JSX.Element} The rendered Sidebar component.
 */
const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Track whether the sidebar is collapsed
  const [collapsed, setCollapsed] = React.useState(true);

  const { user, logout } = useContext(UserContext);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  /**
   * Determines if a given navigation path is active.
   *
   * @param {string} path - The navigation path text.
   * @returns {boolean} True if the current location matches the given path.
   */
  const isActive = (path) =>
    location.pathname.includes(`/${path.toLowerCase().replace(" ", "-")}`);

  // Compute dynamic sidebar width based on collapsed state and device type
  const SIDEBAR_WIDTH = isMobile ? 240 : collapsed ? 50 : 185;

  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: { xs: 0, sm: 5 },
      }}
    >
      {/* Top section with toggle button and logo */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 1,
          justifyContent: "flex-start",
        }}
      >
        {!isMobile && (
          <IconButton
            onClick={() => setCollapsed(!collapsed)}
            sx={{
              p: 1.5,
              borderRadius: 2,
              position: "relative",
              "&:hover": {
                bgcolor: "action.hover",
              },
              justifyContent: "flex-start",
            }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <MenuOpenIcon sx={{ rotate: "180deg" }} />
            ) : (
              <MenuOpenIcon />
            )}
          </IconButton>
        )}

        {/* Display logo text when expanded or on mobile */}
        {(!collapsed || isMobile) && (
          <Typography
            variant="h6"
            fontWeight="bold"
            color="primary"
            sx={{ ml: 1 }}
          >
            LearnABLE
          </Typography>
        )}
      </Box>

      {/* Navigation list */}
      <List sx={{ flexGrow: 1 }}>
        {navItems.map(({ text, icon, tutorialId }) => {
          const path = `/${text.toLowerCase().replace(" ", "-")}`;
          const selected = isActive(text);
          return (
            <Tooltip
              key={text}
              title={collapsed && !isMobile ? text : ""}
              placement="right"
              disableHoverListener={!collapsed || isMobile}
            >
              <IconButton
                data-tutorial={tutorialId}
                onClick={() => {
                  navigate(path);
                  if (isMobile) {
                    window.dispatchEvent(new CustomEvent("closeMobileDrawer"));
                  }
                }}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  color: selected ? "primary.main" : "text.primary",
                  position: "relative",
                  "&:before": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: "8px", // Adjust to match py spacing
                    bottom: "8px",
                    width: selected ? "2px" : 0,
                    backgroundColor: "primary.main",
                    borderRadius: 1,
                  },
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                  width: "100%",
                  justifyContent: "flex-start",
                }}
                aria-label={text}
              >
                {icon}
                {(!collapsed || isMobile) && (
                  <Typography
                    variant="body1"
                    sx={{
                      ml: 1,
                      color: selected ? "primary.main" : "text.primary",
                    }}
                  >
                    {text}
                  </Typography>
                )}
              </IconButton>
            </Tooltip>
          );
        })}
      </List>

      {/* Show user name if sidebar is expanded or on mobile */}
      {(!collapsed || isMobile) && (
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", mb: 0.5, ml: 0.5 }}
        >
          {user?.email}
        </Typography>
      )}

      <Divider sx={{ mb: 1 }} />

      {/* Settings section */}
      <Box>
        <List>
          {settingsItems.map(({ text, icon, isLogout, tutorialId }) => (
            <Tooltip
              key={text}
              title={collapsed && !isMobile ? text : ""}
              placement="right"
              disableHoverListener={!collapsed || isMobile}
            >
              <IconButton
                data-tutorial={tutorialId}
                onClick={() => {
                  if (isLogout) {
                    handleLogout();
                  } else {
                    navigate(`/${text.toLowerCase()}`);
                    if (isMobile) {
                      window.dispatchEvent(
                        new CustomEvent("closeMobileDrawer")
                      );
                    }
                  }
                }}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  color: isActive(text) ? "primary.main" : "text.primary",
                  position: "relative",
                  "&:before": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: "8px", // Adjust to match py spacing
                    bottom: "8px",
                    width: isActive(text) ? "2px" : 0,
                    backgroundColor: "primary.main",
                    borderRadius: 1,
                  },
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                  width: "100%",
                  justifyContent: "flex-start",
                }}
                aria-label={text}
              >
                {icon}
                {(!collapsed || isMobile) && (
                  <Typography
                    variant="body1"
                    sx={{
                      ml: 1,
                      color: isLogout ? "error.main" : isActive(text) ? "primary.main" : "text.primary",
                    }}
                  >
                    {text}
                  </Typography>
                )}
              </IconButton>
            </Tooltip>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default Sidebar;
