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
    <Box sx={{ px: 3 }}>
      <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
        Delete Account
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Warning: This action is permanent</AlertTitle>
          Deleting your account will permanently remove all your data including classes,
          students, assessments, and personal information.
        </Alert>

        <Typography variant="body1" sx={{ mb: 3 }}>
          Before you delete your account, you may want to:
        </Typography>

        <Box component="ul" sx={{ mb: 3 }}>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            Export your data using the{" "}
            <Button size="small" onClick={() => onNavigateToTab(5)}>
              Data Export
            </Button>{" "}
            tab
          </Typography>

          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            Consider temporarily deactivating your account instead
          </Typography>

          <Typography component="li" variant="body2">
            Contact support if you're experiencing issues with your account
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1" sx={{ fontWeight: "medium", mb: 3 }}>
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
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Your Account?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            This action cannot be undone. All your data will be permanently deleted. Please
            enter your password to confirm.
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
    </Box>
  );
};

export default DeleteAccountTab; 