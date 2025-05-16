/**
 * @file ClassCreationStepper.jsx
 * @description A multi-step form component for creating and setting up a new class in LearnABLE.
 * This component guides users through the process of creating a class, adding students,
 * and uploading unit plans. It uses a stepper interface to break down the process into
 * manageable steps and provides optional steps for additional setup.
 * 
 */

import React, { useState, useRef, useContext } from "react";
import { useTheme } from "@mui/material/styles";

// Context and Services
import { SnackbarContext } from "../../../contexts/SnackbarContext";
import api from "../../../services/api";

// MUI Components
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

// MUI Icons
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SchoolIcon from "@mui/icons-material/School";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DescriptionIcon from "@mui/icons-material/Description";

/**
 * Step definitions for the class creation process
 * Each step includes a label, description, icon, and optional flag
 */
const STEPS = [
  {
    label: "Create Class",
    description: "Enter basic class information",
    icon: <SchoolIcon />,
  },
  {
    label: "Add Students",
    description: "Upload student roster",
    icon: <GroupAddIcon />,
    optional: true,
  },
  {
    label: "Upload Unit Plan",
    description: "Add semester/unit plan document",
    icon: <DescriptionIcon />,
    optional: true,
  },
];

/**
 * Custom hook for managing class creation state and operations
 * @param {Function} onSuccess - Callback function when class creation is successful
 * @param {Function} onClose - Callback function when the dialog is closed
 * @returns {Object} Class creation state and handlers
 */
const useClassCreation = (onSuccess, onClose) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [classData, setClassData] = useState({ class_name: "", year_level: "" });
  const [createdClassId, setCreatedClassId] = useState(null);
  const { showSnackbar } = useContext(SnackbarContext);

  /**
   * Handles changes to class data input fields
   * @param {Event} e - The input change event
   */
  const handleClassDataChange = (e) => {
    const { name, value } = e.target;
    setClassData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Moves to the previous step in the stepper
   */
  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
    setError(null);
  };

  /**
   * Skips the current step if it's optional
   */
  const handleSkip = () => {
    if (activeStep === 1) {
      setActiveStep(2);
    } else if (activeStep === 2) {
      completeProcess();
      onClose();
    }
  };

  /**
   * Completes the class creation process
   * Cleans up temporary data and triggers success callback
   */
  const completeProcess = () => {
    setLoading(false);
    localStorage.removeItem("temp_created_class_id");
    showSnackbar("Class setup completed successfully", "success");
    if (onSuccess && createdClassId) {
      onSuccess(createdClassId);
    }
  };

  /**
   * Resets all state to initial values
   */
  const resetState = () => {
    setActiveStep(0);
    setClassData({ class_name: "", year_level: "" });
    setCreatedClassId(null);
    setError(null);
    setLoading(false);
  };

  return {
    activeStep,
    setActiveStep,
    loading,
    setLoading,
    error,
    setError,
    classData,
    createdClassId,
    setCreatedClassId,
    handleClassDataChange,
    handleBack,
    handleSkip,
    completeProcess,
    resetState,
  };
};

/**
 * Custom hook for managing file upload state and operations
 * @returns {Object} File upload state and handlers
 */
const useFileUpload = () => {
  const [studentFile, setStudentFile] = useState(null);
  const [unitPlanFile, setUnitPlanFile] = useState(null);
  const [unitPlanTitle, setUnitPlanTitle] = useState("");
  const [unitPlanDescription, setUnitPlanDescription] = useState("");
  const studentFileInputRef = useRef(null);
  const unitPlanFileInputRef = useRef(null);

  /**
   * Handles student file selection
   * @param {Event} e - The file input change event
   */
  const handleStudentFileChange = (e) => {
    if (e.target.files.length > 0) {
      setStudentFile(e.target.files[0]);
    }
  };

  /**
   * Handles unit plan file selection
   * @param {Event} e - The file input change event
   */
  const handleUnitPlanFileChange = (e) => {
    if (e.target.files.length > 0) {
      setUnitPlanFile(e.target.files[0]);
    }
  };

  return {
    studentFile,
    setStudentFile,
    unitPlanFile,
    setUnitPlanFile,
    unitPlanTitle,
    setUnitPlanTitle,
    unitPlanDescription,
    setUnitPlanDescription,
    studentFileInputRef,
    unitPlanFileInputRef,
    handleStudentFileChange,
    handleUnitPlanFileChange,
  };
};

/**
 * File upload zone component for drag and drop functionality
 * @param {Object} props - Component props
 * @param {File} props.file - The currently selected file
 * @param {Function} props.onClick - Click handler for the upload zone
 * @param {React.ReactNode} props.icon - Icon to display
 * @param {string} props.title - Title text for the upload zone
 * @param {string} props.subtitle - Subtitle text for the upload zone
 * @returns {JSX.Element} The file upload zone interface
 */
const FileUploadZone = ({ file, onClick, icon, title, subtitle }) => {
  const theme = useTheme();
  
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        textAlign: "center",
        cursor: "pointer",
        borderStyle: "dashed",
        borderRadius: 2,
        borderColor: file ? "success.main" : "divider",
        bgcolor: file
          ? theme.palette.mode === "dark"
            ? "rgba(76, 175, 80, 0.1)"
            : "rgba(76, 175, 80, 0.05)"
          : "background.paper",
        "&:hover": {
          bgcolor:
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.02)",
        },
      }}
      onClick={onClick}
    >
      {file ? (
        <Box sx={{ color: "success.main", py: 1 }}>
          <CheckCircleIcon sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="body1" gutterBottom>
            {file.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {(file.size / 1024).toFixed(2)} KB - Click to change file
          </Typography>
        </Box>
      ) : (
        <Box sx={{ py: 1 }}>
          {icon}
          <Typography variant="body1" gutterBottom>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

/**
 * Main class creation stepper component
 * @param {Object} props - Component props
 * @param {boolean} props.open - Controls dialog visibility
 * @param {Function} props.onClose - Callback when dialog is closed
 * @param {Function} props.onSuccess - Callback when class creation is successful
 * @returns {JSX.Element} The class creation stepper interface
 */
const ClassCreationStepper = ({ open, onClose, onSuccess }) => {
  const { showSnackbar } = useContext(SnackbarContext);

  // Use custom hooks for state management
  const {
    activeStep,
    setActiveStep,
    loading,
    setLoading,
    error,
    setError,
    classData,
    createdClassId,
    setCreatedClassId,
    handleClassDataChange,
    handleBack,
    handleSkip,
    completeProcess,
    resetState,
  } = useClassCreation(onSuccess, onClose);

  const {
    studentFile,
    unitPlanFile,
    unitPlanTitle,
    setUnitPlanTitle,
    unitPlanDescription,
    setUnitPlanDescription,
    studentFileInputRef,
    unitPlanFileInputRef,
    handleStudentFileChange,
    handleUnitPlanFileChange,
  } = useFileUpload();

  /**
   * Handles the next step in the class creation process
   * Validates current step and proceeds to the next step or completes the process
   */
  const handleNext = async () => {
    setError(null);

    try {
      if (activeStep === 0) {
        // Validate class creation step
        if (!classData.class_name.trim()) {
          setError("Class name is required");
          return;
        }
        if (!classData.year_level.trim()) {
          setError("Year level is required");
          return;
        }

        setLoading(true);
        const response = await api.post("/classes", classData);
        setCreatedClassId(response.data.id);
        localStorage.setItem("temp_created_class_id", response.data.id);
        showSnackbar("Class created successfully", "success");
        setActiveStep(1);
      } else if (activeStep === 1 && studentFile) {
        // Handle student upload step
        setLoading(true);
        const formData = new FormData();
        formData.append("file", studentFile);

        await api.post(`/classes/${createdClassId}/students/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        showSnackbar("Students uploaded successfully", "success");
        setActiveStep(2);
      } else if (activeStep === 2 && unitPlanFile) {
        // Handle unit plan upload step
        setLoading(true);
        const formData = new FormData();
        formData.append("file", unitPlanFile);
        formData.append("title", unitPlanTitle);
        formData.append("description", unitPlanDescription);

        await api.post(`/classes/${createdClassId}/unit-plan`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        showSnackbar("Unit plan uploaded successfully", "success");
        completeProcess();
        onClose();
      } else {
        // Move to next step if no file upload is required
        setActiveStep((prev) => prev + 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
      showSnackbar("Error: " + (err.response?.data?.message || "An error occurred"), "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles dialog close event
   * Resets state and triggers onClose callback
   */
  const handleClose = () => {
    resetState();
    onClose();
  };

  /**
   * Renders the content for each step in the stepper
   * @param {number} step - The current step index
   * @returns {JSX.Element} The step content
   */
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Class Name"
                  name="class_name"
                  value={classData.class_name}
                  onChange={handleClassDataChange}
                  error={!!error && !classData.class_name.trim()}
                  helperText={!classData.class_name.trim() && error ? error : ""}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Year Level"
                  name="year_level"
                  value={classData.year_level}
                  onChange={handleClassDataChange}
                  error={!!error && !classData.year_level.trim()}
                  helperText={!classData.year_level.trim() && error ? error : ""}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <input
              type="file"
              accept=".csv"
              onChange={handleStudentFileChange}
              style={{ display: "none" }}
              ref={studentFileInputRef}
            />
            <FileUploadZone
              file={studentFile}
              onClick={() => studentFileInputRef.current?.click()}
              icon={<CloudUploadIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />}
              title="Upload Student Roster"
              subtitle="Click to upload or drag and drop a CSV file"
            />
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleUnitPlanFileChange}
              style={{ display: "none" }}
              ref={unitPlanFileInputRef}
            />
            <FileUploadZone
              file={unitPlanFile}
              onClick={() => unitPlanFileInputRef.current?.click()}
              icon={<UploadFileIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />}
              title="Upload Unit Plan"
              subtitle="Click to upload or drag and drop a document (PDF, DOC, DOCX)"
            />
            {unitPlanFile && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Document Title"
                  value={unitPlanTitle}
                  onChange={(e) => setUnitPlanTitle(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={unitPlanDescription}
                  onChange={(e) => setUnitPlanDescription(e.target.value)}
                />
              </Box>
            )}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: "80vh",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogContent>
        <Box sx={{ maxWidth: 800, mx: "auto", py: 2 }}>
          <Typography variant="h5" gutterBottom>
            Create New Class
          </Typography>
          <Stepper activeStep={activeStep} orientation="vertical">
            {STEPS.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  StepIconComponent={() => step.icon}
                  optional={step.optional ? <Typography variant="caption">Optional</Typography> : null}
                >
                  {step.label}
                </StepLabel>
                <StepContent>
                  <Typography color="text.secondary" paragraph>
                    {step.description}
                  </Typography>
                  {getStepContent(index)}
                  <Box sx={{ mb: 2, mt: 3 }}>
                    <div>
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        disabled={loading}
                        sx={{ mr: 1 }}
                      >
                        {loading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : activeStep === STEPS.length - 1 ? (
                          "Finish"
                        ) : (
                          "Continue"
                        )}
                      </Button>
                      <Button
                        onClick={handleBack}
                        disabled={loading || activeStep === 0}
                        sx={{ mr: 1 }}
                      >
                        Back
                      </Button>
                      {step.optional && (
                        <Button
                          onClick={handleSkip}
                          disabled={loading}
                          color="inherit"
                        >
                          Skip
                        </Button>
                      )}
                    </div>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ClassCreationStepper;
