import React from 'react';
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";

/**
 * Reusable dashboard card component
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

export default DashboardCard;