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
 * @typedef {Object} FormFieldProps
 * @property {string} [fieldType='text'] - Type of field to render
 * @property {string} id - Field ID
 * @property {string} name - Field name
 * @property {string} label - Field label
 * @property {any} value - Field value
 * @property {Function} onChange - Change handler
 * @property {Function} [onBlur] - Blur handler for validation
 * @property {boolean} [error] - Whether field has an error
 * @property {string} [helperText] - Helper text or error message
 * @property {boolean} [required] - Whether field is required
 * @property {Array<{value: any, label: string, disabled?: boolean}>} [options] - Options for select/radio/checkbox
 * @property {string} [placeholder] - Placeholder text
 * @property {boolean} [fullWidth=true] - Whether field should take full width
 * @property {string} [tooltip] - Tooltip text for help icon
 * @property {Object} [InputProps] - Additional props for input element
 */

/**
 * Renders a help icon with tooltip if tooltip text is provided
 * @param {Object} props - Component props
 * @returns {Object|null} InputProps with help icon or null
 */
const getHelpIconProps = ({ tooltip, InputProps }) => {
  if (!tooltip) return InputProps;
  
  return {
    ...InputProps,
    endAdornment: (
      <InputAdornment position="end">
        <Tooltip title={tooltip} arrow>
          <IconButton 
            edge="end"
            aria-label={`Help for ${tooltip}`}
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

/**
 * Renders a select field
 * @param {FormFieldProps} props - Component props
 * @returns {React.ReactNode}
 */
const SelectField = ({ id, name, label, value, onChange, onBlur, error, helperText, required, options, fullWidth, ...props }) => (
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

/**
 * Renders a checkbox field
 * @param {FormFieldProps} props - Component props
 * @returns {React.ReactNode}
 */
const CheckboxField = ({ id, name, label, value, onChange, onBlur, error, helperText, required, ...props }) => (
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

/**
 * Renders a radio group field
 * @param {FormFieldProps} props - Component props
 * @returns {React.ReactNode}
 */
const RadioField = ({ id, name, label, value, onChange, onBlur, error, helperText, required, options, fullWidth, ...props }) => (
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

/**
 * Renders a switch field
 * @param {FormFieldProps} props - Component props
 * @returns {React.ReactNode}
 */
const SwitchField = ({ id, name, label, value, onChange, onBlur, error, helperText, required, ...props }) => (
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
const FormField = (props) => {
  const {
    fieldType = 'text',
    tooltip,
    InputProps,
    ...rest
  } = props;

  const inputProps = getHelpIconProps({ tooltip, InputProps });

  switch (fieldType) {
    case 'select':
      return <SelectField {...rest} />;
    case 'checkbox':
      return <CheckboxField {...rest} />;
    case 'radio':
      return <RadioField {...rest} />;
    case 'switch':
      return <SwitchField {...rest} />;
    default:
      return (
        <TextField
          type={fieldType}
          InputProps={inputProps}
          {...rest}
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
  
  /** Whether field should take full width */
  fullWidth: PropTypes.bool,
  
  /** Tooltip text for help icon */
  tooltip: PropTypes.string,
  
  /** Additional props for input element */
  InputProps: PropTypes.object,
};

export default FormField; 