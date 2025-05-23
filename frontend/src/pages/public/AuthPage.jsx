/**
 * @file AuthPage.jsx
 * @description Authentication page for LearnABLE, providing login, registration, and two-factor authentication (2FA) flows for users.
 *
 */
import React, { useState, useContext, useRef, useEffect } from "react";
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
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";

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
import UserContext from "../../store/UserObject";

/**
 * Validates login form values for email and password fields.
 * @param {Object} values - The form values
 * @returns {Object} errors - Validation errors
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
 * Validates registration form values for first name, last name, email, and password.
 * @param {Object} values - The form values
 * @returns {Object} errors - Validation errors
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

/**
 * Validates the 2FA form for a 6-digit code.
 * @param {Object} values - The form values
 * @returns {Object} errors - Validation errors
 */
const validate2FAForm = (values) => {
  const errors = {};

  if (!values.code || values.code.length !== 6) {
    errors.code = "Authentication code must be 6 digits";
  } else if (!/^\d{6}$/.test(values.code)) {
    errors.code = "Code must be 6 digits";
  }

  return errors;
};

/**
 * AuthPage component provides login, registration, and 2FA authentication for users.
 * Handles form state, validation, and submission for all flows.
 *
 * @component
 * @param {number} initialTab - The initial tab to display (0 = Login, 1 = Register)
 * @returns {JSX.Element} The rendered authentication page
 */
const AuthPage = ({ initialTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const { showSnackbar } = useContext(SnackbarContext);
  const { login, registerTeacher, verify2FA, requires2FA } =
    useContext(UserContext);
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

  // 2FA form handling
  const twoFactorForm = useFormValidation({ code: "" }, validate2FAForm);

  // Loading states
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  /* ---------- Teacher access-code state ---------- */
  const [tempCredentials, setTempCredentials] = useState({
    email: "",
    password: "",
  });
  const [teacherCodeOpen, setTeacherCodeOpen] = useState(false);
  const [teacherCode, setTeacherCode] = useState("");
  const [teacherCodeError, setTeacherCodeError] = useState("");
  const [teacherCodeLoading, setTeacherCodeLoading] = useState(false);

  // Refs for the 2FA input boxes
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  // Effect to auto-verify when the code is complete
  useEffect(() => {
    if (
      twoFactorForm.values.code &&
      twoFactorForm.values.code.length === 6 &&
      !twoFactorForm.errors.code
    ) {
      handleVerify2FA();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [twoFactorForm.values.code]);

  // Handle individual digit input for 2FA code
  // Only allow numeric input and auto-advance to next input
  const handleDigitChange = (e, index) => {
    const value = e.target.value;
    if (value === "" || /^\d$/.test(value)) {
      // Update the code in the form
      const newCode = twoFactorForm.values.code
        ? twoFactorForm.values.code.split("")
        : Array(6).fill("");
      newCode[index] = value;
      const updatedCode = newCode.join("");

      twoFactorForm.setFieldValue("code", updatedCode);

      // Move to next input if a digit was entered
      if (value !== "" && index < 5) {
        inputRefs[index + 1].current.focus();
      }
    }
  };

  // Handle backspace to move focus to previous input if empty
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && index > 0 && !e.target.value) {
      inputRefs[index - 1].current.focus();
    }
  };

  // Handle paste event for 2FA code (fills all inputs if 6 digits)
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    if (/^\d{6}$/.test(pastedData)) {
      twoFactorForm.setFieldValue("code", pastedData);

      // Fill all inputs
      inputRefs.forEach((ref, index) => {
        if (ref.current) {
          ref.current.value = pastedData[index] || "";
        }
      });

      // Focus the last input
      inputRefs[5].current.focus();
    }
  };

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
        if (result.requiresTwoFactor) {
          showSnackbar(
            "Please enter your two-factor authentication code",
            "info"
          );
          // 2FA dialog is shown automatically based on requires2FA state
        } else {
          showSnackbar("Login successful!", "success");
          navigate("/dashboard");
        }
      } else {
        showSnackbar(result.message || "Login failed", "error");
      }
    } catch (error) {
      showSnackbar("Error occurred during login", "error");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    if (e) e.preventDefault();

    // Don't proceed if already loading
    if (twoFactorLoading) return;

    // Validate 2FA code
    if (!twoFactorForm.validateForm()) {
      showSnackbar("Please enter a valid 6-digit code", "error");
      return;
    }

    setTwoFactorLoading(true);
    try {
      const result = await verify2FA(twoFactorForm.values.code);

      if (result.success) {
        showSnackbar("Login successful!", "success");
        twoFactorForm.resetForm();
        navigate("/dashboard");
      } else {
        showSnackbar(result.message || "Verification failed", "error");
      }
    } catch (error) {
      showSnackbar("Error occurred during verification", "error");
    } finally {
      setTwoFactorLoading(false);
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
        showSnackbar(
          "Registration successful! Enter the access code to continue.",
          "info"
        );

        // Save credentials and open the teacher code dialog
        setTempCredentials({
          email: registerForm.values.email,
          password: registerForm.values.password,
        });
        setTeacherCodeOpen(true);

        // Reset form and switch to login tab
        registerForm.resetForm();
        setActiveTab(0);
      } else {
        // Convert object errors to string if needed
        const errorMessage =
          typeof result.message === "object"
            ? Object.entries(result.message)
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ")
            : result.message;

        showSnackbar(errorMessage || "Registration failed", "error");

        // If we have database constraint errors, set the appropriate field error
        if (
          errorMessage &&
          (errorMessage.toLowerCase().includes("already exists") ||
            errorMessage.toLowerCase().includes("teacher profile"))
        ) {
          // Create a new error object for the form
          const formErrors = { ...registerForm.errors };

          if (errorMessage.toLowerCase().includes("email")) {
            formErrors.email = "This email is already in use";
          } else if (errorMessage.toLowerCase().includes("teacher profile")) {
            formErrors.email =
              "A teacher profile already exists for this email";
          }

          // Only attempt to set errors if the function exists
          if (typeof registerForm.setErrors === "function") {
            registerForm.setErrors(formErrors);

            // Mark relevant fields as touched
            const touchedFields = { ...registerForm.touched };
            if (formErrors.email) touchedFields.email = true;
            registerForm.setTouched(touchedFields);
          }
        }
      }
    } catch (error) {
      console.error("Registration error:", error);

      // Display the error message from the server
      const errorMessage =
        error.message || "Error occurred during registration";
      showSnackbar(errorMessage, "error");

      // If we have database constraint errors, set the appropriate field error
      if (
        (errorMessage &&
          (errorMessage.toLowerCase().includes("already exists") ||
            errorMessage.toLowerCase().includes("teacher profile"))) ||
        error.field
      ) {
        // Create a new error object for the form
        const formErrors = { ...registerForm.errors };

        if (
          errorMessage.toLowerCase().includes("email") ||
          error.field === "email"
        ) {
          formErrors.email = "This email is already in use";
        } else if (errorMessage.toLowerCase().includes("teacher profile")) {
          formErrors.email = "A teacher profile already exists for this email";
        }

        // Only attempt to set errors if the function exists
        if (typeof registerForm.setErrors === "function") {
          registerForm.setErrors(formErrors);

          // Mark relevant fields as touched
          const touchedFields = { ...registerForm.touched };
          if (formErrors.email) touchedFields.email = true;
          registerForm.setTouched(touchedFields);
        }
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  /* ---------- Verify teacher access code ---------- */
  const handleTeacherCodeSubmit = async (e) => {
    e.preventDefault();

    if (teacherCode !== "191919") {
      setTeacherCodeError("Invalid access code");
      return;
    }

    setTeacherCodeError("");
    setTeacherCodeLoading(true);

    try {
      const { email, password } = tempCredentials;
      const loginResult = await login(email, password);

      if (loginResult.success) {
        if (loginResult.requiresTwoFactor) {
          showSnackbar(
            "Please enter your two-factor authentication code",
            "info"
          );
          // 2FA dialog is shown automatically based on requires2FA state
        } else {
          showSnackbar("Login successful!", "success");
          setTeacherCodeOpen(false);
          navigate("/dashboard");
        }
      } else {
        showSnackbar(
          loginResult.message || "Auto-login failed after registration",
          "error"
        );
        setTeacherCodeOpen(false);
      }
    } catch (err) {
      showSnackbar("Error during login", "error");
      setTeacherCodeOpen(false);
    } finally {
      setTeacherCodeLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ p: 4 }}>
      <Box
        sx={(theme) => ({
          padding: theme.spacing(4),
          borderRadius: 2,
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
          sx={{ mb: 2 }}
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

              <Alert severity="info" sx={{ mb: 1 }}>
                Password must be at least 8 characters long and contain at least
                one special character.
              </Alert>

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

      {/* Two-Factor Authentication Dialog */}
      <Dialog open={requires2FA} fullWidth maxWidth="xs">
        <DialogContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom align="center">
            Two-Factor Authentication
          </Typography>
          <Box component="form" noValidate onSubmit={handleVerify2FA}>
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              sx={{ mb: 2 }}
              onPaste={handlePaste}
            >
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <TextField
                  key={index}
                  inputRef={inputRefs[index]}
                  value={
                    twoFactorForm.values.code
                      ? twoFactorForm.values.code[index] || ""
                      : ""
                  }
                  sx={{
                    width: "40px",
                    "& input": {
                      textAlign: "center",
                      fontSize: "1.5rem",
                      p: 1,
                    },
                  }}
                  inputProps={{
                    maxLength: 1,
                    inputMode: "numeric",
                    pattern: "[0-9]",
                  }}
                  variant="outlined"
                  onChange={(e) => handleDigitChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  autoFocus={index === 0}
                />
              ))}
            </Stack>
            {twoFactorForm.errors.code && (
              <Typography color="error" variant="body2" textAlign="center">
                {twoFactorForm.errors.code}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              twoFactorForm.resetForm();
              // This would normally trigger a "cancel" action in the UserContext
              // But for simplicity we just redirect to login
              window.location.href = "/login";
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Teacher Access Code Dialog */}
      <Dialog open={teacherCodeOpen} fullWidth maxWidth="xs">
        <DialogTitle>Enter Access Code</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate onSubmit={handleTeacherCodeSubmit}>
            <TextField
              autoFocus
              margin="dense"
              id="teacher-code"
              label="Access Code"
              type="text"
              fullWidth
              value={teacherCode}
              onChange={(e) => setTeacherCode(e.target.value)}
              error={Boolean(teacherCodeError)}
              helperText={teacherCodeError}
              inputProps={{ maxLength: 6 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setTeacherCodeOpen(false);
              navigate("/login");
            }}
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={handleTeacherCodeSubmit}
            loading={teacherCodeLoading}
          >
            Submit
          </LoadingButton>
        </DialogActions>
      </Dialog>
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
