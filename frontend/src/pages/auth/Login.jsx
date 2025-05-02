import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// MUI Components
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

// Services
import authApi from '../../services/authApi';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [notification, setNotification] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check for state (notifications) passed via navigate
  useEffect(() => {
    if (location.state?.message) {
      setNotification({
        message: location.state.message,
        severity: location.state.severity || 'info'
      });
      
      // Clear the state to prevent showing the same notification multiple times
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Validate form
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!twoFactorRequired && !formData.password) newErrors.password = 'Password is required';
    if (twoFactorRequired && !formData.twoFactorCode) newErrors.twoFactorCode = 'Authentication code is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      if (twoFactorRequired) {
        // Submit 2FA verification
        await authApi.verifyTwoFactor(formData.email, formData.twoFactorCode);
        navigate('/dashboard');
      } else {
        // Submit login
        const response = await authApi.login(formData.email, formData.password);
        
        if (response.two_factor_required) {
          setTwoFactorRequired(true);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseNotification = () => {
    setNotification(null);
  };
  
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Login to LearnABLE
          </Typography>
          
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMessage}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={twoFactorRequired || loading}
            />
            
            {!twoFactorRequired ? (
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                disabled={loading}
              />
            ) : (
              <TextField
                margin="normal"
                required
                fullWidth
                name="twoFactorCode"
                label="Authentication Code"
                id="twoFactorCode"
                value={formData.twoFactorCode}
                onChange={handleChange}
                error={!!errors.twoFactorCode}
                helperText={errors.twoFactorCode || "Enter the code from your authenticator app"}
                disabled={loading}
              />
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Please wait...' : (twoFactorRequired ? 'Verify Code' : 'Sign In')}
            </Button>
          </form>
        </Paper>
      </Box>
      
      {/* Notification for session termination */}
      <Snackbar 
        open={!!notification} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification?.severity || 'info'} 
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login; 