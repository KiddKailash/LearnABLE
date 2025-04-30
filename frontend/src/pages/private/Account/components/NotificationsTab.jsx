import React from "react";

// MUI Components
import Box from "@mui/material/Box";    
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

const NotificationsTab = ({
  notificationSettings,
  setNotificationSettings,
  isSaving,
  handleSaveNotifications,
}) => {
  return (
    <Box sx={{ px: 3 }}>
      <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
        Notification Preferences
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Choose how and when you'd like to receive notifications
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.email_notifications || false}
                  onChange={(e) => {
                    setNotificationSettings({
                      ...notificationSettings,
                      email_notifications: e.target.checked,
                    });
                  }}
                />
              }
              label="Email Notifications"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              Receive updates via email
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.student_activity || false}
                  onChange={(e) => {
                    setNotificationSettings({
                      ...notificationSettings,
                      student_activity: e.target.checked,
                    });
                  }}
                />
              }
              label="Student Activity"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              Receive notifications about student progress and assessments
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.system_updates || false}
                  onChange={(e) => {
                    setNotificationSettings({
                      ...notificationSettings,
                      system_updates: e.target.checked,
                    });
                  }}
                />
              }
              label="System Updates"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              Get notified about new features and system changes
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.reminders || false}
                  onChange={(e) => {
                    setNotificationSettings({
                      ...notificationSettings,
                      reminders: e.target.checked,
                    });
                  }}
                />
              }
              label="Reminders"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              Receive reminders about upcoming events and tasks
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.marketing || false}
                  onChange={(e) => {
                    setNotificationSettings({
                      ...notificationSettings,
                      marketing: e.target.checked,
                    });
                  }}
                />
              }
              label="Marketing & Promotions"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              Receive information about new offerings and promotions
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleSaveNotifications}
                disabled={isSaving}
              >
                Save Preferences
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default NotificationsTab; 