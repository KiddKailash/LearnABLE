/**
 * @file TabPanel.jsx
 * @description A reusable component that renders content for a specific tab in a tabbed interface.
 * This component handles the visibility of tab content based on the current selected tab index.
 */

import React from "react";

/**
 * TabPanel component that manages the visibility of tab content
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to be rendered within the tab panel
 * @param {number} props.value - Current selected tab index
 * @param {number} props.index - Index of this tab panel
 * @param {Object} props.other - Additional props to be spread to the div element
 * @returns {JSX.Element} A div element that shows/hides content based on tab selection
 */
const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      style={{ padding: "20px 0" }}
    >
      {value === index && children}
    </div>
  );
};

export default TabPanel; 