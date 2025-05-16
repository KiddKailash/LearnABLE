/**
 * @file ResponsiveNCCDReporting.jsx
 * @description A responsive wrapper component that conditionally renders either the desktop or mobile version
 * of the NCCD reporting page based on the screen size. Uses Material-UI's useMediaQuery hook to determine
 * the appropriate layout.
 * 
 */

import React from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

// Import both reporting components
import NCCDReports from "./Reporting.jsx";
import MobileReportingPage from "./MobileReporting.jsx";

/**
 * Responsive wrapper component that renders either the desktop or mobile version
 * of the NCCD reporting page based on screen size.
 * 
 * @component
 * @returns {JSX.Element} The appropriate reporting component based on screen size
 */
const ResponsiveNCCDReporting = () => {
  const theme = useTheme();
  // Use 'sm' breakpoint (600px) as the threshold for mobile/desktop switch
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Render the appropriate component based on screen size
  return isMobile ? <MobileReportingPage /> : <NCCDReports />;
};

export default ResponsiveNCCDReporting; 