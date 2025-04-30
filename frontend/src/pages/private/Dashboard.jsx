import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

// Services
import UserContext from "../../contexts/UserObject";
import api from "../../services/api";

// MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import ListItemButton from '@mui/material/ListItemButton';

// Icons
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import BarChartIcon from "@mui/icons-material/BarChart";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DescriptionIcon from "@mui/icons-material/Description";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AddIcon from "@mui/icons-material/Add";

// Context for snackbar notifications
import { SnackbarContext } from "../../contexts/SnackbarContext";

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const navigate = useNavigate();
  const theme = useTheme();

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [nccdReports, setNccdReports] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch classes
        const classesData = await api.classes.getAll();
        setClasses(classesData);

        // Fetch students
        const studentsData = await api.students.getAll();
        setStudents(studentsData);

        // Fetch assessments for recent assessments
        let allAssessments = [];
        if (classesData.length > 0) {
          for (const classObj of classesData) {
            try {
              const assessments = await api.assessments.getByClass(classObj.id);
              if (assessments && assessments.length) {
                // Add class info to assessments
                const assessmentsWithClass = assessments.map((assessment) => ({
                  ...assessment,
                  className: classObj.class_name,
                }));
                allAssessments = [...allAssessments, ...assessmentsWithClass];
              }
            } catch (err) {
              console.error(
                `Error fetching assessments for class ${classObj.id}:`,
                err
              );
            }
          }
        }

        // Sort by due date and get most recent
        allAssessments.sort((a, b) => {
          const dateA = new Date(a.due_date);
          const dateB = new Date(b.due_date);
          return dateB - dateA; // Most recent first
        });

        setRecentAssessments(allAssessments.slice(0, 5));

        // Try to fetch NCCD reports
        try {
          const nccdData = await api.nccdReports.getAll();
          setNccdReports(nccdData.slice(0, 5)); // Get top 5
        } catch (err) {
          console.log("No NCCD reports or error fetching them:", err);
          setNccdReports([]);
        }

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
            value: studentsData.length,
            icon: <PeopleIcon fontSize="large" color="primary" />,
            color: "#e8f5e9", // light green
          },
          {
            label: "Assessments",
            value: allAssessments.length,
            icon: <AssignmentIcon fontSize="large" color="primary" />,
            color: "#fff3e0", // light orange
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
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 4 }}>
        {error}
      </Alert>
    );
  }

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      {/* Header with greeting and teacher info */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
          Welcome back, {user.first_name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's an overview of your teaching information and recent activity
        </Typography>
      </Box>

      {/* Stats cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Paper
              elevation={1}
              sx={{
                p: 3,
                height: "100%",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                backgroundColor: (theme) => 
                  theme.palette.mode === 'dark' 
                    ? theme.palette.background.paper
                    : stat.color,
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 3,
                },
              }}
            >
              <Box sx={{ mr: 2 }}>{stat.icon}</Box>
              <Box>
                <Typography variant="h3" fontWeight="bold">
                  {stat.value}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Main content grid with 3 sections */}
      <Grid container spacing={3}>
        {/* Left Column - Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={1}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              height: "100%",
            }}
          >
            <Box sx={{ p: 2, bgcolor: "primary.main", color: "white" }}>
              <Typography variant="h6">Quick Actions</Typography>
            </Box>
            <List sx={{ p: 0 }}>
              <ListItemButton
                onClick={() => handleNavigate("/ai-assistant")}
                sx={{
                  py: 2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <ListItemIcon>
                  <SmartToyIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="AI Assistant"
                  secondary="Generate personalized learning materials"
                />
                <ArrowForwardIcon fontSize="small" color="action" />
              </ListItemButton>

              <ListItemButton
                onClick={() => handleNavigate("/classes")}
                sx={{
                  py: 2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <ListItemIcon>
                  <SchoolIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Manage Classes"
                  secondary="View and edit your classes"
                />
                <ArrowForwardIcon fontSize="small" color="action" />
              </ListItemButton>

              <ListItemButton
                onClick={() => handleNavigate("/reporting")}
                sx={{
                  py: 2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <ListItemIcon>
                  <DescriptionIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="NCCD Reporting"
                  secondary="Manage disability reports and requirements"
                />
                <ArrowForwardIcon fontSize="small" color="action" />
              </ListItemButton>

              <ListItemButton
                onClick={() => handleNavigate("/analytics")}
                sx={{ 
                  py: 2,
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <ListItemIcon>
                  <BarChartIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Analytics"
                  secondary="View student performance insights"
                />
                <ArrowForwardIcon fontSize="small" color="action" />
              </ListItemButton>
            </List>
          </Paper>
        </Grid>

        {/* Middle Column - Recent Classes */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={1}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                p: 2,
                bgcolor: "primary.main",
                color: "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">Your Classes</Typography>
              <Button
                size="small"
                variant="contained"
                color="secondary"
                onClick={() => handleNavigate("/classes")}
                startIcon={<AddIcon />}
              >
                New
              </Button>
            </Box>

            <List sx={{ p: 0, flexGrow: 1, overflow: "auto" }}>
              {classes.length > 0 ? (
                classes.map((classItem) => (
                  <ListItemButton
                    key={classItem.id}
                    onClick={() =>
                      handleNavigate(`/classes/${classItem.id}/students`)
                    }
                    sx={{
                      py: 2,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      transition: "background-color 0.2s",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <Avatar
                      sx={{
                        mr: 2,
                        bgcolor: "primary.light",
                      }}
                    >
                      {classItem.class_name.charAt(0)}
                    </Avatar>
                    <ListItemText
                      primary={classItem.class_name}
                      secondary={`${classItem.students?.length || 0} students`}
                    />
                    <ArrowForwardIcon fontSize="small" color="action" />
                  </ListItemButton>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary="No classes yet"
                    secondary="Click the New button to create your first class"
                  />
                </ListItem>
              )}
            </List>

            <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleNavigate("/classes")}
              >
                View All Classes
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column - Recent Assessments */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={1}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ p: 2, bgcolor: "primary.main", color: "white" }}>
              <Typography variant="h6">Recent Assessments</Typography>
            </Box>

            <List sx={{ p: 0, flexGrow: 1, overflow: "auto" }}>
              {recentAssessments.length > 0 ? (
                recentAssessments.map((assessment) => (
                  <ListItem
                    key={assessment.id}
                    sx={{
                      py: 2,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <ListItemIcon>
                      <AssessmentIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={assessment.title}
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            {assessment.className} •
                          </Typography>
                          <Typography
                            variant="body2"
                            component="span"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mt: 0.5,
                            }}
                          >
                            <AccessTimeIcon
                              fontSize="small"
                              sx={{ mr: 0.5, fontSize: "1rem" }}
                            />
                            Due: {formatDate(assessment.due_date)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary="No assessments yet"
                    secondary="Assessments you create will appear here"
                  />
                </ListItem>
              )}
            </List>

            {classes.length > 0 && (
              <Box
                sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleNavigate("/classes")}
                >
                  Manage Assessments
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Full Width - NCCD Reports Summary */}
        <Grid item xs={12}>
          <Paper
            elevation={1}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              mt: 2,
            }}
          >
            <Box
              sx={{
                p: 2,
                bgcolor: "primary.main",
                color: "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">NCCD Reports Summary</Typography>
              <Button
                size="small"
                variant="contained"
                color="secondary"
                onClick={() => handleNavigate("/reporting")}
              >
                View All
              </Button>
            </Box>

            <Box sx={{ p: 3 }}>
              {nccdReports.length > 0 ? (
                <Grid container spacing={2}>
                  {nccdReports.map((report) => {
                    const student = students.find(
                      (s) => s.id === report.student
                    );
                    return (
                      <Grid item xs={12} md={6} lg={4} key={report.id}>
                        <Card variant="outlined" sx={{ 
                          height: "100%",
                          bgcolor: "background.paper",
                          borderColor: "divider"
                        }}>
                          <CardContent>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                fontWeight="medium"
                              >
                                {student
                                  ? `${student.first_name} ${student.last_name}`
                                  : `Student #${report.student}`}
                              </Typography>
                              <Chip
                                size="small"
                                label={report.status}
                                color={
                                  report.status === "Approved"
                                    ? "success"
                                    : "primary"
                                }
                                variant="outlined"
                              />
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom
                            >
                              <strong>Disability:</strong>{" "}
                              {report.disability_category || "Not specified"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Adjustment Level:</strong>{" "}
                              {report.level_of_adjustment || "Not specified"}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body1" gutterBottom>
                    No NCCD reports have been created yet
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    onClick={() => handleNavigate("/reporting")}
                  >
                    Create Your First Report
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default Dashboard;
