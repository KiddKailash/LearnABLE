/**
 * @file SessionsTab.jsx
 * @description A component that manages and displays active user sessions across different devices.
 * This component allows users to view their active sessions, terminate individual sessions,
 * and log out from all other devices. It provides detailed information about each session
 * including device name, location, IP address, and last active time.
 */

import React from "react";

// MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

// MUI Icons
import DevicesIcon from "@mui/icons-material/Devices";
import LogoutIcon from "@mui/icons-material/Devices";

/**
 * SessionsTab component that manages active user sessions
 * @param {Object} props - Component props
 * @param {Array} props.sessions - Array of active session objects
 * @param {boolean} props.sessionsLoading - Loading state for sessions data
 * @param {boolean} props.isSaving - Loading state for session termination operations
 * @param {Function} props.handleTerminateSession - Function to terminate a specific session
 * @param {Function} props.handleTerminateAllSessions - Function to terminate all other sessions
 * @param {Function} props.handleRefreshSessions - Function to refresh the sessions list
 * @returns {JSX.Element} The sessions management interface
 */
const SessionsTab = ({
  sessions,
  sessionsLoading,
  isSaving,
  handleTerminateSession,
  handleTerminateAllSessions,
  handleRefreshSessions,
}) => {
  // State for confirmation dialog
  const [confirmDialog, setConfirmDialog] = React.useState({
    open: false,
    sessionId: null,
    deviceName: "",
  });

  // State for tracking sessions being terminated
  const [terminatingSessionIds, setTerminatingSessionIds] = React.useState([]);

  /**
   * Opens the confirmation dialog for session termination
   * @param {string} sessionId - ID of the session to terminate
   * @param {string} deviceName - Name of the device for the session
   */
  const openConfirmDialog = (sessionId, deviceName) => {
    setConfirmDialog({
      open: true,
      sessionId,
      deviceName,
    });
  };

  /**
   * Closes the confirmation dialog and resets its state
   */
  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      sessionId: null,
      deviceName: "",
    });
  };

  /**
   * Handles the confirmation of session termination
   * Updates UI state and calls the termination handler
   */
  const confirmTerminateSession = async () => {
    if (confirmDialog.sessionId) {
      // Add the session ID to the list of terminating sessions
      setTerminatingSessionIds((prev) => [...prev, confirmDialog.sessionId]);

      // Call the handler to terminate the session
      try {
        await handleTerminateSession(confirmDialog.sessionId);
      } finally {
        // Remove the session ID from the list after a short delay
        // This keeps the UI feedback visible briefly even after the server responds
        setTimeout(() => {
          setTerminatingSessionIds((prev) =>
            prev.filter((id) => id !== confirmDialog.sessionId)
          );
        }, 500);
      }
    }
    closeConfirmDialog();
  };

  /**
   * Handles termination of all other sessions
   * Updates UI state and calls the termination handler
   */
  const handleTerminateAllClick = async () => {
    // Mark all other sessions as terminating
    const otherSessionIds = sessions
      .filter((session) => !session.is_current)
      .map((session) => session.id);

    setTerminatingSessionIds(otherSessionIds);

    try {
      await handleTerminateAllSessions();
    } finally {
      // Remove the session IDs after a short delay
      setTimeout(() => {
        setTerminatingSessionIds([]);
      }, 500);
    }
  };

  return (
    <>
      <Paper variant="outlined" sx={{ p: 3, mb: 2, borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            These are devices and locations that have logged into your account.
          </Typography>

          <Button
            variant="outlined"
            color="error"
            onClick={handleTerminateAllClick}
            disabled={
              isSaving ||
              sessions.length <= 1 ||
              sessions.every((s) => s.is_current)
            }
            startIcon={<LogoutIcon />}
          >
            Log Out All Other Devices
          </Button>
        </Box>

        {sessionsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {sessions.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                No active sessions found
              </Alert>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 2,
                }}
              >
                {sessions.map((session) => {
                  const isTerminating = terminatingSessionIds.includes(
                    session.id
                  );

                  return (
                    <Paper
                      key={session.id}
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        borderColor: session.is_current
                          ? "primary.main"
                          : "divider",
                        borderWidth: session.is_current ? 2 : 1,
                        position: "relative",
                        opacity: isTerminating ? 0.6 : 1,
                        transition: "opacity 0.3s ease",
                      }}
                    >
                      {session.is_current && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: "0.75rem",
                          }}
                        >
                          Current
                        </Box>
                      )}

                      <Box
                        sx={{ display: "flex", mb: 1, alignItems: "center" }}
                      >
                        <DevicesIcon sx={{ mr: 1, color: "text.secondary" }} />
                        <Typography variant="subtitle1">
                          {session.device_name || "Unknown Device"}
                        </Typography>
                      </Box>

                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Location:</strong>{" "}
                        {session.location || "Unknown"}
                      </Typography>

                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>IP Address:</strong>{" "}
                        {session.ip_address || "Unknown"}
                      </Typography>

                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Last active:</strong>{" "}
                        {session.last_active
                          ? new Date(session.last_active).toLocaleString()
                          : "Unknown"}
                      </Typography>

                      <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>Browser:</strong> {session.browser || "Unknown"}
                      </Typography>

                      {!session.is_current && (
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={() =>
                            openConfirmDialog(session.id, session.device_name)
                          }
                          disabled={isSaving || isTerminating}
                          startIcon={
                            isTerminating ? (
                              <CircularProgress size={14} />
                            ) : (
                              <LogoutIcon />
                            )
                          }
                        >
                          {isTerminating
                            ? "Terminating..."
                            : "Terminate Session"}
                        </Button>
                      )}
                    </Paper>
                  );
                })}
              </Box>
            )}

            <Box sx={{ mt: 3 }}>
              <Button
                startIcon={<DevicesIcon />}
                onClick={handleRefreshSessions}
                disabled={sessionsLoading}
              >
                Refresh Sessions
              </Button>
            </Box>
          </>
        )}
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={closeConfirmDialog}
      >
        <DialogTitle>Terminate Session?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to terminate the session on{" "}
            <strong>{confirmDialog.deviceName || "this device"}</strong>? This
            will log out the device from your account.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog}>Cancel</Button>
          <Button
            onClick={confirmTerminateSession}
            color="error"
            variant="contained"
            disabled={isSaving}
          >
            Terminate Session
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SessionsTab;
