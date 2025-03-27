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
import UserContext from "../../services/UserContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showSnackbar } = useContext(SnackbarContext);
  const { registerTeacher } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await registerTeacher(name, email, password);
    if (result.success) {
      showSnackbar("Teacher registered successfully!", "success");
      // Optionally auto-login or redirect to login
      navigate("/login");
    } else {
      showSnackbar(result.message || "Error registering teacher", "error");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ p: 12 }}>
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