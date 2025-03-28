import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

// MUI
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

// Context
import { SnackbarContext } from "../../contexts/SnackbarContext";

const registerTeacher = async (first_name, last_name, email, password) => {
  try {
    const response = await fetch("http://127.0.0.1:8000/teachers/register/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        first_name,  
        last_name,
        email,
        password
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Registration failed");

    return { success: true, data };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: error.message };
  }
};

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const { showSnackbar } = useContext(SnackbarContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await registerTeacher(
      formData.first_name,
      formData.last_name,
      formData.email,
      formData.password
    );
    if (result.success) {
      showSnackbar("Teacher registered successfully!", "success");
      navigate("/login");
    } else {
      showSnackbar(result.message || "Error registering teacher", "error");
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
            Already have an account?{" "}
            <Link
              color="primary"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
              style={{ textDecoration: "none" }}
            >
              Login
            </Link>
          </Typography>
          <TextField fullWidth label="First Name" name="first_name" type="text" value={formData.first_name} onChange={handleChange} variant="outlined" />
          <TextField fullWidth label="Last Name" name="last_name" type="text" value={formData.last_name} onChange={handleChange} variant="outlined" />
          <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} variant="outlined" />
          <TextField fullWidth label="Password" name="password" type="password" value={formData.password} onChange={handleChange} variant="outlined" />
          <Button fullWidth type="submit" variant="contained" color="primary">
            Register
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default Register;
