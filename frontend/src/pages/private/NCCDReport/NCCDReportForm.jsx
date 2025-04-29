import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// MUI Components
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

// Local imports
import FormField from '../../../components/FormField';
import LoadingButton from '../../../components/LoadingButton';
import useFormValidation from '../../../hooks/useFormValidation';
import api from '../../../services/api';

// Validation function for NCCD report form
const validateNCCDForm = (values) => {
  const errors = {};
  
  if (values.has_diagonsed_disability && !values.disability_category) {
    errors.disability_category = "Disability category is required when diagnosed disability is selected";
  }

  if (!values.level_of_adjustment) {
    errors.level_of_adjustment = "Level of adjustment is required";
  }

  if (values.status === 'Approved' && !values.level_of_adjustment) {
    errors.status = "Cannot approve report without level of adjustment";
  }

  return errors;
};

/**
 * Component for creating and editing NCCD reports
 */
const NCCDReportForm = ({ studentId, reportId, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [initialFetching, setInitialFetching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentEvidence, setCurrentEvidence] = useState(null);
  
  // Initialize form with defaults
  const initialValues = {
    student: studentId,
    status: 'NotStart',
    has_diagonsed_disability: false,
    disability_category: '',
    level_of_adjustment: '',
  };
  
  const {
    values,
    errors,
    touched,
    handleChange,
    setFieldValue,
    handleBlur,
    validateForm,
    resetForm,
  } = useFormValidation(initialValues, validateNCCDForm);

  // If reportId is provided, fetch the existing report
  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) return;
      
      try {
        setInitialFetching(true);
        const data = await api.get(`/api/nccdreports/${reportId}/`);
        
        // Update form values
        setFieldValue('student', data.student);
        setFieldValue('status', data.status);
        setFieldValue('has_diagonsed_disability', data.has_diagonsed_disability);
        setFieldValue('disability_category', data.disability_category);
        setFieldValue('level_of_adjustment', data.level_of_adjustment);
        
        // Handle evidence file
        if (data.evidence) {
          setCurrentEvidence(data.evidence);
        }
      } catch (error) {
        setErrorMessage('Failed to load NCCD report: ' + (error.message || ''));
      } finally {
        setInitialFetching(false);
      }
    };
    
    fetchReport();
  }, [reportId, setFieldValue]);

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type (PDF, DOC, DOCX, JPG, PNG)
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Invalid file type. Please upload PDF, DOC, DOCX, JPG, or PNG files.');
      return;
    }
    
    if (file.size > maxSize) {
      setErrorMessage('File too large. Maximum file size is 10MB.');
      return;
    }
    
    setSelectedFile(file);
    setErrorMessage('');
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      setErrorMessage('Please fix the form errors before submitting.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare data for API
      const formData = { ...values };
      
      // Add evidence file if selected
      if (selectedFile) {
        formData.evidence = selectedFile;
      }
      
      // Create or update report
      let result;
      if (reportId) {
        result = await api.nccdReports.update(reportId, formData);
      } else {
        result = await api.nccdReports.create(formData);
      }
      
      // Success
      setSuccessMessage('NCCD report saved successfully');
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      setErrorMessage('Failed to save NCCD report: ' + (error.message || ''));
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching initial data
  if (initialFetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        {reportId ? 'Edit NCCD Report' : 'Create New NCCD Report'}
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          <Grid size={12}>
            <FormControl 
              component="fieldset" 
              error={touched.status && Boolean(errors.status)}
              required
              fullWidth
            >
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                Report Status
              </Typography>
              <RadioGroup
                name="status"
                value={values.status}
                onChange={handleChange}
                row
              >
                <FormControlLabel 
                  value="NotStart" 
                  control={<Radio />} 
                  label="Not Started" 
                />
                <FormControlLabel 
                  value="InProgress" 
                  control={<Radio />} 
                  label="In Progress" 
                />
                <FormControlLabel 
                  value="Approved" 
                  control={<Radio />} 
                  label="Approved" 
                />
              </RadioGroup>
              {touched.status && errors.status && (
                <FormHelperText error>{errors.status}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          <Grid size={12}>
            <FormField
              fieldType="checkbox"
              id="has_diagonsed_disability"
              name="has_diagonsed_disability"
              label="Student has diagnosed disability"
              value={values.has_diagonsed_disability}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.has_diagonsed_disability && Boolean(errors.has_diagonsed_disability)}
              helperText={touched.has_diagonsed_disability && errors.has_diagonsed_disability}
            />
          </Grid>
          
          {values.has_diagonsed_disability && (
            <Grid size={12}>
              <FormField
                fieldType="select"
                id="disability_category"
                name="disability_category"
                label="Disability Category"
                value={values.disability_category}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.disability_category && Boolean(errors.disability_category)}
                helperText={touched.disability_category && errors.disability_category}
                required={values.has_diagonsed_disability}
                options={[
                  { value: "", label: "Select a category" },
                  { value: "Cognitive", label: "Cognitive" },
                  { value: "Physical", label: "Physical" },
                  { value: "Social/Emotional", label: "Social/Emotional" },
                  { value: "Sensory", label: "Sensory" },
                ]}
              />
            </Grid>
          )}
          
          <Grid size={12}>
            <FormField
              fieldType="select"
              id="level_of_adjustment"
              name="level_of_adjustment"
              label="Level of Adjustment"
              value={values.level_of_adjustment}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.level_of_adjustment && Boolean(errors.level_of_adjustment)}
              helperText={touched.level_of_adjustment && errors.level_of_adjustment}
              required
              options={[
                { value: "", label: "Select a level" },
                { value: "QDTP", label: "Quality Differentiated Teaching Practice (QDTP)" },
                { value: "Supplementary", label: "Supplementary" },
                { value: "Substantial", label: "Substantial" },
                { value: "Extensive", label: "Extensive" },
              ]}
            />
          </Grid>
          
          <Grid size={12}>
            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
              Supporting Evidence
            </Typography>
            
            {currentEvidence && !selectedFile && (
              <Box sx={{ mb: 2 }}>
                <Alert severity="info" sx={{ mb: 1 }}>
                  Current evidence file: {currentEvidence.split('/').pop()}
                </Alert>
              </Box>
            )}
            
            <Button
              variant="outlined"
              component="label"
              sx={{ mr: 2 }}
            >
              {selectedFile ? 'Change File' : 'Upload Evidence'}
              <input
                type="file"
                hidden
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </Button>
            
            {selectedFile && (
              <Typography variant="body2" display="inline">
                Selected: {selectedFile.name}
              </Typography>
            )}
          </Grid>
          
          <Grid size={12} sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={loading}
            >
              {reportId ? 'Update Report' : 'Create Report'}
            </LoadingButton>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

NCCDReportForm.propTypes = {
  /** Student ID for whom the report is being created/edited */
  studentId: PropTypes.number.isRequired,
  
  /** Report ID if editing an existing report */
  reportId: PropTypes.number,
  
  /** Callback function called on successful submission */
  onSuccess: PropTypes.func,
  
  /** Callback function called when cancel button is clicked */
  onCancel: PropTypes.func,
};

export default NCCDReportForm; 