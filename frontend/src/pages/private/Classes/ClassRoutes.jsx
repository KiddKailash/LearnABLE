import React, { useState, useEffect, useContext } from "react";
import {
  useParams,
  useSearchParams,
  Link as RouterLink,
} from "react-router-dom";

// Pages
import StudentListPage from "./StudentList";
import TailorContent from "./ClassContent";

// Services
import api from "../../../services/api";

// Contexts
import { SnackbarContext } from "../../../contexts/SnackbarContext";

// MUI Components
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";

// MUI Icons
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

const LoadingState = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "400px",
      gap: 2,
    }}
  >
    <CircularProgress size={60} />
    <Typography variant="h6" color="text.secondary">
      Loading class information...
    </Typography>
  </Box>
);

const ClassRoutes = () => {
  const { classId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "content";
  const { showSnackbar } = useContext(SnackbarContext);

  // State for class and student data
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch class data
  const fetchClassData = async () => {
    try {
      const response = await api.classes.getById(classId);
      console.log("Class Data: ", response);
      setClassData(response);
    } catch (error) {
      console.error("Error fetching class data:", error);
      setError("Failed to load class information");
      showSnackbar("Failed to load class information", "error");
    }
  };

  // Fetch students data
  const fetchStudents = async () => {
    try {
      const response = await api.students.getAllByClassId(classId);
      setStudents(response.students || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      setError("Failed to load students");
      showSnackbar("Failed to load students", "error");
    }
  };

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchClassData(), fetchStudents()]);
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const handleTabChange = (event, newValue) => {
    setSearchParams({ mode: newValue });
  };

  if (loading) {
    return (
      <Box sx={{ width: "100%" }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          <Link
            component={RouterLink}
            to="/dashboard"
            underline="none"
            color="inherit"
            sx={{ display: "flex", alignItems: "center" }}
          >
            Dashboard
          </Link>
          <Link
            component={RouterLink}
            to="/classes"
            underline="none"
            color="inherit"
            sx={{ display: "flex", alignItems: "center" }}
          >
            Classes
          </Link>
          <Typography
            color="text.primary"
            sx={{ display: "flex", alignItems: "center" }}
          >
            Loading...
          </Typography>
        </Breadcrumbs>
        <Paper elevation={0} sx={{ p: 3 }}>
          <LoadingState />
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: "100%" }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          <Link
            component={RouterLink}
            to="/dashboard"
            underline="none"
            color="inherit"
            sx={{ display: "flex", alignItems: "center" }}
          >
            Dashboard
          </Link>
          <Link
            component={RouterLink}
            to="/classes"
            underline="none"
            color="inherit"
            sx={{ display: "flex", alignItems: "center" }}
          >
            Classes
          </Link>
          <Typography
            color="error"
            sx={{ display: "flex", alignItems: "center" }}
          >
            Error
          </Typography>
        </Breadcrumbs>
        <Paper elevation={0} sx={{ p: 3 }}>
          <Typography color="error" variant="h6" align="center">
            {error}
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button
              variant="contained"
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchClassData();
                fetchStudents();
              }}
            >
              Retry
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        <Link
          component={RouterLink}
          to="/dashboard"
          underline="none"
          color="inherit"
          sx={{ display: "flex", alignItems: "center" }}
        >
          Dashboard
        </Link>
        <Link
          component={RouterLink}
          to="/classes"
          underline="none"
          color="inherit"
          sx={{ display: "flex", alignItems: "center" }}
        >
          Classes
        </Link>
        <Typography
          color="text.primary"
          sx={{ display: "flex", alignItems: "center" }}
        >
          {classData?.class_name || `Class #${classId}`}
        </Typography>
      </Breadcrumbs>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={mode} onChange={handleTabChange}>
          <Tab value="content" label="Learning Materials" />
          <Tab value="students" label="Students" />
        </Tabs>
      </Box>

      {mode === "content" ? (
        <TailorContent 
          classData={classData}
          students={students}
          onStudentsUpdate={fetchStudents}
        />
      ) : (
        <StudentListPage 
          classData={classData}
          students={students}
          onStudentsUpdate={fetchStudents}
        />
      )}
    </Box>
  );
};

export default ClassRoutes;
