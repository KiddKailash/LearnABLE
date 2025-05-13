/**
 * @fileoverview Reusable dashboard card component that displays content in a card format with optional header and footer actions
 * 
 * @module DashboardCard
 */
import React from 'react';
import PropTypes from 'prop-types';

// MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";

/**
 * Reusable dashboard card component that displays content in a card format with optional header and footer actions
 * 
 * @param {Object} props
 * @param {string} props.title - The title displayed in the card header
 * @param {React.ReactNode} props.action - Optional action element displayed in the header
 * @param {React.ReactNode} props.children - The main content of the card
 * @param {boolean} props.fullHeight - Whether the card should take full height of its container
 * @param {string} props.actionText - Text for the footer action button
 * @param {Function} props.onActionClick - Callback for the footer action button
 * @param {React.ReactNode} props.footerContent - Custom footer content to replace the default action button
 */
const DashboardCard = ({ 
  title, 
  action, 
  children, 
  fullHeight = true,
  actionText,
  onActionClick,
  footerContent
}) => {
  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        height: fullHeight ? "100%" : "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          p: 2,
          bgcolor: "primary.main",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">{title}</Typography>
        {action}
      </Box>

      <Box sx={{ p: 0, flexGrow: 1, overflow: "auto" }}>
        {children}
      </Box>

      {(footerContent || actionText) && (
        <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
          {footerContent || (
            <Button
              fullWidth
              variant="outlined"
              onClick={onActionClick}
            >
              {actionText}
            </Button>
          )}
        </Box>
      )}
    </Paper>
  );
};

DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  action: PropTypes.node,
  children: PropTypes.node.isRequired,
  fullHeight: PropTypes.bool,
  actionText: PropTypes.string,
  onActionClick: PropTypes.func,
  footerContent: PropTypes.node,
};

export default DashboardCard;