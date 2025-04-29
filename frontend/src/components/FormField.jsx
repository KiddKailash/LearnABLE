/**
 * @fileoverview Reusable form field component that displays a form field
 * with consistent styling and behavior.
 */

import React from 'react';
import PropTypes from 'prop-types';

// MUI Components
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import Switch from '@mui/material/Switch';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

/**
 * FormField component that renders different form controls based on the fieldType.
 * 
 * @component
 * @example
 * <FormField
 *   id="email"
 *   name="email"
 *   label="Email"
 *   value={values.email}
 *   onChange={handleChange}
 *   onBlur={handleBlur}
 *   error={touched.email && Boolean(errors.email)}
 *   helperText={touched.email && errors.email}
 *   required
 * />
 */
const FormField = ({
  fieldType = 'text',
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required,
  options,
  placeholder,
  fullWidth = true,
  tooltip,
  InputProps,
  ...props
}) => {
  // Add a help icon with tooltip if provided
  const getInputProps = () => {
    if (!tooltip) return InputProps;
    
    return {
      ...InputProps,
      endAdornment: (
        <InputAdornment position="end">
          <Tooltip title={tooltip} arrow>
            <IconButton 
              edge="end"
              aria-label={`Help for ${label}`}
              tabIndex={-1}
              size="small"
            >
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </InputAdornment>
      )
    };
  };

  // Handle different field types
  switch (fieldType) {
    case 'select':
      return (
        <FormControl 
          fullWidth={fullWidth} 
          error={error}
          required={required}
          variant="outlined"
        >
          <InputLabel id={`${id}-label`}>{label}</InputLabel>
          <Select
            labelId={`${id}-label`}
            id={id}
            name={name}
            value={value || ''}
            onChange={onChange}
            onBlur={onBlur}
            label={label}
            required={required}
            {...props}
          >
            {options?.map(option => (
              <MenuItem 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
      );
      
    case 'checkbox':
      return (
        <FormControl error={error} required={required}>
          <FormControlLabel
            control={
              <Checkbox
                id={id}
                name={name}
                checked={!!value}
                onChange={onChange}
                onBlur={onBlur}
                {...props}
              />
            }
            label={label}
          />
          {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
      );
      
    case 'radio':
      return (
        <FormControl error={error} required={required} fullWidth={fullWidth}>
          <FormHelperText sx={{ margin: 0 }}>{label}</FormHelperText>
          <RadioGroup
            id={id}
            name={name}
            value={value || ''}
            onChange={onChange}
            onBlur={onBlur}
            row={props.row}
          >
            {options?.map(option => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
                disabled={option.disabled}
              />
            ))}
          </RadioGroup>
          {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
      );
      
    case 'switch':
      return (
        <FormControl error={error} required={required}>
          <FormControlLabel
            control={
              <Switch
                id={id}
                name={name}
                checked={!!value}
                onChange={onChange}
                onBlur={onBlur}
                {...props}
              />
            }
            label={label}
          />
          {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
      );
      
    // Default is a text field (handles text, email, password, etc.)
    default:
      return (
        <TextField
          type={fieldType}
          id={id}
          name={name}
          label={label}
          value={value ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          error={error}
          helperText={helperText}
          required={required}
          placeholder={placeholder}
          fullWidth={fullWidth}
          InputProps={getInputProps()}
          {...props}
        />
      );
  }
};

FormField.propTypes = {
  /** Type of field to render */
  fieldType: PropTypes.oneOf([
    'text', 'email', 'password', 'number', 'tel', 'url', 'date',
    'datetime-local', 'time', 'select', 'checkbox', 'radio', 'switch', 'textarea'
  ]),
  
  /** Field ID */
  id: PropTypes.string.isRequired,
  
  /** Field name */
  name: PropTypes.string.isRequired,
  
  /** Field label */
  label: PropTypes.string.isRequired,
  
  /** Field value */
  value: PropTypes.any,
  
  /** Change handler */
  onChange: PropTypes.func.isRequired,
  
  /** Blur handler for validation */
  onBlur: PropTypes.func,
  
  /** Whether field has an error */
  error: PropTypes.bool,
  
  /** Helper text or error message */
  helperText: PropTypes.string,
  
  /** Whether field is required */
  required: PropTypes.bool,
  
  /** Options for select, radio, and checkbox lists */
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      label: PropTypes.string.isRequired,
      disabled: PropTypes.bool,
    })
  ),
  
  /** Placeholder text */
  placeholder: PropTypes.string,
  
  /** Whether field takes full width */
  fullWidth: PropTypes.bool,
  
  /** Tooltip text to display next to the field */
  tooltip: PropTypes.string,
  
  /** Props passed to the input element */
  InputProps: PropTypes.object,
};

export default FormField; 