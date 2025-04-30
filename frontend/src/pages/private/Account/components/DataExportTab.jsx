import React from "react";

// MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Tooltip from "@mui/material/Tooltip";

// MUI Icons
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import InfoIcon from "@mui/icons-material/Info";

const DataExportTab = ({
  exportOptions,
  setExportOptions,
  isSaving,
  handleExportAccountData,
  handleExportSelectedData,
}) => {
  return (
    <Box sx={{ px: 3 }}>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Export your account data and content
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          Your data will be exported as a JSON file that you can download to your device.
        </Alert>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "medium" }}>
            Account Information
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Export your profile information, preferences, and account settings
          </Typography>
          <Button
            variant="outlined"
            startIcon={isSaving ? <CircularProgress size={20} /> : <CloudDownloadIcon />}
            onClick={handleExportAccountData}
            disabled={isSaving}
          >
            {isSaving ? "Exporting..." : "Export Account Data"}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "medium", mr: 1 }}>
              Content & Data
            </Typography>
            <Tooltip title="Select which types of data you want to export">
              <InfoIcon color="action" fontSize="small" />
            </Tooltip>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Export classes, students, and assessment data
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
            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <CloudDownloadIcon />}
            onClick={handleExportSelectedData}
          >
            {isSaving ? "Exporting..." : "Export Selected Data"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default DataExportTab;
