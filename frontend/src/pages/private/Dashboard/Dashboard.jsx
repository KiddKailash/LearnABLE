/**
 * @file Dashboard.jsx
 * @description Main dashboard component for the LearnABLE application.
 * This component provides an overview of the user's teaching activity, including stats, recent classes,
 * quick actions, and NCCD report summaries. It handles data fetching for classes, students, and reports,
 * and displays loading and error states as needed.
 *
 * Features:
 * - User greeting and overview
 * - Stats cards for classes and students
 * - Recent classes list
 * - Quick actions panel
 * - NCCD reports summary
 * - Loading and error handling
 */

import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Services
import UserContext from "../../../store/UserObject";
import api from "../../../services/api";

// MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";

// MUI Icons
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";

// Context for snackbar notifications
import { SnackbarContext } from "../../../contexts/SnackbarContext";

// Dashboard Components
import StatsCard from "./components/StatsCard";
import QuickActions from "./components/QuickActions";
import ClassesList from "./components/ClassesList";
import DashboardSkeleton from "./components/DashboardSkeleton";
import NCCDReportsSummary from "./components/NCCDReportsSummary";

/**
 * Dashboard component displays an overview of the user's teaching activity.
 * Fetches and displays stats, recent classes, quick actions, and NCCD reports.
 * Handles loading and error states, and manages navigation for dashboard actions.
 *
 * @returns {JSX.Element} The dashboard interface
 */
const Dashboard = () => {
  const { user } = useContext(UserContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const navigate = useNavigate();

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([]);
  const [classes, setClasses] = useState([]);
  const [reports, setReports] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    /**
     * Fetches dashboard data: classes, students, and NCCD reports.
     * Handles authentication errors and updates state accordingly.
     */
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch classes
        const classesData = await api.classes.getAll();
        setClasses(classesData);

        // Fetch students
        const studentsData = await api.students.getAll();
        setStudents(studentsData);

        // Fetch NCCD reports
        const reportsData = await api.nccdReports.getAll();
        setReports(reportsData);

        // Build stats for dashboard cards
        const statsData = [
          {
            label: "Classes",
            value: classesData.length,
            icon: <SchoolIcon fontSize="large" color="primary" />,
            color: "#e3f2fd", // light blue
          },
          {
            label: "Students",
            // Calculate total students across all classes
            value: classesData.reduce(
              (acc, curr) => acc + (curr.students?.length || 0),
              0
            ),
            icon: <PeopleIcon fontSize="large" color="primary" />,
            color: "#e8f5e9", // light green
          },
        ];

        setStats(statsData);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        // Handle authentication error
        if (err.status === 401) {
          showSnackbar("Session expired. Please log in again.", "warning");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate, showSnackbar]);

  /**
   * Handles navigation to a different route
   * @param {string} path - The path to navigate to
   */
  const handleNavigate = (path) => {
    navigate(path);
  };

  // Show loading skeleton while data is being fetched
  if (loading) {
    return <DashboardSkeleton />;
  }

  // Show error alert if data fetching fails
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <>
      {/* Header with greeting and teacher info */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
          Welcome back {user?.first_name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's an overview of your teaching information and recent activity
        </Typography>
      </Box>

      {/* Stats cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6 }} key={index}>
            <StatsCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Main content grid with 2 sections */}
      <Grid container spacing={2}>
        {/* Left Column - Recent Classes */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ClassesList classes={classes} onNavigate={handleNavigate} />
        </Grid>

        {/* Right Column - Quick Actions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <QuickActions onNavigate={handleNavigate} />
        </Grid>
        {/* NCCD Reports Summary Section */}
        <Grid size={12}>
          <NCCDReportsSummary reports={reports} students={students} onNavigate={handleNavigate} />
        </Grid>
      </Grid>
    </>
  );
};

export default Dashboard;
