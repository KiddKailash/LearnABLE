/**
 * @fileoverview DashboardSkeleton component for displaying loading state
 * 
 * @module DashboardSkeleton
 */

import React from 'react';

// MUI Components
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';

/**
 * DashboardSkeleton component for displaying loading state
 */
const DashboardSkeleton = () => {
  return (
    <Box sx={{ mb: 4 }}>
      {/* Header skeleton */}
      <Box sx={{ mb: 2 }}>
        <Skeleton variant="text" width="50%" height={60} />
        <Skeleton variant="text" width="70%" height={30} />
      </Box>

      {/* Stat cards skeleton */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[1, 2].map((i) => (
          <Grid xs={12} sm={6} key={i}>
            <Skeleton variant="rounded" height={120} />
          </Grid>
        ))}
      </Grid>

      {/* Content area skeleton */}
      <Grid container spacing={2}>
        {[1, 2].map((i) => (
          <Grid xs={12} md={6} key={i}>
            <Skeleton variant="rounded" height={350} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardSkeleton; 