import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

// MUI
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

// Context
import { SnackbarContext } from "../../contexts/SnackbarContext";
import UserContext from "../../services/UserObject";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showSnackbar } = useContext(SnackbarContext);
  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      showSnackbar("Login successful!", "success");
      // go to a protected page or home
      navigate("/dashboard");
    } else {
      showSnackbar(result.message || "Login failed", "error");
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
        <Stack direction="column" spacing={1.5}>
          <Typography variant="h4" align="center" gutterBottom>
            Teacher Login Portal
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary">
            Don&apos;t have an account?{" "}
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
