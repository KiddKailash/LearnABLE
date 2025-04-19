/**
 * @file Dashboard.jsx
 * @file Dashboard.jsx
 * @description Layout component that renders the primary sidebar (if applicable) alongside
 * the main content area and an additional right-hand sidebar. The main content area displays
 * the active route's content via Outlet.
 *
 * Layout:
 *    [Primary Sidebar] | [Main content area fills leftover space + can scroll]
 *
 * @module Layout
 */

import React from "react";
import { Outlet, useLocation } from "react-router-dom";

// Components
import Sidebar from "./Sidebar";
import Chatbar from "./Chatbar";

// MUI Components
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

/**
 * Dashboard component that provides the main layout for the application.
 * Dashboard component that provides the main layout for the application.
 *
 * It conditionally renders the primary sidebar based on the current route. For example,
 * the sidebar is hidden on login, registration, home, or catch-all routes.
 *
 * @component
 * @returns {JSX.Element} The rendered Dashboard layout component.
 * @returns {JSX.Element} The rendered Dashboard layout component.
 */
const Layout = () => {
  const location = useLocation();

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

  const doNotDisplayChatbar = doNotDisplaySidebar; // ADD ROUTES HERE

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh", // fill viewport height
        width: "100%", // fill viewport width
        bgcolor: "background.default",
        p: doNotDisplaySidebar ? 0 : 1,
        gap: 1,
      }}
    >
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

      {/* Outer box that holds secondary sidebar + main content */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 5,
          display: "flex",
          flexGrow: 1, // let this box expand to fill leftover space
        }}
      >
        {/* MAIN CONTENT AREA */}
        <Container
          sx={{
            flexGrow: 1, // again, fill remaining horizontal space
            overflowY: "auto", // scroll if content is too tall
            display: "flex", // we use a flex container to position the <Container>
            width: "100%",
            height: "100%",
          }}
        >
          {/* Renders whatever route/page is active */}
          <Outlet />
        </Container>
      </Box>

      {!doNotDisplayChatbar && (
        <Chatbar
          sx={(theme) => ({
            flexShrink: 0,
            overflow: "auto",
            borderRadius: theme.shape.border,
          })}
        />
      )}
    </Box>
  );
};

export default Layout;
