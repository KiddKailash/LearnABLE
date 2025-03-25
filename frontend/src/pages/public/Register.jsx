import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

// MUI
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

// Contexts
import { SnackbarContext } from "../../contexts/SnackbarContext";

/**
 * @fileoverview This file handles the user registration/signup process.
 * Handles the form submission, sending a POST request to the backend API (given the user's email/password).
 * SnackbarContext is used to display error & success messages to the user.
 * @module Register
 */

/**
 * This function renders the teacher/user registration form.
 * @returns JSX element that represents the registration form
 */

const Register = () => {
  const [name, setName] = useState(""); // New state for name
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showSnackbar } = useContext(SnackbarContext);

  const navigate = useNavigate();

  /**
   * This function handles the form submission, sending the user registration to the backend API.
   * @param {*} { preventDefault } e
   */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/teachers/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        showSnackbar("Teacher registered successfully!", "success");
        console.log("Success:", data);
      } else {
        showSnackbar(data.message || "Error registering teacher", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showSnackbar("Something went wrong!", "error");
    }
  };

  return (
    <Container maxWidth="sm" sx={{p:12}}>
      <Box
        elevation={1}
        component="form"
        noValidate
        onSubmit={handleSubmit}
        sx={(theme) => ({
          padding: theme.spacing(4),
          marginTop: theme.spacing(4),
          bgcolor: theme.palette.background.paper,
          borderRadius: theme.shape.border,
          boxShadow: theme.shadows[22],
          border: `1px solid ${theme.palette.divider}`,
          textAlign: "center",
        })}
      >
        <Stack direction="column" spacing={1.5}>
          <Typography variant="h4" align="center">
            Register Teacher
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
            Already have an account? {""}
            <Link
              color="primary"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
              sx={{ textDecoration: "none" }}
            >
              Login
            </Link>
          </Typography>
          <TextField
            fullWidth
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            variant="outlined"
          />
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
            Register
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default Register;
