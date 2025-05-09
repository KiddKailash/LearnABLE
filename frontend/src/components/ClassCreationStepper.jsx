import React, { useState, useRef, useContext } from "react";
import { useTheme } from "@mui/material/styles";

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
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import LinearProgress from "@mui/material/LinearProgress";

// MUI Icons
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SchoolIcon from "@mui/icons-material/School";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DescriptionIcon from "@mui/icons-material/Description";

import { SnackbarContext } from "../contexts/SnackbarContext";
import api from "../services/api";
import { API_BASE_URL } from "../services/config";

// Steps in the creation process
const steps = [
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

const ClassCreationStepper = ({ open, onClose, onSuccess }) => {
  const theme = useTheme();
  const { showSnackbar } = useContext(SnackbarContext);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  // Class data
  const [classData, setClassData] = useState({
    class_name: "",
    year_level: "",
  });

  // Reference to file inputs
  const studentFileInputRef = useRef(null);
  const unitPlanFileInputRef = useRef(null);

  // File state
  const [studentFile, setStudentFile] = useState(null);
  const [unitPlanFile, setUnitPlanFile] = useState(null);
  const [unitPlanTitle, setUnitPlanTitle] = useState("");
  const [unitPlanDescription, setUnitPlanDescription] = useState("");

  // Newly created class id
  const [createdClassId, setCreatedClassId] = useState(null);

  // Handle class form change
  const handleClassDataChange = (e) => {
    const { name, value } = e.target;
    setClassData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle student file selection
  const handleStudentFileChange = (e) => {
    if (e.target.files.length > 0) {
      setStudentFile(e.target.files[0]);
    }
  };

  // Handle unit plan file selection
  const handleUnitPlanFileChange = (e) => {
    if (e.target.files.length > 0) {
      setUnitPlanFile(e.target.files[0]);
    }
  };

  // Handle going back to the previous step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => Math.max(prevActiveStep - 1, 0));
    setError(null);
  };

  // Handle next step
  const handleNext = async () => {
    setError(null);
    setLoading(true);

    try {
      // Step 1: Create class
      if (activeStep === 0) {
        // Always check for class name
        if (!classData.class_name) {
          setError("Class name is required");
          setLoading(false);
          return;
        }

        // Create the class if it hasn't been created yet
        if (!createdClassId) {
          console.log("Creating new class:", classData);
          
          try {
            const result = await api.classes.create(classData);
            console.log("Class creation response:", result);
            
            // Check for various ways the ID might be returned
            let classId = null;
            
            // The backend specifically returns class_id at the top level
            if (result && result.class_id) {
              classId = result.class_id;
              console.log("Found class_id in response:", classId);
            } 
            // Fallback checks for other formats
            else if (result && result.id) {
              classId = result.id;
            } else if (result && result.data && result.data.id) {
              classId = result.data.id;
            } else if (result && result.class_data && result.class_data.id) {
              classId = result.class_data.id;
              console.log("Found ID in class_data:", classId);
            } else if (typeof result === 'object') {
              // Try to find any property that looks like an ID
              const possibleIds = ['id', 'class_id', 'classId', 'pk'];
              for (const idField of possibleIds) {
                if (result[idField]) {
                  classId = result[idField];
                  console.log(`Found class ID in field: ${idField}`);
                  break;
                }
              }
            }
            
            if (!classId) {
              console.error("Could not find class ID in response:", result);
              throw new Error("Failed to get class ID from server response");
            }
            
            console.log("Class created with ID:", classId);
            
            // Immediately save the ID
            setCreatedClassId(classId);
            
            // Store in localStorage as backup
            localStorage.setItem('temp_created_class_id', classId);
            
            showSnackbar("Class created successfully", "success");
          } catch (error) {
            console.error("Error creating class:", error);
            setError(error.message || "Failed to create class");
            setLoading(false);
            return;
          }
        } else {
          console.log("Using existing class ID:", createdClassId);
        }

        // Move to next step only after successful class creation
        setActiveStep(1);
        setLoading(false);
        return;
      }

      // Step 2: Upload students (optional)
      if (activeStep === 1) {
        // Try to get class ID from state or localStorage
        let classId = createdClassId;
        if (!classId) {
          classId = localStorage.getItem('temp_created_class_id');
          if (classId) {
            console.log("Retrieved class ID from localStorage:", classId);
            setCreatedClassId(parseInt(classId, 10));
          }
        }
        
        // Verify we have a class ID before proceeding
        if (!classId) {
          setError("Missing class ID. Please go back and create a class first.");
          setLoading(false);
          return;
        }

        if (studentFile) {
          console.log("Uploading students to class ID:", classId);
          const formData = new FormData();
          formData.append("file", studentFile);
          formData.append("class_id", classId);

          try {
            await api.classes.uploadStudentCSV(formData);
            showSnackbar("Students uploaded successfully", "success");
          } catch (error) {
            console.error("Error uploading students:", error);
            setError(error.message || "Failed to upload students");
            setLoading(false);
            return;
          }
        }

        // Move to next step
        setActiveStep(2);
        setLoading(false);
        return;
      }

      // Step 3: Upload unit plan (optional and final)
      if (activeStep === 2) {
        // Try to get class ID from state or localStorage
        let classId = createdClassId;
        if (!classId) {
          classId = localStorage.getItem('temp_created_class_id');
          if (classId) {
            console.log("Retrieved class ID from localStorage:", classId);
            setCreatedClassId(parseInt(classId, 10));
          }
        }
        
        // Final verification of class ID
        if (!classId) {
          setError("Missing class ID. Class creation may have failed. Please restart the process.");
          setLoading(false);
          return;
        }

        if (unitPlanFile) {
          try {
            console.log('Creating unit plan with class ID:', classId);
            console.log('Unit plan file:', unitPlanFile.name, unitPlanFile.type, unitPlanFile.size);
            
            // Validate the file is accepted type
            const validFileTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                                    'application/msword', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                    'application/vnd.ms-excel'];
            
            if (!validFileTypes.includes(unitPlanFile.type)) {
              console.warn('File type may not be supported:', unitPlanFile.type);
              // Continue anyway, just log the warning
            }
            
            // Create FormData with explicit values
            const formData = new FormData();
            
            // Add file first to ensure it's at the beginning of the form
            formData.append('document', unitPlanFile);
            
            // Ensure class_instance is a string and not undefined
            const classIdString = String(classId);
            formData.append('class_instance', classIdString);
            
            // Add title and description with default values if empty
            formData.append('title', unitPlanTitle || "Unit Plan");
            formData.append('description', unitPlanDescription || "");
            
            // Add from_creation_flow as a string "true" not a boolean to avoid serialization issues
            formData.append('from_creation_flow', 'true');
            
            // Log the form data for debugging
            console.log('Unit plan form data keys:', [...formData.keys()]);
            console.log('Class ID in form:', formData.get('class_instance'));
            console.log('Title in form:', formData.get('title'));
            
            // First try the direct API method
            try {
              console.log('Calling unitPlans.create API...');
              await api.unitPlans.create(formData);
              console.log('Unit plan uploaded successfully through API');
              showSnackbar("Unit plan uploaded successfully", "success");
            } catch (apiError) {
              console.error("Error with unitPlans.create:", apiError);
              
              // Try with a direct HTTP request as fallback
              try {
                console.log('Trying direct HTTP request as fallback...');
                const token = localStorage.getItem('access_token');
                const response = await fetch(`${API_BASE_URL}/api/unit-plans/unitplans/`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`
                  },
                  body: formData
                });
                
                if (!response.ok) {
                  const errorText = await response.text();
                  throw new Error(`HTTP error ${response.status}: ${errorText}`);
                }
                
                console.log('Unit plan uploaded successfully through direct fetch');
                showSnackbar("Unit plan uploaded successfully", "success");
              } catch (fetchError) {
                console.error("Error with direct fetch:", fetchError);
                throw new Error(`Failed to upload unit plan: ${fetchError.message || apiError.message}`);
              }
            }
          } catch (uploadError) {
            console.error("Error uploading unit plan:", uploadError);
            setError(uploadError.message || "Failed to upload unit plan");
            setLoading(false);
            return;
          }
        }
        
        // Only proceed to completion if everything was successful
        completeProcess();
      }
    } catch (error) {
      console.error("Error in step process:", error);
      setError(error.message || "An error occurred");
      setLoading(false);
    }
  };

  // Skip the current optional step
  const handleSkip = () => {
    if (activeStep === 1) {
      // Skip student upload
      setActiveStep(2);
    } else if (activeStep === 2) {
      // Skip unit plan upload (final step)
      completeProcess();
    }
  };

  // Complete the entire process - add cleanup for localStorage
  const completeProcess = () => {
    setLoading(false);

    // Clean up localStorage
    localStorage.removeItem('temp_created_class_id');

    // Show final success message
    showSnackbar("Class setup completed successfully", "success");

    // Trigger success callback with created class ID
    if (onSuccess && createdClassId) {
      onSuccess(createdClassId);
    }

    // Close the modal
    resetAndClose();
  };

  // Reset the form and close the dialog
  const resetAndClose = () => {
    // Reset all form data
    setActiveStep(0);
    setClassData({ class_name: "", year_level: "" });
    setStudentFile(null);
    setUnitPlanFile(null);
    setUnitPlanTitle("");
    setUnitPlanDescription("");
    setCreatedClassId(null);
    setError(null);
    setLoading(false);

    // Close the modal
    onClose();
  };

  // Handle dialog close event
  const handleClose = () => {
    // Don't allow closing while loading
    if (loading) return;

    // If class was already created but process not completed,
    // confirm before closing to avoid orphaned data
    if (createdClassId && activeStep < steps.length - 1) {
      if (
        window.confirm(
          "Are you sure you want to exit? Your class has been created but setup is incomplete."
        )
      ) {
        resetAndClose();
      }
    } else {
      resetAndClose();
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
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                StepIconComponent={() => (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color:
                        index === activeStep ? "primary.main" : "text.disabled",
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
                {/* Step 1: Create Class */}
                {index === 0 && (
                  <Box sx={{ my: 2 }}>
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
                          label="Year Level"
                          variant="outlined"
                          fullWidth
                          value={classData.year_level}
                          onChange={handleClassDataChange}
                          placeholder="e.g. 10"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Step 2: Upload Students */}
                {index === 1 && (
                  <Box sx={{ my: 2 }}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 3,
                        textAlign: "center",
                        cursor: "pointer",
                        borderStyle: "dashed",
                        borderRadius: 2,
                        borderColor: studentFile ? "success.main" : "divider",
                        bgcolor: studentFile
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
                      onClick={() => studentFileInputRef.current.click()}
                    >
                      {studentFile ? (
                        <Box sx={{ color: "success.main", py: 1 }}>
                          <CheckCircleIcon sx={{ fontSize: 48, mb: 1 }} />
                          <Typography variant="body1" gutterBottom>
                            {studentFile.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {(studentFile.size / 1024).toFixed(2)} KB - Click to
                            change file
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ py: 1 }}>
                          <CloudUploadIcon
                            sx={{ fontSize: 48, mb: 1, color: "action.active" }}
                          />
                          <Typography variant="body1" gutterBottom>
                            Click to upload student roster
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            CSV file containing student information
                          </Typography>
                        </Box>
                      )}
                    </Paper>

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
                )}

                {/* Step 3: Upload Unit Plan */}
                {index === 2 && (
                  <Box sx={{ my: 2 }}>
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
                          onChange={(e) =>
                            setUnitPlanDescription(e.target.value)
                          }
                        />
                      </Grid>
                      <Grid size={12}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 3,
                            textAlign: "center",
                            cursor: "pointer",
                            borderStyle: "dashed",
                            borderRadius: 2,
                            borderColor: unitPlanFile
                              ? "success.main"
                              : "divider",
                            bgcolor: unitPlanFile
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
                          onClick={() => unitPlanFileInputRef.current.click()}
                        >
                          {unitPlanFile ? (
                            <Box sx={{ color: "success.main", py: 1 }}>
                              <CheckCircleIcon sx={{ fontSize: 48, mb: 1 }} />
                              <Typography variant="body1" gutterBottom>
                                {unitPlanFile.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {(unitPlanFile.size / 1024).toFixed(2)} KB -
                                Click to change file
                              </Typography>
                            </Box>
                          ) : (
                            <Box sx={{ py: 1 }}>
                              <UploadFileIcon
                                sx={{
                                  fontSize: 48,
                                  mb: 1,
                                  color: "action.active",
                                }}
                              />
                              <Typography variant="body1" gutterBottom>
                                Click to upload unit plan document
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Word, PDF, or Excel document
                              </Typography>
                            </Box>
                          )}
                        </Paper>

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
                )}

                {/* Error message */}
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

                {/* Progress indicator */}
                {loading && (
                  <Box sx={{ width: "100%", mt: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={uploadProgress}
                    />
                  </Box>
                )}

                {/* Navigation buttons */}
                <Box sx={{ mb: 2, mt: 2 }}>
                  <Stack direction="row" spacing={1}>
                    <Button
                      disabled={index === 0 || loading}
                      onClick={handleBack}
                      variant="outlined"
                    >
                      Back
                    </Button>

                    {/* Skip button for optional steps */}
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
                      disabled={
                        loading || (index === 0 && !classData.class_name)
                      }
                    >
                      {index === steps.length - 1 ? "Finish" : "Continue"}
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
