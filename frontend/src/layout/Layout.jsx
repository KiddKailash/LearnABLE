/**
 * @file Layout.jsx
 * @description Layout component that renders the primary sidebar (if applicable) alongside
 * the main content area and an additional right-hand sidebar. The main content area displays
 * the active route's content via Outlet.
 *
 * Layout:
 *    [Primary Sidebar] | [Main content area fills leftover space + can scroll]
 *
 * @module Layout
 */

import React, { useState } from "react";
import PropTypes from "prop-types";
import { Outlet, useLocation } from "react-router-dom";

// Components
import Sidebar from "./Sidebar";
import PageWrapper from "../components/PageWrapper";

// MUI Components
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";

// MUI Icons
import MenuIcon from "@mui/icons-material/Menu";

/**
 * Layout component that provides the main layout for the application.
 *
 * @component
 * @param {Object} props
 * @returns {JSX.Element} The rendered Dashboard layout component.
 */
const Layout = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Add event listener for mobile drawer closing
  React.useEffect(() => {
    const handleCloseDrawer = () => {
      setMobileOpen(false);
    };

    window.addEventListener('closeMobileDrawer', handleCloseDrawer);
    return () => {
      window.removeEventListener('closeMobileDrawer', handleCloseDrawer);
    };
  }, []);

  /**
   * Determines if the sidebar should be hidden based on the current path.
   *
   * The sidebar is not displayed on the following routes:
   * - /login
   * - /register
   * - /
   * - *
   *
   * @type {boolean}
   */
  const doNotDisplaySidebar =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/" ||
    location.pathname === "*";

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh", // fill viewport height
        width: "100%", // fill viewport width
        bgcolor: "background.default",
        p: doNotDisplaySidebar ? 0 : { xs: 0, sm: 1 },
        gap: { xs: 0, sm: 1 },
      }}
    >
      {!doNotDisplaySidebar && (
        <>
          {/* Mobile menu button */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                position: "fixed",
                top: 16,
                left: 16,
                zIndex: 1200,
                bgcolor: "background.paper",
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Mobile drawer */}
          {isMobile ? (
            <Drawer
              variant="temporary"
              anchor="left"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile
              }}
              sx={{
                display: { xs: "block", md: "none" },
                "& .MuiDrawer-paper": {
                  boxSizing: "border-box",
                  width: 240,
                },
              }}
            >
              <Sidebar />
            </Drawer>
          ) : (
            // Desktop sidebar
            <Box
              sx={{
                flexShrink: 0,
                overflow: "auto",
                display: { xs: "none", md: "block" },
              }}
            >
              <Sidebar />
            </Box>
          )}
        </>
      )}

      {/* Outer box that holds secondary sidebar + main content */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: { xs: 0, sm: 5 },
          flexGrow: 1,
          width: "100%",
          height: "100%",
          overflowY: "auto",
        }}
      >
        <PageWrapper>
          {/* Renders whatever route/page is active */}
          <Outlet />
        </PageWrapper>
      </Box>
    </Box>
  );
};

Layout.propTypes = {
  mode: PropTypes.string,
};

export default Layout;
