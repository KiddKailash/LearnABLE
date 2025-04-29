import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

// MUI components
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

// Custom components
import LoadingButton from "../../components/LoadingButton";

// Hooks and utils
import useFormValidation from "../../hooks/useFormValidation";
import { validateEmail, validateRequired } from "../../utils/validationRules";

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

const Login = () => {
  const { showSnackbar } = useContext(SnackbarContext);
  const { login } = useContext(UserContext);
  const navigate = useNavigate();
  
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm
  } = useFormValidation(
    { email: "", password: "" },
    validateLoginForm
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    if (!validateForm()) {
      showSnackbar("Please fix form errors before submitting", "error");
      return;
    }

    try {
      const result = await login(values.email, values.password);
      
      if (result.success) {
        showSnackbar("Login successful!", "success");
        navigate("/dashboard");
      } else {
        showSnackbar(result.message || "Login failed", "error");
      }
    } catch (error) {
      showSnackbar("Error occurred during login", "error");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ p: 12 }}>
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit}
        sx={(theme) => ({
          padding: theme.spacing(4),
          marginTop: theme.spacing(4),
          bgcolor: theme.palette.background.paper,
          boxShadow: theme.shadows[22],
          borderRadius: theme.shape.border,
          border: `1px solid ${theme.palette.divider}`,
        })}
      >
        <Stack direction="column" spacing={2}>
          <Typography variant="h4" align="center" gutterBottom>
            Teacher Login Portal
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary">
            Don&apos;t have an account?{" "}
            <Link
              component="button"
              variant="body2"
              onClick={(e) => {
                e.preventDefault();
                navigate("/register");
              }}
              style={{ cursor: "pointer", color: "inherit" }}
            >
              Sign Up
            </Link>
          </Typography>
          
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            type="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email && Boolean(errors.email)}
            helperText={touched.email && errors.email}
            required
            autoComplete="email"
            InputProps={{
              "aria-label": "Email",
            }}
          />
          
          <TextField
            fullWidth
            id="password"
            name="password"
            label="Password"
            type="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password && Boolean(errors.password)}
            helperText={touched.password && errors.password}
            required
            autoComplete="current-password"
            InputProps={{
              "aria-label": "Password",
            }}
          />
          
          <LoadingButton 
            fullWidth 
            type="submit" 
            variant="contained" 
            color="primary"
            size="large"
          >
            Login
          </LoadingButton>
        </Stack>
      </Box>
    </Container>
  );
};

export default Login;
