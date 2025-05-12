import React from 'react';
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

/**
 * Enhanced empty state component with illustration
 */
const EmptyState = ({
  title,
  description,
  actionText,
  actionIcon,
  onActionClick,
  disabled = false,
  errorText = null,
  icon = <SentimentDissatisfiedIcon sx={{ fontSize: 60, opacity: 0.6, mb: 2 }} />,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        py: 4,
        px: 2,
        height: "100%",
        minHeight: 180,
      }}
    >
      {icon}
      
      <Typography variant="h6" sx={{ mb: 1 }}>
        {title}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 300 }}>
        {description}
      </Typography>
      
      {actionText && onActionClick && (
        <>
          <Button
            variant="contained"
            color="primary"
            startIcon={actionIcon}
            onClick={onActionClick}
            disabled={disabled}
          >
            {actionText}
          </Button>
          
          {errorText && (
            <Typography 
              variant="body2" 
              color="error" 
              sx={{ mt: 1 }}
            >
              {errorText}
            </Typography>
          )}
        </>
      )}
    </Box>
  );
};

export default EmptyState;