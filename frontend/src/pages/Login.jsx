/**
 * @fileoverview This file defines the Login component which renders a teacher login form
 * using Material-UI components. The component manages email and password inputs with state,
 * logs the login details on form submission, and displays a snackbar notification using the
 * SnackbarContext.
 *
 * @module Login
 */

import React, { useState, useContext } from "react";
// MUI imports
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
// Snackbar context
import { SnackbarContext } from "../contexts/SnackbarContext";
import { Link } from "react-router-dom";
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
    <Container maxWidth="sm">
      <Paper
        elevation={1}
        component="form"
        noValidate
        onSubmit={handleSubmit}
        // Access the theme directly in the sx callback
        sx={(theme) => ({
          padding: theme.spacing(4),
          marginTop: theme.spacing(4),
          bgcolor: theme.palette.background.paper,
        })}
      >
        <Stack direction="column" spacing={1.5}>
          <Typography variant="h4" align="center" gutterBottom>
            Teacher Login Portal
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
          <Link to="/Register" style={{ textDecoration: 'none'}}>
          <Button variant="contained" color="secondary" sx={{ width: '100%', height: 40}}>
            Create Account
          </Button>
          </Link>
        </Stack>
      </Paper>
    </Container>
  );
};



export default Login;
