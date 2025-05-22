/**
 * @file Reporting.jsx
 * @description Main component for managing NCCD reports, providing a comprehensive interface
 * for viewing, creating, editing, and deleting reports. Includes filtering, search, and
 * detailed report management capabilities.
 *
 */

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

// Local Imports
import NCCDReportForm from "../components/NCCDReportForm";
import api from "../../../../services/api";

// MUI Components
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

// MUI Icons
import SearchIcon from "@mui/icons-material/SearchRounded";
import AddIcon from "@mui/icons-material/AddRounded";
import EditIcon from "@mui/icons-material/EditRounded";
import DownloadIcon from "@mui/icons-material/DownloadRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoRounded";
import DeleteIcon from "@mui/icons-material/DeleteRounded";
import CloseIcon from "@mui/icons-material/CloseRounded";

/**
 * Main component for managing NCCD reports
 *
 * @component
 * @returns {JSX.Element} The NCCD reports management interface
 */
const NCCDReports = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [reportStatus, setReportStatus] = useState({
    isSubmitting: false,
    isUpdating: false,
    isDeleting: false,
  });

  // Filter state
  const [statusFilter, setStatusFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [nameSearch, setNameSearch] = useState("");

  // Selected report and student for actions
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Dialog state
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState(null);

  const location = useLocation();

  // Fetch reports and students data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch reports and students in parallel
        const [reportsData, studentsData] = await Promise.all([
          api.nccdReports.getAll(),
          api.students.getAll(),
        ]);

        setReports(reportsData);
        setStudents(studentsData);
      } catch (error) {
        setError("Failed to load data: " + (error.message || ""));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle URL parameters for new report creation
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const shouldOpenForm = queryParams.get("newReport") === "true";
    const studentId = queryParams.get("studentId");

    if (shouldOpenForm && students.length > 0) {
      if (studentId) {
        setSelectedStudentId(studentId);
      }
      setFormDialogOpen(true);

      // Clean up the URL without causing a page reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [location, students]);

  /**
   * Filters reports based on current filter criteria
   * @returns {Array} Filtered reports array
   */
  const filteredReports = reports.filter((report) => {
    // Find student for this report
    const student = students.find((s) => s.id === report.student);
    if (!student) return false;

    // Apply status filter
    if (statusFilter && report.status !== statusFilter) {
      return false;
    }

    // Apply student filter
    if (studentFilter && report.student !== parseInt(studentFilter)) {
      return false;
    }

    // Apply name search
    if (nameSearch) {
      const fullName =
        `${student.first_name} ${student.last_name}`.toLowerCase();
      if (!fullName.includes(nameSearch.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  /**
   * Handles successful form submission
   * @param {Object} result - The submitted report data
   */
  const handleFormSuccess = async (result) => {
    try {
      setReportStatus((prev) => ({ ...prev, isSubmitting: true }));

      if (selectedReportId) {
        // Update existing report in list
        setReports((prevReports) =>
          prevReports.map((r) =>
            r.id === selectedReportId ? { ...r, ...result } : r
          )
        );
      } else {
        // Add new report to list
        setReports((prevReports) => [...prevReports, result]);
      }

      // Reset form state
      setSelectedReportId(null);
      setSelectedStudentId(null);
      setFormDialogOpen(false);
    } catch (error) {
      setError("Failed to save report: " + (error.message || ""));
    } finally {
      setReportStatus((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  /**
   * Handles opening the edit form for a report
   * @param {string} reportId - ID of the report to edit
   */
  const handleEditReport = (reportId) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    setSelectedReportId(reportId);
    setSelectedStudentId(report.student);
    setFormDialogOpen(true);
  };

  /**
   * Handles viewing a report's details
   * @param {string} reportId - ID of the report to view
   */
  const handleViewReport = (reportId) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    setViewingReport(report);
    setViewDialogOpen(true);
  };

  /**
   * Handles initiating report deletion
   * @param {string} reportId - ID of the report to delete
   */
  const handleDeleteClick = (reportId) => {
    setSelectedReportId(reportId);
    setConfirmDeleteDialogOpen(true);
  };

  /**
   * Confirms and executes report deletion
   */
  const handleConfirmDelete = async () => {
    try {
      setReportStatus((prev) => ({ ...prev, isDeleting: true }));
      await api.nccdReports.delete(selectedReportId);

      // Remove deleted report from state
      setReports((prevReports) =>
        prevReports.filter((r) => r.id !== selectedReportId)
      );
      setConfirmDeleteDialogOpen(false);
    } catch (error) {
      setError("Failed to delete report: " + (error.message || ""));
    } finally {
      setReportStatus((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  /**
   * Gets the appropriate chip color based on report status
   * @param {string} status - The report status
   * @returns {string} The chip color
   */
  const getStatusChipColor = (status) => {
    switch (status) {
      case "NotStart":
        return "default";
      case "InProgress":
        return "primary";
      case "Approved":
        return "success";
      default:
        return "default";
    }
  };

  /**
   * Gets a human-readable status label
   * @param {string} status - The report status
   * @returns {string} The readable status label
   */
  const getStatusLabel = (status) => {
    switch (status) {
      case "NotStart":
        return "Not Started";
      case "InProgress":
        return "In Progress";
      case "Approved":
        return "Approved";
      default:
        return status;
    }
  };

  /**
   * Gets a human-readable disability category label
   * @param {string} category - The disability category
   * @returns {string} The readable category label
   */
  const getDisabilityCategoryLabel = (category) => {
    if (!category || category === "None") return "None";
    return category;
  };

  /**
   * Gets a human-readable adjustment level label
   * @param {string} level - The adjustment level
   * @returns {string} The readable adjustment label
   */
  const getAdjustmentLabel = (level) => {
    switch (level) {
      case "QDTP":
        return "Quality Differentiated Teaching Practice";
      case "Supplementary":
        return "Supplementary adjustments";
      case "Substantial":
        return "Substantial adjustments";
      case "Extensive":
        return "Extensive adjustments";
      case "None":
      default:
        return level || "None";
    }
  };

  return (
    <>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h4">NCCD Reports</Typography>
          <Typography variant="caption" color="text.secondary">
            Manage Nationally Consistent Collection of Data on School Students
            with Disability reports
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setFormDialogOpen(true)}
          disabled={!students.length}
        >
          New Report
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <TextField
              fullWidth
              label="Search by Student Name"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              InputProps={{
                endAdornment: <SearchIcon color="action" />,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            {" "}
            <FormControl fullWidth>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                label="Filter by Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="NotStart">Not Started</MenuItem>
                <MenuItem value="InProgress">In Progress</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            {" "}
            <FormControl fullWidth>
              <InputLabel>Filter by Student</InputLabel>
              <Select
                value={studentFilter}
                label="Filter by Student"
                onChange={(e) => setStudentFilter(e.target.value)}
              >
                <MenuItem value="">All Students</MenuItem>
                {students.map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    {student.first_name} {student.last_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid
            size={{ xs: 12, sm: 12, md: 3 }}
            sx={{ display: "flex", justifyContent: "flex-end" }}
          >
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                setNameSearch("");
                setStatusFilter("");
                setStudentFilter("");
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Reports Table */}
      <TableContainer component={Paper}>
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
            ) : filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1">
                    No NCCD reports found matching the criteria
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => {
                const student = students.find((s) => s.id === report.student);
                return (
                  <TableRow key={report.id}>
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
                            onClick={() =>
                              window.open(report.evidence_url, "_blank")
                            }
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
                          onClick={() => handleViewReport(report.id)}
                        >
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Report">
                        <IconButton
                          size="small"
                          onClick={() => handleEditReport(report.id)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Report">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(report.id)}
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

      {/* Create/Edit Report Dialog */}
      <Dialog
        open={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false);
          setSelectedReportId(null);
          setSelectedStudentId(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <NCCDReportForm
          open={formDialogOpen}
          onClose={() => {
            setFormDialogOpen(false);
            setSelectedReportId(null);
            setSelectedStudentId(null);
          }}
          studentId={selectedStudentId}
          reportId={selectedReportId}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setFormDialogOpen(false);
            setSelectedReportId(null);
            setSelectedStudentId(null);
          }}
          students={students}
          isSubmitting={reportStatus.isSubmitting}
        />
      </Dialog>

      {/* View Report Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ position: "relative", p: 3 }}>
          <IconButton
            sx={{ position: "absolute", top: 8, right: 8 }}
            onClick={() => setViewDialogOpen(false)}
          >
            <CloseIcon />
          </IconButton>

          {viewingReport && (
            <>
              <Typography variant="h5" gutterBottom>
                NCCD Report Details
              </Typography>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2">Student</Typography>
                  <Typography variant="body1">
                    {(() => {
                      const student = students.find(
                        (s) => s.id === viewingReport.student
                      );
                      return student
                        ? `${student.first_name} ${student.last_name}`
                        : `Student #${viewingReport.student}`;
                    })()}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2">Status</Typography>
                  <Chip
                    label={getStatusLabel(viewingReport.status)}
                    color={getStatusChipColor(viewingReport.status)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2">
                    Diagnosed Disability
                  </Typography>
                  <Typography variant="body1">
                    {viewingReport.has_diagonsed_disability ? "Yes" : "No"}
                  </Typography>
                </Grid>

                {viewingReport.has_diagonsed_disability && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2">
                      Disability Category
                    </Typography>
                    <Typography variant="body1">
                      {getDisabilityCategoryLabel(
                        viewingReport.disability_category
                      )}
                    </Typography>
                  </Grid>
                )}

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2">
                    Level of Adjustment
                  </Typography>
                  <Typography variant="body1">
                    {getAdjustmentLabel(viewingReport.level_of_adjustment)}
                  </Typography>
                </Grid>

                {viewingReport.evidence_url && (
                  <Grid size={12}>
                    <Typography variant="subtitle2">
                      Supporting Evidence
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() =>
                        window.open(viewingReport.evidence_url, "_blank")
                      }
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
                  onClick={() => setViewDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleEditReport(viewingReport.id);
                  }}
                >
                  Edit Report
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDeleteDialogOpen}
        onClose={() => setConfirmDeleteDialogOpen(false)}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Confirm Deletion
          </Typography>
          <Typography variant="body1">
            Are you sure you want to delete this NCCD report? This action cannot
            be undone.
          </Typography>

          <Box
            sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}
          >
            <Button
              variant="outlined"
              onClick={() => setConfirmDeleteDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmDelete}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Delete"}
            </Button>
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

export default NCCDReports;
