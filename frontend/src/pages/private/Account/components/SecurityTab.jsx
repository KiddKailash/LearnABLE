import React from "react";

// Local Components
import PasswordField from "./PasswordField";

// MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";

// MUI Icons
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const SecurityTab = ({
  profile,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  setup2FADialogOpen,
  setSetup2FADialogOpen,
  disable2FADialogOpen,
  setDisable2FADialogOpen,
  qrCodeLoading,
  twoFactorData,
  twoFactorCode,
  setTwoFactorCode,
  isSaving,
  handleChangePassword,
  handleSetupTwoFactor,
  handleVerifyTwoFactor,
  handleDisableTwoFactor,
}) => {
  return (
    <Box sx={{ px: 3 }}>
      <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
        Security Settings
      </Typography>

      {/* Password Change */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "medium" }}>
          Change Password
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <PasswordField
              label="Current Password"
              onChange={(value) => setCurrentPassword(value)}
              value={currentPassword}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <PasswordField
              label="New Password"
              onChange={(value) => setNewPassword(value)}
              value={newPassword}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <PasswordField
              label="Confirm New Password"
              onChange={(value) => setConfirmPassword(value)}
              value={confirmPassword}
              fullWidth
              error={newPassword !== confirmPassword && confirmPassword !== ""}
              helperText={
                newPassword !== confirmPassword && confirmPassword !== ""
                  ? "Passwords do not match"
                  : ""
              }
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                disabled={
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword ||
                  newPassword !== confirmPassword ||
                  isSaving
                }
                onClick={handleChangePassword}
              >
                Change Password
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Two-Factor Authentication */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: "medium" }}>
              Two-Factor Authentication
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add an extra layer of security to your account
            </Typography>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={profile?.two_factor_enabled || false}
                onChange={() => {
                  if (profile?.two_factor_enabled) {
                    setDisable2FADialogOpen(true);
                  } else {
                    setSetup2FADialogOpen(true);
                  }
                }}
                color="primary"
              />
            }
            label={profile?.two_factor_enabled ? "Enabled" : "Disabled"}
          />
        </Box>

        {profile?.two_factor_enabled && (
          <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mt: 2 }}>
            Two-factor authentication is enabled for your account
          </Alert>
        )}
      </Paper>

      {/* Account Activity */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: "medium" }}>
          Recent Account Activity
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Last password change:{" "}
          {new Date(profile?.last_password_change).toLocaleDateString()}
        </Typography>

        <Button variant="outlined" onClick={() => {}}>
          View All Activity
        </Button>
      </Paper>

      {/* Two-Factor Authentication Setup Dialog */}
      <Dialog open={setup2FADialogOpen} onClose={() => setSetup2FADialogOpen(false)}>
        <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
        <DialogContent>
          {qrCodeLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : twoFactorData ? (
            <Box sx={{ textAlign: "center", my: 2 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Scan this QR code with an authenticator app like Google Authenticator or Authy
              </Typography>

              <Box sx={{ mb: 3 }}>
                <img
                  src={`data:image/png;base64,${twoFactorData.qr_code}`}
                  alt="QR Code for 2FA"
                  style={{ maxWidth: "200px" }}
                />
              </Box>

              <Typography variant="body2" sx={{ mb: 1 }}>
                Or enter this code manually:
              </Typography>

              <Typography
                variant="subtitle2"
                sx={{
                  p: 1,
                  bgcolor: "background.default",
                  borderRadius: 1,
                  fontFamily: "monospace",
                }}
              >
                {twoFactorData.secret}
              </Typography>

              <TextField
                label="Enter Authentication Code"
                variant="outlined"
                fullWidth
                sx={{ mt: 3 }}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="6-digit code"
                inputProps={{ maxLength: 6 }}
              />
            </Box>
          ) : (
            <DialogContentText>
              Two-factor authentication adds an extra layer of security to your account by
              requiring a code from your phone in addition to your password.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setSetup2FADialogOpen(false);
              setTwoFactorCode("");
            }}
          >
            Cancel
          </Button>

          {!twoFactorData ? (
            <Button variant="contained" onClick={handleSetupTwoFactor}>
              Set Up
            </Button>
          ) : (
            <Button
              variant="contained"
              disabled={!twoFactorCode || twoFactorCode.length !== 6 || isSaving}
              onClick={handleVerifyTwoFactor}
            >
              Verify and Enable
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Disable Two-Factor Authentication Dialog */}
      <Dialog
        open={disable2FADialogOpen}
        onClose={() => setDisable2FADialogOpen(false)}
      >
        <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Are you sure you want to disable two-factor authentication? This will make your
            account less secure.
          </DialogContentText>

          <TextField
            label="Enter Authentication Code"
            variant="outlined"
            fullWidth
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value)}
            placeholder="6-digit code"
            inputProps={{ maxLength: 6 }}
            helperText="Enter the code from your authenticator app to confirm"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDisable2FADialogOpen(false);
              setTwoFactorCode("");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={!twoFactorCode || twoFactorCode.length !== 6 || isSaving}
            onClick={handleDisableTwoFactor}
          >
            Disable
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecurityTab; 