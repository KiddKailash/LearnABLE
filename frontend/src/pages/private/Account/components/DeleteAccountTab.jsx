/**
 * @file DeleteAccountTab.jsx
 * @description A component that provides functionality for users to delete their account.
 * It includes warnings about the permanent nature of account deletion, suggestions for
 * alternatives, and a secure confirmation process requiring password verification.
 */

import React from "react";

// Local Components
import PasswordField from "./PasswordField";

// MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";

// MUI Icons
import DeleteIcon from "@mui/icons-material/Delete";

/**
 * DeleteAccountTab component that manages account deletion process
 * @param {Object} props - Component props
 * @param {boolean} props.deleteDialogOpen - State controlling the visibility of the delete confirmation dialog
 * @param {Function} props.setDeleteDialogOpen - Function to update delete dialog visibility
 * @param {string} props.deletePassword - User's password for account deletion confirmation
 * @param {Function} props.setDeletePassword - Function to update delete password
 * @param {boolean} props.isSaving - Loading state for delete operation
 * @param {Function} props.handleDeleteAccount - Function to handle account deletion
 * @param {Function} props.onNavigateToTab - Function to navigate to other tabs
 * @returns {JSX.Element} The account deletion interface
 */
const DeleteAccountTab = ({
  deleteDialogOpen,
  setDeleteDialogOpen,
  deletePassword,
  setDeletePassword,
  isSaving,
  handleDeleteAccount,
  onNavigateToTab,
}) => {
  return (
    <>
      {/* Main Content */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ fontWeight: "bold" }}
        >
          Delete Account
        </Typography>

        {/* Warning Alert */}
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Warning: This action is permanent</AlertTitle>
          Deleting your account will permanently remove all your data including
          classes, students, assessments, and personal information.
        </Alert>

        {/* Pre-deletion Suggestions */}
        <Typography variant="body1">
          Before you delete your account, you may want to:
        </Typography>

        <Box component="ul" sx={{ mb: 2 }}>
          <Typography component="li" variant="body2">
            Export your data using the Data Export tab
          </Typography>

          <Typography component="li" variant="body2">
            Contact support if you're experiencing issues with your account
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Delete Account Section */}
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ fontWeight: "bold" }}
        >
          I understand the consequences and want to delete my account
        </Typography>

        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setDeleteDialogOpen(true)}
        >
          Delete My Account
        </Button>
      </Paper>

      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Your Account?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            This action cannot be undone. All your data will be permanently
            deleted. Please enter your password to confirm.
          </DialogContentText>

          <PasswordField
            label="Password"
            value={deletePassword}
            onChange={(value) => setDeletePassword(value)}
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setDeletePassword("");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={!deletePassword || isSaving}
            onClick={handleDeleteAccount}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteAccountTab;
