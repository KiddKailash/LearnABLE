import React from "react";

//MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

// MUI Icons
import ProfileAvatar from "./ProfileAvatar";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

const ProfileTab = ({
  profile,
  user,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  school,
  setSchool,
  specialty,
  setSpecialty,
  phoneNumber,
  setPhoneNumber,
  bio,
  setBio,
  isSaving,
  setIsSaving,
  handleSaveProfile,
  handleUploadProfilePicture,
  handleConnectGoogleAccount,
}) => {
  return (
    <Box sx={{ px: 3 }}>
      <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
        Personal Information
      </Typography>

      <Box component="form" noValidate>
        <Grid container spacing={3}>
          {/* Profile Photo Upload */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <ProfileAvatar
                src={profile?.profile_picture || null}
                alt={user?.first_name || "User"}
              >
                {!profile?.profile_picture &&
                  (user?.first_name?.charAt(0) || "U")}
              </ProfileAvatar>

              <Box sx={{ ml: 3 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Profile Photo
                </Typography>

                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="profile-photo-upload"
                  type="file"
                  onChange={handleUploadProfilePicture}
                />
                <label htmlFor="profile-photo-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCameraIcon />}
                    disabled={isSaving}
                  >
                    {isSaving ? "Uploading..." : "Upload Photo"}
                  </Button>
                </label>
              </Box>
            </Box>
          </Grid>

          {/* Personal Details */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              type="email"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="School/Institution"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              variant="outlined"
              placeholder="Where do you teach?"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Subject Specialty"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              variant="outlined"
              placeholder="Your main teaching subject"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              variant="outlined"
              placeholder="Optional contact number"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              variant="outlined"
              multiline
              rows={4}
              placeholder="Tell us a bit about yourself and your teaching experience"
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ProfileTab;
