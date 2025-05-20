/**
 * @file NCCDReportSelection.jsx
 * @description Component for selecting a student and initiating the NCCD report creation process.
 * Provides a user interface for selecting students and managing the report creation workflow.
 * 
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// MUI Components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Services
import api from '../../../services/api';

// Components
import NCCDReportForm from './NCCDReportForm';

/**
 * Component for selecting a student and initiating NCCD report creation
 * 
 * @component
 * @returns {JSX.Element} The student selection interface
 */
const NCCDReportSelection = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Fetch students on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await api.students.getAll();
        setStudents(data);
        
        // Auto-select if only one student exists
        if (data.length === 1) {
          setSelectedStudent(data[0].id);
        }
      } catch (err) {
        setError('Failed to load students. Please try again.');
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  /**
   * Handles form submission and initiates report creation
   * @param {Event} e - The form submission event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      setError('Please select a student');
      return;
    }
    
    setShowForm(true);
  };

  /**
   * Handles successful report creation
   * @param {Object} report - The created report object
   */
  const handleFormSuccess = (report) => {
    navigate(`/reporting/${report.id}`);
  };

  /**
   * Handles cancellation of report creation
   */
  const handleCancel = () => {
    navigate('/reporting');
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show report form when student is selected
  if (showForm) {
    return <NCCDReportForm
      open={showForm}
      studentId={selectedStudent} 
      onSuccess={handleFormSuccess}
      onCancel={handleCancel}
    />;
  }

  return (
    <Box>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 3 
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/reporting')}
          sx={{ mr: 2 }}
        >
          Back to Reports
        </Button>
        <Typography variant="h5">Create New NCCD Report</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={0} sx={{ p: 3, mx: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Select a student for the NCCD report
        </Typography>

        <form onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="student-select-label">Student</InputLabel>
            <Select
              labelId="student-select-label"
              value={selectedStudent}
              label="Student"
              onChange={(e) => setSelectedStudent(e.target.value)}
              required
            >
              {students.map((student) => (
                <MenuItem key={student.id} value={student.id}>
                  {student.first_name} {student.last_name} {student.year_level ? `- Grade ${student.year_level}` : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Continue
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default NCCDReportSelection;