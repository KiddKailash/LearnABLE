/**
 * @fileoverview NCCDReportsSummary component for displaying NCCD reports summary
 * 
 * @module NCCDReportsSummary
 */

import React from 'react';

// MUI Components
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

// MUI Icons
import DescriptionIcon from '@mui/icons-material/Description';
import EmptyState from '../EmptyState';

/**
 * NCCDReportsSummary component for displaying NCCD reports summary
 * 
 * @param {Object} props
 * @param {Array} props.reports - Array of NCCD report objects
 * @param {Array} props.students - Array of student objects
 * @param {Function} props.onNavigate - Function to handle navigation
 */
const NCCDReportsSummary = ({ reports, students, onNavigate }) => {
  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        mt: 2,
      }}
    >
      <Box
        sx={{
          p: 2,
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">NCCD Reports Summary</Typography>
        <Button
          size="small"
          variant="contained"
          color="secondary"
          onClick={() => onNavigate('/reporting')}
        >
          View All
        </Button>
      </Box>

      <Box sx={{ p: 3 }}>
        {reports.length > 0 ? (
          <Grid container spacing={2}>
            {reports.map((report) => {
              const student = students.find((s) => s.id === report.student);
              return (
                <Grid size={{ xs: 12, md: 4, lg: 4 }} key={report.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      bgcolor: 'background.paper',
                      borderColor: 'divider',
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: 1,
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="medium">
                          {student
                            ? `${student.first_name} ${student.last_name}`
                            : `Student #${report.student}`}
                        </Typography>
                        <Chip
                          size="small"
                          label={report.status}
                          color={report.status === 'Approved' ? 'success' : 'primary'}
                          variant="outlined"
                        />
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Disability:</strong>{' '}
                        {report.disability_category || 'Not specified'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Adjustment Level:</strong>{' '}
                        {report.level_of_adjustment || 'Not specified'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <EmptyState
            title="No NCCD reports yet"
            description="Create reports to track adjustments and support for students with disability"
            actionText="Create Your First Report"
            actionIcon={<DescriptionIcon />}
            onActionClick={() => onNavigate('/reporting?newReport=true')}
            disabled={students.length === 0}
            icon={
              <DescriptionIcon
                sx={{
                  fontSize: 60,
                  opacity: 0.6,
                  mb: 2,
                  color: 'primary.light',
                }}
              />
            }
            errorText={
              students.length === 0
                ? 'You need to add students before creating NCCD reports'
                : null
            }
          />
        )}
      </Box>
    </Paper>
  );
};

export default NCCDReportsSummary; 