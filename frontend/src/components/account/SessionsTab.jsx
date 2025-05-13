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

const SessionsTab = ({
  sessions,
  sessionsLoading,
  isSaving,
  handleTerminateSession,
  handleTerminateAllSessions,
  handleRefreshSessions,
}) => {
  const [confirmDialog, setConfirmDialog] = React.useState({
    open: false,
    sessionId: null,
    deviceName: "",
  });
  const [terminatingSessionIds, setTerminatingSessionIds] = React.useState([]);

  const openConfirmDialog = (sessionId, deviceName) => {
    setConfirmDialog({
      open: true,
      sessionId,
      deviceName,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      sessionId: null,
      deviceName: "",
    });
  };

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
        aria-labelledby="terminate-session-dialog-title"
      >
        <DialogTitle id="terminate-session-dialog-title">
          Terminate Session
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to terminate the session on{" "}
            {confirmDialog.deviceName || "this device"}? This will log out that
            device immediately.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmTerminateSession} color="error" autoFocus>
            Terminate
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SessionsTab;
