import React, { useState, useEffect, useContext } from "react";
import { useColorScheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";

// Contexts and Services
import UserContext from "../../../store/UserObject";
import accountApi from "../../../services/accountApi";
import { SnackbarContext } from "../../../contexts/SnackbarContext";

// Local Components
import TabPanel from "./components/TabPanel";
import ProfileTab from "./components/ProfileTab";
import SecurityTab from "./components/SecurityTab";
import AppearanceTab from "./components/AppearanceTab";
import SessionsTab from "./components/SessionsTab";
import DataExportTab from "./components/DataExportTab";
import DeleteAccountTab from "./components/DeleteAccountTab";

// MUI Components
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

// Icons
import PersonIcon from "@mui/icons-material/Person";
import SecurityIcon from "@mui/icons-material/Security";
import PaletteIcon from "@mui/icons-material/Palette";
import DevicesIcon from "@mui/icons-material/Devices";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import DeleteIcon from "@mui/icons-material/Delete";

const Account = () => {
  const { user, logout, updateUserInfo } = useContext(UserContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  // Profile state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [school, setSchool] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");

  // Security state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [setup2FADialogOpen, setSetup2FADialogOpen] = useState(false);
  const [disable2FADialogOpen, setDisable2FADialogOpen] = useState(false);
  const [qrCodeLoading, setQrCodeLoading] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  // Notification state
  const [notificationSettings, setNotificationSettings] = useState({
    student_activity: false,
    system_updates: false,
    reminders: false,
    marketing: false,
  });

  // Appearance state
  const [themeMode, setThemeMode] = useState("system");
  const { setMode } = useColorScheme();

  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Data export state
  const [exportOptions, setExportOptions] = useState({
    classes: false,
    students: false,
    assessments: false,
    reports: false,
  });

  // Delete account state
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await accountApi.getProfile();
        setProfile(data);

        // Set form fields
        setFirstName(data.user?.first_name || "");
        setLastName(data.user?.last_name || "");
        setSchool(data.school || "");
        setSpecialty(data.subject_specialty || "");
        setPhoneNumber(data.phone_number || "");
        setBio(data.bio || "");

        // Set notification settings
        setNotificationSettings(
          data.notification_preferences || {
            email_notifications: false,
            student_activity: false,
            system_updates: false,
            reminders: false,
            marketing: false,
          }
        );
        // Set theme mode
        setThemeMode(data.theme_preference || "system");
      } catch (error) {
        showSnackbar("Failed to load profile data", "error");
      } finally {
        setLoading(false);
      }
    };

    const fetchSessions = async () => {
      try {
        setSessionsLoading(true);
        const data = await accountApi.getActiveSessions();
        setSessions(data || []);
      } catch (error) {
        console.error("Failed to load sessions:", error);
      } finally {
        setSessionsLoading(false);
      }
    };

    fetchProfile();
    fetchSessions();
  }, [showSnackbar]);

  // Update theme when user preferences change
  useEffect(() => {
    setThemeMode(user?.theme_preference || "system");
  }, [user?.theme_preference]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Profile handlers
  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);

      // Update user and profile data
      await accountApi.updateProfile({
        user: {
          first_name: firstName,
          last_name: lastName,
        },
        school,
        subject_specialty: specialty,
        phone_number: phoneNumber,
        bio,
      });

      // Update website state
      updateUserInfo({
        first_name: firstName,
        last_name: lastName,
        school,
        subject_specialty: specialty,
        phone_number: phoneNumber,
        bio,
      });

      showSnackbar("Profile updated successfully", "success");
    } catch (error) {
      showSnackbar("Failed to update profile", "error");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadProfilePicture = async (e) => {
    if (e.target.files?.[0]) {
      try {
        const formData = new FormData();
        formData.append("profile_pic", e.target.files[0]);

        setIsSaving(true);
        await accountApi.uploadProfilePicture(formData);

        // Refresh profile data
        const updatedProfile = await accountApi.getProfile();
        setProfile(updatedProfile);

        showSnackbar("Profile photo updated successfully", "success");
      } catch (error) {
        showSnackbar("Failed to update profile photo", "error");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleConnectGoogleAccount = async () => {
    try {
      setIsSaving(true);

      if (profile?.notification_preferences?.google_connected) {
        await accountApi.disconnectGoogleAccount();

        // Update profile state
        const updatedProfile = { ...profile };
        if (updatedProfile.notification_preferences) {
          delete updatedProfile.notification_preferences.google_connected;
        }
        setProfile(updatedProfile);

        showSnackbar("Google account disconnected", "success");
      } else {
        // In a real app, we would initiate OAuth flow here
        // For demo purposes, we'll just simulate success
        await accountApi.connectGoogleAccount("dummy-token");

        // Update profile state
        const updatedProfile = { ...profile };
        if (!updatedProfile.notification_preferences) {
          updatedProfile.notification_preferences = {};
        }
        updatedProfile.notification_preferences.google_connected = true;
        setProfile(updatedProfile);

        showSnackbar("Google account connected", "success");
      }
    } catch (error) {
      showSnackbar(
        `Failed to ${
          profile?.notification_preferences?.google_connected
            ? "disconnect"
            : "connect"
        } Google account`,
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Security handlers
  const handleChangePassword = async () => {
    try {
      setIsSaving(true);
      await accountApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      showSnackbar("Password changed successfully", "success");
    } catch (error) {
      showSnackbar(error.message || "Failed to change password", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetupTwoFactor = async () => {
    try {
      setQrCodeLoading(true);
      const data = await accountApi.setupTwoFactor();
      setTwoFactorData(data);
    } catch (error) {
      showSnackbar("Failed to set up two-factor authentication", "error");
      setSetup2FADialogOpen(false);
    } finally {
      setQrCodeLoading(false);
    }
  };

  const handleVerifyTwoFactor = async () => {
    try {
      setIsSaving(true);
      await accountApi.verifyTwoFactor(twoFactorCode);

      // Update profile
      const updatedProfile = {
        ...profile,
        two_factor_enabled: true,
      };
      setProfile(updatedProfile);

      showSnackbar("Two-factor authentication enabled successfully", "success");
      setSetup2FADialogOpen(false);
      setTwoFactorData(null);
      setTwoFactorCode("");
    } catch (error) {
      showSnackbar(
        error.message || "Failed to verify two-factor authentication",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    try {
      setIsSaving(true);
      await accountApi.disableTwoFactor(twoFactorCode);

      // Update profile
      const updatedProfile = {
        ...profile,
        two_factor_enabled: false,
      };
      setProfile(updatedProfile);

      showSnackbar(
        "Two-factor authentication disabled successfully",
        "success"
      );
      setDisable2FADialogOpen(false);
      setTwoFactorCode("");
    } catch (error) {
      showSnackbar(
        error.message || "Failed to disable two-factor authentication",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Appearance handlers
  const handleSaveTheme = async () => {
    try {
      setIsSaving(true);
      await accountApi.updateTheme(themeMode);

      // Update user context
      updateUserInfo({ theme_preference: themeMode });

      // Update the MUI color scheme
      setMode(themeMode);

      // Update localStorage to persist between sessions
      localStorage.setItem("theme_preference", themeMode);

      showSnackbar("Theme preference saved", "success");
    } catch (error) {
      showSnackbar("Failed to save theme preference", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Sessions handlers
  const handleTerminateSession = async (sessionId) => {
    try {
      setIsSaving(true);
      await accountApi.terminateSession(sessionId);

      // Remove from local state
      setSessions(sessions.filter((s) => s.id !== sessionId));

      showSnackbar("Session terminated successfully", "success");
    } catch (error) {
      showSnackbar("Failed to terminate session", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTerminateAllSessions = async () => {
    try {
      if (
        window.confirm(
          "Are you sure you want to log out from all other devices?"
        )
      ) {
        setIsSaving(true);
        await accountApi.terminateAllSessions();

        // Refresh sessions
        const updatedSessions = await accountApi.getActiveSessions();
        setSessions(updatedSessions.filter((session) => session.is_current));

        showSnackbar("Logged out from all other devices", "success");
      }
    } catch (error) {
      showSnackbar("Failed to log out from other devices", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefreshSessions = async () => {
    try {
      setSessionsLoading(true);
      const data = await accountApi.getActiveSessions();
      setSessions(data || []);
    } catch (error) {
      showSnackbar("Failed to refresh sessions", "error");
    } finally {
      setSessionsLoading(false);
    }
  };

  // Data export handlers
  const handleExportAccountData = async () => {
    try {
      setIsSaving(true);
      const data = await accountApi.exportAccountData();

      // Create a download link
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "learnable-account-data.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      URL.revokeObjectURL(url);

      showSnackbar("Account data exported successfully", "success");
    } catch (error) {
      showSnackbar("Failed to export account data", "error");
      console.error("Export error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportSelectedData = async () => {
    try {
      setIsSaving(true);

      // Only include options that are selected (true)
      const selectedOptions = Object.entries(exportOptions)
        .filter(([key, value]) => value === true)
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});

      const data = await accountApi.exportAccountData(selectedOptions);

      // Create a download link
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "learnable-full-data-export.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      URL.revokeObjectURL(url);

      showSnackbar("Data exported successfully", "success");
    } catch (error) {
      showSnackbar("Failed to export data", "error");
      console.error("Export error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete account handlers
  const handleDeleteAccount = async () => {
    try {
      setIsSaving(true);
      await accountApi.deleteAccount(deletePassword);

      // Log the user out
      logout();

      // Show a success message before redirect
      showSnackbar("Your account has been deleted successfully", "success");
    } catch (error) {
      showSnackbar(error.message || "Failed to delete account", "error");
      setDeleteDialogOpen(false);
      setDeletePassword("");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Typography variant="h4">Account Settings</Typography>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="account settings tabs"
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          minHeight: 64,
          "& .MuiTab-root": {
            minHeight: 64,
            textTransform: "none",
          },
        }}
      >
        <Tab icon={<PersonIcon />} label="Profile" iconPosition="start" />
        <Tab icon={<SecurityIcon />} label="Security" iconPosition="start" />
        <Tab icon={<PaletteIcon />} label="Appearance" iconPosition="start" />
        <Tab icon={<DevicesIcon />} label="Sessions" iconPosition="start" />
        <Tab
          icon={<CloudDownloadIcon />}
          label="Data Export"
          iconPosition="start"
        />
        <Tab
          icon={<DeleteIcon />}
          label="Delete Account"
          iconPosition="start"
        />
      </Tabs>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TabPanel value={tabValue} index={0}>
            <ProfileTab
              profile={profile}
              user={user}
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              school={school}
              setSchool={setSchool}
              specialty={specialty}
              setSpecialty={setSpecialty}
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              bio={bio}
              setBio={setBio}
              isSaving={isSaving}
              setIsSaving={setIsSaving}
              handleSaveProfile={handleSaveProfile}
              handleUploadProfilePicture={handleUploadProfilePicture}
              handleConnectGoogleAccount={handleConnectGoogleAccount}
            />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <SecurityTab
              profile={profile}
              currentPassword={currentPassword}
              setCurrentPassword={setCurrentPassword}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              setup2FADialogOpen={setup2FADialogOpen}
              setSetup2FADialogOpen={setSetup2FADialogOpen}
              disable2FADialogOpen={disable2FADialogOpen}
              setDisable2FADialogOpen={setDisable2FADialogOpen}
              qrCodeLoading={qrCodeLoading}
              twoFactorData={twoFactorData}
              twoFactorCode={twoFactorCode}
              setTwoFactorCode={setTwoFactorCode}
              isSaving={isSaving}
              handleChangePassword={handleChangePassword}
              handleSetupTwoFactor={handleSetupTwoFactor}
              handleVerifyTwoFactor={handleVerifyTwoFactor}
              handleDisableTwoFactor={handleDisableTwoFactor}
            />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <AppearanceTab
              themeMode={themeMode}
              setThemeMode={setThemeMode}
              isSaving={isSaving}
              handleSaveTheme={handleSaveTheme}
            />
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
            <SessionsTab
              sessions={sessions}
              sessionsLoading={sessionsLoading}
              isSaving={isSaving}
              handleTerminateSession={handleTerminateSession}
              handleTerminateAllSessions={handleTerminateAllSessions}
              handleRefreshSessions={handleRefreshSessions}
            />
          </TabPanel>
          <TabPanel value={tabValue} index={4}>
            <DataExportTab
              exportOptions={exportOptions}
              setExportOptions={setExportOptions}
              isSaving={isSaving}
              handleExportAccountData={handleExportAccountData}
              handleExportSelectedData={handleExportSelectedData}
            />
          </TabPanel>
          <TabPanel value={tabValue} index={5}>
            <DeleteAccountTab
              deleteDialogOpen={deleteDialogOpen}
              setDeleteDialogOpen={setDeleteDialogOpen}
              deletePassword={deletePassword}
              setDeletePassword={setDeletePassword}
              isSaving={isSaving}
              handleDeleteAccount={handleDeleteAccount}
              onNavigateToTab={setTabValue}
            />
          </TabPanel>
        </>
      )}
    </>
  );
};

export default Account;
