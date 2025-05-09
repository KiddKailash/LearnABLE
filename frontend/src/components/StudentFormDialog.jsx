import React from "react";

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
                label="Year Level"
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
                label="Disability Information"
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

export default StudentFormDialog; 