/**
 * @fileoverview QuickActions component for displaying dashboard quick actions
 * 
 * @module QuickActions
 */

import React from 'react';

// Components
import DashboardCard from './DashboardCard';

// MUI Components
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

// MUI Icons
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SchoolIcon from '@mui/icons-material/School';
import DescriptionIcon from '@mui/icons-material/Description';

/**
 * QuickActions component for displaying dashboard quick actions
 * 
 * @param {Object} props
 * @param {Function} props.onNavigate - Function to handle navigation
 */
const QuickActions = ({ onNavigate }) => {
  const actions = [
    {
      icon: <SchoolIcon color="primary" />,
      primary: 'Manage Classes',
      secondary: 'View and edit your classes',
      path: '/classes',
    },
    {
      icon: <DescriptionIcon color="primary" />,
      primary: 'NCCD Reporting',
      secondary: 'Manage disability reports and requirements',
      path: '/reporting',
    },
  ];

  return (
    <DashboardCard title="Quick Actions">
      <List sx={{ p: 0 }}>
        {actions.map((action, index) => (
          <ListItemButton
            key={action.primary}
            onClick={() => onNavigate(action.path)}
            sx={{
              py: 2,
              borderBottom: index < actions.length - 1 ? '1px solid' : 'none',
              borderColor: 'divider',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <ListItemIcon>{action.icon}</ListItemIcon>
            <ListItemText
              primary={action.primary}
              secondary={action.secondary}
            />
            <ArrowForwardIcon fontSize="small" color="action" />
          </ListItemButton>
        ))}
      </List>
    </DashboardCard>
  );
};

export default QuickActions; 