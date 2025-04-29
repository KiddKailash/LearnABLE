import React, { useState, useEffect } from "react";
import api from "../../services/api";

// MUI Components
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

const Account = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [teacherID, setTeacherID] = useState("");

  const [profilePic, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);

  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [openAlert, setOpenAlert] = useState(false);

  // New loading states
  const [profileLoading, setProfileLoading] = useState(true);
  const [savingChanges, setSavingChanges] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // New validation state
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const data = await api.get("/api/teachers/profile/");

        setEmail(data.email || "");
        setFullName(data.full_name || "");
        setSchoolName(data.school_name || "");
        setTeacherID(data.teacher_id || "");

        if (data.profile_picture) {
          setPreview(
            `${process.env.REACT_APP_SERVER_URL || "http://localhost:8000"}${
              data.profile_picture
            }`
          );
        }
      } catch (error) {
        showAlert(`Error loading profile: ${error.message}`, "error");
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Helper function to show alerts
  const showAlert = (message, severity = "success") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setOpenAlert(true);
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is invalid";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * This function sends a request to the server to update the teacher's profile information
   * If the changes are successful, the user is notified with a 'success message', else
   * the user is notified with an 'error message'
   */
  const handleSaveChanges = async () => {
    // Validate form first
    if (!validateForm()) {
      return;
    }

    try {
      setSavingChanges(true);

      // Create a FormData object
      const formData = new FormData();
      formData.append("email", email);
      formData.append("full_name", fullName);
      formData.append("school_name", schoolName);
      formData.append("teacher_id", teacherID);

      // Append profile picture if one was selected
      if (profilePic) {
        formData.append("profile_picture", profilePic);
      }

      await api.post(
        "/api/teachers/profile/update/",
        formData,
        "multipart/form-data"
      );
      showAlert("Changes saved successfully!");
    } catch (error) {
      showAlert(`Error updating profile: ${error.message}`, "error");
    } finally {
      setSavingChanges(false);
    }
  };

  /**
   * This function handles whenever the user/teacher selects a new profile picture.
   * @param {Event} e the event that is triggered the function call
   */
  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        showAlert(
          "Please select a valid image file (JPEG, PNG, or GIF)",
          "error"
        );
        return;
      }

      if (file.size > maxSize) {
        showAlert("Image size must be less than 5MB", "error");
        return;
      }

      setProfilePicture(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleOpenPasswordDialog = () => setOpenPasswordDialog(true);

  /**
   * This function closes the password change dialog
   */
  const handleClosePasswordDialog = () => {
    setOpenPasswordDialog(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  /**
   * This function sends a request to the server to change the teacher/user's password.
   * User is notified if their password has been successfully changed.
   */
  const handleChangePassword = async () => {
    // Password validation
    if (!currentPassword) {
      showAlert("Current password is required", "error");
      return;
    }

    if (!newPassword) {
      showAlert("New password is required", "error");
      return;
    }

    if (newPassword.length < 8) {
      showAlert("New password must be at least 8 characters", "error");
      return;
    }

    // Check if the new password is same as confirmation
    if (newPassword !== confirmNewPassword) {
      showAlert("New passwords don't match", "error");
      return;
    }

    // Check if current password is same as new password
    if (currentPassword === newPassword) {
      showAlert("New password can't be same as current password", "error");
      return;
    }

    try {
      setChangingPassword(true);

      await api.post("/api/teachers/change-password/", {
        email,
        current_password: currentPassword,
        new_password: newPassword,
      });

      showAlert("Password changed successfully!");
      handleClosePasswordDialog();
    } catch (error) {
      showAlert(`Error changing password: ${error.message}`, "error");
    } finally {
      setChangingPassword(false);
    }
  };

  // Handle alert close
  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  return (
    <Card sx={{ maxWidth: 800, mx: "auto", mt: 4, p: 2 }}>
      {profileLoading ? (
        <CardContent sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </CardContent>
      ) : (
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Account Information
          </Typography>
          <Grid container spacing={2}>
            <Grid size={12} sx={{ textAlign: "center" }}>
              <Avatar
                alt="Profile Picture"
                src={preview}
                sx={{ width: 100, height: 100, mx: "auto", mb: 2 }}
              />
              <Button variant="contained" component="label">
                Upload Profile Picture
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handlePictureChange}
                />
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={!!formErrors.fullName}
                helperText={formErrors.fullName}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!formErrors.email}
                helperText={formErrors.email}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="School Name"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Teacher ID"
                value={teacherID}
                onChange={(e) => setTeacherID(e.target.value)}
              />
            </Grid>
            <Grid size={12} sx={{ textAlign: "center", mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveChanges}
                disabled={savingChanges}
              >
                {savingChanges ? (
                  <CircularProgress size={24} />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </Grid>
            <Grid size={12} sx={{ textAlign: "center" }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleOpenPasswordDialog}
              >
                Change Password
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      )}

      <Dialog open={openPasswordDialog} onClose={handleClosePasswordDialog}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mt: 1,
            pt: 1,
            width: "300px",
            "& .MuiTextField-root": { mt: 1 },
          }}
        >
          <TextField
            type="password"
            label="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <TextField
            type="password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            helperText="At least 8 characters"
          />

          <TextField
            type="password"
            label="Confirm New Password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleChangePassword}
            color="primary"
            disabled={changingPassword}
          >
            {changingPassword ? (
              <CircularProgress size={24} />
            ) : (
              "Change Password"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openAlert}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alertSeverity}
          sx={{ width: "100%" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default Account;
