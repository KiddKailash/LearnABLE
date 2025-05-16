/**
 * @file NCCDReportForm.jsx
 * @description A multi-step form component for creating and editing NCCD reports.
 * Implements a stepper interface for collecting information about student adjustments
 * and disability categories.
 * 
 * Features:
 * - Multi-step form with validation
 * - Support for both creation and editing modes
 * - Integration with NCCD reporting standards
 * - Form state management
 * - Error handling and notifications
 */

import React, { useState, useEffect } from 'react';

//MUI imports
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';

// Services
import api from '../../../services/api'; 

// Define form steps
const steps = [
  'Do you have evidence?',
  'What is the level of adjustment?',
  'What is the category of disability?',
  'Is it under the DDA 1992?',
  'Additional Comments'
];

/**
 * Multi-step form component for NCCD report creation and editing
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the form dialog is open
 * @param {Function} props.onClose - Handler for dialog close
 * @param {string} props.studentId - ID of the student for the report
 * @param {string} [props.reportId] - ID of the report being edited (optional)
 * @param {Function} props.onSuccess - Handler for successful form submission
 * @param {Function} props.onCancel - Handler for form cancellation
 * @returns {JSX.Element} The NCCD report form
 */
const NCCDReportForm = ({ 
  open,
  onClose,
  studentId, 
  reportId,
  onSuccess,
  onCancel
}) => {
  // Form state management
  const [activeStep, setActiveStep] = useState(0);
  const [formValues, setFormValues] = useState({
    evidence: '',
    levelOfAdjustment: '',
    disabilityCategory: '',
    underDDA: '',
    additionalComments: '',
  });
  const [errors, setErrors] = useState({});
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('Form submitted successfully!');
  const [loading, setLoading] = useState(reportId ? true : false);
  
  // Determine if we're in standalone dialog mode or integrated mode
  const isDialogMode = open !== undefined;
  
  // Fetch existing report data if in edit mode
  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) return;
      
      try {
        setLoading(true);
        const reportData = await api.nccdReports.get(reportId);
        
        setFormValues({
          evidence: reportData.has_evidence ? 'Yes' : 'No',
          levelOfAdjustment: reportData.level_of_adjustment || '',
          disabilityCategory: reportData.disability_category || '',
          underDDA: reportData.under_dda ? 'Yes' : 'No',
          additionalComments: reportData.additional_comments || '',
        });
      } catch (err) {
        console.error('Error fetching report:', err);
        // Show error notification
      } finally {
        setLoading(false);
      }
    };
    
    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  /**
   * Handles moving to the next step in the form
   * Validates current step before proceeding
   */
  const handleNext = () => {
    // Skip validation for final step since it's optional
    if (activeStep === 4) {
      handleSubmit();
      return;
    }
    
    const currentStepKey = Object.keys(formValues)[activeStep];
    if (!formValues[currentStepKey]) {
      setErrors(prev => ({ ...prev, [currentStepKey]: 'This field is required' }));
      return;
    }
    setErrors({});
    setActiveStep(prev => prev + 1);
  };

  /**
   * Handles moving to the previous step in the form
   */
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  /**
   * Handles form field changes
   * @param {string} field - The field being changed
   * @returns {Function} Event handler for the field change
   */
  const handleChange = (field) => (e) => {
    setFormValues(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  /**
   * Handles form submission
   * Validates all required fields and submits to API
   */
  const handleSubmit = async () => {
    // Validate all required fields
    const requiredFields = ['evidence', 'levelOfAdjustment', 'disabilityCategory', 'underDDA'];
    const newErrors = {};
    
    requiredFields.forEach(field => {
      if (!formValues[field]) {
        newErrors[field] = 'This field is required';
      }
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare data for API submission
      const reportData = {
        student: studentId,
        has_evidence: formValues.evidence === 'Yes',
        level_of_adjustment: formValues.levelOfAdjustment,
        disability_category: formValues.disabilityCategory,
        under_dda: formValues.underDDA === 'Yes',
        additional_comments: formValues.additionalComments,
        status: 'Approved' // Default status for updated/new reports
      };
      
      let result;
      
      if (reportId) {
        // Update existing report
        result = await api.nccdReports.update(reportId, reportData);
      } else {
        // Create new report
        result = await api.nccdReports.create(reportData);
      }
      
      // Show success message
      setSnackbarMessage('Form submitted successfully!');
      setShowSnackbar(true);
      
      // Delay closing the dialog or calling success handler
      setTimeout(() => {
        if (isDialogMode) {
          if (onClose) onClose();
        } else {
          if (onSuccess) onSuccess(result);
        }
      }, 2000);
    } catch (err) {
      console.error('Error saving report:', err);
      setSnackbarMessage('Error saving form. Please try again.');
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Renders the content for the current step
   * @returns {JSX.Element} The step content
   */
  const renderStepContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    switch (activeStep) {
      // Evidence step
      case 0:
        return (
          <FormControl error={!!errors.evidence} fullWidth>
            <Typography>
              Does the school team have evidence under the <strong>Disability Standards for Education 2005</strong>?
            </Typography>
            <RadioGroup value={formValues.evidence} onChange={handleChange('evidence')}>
              <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
              <FormControlLabel value="Not sure" control={<Radio />} label="I'm not sure" />
            </RadioGroup>
            {errors.evidence && (
              <Typography color="error" variant="caption">
                {errors.evidence}
              </Typography>
            )}
          </FormControl>
        );
      // Level of adjustment step
      case 1:
        return (
          <FormControl error={!!errors.levelOfAdjustment} fullWidth>
            <Typography>Which level of reasonable adjustment is being provided?</Typography>
            <RadioGroup value={formValues.levelOfAdjustment} onChange={handleChange('levelOfAdjustment')}>
              <FormControlLabel value="QDTP" control={<Radio />} label="Quality Differentiated Teaching Practice" />
              <FormControlLabel value="Supplementary" control={<Radio />} label="Supplementary adjustments" />
              <FormControlLabel value="Substantial" control={<Radio />} label="Substantial adjustments" />
              <FormControlLabel value="Extensive" control={<Radio />} label="Extensive adjustments" />
            </RadioGroup>
            {errors.levelOfAdjustment && (
              <Typography color="error" variant="caption">
                {errors.levelOfAdjustment}
              </Typography>
            )}
          </FormControl>
        );
      // Disability category step
      case 2:
        return (
          <FormControl error={!!errors.disabilityCategory} fullWidth>
            <Typography>Which category of disability has the greatest impact?</Typography>
            <RadioGroup value={formValues.disabilityCategory} onChange={handleChange('disabilityCategory')}>
              <FormControlLabel value="Physical" control={<Radio />} label="Physical" />
              <FormControlLabel value="Cognitive" control={<Radio />} label="Cognitive" />
              <FormControlLabel value="Sensory" control={<Radio />} label="Sensory" />
              <FormControlLabel value="Social/emotional" control={<Radio />} label="Social/emotional" />
            </RadioGroup>
            {errors.disabilityCategory && (
              <Typography color="error" variant="caption">
                {errors.disabilityCategory}
              </Typography>
            )}
          </FormControl>
        );
      // DDA compliance step
      case 3:
        return (
          <FormControl error={!!errors.underDDA} fullWidth>
            <Typography>Is this adjustment to address a disability under the <strong>Disability Discrimination Act 1992</strong>?</Typography>
            <RadioGroup value={formValues.underDDA} onChange={handleChange('underDDA')}>
              <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
            </RadioGroup>
            {errors.underDDA && (
              <Typography color="error" variant="caption">
                {errors.underDDA}
              </Typography>
            )}
          </FormControl>
        );
      // Additional comments step
      case 4:
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Additional Comments"
            value={formValues.additionalComments}
            onChange={handleChange('additionalComments')}
            placeholder="Enter any additional information about the adjustments..."
          />
        );
      default:
        return null;
    }
  };

  // Render the form content
  const formContent = (
    <>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderStepContent()}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
          disabled={loading}
        >
          {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
        </Button>
      </Box>
    </>
  );

  // Render in dialog mode if open prop is provided
  if (isDialogMode) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {reportId ? 'Edit NCCD Report' : 'Create NCCD Report'}
        </DialogTitle>
        <DialogContent>
          {formContent}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Render in standalone mode
  return formContent;
};

export default NCCDReportForm;