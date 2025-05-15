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
import Alert from '@mui/material/Alert';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';

// Services
import api from '../../../services/api'; 

const steps = ['Do you have evidence?', 'What is the level of adjustment?', 'What is the category of disability?', 'Is it under the DDA 1992?', 'Additional Comments'];


const NCCDReportForm = ({ 
  // Dialog control props
  open,
  onClose,
  
  // Integration props
  studentId, 
  reportId,
  onSuccess,
  onCancel
}) => {
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
  
  // Determine iff we're in standalone dialog mode or integrated mode
  const isDialogMode = open !== undefined;
  
  // Fetch existing report data iff in edit mode
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

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleChange = (field) => (e) => {
    setFormValues(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

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
      
      // alert users that the form has been submitted
      setSnackbarMessage('Form submitted successfully!');
      setShowSnackbar(true);
      
      // Delay closing the dialog or calling success handler to ensure message is seen
      setTimeout(() => {
        // Different behaviour based on mode
        if (isDialogMode) {
          // In dialog mode, close the dialog
          if (onClose) onClose();
        } else {
          // In integrated mode, call success handler
          if (onSuccess) onSuccess(result);
        }
      }, 2000); // deplay message to show confirmation
    } catch (err) {
      console.error('Error saving report:', err);
      // Show error notification
      setSnackbarMessage('Error saving form. Please try again.');
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    switch (activeStep) {
      // step 1 of the form
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
      // step 2 of the form
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
      // step 3 of the form
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
      // step 4 of the form
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
      // step 5 of the form
      case 4:
        return (
          <FormControl fullWidth>
            <Typography gutterBottom>
              Are there any changes to be made to the next session to support student achievement goals?
            </Typography>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              (Optional)
            </Typography>
            <TextField
              multiline
              rows={4}
              value={formValues.additionalComments}
              onChange={handleChange('additionalComments')}
              placeholder="Enter any suggestions for changes or improvements to better support the student..."
              variant="outlined"
              fullWidth
            />
          </FormControl>
        );
      default:
        return null;
    }
  };

  // Render as standalone dialog iff in dialog mode
  if (isDialogMode) {
    return (
      <>
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
          <DialogTitle>NCCD Data Collection</DialogTitle>
          <DialogContent>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 2 }}>
              {steps.map((label) => (
                <Step key={label}><StepLabel>{label}</StepLabel></Step>
              ))}
            </Stepper>
            {renderStepContent()}
          </DialogContent>
          <DialogActions>
            {activeStep > 0 && (
              <Button onClick={handleBack} disabled={loading}>
                Back
              </Button>
            )}
            {activeStep < steps.length - 1 ? (
              <Button variant="contained" onClick={handleNext} disabled={loading}>
                Continue to Step {activeStep + 2}
              </Button>
            ) : (
              <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : "Submit Form"}
              </Button>
            )}
          </DialogActions>
        </Dialog>

        <Snackbar 
          open={showSnackbar} 
          autoHideDuration={3000} 
          onClose={() => setShowSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setShowSnackbar(false)} 
            severity={snackbarMessage.includes('Error') ? 'error' : 'success'} 
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </>
    );
  }
  
  // Otherwise render as integrated component (without dialog wrapper)
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {reportId ? 'Edit NCCD Report' : 'Create NCCD Report'}
      </Typography>
      
      <Stepper activeStep={activeStep} alternativeLabel sx={{ my: 4 }}>
        {steps.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>
      
      <Box sx={{ my: 4 }}>
        {renderStepContent()}
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button 
          variant="outlined" 
          onClick={onCancel} 
          disabled={loading}
        >
          Cancel
        </Button>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {activeStep > 0 && (
            <Button onClick={handleBack} disabled={loading}>
              Back
            </Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" onClick={handleNext} disabled={loading}>
              Continue
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSubmit} 
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Submit"}
            </Button>
          )}
        </Box>
      </Box>
      
      <Snackbar 
        open={showSnackbar} 
        autoHideDuration={3000} 
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSnackbar(false)} 
          severity={snackbarMessage.includes('Error') ? 'error' : 'success'} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NCCDReportForm;