/**
 * @fileoverview A multi-step form component for creating and setting up a new class
 * 
 * @module ClassCreationStepper
 */

import React, { useState, useRef, useContext } from "react";
import { useTheme } from "@mui/material/styles";

// Context and Services
import { SnackbarContext } from "../../../contexts/SnackbarContext";
import api from "../../../services/api";
import { API_BASE_URL } from "../../../services/config";

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
import Stack from "@mui/material/Stack";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";

// MUI Icons
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SchoolIcon from "@mui/icons-material/School";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DescriptionIcon from "@mui/icons-material/Description";

// Constants
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

// Custom Hooks
const useClassCreation = (onSuccess, onClose) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [classData, setClassData] = useState({ class_name: "", year_level: "" });
  const [createdClassId, setCreatedClassId] = useState(null);
  const { showSnackbar } = useContext(SnackbarContext);

  const handleClassDataChange = (e) => {
    const { name, value } = e.target;
    setClassData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
    setError(null);
  };

  const handleSkip = () => {
    if (activeStep === 1) {
      setActiveStep(2);
    } else if (activeStep === 2) {
      completeProcess();
      onClose();
    }
  };

  const completeProcess = () => {
    setLoading(false);
    localStorage.removeItem("temp_created_class_id");
    showSnackbar("Class setup completed successfully", "success");
    if (onSuccess && createdClassId) {
      onSuccess(createdClassId);
    }
  };

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

const useFileUpload = () => {
  const [studentFile, setStudentFile] = useState(null);
  const [unitPlanFile, setUnitPlanFile] = useState(null);
  const [unitPlanTitle, setUnitPlanTitle] = useState("");
  const [unitPlanDescription, setUnitPlanDescription] = useState("");
  const studentFileInputRef = useRef(null);
  const unitPlanFileInputRef = useRef(null);

  const handleStudentFileChange = (e) => {
    if (e.target.files.length > 0) {
      setStudentFile(e.target.files[0]);
    }
  };

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

// UI Components
const FileUploadZone = ({ file, onClick, icon, title, subtitle }) => {
  const theme = useTheme();
  
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        textAlign: "center",
        cursor: "pointer",
        borderStyle: "solid",
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

// Main Component
const ClassCreationStepper = ({ open, onClose, onSuccess }) => {
  const { showSnackbar } = useContext(SnackbarContext);

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
  } = useFileUpload();

  const handleNext = async () => {
    setError(null);
    setLoading(true);

    try {
      if (activeStep === 0) {
        await handleClassCreation();
      } else if (activeStep === 1) {
        await handleStudentUpload();
      } else if (activeStep === 2) {
        await handleUnitPlanUpload();
        onClose();
      }
    } catch (error) {
      console.error("Error in step process:", error);
      setError(error.message || "An error occurred");
      setLoading(false);
    }
  };

  const handleClassCreation = async () => {
        if (!classData.class_name) {
          setError("Class name is required");
          setLoading(false);
          return;
        }

        if (!createdClassId) {
          try {
            const result = await api.classes.create(classData);
        const classId = extractClassId(result);

            if (!classId) {
              throw new Error("Failed to get class ID from server response");
            }

            setCreatedClassId(classId);
            localStorage.setItem("temp_created_class_id", classId);
            showSnackbar("Class created successfully", "success");
          } catch (error) {
            console.error("Error creating class:", error);
            setError(error.message || "Failed to create class");
            setLoading(false);
            return;
          }
        }

        setActiveStep(1);
        setLoading(false);
  };

  const handleStudentUpload = async () => {
    const classId = getClassId();
        if (!classId) {
      setError("Missing class ID. Please go back and create a class first.");
          setLoading(false);
          return;
        }

        if (studentFile) {
      try {
          const formData = new FormData();
          formData.append("file", studentFile);
          formData.append("class_id", classId);
            await api.classes.uploadStudentCSV(formData);
            showSnackbar("Students uploaded successfully", "success");
          } catch (error) {
            console.error("Error uploading students:", error);
            setError(error.message || "Failed to upload students");
            setLoading(false);
            return;
          }
        }

        setActiveStep(2);
    setLoading(false);
  };

  const handleUnitPlanUpload = async () => {
    const classId = getClassId();
    if (!classId) {
      setError("Missing class ID. Class creation may have failed. Please restart the process.");
      setLoading(false);
      return;
    }

    if (unitPlanFile) {
      try {
        await uploadUnitPlan(classId);
      } catch (error) {
        console.error("Error uploading unit plan:", error);
        setError(error.message || "Failed to upload unit plan");
        setLoading(false);
        return;
      }
    }

    completeProcess();
  };

  const getClassId = () => {
        let classId = createdClassId;
        if (!classId) {
          classId = localStorage.getItem("temp_created_class_id");
          if (classId) {
            setCreatedClassId(parseInt(classId, 10));
          }
        }
    return classId;
  };

  const uploadUnitPlan = async (classId) => {
            const formData = new FormData();
            formData.append("document", unitPlanFile);
    formData.append("class_instance", String(classId));
            formData.append("title", unitPlanTitle || "Unit Plan");
            formData.append("description", unitPlanDescription || "");
            formData.append("from_creation_flow", "true");

    try {
              await api.unitPlans.create(formData);
              showSnackbar("Unit plan uploaded successfully", "success");
            } catch (apiError) {
      await handleUnitPlanUploadFallback(formData, apiError);
    }
  };

  const handleUnitPlanUploadFallback = async (formData, apiError) => {
              try {
                const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/api/unit-plans/unitplans/`, {
                    method: "POST",
        headers: { Authorization: `Bearer ${token}` },
                    body: formData,
      });

                if (!response.ok) {
                  const errorText = await response.text();
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
                }

                showSnackbar("Unit plan uploaded successfully", "success");
              } catch (fetchError) {
      throw new Error(`Failed to upload unit plan: ${fetchError.message || apiError.message}`);
    }
  };

  const handleClose = () => {
    if (loading) return;

    if (createdClassId && activeStep < STEPS.length - 1) {
      if (window.confirm("Are you sure you want to exit? Your class has been created but setup is incomplete.")) {
        resetAndClose();
      }
    } else {
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    resetState();
    setStudentFile(null);
    setUnitPlanFile(null);
    setUnitPlanTitle("");
    setUnitPlanDescription("");
    onClose();
  };

  const extractClassId = (result) => {
    if (result?.class_id) return result.class_id;
    if (result?.id) return result.id;
    if (result?.data?.id) return result.data.id;
    if (result?.class_data?.id) return result.class_data.id;
    
    const possibleIds = ["id", "class_id", "classId", "pk"];
    for (const idField of possibleIds) {
      if (result?.[idField]) return result[idField];
    }
    
    return null;
  };

  const renderStepContent = (index) => {
    switch (index) {
      case 0:
  return (
                  <Box>
                    <Grid container spacing={2}>
                      <Grid size={12}>
                        <TextField
                          name="class_name"
                          label="Class Name"
                          variant="outlined"
                          fullWidth
                          required
                          value={classData.class_name}
                          onChange={handleClassDataChange}
                          error={error && !classData.class_name}
                          helperText={
                            error && !classData.class_name
                              ? "Class name is required"
                              : ""
                          }
                        />
                      </Grid>
                      <Grid size={12}>
                        <TextField
                          name="year_level"
                          label="Grade"
                          variant="outlined"
                          fullWidth
                          value={classData.year_level}
                          onChange={handleClassDataChange}
                          placeholder="e.g. 10"
                        />
                      </Grid>
                    </Grid>
                  </Box>
        );
      case 1:
        return (
                  <Box>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      A CSV file containing this information may be download
                      from OneSchool {'  >  '} Classes {'  >  '} Students.
                    </Alert>
            <FileUploadZone
              file={studentFile}
                      onClick={() => studentFileInputRef.current.click()}
              icon={<CloudUploadIcon sx={{ fontSize: 48, mb: 1, color: "action.active" }} />}
              title="Click to upload student roster"
              subtitle="CSV file containing student information"
            />
                    <input
                      type="file"
                      hidden
                      accept=".csv"
                      ref={studentFileInputRef}
                      onChange={handleStudentFileChange}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 2, display: "block" }}
                    >
                      * CSV should have columns: first_name, last_name,
                      year_level, student_email (optional), disability_info
                      (optional)
                    </Typography>
                  </Box>
        );
      case 2:
        return (
                  <Box>
                    <Grid container spacing={2}>
                      <Grid size={12}>
                        <TextField
                          name="unit_plan_title"
                          label="Unit Plan Title"
                          variant="outlined"
                          fullWidth
                          value={unitPlanTitle}
                          onChange={(e) => setUnitPlanTitle(e.target.value)}
                          placeholder="e.g. Term 3 Science Curriculum"
                        />
                      </Grid>
                      <Grid size={12}>
                        <TextField
                          name="unit_plan_description"
                          label="Description (Optional)"
                          variant="outlined"
                          fullWidth
                          multiline
                          rows={2}
                          value={unitPlanDescription}
                  onChange={(e) => setUnitPlanDescription(e.target.value)}
                        />
                      </Grid>
                      <Grid size={12}>
                <FileUploadZone
                  file={unitPlanFile}
                          onClick={() => unitPlanFileInputRef.current.click()}
                  icon={<UploadFileIcon sx={{ fontSize: 48, mb: 1, color: "action.active" }} />}
                  title="Click to upload unit plan document"
                  subtitle="Word, PDF, or Excel document"
                />
                        <input
                          type="file"
                          hidden
                          accept=".pdf,.docx,.doc,.xlsx,.xls"
                          ref={unitPlanFileInputRef}
                          onChange={handleUnitPlanFileChange}
                        />
                      </Grid>
                    </Grid>
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
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          bgcolor: "background.paper",
          borderRadius: 2,
        },
      }}
    >
      <DialogContent>
        <Stepper activeStep={activeStep} orientation="vertical" sx={{ mt: 1 }}>
          {STEPS.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                StepIcon={({ active }) => (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: active ? "primary.main" : "text.disabled",
                    }}
                  >
                    {step.icon}
                  </Box>
                )}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight={index === activeStep ? "bold" : "normal"}
                >
                  {step.label}
                  {step.optional && (
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                    >
                      {" "}
                      (Optional)
                    </Typography>
                  )}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {step.description}
                </Typography>
              </StepLabel>
              <StepContent>
                {renderStepContent(index)}

                {error && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: "error.main",
                      mt: 2,
                    }}
                  >
                    <ErrorIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">{error}</Typography>
                  </Box>
                )}

                {loading && (
                  <Box sx={{ width: "100%", mt: 2 }}>
                    <LinearProgress />
                  </Box>
                )}

                <Box sx={{ mb: 2, mt: 2 }}>
                  <Stack direction="row" spacing={1}>
                    <Button
                      disabled={index === 0 || loading}
                      onClick={handleBack}
                      variant="outlined"
                    >
                      Back
                    </Button>

                    {step.optional && (
                      <Button
                        onClick={handleSkip}
                        disabled={loading}
                        variant="text"
                      >
                        Skip
                      </Button>
                    )}

                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={loading || (index === 0 && !classData.class_name)}
                    >
                      {index === STEPS.length - 1 ? "Finish" : "Continue"}
                    </Button>
                  </Stack>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>
    </Dialog>
  );
};

export default ClassCreationStepper;
