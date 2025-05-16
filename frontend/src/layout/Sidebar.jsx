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
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";

// MUI Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";

// Navigation items for main section of the sidebar
const navItems = [
  { text: "Dashboard", icon: <DashboardIcon />, tutorialId: "dashboard" },
  { text: "Classes", icon: <PeopleIcon />, tutorialId: "classes" },
  { text: "Reporting", icon: <EventAvailableIcon />, tutorialId: "reporting" },
];

// Navigation items for settings section of the sidebar
const settingsItems = [
  { text: "Account", icon: <AccountCircleIcon />, tutorialId: "account" },
  { text: "Logout", icon: <LogoutIcon />, isLogout: true },
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
  const [collapsed, setCollapsed] = React.useState(false);

  const { user, logout } = useContext(UserContext);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  }

  /**
   * Determines if a given navigation path is active.
   *
   * @param {string} path - The navigation path text.
   * @returns {boolean} True if the current location matches the given path.
   */
  const isActive = (path) =>
    location.pathname === `/${path.toLowerCase().replace(" ", "-")}`;

  // Compute dynamic sidebar width based on collapsed state and device type
  const SIDEBAR_WIDTH = isMobile ? 240 : (collapsed ? 72 : 240);

  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: { xs: 0, sm: 5 },
        p: { xs: 2, sm: 1 },
        bgcolor: "background.paper",
      }}
    >
      {/* Top section with toggle button and logo */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 1,
          pl: collapsed && !isMobile ? 0 : 1.5,
          justifyContent: collapsed && !isMobile ? "center" : "flex-start",
        }}
      >
        {!isMobile && (
          <IconButton
            onClick={() => setCollapsed(!collapsed)}
            size="small"
            sx={{ mr: collapsed ? 0 : 1, borderRadius: 2 }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <MenuIcon /> : <MenuOpenIcon />}
          </IconButton>
        )}

        {/* Display logo text when expanded or on mobile */}
        {(!collapsed || isMobile) && (
          <Typography variant="h6" fontWeight="bold" color="primary">
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
              arrow
              disableHoverListener={!collapsed || isMobile}
            >
              <ListItemButton
                data-tutorial={tutorialId}
                onClick={() => {
                  navigate(path);
                  if (isMobile) {
                    // Close mobile drawer after navigation
                    window.dispatchEvent(new CustomEvent('closeMobileDrawer'));
                  }
                }}
                selected={selected}
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  justifyContent: collapsed && !isMobile ? "center" : "flex-start",
                }}
                aria-label={text}
              >
                <ListItemIcon
                  sx={{
                    color: "text.primary",
                    minWidth: collapsed && !isMobile ? "auto" : "40px",
                  }}
                >
                  {icon}
                </ListItemIcon>

                {/* Show text when sidebar is expanded or on mobile */}
                {(!collapsed || isMobile) && <ListItemText primary={text} sx={{color: 'text.secondary'}}/>}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      <Divider sx={{ mb: 1 }} />

      {/* Settings section */}
      <Box>
        {/* Show user name if sidebar is expanded or on mobile */}
        {(!collapsed || isMobile) && (
          <Typography
            variant="caption"
            sx={{ color: "gray", fontWeight: "bold", px: 2 }}
          >
            {user?.name}
          </Typography>
        )}
        <List>
          {settingsItems.map(({ text, icon, isLogout, tutorialId }) => (
            <Tooltip
              key={text}
              title={collapsed && !isMobile ? text : ""}
              placement="right"
              arrow
              disableHoverListener={!collapsed || isMobile}
            >
              <ListItemButton
                data-tutorial={tutorialId}
                onClick={() => {
                  if (isLogout) {
                    handleLogout();
                  } else {
                    navigate(`/${text.toLowerCase()}`);
                    if (isMobile) {
                      // Close mobile drawer after navigation
                      window.dispatchEvent(new CustomEvent('closeMobileDrawer'));
                    }
                  }
                }}
                sx={{
                  borderRadius: 2,
                  color: isLogout ? "error.main" : "inherit",
                  justifyContent: collapsed && !isMobile ? "center" : "flex-start",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
                aria-label={text}
              >
                <ListItemIcon
                  sx={{
                    color: isLogout ? "error.main" : "inherit",
                    minWidth: collapsed && !isMobile ? "auto" : "40px",
                  }}
                >
                  {icon}
                </ListItemIcon>
                {(!collapsed || isMobile) && <ListItemText primary={text} />}
              </ListItemButton>
            </Tooltip>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default Sidebar;
