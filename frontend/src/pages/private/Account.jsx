import React, { useState, useEffect, useContext } from "react";
import UserContext from "../../services/UserObject"; // Import UserContext

// mui imports
import { Card, CardContent, Typography, Grid, TextField, Button, 
  Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar } from "@mui/material";


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

  useEffect(() => {
    //! fetch request may need to be updated
    fetch("http://127.0.0.1:8000/api/teachers/profile/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setEmail(data.email);
        setFullName(data.full_name);
        setSchoolName(data.school_name);
        setTeacherID(data.teacher_id);
        if (data.profile_picture) {
          setPreview(`http://127.0.0.1:8000${data.profile_picture}`);
        }
      });
  }, []);


  /**
   * This function sends a request to the server to update the teacher's profile information
   * Iff the changes are successful, the user is notfified with a 'success message', else 
   * the user is notified with an 'error message'
   */

  const handleSaveChanges = () => {
    // create a FormData object
    const formData = new FormData();
    formData.append("email", email);
    formData.append("full_name", fullName);
    formData.append("school_name", schoolName);
    formData.append("teacher_id", teacherID);
    // append  profile picture
    if (profilePic) {
      formData.append("profile_picture", profilePic);
    }

    fetch("http://127.0.0.1:8000/api/teachers/profile/update/", {
      method: "PUT",
      body: formData,
    })
    // alert user of update profile status
      .then((response) => response.json())
      .then((data) => {
        //alert("Changes saved successfully!");
        setAlertMessage("Changes saved successfully!");
        setAlertSeverity("success");
        setOpenAlert(true);
      })
      .catch((error) => {
        console.error("Error saving changes:", error);
        //alert("Failed to update profile.");
        setAlertMessage("Error updating profile");
        setAlertSeverity("error");
        setOpenAlert(true);
        
      });
  };

  
  
  /**
   * This function handles whenever the user/teacher selects a new profile picture.
   * @param {Event} e the event that is triggered the function call
   */

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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
   * User is notified iff there password has been successfully change.
   */

  const handleChangePassword = async () => {
    // check iff the new password is same
    if (newPassword !== confirmNewPassword) {
      setAlertMessage("Please verify that the passwords you entered are the same");
      setAlertSeverity("error");
      setOpenAlert(true);
      
      return;
    }
    // check iff current password is same as new password
    if (currentPassword === newPassword) {
      setAlertMessage("New password can't be same as the current password. Please try again.");
      setAlertSeverity("error");
      setOpenAlert(true);
      return;
    }

    //send password change request
    try {
      const response = await fetch("http://127.0.0.1:8000/api/teachers/change-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      // alert user of change password status
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Unable to change password");
      }

      
      setAlertMessage("Password saved successfully!");
      setAlertSeverity("success");
      setOpenAlert(true);
      handleClosePasswordDialog();
    } catch (err) {
     
      setAlertMessage(`Error: ${err.message}`);
      setAlertSeverity("error");
      setOpenAlert(true);
    }
  };

  return (
    <Card sx={{ maxWidth: 800, mx: "auto", mt: 4, p: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Account Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sx={{ textAlign: "center" }}>
            <Avatar
              alt = "Profile Picture"
              src={preview}
              sx={{ width: 100, height: 100, mx: "auto", mb: 2 }}
            />
            <Button variant ="contained" component= "label">
              Upload Profile Picture
              <input type = "file" hidden onChange={handlePictureChange} />
            </Button>
          </Grid>
          <Grid item xs = {12} sm= {6}>
            <TextField
              fullWidth
              label="Full Name"
              value = {fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label = "Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label = "School Name"
              value = {schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label = "Teacher ID"
              value = {teacherID}
              onChange={(e) => setTeacherID(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sx = {{ textAlign: "center", mt: 2 }}>
            <Button variant="contained" color = "primary" onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </Grid>
          <Grid item xs={12} sx={{ textAlign: "center" }}>
            <Button variant="outlined" color="secondary" onClick={handleOpenPasswordDialog}>
              Change Password
            </Button>
          </Grid>
        </Grid>
      </CardContent>

      <Dialog open={openPasswordDialog} onClose={handleClosePasswordDialog}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1, 
          pt: 1, width: "300px", "& .MuiTextField-root": { mt: 1 } }}>
          <TextField
            type = "password"
            label = "Current Password"
            value = {currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <TextField
            type = "password"
            label =" New Password"
            value = {newPassword}
            onChange ={(e) => setNewPassword(e.target.value)}
            required
          />
          <TextField
            type="password"
            label ="Confirm New Password"
            value={confirmNewPassword}
            onChange = {(e) => setConfirmNewPassword(e.target.value)}
            required
          />

        </DialogContent>
        <DialogActions>
          <Button onClick ={handleClosePasswordDialog}>Cancel</Button>
          <Button onClick={handleChangePassword} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open = {openAlert} autoHideDuration={6500} onClose = {() => setOpenAlert(false)} 
      anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={() => setOpenAlert(false)} severity = {alertSeverity} sx= {{ width: "100%" }}>
          {alertMessage}
          </Alert>
      </Snackbar>
    </Card>
  );
};

export default Account;
