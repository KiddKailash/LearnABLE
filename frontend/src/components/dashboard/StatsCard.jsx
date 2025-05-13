/**
 * @fileoverview StatsCard component for displaying dashboard statistics
 * 
 * @module StatsCard
 */

import React from 'react';
import { Paper, Box, Typography } from '@mui/material';

/**
 * StatsCard component for displaying dashboard statistics
 * 
 * @param {Object} props
 * @param {string} props.label - The label for the stat
 * @param {number} props.value - The value to display
 * @param {React.ReactNode} props.icon - The icon to display
 * @param {string} props.color - The background color for the card
 */
const StatsCard = ({ label, value, icon, color }) => {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        height: '100%',
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? theme.palette.background.paper : color,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3,
        },
      }}
    >
      <Box sx={{ mr: 2 }}>{icon}</Box>
      <Box>
        <Typography variant="h3" fontWeight="bold">
          {value}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Paper>
  );
};

export default StatsCard; 