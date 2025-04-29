import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

// MUI components
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";

// Contexts
import { SnackbarContext } from "../../contexts/SnackbarContext";
import UserContext from "../../contexts/UserObject";

/**
 * This component renders a registration form for teachers.
 * It uses:
 *  - SnackbarContext for showing success/error messages
 *  - UserContext for calling registerTeacher
 */
const Register = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  
  // New loading state
  const [loading, setLoading] = useState(false);

  const { showSnackbar } = useContext(SnackbarContext);
  const { registerTeacher } = useContext(UserContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Begin loading

    try {
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
    } catch (error) {
      console.error("Register error:", error);
      showSnackbar("Error occurred during registration", "error");
    } finally {
      setLoading(false); // End loading
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
          borderRadius: theme.shape.borderRadius,
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
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
              style={{ textDecoration: "none", cursor: "pointer" }}
            >
              Login
            </Link>
          </Typography>
          <TextField
            fullWidth
            label="First Name"
            name="first_name"
            type="text"
            value={formData.first_name}
            onChange={handleChange}
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Last Name"
            name="last_name"
            type="text"
            value={formData.last_name}
            onChange={handleChange}
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            variant="outlined"
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Register"}
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default Register;
