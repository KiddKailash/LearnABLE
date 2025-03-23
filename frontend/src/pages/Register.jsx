import React, { useState, useContext } from "react";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { SnackbarContext } from "../contexts/SnackbarContext";

const Register = () => {
  const [name, setName] = useState(""); // New state for name
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showSnackbar } = useContext(SnackbarContext);

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
    <Container maxWidth="sm">
      <Paper
        elevation={1}
        component="form"
        noValidate
        onSubmit={handleSubmit}
        sx={(theme) => ({
          padding: theme.spacing(4),
          marginTop: theme.spacing(4),
          bgcolor: theme.palette.background.paper,
        })}
      >
        <Stack direction="column" spacing={1.5}>
          <Typography variant="h4" align="center" gutterBottom>
            Register Teacher
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
      </Paper>
    </Container>
  );
};

export default Register;
