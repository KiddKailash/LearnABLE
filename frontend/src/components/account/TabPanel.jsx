import React from "react";

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