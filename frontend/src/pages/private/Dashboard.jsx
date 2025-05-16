import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Services
import UserContext from "../../store/UserObject";
import api from "../../services/api";

// MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";

// MUI Icons
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";

// Context for snackbar notifications
import { SnackbarContext } from "../../contexts/SnackbarContext";

// Dashboard Components
import StatsCard from "../../components/dashboard/StatsCard";
import QuickActions from "../../components/dashboard/QuickActions";
import ClassesList from "../../components/dashboard/ClassesList";
import DashboardSkeleton from "../../components/dashboard/DashboardSkeleton";

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const navigate = useNavigate();

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([]);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch classes
        const classesData = await api.classes.getAll();
        setClasses(classesData);

        // Build stats
        const statsData = [
          {
            label: "Classes",
            value: classesData.length,
            icon: <SchoolIcon fontSize="large" color="primary" />,
            color: "#e3f2fd", // light blue
          },
          {
            label: "Students",
            value: classesData.reduce((acc, curr) => acc + (curr.students?.length || 0), 0),
            icon: <PeopleIcon fontSize="large" color="primary" />,
            color: "#e8f5e9", // light green
          },
        ];

        setStats(statsData);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
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

  const handleNavigate = (path) => {
    navigate(path);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

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
      <Grid container spacing={3} sx={{ mb: 2 }}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6 }} key={index}>
            <StatsCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Main content grid with 2 sections */}
      <Grid container spacing={3}>
        {/* Left Column - Recent Classes */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ClassesList classes={classes} onNavigate={handleNavigate} />
        </Grid>

        {/* Right Column - Quick Actions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <QuickActions onNavigate={handleNavigate} />
        </Grid>
      </Grid>
    </>
  );
};

export default Dashboard;
