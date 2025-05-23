import React from 'react';

// MUI Components
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";

// Icons
import InfoOutlinedIcon from "@mui/icons-material/InfoRounded";
import EditIcon from "@mui/icons-material/EditRounded";
import DeleteIcon from "@mui/icons-material/DeleteRounded";
import DownloadIcon from "@mui/icons-material/DownloadRounded";

import { getStatusChipColor, getStatusLabel, getDisabilityCategoryLabel, getAdjustmentLabel } from '../utils/reportHelpers';

const NCCDReportsTable = ({
  loading,
  reports,
  students,
  onViewReport,
  onEditReport,
  onDeleteReport
}) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Student</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Disability</TableCell>
            <TableCell>Adjustment Level</TableCell>
            <TableCell>Evidence</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                <CircularProgress size={40} />
              </TableCell>
            </TableRow>
          ) : reports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                <Typography variant="body1">
                  No NCCD reports found matching the criteria
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            reports.map((report) => {
              const student = students.find((s) => s.id === report.student);
              return (
                <TableRow key={`${report.id}-${Date.now()}`}>
                  <TableCell>
                    {student
                      ? `${student.first_name} ${student.last_name}`
                      : `Student #${report.student}`}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(report.status)}
                      color={getStatusChipColor(report.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {report.has_diagonsed_disability
                      ? getDisabilityCategoryLabel(report.disability_category)
                      : "No diagnosed disability"}
                  </TableCell>
                  <TableCell>
                    {getAdjustmentLabel(report.level_of_adjustment)}
                  </TableCell>
                  <TableCell>
                    {report.evidence_url ? (
                      <Tooltip title="Download Evidence">
                        <IconButton
                          size="small"
                          onClick={() => window.open(report.evidence_url, "_blank")}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      "None"
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Report">
                      <IconButton
                        size="small"
                        onClick={() => onViewReport(report.id)}
                      >
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Report">
                      <IconButton
                        size="small"
                        onClick={() => onEditReport(report.id)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Report">
                      <IconButton
                        size="small"
                        onClick={() => onDeleteReport(report.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default NCCDReportsTable; 