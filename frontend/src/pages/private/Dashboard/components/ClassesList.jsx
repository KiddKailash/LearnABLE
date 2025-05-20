/**
 * @fileoverview ClassesList component for displaying the list of classes
 * 
 * @module ClassesList
 */

import React from 'react';

// Components
import DashboardCard from './DashboardCard';
import EmptyState from '../../../../components/EmptyState';

// MUI Components
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';

// MUI Icons
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import ClassIcon from '@mui/icons-material/Class';

/**
 * ClassesList component for displaying the list of classes
 * 
 * @param {Object} props
 * @param {Array} props.classes - Array of class objects
 * @param {Function} props.onNavigate - Function to handle navigation
 */
const ClassesList = ({ classes, onNavigate }) => {
  return (
    <DashboardCard
      title="Your Classes"
      action={
        classes.length > 0 && (
          <Button
            size="small"
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => onNavigate('/classes?create=true')}
          >
            New
          </Button>
        )
      }
      actionText="View All Classes"
      onActionClick={() => onNavigate('/classes')}
    >
      <List sx={{ p: 0, flexGrow: 1, overflow: 'auto' }}>
        {classes.length > 0 ? (
          classes.map((classItem) => (
            <ListItemButton
              key={classItem.id}
              onClick={() => onNavigate(`/classes/${classItem.id}?mode=students`)}
              sx={{
                py: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                transition: 'background-color 0.2s',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Avatar
                sx={{
                  mr: 2,
                  bgcolor: 'primary.light',
                }}
              >
                {classItem.class_name.charAt(0)}
              </Avatar>
              <ListItemText
                primary={classItem.class_name}
                secondary={`${classItem.students?.length || 0} students`}
              />
              <ArrowForwardIcon fontSize="small" color="action" />
            </ListItemButton>
          ))
        ) : (
          <EmptyState
            title="No classes yet"
            description="Create your first class to get started organizing your students and materials"
            actionText="Create Class"
            actionIcon={<AddIcon />}
            onActionClick={() => onNavigate('/classes?create=true')}
            icon={
              <ClassIcon
                sx={{
                  fontSize: 60,
                  opacity: 0.6,
                  mb: 2,
                  color: 'primary.light',
                }}
              />
            }
          />
        )}
      </List>
    </DashboardCard>
  );
};

export default ClassesList; 