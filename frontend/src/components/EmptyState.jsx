
/**
 * @fileoverview EmptyState component for displaying empty state messages in a card format.
 * 
 * @module EmptyState
 */
import React from 'react';
import PropTypes from 'prop-types';

// MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

/**
 * Enhanced empty state component that displays a message when there's no content to show
 * 
 * @param {Object} props
 * @param {string} props.title - The main title of the empty state
 * @param {string} props.description - A description explaining why the content is empty
 * @param {string} props.actionText - Text for the action button
 * @param {React.ReactNode} props.actionIcon - Icon to display before the action button text
 * @param {Function} props.onActionClick - Callback for the action button click
 * @param {boolean} props.disabled - Whether the action button should be disabled
 * @param {string} props.errorText - Optional error message to display below the action button
 * @param {React.ReactNode} props.icon - Custom icon to display (defaults to SentimentDissatisfiedIcon)
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

EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  actionText: PropTypes.string,
  actionIcon: PropTypes.node,
  onActionClick: PropTypes.func,
  disabled: PropTypes.bool,
  errorText: PropTypes.string,
  icon: PropTypes.node,
};

export default EmptyState;