/**
 * @file DesktopReporting.jsx
 * @description Main component for managing NCCD reports, providing a comprehensive interface
 * for viewing, creating, editing, and deleting reports.
 */

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

// Local Components
import NCCDReportForm from "../components/NCCDReportForm";
import NCCDReportsTable from "../components/NCCDReportsTable";
import NCCDReportsFilters from "../components/NCCDReportsFilters";
import ViewReportDialog from "../components/ViewReportDialog";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";

// Utils
import { filterReports } from "../utils/reportHelpers";
import api from "../../../../services/api";

// MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import AddIcon from "@mui/icons-material/AddRounded";

const NCCDReports = () => {
  // Data state
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  
  // UI state
  const [reportStatus, setReportStatus] = useState({
    isSubmitting: false,
    isUpdating: false,
    isDeleting: false,
  });

  // Filter state
  const [filters, setFilters] = useState({
    statusFilter: "",
    studentFilter: "",
    nameSearch: "",
  });

  // Selected items state
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Dialog state
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState(null);

  const location = useLocation();

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

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

  // Filter handlers
  const handleNameSearchChange = (value) => {
    setFilters(prev => ({ ...prev, nameSearch: value }));
  };

  const handleStatusFilterChange = (value) => {
    setFilters(prev => ({ ...prev, statusFilter: value }));
  };

  const handleStudentFilterChange = (value) => {
    setFilters(prev => ({ ...prev, studentFilter: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      statusFilter: "",
      studentFilter: "",
      nameSearch: "",
    });
  };

  // Report action handlers
  const handleFormSuccess = async (result) => {
    try {
      setReportStatus((prev) => ({ ...prev, isSubmitting: true }));

      if (selectedReportId) {
        setReports((prevReports) =>
          prevReports.map((r) =>
            r.id === selectedReportId ? { ...r, ...result } : r
          )
        );
      } else {
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

  const handleEditReport = (reportId) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    setSelectedReportId(reportId);
    setSelectedStudentId(report.student);
    setFormDialogOpen(true);
  };

  const handleViewReport = (reportId) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    setViewingReport(report);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (reportId) => {
    setSelectedReportId(reportId);
    setConfirmDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setReportStatus((prev) => ({ ...prev, isDeleting: true }));
      await api.nccdReports.delete(selectedReportId);

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

  // Get filtered reports
  const filteredReports = filterReports(reports, students, filters);

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
          <Typography variant="body1" color="text.secondary">
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

      <NCCDReportsFilters
        nameSearch={filters.nameSearch}
        statusFilter={filters.statusFilter}
        studentFilter={filters.studentFilter}
        students={students}
        onNameSearchChange={handleNameSearchChange}
        onStatusFilterChange={handleStatusFilterChange}
        onStudentFilterChange={handleStudentFilterChange}
        onClearFilters={handleClearFilters}
      />

      <NCCDReportsTable
        loading={loading}
        reports={filteredReports}
        students={students}
        onViewReport={handleViewReport}
        onEditReport={handleEditReport}
        onDeleteReport={handleDeleteClick}
      />

      {/* Dialogs */}
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

      <ViewReportDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        report={viewingReport}
        students={students}
        onEdit={(reportId) => {
          setViewDialogOpen(false);
          handleEditReport(reportId);
        }}
      />

      <DeleteConfirmDialog
        open={confirmDeleteDialogOpen}
        onClose={() => setConfirmDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={reportStatus.isDeleting}
      />
    </>
  );
};

export default NCCDReports;
