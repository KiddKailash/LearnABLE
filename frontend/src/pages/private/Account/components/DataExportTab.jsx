import React from "react";

// MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Divider from "@mui/material/Divider";

// MUI Icons
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";

const DataExportTab = ({
  exportOptions,
  setExportOptions,
  isSaving,
  handleExportAccountData,
  handleExportSelectedData,
}) => {
  return (
    <Box sx={{ px: 3 }}>
      <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
        Data Export
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Export your account data and content
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "medium" }}>
            Account Information
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Export your profile information, preferences, and account settings
          </Typography>
          <Button
            variant="outlined"
            startIcon={<CloudDownloadIcon />}
            onClick={handleExportAccountData}
            disabled={isSaving}
          >
            Export Account Data
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "medium" }}>
            Content & Data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Export your classes, students, and assessment data
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={exportOptions.classes}
                onChange={(e) =>
                  setExportOptions({
                    ...exportOptions,
                    classes: e.target.checked,
                  })
                }
              />
            }
            label="Classes"
            sx={{ display: "block", mb: 1 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={exportOptions.students}
                onChange={(e) =>
                  setExportOptions({
                    ...exportOptions,
                    students: e.target.checked,
                  })
                }
              />
            }
            label="Students"
            sx={{ display: "block", mb: 1 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={exportOptions.assessments}
                onChange={(e) =>
                  setExportOptions({
                    ...exportOptions,
                    assessments: e.target.checked,
                  })
                }
              />
            }
            label="Assessments"
            sx={{ display: "block", mb: 1 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={exportOptions.reports}
                onChange={(e) =>
                  setExportOptions({
                    ...exportOptions,
                    reports: e.target.checked,
                  })
                }
              />
            }
            label="NCCD Reports"
            sx={{ display: "block", mb: 3 }}
          />

          <Button
            variant="contained"
            disabled={!Object.values(exportOptions).some((v) => v) || isSaving}
            startIcon={<CloudDownloadIcon />}
            onClick={handleExportSelectedData}
          >
            Export Selected Data
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default DataExportTab;
