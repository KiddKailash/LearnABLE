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

const NCCDReportSelection = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await api.students.getAll();
        setStudents(data);
        
        // If there's only one student, auto-select them
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      setError('Please select a student');
      return;
    }
    
    setShowForm(true);
  };

  const handleFormSuccess = (report) => {
    navigate(`/reporting/${report.id}`);
  };

  const handleCancel = () => {
    navigate('/reporting');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (showForm) {
    return <NCCDReportForm 
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

      <Paper elevation={2} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
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