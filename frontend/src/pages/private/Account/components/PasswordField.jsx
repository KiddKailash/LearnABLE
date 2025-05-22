/**
 * @file PasswordField.jsx
 * @description A reusable password input component that provides a toggle for password visibility.
 * This component extends the Material-UI TextField component with password-specific functionality.
 */

import React, { useState } from "react";

// MUI Components
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";

// MUI Icons
import VisibilityIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOffRounded";

/**
 * PasswordField component that provides a password input with visibility toggle
 * @param {Object} props - Component props
 * @param {string} props.label - Label text for the input field
 * @param {string} props.value - Current value of the password field
 * @param {Function} props.onChange - Function to handle value changes
 * @param {boolean} props.error - Error state of the input
 * @param {string} props.helperText - Helper text to display below the input
 * @param {Object} props.props - Additional props to be spread to the TextField component
 * @returns {JSX.Element} A password input field with visibility toggle
 */
const PasswordField = ({
  label,
  value,
  onChange,
  error,
  helperText,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextField
      type={showPassword ? "text" : "password"}
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      helperText={helperText}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={() => setShowPassword(!showPassword)}
              edge="end"
            >
              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...props}
    />
  );
};

export default PasswordField; 