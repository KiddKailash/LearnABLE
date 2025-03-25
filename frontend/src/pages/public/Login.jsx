/**
 * @fileoverview This file defines the Login component which renders a teacher login form
 * using Material-UI components. The component manages email and password inputs with state,
 * logs the login details on form submission, and displays a snackbar notification using the
 * SnackbarContext.
 *
 * @module Login
 */

import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

// MUI imports
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

// Context(s)
import { SnackbarContext } from "../../contexts/SnackbarContext";

/**
 * Login component that renders a teacher login portal form.
 *
 * On form submission, it logs the login details and displays a snackbar notification.
 *
 * @component
 * @returns {JSX.Element} The rendered login form.
 */
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showSnackbar } = useContext(SnackbarContext);

  const navigate = useNavigate();

  /**
   * Handles form submission by preventing the default action, logging the login details,
   * and displaying a snackbar notification.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/teachers/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access_token", data.access);
        showSnackbar("Login successful!", "success");
        console.log("Token:", data.access);
        // Optionally redirect or fetch user data
      } else {
        showSnackbar(data.message || "Login failed", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      showSnackbar("Something went wrong", "error");
    }
  };

  return (
    <Container maxWidth="sm" sx={{p:12}}>
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit}
        // Access the theme directly in the sx callback
        sx={(theme) => ({
          padding: theme.spacing(4),
          marginTop: theme.spacing(4),
          bgcolor: theme.palette.background.paper,
          boxShadow: theme.shadows[22],
          borderRadius: theme.shape.border,
          border: `1px solid ${theme.palette.divider}`,
        })}
      >
        <Stack direction="column" spacing={1.5}>
          <Typography variant="h4" align="center" gutterBottom>
            Teacher Login Portal
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary">
            Don't have an account? {""}
            <Link
              color="primary"
              onClick={(e) => {
                e.preventDefault();
                navigate("/register");
              }}
            >
              Sign Up
            </Link>
          </Typography>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
          />
          <Button fullWidth type="submit" variant="contained" color="primary">
            Login
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default Login;
