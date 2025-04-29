import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

// MUI components
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

// Custom components
import LoadingButton from "../../components/LoadingButton";

// Hooks and utils
import useFormValidation from "../../hooks/useFormValidation";
import {
  validateEmail,
  validateRequired,
  validatePassword,
} from "../../utils/validationRules";

// Contexts
import { SnackbarContext } from "../../contexts/SnackbarContext";
import UserContext from "../../contexts/UserObject";

/**
 * Login form validation function
 */
const validateLoginForm = (values) => {
  const errors = {};

  const emailError = validateEmail(values.email);
  if (emailError) {
    errors.email = emailError;
  }

  const passwordError = validateRequired(values.password, "Password");
  if (passwordError) {
    errors.password = passwordError;
  }

  return errors;
};

/**
 * Registration form validation function
 */
const validateRegisterForm = (values) => {
  const errors = {};

  const firstNameError = validateRequired(values.first_name, "First Name");
  if (firstNameError) {
    errors.first_name = firstNameError;
  }

  const lastNameError = validateRequired(values.last_name, "Last Name");
  if (lastNameError) {
    errors.last_name = lastNameError;
  }

  const emailError = validateEmail(values.email);
  if (emailError) {
    errors.email = emailError;
  }

  const passwordError = validatePassword(values.password);
  if (passwordError) {
    errors.password = passwordError;
  }

  return errors;
};

const AuthPage = ({ initialTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const { showSnackbar } = useContext(SnackbarContext);
  const { login, registerTeacher } = useContext(UserContext);
  const navigate = useNavigate();

  // Login form handling
  const loginForm = useFormValidation(
    { email: "", password: "" },
    validateLoginForm
  );

  // Register form handling
  const registerForm = useFormValidation(
    { first_name: "", last_name: "", email: "", password: "" },
    validateRegisterForm
  );

  // Loading states
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    if (!loginForm.validateForm()) {
      showSnackbar("Please fix form errors before submitting", "error");
      return;
    }

    setLoginLoading(true);
    try {
      const result = await login(
        loginForm.values.email,
        loginForm.values.password
      );

      if (result.success) {
        showSnackbar("Login successful!", "success");
        navigate("/dashboard");
      } else {
        showSnackbar(result.message || "Login failed", "error");
      }
    } catch (error) {
      showSnackbar("Error occurred during login", "error");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    if (!registerForm.validateForm()) {
      showSnackbar("Please fix form errors before submitting", "error");
      return;
    }

    setRegisterLoading(true);
    try {
      const result = await registerTeacher(
        registerForm.values.first_name,
        registerForm.values.last_name,
        registerForm.values.email,
        registerForm.values.password
      );

      if (result.success) {
        showSnackbar("Registration successful! Please log in.", "success");
        setActiveTab(0); // Switch to login tab
        registerForm.resetForm(); // Clear the registration form
      } else {
        showSnackbar(result.message || "Registration failed", "error");
      }
    } catch (error) {
      showSnackbar("Error occurred during registration", "error");
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ p: 4 }}>
      <Box
        sx={(theme) => ({
          padding: theme.spacing(4),
          marginTop: theme.spacing(4),
          bgcolor: theme.palette.background.paper,
          boxShadow: theme.shadows[22],
          borderRadius: theme.shape.borderRadius,
          border: `1px solid ${theme.palette.divider}`,
        })}
      >
        <Typography variant="h4" align="center" gutterBottom>
          LearnABLE Portal
        </Typography>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          sx={{ mb: 3 }}
        >
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>

        {/* Login Tab */}
        {activeTab === 0 && (
          <Box component="form" noValidate onSubmit={handleLoginSubmit}>
            <Stack direction="column" spacing={2}>
              <TextField
                fullWidth
                id="login-email"
                name="email"
                label="Email"
                type="email"
                value={loginForm.values.email}
                onChange={loginForm.handleChange}
                onBlur={loginForm.handleBlur}
                error={
                  loginForm.touched.email && Boolean(loginForm.errors.email)
                }
                helperText={loginForm.touched.email && loginForm.errors.email}
                required
                autoComplete="email"
              />

              <TextField
                fullWidth
                id="login-password"
                name="password"
                label="Password"
                type="password"
                value={loginForm.values.password}
                onChange={loginForm.handleChange}
                onBlur={loginForm.handleBlur}
                error={
                  loginForm.touched.password &&
                  Boolean(loginForm.errors.password)
                }
                helperText={
                  loginForm.touched.password && loginForm.errors.password
                }
                required
                autoComplete="current-password"
              />

              <LoadingButton
                fullWidth
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                loading={loginLoading}
              >
                Login
              </LoadingButton>
            </Stack>
          </Box>
        )}

        {/* Register Tab */}
        {activeTab === 1 && (
          <Box component="form" noValidate onSubmit={handleRegisterSubmit}>
            <Stack direction="column" spacing={2}>
              <TextField
                fullWidth
                id="register-first-name"
                name="first_name"
                label="First Name"
                type="text"
                value={registerForm.values.first_name}
                onChange={registerForm.handleChange}
                onBlur={registerForm.handleBlur}
                error={
                  registerForm.touched.first_name &&
                  Boolean(registerForm.errors.first_name)
                }
                helperText={
                  registerForm.touched.first_name &&
                  registerForm.errors.first_name
                }
                required
              />

              <TextField
                fullWidth
                id="register-last-name"
                name="last_name"
                label="Last Name"
                type="text"
                value={registerForm.values.last_name}
                onChange={registerForm.handleChange}
                onBlur={registerForm.handleBlur}
                error={
                  registerForm.touched.last_name &&
                  Boolean(registerForm.errors.last_name)
                }
                helperText={
                  registerForm.touched.last_name &&
                  registerForm.errors.last_name
                }
                required
              />

              <TextField
                fullWidth
                id="register-email"
                name="email"
                label="Email"
                type="email"
                value={registerForm.values.email}
                onChange={registerForm.handleChange}
                onBlur={registerForm.handleBlur}
                error={
                  registerForm.touched.email &&
                  Boolean(registerForm.errors.email)
                }
                helperText={
                  registerForm.touched.email && registerForm.errors.email
                }
                required
                autoComplete="email"
              />

              <TextField
                fullWidth
                id="register-password"
                name="password"
                label="Password"
                type="password"
                value={registerForm.values.password}
                onChange={registerForm.handleChange}
                onBlur={registerForm.handleBlur}
                error={
                  registerForm.touched.password &&
                  Boolean(registerForm.errors.password)
                }
                helperText={
                  registerForm.touched.password && registerForm.errors.password
                }
                required
              />

              <LoadingButton
                fullWidth
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                loading={registerLoading}
              >
                Register
              </LoadingButton>

              
            </Stack>
          </Box>
        )}
      </Box>
    </Container>
  );
};

AuthPage.propTypes = {
  initialTab: PropTypes.number,
};

AuthPage.defaultProps = {
  initialTab: 0,
};

export default AuthPage;
