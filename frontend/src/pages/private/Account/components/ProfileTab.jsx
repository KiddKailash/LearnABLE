import React from "react";

//MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid2";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";

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
  school,
  setSchool,
  specialty,
  setSpecialty,
  phoneNumber,
  setPhoneNumber,
  bio,
  setBio,
  isSaving,
  handleSaveProfile,
  handleUploadProfilePicture,
}) => {
  return (
    <>
      {/* Personal Information Section */}
      <Paper variant="outlined" sx={{ p: 3, mb: 2, borderRadius: 2 }}>
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ fontWeight: "bold" }}
        >
          Personal Information
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Update your personal details and contact information
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box sx={{ mr: 3 }}>
            <ProfileAvatar
              src={profile?.profile_picture || null}
              alt={user?.first_name || "User"}
              sx={{ width: 100, height: 100 }}
            >
              {!profile?.profile_picture &&
                (user?.first_name?.charAt(0) || "U")}
            </ProfileAvatar>
          </Box>

          <Box sx={{ flex: 1 }}>
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
                size="small"
              >
                {isSaving ? "Uploading..." : "Upload Photo"}
              </Button>
            </label>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              variant="outlined"
              margin="normal"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              variant="outlined"
              margin="normal"
            />
          </Grid>

          <Grid size={12}>
            <TextField
              fullWidth
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              variant="outlined"
              placeholder="Optional contact number"
              margin="normal"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Professional Information Section */}
      <Paper variant="outlined" sx={{ p: 3, mb: 2, borderRadius: 2 }}>
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ fontWeight: "bold" }}
        >
          Professional Information
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Share details about your teaching background and expertise
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="School/Institution"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              variant="outlined"
              placeholder="Where do you teach?"
              margin="normal"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Subject Specialty"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              variant="outlined"
              placeholder="Your main teaching subject"
              margin="normal"
            />
          </Grid>

          <Grid size={12}>
            <TextField
              fullWidth
              label="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              variant="outlined"
              multiline
              rows={4}
              placeholder="Tell us a bit about yourself and your teaching experience"
              margin="normal"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Save Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveProfile}
          disabled={isSaving}
          size="large"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </Box>
    </>
  );
};

export default ProfileTab;
