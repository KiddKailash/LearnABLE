import React, { useState, useContext, useEffect } from "react";

// Local Components
import PasswordField from "./PasswordField";

// MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
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

// Contexts and Services
import UserContext from "../../store/UserObject";
import { SnackbarContext } from "../../contexts/SnackbarContext";
import api from "../../services/api";

const SecurityTab = () => {
  // Get user profile from context
  const {
    user,
    updateUserInfo,
    setupTwoFactor,
    verifyAndEnableTwoFactor,
    disableTwoFactor,
    get2FAStatus,
    twoFactorData,
  } = useContext(UserContext);
  const { showSnackbar } = useContext(SnackbarContext);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 2FA states
  const [setup2FADialogOpen, setSetup2FADialogOpen] = useState(false);
  const [disable2FADialogOpen, setDisable2FADialogOpen] = useState(false);
  const [qrCodeLoading, setQrCodeLoading] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    user?.two_factor_enabled || false
  );

  console.log("Two factor data is", twoFactorData);

  // Loading state
  const [isSaving, setIsSaving] = useState(false);

  // Effect to fetch the latest 2FA status when component mounts
  useEffect(() => {
    const fetchTwoFactorStatus = async () => {
      try {
        const result = await get2FAStatus();
        if (result.success) {
          setTwoFactorEnabled(result.two_factor_enabled);
        }
      } catch (error) {
        console.error("Error fetching 2FA status:", error);
      }
    };

    fetchTwoFactorStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update local state when user object changes
  useEffect(() => {
    if (user && typeof user.two_factor_enabled === "boolean") {
      setTwoFactorEnabled(user.two_factor_enabled);
    }
  }, [user]);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showSnackbar("New passwords do not match", "error");
      return;
    }

    setIsSaving(true);
    try {
      const result = await api.account.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      if (result.success) {
        showSnackbar("Password changed successfully", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // Update last password change in user profile
        updateUserInfo({
          last_password_change: new Date().toISOString(),
        });
      } else {
        showSnackbar(result.message || "Failed to change password", "error");
      }
    } catch (error) {
      showSnackbar(error.message || "An error occurred", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetupTwoFactor = async () => {
    setQrCodeLoading(true);
    try {
      const result = await setupTwoFactor();
      if (!result.success) {
        showSnackbar(
          result.message || "Failed to setup two-factor authentication",
          "error"
        );
        setSetup2FADialogOpen(false);
      }
      // Note: We no longer need to set twoFactorData here as it's managed in the UserContext
    } catch (error) {
      showSnackbar("Error setting up two-factor authentication", "error");
      setSetup2FADialogOpen(false);
    } finally {
      setQrCodeLoading(false);
    }
  };

  const handleVerifyTwoFactor = async () => {
    setIsSaving(true);
    try {
      const result = await verifyAndEnableTwoFactor(twoFactorCode);
      if (result.success) {
        showSnackbar(
          "Two-factor authentication enabled successfully",
          "success"
        );
        setSetup2FADialogOpen(false);
        setTwoFactorCode("");
        setTwoFactorEnabled(true);
      } else {
        showSnackbar(result.message || "Failed to verify code", "error");
      }
    } catch (error) {
      showSnackbar("Error verifying two-factor authentication", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    setIsSaving(true);
    try {
      const result = await disableTwoFactor(twoFactorCode);
      if (result.success) {
        showSnackbar(
          "Two-factor authentication disabled successfully",
          "success"
        );
        setDisable2FADialogOpen(false);
        setTwoFactorCode("");
        setTwoFactorEnabled(false);
      } else {
        showSnackbar(
          result.message || "Failed to disable two-factor authentication",
          "error"
        );
      }
    } catch (error) {
      showSnackbar("Error disabling two-factor authentication", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Load 2FA QR code when dialog opens
  useEffect(() => {
    if (setup2FADialogOpen && !twoFactorData) {
      handleSetupTwoFactor();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setup2FADialogOpen, twoFactorData]);

  return (
    <>
      {/* Password Change */}
      <Paper variant="outlined" sx={{ p: 3, mb: 2, borderRadius: 2 }}>
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ fontWeight: "bold" }}
        >
          Change Password
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Keep your account secure by changing your password regularly
        </Typography>

        <Grid container spacing={2}>
          <Grid size={12}>
            <PasswordField
              label="Current Password"
              onChange={(value) => setCurrentPassword(value)}
              value={currentPassword}
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <PasswordField
              label="New Password"
              onChange={(value) => setNewPassword(value)}
              value={newPassword}
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
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

          <Grid size={12}>
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
      <Paper variant="outlined" sx={{ p: 3, mb: 2, borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              Two-Factor Authentication
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add an extra layer of security to your account
            </Typography>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={twoFactorEnabled}
                onChange={() => {
                  if (twoFactorEnabled) {
                    setDisable2FADialogOpen(true);
                  } else {
                    setSetup2FADialogOpen(true);
                  }
                }}
                color="primary"
              />
            }
            label={twoFactorEnabled ? "Enabled" : "Disabled"}
          />
        </Box>

        {twoFactorEnabled && (
          <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mt: 2 }}>
            Two-factor authentication is enabled for your account
          </Alert>
        )}
      </Paper>

      {/* Two-Factor Authentication Setup Dialog */}
      <Dialog
        open={setup2FADialogOpen}
        onClose={() => setSetup2FADialogOpen(false)}
      >
        <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
        <DialogContent>
          {qrCodeLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : twoFactorData ? (
            <Box sx={{ textAlign: "center", my: 2 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Scan this QR code with an authenticator app like Google
                Authenticator or Authy
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
              Two-factor authentication adds an extra layer of security to your
              account by requiring a code from your phone in addition to your
              password.
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
              disabled={
                !twoFactorCode || twoFactorCode.length !== 6 || isSaving
              }
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
            Are you sure you want to disable two-factor authentication? This
            will make your account less secure.
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
    </>
  );
};

export default SecurityTab;
