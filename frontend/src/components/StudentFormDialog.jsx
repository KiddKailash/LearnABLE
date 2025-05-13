/**
 * @fileoverview Dialog for adding or editing a student.
 */

import React from "react";
import PropTypes from "prop-types";

// MUI Components
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";

// MUI Icons
import Add from "@mui/icons-material/Add";
import Cancel from "@mui/icons-material/Cancel";

/**
 * StudentFormDialog component for adding or editing a student.
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {function} props.onClose - Function to call when dialog is closed
 * @param {function} props.onSubmit - Function to call when form is submitted
 * @param {Object} props.formData - The form data object
 * @param {function} props.setFormData - Function to update form data
 * @param {string} [props.title] - Dialog title
 * @param {string} [props.submitLabel] - Submit button label
 * @param {React.ReactNode} [props.submitIcon] - Icon for submit button
 */
const StudentFormDialog = ({
  open,
  onClose,
  onSubmit,
  formData,
  setFormData,
  title = "Add Student",
  submitLabel = "Add Student",
  submitIcon = <Add />,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          bgcolor: "background.paper",
        },
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box my={2}>
          <Grid container spacing={2}>
            {/* Student Info */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.first_name || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    first_name: e.target.value,
                  }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.last_name || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    last_name: e.target.value,
                  }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Grade"
                value={formData.year_level || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    year_level: e.target.value,
                  }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Student Email"
                value={formData.student_email || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    student_email: e.target.value,
                  }))
                }
              />
            </Grid>

            {/* Additional Info */}
            <Grid size={12}>
              <Divider sx={{ my: 1 }}>
                <Chip label="Applicable Learning Needs" />
              </Divider>
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Special Learning Needs"
                value={formData.disability_info || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    disability_info: e.target.value,
                  }))
                }
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined" startIcon={<Cancel />}>
          Cancel
        </Button>
        <Button onClick={onSubmit} variant="contained" startIcon={submitIcon}>
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

StudentFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  formData: PropTypes.shape({
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    year_level: PropTypes.string,
    student_email: PropTypes.string,
    disability_info: PropTypes.string,
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
  title: PropTypes.string,
  submitLabel: PropTypes.string,
  submitIcon: PropTypes.node,
};

export default StudentFormDialog; 