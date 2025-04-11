/**
 * @file Layout.jsx
 * @description Layout component that renders the primary sidebar (if applicable) alongside
 * the main content area. The main content area displays the active route's content via Outlet.
 *
 * Layout:
 *    [Primary Sidebar] | [AppBar + Main Content]
 *
 * @module Layout
 */

import React from "react";
import { Outlet, useLocation } from "react-router-dom";

// Components
import Sidebar from "./Sidebar";
import AppBar from "../components/Appbar/AppBar"; 
import PageWrapper from "./PageWrapper";

// MUI Components
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

/**
 * Layout component that provides the main structure of the application.
 *
 * It conditionally renders the primary sidebar based on the current route and includes a top AppBar
 * across all pages that require the sidebar.
 *
 * @component
 * @returns {JSX.Element} The rendered layout with sidebar, appbar, and main content.
 */
const Layout = ({ mode, toggleTheme }) => {
  const location = useLocation();

  // Sidebar is hidden on public or auth routes
  const doNotDisplaySidebar =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/" ||
    location.pathname === "*";

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100%",
        bgcolor: "background.default",
        p: 1,
      }}
    >
      {/* PRIMARY SIDEBAR */}
      {!doNotDisplaySidebar && (
        <Box
          sx={{
            flexShrink: 0,
            overflow: "auto",
          }}
        >
          <Sidebar />
        </Box>
      )}

      {/* Main content area with AppBar + page content */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 5,
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        {/* PAGE CONTENT */}
        <Container
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            width: "100%",
            height: "100%",
          }}
        >
          <PageWrapper>
          {/* GLOBAL APP BAR */}
          {!doNotDisplaySidebar && (
            <AppBar mode={mode} toggleTheme={toggleTheme} />
          )}

          <Outlet />
          </PageWrapper>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
