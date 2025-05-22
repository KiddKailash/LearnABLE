import React from 'react';

// MUI Components
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";

//MUI Icons
import CloseIcon from "@mui/icons-material/CloseRounded";
import EditIcon from "@mui/icons-material/EditRounded";
import DownloadIcon from "@mui/icons-material/DownloadRounded";

import { getStatusChipColor, getStatusLabel, getDisabilityCategoryLabel, getAdjustmentLabel } from '../utils/reportHelpers';

const ViewReportDialog = ({
  open,
  onClose,
  report,
  students,
  onEdit
}) => {
  if (!report) return null;

  const student = students.find((s) => s.id === report.student);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <Box sx={{ position: "relative", p: 3 }}>
        <IconButton
          sx={{ position: "absolute", top: 8, right: 8 }}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h5" gutterBottom>
          NCCD Report Details
        </Typography>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2">Student</Typography>
            <Typography variant="body1">
              {student
                ? `${student.first_name} ${student.last_name}`
                : `Student #${report.student}`}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2">Status</Typography>
            <Chip
              label={getStatusLabel(report.status)}
              color={getStatusChipColor(report.status)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2">
              Diagnosed Disability
            </Typography>
            <Typography variant="body1">
              {report.has_diagonsed_disability ? "Yes" : "No"}
            </Typography>
          </Grid>

          {report.has_diagonsed_disability && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2">
                Disability Category
              </Typography>
              <Typography variant="body1">
                {getDisabilityCategoryLabel(report.disability_category)}
              </Typography>
            </Grid>
          )}

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2">
              Level of Adjustment
            </Typography>
            <Typography variant="body1">
              {getAdjustmentLabel(report.level_of_adjustment)}
            </Typography>
          </Grid>

          {report.evidence_url && (
            <Grid size={12}>
              <Typography variant="subtitle2">
                Supporting Evidence
              </Typography>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => window.open(report.evidence_url, "_blank")}
                sx={{ mt: 1 }}
              >
                Download Evidence
              </Button>
            </Grid>
          )}
        </Grid>

        <Box
          sx={{
            mt: 3,
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => {
              onClose();
              onEdit(report.id);
            }}
          >
            Edit Report
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default ViewReportDialog; 