/**
 * @fileoverview This file defines the Login component which renders a teacher login form
 * using Material-UI components. The component manages email and password inputs with state,
 * and logs the login details on form submission.
 *
 * @module Login
 */

import React, { useState } from "react";

// MUI imports
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

/**
 * Login component that renders a teacher login portal form.
 *
 * @component
 * @returns {JSX.Element} The rendered login form.
 */
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /**
   * Handles form submission by preventing the default action and logging the login details.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login details:", { email, password });
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
        </Stack>
      </Paper>
    </Container>
  );
};

export default Login;
