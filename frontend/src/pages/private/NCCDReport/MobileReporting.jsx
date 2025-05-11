import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { SnackbarContext } from "../../../contexts/SnackbarContext";
import api from "../../../services/api";

// MUI Components
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";

const MobileReportingPage = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useContext(SnackbarContext);

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [reportsQueue, setReportsQueue] = useState([]);
  const [currentReportIndex, setCurrentReportIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reportingComplete, setReportingComplete] = useState(false);

  // Fetch teacher's classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await api.classes.getAll();
        setClasses(data);
      } catch (err) {
        showSnackbar("Failed to fetch classes", "error");
      }
    };

    fetchClasses();
  }, [showSnackbar]);

  const handleStartReporting = async () => {
    if (!selectedClassId) {
      setError("Please select a class first");
      return;
    }
  
    try {
      setLoading(true);
      const ensuredReports = await api.nccdReports.ensureReportsForClass(selectedClassId);
  
      // filter out students who don't have a diagnosed disability
      const filteredReports = ensuredReports.filter(r => r.has_diagonsed_disability);
  
      if (filteredReports.length === 0) {
        showSnackbar("No students with diagnosed disabilities in this class.", "info");
      }
  
      setReportsQueue(filteredReports);
      setCurrentReportIndex(0);
      setReportingComplete(filteredReports.length === 0); // mark complete if no students left
      setError("");
    } catch (err) {
      showSnackbar("Failed to initialize reports: " + (err.message || ""), "error");
    } finally {
      setLoading(false);
    }
  };
  

  const handleRecordEffectiveness = async (wasEffective) => {
    const currentReport = reportsQueue[currentReportIndex];
    if (!currentReport) return;

    try {
      setSubmitting(true);
      await api.nccdReports.createLessonEffectiveness(currentReport.id, { was_effective: wasEffective });
      showSnackbar(`Recorded ${wasEffective === "true" ? "Effective" : "Not Effective"} for student`, "success");

      if (currentReportIndex + 1 < reportsQueue.length) {
        setCurrentReportIndex(currentReportIndex + 1);
      } else {
        showSnackbar("Reporting complete for all students!", "success");
        setReportingComplete(true);
      }
    } catch (err) {
      showSnackbar("Failed to record effectiveness: " + (err.message || ""), "error");
    } finally {
      setSubmitting(false);
    }
  };

  // 🔥 Find current student name
  const currentStudentName = (() => {
    const currentReport = reportsQueue[currentReportIndex];
    if (!currentReport) return "";

    // Find the class object containing the student
    const classObj = classes.find((cls) => cls.id === parseInt(selectedClassId));
    if (!classObj || !classObj.students) return `Student #${currentReport.student}`;

    const studentObj = classObj.students.find((s) => s.id === currentReport.student);
    if (studentObj) return `${studentObj.first_name} ${studentObj.last_name}`;

    return `Student #${currentReport.student}`;
  })();

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        Mobile Reporting
      </Typography>

      {/* Done state */}
      {reportingComplete && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Reporting complete for all students!
        </Alert>
      )}

      {/* Step 1: Class selection */}
      {!reportingComplete && reportsQueue.length === 0 && (
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <Typography>Select a Class:</Typography>
          <Select
            fullWidth
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            displayEmpty
            sx={{ mt: 1 }}
          >
            <MenuItem value="" disabled>Select class</MenuItem>
            {classes.map((cls) => (
              <MenuItem key={cls.id} value={cls.id}>
                {cls.class_name} ({cls.year_level || "No subject"})
              </MenuItem>
            ))}
          </Select>

          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleStartReporting}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Start Reporting"}
          </Button>

          {error && <Alert severity="warning" sx={{ mt: 2 }}>{error}</Alert>}
        </Paper>
      )}

      {/* Step 2: Reporting UI */}
      {!reportingComplete && reportsQueue.length > 0 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Student {currentReportIndex + 1} of {reportsQueue.length}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Student: {currentStudentName}
          </Typography>

          <Button
            variant="contained"
            color="success"
            fullWidth
            sx={{ mb: 2 }}
            disabled={submitting}
            onClick={() => handleRecordEffectiveness("true")}
          >
            YES - Effective
          </Button>

          <Button
            variant="contained"
            color="error"
            fullWidth
            disabled={submitting}
            onClick={() => handleRecordEffectiveness("false")}
          >
            NO - Not Effective
          </Button>

          <Typography variant="caption" display="block" sx={{ mt: 2 }}>
            Progress: {currentReportIndex + 1}/{reportsQueue.length}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default MobileReportingPage;
