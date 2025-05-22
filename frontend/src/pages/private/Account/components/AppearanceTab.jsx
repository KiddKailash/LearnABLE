/**
 * @file AppearanceTab.jsx
 * @description A component that allows users to customize the visual appearance of the application
 * by selecting different theme modes (light, dark, system). The component provides a visual
 * preview of each theme option and handles theme changes.
 */

import React, { useEffect } from "react";

// MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";

/**
 * AppearanceTab component that manages theme preferences
 * @param {Object} props - Component props
 * @param {string} props.themeMode - Current theme mode ('light', 'dark', or 'system')
 * @param {Function} props.setThemeMode - Function to update theme mode
 * @param {boolean} props.isSaving - Loading state for save operations
 * @param {Function} props.handleSaveTheme - Function to save theme changes
 * @returns {JSX.Element} The theme customization interface
 */
const AppearanceTab = ({
  themeMode,
  setThemeMode,
  isSaving,
  handleSaveTheme,
}) => {
  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('themeMode');
    if (savedTheme && savedTheme !== themeMode) {
      setThemeMode(savedTheme);
    }
    //eslint-disable-next-line
  }, []);

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>

      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
        Theme Mode
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{mb:2}}>
        Customize the look and feel of your LearnABLE experience
      </Typography>

      <Grid container spacing={2}>
        {/* Light Mode Option */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              borderColor: themeMode === "light" ? "primary.main" : "divider",
              border: themeMode === "light" ? 2 : 1,
              bgcolor: "background.paper",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "primary.main",
              },
            }}
            onClick={() => setThemeMode("light")}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: 1,
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 1,
                }}
              >
                {themeMode === "light" && (
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                    }}
                  />
                )}
              </Box>
              <Typography variant="body1">Light Mode</Typography>
            </Box>

            <Box
              sx={{
                height: 120,
                bgcolor: "#FFFFFF",
                borderRadius: 1,
                border: 1,
                borderColor: "divider",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  height: 20,
                  bgcolor: "#f0f0f0",
                  borderBottom: 1,
                  borderColor: "divider",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  left: 8,
                  top: 40,
                  width: 40,
                  height: 8,
                  bgcolor: "#2196f3",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  left: 8,
                  top: 56,
                  width: 60,
                  height: 8,
                  bgcolor: "#e0e0e0",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  left: 8,
                  top: 72,
                  width: 70,
                  height: 8,
                  bgcolor: "#e0e0e0",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  left: 8,
                  top: 88,
                  width: 50,
                  height: 8,
                  bgcolor: "#e0e0e0",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  right: 8,
                  top: 40,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  bgcolor: "#2196f3",
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Dark Mode Option */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              borderColor: themeMode === "dark" ? "primary.main" : "divider",
              border: themeMode === "dark" ? 2 : 1,
              bgcolor: "background.paper",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "primary.main",
              },
            }}
            onClick={() => setThemeMode("dark")}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: 1,
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 1,
                }}
              >
                {themeMode === "dark" && (
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                    }}
                  />
                )}
              </Box>
              <Typography variant="body1">Dark Mode</Typography>
            </Box>

            <Box
              sx={{
                height: 120,
                bgcolor: "#121212",
                borderRadius: 1,
                border: 1,
                borderColor: "divider",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  height: 20,
                  bgcolor: "#272727",
                  borderBottom: 1,
                  borderColor: "#333",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  left: 8,
                  top: 40,
                  width: 40,
                  height: 8,
                  bgcolor: "#bb86fc",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  left: 8,
                  top: 56,
                  width: 60,
                  height: 8,
                  bgcolor: "#333",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  left: 8,
                  top: 72,
                  width: 70,
                  height: 8,
                  bgcolor: "#333",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  left: 8,
                  top: 88,
                  width: 50,
                  height: 8,
                  bgcolor: "#333",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  right: 8,
                  top: 40,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  bgcolor: "#bb86fc",
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* System Mode Option */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              borderColor: themeMode === "system" ? "primary.main" : "divider",
              border: themeMode === "system" ? 2 : 1,
              bgcolor: "background.paper",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "primary.main",
              },
            }}
            onClick={() => setThemeMode("system")}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: 1,
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 1,
                }}
              >
                {themeMode === "system" && (
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                    }}
                  />
                )}
              </Box>
              <Typography variant="body1">System Default</Typography>
            </Box>

            <Box
              sx={{
                height: 120,
                background:
                  "linear-gradient(to right, #FFFFFF 50%, #121212 50%)",
                borderRadius: 1,
                border: 1,
                borderColor: "divider",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  height: 20,
                  background:
                    "linear-gradient(to right, #f0f0f0 50%, #272727 50%)",
                  borderBottom: 1,
                  borderColor: "divider",
                }}
              />

              {/* Light mode side elements (left side) */}
              <Box
                sx={{
                  position: "absolute",
                  left: 8,
                  top: 40,
                  width: 20,
                  height: 8,
                  bgcolor: "#2196f3",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  left: 8,
                  top: 56,
                  width: 30,
                  height: 8,
                  bgcolor: "#e0e0e0",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  left: 8,
                  top: 72,
                  width: 35,
                  height: 8,
                  bgcolor: "#e0e0e0",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  left: 8,
                  top: 88,
                  width: 25,
                  height: 8,
                  bgcolor: "#e0e0e0",
                }}
              />

              {/* Dark mode side elements (right side) */}
              <Box
                sx={{
                  position: "absolute",
                  left: "50%",
                  ml: 8,
                  top: 40,
                  width: 20,
                  height: 8,
                  bgcolor: "#bb86fc",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  left: "50%",
                  ml: 8,
                  top: 56,
                  width: 30,
                  height: 8,
                  bgcolor: "#333",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  left: "50%",
                  ml: 8,
                  top: 72,
                  width: 35,
                  height: 8,
                  bgcolor: "#333",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  left: "50%",
                  ml: 8,
                  top: 88,
                  width: 25,
                  height: 8,
                  bgcolor: "#333",
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button
          variant="contained"
          onClick={handleSaveTheme}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </Box>
    </Paper>
  );
};

export default AppearanceTab;
